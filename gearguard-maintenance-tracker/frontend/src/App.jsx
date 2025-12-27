import { Routes, Route, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import ForgotPassword from './pages/ForgotPassword'
import Maintenance from './pages/Maintenance'
import Equipment from './pages/Equipment'
import Teams from './pages/Teams'
import MaintenanceCalendar from './pages/MaintenanceCalendar'
import Reports from './pages/Reports'
import TaskActivity from './pages/TaskActivity'
// Legacy pages
import Assets from './pages/Assets'
import Schedule from './pages/Schedule'
import Logs from './pages/Logs'
import History from './pages/History'
import { isAuthenticated, clearToken } from './utils/auth'
import './App.css'
import Layout from './components/Layout'

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
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard/>} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="forgot" element={<ForgotPassword />} />
          
          {/* Main GearGuard Modules */}
          <Route path="maintenance" element={<Maintenance />} />
          <Route path="task-activity/:requestId" element={<TaskActivity />} />
          <Route path="calendar" element={<MaintenanceCalendar />} />
          <Route path="equipment" element={<Equipment />} />
          <Route path="reporting" element={<Reports />} />
          <Route path="teams" element={<Teams />} />
          
          {/* Legacy routes (keep for compatibility) */}
          <Route path="assets" element={<Assets />} />
          <Route path="schedule" element={<Schedule />} />
          <Route path="logs" element={<Logs />} />
          <Route path="history" element={<History />} />
          <Route path="reports" element={<Reports />} />
        </Route>
      </Routes>
    </div>
  )
}

export default App
