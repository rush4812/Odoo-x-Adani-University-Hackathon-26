import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { isAuthenticated } from '../utils/auth'
const API = import.meta.env.VITE_API_URL || 'http://localhost:5000'

export default function Dashboard(){
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  
  useEffect(() => {
    if (!isAuthenticated()) navigate('/login')
    fetch(`${API}/api/reports/dashboard-summary`)
      .then(r=>r.json())
      .then(setData)
      .catch(err=>console.error('Dashboard fetch', err))
  }, [])

  if (!data) return <div>Loading dashboard...</div>

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className="mb-0">GearGuard Dashboard</h3>
        <small className="text-muted">Last updated: {new Date().toLocaleString()}</small>
      </div>

      {/* Key Metrics */}
      <div className="row dashboard-cards mb-4">
        <div className="col-md-3">
          <div className="card p-3 total">
            <h6 className="text-muted">Total Equipment</h6>
            <h2 className="mb-0">{data.totalEquipment}</h2>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card p-3 due">
            <h6 className="text-muted">Open Requests</h6>
            <h2 className="mb-0">{data.openRequests}</h2>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card p-3 overdue">
            <h6 className="text-muted">Overdue Tasks</h6>
            <h2 className="mb-0">{data.overdueTasks}</h2>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card p-3 completed">
            <h6 className="text-muted">Completed Tasks</h6>
            <h2 className="mb-0">{data.completedTasks}</h2>
          </div>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="card p-3">
        <h5>Recent Activities</h5>
        <div className="table-responsive">
          <table className="table table-hover recent-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Subject</th>
                <th>Equipment</th>
                <th>Stage</th>
                <th>Technician</th>
              </tr>
            </thead>
            <tbody>
              {data.recentActivities?.map(activity => (
                <tr key={activity.id || Math.random()}>
                  <td>{new Date(activity.created_at).toLocaleDateString()}</td>
                  <td>{activity.subject}</td>
                  <td>{activity.equipment_name}</td>
                  <td>
                    <span className={`badge ${
                      activity.stage === 'New' ? 'bg-secondary' :
                      activity.stage === 'In Progress' ? 'bg-primary' :
                      activity.stage === 'Repaired' ? 'bg-success' : 'bg-danger'
                    }`}>
                      {activity.stage}
                    </span>
                  </td>
                  <td>{activity.technician_name || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
