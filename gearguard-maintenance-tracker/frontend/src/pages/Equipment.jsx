import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { isAuthenticated } from '../utils/auth'

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000'

export default function Equipment() {
  const navigate = useNavigate()
  const [equipment, setEquipment] = useState([])
  const [teams, setTeams] = useState([])
  const [technicians, setTechnicians] = useState([])
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [selectedEquipment, setSelectedEquipment] = useState(null)
  const [equipmentRequests, setEquipmentRequests] = useState([])
  const [form, setForm] = useState({
    name: '', serial_number: '', category: '', department: '', assigned_employee: '',
    purchase_date: '', warranty_expiry: '', physical_location: '', 
    maintenance_team_id: '', default_technician_id: '', status: 'Active', notes: ''
  })

  useEffect(() => {
    if (!isAuthenticated()) navigate('/login')
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)
    try {
      const [equipmentRes, teamsRes] = await Promise.all([
        fetch(`${API}/api/equipment`),
        fetch(`${API}/api/teams`)
      ])
      
      const equipmentData = await equipmentRes.json()
      const teamsData = await teamsRes.json()
      
      setEquipment(equipmentData)
      setTeams(teamsData)
      
      // Load all technicians
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

  async function createEquipment(e) {
    e.preventDefault()
    try {
      await fetch(`${API}/api/equipment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      setForm({
        name: '', serial_number: '', category: '', department: '', assigned_employee: '',
        purchase_date: '', warranty_expiry: '', physical_location: '', 
        maintenance_team_id: '', default_technician_id: '', status: 'Active', notes: ''
      })
      setShowForm(false)
      loadData()
    } catch (err) {
      console.error('Create error:', err)
    }
  }

  async function viewMaintenanceRequests(equipmentId) {
    try {
      const res = await fetch(`${API}/api/equipment/${equipmentId}/requests`)
      const requests = await res.json()
      setEquipmentRequests(requests)
      setSelectedEquipment(equipmentId)
    } catch (err) {
      console.error('Load requests error:', err)
    }
  }

  if (loading) return <div>Loading...</div>

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3>Equipment Management</h3>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          Add Equipment
        </button>
      </div>

      {/* Equipment List */}
      <div className="card">
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Serial Number</th>
                  <th>Category</th>
                  <th>Department</th>
                  <th>Team</th>
                  <th>Technician</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {equipment.map(eq => (
                  <tr key={eq.id}>
                    <td>{eq.name}</td>
                    <td>{eq.serial_number}</td>
                    <td>{eq.category}</td>
                    <td>{eq.department}</td>
                    <td>{eq.team_name}</td>
                    <td>{eq.technician_name}</td>
                    <td>
                      <span className={`badge ${eq.status === 'Active' ? 'bg-success' : 
                                               eq.status === 'Under Maintenance' ? 'bg-warning' : 'bg-danger'}`}>
                        {eq.status}
                      </span>
                    </td>
                    <td>
                      <button 
                        className="btn btn-sm btn-outline-primary me-2"
                        onClick={() => viewMaintenanceRequests(eq.id)}
                      >
                        Maintenance 
                        {eq.open_requests > 0 && (
                          <span className="badge bg-danger ms-1">{eq.open_requests}</span>
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Equipment Modal */}
      {showForm && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <form onSubmit={createEquipment}>
                <div className="modal-header">
                  <h5>Add Equipment</h5>
                  <button type="button" className="btn-close" onClick={() => setShowForm(false)}></button>
                </div>
                <div className="modal-body">
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Equipment Name</label>
                      <input className="form-control" value={form.name} 
                             onChange={e => setForm({...form, name: e.target.value})} required />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Serial Number</label>
                      <input className="form-control" value={form.serial_number}
                             onChange={e => setForm({...form, serial_number: e.target.value})} />
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Category</label>
                      <input className="form-control" value={form.category}
                             onChange={e => setForm({...form, category: e.target.value})} />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Department</label>
                      <input className="form-control" value={form.department}
                             onChange={e => setForm({...form, department: e.target.value})} />
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Assigned Employee</label>
                      <input className="form-control" value={form.assigned_employee}
                             onChange={e => setForm({...form, assigned_employee: e.target.value})} />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Physical Location</label>
                      <input className="form-control" value={form.physical_location}
                             onChange={e => setForm({...form, physical_location: e.target.value})} />
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Purchase Date</label>
                      <input type="date" className="form-control" value={form.purchase_date}
                             onChange={e => setForm({...form, purchase_date: e.target.value})} />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Warranty Expiry</label>
                      <input type="date" className="form-control" value={form.warranty_expiry}
                             onChange={e => setForm({...form, warranty_expiry: e.target.value})} />
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Maintenance Team</label>
                      <select className="form-select" value={form.maintenance_team_id}
                              onChange={e => setForm({...form, maintenance_team_id: e.target.value})}>
                        <option value="">Select Team</option>
                        {teams.map(team => (
                          <option key={team.id} value={team.id}>{team.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Default Technician</label>
                      <select className="form-select" value={form.default_technician_id}
                              onChange={e => setForm({...form, default_technician_id: e.target.value})}>
                        <option value="">Select Technician</option>
                        {technicians.map(tech => (
                          <option key={tech.id} value={tech.id}>{tech.name} ({tech.team_name})</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Status</label>
                    <select className="form-select" value={form.status}
                            onChange={e => setForm({...form, status: e.target.value})}>
                      <option value="Active">Active</option>
                      <option value="Under Maintenance">Under Maintenance</option>
                      <option value="Scrap">Scrap</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Notes</label>
                    <textarea className="form-control" value={form.notes}
                              onChange={e => setForm({...form, notes: e.target.value})}></textarea>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">Add Equipment</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Maintenance Requests Modal */}
      {selectedEquipment && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5>Maintenance Requests</h5>
                <button type="button" className="btn-close" onClick={() => setSelectedEquipment(null)}></button>
              </div>
              <div className="modal-body">
                <div className="table-responsive">
                  <table className="table table-sm">
                    <thead>
                      <tr>
                        <th>Subject</th>
                        <th>Type</th>
                        <th>Stage</th>
                        <th>Technician</th>
                        <th>Scheduled</th>
                      </tr>
                    </thead>
                    <tbody>
                      {equipmentRequests.map(req => (
                        <tr key={req.id}>
                          <td>{req.subject}</td>
                          <td>
                            <span className={`badge ${req.request_type === 'Preventive' ? 'bg-info' : 'bg-warning'}`}>
                              {req.request_type}
                            </span>
                          </td>
                          <td>
                            <span className={`badge ${req.stage === 'New' ? 'bg-secondary' : 
                                                     req.stage === 'In Progress' ? 'bg-primary' :
                                                     req.stage === 'Repaired' ? 'bg-success' : 'bg-danger'}`}>
                              {req.stage}
                            </span>
                          </td>
                          <td>{req.technician_name}</td>
                          <td>{req.scheduled_date}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}