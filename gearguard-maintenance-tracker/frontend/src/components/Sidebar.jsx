import { NavLink } from 'react-router-dom'

export default function Sidebar(){
  return (
    <nav className="sidebar bg-light p-3">
      <div className="sidebar-brand mb-4">GearGuard</div>
      <ul className="nav flex-column">
        <li className="nav-item"><NavLink className="nav-link" to="/">Dashboard</NavLink></li>
        <li className="nav-item"><NavLink className="nav-link" to="/assets">Assets</NavLink></li>
        <li className="nav-item"><NavLink className="nav-link" to="/schedule">Schedule</NavLink></li>
        <li className="nav-item"><NavLink className="nav-link" to="/logs">Logs</NavLink></li>
        <li className="nav-item"><NavLink className="nav-link" to="/history">History</NavLink></li>
        <li className="nav-item"><NavLink className="nav-link" to="/reports">Reports</NavLink></li>
      </ul>
    </nav>
  )
}
