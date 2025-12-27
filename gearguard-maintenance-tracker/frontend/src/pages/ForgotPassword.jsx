import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000'

export default function ForgotPassword(){
  const navigate = useNavigate()
  const [step, setStep] = useState(1) // 1: enter email, 2: verify otp, 3: set new password
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [password, setPassword] = useState('')
  const [rePassword, setRePassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')

  function validatePassword(p){
    const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/
    return re.test(p)
  }

  async function requestOTP(e){
    e.preventDefault()
    setError('')
    setInfo('')
    setLoading(true)
    try{
      const res = await fetch(`${API}/api/auth/forgot`, {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ email })
      })
      const data = await res.json()
      if (!res.ok) setError(data.message || 'Failed to send OTP')
      else { setInfo('OTP sent to email'); setStep(2) }
    }catch(err){ setError('Server error') }
    setLoading(false)
  }

  async function verifyOtp(e){
    e.preventDefault(); setError(''); setLoading(true)
    try{
      const res = await fetch(`${API}/api/auth/verify-otp`, {
        method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ email, otp })
      })
      const data = await res.json()
      if (!res.ok) setError(data.message || 'OTP verification failed')
      else { setInfo('OTP verified — set new password'); setStep(3) }
    }catch(err){ setError('Server error') }
    setLoading(false)
  }

  async function resetPassword(e){
    e.preventDefault(); setError(''); setLoading(true)
    if (password !== rePassword) { setError('Passwords do not match'); setLoading(false); return }
    if (!validatePassword(password)) { setError('Password must be 8+ chars and include uppercase, lowercase, number, special char'); setLoading(false); return }
    try{
      const res = await fetch(`${API}/api/auth/reset-password`, {
        method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ email, otp, password, rePassword })
      })
      const data = await res.json()
      if (!res.ok) setError(data.message || 'Password reset failed')
      else { setInfo('Password updated — please login'); navigate('/login') }
    }catch(err){ setError('Server error') }
    setLoading(false)
  }

  return (
    <div className="d-flex justify-content-center">
      <div className="card p-4" style={{ maxWidth: 420, width: '100%' }}>
        <h4 className="mb-3">Forgot password</h4>
        {error && <div className="alert alert-danger">{error}</div>}
        {info && <div className="alert alert-success">{info}</div>}

        {step === 1 && (
          <form onSubmit={requestOTP}>
            <div className="mb-3">
              <label className="form-label">Email</label>
              <input className="form-control" type="email" value={email} onChange={e=>setEmail(e.target.value)} required />
            </div>
            <button className="btn btn-primary w-100" disabled={loading}>{loading ? 'Sending...' : 'Send OTP'}</button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={verifyOtp}>
            <div className="mb-3">
              <label className="form-label">Enter OTP</label>
              <input className="form-control" value={otp} onChange={e=>setOtp(e.target.value)} required />
            </div>
            <button className="btn btn-primary w-100" disabled={loading}>{loading ? 'Verifying...' : 'Verify OTP'}</button>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={resetPassword}>
            <div className="mb-3">
              <label className="form-label">New password</label>
              <input className="form-control" type="password" value={password} onChange={e=>setPassword(e.target.value)} required />
            </div>
            <div className="mb-3">
              <label className="form-label">Re-enter password</label>
              <input className="form-control" type="password" value={rePassword} onChange={e=>setRePassword(e.target.value)} required />
            </div>
            <button className="btn btn-primary w-100" disabled={loading}>{loading ? 'Updating...' : 'Update password'}</button>
          </form>
        )}
      </div>
    </div>
  )
}
