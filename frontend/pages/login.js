import { useState } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const router = useRouter()
  const { login } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    email: ''
  })

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (!formData.email) {
        throw new Error('Email is required')
      }

      login(formData.email)
      router.push('/dashboard')
    } catch (err) {
      setError(err.message)
      setLoading(false)
    }
  }

  return (
    <div className="auth-wrapper">
      <div className="auth-features">
        <h2>🏗️ MjengoSite</h2>
        <p className="tagline">Worker Safety & Attendance Tracking</p>
        
        <div className="features-list">
          <div className="feature-item">
            <span className="feature-icon">📱</span>
            <h4>USSD Check-ins</h4>
            <p>Works on any phone, no internet needed</p>
          </div>
          
          <div className="feature-item">
            <span className="feature-icon">🚨</span>
            <h4>Incident Alerts</h4>
            <p>Instant notifications for safety issues</p>
          </div>
          
          <div className="feature-item">
            <span className="feature-icon">💰</span>
            <h4>Smart Payments</h4>
            <p>Pay workers based on verified hours</p>
          </div>
          
          <div className="feature-item">
            <span className="feature-icon">✅</span>
            <h4>Real-time Tracking</h4>
            <p>Live dashboard of all site activities</p>
          </div>
        </div>
      </div>

      <div className="auth-container-right">
        <div className="auth-card">
          <div className="auth-header">
            <h1>🏗️ MjengoSite</h1>
            <h2>Welcome Back</h2>
            <p>Manage your sites with ease</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            {error && <div className="error-message">{error}</div>}

            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                name="email"
                placeholder="your@email.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="btn-primary-auth"
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>

            <div className="auth-footer">
              <p>Don't have an account? <a href="/register">Create one</a></p>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}