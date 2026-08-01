import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Users, Car, UserCheck, Shield, Settings, Brain, LogOut } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'

const adminNav = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/users', icon: Users, label: 'All Users' },
  { to: '/admin/drivers', icon: Car, label: 'Drivers' },
  { to: '/admin/customers', icon: UserCheck, label: 'Customers' },
  { to: '/admin/settings', icon: Settings, label: 'Settings' },
]

export default function AdminSidebar() {
  const { signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  return (
    <aside className="sidebar admin-sidebar">
      <div className="sidebar-logo">
        <div className="brand-icon admin-brand"><Shield size={20} /></div>
        <span>Admin Panel</span>
      </div>

      <div className="sidebar-section">
        <p className="sidebar-section-label">Management</p>
        <nav className="sidebar-nav">
          {adminNav.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to} end={to === '/admin'} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="sidebar-footer">
        <NavLink to="/dashboard" className="sidebar-link">
          <Brain size={18} />
          <span>Main App</span>
        </NavLink>
        <button className="sidebar-link" onClick={handleSignOut}>
          <LogOut size={18} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  )
}