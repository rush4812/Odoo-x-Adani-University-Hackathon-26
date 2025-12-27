import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000'

export default function Register() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', rePassword: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  function validatePassword(password) {
    const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/
    return re.test(password)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (form.password !== form.rePassword) return setError('Passwords do not match')
    if (!validatePassword(form.password)) return setError('Password must be at least 8 characters and include uppercase, lowercase, number, and special character')
    setLoading(true)
    try {
      const res = await fetch(`${API}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.message || 'Registration failed')
      } else {
        // save token and redirect
        localStorage.setItem('token', data.token)
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
        <h4 className="mb-3">Create account</h4>
        {error && <div className="alert alert-danger">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Name</label>
            <input name="name" value={form.name} onChange={handleChange} className="form-control" required />
          </div>
          <div className="mb-3">
            <label className="form-label">Email</label>
            <input name="email" type="email" value={form.email} onChange={handleChange} className="form-control" required />
          </div>
          <div className="mb-3">
            <label className="form-label">Password</label>
            <input name="password" type="password" value={form.password} onChange={handleChange} className="form-control" required />
          </div>
          <div className="mb-3">
            <label className="form-label">Re-enter Password</label>
            <input name="rePassword" type="password" value={form.rePassword} onChange={handleChange} className="form-control" required />
          </div>
          <button className="btn btn-primary w-100" disabled={loading}>{loading ? 'Creating...' : 'Create account'}</button>
        </form>
      </div>
    </div>
  )
}
