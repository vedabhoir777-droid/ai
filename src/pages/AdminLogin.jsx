import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Shield, Mail, Lock, AlertCircle, Loader2, Brain } from 'lucide-react'

export default function AdminLogin() {
  const { signIn, profile } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { data, error: signInError } = await signIn(email, password)
    
    if (signInError) {
      setError(signInError.message)
      setLoading(false)
      return
    }

    // Check if user is super_admin after sign in
    setTimeout(async () => {
      const { supabase } = await import('../lib/supabase')
      const { data: profileData } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single()

      if (profileData?.role !== 'super_admin') {
        setError('Access denied. You are not an administrator.')
        await supabase.auth.signOut()
        setLoading(false)
        return
      }

      navigate('/admin')
    }, 500)
  }

  return (
    <div className="auth-page">
      <div className="auth-bg-glow" />
      <div className="auth-card">
        <div className="auth-header">
          <div className="brand-icon-lg admin-icon"><Shield size={28} /></div>
          <h1>Admin Login</h1>
          <p>Super Admin access only</p>
        </div>

        {error && (
          <div className="auth-error">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="input-group">
            <Mail size={18} className="input-icon" />
            <input
              type="email"
              placeholder="Admin Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <Lock size={18} className="input-icon" />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>
          <button type="submit" className="btn-primary-lg full admin-btn" disabled={loading}>
            {loading ? <Loader2 size={18} className="spin" /> : 'Sign In as Admin'}
          </button>
        </form>

        <p className="auth-switch">
          <Link to="/login">← Back to User Login</Link>
        </p>
      </div>
    </div>
  )
}