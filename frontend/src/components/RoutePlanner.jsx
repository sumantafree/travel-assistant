import { useState } from 'react'
import { planRoute } from '../lib/api.js'

export default function RoutePlanner() {
  const [form, setForm] = useState({ origin: '', destination: '', vehicle: 'car' })
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const set = k => e => setForm(f => ({...f, [k]: e.target.value}))
  const fmt = n => n ? `₹${Number(n).toLocaleString('en-IN')}` : '₹0'

  const QUICK_ROUTES = [
    { from: 'Kolkata', to: 'Digha', label: 'Kolkata → Digha (Beach)' },
    { from: 'Kolkata', to: 'Darjeeling', label: 'Kolkata → Darjeeling (Hills)' },
    { from: 'Kolkata', to: 'Purulia', label: 'Kolkata → Purulia (Nature)' },
    { from: 'Kolkata', to: 'Dooars', label: 'Kolkata → Dooars (Wildlife)' },
  ]

  const submit = async () => {
    if (!form.origin || !form.destination) return
    setLoading(true); setError(''); setResult(null)
    try {
      const res = await planRoute(form.origin, form.destination, form.vehicle)
      if (res.data.error) throw new Error(res.data.error)
      setResult(res.data)
    } catch (err) {
      setError(err.message || 'Failed to plan route.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>🗺️ Road Trip Route Planner</h1>
        <p>Get scenic routes, fuel cost, toll estimates & stopovers for any Indian road trip</p>
      </div>

      <div className="card mb-24">
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">From</label>
            <input className="form-input" placeholder="e.g. Kolkata" value={form.origin} onChange={set('origin')} />
          </div>
          <div className="form-group">
            <label className="form-label">To</label>
            <input className="form-input" placeholder="e.g. Manali" value={form.destination} onChange={set('destination')} />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Vehicle</label>
          <select className="form-select" value={form.vehicle} onChange={set('vehicle')}>
            <option value="car">Car (15 km/l)</option>
            <option value="bike">Motorbike (35 km/l)</option>
            <option value="suv">SUV (12 km/l)</option>
          </select>
        </div>

        <div style={{display:'flex',flexWrap:'wrap',gap:'8px',marginBottom:'16px'}}>
          {QUICK_ROUTES.map((r, i) => (
            <button key={i} className="btn btn-outline btn-sm" onClick={() => setForm(f => ({...f, origin:r.from, destination:r.to}))}>
              {r.label}
            </button>
          ))}
        </div>

        <button className="btn btn-primary btn-lg" onClick={submit} disabled={loading || !form.origin || !form.destination}>
          {loading ? <><div className="spinner" style={{width:16,height:16,borderWidth:2}}></div> Planning...</> : '🚗 Plan Route'}
        </button>
      </div>

      {error && <div className="alert alert-error">⚠️ {error}</div>}

      {loading && (
        <div className="loading-box">
          <div className="spinner" style={{width:36,height:36,borderWidth:3}}></div>
          <p>Calculating best route...</p>
        </div>
      )}

      {result && !result.error && (
        <div>
          {/* Summary Bar */}
          <div className="route-summary mb-24">
            <div className="route-stat">
              <div className="val">{result.total_distance_km} km</div>
              <div className="lbl">Total Distance</div>
            </div>
            <div className="route-stat">
              <div className="val">{result.estimated_time_hours}h</div>
              <div className="lbl">Drive Time</div>
            </div>
            <div className="route-stat">
              <div className="val">{fmt(result.fuel_cost_inr)}</div>
              <div className="lbl">Fuel Cost</div>
            </div>
            <div className="route-stat">
              <div className="val">{fmt(result.total_road_cost_inr)}</div>
              <div className="lbl">Total (Fuel+Toll)</div>
            </div>
          </div>

          <div className="grid-2 mb-24">
            {/* Route Segments */}
            <div>
              <div className="card-title mb-16">📍 Route Segments</div>
              {(result.segments || []).map((s, i) => (
                <div key={i} className="segment-row">
                  <div className="segment-cities">{s.from} → {s.to}</div>
                  <div className="segment-meta">
                    <span>{s.distance_km} km</span>
                    <span>{s.time_hours}h</span>
                    <span className={`badge ${s.condition==='Good'?'badge-green':s.condition==='Average'?'badge-orange':'badge-gray'}`}>{s.condition}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Highlights */}
            <div className="card">
              <div className="card-title">🌄 Scenic Highlights</div>
              <div className="card-sub">Don't miss these on the way</div>
              <ul className="activity-list" style={{gap:'10px'}}>
                {(result.scenic_highlights || []).map((h, i) => <li key={i}>{h}</li>)}
              </ul>
              <div className="divider"></div>
              <div className="card-title mb-8">🚗 Driving Tips</div>
              <ul className="activity-list" style={{gap:'10px'}}>
                {(result.driving_tips || []).map((t, i) => <li key={i}>{t}</li>)}
              </ul>
            </div>
          </div>

          {/* Stopovers */}
          {result.stopovers?.length > 0 && (
            <div>
              <div className="card-title mb-16">☕ Recommended Stopovers</div>
              {result.stopovers.map((s, i) => (
                <div key={i} className="stopover-card">
                  <div className="stopover-km">{s.km_mark}<br/>km</div>
                  <div>
                    <div className="stopover-name">{s.location}</div>
                    <div className="stopover-desc">{s.what_to_do}</div>
                    {s.food && <div style={{fontSize:'12px',color:'#F97316',marginTop:'4px'}}>🍽️ {s.food}</div>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
