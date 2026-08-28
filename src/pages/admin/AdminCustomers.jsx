import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { UserCheck, Search, CheckCircle, XCircle, Trash2, Phone, Mail } from 'lucide-react'
import Loader from '../../components/Loader'

export default function AdminCustomers() {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const [customers, setCustomers] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (profile && profile.role !== 'super_admin') {
      navigate('/dashboard')
      return
    }
    loadCustomers()
  }, [profile])

  const loadCustomers = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'customer')
      .order('created_at', { ascending: false })

    if (!error && data) {
      setCustomers(data)
    }
    setLoading(false)
  }

  const handleToggleActive = async (userId, currentStatus) => {
    const { error } = await supabase
      .from('profiles')
      .update({ is_active: !currentStatus })
      .eq('id', userId)

    if (!error) {
      setCustomers(prev => prev.map(u => u.id === userId ? { ...u, is_active: !currentStatus } : u))
    }
  }

  const handleDelete = async (userId) => {
    if (!confirm('Are you sure you want to remove this customer?')) return
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId)

    if (!error) {
      setCustomers(prev => prev.filter(u => u.id !== userId))
    }
  }

  const filtered = customers.filter(c => {
    if (!search) return true
    const s = search.toLowerCase()
    return (c.full_name || '').toLowerCase().includes(s) ||
           (c.email || '').toLowerCase().includes(s) ||
           (c.phone || '').toLowerCase().includes(s)
  })

  if (loading) return <Loader message="Loading customers..." />

  return (
    <div className="admin-users">
      <div className="page-header">
        <div>
          <h1><UserCheck size={24} /> Customer Management</h1>
          <p>{customers.length} registered customers</p>
        </div>
      </div>

      <div className="admin-filters">
        <div className="admin-search">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search customers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="user-cards-grid">
        {filtered.map(customer => (
          <div key={customer.id} className="user-card">
            <div className="user-card-header">
              <div className="user-card-avatar">
                {(customer.full_name || customer.email || '?')[0].toUpperCase()}
              </div>
              <div className="user-card-info">
                <h3>{customer.full_name || 'N/A'}</h3>
                <span className={`status-badge ${customer.is_active ? 'active' : 'inactive'}`}>
                  {customer.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
            <div className="user-card-details">
              <div className="detail-row">
                <Mail size={14} />
                <span>{customer.email}</span>
              </div>
              <div className="detail-row">
                <Phone size={14} />
                <span>{customer.phone || 'Not provided'}</span>
              </div>
            </div>
            <div className="user-card-actions">
              <button 
                className={`card-action-btn ${customer.is_active ? 'deactivate' : 'activate'}`}
                onClick={() => handleToggleActive(customer.id, customer.is_active)}
              >
                {customer.is_active ? <><XCircle size={14} /> Deactivate</> : <><CheckCircle size={14} /> Activate</>}
              </button>
              <button 
                className="card-action-btn delete"
                onClick={() => handleDelete(customer.id)}
              >
                <Trash2 size={14} /> Remove
              </button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="empty-state">
            <UserCheck size={40} />
            <h3>No customers found</h3>
            <p>No customers match your search criteria.</p>
          </div>
        )}
      </div>
    </div>
  )
}