import { useState, useEffect } from 'react'
import { getMyTrips, deleteTrip } from '../lib/api.js'
import { useNavigate } from 'react-router-dom'

export default function MyTrips() {
  const [trips, setTrips] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  const load = () => {
    getMyTrips().then(r => setTrips(r.data)).catch(console.error).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this trip?')) return
    await deleteTrip(id)
    load()
  }

  const fmt = n => n ? `₹${Number(n).toLocaleString('en-IN')}` : '—'

  return (
    <div className="page">
      <div className="page-header">
        <h1>📁 My Trips</h1>
        <p>All your saved trip plans</p>
      </div>

      <div className="flex-between mb-24">
        <span className="text-muted">{trips.length} trip{trips.length !== 1 ? 's' : ''} saved</span>
        <button className="btn btn-primary" onClick={() => navigate('/plan')}>+ Plan New Trip</button>
      </div>

      {loading ? (
        <div className="loading-box"><div className="spinner"></div><p>Loading trips...</p></div>
      ) : trips.length === 0 ? (
        <div className="card" style={{textAlign:'center',padding:'60px 20px'}}>
          <div style={{fontSize:'48px',marginBottom:'16px'}}>✈️</div>
          <div style={{fontWeight:700,fontSize:'16px',marginBottom:'8px'}}>No trips yet</div>
          <div className="text-muted mb-16">Plan your first trip and save it here</div>
          <button className="btn btn-primary" onClick={() => navigate('/plan')}>Plan a Trip</button>
        </div>
      ) : (
        <div style={{display:'flex',flexDirection:'column',gap:'12px'}}>
          {trips.map(trip => (
            <div key={trip.id} className="card" style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:'16px'}}>
              <div style={{flex:1}}>
                <div style={{display:'flex',alignItems:'center',gap:'10px',marginBottom:'6px'}}>
                  <span style={{fontSize:'20px'}}>📍</span>
                  <div className="card-title" style={{marginBottom:0}}>{trip.title}</div>
                  <span className={`badge ${trip.status==='planned'?'badge-blue':trip.status==='completed'?'badge-green':'badge-orange'}`}>
                    {trip.status}
                  </span>
                </div>
                <div className="text-muted mb-8" style={{paddingLeft:'30px'}}>{trip.query}</div>
                <div style={{display:'flex',gap:'20px',paddingLeft:'30px',flexWrap:'wrap'}}>
                  {trip.duration && <span style={{fontSize:'12.5px'}}>⏱️ {trip.duration}</span>}
                  {trip.budget > 0 && <span style={{fontSize:'12.5px',fontWeight:700,color:'#0EA5E9'}}>💰 {fmt(trip.budget)}</span>}
                  <span style={{fontSize:'12px',color:'#94A3B8'}}>
                    {new Date(trip.created_at).toLocaleDateString('en-IN', {day:'numeric',month:'short',year:'numeric'})}
                  </span>
                </div>
              </div>
              <div style={{display:'flex',gap:'8px',flexShrink:0}}>
                <button className="btn btn-outline btn-sm" onClick={() => navigate(`/plan?q=${encodeURIComponent(trip.query)}`)}>Re-plan</button>
                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(trip.id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
