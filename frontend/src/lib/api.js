import axios from 'axios'

const BASE = import.meta.env.VITE_API_URL || '/api'

const api = axios.create({ baseURL: BASE })

// Attach token to every request
api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('travel_token')
  if (token) cfg.headers.Authorization = `Bearer ${token}`
  return cfg
})

// Auth
export const register = (data)  => api.post('/register', data)
export const login    = (data)  => api.post('/login', data)
export const getMe    = ()      => api.get('/me')

// Trip
export const planTrip    = (query, save=false) => api.post('/plan',      { text: query, query, save })
export const getMyTrips  = ()                  => api.get('/my-trips')
export const deleteTrip  = (id)                => api.delete(`/trips/${id}`)

// Blog
export const generateBlog  = (destination, trip_details='', save=false) =>
  api.post('/blog', { destination, trip_details, save })
export const getMyBlogs    = () => api.get('/my-blogs')

// Route
export const planRoute = (origin, destination, vehicle='car') =>
  api.post('/route', { origin, destination, vehicle })

// Hotels
export const searchHotels = (destination, budget_type='all') =>
  api.post('/hotels', { destination, budget_type })

// Chat
export const chat = (message, context='') =>
  api.post('/chat', { message, context })

// Dashboard
export const getDashboard = () => api.get('/dashboard')
