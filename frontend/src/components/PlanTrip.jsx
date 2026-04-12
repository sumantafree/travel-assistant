import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { planTrip, searchHotels } from '../lib/api.js'
import ReactMarkdown from 'react-markdown'

const EXAMPLES = [
  "Plan a 3-day road trip near Kolkata for nature photography",
  "Weekend trip to Darjeeling from Kolkata for 2 people, budget ₹8000",
  "5-day Sikkim trip for photography enthusiasts, mid-range budget",
  "Solo offbeat trip near Purulia for 2 days",
]

export default function PlanTrip() {
  const [searchParams] = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') || '')
  const [save, setSave] = useState(false)
  const [result, setResult] = useState(null)
  const [hotels, setHotels] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('itinerary')

  useEffect(() => {
    const q = searchParams.get('q')
    if (q) { setQuery(q); handleSubmitQuery(q) }
  }, [])

  const handleSubmitQuery = async (q) => {
    const queryText = q || query
    if (!queryText.trim()) return
    setLoading(true); setError(''); setResult(null); setHotels(null)
    try {
      const res = await planTrip(queryText, save)
      if (res.data.error) throw new Error(res.data.error)
      setResult(res.data)
      // Auto-fetch hotels
      if (res.data.destination) {
        searchHotels(res.data.destination).then(hr => setHotels(hr.data.hotels)).catch(()=>{})
      }
    } catch (err) {
      setError(err.message || 'Failed to generate plan. Make sure backend is running.')
    } finally {
      setLoading(false)
    }
  }

  const fmt = n => n ? `₹${Number(n).toLocaleString('en-IN')}` : '₹0'

  return (
    <div className="page">
      <div className="page-header">
        <h1>✈️ Plan My Trip</h1>
        <p>Describe your trip idea — AI will build a complete itinerary, cost breakdown & photography tips</p>
      </div>

      {/* Input */}
      <div className="card mb-24">
        <div className="form-group">
          <label className="form-label">What kind of trip are you planning?</label>
          <textarea
            className="form-textarea"
            style={{minHeight:'90px'}}
            placeholder="e.g. Plan a 3-day road trip near Kolkata for nature photography, budget ₹10,000"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => { if(e.key==='Enter' && e.ctrlKey) handleSubmitQuery() }}
          />
        </div>

        <div style={{display:'flex',flexWrap:'wrap',gap:'8px',marginBottom:'16px'}}>
          {EXAMPLES.map((ex, i) => (
            <button key={i} className="btn btn-outline btn-sm" onClick={() => setQuery(ex)}>{ex.slice(0,40)}…</button>
          ))}
        </div>

        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:'12px'}}>
          <label style={{display:'flex',alignItems:'center',gap:'8px',fontSize:'13px',cursor:'pointer'}}>
            <input type="checkbox" checked={save} onChange={e=>setSave(e.target.checked)} />
            Save this trip to My Trips
          </label>
          <button className="btn btn-primary btn-lg" onClick={() => handleSubmitQuery()} disabled={loading || !query.trim()}>
            {loading ? <><div className="spinner" style={{width:16,height:16,borderWidth:2}}></div> Generating...</> : '🚀 Generate Trip Plan'}
          </button>
        </div>
      </div>

      {error && <div className="alert alert-error">⚠️ {error}</div>}

      {loading && (
        <div className="loading-box">
          <div className="spinner" style={{width:36,height:36,borderWidth:3}}></div>
          <p>AI is building your perfect trip plan...</p>
          <p style={{fontSize:'12px'}}>This takes 10-20 seconds</p>
        </div>
      )}

      {result && !result.error && (
        <div className="result-wrap">
          {/* Hero */}
          <div className="result-hero">
            <h2>📍 {result.destination}</h2>
            <p>{result.summary}</p>
            <div className="result-meta">
              <div className="result-meta-item">
                <span>Best Time</span>
                <span>{result.best_time}</span>
              </div>
              <div className="result-meta-item">
                <span>Travel Mode</span>
                <span>{result.travel_mode}</span>
              </div>
              <div className="result-meta-item">
                <span>Duration</span>
                <span>{result.itinerary?.length || '?'} Days</span>
              </div>
              <div className="result-meta-item">
                <span>Est. Budget</span>
                <span>{fmt(result.cost_breakdown?.total)}</span>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div style={{display:'flex',gap:'4px',marginBottom:'20px',background:'#F1F5F9',borderRadius:'10px',padding:'4px'}}>
            {['itinerary','cost','hotels','photography','tips'].map(t => (
              <button key={t} onClick={()=>setActiveTab(t)}
                style={{flex:1,padding:'8px',border:'none',cursor:'pointer',borderRadius:'8px',fontWeight:600,fontSize:'12.5px',
                  background:activeTab===t?'white':'transparent',
                  color:activeTab===t?'#0EA5E9':'#64748B',
                  boxShadow:activeTab===t?'0 1px 3px rgba(0,0,0,.1)':'none'}}>
                {t==='itinerary'?'📅 Itinerary':t==='cost'?'💰 Cost':t==='hotels'?'🏨 Hotels':t==='photography'?'📸 Photography':'💡 Tips'}
              </button>
            ))}
          </div>

          {/* Itinerary Tab */}
          {activeTab === 'itinerary' && (
            <div>
              {(result.itinerary || []).map((day, i) => (
                <div key={i} className="itinerary-day">
                  <div className="itinerary-day-header">
                    <div className="day-badge">Day {day.day}</div>
                    <div className="day-title">{day.title}</div>
                  </div>
                  <ul className="activity-list">
                    {(day.activities || []).map((a, j) => <li key={j}>{a}</li>)}
                  </ul>
                  <div style={{display:'flex',gap:'24px',marginTop:'12px',paddingTop:'12px',borderTop:'1px solid #F1F5F9'}}>
                    <span style={{fontSize:'12.5px'}}>🏨 <strong>Stay:</strong> {day.stay}</span>
                    <span style={{fontSize:'12.5px'}}>🍽️ <strong>Try:</strong> {day.food}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Cost Tab */}
          {activeTab === 'cost' && result.cost_breakdown && (
            <div className="card">
              <div className="card-title mb-16">Cost Breakdown</div>
              <div className="cost-grid">
                {['travel','stay','food','activities'].map(k => (
                  <div key={k} className="cost-item">
                    <div className="cost-val">{fmt(result.cost_breakdown[k])}</div>
                    <div className="cost-lbl">{k.charAt(0).toUpperCase()+k.slice(1)}</div>
                  </div>
                ))}
                <div className="cost-item">
                  <div className="cost-val" style={{color:'#F97316'}}>{result.cost_breakdown.currency || 'INR'}</div>
                  <div className="cost-lbl">Currency</div>
                </div>
              </div>
              <div className="cost-total">
                <span>Total Estimated Cost</span>
                <strong>{fmt(result.cost_breakdown.total)}</strong>
              </div>
            </div>
          )}

          {/* Hotels Tab */}
          {activeTab === 'hotels' && (
            <div>
              {hotels ? (
                <div style={{display:'flex',flexDirection:'column',gap:'12px'}}>
                  {hotels.map((h, i) => (
                    <div key={i} className="hotel-card">
                      <div style={{flex:1}}>
                        <div className="hotel-name">{h.name}</div>
                        <div className="hotel-rating">⭐ {h.rating}</div>
                        <div className="hotel-amenities">
                          {(h.amenities||[]).map((a,j) => <span key={j} className="amenity">{a}</span>)}
                        </div>
                      </div>
                      <div style={{textAlign:'right'}}>
                        <div className="hotel-price">{fmt(h.price)}<span>/night</span></div>
                        <span className={`badge ${h.type==='Budget'?'badge-green':h.type==='Luxury'?'badge-orange':'badge-blue'}`}>{h.type}</span>
                        <br/>
                        <a href={h.booking_url} target="_blank" rel="noreferrer"
                          style={{fontSize:'12px',color:'#0EA5E9',fontWeight:600,marginTop:'6px',display:'inline-block'}}>
                          Book Now →
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              ) : <div className="loading-box"><div className="spinner"></div><p>Loading hotels...</p></div>}
            </div>
          )}

          {/* Photography Tab */}
          {activeTab === 'photography' && (
            <div className="grid-2">
              <div className="card">
                <div className="card-title">📸 Photography Spots</div>
                <div className="card-sub">Best locations to capture</div>
                <div className="tags-list">
                  {(result.photography_spots || []).map((s, i) => (
                    <div key={i} className="tag">📍 {s}</div>
                  ))}
                </div>
              </div>
              <div className="card">
                <div className="card-title">💎 Hidden Gems</div>
                <div className="card-sub">Offbeat spots not in guidebooks</div>
                <div className="tags-list">
                  {(result.hidden_gems || []).map((g, i) => (
                    <div key={i} className="tag">✨ {g}</div>
                  ))}
                </div>
              </div>
              <div className="card">
                <div className="card-title">🎒 Packing List</div>
                <div className="card-sub">Don't forget these</div>
                <ul className="activity-list">
                  {(result.packing_list || []).map((p, i) => <li key={i}>{p}</li>)}
                </ul>
              </div>
            </div>
          )}

          {/* Tips Tab */}
          {activeTab === 'tips' && (
            <div className="card">
              <div className="card-title">💡 Pro Travel Tips</div>
              <div className="card-sub">Insider advice for this destination</div>
              <ul className="activity-list" style={{gap:'12px'}}>
                {(result.pro_tips || []).map((t, i) => (
                  <li key={i} style={{fontSize:'14px',color:'#1E293B',alignItems:'flex-start'}}>{t}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
