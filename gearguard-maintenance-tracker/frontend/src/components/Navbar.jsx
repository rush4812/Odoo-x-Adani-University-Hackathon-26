import { NavLink, Link, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { isAuthenticated, clearToken } from '../utils/auth'

export default function Navbar(){
  const linkClass = ({isActive}) => isActive ? 'nav-link active' : 'nav-link'
  const navigate = useNavigate()
  const [auth, setAuth] = useState(isAuthenticated())

  useEffect(() => {
    const updateAuth = () => setAuth(isAuthenticated())
    updateAuth()
    window.addEventListener('authChanged', updateAuth)
    return () => window.removeEventListener('authChanged', updateAuth)
  }, [])

  function handleLogout(){
    clearToken()
    setAuth(false)
    try { window.dispatchEvent(new Event('authChanged')) } catch (e) {}
    navigate('/login')
  }

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm" style={{borderBottom: '1px solid #e9ecef'}}>
      <div className="container-fluid">
        <Link className="navbar-brand fw-bold text-primary" to="/">GearGuard</Link>

        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#topNav">
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="topNav">
          <ul className="nav nav-pills me-auto mb-2 mb-lg-0">
            {auth && (
              <>
                {/* <li className="nav-item"><NavLink to="/maintenance" className={linkClass}>Maintenance</NavLink></li> */}
                <li className="nav-item"><NavLink to="/" end className={linkClass}>Dashboard</NavLink></li>
                <li className="nav-item"><NavLink to="/calendar" className={linkClass}>Maintenance Calendar</NavLink></li>
                <li className="nav-item"><NavLink to="/equipment" className={linkClass}>Equipment</NavLink></li>
                <li className="nav-item"><NavLink to="/reporting" className={linkClass}>Reporting</NavLink></li>
                <li className="nav-item"><NavLink to="/teams" className={linkClass}>Teams</NavLink></li>
              </>
            )}
          </ul>

          <div className="d-flex align-items-center">
            {!auth && <Link className="btn btn-outline-primary me-2" to="/login">Login</Link>}
            {!auth && <Link className="btn btn-primary me-2" to="/register">Register</Link>}
            {auth && <button className="btn btn-outline-secondary" onClick={handleLogout}>Logout</button>}
          </div>
        </div>
      </div>
    </nav>
  )
}
