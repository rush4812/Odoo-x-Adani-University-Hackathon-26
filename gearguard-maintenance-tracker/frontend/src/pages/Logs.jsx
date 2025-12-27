import { useEffect, useState } from 'react'

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000'

export default function Logs(){
  const [assets, setAssets] = useState([])
  const [form, setForm] = useState({ asset_id:'', maintenance_date:'', maintenance_type:'Preventive', description:'', cost:0, performed_by:'', remarks:'' })
  const [loading, setLoading] = useState(false)

  useEffect(()=>{ fetch(`${API}/api/assets`).then(r=>r.json()).then(setAssets) }, [])

  async function submit(e){
    e.preventDefault(); setLoading(true)
    await fetch(`${API}/api/maintenance-logs`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(form) })
    setForm({ asset_id:'', maintenance_date:'', maintenance_type:'Preventive', description:'', cost:0, performed_by:'', remarks:'' })
    setLoading(false)
    alert('Maintenance log created')
  }

  return (
    <div>
      <h4>Maintenance Logs</h4>
      <div className="card p-3">
        <form onSubmit={submit}>
          <div className="row">
            <div className="col-md-6 mb-2"><label className="form-label">Asset</label>
              <select className="form-select" value={form.asset_id} onChange={e=>setForm({...form, asset_id:e.target.value})} required>
                <option value="">Select asset</option>
                {assets.map(a=> <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </div>
            <div className="col-md-6 mb-2"><label className="form-label">Date</label><input className="form-control" type="date" value={form.maintenance_date} onChange={e=>setForm({...form, maintenance_date:e.target.value})} required/></div>
          </div>
          <div className="mb-2"><label className="form-label">Type</label><select className="form-select" value={form.maintenance_type} onChange={e=>setForm({...form, maintenance_type:e.target.value})}><option>Preventive</option><option>Corrective</option></select></div>
          <div className="mb-2"><label className="form-label">Description</label><textarea className="form-control" value={form.description} onChange={e=>setForm({...form, description:e.target.value})}></textarea></div>
          <div className="row">
            <div className="col-md-4 mb-2"><label className="form-label">Cost</label><input className="form-control" type="number" value={form.cost} onChange={e=>setForm({...form, cost:e.target.value})}/></div>
            <div className="col-md-4 mb-2"><label className="form-label">Performed By</label><input className="form-control" value={form.performed_by} onChange={e=>setForm({...form, performed_by:e.target.value})}/></div>
            <div className="col-md-4 mb-2"><label className="form-label">Remarks</label><input className="form-control" value={form.remarks} onChange={e=>setForm({...form, remarks:e.target.value})}/></div>
          </div>
          <button className="btn btn-primary" disabled={loading}>{loading? 'Saving...':'Save Log'}</button>
        </form>
      </div>
    </div>
  )
}
