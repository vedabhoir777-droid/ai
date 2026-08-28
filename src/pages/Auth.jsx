import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Brain, Mail, Lock, User, AlertCircle, Loader2, Car, Users, Shield } from 'lucide-react'

export default function Auth({ mode }) {
  const { signIn, signUp } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [role, setRole] = useState('customer')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const isSignup = mode === 'signup'

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (isSignup) {
      const { error } = await signUp(email, password, fullName, role)
      if (error) {
        setError(error.message)
        setLoading(false)
      } else {
        navigate('/dashboard')
      }
    } else {
      const { error } = await signIn(email, password)
      if (error) {
        setError(error.message)
        setLoading(false)
      } else {
        navigate('/dashboard')
      }
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-bg-glow" />
      <div className="auth-card">
        <div className="auth-header">
          <div className="brand-icon-lg"><Brain size={28} /></div>
          <h1>{isSignup ? 'Create Your Account' : 'Welcome Back'}</h1>
          <p>{isSignup ? 'Join as a Driver or Customer' : 'Sign in to access your dashboard'}</p>
        </div>

        {error && (
          <div className="auth-error">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          {isSignup && (
            <>
              <div className="role-selector">
                <button
                  type="button"
                  className={`role-option ${role === 'customer' ? 'active' : ''}`}
                  onClick={() => setRole('customer')}
                >
                  <Users size={22} />
                  <span className="role-title">Customer</span>
                  <span className="role-desc">I need transportation services</span>
                </button>
                <button
                  type="button"
                  className={`role-option ${role === 'driver' ? 'active' : ''}`}
                  onClick={() => setRole('driver')}
                >
                  <Car size={22} />
                  <span className="role-title">Driver</span>
                  <span className="role-desc">I provide transportation services</span>
                </button>
              </div>

              <div className="input-group">
                <User size={18} className="input-icon" />
                <input
                  type="text"
                  placeholder="Full Name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>
            </>
          )}
          <div className="input-group">
            <Mail size={18} className="input-icon" />
            <input
              type="email"
              placeholder="Email Address"
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
          <button type="submit" className="btn-primary-lg full" disabled={loading}>
            {loading ? <Loader2 size={18} className="spin" /> : (isSignup ? 'Create Account' : 'Sign In')}
          </button>
        </form>

        <p className="auth-switch">
          {isSignup ? 'Already have an account? ' : "Don't have an account? "}
          <Link to={isSignup ? '/login' : '/signup'}>
            {isSignup ? 'Sign In' : 'Sign Up'}
          </Link>
        </p>

        {!isSignup && (
          <div className="admin-login-hint">
            <Shield size={14} />
            <Link to="/admin/login">Admin Login</Link>
          </div>
        )}
      </div>
    </div>
  )
}