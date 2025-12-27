import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { isAuthenticated } from '../utils/auth'

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000'

export default function MaintenanceCalendar() {
  const navigate = useNavigate()
  const [preventiveRequests, setPreventiveRequests] = useState([])
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(null)
  const [equipment, setEquipment] = useState([])
  const [technicians, setTechnicians] = useState([])
  const [showScheduleForm, setShowScheduleForm] = useState(false)
  const [form, setForm] = useState({
    subject: '', equipment_id: '', assigned_technician_id: '', scheduled_date: '', priority: 'Medium'
  })

  useEffect(() => {
    if (!isAuthenticated()) navigate('/login')
    loadData()
  }, [])

  async function loadData() {
    try {
      const [requestsRes, equipmentRes, teamsRes] = await Promise.all([
        fetch(`${API}/api/maintenance-requests/preventive`),
        fetch(`${API}/api/equipment`),
        fetch(`${API}/api/teams`)
      ])
      
      let requestsData = []
      let equipmentData = []
      let teamsData = []

      if (requestsRes.ok) {
        requestsData = await requestsRes.json()
      }
      if (equipmentRes.ok) {
        equipmentData = await equipmentRes.json()
      }
      if (teamsRes.ok) {
        teamsData = await teamsRes.json()
      }

      setPreventiveRequests(Array.isArray(requestsData) ? requestsData : [])
      setEquipment(Array.isArray(equipmentData) ? equipmentData : [])
      
      const allTechnicians = []
      if (Array.isArray(teamsData)) {
        for (const team of teamsData) {
          try {
            const membersRes = await fetch(`${API}/api/teams/${team.id}/members`)
            if (membersRes.ok) {
              const members = await membersRes.json()
              if (Array.isArray(members)) {
                allTechnicians.push(...members.map(m => ({ ...m, team_name: team.name })))
              }
            }
          } catch (err) {
            console.error('Members fetch error for team', team.id, err)
          }
        }
      }
      setTechnicians(allTechnicians)
    } catch (err) {
      console.error('Load error:', err)
    }
  }

  async function schedulePreventive(e) {
    e.preventDefault()
    try {
      await fetch(`${API}/api/maintenance-requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          request_type: 'Preventive',
          created_by: 'Current User'
        })
      })
      setForm({ subject: '', equipment_id: '', assigned_technician_id: '', scheduled_date: '', priority: 'Medium' })
      setShowScheduleForm(false)
      setSelectedDate(null)
      loadData()
    } catch (err) {
      console.error('Schedule error:', err)
    }
  }

  function getDaysInMonth(date) {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  function getFirstDayOfMonth(date) {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  function getRequestsForDate(date) {
    const dateStr = date.toISOString().split('T')[0]
    return preventiveRequests.filter(req => req.scheduled_date === dateStr)
  }

  function handleDateClick(day) {
    const clickedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
    setSelectedDate(clickedDate)
    setForm({...form, scheduled_date: clickedDate.toISOString().split('T')[0]})
    setShowScheduleForm(true)
  }

  function navigateMonth(direction) {
    const newDate = new Date(currentDate)
    newDate.setMonth(newDate.getMonth() + direction)
    setCurrentDate(newDate)
  }

  const daysInMonth = getDaysInMonth(currentDate)
  const firstDay = getFirstDayOfMonth(currentDate)
  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"]
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
  const pendingTasks = preventiveRequests.filter(req => req.stage === 'New').length

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3>Maintenance Calendar</h3>
        <div className="d-flex align-items-center gap-3">
          <span className="badge bg-warning">Pending: {pendingTasks}</span>
          <button className="btn btn-primary" onClick={() => setShowScheduleForm(true)}>
            Schedule Maintenance
          </button>
        </div>
      </div>

      {/* Calendar Navigation */}
      <div className="card mb-4">
        <div className="card-header d-flex justify-content-between align-items-center">
          <button className="btn btn-outline-secondary" onClick={() => navigateMonth(-1)}>
            ← Previous
          </button>
          <h5 className="mb-0">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h5>
          <button className="btn btn-outline-secondary" onClick={() => navigateMonth(1)}>
            Next →
          </button>
        </div>
        
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-bordered mb-0">
              <thead>
                <tr>
                  {dayNames.map(day => (
                    <th key={day} className="text-center p-2">{day}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: Math.ceil((daysInMonth + firstDay) / 7) }, (_, week) => (
                  <tr key={week}>
                    {Array.from({ length: 7 }, (_, day) => {
                      const dayNumber = week * 7 + day - firstDay + 1
                      const isValidDay = dayNumber > 0 && dayNumber <= daysInMonth
                      const cellDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), dayNumber)
                      const dayRequests = isValidDay ? getRequestsForDate(cellDate) : []
                      const isToday = isValidDay && cellDate.toDateString() === new Date().toDateString()
                      
                      return (
                        <td key={day} className="p-1" style={{ height: '120px', verticalAlign: 'top' }}>
                          {isValidDay && (
                            <div>
                              <div className={`d-flex justify-content-between align-items-center mb-1 ${isToday ? 'bg-primary text-white rounded p-1' : ''}`}>
                                <span className="fw-bold">{dayNumber}</span>
                                {dayRequests.length > 0 && (
                                  <span className="badge bg-info">{dayRequests.length}</span>
                                )}
                              </div>
                              <div style={{ cursor: 'pointer' }} onClick={() => handleDateClick(dayNumber)}>
                                {dayRequests.map(req => (
                                  <div key={req.id} className="small mb-1">
                                    <div className={`badge ${req.stage === 'New' ? 'bg-warning' : 
                                                           req.stage === 'In Progress' ? 'bg-primary' :
                                                           req.stage === 'Repaired' ? 'bg-success' : 'bg-danger'} w-100 text-start`}>
                                      {req.equipment_name}
                                    </div>
                                  </div>
                                ))}
                                {isValidDay && (
                                  <div className="text-center mt-1">
                                    <small className="text-muted">Click to schedule</small>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Next 12 Upcoming Scheduled Tasks */}
      <div className="card">
        <div className="card-header">
          <h5>Next 12 Upcoming Scheduled Tasks</h5>
          <small className="text-muted">Timeline format for easy planning and resource allocation</small>
        </div>
        <div className="card-body">
          {preventiveRequests.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-muted">No scheduled maintenance tasks found.</p>
              <button className="btn btn-primary" onClick={() => setShowScheduleForm(true)}>
                Schedule First Task
              </button>
            </div>
          ) : (
            <div className="timeline-container">
              {preventiveRequests
                .filter(req => new Date(req.scheduled_date) >= new Date())
                .sort((a, b) => new Date(a.scheduled_date) - new Date(b.scheduled_date))
                .slice(0, 12)
                .map((req) => {
                  const scheduleDate = new Date(req.scheduled_date)
                  const daysUntil = Math.ceil((scheduleDate - new Date()) / (1000 * 60 * 60 * 24))
                  
                  return (
                    <div key={req.id} className="timeline-item mb-3 p-3 border rounded border-light">
                      <div className="row align-items-center">
                        <div className="col-md-2">
                          <div className="text-center">
                            <div className={`badge ${daysUntil <= 3 ? 'bg-warning' : 'bg-info'} mb-1`}>
                              {daysUntil === 0 ? 'Today' : daysUntil === 1 ? 'Tomorrow' : `${daysUntil} days`}
                            </div>
                            <div className="small text-muted">
                              {scheduleDate.toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <div className="col-md-3">
                          <h6 className="mb-1">{req.equipment_name}</h6>
                          <small className="text-muted">{req.subject}</small>
                        </div>
                        <div className="col-md-2">
                          <span className={`badge ${
                            req.priority === 'High' ? 'bg-danger' :
                            req.priority === 'Medium' ? 'bg-warning' : 'bg-info'
                          }`}>
                            {req.priority}
                          </span>
                        </div>
                        <div className="col-md-3">
                          <small className="text-muted d-block">Assigned to:</small>
                          <span>{req.assigned_technician_name || 'Unassigned'}</span>
                        </div>
                        <div className="col-md-2">
                          <span className={`badge ${
                            req.stage === 'New' ? 'bg-warning' :
                            req.stage === 'In Progress' ? 'bg-primary' :
                            req.stage === 'Repaired' ? 'bg-success' : 'bg-danger'
                          }`}>
                            {req.stage}
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                })
              }
            </div>
          )}
        </div>
      </div>

      {/* Work Order Creation Form */}
      {showScheduleForm && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Create Work Order - Preventive Maintenance</h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => {
                    setShowScheduleForm(false)
                    setSelectedDate(null)
                  }}
                ></button>
              </div>
              <form onSubmit={schedulePreventive}>
                <div className="modal-body">
                  <div className="alert alert-info">
                    <small><strong>Work Order:</strong> System will auto-generate unique Work Order Code upon creation</small>
                  </div>
                  
                  <div className="mb-3">
                    <label className="form-label">Task Title & Description</label>
                    <input
                      type="text"
                      className="form-control"
                      value={form.subject}
                      onChange={(e) => setForm({...form, subject: e.target.value})}
                      placeholder="e.g., Monthly AC Filter Replacement"
                      required
                    />
                  </div>
                  
                  <div className="mb-3">
                    <label className="form-label">Affected Equipment</label>
                    <select
                      className="form-select"
                      value={form.equipment_id}
                      onChange={(e) => setForm({...form, equipment_id: e.target.value})}
                      required
                    >
                      <option value="">Select Equipment</option>
                      {equipment.map(eq => (
                        <option key={eq.id} value={eq.id}>{eq.name}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="row">
                    <div className="col-md-6">
                      <label className="form-label">Priority Level</label>
                      <select 
                        className="form-select"
                        value={form.priority}
                        onChange={(e) => setForm({...form, priority: e.target.value})}
                      >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Due Date</label>
                      <input
                        type="date"
                        className="form-control"
                        value={form.scheduled_date}
                        onChange={(e) => setForm({...form, scheduled_date: e.target.value})}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="mb-3 mt-3">
                    <label className="form-label">Assign Team/Technician</label>
                    <select
                      className="form-select"
                      value={form.assigned_technician_id}
                      onChange={(e) => setForm({...form, assigned_technician_id: e.target.value})}
                      required
                    >
                      <option value="">Select Technician</option>
                      {technicians.map(tech => (
                        <option key={tech.id} value={tech.id}>
                          {tech.name} ({tech.team_name})
                        </option>
                      ))}
                    </select>
                    <small className="text-muted">Slack notification will be sent to assigned team</small>
                  </div>
                </div>
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={() => {
                      setShowScheduleForm(false)
                      setSelectedDate(null)
                    }}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Create Work Order
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}