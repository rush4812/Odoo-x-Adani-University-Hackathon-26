import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { isAuthenticated } from '../utils/auth'

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000'

export default function Reports() {
  const navigate = useNavigate()
  const [activeReport, setActiveReport] = useState('equipment-history')
  const [reportData, setReportData] = useState([])
  const [loading, setLoading] = useState(false)
  const [summary, setSummary] = useState({})

  useEffect(() => {
    if (!isAuthenticated()) navigate('/login')
    loadReport(activeReport)
  }, [activeReport])

  async function loadReport(reportType) {
    setLoading(true)
    try {
      const res = await fetch(`${API}/api/reports/${reportType}`)
      const data = await res.json()
      setReportData(data)
      
      if (reportType === 'maintenance-ratio') {
        setSummary(data)
      }
    } catch (err) {
      console.error('Load report error:', err)
    }
    setLoading(false)
  }

  const reports = [
    { id: 'equipment-history', name: 'Equipment History', icon: '📊' },
    { id: 'maintenance-costs', name: 'Maintenance Costs', icon: '💰' },
    { id: 'technician-performance', name: 'Technician Performance', icon: '👨‍🔧' },
    { id: 'downtime-analysis', name: 'Downtime Analysis', icon: '⏱️' },
    { id: 'maintenance-ratio', name: 'Preventive vs Corrective', icon: '📈' }
  ]

  function renderReportContent() {
    if (loading) return <div className="text-center p-4">Loading report...</div>

    switch (activeReport) {
      case 'equipment-history':
        return (
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>Equipment</th>
                  <th>Category</th>
                  <th>Department</th>
                  <th>Total Requests</th>
                  <th>Preventive</th>
                  <th>Corrective</th>
                  <th>Completed</th>
                  <th>Avg Repair Time</th>
                  <th>Avg Rating</th>
                </tr>
              </thead>
              <tbody>
                {reportData.map((item, index) => (
                  <tr key={index}>
                    <td>{item.equipment_name}</td>
                    <td>{item.category}</td>
                    <td>{item.department}</td>
                    <td><span className="badge bg-primary">{item.total_requests}</span></td>
                    <td><span className="badge bg-info">{item.preventive_count}</span></td>
                    <td><span className="badge bg-warning">{item.corrective_count}</span></td>
                    <td><span className="badge bg-success">{item.completed_count}</span></td>
                    <td>{item.avg_repair_time ? `${Math.round(item.avg_repair_time)} min` : '-'}</td>
                    <td>
                      {item.avg_rating ? (
                        <div>
                          {'★'.repeat(Math.round(item.avg_rating))}
                          <small className="text-muted">({item.avg_rating.toFixed(1)})</small>
                        </div>
                      ) : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )

      case 'maintenance-costs':
        return (
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>Equipment</th>
                  <th>Category</th>
                  <th>Maintenance Count</th>
                  <th>Total Cost</th>
                  <th>Average Cost</th>
                  <th>Max Cost</th>
                </tr>
              </thead>
              <tbody>
                {reportData.map((item, index) => (
                  <tr key={index}>
                    <td>{item.equipment_name}</td>
                    <td>{item.category}</td>
                    <td><span className="badge bg-primary">{item.maintenance_count}</span></td>
                    <td><strong>${item.total_cost?.toFixed(2) || '0.00'}</strong></td>
                    <td>${item.avg_cost?.toFixed(2) || '0.00'}</td>
                    <td>${item.max_cost?.toFixed(2) || '0.00'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )

      case 'technician-performance':
        return (
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>Technician</th>
                  <th>Team</th>
                  <th>Total Assignments</th>
                  <th>Completed Tasks</th>
                  <th>Completion Rate</th>
                  <th>Avg Time</th>
                  <th>Avg Rating</th>
                  <th>Overdue Tasks</th>
                </tr>
              </thead>
              <tbody>
                {reportData.map((item, index) => {
                  const completionRate = item.total_assignments > 0 ? 
                    (item.completed_tasks / item.total_assignments * 100).toFixed(1) : 0
                  return (
                    <tr key={index}>
                      <td>{item.technician_name}</td>
                      <td>{item.team_name}</td>
                      <td><span className="badge bg-primary">{item.total_assignments}</span></td>
                      <td><span className="badge bg-success">{item.completed_tasks}</span></td>
                      <td>
                        <div className="progress" style={{ height: '20px' }}>
                          <div className="progress-bar" style={{ width: `${completionRate}%` }}>
                            {completionRate}%
                          </div>
                        </div>
                      </td>
                      <td>{item.avg_completion_time ? `${Math.round(item.avg_completion_time)} min` : '-'}</td>
                      <td>
                        {item.avg_rating ? (
                          <div>
                            {'★'.repeat(Math.round(item.avg_rating))}
                            <small className="text-muted">({item.avg_rating.toFixed(1)})</small>
                          </div>
                        ) : '-'}
                      </td>
                      <td>
                        {item.overdue_tasks > 0 ? (
                          <span className="badge bg-danger">{item.overdue_tasks}</span>
                        ) : (
                          <span className="badge bg-success">0</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )

      case 'downtime-analysis':
        return (
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>Equipment</th>
                  <th>Category</th>
                  <th>Department</th>
                  <th>Breakdown Count</th>
                  <th>Total Downtime</th>
                  <th>Avg Downtime</th>
                  <th>Impact Level</th>
                </tr>
              </thead>
              <tbody>
                {reportData.map((item, index) => {
                  const totalHours = item.total_downtime_minutes ? (item.total_downtime_minutes / 60).toFixed(1) : 0
                  const avgHours = item.avg_downtime_minutes ? (item.avg_downtime_minutes / 60).toFixed(1) : 0
                  const impactLevel = item.total_downtime_minutes > 480 ? 'High' : 
                                    item.total_downtime_minutes > 120 ? 'Medium' : 'Low'
                  return (
                    <tr key={index}>
                      <td>{item.equipment_name}</td>
                      <td>{item.category}</td>
                      <td>{item.department}</td>
                      <td><span className="badge bg-warning">{item.breakdown_count}</span></td>
                      <td>{totalHours}h</td>
                      <td>{avgHours}h</td>
                      <td>
                        <span className={`badge ${
                          impactLevel === 'High' ? 'bg-danger' : 
                          impactLevel === 'Medium' ? 'bg-warning' : 'bg-success'
                        }`}>
                          {impactLevel}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )

      case 'maintenance-ratio':
        return (
          <div className="row">
            <div className="col-md-6">
              <div className="card">
                <div className="card-body text-center">
                  <h5>Maintenance Distribution</h5>
                  <div className="row">
                    <div className="col-6">
                      <div className="card bg-info text-white">
                        <div className="card-body">
                          <h3>{summary.preventive_count || 0}</h3>
                          <p>Preventive</p>
                          <small>{summary.preventive_percentage || 0}%</small>
                        </div>
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="card bg-warning text-white">
                        <div className="card-body">
                          <h3>{summary.corrective_count || 0}</h3>
                          <p>Corrective</p>
                          <small>{summary.corrective_percentage || 0}%</small>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="card">
                <div className="card-body">
                  <h5>Recommendations</h5>
                  <div className="alert alert-info">
                    <strong>Optimal Ratio:</strong> 70% Preventive, 30% Corrective
                  </div>
                  {summary.preventive_percentage < 60 && (
                    <div className="alert alert-warning">
                      <strong>Action Required:</strong> Increase preventive maintenance to reduce breakdowns.
                    </div>
                  )}
                  {summary.preventive_percentage >= 70 && (
                    <div className="alert alert-success">
                      <strong>Good Performance:</strong> Maintenance strategy is well balanced.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )

      default:
        return <div>Select a report to view</div>
    }
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3>Maintenance Reports & Analytics</h3>
        <button className="btn btn-outline-primary" onClick={() => loadReport(activeReport)}>
          Refresh Data
        </button>
      </div>

      {/* Report Navigation */}
      <div className="row mb-4">
        {reports.map(report => (
          <div key={report.id} className="col-md-2 col-sm-4 mb-2">
            <div 
              className={`card h-100 ${activeReport === report.id ? 'border-primary bg-light' : ''}`}
              style={{ cursor: 'pointer' }}
              onClick={() => setActiveReport(report.id)}
            >
              <div className="card-body text-center p-2">
                <div style={{ fontSize: '2rem' }}>{report.icon}</div>
                <small className="fw-bold">{report.name}</small>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Report Content */}
      <div className="card">
        <div className="card-header">
          <h5 className="mb-0">
            {reports.find(r => r.id === activeReport)?.name || 'Report'}
          </h5>
        </div>
        <div className="card-body">
          {renderReportContent()}
        </div>
      </div>
    </div>
  )
}
