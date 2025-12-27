import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { isAuthenticated } from '../utils/auth'

export default function Dashboard(){
  const navigate = useNavigate()
  useEffect(() => {
    if (!isAuthenticated()) navigate('/login')
  }, [])

  return (
    <div className="d-flex justify-content-center">
      <div style={{maxWidth:900, width:'100%'}}>
        <h3 className="mb-3">Dashboard</h3>
        <div className="card p-3">
          <p>Welcome to the main dashboard. User is signed in.</p>
        </div>
      </div>
    </div>
  )
}
