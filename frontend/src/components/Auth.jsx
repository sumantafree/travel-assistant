import { useState } from 'react'
import { login, register } from '../lib/api.js'

export default function Auth({ onLogin }) {
  const [tab, setTab] = useState('login')
  const [form, setForm] = useState({ name:'', email:'', password:'', travel_style:'mid' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  const submit = async e => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = tab === 'login'
        ? await login({ email: form.email, password: form.password })
        : await register(form)
      onLogin(res.data.user, res.data.token)
    } catch (err) {
      if (!err.response) {
        setError('Cannot connect to backend. Run setup.bat first, then start.bat to launch the app.')
      } else {
        setError(err.response?.data?.detail || 'Something went wrong. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-screen">
      <div className="auth-card">
        <div className="auth-logo">
          <div style={{fontSize:'48px',marginBottom:'8px'}}>🌍</div>
          <h1>TravelAI</h1>
          <p>Your AI-powered travel assistant for India</p>
        </div>

        <div className="auth-tabs">
          <button className={`auth-tab ${tab==='login'?'active':''}`} onClick={()=>setTab('login')}>Login</button>
          <button className={`auth-tab ${tab==='register'?'active':''}`} onClick={()=>setTab('register')}>Register</button>
        </div>

        {error && <div className="alert alert-error">⚠️ {error}</div>}

        <form onSubmit={submit}>
          {tab === 'register' && (
            <div className="form-group">
              <label className="form-label">Your Name</label>
              <input className="form-input" placeholder="e.g. Rahul Das" value={form.name} onChange={set('name')} required />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Email</label>
            <input className="form-input" type="email" placeholder="you@example.com" value={form.email} onChange={set('email')} required />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="form-input" type="password" placeholder="••••••••" value={form.password} onChange={set('password')} required />
          </div>

          {tab === 'register' && (
            <div className="form-group">
              <label className="form-label">Travel Style</label>
              <select className="form-select" value={form.travel_style} onChange={set('travel_style')}>
                <option value="budget">Budget (₹500-1000/night)</option>
                <option value="mid">Mid-Range (₹2000-4000/night)</option>
                <option value="luxury">Luxury (₹6000+/night)</option>
              </select>
            </div>
          )}

          <button className="btn btn-primary" style={{width:'100%',marginTop:'8px',padding:'12px'}} type="submit" disabled={loading}>
            {loading ? <><div className="spinner" style={{width:16,height:16,borderWidth:2}}></div> Please wait...</> : tab==='login' ? 'Login' : 'Create Account'}
          </button>
        </form>

        <div style={{marginTop:'20px',padding:'14px',background:'#F0F9FF',borderRadius:'10px',fontSize:'12px',color:'#0369A1'}}>
          <strong>Quick Start:</strong> Register with any email, then add your Anthropic API key in <code>config.env</code>
        </div>
      </div>
    </div>
  )
}
