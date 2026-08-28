import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { Users, Search, Filter, Edit2, Trash2, CheckCircle, XCircle, Car, UserCheck, Shield, Loader2 } from 'lucide-react'
import Loader from '../../components/Loader'

export default function AdminUsers() {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const [users, setUsers] = useState([])
  const [filteredUsers, setFilteredUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [editingUser, setEditingUser] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (profile && profile.role !== 'super_admin') {
      navigate('/dashboard')
      return
    }
    loadUsers()
  }, [profile])

  useEffect(() => {
    filterUsers()
  }, [users, search, roleFilter])

  const loadUsers = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })

    if (!error && data) {
      setUsers(data)
    }
    setLoading(false)
  }

  const filterUsers = () => {
    let filtered = [...users]
    
    if (search) {
      const s = search.toLowerCase()
      filtered = filtered.filter(u => 
        (u.full_name || '').toLowerCase().includes(s) ||
        (u.email || '').toLowerCase().includes(s) ||
        (u.phone || '').toLowerCase().includes(s)
      )
    }
    
    if (roleFilter !== 'all') {
      filtered = filtered.filter(u => u.role === roleFilter)
    }
    
    setFilteredUsers(filtered)
  }

  const handleToggleActive = async (userId, currentStatus) => {
    const { error } = await supabase
      .from('profiles')
      .update({ is_active: !currentStatus })
      .eq('id', userId)

    if (!error) {
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, is_active: !currentStatus } : u))
    }
  }

  const handleRoleChange = async (userId, newRole) => {
    setSaving(true)
    const { error } = await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', userId)

    if (!error) {
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u))
    }
    setSaving(false)
    setEditingUser(null)
  }

  const handleDeleteUser = async (userId) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return
    
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId)

    if (!error) {
      setUsers(prev => prev.filter(u => u.id !== userId))
    }
  }

  if (loading) return <Loader message="Loading users..." />

  const getRoleIcon = (role) => {
    switch (role) {
      case 'driver': return <Car size={14} />
      case 'super_admin': return <Shield size={14} />
      default: return <UserCheck size={14} />
    }
  }

  return (
    <div className="admin-users">
      <div className="page-header">
        <div>
          <h1>User Management</h1>
          <p>Manage all drivers, customers, and administrators</p>
        </div>
      </div>

      <div className="admin-filters">
        <div className="admin-search">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="admin-role-filters">
          <button 
            className={`filter-btn ${roleFilter === 'all' ? 'active' : ''}`}
            onClick={() => setRoleFilter('all')}
          >
            All ({users.length})
          </button>
          <button 
            className={`filter-btn ${roleFilter === 'driver' ? 'active' : ''}`}
            onClick={() => setRoleFilter('driver')}
          >
            <Car size={14} /> Drivers ({users.filter(u => u.role === 'driver').length})
          </button>
          <button 
            className={`filter-btn ${roleFilter === 'customer' ? 'active' : ''}`}
            onClick={() => setRoleFilter('customer')}
          >
            <UserCheck size={14} /> Customers ({users.filter(u => u.role === 'customer').length})
          </button>
          <button 
            className={`filter-btn ${roleFilter === 'super_admin' ? 'active' : ''}`}
            onClick={() => setRoleFilter('super_admin')}
          >
            <Shield size={14} /> Admins ({users.filter(u => u.role === 'super_admin').length})
          </button>
        </div>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Role</th>
              <th>Status</th>
              <th>Joined</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(u => (
              <tr key={u.id}>
                <td className="user-name-cell">
                  <div className="mini-avatar">{(u.full_name || u.email || '?')[0].toUpperCase()}</div>
                  <span>{u.full_name || 'N/A'}</span>
                </td>
                <td>{u.email}</td>
                <td>{u.phone || '—'}</td>
                <td>
                  {editingUser === u.id ? (
                    <select 
                      className="role-select"
                      defaultValue={u.role}
                      onChange={(e) => handleRoleChange(u.id, e.target.value)}
                      onBlur={() => setEditingUser(null)}
                      autoFocus
                    >
                      <option value="customer">Customer</option>
                      <option value="driver">Driver</option>
                      <option value="super_admin">Super Admin</option>
                    </select>
                  ) : (
                    <span className={`role-badge role-${u.role}`} onClick={() => setEditingUser(u.id)}>
                      {getRoleIcon(u.role)}
                      {u.role === 'super_admin' ? 'Admin' : u.role}
                    </span>
                  )}
                </td>
                <td>
                  <span className={`status-badge ${u.is_active ? 'active' : 'inactive'}`}>
                    {u.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td>{new Date(u.created_at).toLocaleDateString()}</td>
                <td className="actions-cell">
                  <button 
                    className="action-btn edit"
                    title="Change Role"
                    onClick={() => setEditingUser(u.id)}
                  >
                    <Edit2 size={14} />
                  </button>
                  <button 
                    className={`action-btn ${u.is_active ? 'deactivate' : 'activate'}`}
                    title={u.is_active ? 'Deactivate' : 'Activate'}
                    onClick={() => handleToggleActive(u.id, u.is_active)}
                  >
                    {u.is_active ? <XCircle size={14} /> : <CheckCircle size={14} />}
                  </button>
                  <button 
                    className="action-btn delete"
                    title="Delete User"
                    onClick={() => handleDeleteUser(u.id)}
                  >
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
            {filteredUsers.length === 0 && (
              <tr><td colSpan="7" className="empty-table">No users found matching your criteria</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}