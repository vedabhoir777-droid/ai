import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { Car, Search, CheckCircle, XCircle, Trash2, Phone, Mail } from 'lucide-react'
import Loader from '../../components/Loader'

export default function AdminDrivers() {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const [drivers, setDrivers] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (profile && profile.role !== 'super_admin') {
      navigate('/dashboard')
      return
    }
    loadDrivers()
  }, [profile])

  const loadDrivers = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'driver')
      .order('created_at', { ascending: false })

    if (!error && data) {
      setDrivers(data)
    }
    setLoading(false)
  }

  const handleToggleActive = async (userId, currentStatus) => {
    const { error } = await supabase
      .from('profiles')
      .update({ is_active: !currentStatus })
      .eq('id', userId)

    if (!error) {
      setDrivers(prev => prev.map(u => u.id === userId ? { ...u, is_active: !currentStatus } : u))
    }
  }

  const handleDelete = async (userId) => {
    if (!confirm('Are you sure you want to remove this driver?')) return
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId)

    if (!error) {
      setDrivers(prev => prev.filter(u => u.id !== userId))
    }
  }

  const filtered = drivers.filter(d => {
    if (!search) return true
    const s = search.toLowerCase()
    return (d.full_name || '').toLowerCase().includes(s) ||
           (d.email || '').toLowerCase().includes(s) ||
           (d.phone || '').toLowerCase().includes(s)
  })

  if (loading) return <Loader message="Loading drivers..." />

  return (
    <div className="admin-users">
      <div className="page-header">
        <div>
          <h1><Car size={24} /> Driver Management</h1>
          <p>{drivers.length} registered drivers</p>
        </div>
      </div>

      <div className="admin-filters">
        <div className="admin-search">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search drivers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="user-cards-grid">
        {filtered.map(driver => (
          <div key={driver.id} className="user-card">
            <div className="user-card-header">
              <div className="user-card-avatar">
                {(driver.full_name || driver.email || '?')[0].toUpperCase()}
              </div>
              <div className="user-card-info">
                <h3>{driver.full_name || 'N/A'}</h3>
                <span className={`status-badge ${driver.is_active ? 'active' : 'inactive'}`}>
                  {driver.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
            <div className="user-card-details">
              <div className="detail-row">
                <Mail size={14} />
                <span>{driver.email}</span>
              </div>
              <div className="detail-row">
                <Phone size={14} />
                <span>{driver.phone || 'Not provided'}</span>
              </div>
            </div>
            <div className="user-card-actions">
              <button 
                className={`card-action-btn ${driver.is_active ? 'deactivate' : 'activate'}`}
                onClick={() => handleToggleActive(driver.id, driver.is_active)}
              >
                {driver.is_active ? <><XCircle size={14} /> Deactivate</> : <><CheckCircle size={14} /> Activate</>}
              </button>
              <button 
                className="card-action-btn delete"
                onClick={() => handleDelete(driver.id)}
              >
                <Trash2 size={14} /> Remove
              </button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="empty-state">
            <Car size={40} />
            <h3>No drivers found</h3>
            <p>No drivers match your search criteria.</p>
          </div>
        )}
      </div>
    </div>
  )
}