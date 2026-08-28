import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Brain, Bell, User, LogOut, Search, Command, FileCheck, AlertTriangle, ArrowRight } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'

export default function Navbar() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [showMenu, setShowMenu] = useState(false)
  const [showNotif, setShowNotif] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const dropdownRef = useRef(null)

  const isLanding = location.pathname === '/'

  useEffect(() => {
    if (!isLanding) return
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [isLanding])

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'
  const initials = userName.charAt(0).toUpperCase() + (userName.charAt(1) || '').toUpperCase()

  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowMenu(false)
        setShowNotif(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const pageTitle = location.pathname.startsWith('/dashboard') ? 'Dashboard'
    : location.pathname.startsWith('/upload') ? 'Upload Document'
    : location.pathname.startsWith('/history') ? 'Documents'
    : location.pathname.startsWith('/chat') ? 'AI Assistant'
    : location.pathname.startsWith('/analysis') ? 'Document Analysis'
    : location.pathname.startsWith('/risk-analysis') ? 'Risk Analysis'
    : location.pathname.startsWith('/clause-review') ? 'Clause Review'
    : location.pathname.startsWith('/profile') ? 'Settings'
    : 'LexAI'

  // ===== Landing Navbar =====
  if (isLanding) {
    return (
      <nav className={`navbar navbar-landing ${scrolled ? 'scrolled' : ''}`}>
        <div className="navbar-left">
          <Link to="/" className="navbar-brand-landing">
            <div className="brand-icon"><Brain size={20} /></div>
            <span>LexAI</span>
          </Link>
        </div>
        <div className="navbar-center-landing">
          <a href="#features" className="landing-nav-link">Features</a>
          <a href="#how-it-works" className="landing-nav-link">How It Works</a>
          <a href="#stats" className="landing-nav-link">Benefits</a>
          <a href="#cta" className="landing-nav-link">FAQ</a>
        </div>
        <div className="navbar-actions">
          <Link to="/login" className="btn-ghost">Sign In</Link>
          <Link to="/signup" className="btn-primary-sm">
            Get Started
            <ArrowRight size={14} />
          </Link>
        </div>
      </nav>
    )
  }

  // ===== App Navbar =====
  return (
    <nav className="navbar">
      <div className="navbar-left">
        <h2 className="navbar-page-title">{pageTitle}</h2>
      </div>

      {user && (
        <div className="navbar-center">
          <div className="navbar-search">
            <Search size={16} className="search-icon" />
            <input type="text" placeholder="Search documents, clauses, risks..." />
            <kbd className="search-kbd"><Command size={11} /> K</kbd>
          </div>
        </div>
      )}

      {user && (
        <div className="navbar-actions" ref={dropdownRef}>
          <button className="icon-btn" title="Notifications" onClick={() => { setShowNotif(v => !v); setShowMenu(false) }}>
            <Bell size={18} />
            <span className="notif-dot" />
          </button>
          {showNotif && (
            <div className="notif-dropdown">
              <div className="notif-header">
                <h3>Notifications</h3>
                <span className="notif-count">3 new</span>
              </div>
              <div className="notif-item">
                <div className="notif-icon green"><FileCheck size={16} /></div>
                <div>
                  <p>Analysis complete for <b>NDA_v2.pdf</b></p>
                  <span>2 minutes ago</span>
                </div>
              </div>
              <div className="notif-item">
                <div className="notif-icon orange"><AlertTriangle size={16} /></div>
                <div>
                  <p>High risk detected in <b>Service_Agreement.docx</b></p>
                  <span>1 hour ago</span>
                </div>
              </div>
              <div className="notif-item">
                <div className="notif-icon blue"><Brain size={16} /></div>
                <div>
                  <p>New AI insights available</p>
                  <span>3 hours ago</span>
                </div>
              </div>
            </div>
          )}
          <div className="user-menu-wrapper">
            <button className="user-avatar-btn" onClick={() => { setShowMenu(v => !v); setShowNotif(false) }}>
              <div className="avatar">{initials}</div>
              <span className="user-name-short">{userName.split(' ')[0]}</span>
            </button>
            {showMenu && (
              <div className="user-dropdown">
                <div className="dropdown-header">
                  <div className="avatar-lg">{initials}</div>
                  <div>
                    <div className="dropdown-name">{userName}</div>
                    <div className="dropdown-email">{user?.email}</div>
                  </div>
                </div>
                <div className="dropdown-divider" />
                <Link to="/profile" className="dropdown-item" onClick={() => setShowMenu(false)}>
                  <User size={14} /> Profile & Settings
                </Link>
                <button className="dropdown-item danger" onClick={handleSignOut}>
                  <LogOut size={14} /> Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {!user && (
        <div className="navbar-actions">
          <Link to="/login" className="btn-ghost">Sign In</Link>
          <Link to="/signup" className="btn-primary-sm">Get Started</Link>
        </div>
      )}
    </nav>
  )
}
