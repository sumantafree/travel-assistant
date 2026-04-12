import { useState, useEffect } from 'react'
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'
import Auth from './components/Auth.jsx'
import Dashboard from './components/Dashboard.jsx'
import PlanTrip from './components/PlanTrip.jsx'
import RoutePlanner from './components/RoutePlanner.jsx'
import BlogGenerator from './components/BlogGenerator.jsx'
import MyTrips from './components/MyTrips.jsx'
import ChatBot from './components/ChatBot.jsx'
import { getMe } from './lib/api.js'

function Sidebar({ user, onLogout }) {
  const navigate = useNavigate()
  const { pathname } = useLocation()

  const nav = [
    { path: '/dashboard',  icon: '🏠', label: 'Dashboard' },
    { path: '/plan',       icon: '✈️',  label: 'Plan Trip' },
    { path: '/route',      icon: '🗺️', label: 'Route Planner' },
    { path: '/blog',       icon: '✍️',  label: 'Blog Generator' },
    { path: '/my-trips',   icon: '📁', label: 'My Trips' },
    { path: '/chat',       icon: '💬', label: 'Travel Chat' },
  ]

  const initials = user?.name ? user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0,2) : 'U'

  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        <h2>🌍 TravelAI</h2>
        <span>AI Travel Assistant</span>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section-label">Navigation</div>
        {nav.map(item => (
          <button
            key={item.path}
            className={`nav-item ${pathname === item.path ? 'active' : ''}`}
            onClick={() => navigate(item.path)}
          >
            <span className="nav-icon">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>

      <div className="sidebar-bottom">
        <div className="user-chip">
          <div className="user-avatar">{initials}</div>
          <div>
            <div className="user-name">{user?.name || 'Traveller'}</div>
            <div className="user-email">{user?.travel_style || 'mid'} budget</div>
          </div>
        </div>
        <button className="btn btn-outline btn-sm" style={{width:'100%'}} onClick={onLogout}>
          Logout
        </button>
      </div>
    </div>
  )
}

export default function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('travel_token')
    if (token) {
      getMe().then(r => setUser(r.data)).catch(() => {
        localStorage.removeItem('travel_token')
      }).finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const handleLogin = (userData, token) => {
    localStorage.setItem('travel_token', token)
    setUser(userData)
  }

  const handleLogout = () => {
    localStorage.removeItem('travel_token')
    setUser(null)
  }

  if (loading) return (
    <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100vh',background:'#F0F9FF'}}>
      <div style={{textAlign:'center'}}>
        <div className="spinner" style={{margin:'0 auto 14px'}}></div>
        <p style={{color:'#64748B',fontSize:'13px'}}>Loading TravelAI...</p>
      </div>
    </div>
  )

  if (!user) return <Auth onLogin={handleLogin} />

  return (
    <div className="app-shell">
      <Sidebar user={user} onLogout={handleLogout} />
      <div className="main-content">
        <Routes>
          <Route path="/"          element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard user={user} />} />
          <Route path="/plan"      element={<PlanTrip />} />
          <Route path="/route"     element={<RoutePlanner />} />
          <Route path="/blog"      element={<BlogGenerator />} />
          <Route path="/my-trips"  element={<MyTrips />} />
          <Route path="/chat"      element={<ChatBot />} />
          <Route path="*"          element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </div>
    </div>
  )
}
