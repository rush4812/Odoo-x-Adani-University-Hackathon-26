import { useEffect, useState } from 'react'

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000'

export default function Assets(){
  const [assets, setAssets] = useState([])
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ name:'', category:'', asset_code:'', purchase_date:'', warranty_expiry:'', maintenance_interval_days:30, status:'Active', notes:'' })

  async function load(){
    setLoading(true)
    const res = await fetch(`${API}/api/assets`)
    const data = await res.json()
    setAssets(data)
    setLoading(false)
  }

  useEffect(()=>{ load() }, [])

  async function handleAdd(e){
    e.preventDefault()
    await fetch(`${API}/api/assets`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(form) })
    setForm({ name:'', category:'', asset_code:'', purchase_date:'', warranty_expiry:'', maintenance_interval_days:30, status:'Active', notes:'' })
    load()
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4>Assets</h4>
        <button className="btn btn-primary" data-bs-toggle="modal" data-bs-target="#addAssetModal">Add Asset</button>
      </div>

      <div className="card p-3 mb-3">
        {loading ? <div>Loading...</div> : (
          <table className="table table-sm">
            <thead><tr><th>ID</th><th>Name</th><th>Category</th><th>Code</th><th>Status</th><th>Last Maintenance</th></tr></thead>
            <tbody>
              {assets.map(a=> (
                <tr key={a.id}><td>{a.id}</td><td>{a.name}</td><td>{a.category}</td><td>{a.asset_code}</td><td>{a.status}</td><td>{a.last_maintenance_date || '-'}</td></tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="modal fade" id="addAssetModal" tabIndex="-1">
        <div className="modal-dialog">
          <div className="modal-content">
            <form onSubmit={handleAdd}>
              <div className="modal-header"><h5 className="modal-title">Add Asset</h5><button type="button" className="btn-close" data-bs-dismiss="modal"></button></div>
              <div className="modal-body">
                <div className="mb-2"><label className="form-label">Name</label><input className="form-control" value={form.name} onChange={e=>setForm({...form, name:e.target.value})} required/></div>
                <div className="mb-2"><label className="form-label">Category</label><input className="form-control" value={form.category} onChange={e=>setForm({...form, category:e.target.value})} /></div>
                <div className="mb-2"><label className="form-label">Asset Code</label><input className="form-control" value={form.asset_code} onChange={e=>setForm({...form, asset_code:e.target.value})} /></div>
                <div className="mb-2"><label className="form-label">Maintenance Interval (days)</label><input type="number" className="form-control" value={form.maintenance_interval_days} onChange={e=>setForm({...form, maintenance_interval_days:e.target.value})} /></div>
                <div className="mb-2"><label className="form-label">Status</label><select className="form-select" value={form.status} onChange={e=>setForm({...form, status:e.target.value})}><option>Active</option><option>Under Maintenance</option><option>Retired</option></select></div>
                <div className="mb-2"><label className="form-label">Notes</label><textarea className="form-control" value={form.notes} onChange={e=>setForm({...form, notes:e.target.value})}></textarea></div>
              </div>
              <div className="modal-footer"><button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button><button className="btn btn-primary">Save</button></div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
