import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000'

export default function Login() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch(`${API}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.message || 'Login failed')
      } else {
        localStorage.setItem('token', data.token)
        // Notify app about auth change so UI updates without full reload
        try { window.dispatchEvent(new Event('authChanged')) } catch (e) {}
        navigate('/')
      }
    } catch (err) {
      setError('Server error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="d-flex justify-content-center">
      <div className="card p-4" style={{ maxWidth: 420, width: '100%' }}>
        <h4 className="mb-3">Sign in</h4>
        {error && <div className="alert alert-danger">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Email</label>
            <input name="email" type="email" value={form.email} onChange={handleChange} className="form-control" required />
          </div>
          <div className="mb-3">
            <label className="form-label">Password</label>
            <input name="password" type="password" value={form.password} onChange={handleChange} className="form-control" required />
          </div>
          <div className="d-grid gap-2">
            <button className="btn btn-primary w-100" disabled={loading}>{loading ? 'Signing in...' : 'Sign in'}</button>
            <Link className="btn btn-link" to="/forgot">Forgot password?</Link>
          </div>
        </form>
      </div>
    </div>
  )
}
