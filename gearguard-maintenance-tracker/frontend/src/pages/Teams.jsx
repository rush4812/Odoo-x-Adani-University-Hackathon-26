import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { isAuthenticated } from '../utils/auth'

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000'

export default function Teams() {
  const navigate = useNavigate()
  const [teams, setTeams] = useState([])
  const [selectedTeam, setSelectedTeam] = useState(null)
  const [teamMembers, setTeamMembers] = useState([])
  const [loading, setLoading] = useState(false)
  const [showTeamForm, setShowTeamForm] = useState(false)
  const [showMemberForm, setShowMemberForm] = useState(false)
  const [teamForm, setTeamForm] = useState({
    name: '', description: '', location: '', company: ''
  })
  const [memberForm, setMemberForm] = useState({
    name: '', email: '', role: 'Technician', is_default_technician: false
  })

  useEffect(() => {
    if (!isAuthenticated()) navigate('/login')
    loadTeams()
  }, [])

  async function loadTeams() {
    setLoading(true)
    try {
      const res = await fetch(`${API}/api/teams`)
      const data = await res.json()
      setTeams(data)
    } catch (err) {
      console.error('Load teams error:', err)
    }
    setLoading(false)
  }

  async function loadTeamMembers(teamId) {
    try {
      const res = await fetch(`${API}/api/teams/${teamId}/members`)
      const data = await res.json()
      setTeamMembers(data)
      setSelectedTeam(teamId)
    } catch (err) {
      console.error('Load members error:', err)
    }
  }

  async function createTeam(e) {
    e.preventDefault()
    try {
      await fetch(`${API}/api/teams`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(teamForm)
      })
      setTeamForm({ name: '', description: '', location: '', company: '' })
      setShowTeamForm(false)
      loadTeams()
    } catch (err) {
      console.error('Create team error:', err)
    }
  }

  async function addMember(e) {
    e.preventDefault()
    try {
      await fetch(`${API}/api/teams/${selectedTeam}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...memberForm,
          is_default_technician: memberForm.is_default_technician ? 1 : 0
        })
      })
      setMemberForm({ name: '', email: '', role: 'Technician', is_default_technician: false })
      setShowMemberForm(false)
      loadTeamMembers(selectedTeam)
    } catch (err) {
      console.error('Add member error:', err)
    }
  }

  if (loading) return <div>Loading...</div>

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3>Teams Management</h3>
        <button className="btn btn-primary" onClick={() => setShowTeamForm(true)}>
          Create Team
        </button>
      </div>

      <div className="row">
        {/* Teams List */}
        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <h5>Teams</h5>
            </div>
            <div className="card-body">
              {teams.map(team => (
                <div key={team.id} className="card mb-2">
                  <div className="card-body p-3">
                    <div className="d-flex justify-content-between align-items-start">
                      <div>
                        <h6 className="card-title mb-1">{team.name}</h6>
                        <p className="card-text small text-muted mb-1">{team.description}</p>
                        <div className="small">
                          <span className="text-muted">Location: </span>{team.location}<br/>
                          <span className="text-muted">Company: </span>{team.company}<br/>
                          <span className="text-muted">Members: </span>{team.member_count}
                        </div>
                      </div>
                      <button 
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => loadTeamMembers(team.id)}
                      >
                        View Members
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Team Members */}
        <div className="col-md-6">
          {selectedTeam && (
            <div className="card">
              <div className="card-header d-flex justify-content-between align-items-center">
                <h5>Team Members</h5>
                <button className="btn btn-sm btn-primary" onClick={() => setShowMemberForm(true)}>
                  Add Member
                </button>
              </div>
              <div className="card-body">
                <div className="table-responsive">
                  <table className="table table-sm">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Default Tech</th>
                      </tr>
                    </thead>
                    <tbody>
                      {teamMembers.map(member => (
                        <tr key={member.id}>
                          <td>{member.name}</td>
                          <td>{member.email}</td>
                          <td>
                            <span className="badge bg-info">{member.role}</span>
                          </td>
                          <td>
                            {member.is_default_technician ? (
                              <span className="badge bg-success">Yes</span>
                            ) : (
                              <span className="badge bg-secondary">No</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create Team Modal */}
      {showTeamForm && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <form onSubmit={createTeam}>
                <div className="modal-header">
                  <h5>Create Team</h5>
                  <button type="button" className="btn-close" onClick={() => setShowTeamForm(false)}></button>
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Team Name</label>
                    <input className="form-control" value={teamForm.name} 
                           onChange={e => setTeamForm({...teamForm, name: e.target.value})} required />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Description</label>
                    <textarea className="form-control" value={teamForm.description}
                              onChange={e => setTeamForm({...teamForm, description: e.target.value})}></textarea>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Location</label>
                    <input className="form-control" value={teamForm.location}
                           onChange={e => setTeamForm({...teamForm, location: e.target.value})} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Company</label>
                    <input className="form-control" value={teamForm.company}
                           onChange={e => setTeamForm({...teamForm, company: e.target.value})} />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowTeamForm(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">Create Team</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      {showMemberForm && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <form onSubmit={addMember}>
                <div className="modal-header">
                  <h5>Add Team Member</h5>
                  <button type="button" className="btn-close" onClick={() => setShowMemberForm(false)}></button>
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Name</label>
                    <input className="form-control" value={memberForm.name} 
                           onChange={e => setMemberForm({...memberForm, name: e.target.value})} required />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Email</label>
                    <input type="email" className="form-control" value={memberForm.email}
                           onChange={e => setMemberForm({...memberForm, email: e.target.value})} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Role</label>
                    <select className="form-select" value={memberForm.role}
                            onChange={e => setMemberForm({...memberForm, role: e.target.value})}>
                      <option value="Technician">Technician</option>
                      <option value="Senior Technician">Senior Technician</option>
                      <option value="Team Lead">Team Lead</option>
                      <option value="Supervisor">Supervisor</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <div className="form-check">
                      <input className="form-check-input" type="checkbox" 
                             checked={memberForm.is_default_technician}
                             onChange={e => setMemberForm({...memberForm, is_default_technician: e.target.checked})} />
                      <label className="form-check-label">Default Technician</label>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowMemberForm(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">Add Member</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}