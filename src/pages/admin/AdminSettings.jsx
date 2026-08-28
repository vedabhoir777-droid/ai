import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { Settings, Shield, User, Mail, Save, CheckCircle } from 'lucide-react'

export default function AdminSettings() {
  const { user, profile } = useAuth()
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="admin-settings">
      <div className="page-header">
        <div>
          <h1><Settings size={24} /> Admin Settings</h1>
          <p>Configure system settings and preferences</p>
        </div>
      </div>

      <div className="settings-grid">
        <div className="settings-card">
          <h3><User size={18} /> Admin Profile</h3>
          <div className="settings-row">
            <span className="setting-label">Name</span>
            <span className="setting-value">{profile?.full_name || 'Admin'}</span>
          </div>
          <div className="settings-row">
            <span className="setting-label">Email</span>
            <span className="setting-value">{user?.email}</span>
          </div>
          <div className="settings-row">
            <span className="setting-label">Role</span>
            <span className="setting-value">
              <span className="role-badge role-super_admin">
                <Shield size={12} /> Super Admin
              </span>
            </span>
          </div>
        </div>

        <div className="settings-card">
          <h3><Shield size={18} /> Security Settings</h3>
          <div className="settings-row">
            <span className="setting-label">Two-Factor Authentication</span>
            <span className="setting-value muted">Not enabled</span>
          </div>
          <div className="settings-row">
            <span className="setting-label">Session Timeout</span>
            <span className="setting-value">24 hours</span>
          </div>
          <div className="settings-row">
            <span className="setting-label">Last Login</span>
            <span className="setting-value">{new Date().toLocaleDateString()}</span>
          </div>
        </div>

        <div className="settings-card">
          <h3><Mail size={18} /> Notification Settings</h3>
          <div className="settings-row">
            <span className="setting-label">New User Registration</span>
            <span className="setting-value">Enabled</span>
          </div>
          <div className="settings-row">
            <span className="setting-label">System Alerts</span>
            <span className="setting-value">Enabled</span>
          </div>
        </div>
      </div>

      {saved && (
        <div className="save-notification">
          <CheckCircle size={16} />
          <span>Settings saved successfully!</span>
        </div>
      )}
    </div>
  )
}