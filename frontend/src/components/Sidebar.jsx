import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useLang } from '../context/LangContext'

const NAV_ADMIN = [
  { icon: '📊', label: 'Dashboard', path: '/dashboard' },
  { icon: '📋', label: 'Complaints', path: '/complaints' },
  { icon: '🤖', label: 'AI Classifier', path: '/classifier' },
  { icon: '🚨', label: 'Escalations', path: '/escalations' },
  { icon: '👷', label: 'Workers', path: '/workers' },
  { icon: '🧠', label: 'Sentiment', path: '/sentiment' }
]

const NAV_CITIZEN = [
  { icon: '📝', label: 'File Complaint', path: '/submit' },
  { icon: '🤖', label: 'AI Classifier', path: '/classifier' },
]

const NAV_LEADER = [
  { icon: '📊', label: 'Dashboard', path: '/dashboard' },
  { icon: '🤖', label: 'AI Classifier', path: '/classifier' },
  { icon: '🚨', label: 'Escalations', path: '/escalations' },
  { icon: '📰', label: 'Executive Brief', path: '/brief' },
  { icon: '👷', label: 'Workers', path: '/workers' },
  { icon: '🧠', label: 'Sentiment', path: '/sentiment' },
]

export default function Sidebar({ isOpen, setIsOpen }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const { lang, toggleLang } = useLang()

  const navItems = user?.role === 'citizen' ? NAV_CITIZEN : user?.role === 'leader' ? NAV_LEADER : NAV_ADMIN

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-40 md:hidden fade-in"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Drawer */}
      <div className={`sidebar fixed inset-y-0 left-0 z-50 w-64 flex-shrink-0 flex flex-col transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* Logo */}
      <div className="p-5 border-b border-blue-800">
        <div className="text-2xl font-black text-white tracking-tight">JanSetu AI</div>
        <div className="text-xs text-blue-300 mt-0.5">Civic Intelligence v2.0</div>
        <div className="text-xs text-blue-400 mt-1">🇮🇳 Greater Noida, UP</div>
      </div>

      {/* User info */}
      <div className="p-4 border-b border-blue-800 flex items-center gap-3">
        <div className="text-2xl">{user?.avatar || '👤'}</div>
        <div>
          <div className="text-white text-sm font-semibold">{user?.name}</div>
          <div className="text-blue-300 text-xs">{user?.designation}</div>
          {user?.ward && <div className="text-blue-400 text-xs mt-0.5">{user.ward}</div>}
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map(item => (
          <button
            key={item.path + item.label}
            onClick={() => {
              navigate(item.path)
              setIsOpen(false)
            }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all
              ${location.pathname === item.path
                ? 'bg-blue-600 text-white'
                : 'text-blue-200 hover:bg-blue-800 hover:text-white'
              }`}
          >
            <span className="text-base">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>

      {/* Bottom */}
      <div className="p-4 border-t border-blue-800 space-y-2">
        <button onClick={toggleLang} className="w-full flex items-center justify-center gap-2 bg-blue-800 bg-opacity-50 hover:bg-opacity-100 border border-blue-700 rounded py-1.5 text-xs text-blue-200 transition-colors">
          {lang === 'hi' ? '🌐 अ Hindi' : '🌐 A English'}
        </button>
        <a href="https://pgportal.gov.in" target="_blank" rel="noreferrer"
          className="block text-center text-xs text-blue-300 hover:text-saffron transition-colors py-1">
          🔗 CPGRAMS Portal
        </a>
        <button onClick={logout}
          className="w-full text-center text-xs text-red-300 hover:text-red-100 transition-colors py-1">
          🚪 Logout
        </button>
      </div>
    </div>
    </>
  )
}
