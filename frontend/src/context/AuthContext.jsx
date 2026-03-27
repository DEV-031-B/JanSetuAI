import { createContext, useContext, useState, useEffect } from 'react'
import api from '../api'

const AuthContext = createContext()

const FALLBACK = [
  { username: 'citizen', password: 'citizen123', role: 'citizen', name: 'Ramesh Kumar', designation: 'Citizen', ward: 'Ward 1 — Sector 12', avatar: '👤' },
  { username: 'admin', password: 'admin123', role: 'admin', name: 'Priya Sharma', designation: 'Ward Administrator', dept: 'Greater Noida Authority', avatar: '👩‍💼' },
  { username: 'leader', password: 'leader123', role: 'leader', name: 'Shri Arun Mishra', designation: 'District Magistrate', dept: 'District Collectorate, Greater Noida', avatar: '🏛️' }
]

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    try {
      const s = localStorage.getItem('jansetu_user')
      if (s) setUser(JSON.parse(s))
    } catch (e) {}
  }, [])

  async function login(username, password) {
    setLoading(true); setError('')
    try {
      const d = await api.login(username, password)
      if (d.success) {
        setUser(d.user)
        localStorage.setItem('jansetu_user', JSON.stringify(d.user))
        localStorage.setItem('jansetu_token', d.token || '')
        setLoading(false)
        return { success: true, role: d.user.role }
      }
      setError(d.error || 'Invalid credentials')
      setLoading(false)
      return { success: false }
    } catch (e) {
      const f = FALLBACK.find(u => u.username === username && u.password === password)
      if (f) {
        const { password: _, ...u } = f
        setUser(u)
        localStorage.setItem('jansetu_user', JSON.stringify(u))
        setLoading(false)
        return { success: true, role: f.role }
      }
      setError('Cannot connect to server')
      setLoading(false)
      return { success: false }
    }
  }

  function logout() {
    setUser(null)
    localStorage.removeItem('jansetu_user')
    localStorage.removeItem('jansetu_token')
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, error, setError, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() { return useContext(AuthContext) }
