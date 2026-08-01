import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { Users, Car, UserCheck, Shield, TrendingUp, Activity, AlertTriangle, CheckCircle } from 'lucide-react'
import Loader from '../../components/Loader'

export default function AdminDashboard() {
  const { user, profile } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState({ total: 0, drivers: 0, customers: 0, admins: 0, active: 0, inactive: 0 })
  const [recentUsers, setRecentUsers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (profile && profile.role !== 'super_admin') {
      navigate('/dashboard')
      return
    }
    loadStats()
  }, [profile])

  const loadStats = async () => {
    setLoading(true)
    
    const { data: allProfiles, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })

    if (!error && allProfiles) {
      const total = allProfiles.length
      const drivers = allProfiles.filter(p => p.role === 'driver').length
      const customers = allProfiles.filter(p => p.role === 'customer').length
      const admins = allProfiles.filter(p => p.role === 'super_admin').length
      const active = allProfiles.filter(p => p.is_active).length
      const inactive = allProfiles.filter(p => !p.is_active).length
      
      setStats({ total, drivers, customers, admins, active, inactive })
      setRecentUsers(allProfiles.slice(0, 5))
    }
    
    setLoading(false)
  }

  if (loading) return <Loader message="Loading admin dashboard..." />

  const statCards = [
    { label: 'Total Users', value: stats.total, icon: Users, color: 'blue' },
    { label: 'Drivers', value: stats.drivers, icon: Car, color: 'teal' },
    { label: 'Customers', value: stats.customers, icon: UserCheck, color: 'green' },
    { label: 'Admins', value: stats.admins, icon: Shield, color: 'purple' },
    { label: 'Active', value: stats.active, icon: CheckCircle, color: 'green' },
    { label: 'Inactive', value: stats.inactive, icon: AlertTriangle, color: 'orange' },
  ]

  return (
    <div className="admin-dashboard">
      <div className="page-header">
        <div>
          <h1>Super Admin Dashboard</h1>
          <p>Manage users, drivers, and customers</p>
        </div>
      </div>

      <div className="admin-stats-grid">
        {statCards.map((s, i) => (
          <div key={i} className={`stat-card-dash stat-${s.color}`}>
            <div className="stat-icon-wrap">
              <s.icon size={22} />
            </div>
            <div className="stat-info">
              <div className="stat-value-dash">{s.value}</div>
              <div className="stat-label-dash">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="admin-section">
        <div className="section-header-row">
          <h2>Recent Users</h2>
          <button className="btn-primary-sm" onClick={() => navigate('/admin/users')}>
            View All Users
          </button>
        </div>

        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Joined</th>
              </tr>
            </thead>
            <tbody>
              {recentUsers.map(u => (
                <tr key={u.id}>
                  <td className="user-name-cell">
                    <div className="mini-avatar">{(u.full_name || u.email || '?')[0].toUpperCase()}</div>
                    <span>{u.full_name || 'N/A'}</span>
                  </td>
                  <td>{u.email}</td>
                  <td>
                    <span className={`role-badge role-${u.role}`}>
                      {u.role === 'super_admin' ? 'Admin' : u.role}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${u.is_active ? 'active' : 'inactive'}`}>
                      {u.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>{new Date(u.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
              {recentUsers.length === 0 && (
                <tr><td colSpan="5" className="empty-table">No users found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}