import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { isAuthenticated } from '../utils/auth'

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000'

export default function TaskActivity() {
  const navigate = useNavigate()
  const { requestId } = useParams()
  const [request, setRequest] = useState(null)
  const [activity, setActivity] = useState({})
  const [loading, setLoading] = useState(false)
  const [activeStep, setActiveStep] = useState(1)
  const [form, setForm] = useState({
    work_context: '',
    observations: '',
    parts_used: '',
    performance_rating: 5,
    feedback: ''
  })

  useEffect(() => {
    if (!isAuthenticated()) navigate('/login')
    if (requestId) loadData()
  }, [requestId])

  async function loadData() {
    try {
      const [requestRes, activityRes] = await Promise.all([
        fetch(`${API}/api/maintenance-requests/${requestId}`),
        fetch(`${API}/api/task-activities/request/${requestId}`)
      ])
      
      if (requestRes.ok) {
        const requestData = await requestRes.json()
        setRequest(requestData)
      }
      
      if (activityRes.ok) {
        const activityData = await activityRes.json()
        setActivity(activityData)
        setForm({
          work_context: activityData.work_context || '',
          observations: activityData.observations || '',
          parts_used: activityData.parts_used || '',
          performance_rating: activityData.performance_rating || 5,
          feedback: activityData.feedback || ''
        })
        
        // Determine current step
        if (activityData.actual_finish_time) setActiveStep(4)
        else if (activityData.work_context) setActiveStep(3)
        else if (activityData.actual_start_time) setActiveStep(2)
        else setActiveStep(1)
      }
    } catch (err) {
      console.error('Load error:', err)
    }
  }

  async function startTask() {
    setLoading(true)
    try {
      await fetch(`${API}/api/task-activities/${requestId}/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      setActiveStep(2)
      loadData()
    } catch (err) {
      console.error('Start error:', err)
    }
    setLoading(false)
  }

  async function updateProgress() {
    setLoading(true)
    try {
      await fetch(`${API}/api/task-activities/${requestId}/progress`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          work_context: form.work_context,
          observations: form.observations,
          parts_used: form.parts_used
        })
      })
      setActiveStep(3)
      loadData()
    } catch (err) {
      console.error('Update error:', err)
    }
    setLoading(false)
  }

  async function completeTask() {
    setLoading(true)
    try {
      await fetch(`${API}/api/task-activities/${requestId}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          performance_rating: form.performance_rating,
          feedback: form.feedback
        })
      })
      setActiveStep(4)
      loadData()
    } catch (err) {
      console.error('Complete error:', err)
    }
    setLoading(false)
  }

  if (!request) return <div>Loading...</div>

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3>Task Activity</h3>
        <button className="btn btn-outline-secondary" onClick={() => navigate('/maintenance')}>
          Back to Maintenance
        </button>
      </div>

      {/* Request Details */}
      <div className="card mb-4">
        <div className="card-header">
          <h5>Request Details</h5>
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-6">
              <p><strong>Subject:</strong> {request.subject}</p>
              <p><strong>Equipment:</strong> {request.equipment_name}</p>
              <p><strong>Type:</strong> 
                <span className={`badge ms-2 ${request.request_type === 'Preventive' ? 'bg-info' : 'bg-warning'}`}>
                  {request.request_type}
                </span>
              </p>
            </div>
            <div className="col-md-6">
              <p><strong>Priority:</strong> {request.priority}</p>
              <p><strong>Assigned To:</strong> {request.technician_name}</p>
              <p><strong>Scheduled:</strong> {request.scheduled_date}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row">
            <div className="col-md-3">
              <div className={`card ${activeStep >= 1 ? 'bg-primary text-white' : 'bg-light'}`}>
                <div className="card-body text-center">
                  <h6>1. Start Task</h6>
                  {activity.actual_start_time && (
                    <small>Started: {new Date(activity.actual_start_time).toLocaleString()}</small>
                  )}
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className={`card ${activeStep >= 2 ? 'bg-primary text-white' : 'bg-light'}`}>
                <div className="card-body text-center">
                  <h6>2. Work Progress</h6>
                  <small>Log work details</small>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className={`card ${activeStep >= 3 ? 'bg-primary text-white' : 'bg-light'}`}>
                <div className="card-body text-center">
                  <h6>3. Complete Task</h6>
                  <small>Rate & feedback</small>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className={`card ${activeStep >= 4 ? 'bg-success text-white' : 'bg-light'}`}>
                <div className="card-body text-center">
                  <h6>4. Finished</h6>
                  {activity.actual_finish_time && (
                    <small>Completed: {new Date(activity.actual_finish_time).toLocaleString()}</small>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Step Content */}
      <div className="card">
        <div className="card-body">
          {activeStep === 1 && (
            <div className="text-center">
              <h5>Ready to Start?</h5>
              <p>Click the button below to log your start time and begin working on this task.</p>
              <button className="btn btn-primary btn-lg" onClick={startTask} disabled={loading}>
                {loading ? 'Starting...' : 'Start Task'}
              </button>
            </div>
          )}

          {activeStep === 2 && (
            <div>
              <h5>Work in Progress</h5>
              <div className="row">
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label">Work Context</label>
                    <textarea className="form-control" rows="4" 
                              value={form.work_context}
                              onChange={e => setForm({...form, work_context: e.target.value})}
                              placeholder="Describe the work being performed..."></textarea>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label">Observations</label>
                    <textarea className="form-control" rows="4"
                              value={form.observations}
                              onChange={e => setForm({...form, observations: e.target.value})}
                              placeholder="Any observations or findings..."></textarea>
                  </div>
                </div>
              </div>
              <div className="mb-3">
                <label className="form-label">Parts Used</label>
                <textarea className="form-control" rows="2"
                          value={form.parts_used}
                          onChange={e => setForm({...form, parts_used: e.target.value})}
                          placeholder="List any parts or materials used..."></textarea>
              </div>
              <button className="btn btn-primary" onClick={updateProgress} disabled={loading}>
                {loading ? 'Updating...' : 'Update Progress'}
              </button>
            </div>
          )}

          {activeStep === 3 && (
            <div>
              <h5>Complete Task</h5>
              <div className="row">
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label">Performance Rating</label>
                    <div className="d-flex align-items-center">
                      {[1, 2, 3, 4, 5].map(rating => (
                        <button
                          key={rating}
                          type="button"
                          className={`btn btn-outline-warning me-1 ${form.performance_rating >= rating ? 'active' : ''}`}
                          onClick={() => setForm({...form, performance_rating: rating})}
                        >
                          ⭐
                        </button>
                      ))}
                      <span className="ms-2">({form.performance_rating}/5)</span>
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label">Feedback</label>
                    <textarea className="form-control" rows="4"
                              value={form.feedback}
                              onChange={e => setForm({...form, feedback: e.target.value})}
                              placeholder="Any feedback or recommendations..."></textarea>
                  </div>
                </div>
              </div>
              <button className="btn btn-success" onClick={completeTask} disabled={loading}>
                {loading ? 'Completing...' : 'Complete Task'}
              </button>
            </div>
          )}

          {activeStep === 4 && (
            <div className="text-center">
              <div className="alert alert-success">
                <h5>✅ Task Completed Successfully!</h5>
                <p>Total time: {activity.total_time_minutes} minutes</p>
                <p>Performance rating: {'⭐'.repeat(activity.performance_rating)} ({activity.performance_rating}/5)</p>
                {activity.feedback && <p>Feedback: {activity.feedback}</p>}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}