import { Routes, Route, Link, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import ForgotPassword from './pages/ForgotPassword'
import { isAuthenticated, clearToken } from './utils/auth'
import './App.css'

function App() {
  const navigate = useNavigate()
  const [auth, setAuth] = useState(isAuthenticated())

  useEffect(() => {
    setAuth(isAuthenticated())
  }, [])

  function handleLogout() {
    clearToken()
    setAuth(false)
    navigate('/login')
  }

  return (
    <div>
      <nav className="navbar navbar-light bg-light">
        <div className="container">
          <Link className="navbar-brand" to="/">GearGuard</Link>
          <div>
            {!auth && <Link className="btn btn-outline-primary me-2" to="/login">Login</Link>}
            {!auth && <Link className="btn btn-primary me-2" to="/register">Register</Link>}
            {auth && <button className="btn btn-outline-secondary" onClick={handleLogout}>Logout</button>}
          </div>
        </div>
      </nav>

      <div className="container py-5">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot" element={/* lazy */ <ForgotPassword />} />
        </Routes>
      </div>
    </div>
  )
}

export default App
