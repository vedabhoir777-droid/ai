import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Upload, History, MessageSquare, FileText, Settings, Brain, Shield, FileCheck, Sparkles, ChevronRight } from 'lucide-react'

const mainNav = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/upload', icon: Upload, label: 'Upload' },
  { to: '/history', icon: FileText, label: 'Documents' },
  { to: '/chat', icon: MessageSquare, label: 'AI Assistant' },
]

const analysisNav = [
  { to: '/risk-analysis', icon: Shield, label: 'Risk Analysis' },
  { to: '/clause-review', icon: FileCheck, label: 'Clause Review' },
]

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="brand-icon"><Brain size={20} /></div>
        <span>LexAI</span>
      </div>

      <div className="sidebar-section">
        <p className="sidebar-section-label">Main</p>
        <nav className="sidebar-nav">
          {mainNav.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="sidebar-section">
        <p className="sidebar-section-label">Analysis</p>
        <nav className="sidebar-nav">
          {analysisNav.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="sidebar-upgrade-card">
        <div className="upgrade-icon"><Sparkles size={18} /></div>
        <h4>Upgrade to Pro</h4>
        <p>Unlock unlimited analyses, contract comparison & reports.</p>
        <button className="upgrade-btn">
          Upgrade <ChevronRight size={14} />
        </button>
      </div>

      <div className="sidebar-footer">
        <NavLink to="/profile" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
          <Settings size={18} />
          <span>Settings</span>
        </NavLink>
      </div>
    </aside>
  )
}
