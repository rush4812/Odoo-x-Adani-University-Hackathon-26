import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { isAuthenticated } from '../utils/auth'

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000'

export default function Maintenance() {
  const navigate = useNavigate()
  const [kanban, setKanban] = useState({})
  const [equipment, setEquipment] = useState([])
  const [technicians, setTechnicians] = useState([])
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    subject: '', equipment_id: '', request_type: 'Corrective', 
    priority: 'Medium', assigned_technician_id: '', scheduled_date: '', created_by: 'Current User'
  })

  useEffect(() => {
    if (!isAuthenticated()) navigate('/login')
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)
    try {
      const [kanbanRes, equipmentRes, teamsRes] = await Promise.all([
        fetch(`${API}/api/maintenance-requests/kanban`),
        fetch(`${API}/api/equipment`),
        fetch(`${API}/api/teams`)
      ])
      
      const kanbanData = await kanbanRes.json()
      const equipmentData = await equipmentRes.json()
      const teamsData = await teamsRes.json()
      
      setKanban(kanbanData)
      setEquipment(equipmentData)
      
      // Get all technicians from all teams
      const allTechnicians = []
      for (const team of teamsData) {
        const membersRes = await fetch(`${API}/api/teams/${team.id}/members`)
        const members = await membersRes.json()
        allTechnicians.push(...members.map(m => ({...m, team_name: team.name})))
      }
      setTechnicians(allTechnicians)
    } catch (err) {
      console.error('Load error:', err)
    }
    setLoading(false)
  }

  async function createRequest(e) {
    e.preventDefault()
    try {
      await fetch(`${API}/api/maintenance-requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      setForm({
        subject: '', equipment_id: '', request_type: 'Corrective', 
        priority: 'Medium', assigned_technician_id: '', scheduled_date: '', created_by: 'Current User'
      })
      setShowForm(false)
      loadData()
    } catch (err) {
      console.error('Create error:', err)
    }
  }

  async function updateStage(requestId, newStage) {
    try {
      await fetch(`${API}/api/maintenance-requests/${requestId}/stage`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage: newStage })
      })
      loadData()
    } catch (err) {
      console.error('Update error:', err)
    }
  }

  const stages = ['New', 'In Progress', 'Repaired', 'Scrap']

  if (loading) return <div>Loading...</div>

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3>Maintenance Requests</h3>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          New Request
        </button>
      </div>

      {/* Kanban Board */}
      <div className="row">
        {stages.map(stage => (
          <div key={stage} className="col-md-3">
            <div className="card">
              <div className="card-header d-flex justify-content-between">
                <h6 className="mb-0">{stage}</h6>
                <span className="badge bg-secondary">{kanban[stage]?.length || 0}</span>
              </div>
              <div className="card-body p-2" style={{ minHeight: '400px' }}>
                {kanban[stage]?.map(request => (
                  <div key={request.id} className={`card mb-2 ${request.is_overdue ? 'border-danger' : ''}`}>
                    <div className="card-body p-2">
                      <h6 className="card-title mb-1" style={{ fontSize: '0.9rem' }}>
                        {request.subject}
                      </h6>
                      <p className="card-text small text-muted mb-1">
                        {request.equipment_name}
                      </p>
                      <div className="d-flex justify-content-between align-items-center">
                        <span className={`badge ${request.request_type === 'Preventive' ? 'bg-info' : 'bg-warning'}`}>
                          {request.request_type}
                        </span>
                        <small className="text-muted">{request.technician_name}</small>
                      </div>
                      {request.is_overdue && (
                        <div className="mt-1">
                          <span className="badge bg-danger">Overdue</span>
                        </div>
                      )}
                      <div className="mt-2">
                        <select 
                          className="form-select form-select-sm mb-2"
                          value={request.stage}
                          onChange={(e) => updateStage(request.id, e.target.value)}
                        >
                          {stages.map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                        {request.stage !== 'Repaired' && request.stage !== 'Scrap' && (
                          <a href={`/task-activity/${request.id}`} className="btn btn-sm btn-outline-primary w-100">
                            Work on Task
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create Request Modal */}
      {showForm && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <form onSubmit={createRequest}>
                <div className="modal-header">
                  <h5>New Maintenance Request</h5>
                  <button type="button" className="btn-close" onClick={() => setShowForm(false)}></button>
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Subject</label>
                    <input className="form-control" value={form.subject} 
                           onChange={e => setForm({...form, subject: e.target.value})} required />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Equipment</label>
                    <select className="form-select" value={form.equipment_id}
                            onChange={e => setForm({...form, equipment_id: e.target.value})} required>
                      <option value="">Select Equipment</option>
                      {equipment.map(eq => (
                        <option key={eq.id} value={eq.id}>{eq.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Type</label>
                      <select className="form-select" value={form.request_type}
                              onChange={e => setForm({...form, request_type: e.target.value})}>
                        <option value="Corrective">Corrective</option>
                        <option value="Preventive">Preventive</option>
                      </select>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Priority</label>
                      <select className="form-select" value={form.priority}
                              onChange={e => setForm({...form, priority: e.target.value})}>
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                      </select>
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Assigned Technician</label>
                    <select className="form-select" value={form.assigned_technician_id}
                            onChange={e => setForm({...form, assigned_technician_id: e.target.value})}>
                      <option value="">Select Technician</option>
                      {technicians.map(tech => (
                        <option key={tech.id} value={tech.id}>{tech.name} ({tech.team_name})</option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Scheduled Date</label>
                    <input type="date" className="form-control" value={form.scheduled_date}
                           onChange={e => setForm({...form, scheduled_date: e.target.value})} />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">Create Request</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}