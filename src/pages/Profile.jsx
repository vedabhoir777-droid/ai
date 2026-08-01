import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { User, Mail, LogOut, Brain, Shield, Bell, CheckCircle } from 'lucide-react'

export default function Profile() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState(true)

  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  return (
    <div className="profile-page">
      <div className="page-header">
        <h1>Profile & Settings</h1>
        <p>Manage your account and preferences</p>
      </div>

      <div className="profile-grid">
        <div className="profile-card">
          <div className="profile-avatar">
            <User size={48} />
          </div>
          <h2>{userName}</h2>
          <p className="profile-email">{user?.email}</p>
          <div className="profile-badge">
            <CheckCircle size={14} />
            <span>Active Account</span>
          </div>
        </div>

        <div className="settings-card">
          <h3><User size={18} /> Account Information</h3>
          <div className="settings-row">
            <span className="setting-label">Full Name</span>
            <span className="setting-value">{userName}</span>
          </div>
          <div className="settings-row">
            <span className="setting-label">Email</span>
            <span className="setting-value">{user?.email}</span>
          </div>
          <div className="settings-row">
            <span className="setting-label">User ID</span>
            <span className="setting-value mono">{user?.id?.slice(0, 8)}...</span>
          </div>
        </div>

        <div className="settings-card">
          <h3><Bell size={18} /> Notifications</h3>
          <div className="settings-row toggle-row">
            <div>
              <span className="setting-label">Email Notifications</span>
              <p className="setting-hint">Get notified when analysis is complete</p>
            </div>
            <button
              className={`toggle ${notifications ? 'on' : ''}`}
              onClick={() => setNotifications(v => !v)}
            >
              <span className="toggle-knob" />
            </button>
          </div>
        </div>

        <div className="settings-card">
          <h3><Shield size={18} /> Security</h3>
          <div className="settings-row">
            <span className="setting-label">Password</span>
            <span className="setting-value">••••••••</span>
          </div>
          <div className="settings-row">
            <span className="setting-label">Two-Factor Auth</span>
            <span className="setting-value muted">Not enabled</span>
          </div>
        </div>

        <div className="settings-card danger-zone">
          <h3><LogOut size={18} /> Account Actions</h3>
          <button className="btn-danger" onClick={handleSignOut}>
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  )
}
