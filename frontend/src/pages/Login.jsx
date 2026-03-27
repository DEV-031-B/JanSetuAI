import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import IndiaFlagStrip from '../components/IndiaFlagStrip'
import BackButton from '../components/BackButton'

const QUICK_LOGINS = [
  { label: '👤 Citizen Login', username: 'citizen', password: 'citizen123', color: 'bg-blue-600', desc: 'File & track complaints' },
  { label: '👩‍💼 Ward Administrator', username: 'admin', password: 'admin123', color: 'bg-navy', desc: 'Manage all complaints' },
  { label: '🏛️ District Magistrate', username: 'leader', password: 'leader123', color: 'bg-india-blue', desc: 'Executive intelligence' },
]

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const { login, error, loading } = useAuth()
  const navigate = useNavigate()

  async function handleLogin(e) {
    e.preventDefault()
    const res = await login(username, password)
    if (res.success) {
      const dest = res.role === 'citizen' ? '/submit' : '/dashboard'
      navigate(dest)
    }
  }

  async function quickLogin(u, p) {
    const res = await login(u, p)
    if (res.success) {
      const dest = res.role === 'citizen' ? '/submit' : '/dashboard'
      navigate(dest)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 relative overflow-hidden flex flex-col">
      {/* State Emblem Background Watermark */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden opacity-10 md:opacity-15 flex justify-center md:justify-between items-center md:px-8 lg:px-16">
        <img 
          src="https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg" 
          alt="Ashoka Emblem Primary" 
          className="h-[50vh] md:h-[70vh] lg:h-[80vh] w-auto grayscale mix-blend-multiply object-contain transition-all duration-500 ease-in-out"
        />
        <img 
          src="https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg" 
          alt="Ashoka Emblem Secondary" 
          className="hidden md:block h-[70vh] lg:h-[80vh] w-auto grayscale mix-blend-multiply object-contain transition-all duration-500 ease-in-out"
        />
      </div>

      <div className="relative z-10 w-full flex-1 flex flex-col">
        <IndiaFlagStrip withGovBar />
        
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 relative">
          
          <div className="w-full max-w-md">
            {/* Nav Back mechanism placed cleanly in flow */}
            <div className="flex justify-start mb-6">
              <BackButton />
            </div>

            <div className="text-center mb-8">
              <div className="text-5xl mb-3">🇮🇳</div>
            <h1 className="text-3xl font-black text-navy">JanSetu AI</h1>
            <p className="text-gray-500 text-sm mt-1">Civic Intelligence Platform — Greater Noida</p>
          </div>

          {/* Quick login */}
          <div className="card p-5 mb-5">
            <h3 className="text-sm font-bold text-gray-600 mb-3 uppercase tracking-wider">Quick Login</h3>
            <div className="space-y-2">
              {QUICK_LOGINS.map(q => (
                <button key={q.username} onClick={() => quickLogin(q.username, q.password)}
                  disabled={loading}
                  className={`w-full ${q.color} text-white rounded-lg py-3 px-4 text-left flex items-center justify-between hover:opacity-90 transition-opacity`}>
                  <div>
                    <div className="font-semibold text-sm">{q.label}</div>
                    <div className="text-xs opacity-70">{q.desc}</div>
                  </div>
                  <span className="text-white opacity-60">→</span>
                </button>
              ))}
            </div>
          </div>

          {/* Manual login */}
          <div className="card p-5">
            <h3 className="text-sm font-bold text-gray-600 mb-3 uppercase tracking-wider">Manual Login</h3>
            <form onSubmit={handleLogin} className="space-y-3">
              {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm">{error}</div>}
              <div>
                <label className="form-label">Username</label>
                <input className="form-input" value={username} onChange={e => setUsername(e.target.value)}
                  placeholder="citizen / admin / leader" />
              </div>
              <div>
                <label className="form-label">Password</label>
                <input className="form-input" type="password" value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••••" />
              </div>
              <button type="submit" className="btn-primary w-full" disabled={loading}>
                {loading ? <span className="animate-pulse">Logging in...</span> : '🔐 Login'}
              </button>
            </form>
          </div>
          <p className="text-center text-xs text-gray-400 mt-4 font-medium tracking-wide">JanSetu AI v2.0 — Team ColotiX | Bharat Mandapam</p>
        </div>
      </div>
      </div>
    </div>
  )
}
