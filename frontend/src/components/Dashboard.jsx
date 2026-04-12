import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getDashboard } from '../lib/api.js'

export default function Dashboard({ user }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    getDashboard().then(r => setData(r.data)).catch(console.error).finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="page">
      <div className="loading-box"><div className="spinner"></div><p>Loading dashboard...</p></div>
    </div>
  )

  const stats = data?.stats || {}
  const weather = data?.weather_now || {}
  const costs = data?.quick_cost || {}

  return (
    <div className="page">
      {/* Header */}
      <div className="page-header">
        <h1>Welcome back, {user?.name?.split(' ')[0] || 'Traveller'} 👋</h1>
        <p>Plan your next adventure with AI-powered travel intelligence</p>
      </div>

      {/* Stats */}
      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-icon blue">✈️</div>
          <div>
            <div className="stat-value">{stats.total_trips || 0}</div>
            <div className="stat-label">Trips Planned</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon orange">📍</div>
          <div>
            <div className="stat-value">{stats.destinations_visited || 0}</div>
            <div className="stat-label">Destinations</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green">✍️</div>
          <div>
            <div className="stat-value">{stats.total_blogs || 0}</div>
            <div className="stat-label">Blog Drafts</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon purple">💰</div>
          <div>
            <div className="stat-value">₹{(stats.total_spent || 0).toLocaleString('en-IN')}</div>
            <div className="stat-label">Budget Planned</div>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="card mb-24">
        <div className="card-title">Quick Actions</div>
        <div className="card-sub">Start planning instantly</div>
        <div style={{display:'flex',gap:'12px',flexWrap:'wrap'}}>
          <button className="btn btn-primary" onClick={() => navigate('/plan')}>✈️ Plan a Trip</button>
          <button className="btn btn-secondary" onClick={() => navigate('/route')}>🗺️ Road Trip Route</button>
          <button className="btn btn-accent" onClick={() => navigate('/blog')}>✍️ Generate Blog</button>
          <button className="btn btn-outline" onClick={() => navigate('/chat')}>💬 Ask Travel AI</button>
        </div>
      </div>

      <div className="grid-2 mb-24">
        {/* Weather Widget */}
        <div className="card">
          <div className="card-title">🌤️ Travel Weather — {weather.month}</div>
          <div className="card-sub">Current season overview</div>
          <div style={{display:'flex',flexDirection:'column',gap:'10px'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <span className="text-muted">Temperature</span>
              <strong>{weather.temp}</strong>
            </div>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <span className="text-muted">Condition</span>
              <strong>{weather.condition}</strong>
            </div>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <span className="text-muted">Travel Rating</span>
              <span className={`badge badge-${weather.travel === 'Excellent' ? 'green' : weather.travel === 'Good' ? 'blue' : 'orange'}`}>
                {weather.travel}
              </span>
            </div>
          </div>
        </div>

        {/* Cost Reference */}
        <div className="card">
          <div className="card-title">💰 3-Day Trip Cost Reference</div>
          <div className="card-sub">Per person estimates (stay + food + activities)</div>
          <div style={{display:'flex',flexDirection:'column',gap:'8px'}}>
            {[
              { label: 'Budget', val: costs.budget?.total, color: '#10B981' },
              { label: 'Mid-Range', val: costs.mid?.total, color: '#0EA5E9' },
              { label: 'Luxury', val: costs.luxury?.total, color: '#F97316' },
            ].map(r => (
              <div key={r.label} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'8px 12px',background:'#F8FAFC',borderRadius:'8px'}}>
                <span style={{fontSize:'13px',fontWeight:600}}>{r.label}</span>
                <span style={{fontSize:'15px',fontWeight:800,color:r.color}}>₹{(r.val||0).toLocaleString('en-IN')}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Suggested Destinations */}
      <div className="card">
        <div className="flex-between mb-16">
          <div>
            <div className="card-title">🗺️ Suggested Destinations</div>
            <div className="card-sub">Popular among travel bloggers in India</div>
          </div>
        </div>
        <div className="grid-3">
          {(data?.suggested_destinations || []).slice(0,6).map((d, i) => (
            <div key={i} className="dest-card" onClick={() => navigate(`/plan?q=${encodeURIComponent('Plan a trip to ' + d.name)}`)}>
              <div className="dest-emoji">{d.image_emoji}</div>
              <div className="dest-name">{d.name}</div>
              <div className="dest-highlight">{d.highlight}</div>
              <div className="dest-meta">
                <span className="badge badge-blue">{d.best_months}</span>
                <span style={{fontSize:'13px',fontWeight:700,color:'#10B981'}}>
                  ₹{(d.budget_3days||0).toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Trips */}
      {data?.recent_trips?.length > 0 && (
        <div className="card mt-24">
          <div className="flex-between mb-16">
            <div className="card-title">📁 Recent Trips</div>
            <button className="btn btn-outline btn-sm" onClick={() => navigate('/my-trips')}>View All</button>
          </div>
          <div style={{display:'flex',flexDirection:'column',gap:'8px'}}>
            {data.recent_trips.map(t => (
              <div key={t.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'12px 16px',background:'#F8FAFC',borderRadius:'8px'}}>
                <div>
                  <div style={{fontWeight:700,fontSize:'14px'}}>{t.title}</div>
                  <div style={{fontSize:'12px',color:'#64748B'}}>{new Date(t.created_at).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}</div>
                </div>
                <span style={{fontSize:'14px',fontWeight:700,color:'#0EA5E9'}}>
                  {t.budget ? `₹${t.budget.toLocaleString('en-IN')}` : '—'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
