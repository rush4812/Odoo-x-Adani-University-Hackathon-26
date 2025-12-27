import { useEffect, useState } from 'react'

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000'

export default function History(){
  const [logs, setLogs] = useState([])
  useEffect(()=>{ fetch(`${API}/api/maintenance-logs`).then(r=>r.json()).then(setLogs) }, [])

  return (
    <div>
      <h4>Maintenance History</h4>
      <div className="card p-3">
        <table className="table table-sm">
          <thead><tr><th>Date</th><th>Asset</th><th>Type</th><th>Description</th><th>Cost</th></tr></thead>
          <tbody>
            {logs.map(l=> <tr key={l.id}><td>{l.maintenance_date}</td><td>{l.asset_name}</td><td>{l.maintenance_type}</td><td>{l.description}</td><td>{l.cost}</td></tr>)}
          </tbody>
        </table>
      </div>
    </div>
  )
}
