import { useEffect, useState } from 'react'

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000'

function calcNext(last, interval){
  if (!interval) return null
  const base = last ? new Date(last) : new Date()
  const d = new Date(base)
  d.setDate(d.getDate() + Number(interval))
  return d.toISOString().slice(0,10)
}

export default function Schedule(){
  const [assets, setAssets] = useState([])
  useEffect(()=>{ fetch(`${API}/api/assets`).then(r=>r.json()).then(setAssets) }, [])

  return (
    <div>
      <h4>Maintenance Schedule</h4>
      <div className="card p-3">
        <table className="table table-sm">
          <thead><tr><th>Asset</th><th>Last Maintenance</th><th>Next Due</th><th>Status</th></tr></thead>
          <tbody>
            {assets.map(a=>{
              const next = calcNext(a.last_maintenance_date, a.maintenance_interval_days)
              let status = 'Upcoming'
              if (!next) status = 'N/A'
              else {
                const now = new Date().toISOString().slice(0,10)
                if (next < now) status = 'Overdue'
                else if (next <= new Date(Date.now()+7*24*3600*1000).toISOString().slice(0,10)) status = 'Due'
              }
              return <tr key={a.id}><td>{a.name}</td><td>{a.last_maintenance_date||'-'}</td><td>{next||'-'}</td><td>{status}</td></tr>
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
