import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import IndiaFlagStrip from '../components/IndiaFlagStrip'

const CMP_TABLE = [
  ['Feature',           'CPGRAMS',  'NYC 311', 'JanSetu AI'],
  ['AI Categorization', '❌ None',  '❌ None', '✅ Groq Llama-70B'],
  ['Hindi/Hinglish NLP','❌ None',  '❌ None', '✅ Yes'],
  ['Ward GIS Score',    '❌ None',  '❌ None', '✅ Yes'],
  ['Predictive Escalation','❌ No', '❌ No',   '✅ Auto (48hr)'],
  ['Real-time Dashboard','❌ No',   '✅ Yes',  '✅ 10-sec refresh'],
  ['Avg Resolution',    '⛔ 30+ days','⚠️ 7 days','🎯 2-7 days'],
  ['Satisfaction Rate', '⚠️ 51%',  '75%',     '📈 Live tracked'],
  ['Multilingual Sentiment','❌ No','❌ No',   '✅ Hindi+Hinglish'],
]

const FEATURES = [
  { icon: '🤖', title: 'Groq AI Classifier', desc: 'Instant categorization in Hindi & English using llama-3.3-70b' },
  { icon: '🗺️', title: 'Ward GIS Score™', desc: 'Real-time governance health score per ward (inspired by GRAI)' },
  { icon: '🚨', title: 'Predictive Escalation', desc: 'Auto-escalates if 3+ similar complaints in 48 hours' },
  { icon: '📊', title: 'Executive Intelligence', desc: 'AI-generated weekly brief for District Magistrate' },
  { icon: '🏛️', title: 'CPGRAMS Integration', desc: 'Track your pgportal.gov.in complaint status directly' },
  { icon: '🧠', title: 'Sentiment Engine', desc: 'Analyze Hindi/Hinglish/English public posts ward-wise' },
]

export default function Landing() {
  const navigate = useNavigate()
  const { login } = useAuth()

  async function handleCitizenEntry() {
    await login('citizen', 'citizen123')
    navigate('/submit')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <IndiaFlagStrip withGovBar />

      {/* Hero */}
      <div className="bg-gradient-to-br from-navy to-blue-800 text-white py-16 px-6 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-black mb-3 leading-tight flex items-center justify-center gap-4">
            <img src="https://flagcdn.com/w80/in.png" alt="India" className="h-10 md:h-14 rounded-sm shadow-md" />
            <span>JanSetu AI</span>
            <img src="https://flagcdn.com/w80/in.png" alt="India" className="h-10 md:h-14 rounded-sm shadow-md" />
          </h1>
          <div className="text-xl text-blue-200 mb-2">India ka Civic Intelligence Platform</div>
          <p className="text-blue-300 text-lg mb-2 italic">"What CPGRAMS needs. What India deserves."</p>
          <p className="text-sm text-blue-400 mb-8">Greater Noida, Uttar Pradesh — Presented at Bharat Mandapam by Team ColotiX</p>
          <div className="flex gap-4 justify-center flex-wrap">
            <button onClick={handleCitizenEntry} className="btn-saffron text-base px-8 py-3">
              📝 File Complaint
            </button>
            <button onClick={() => navigate('/login')} className="btn-primary text-base px-8 py-3 bg-white text-navy">
              🔐 Admin Login
            </button>
          </div>
          <div className="mt-8 flex gap-6 justify-center text-center flex-wrap">
            {[
              { n: '22,637', l: 'UP Complaints/Month' },
              { n: '51%', l: 'CPGRAMS Satisfaction' },
              { n: '30+ Days', l: 'Avg Resolution (Govt)' },
              { n: '2-7 Days', l: 'JanSetu Target' },
            ].map(s => (
              <div key={s.l}>
                <div className="text-2xl font-black text-saffron">{s.n}</div>
                <div className="text-xs text-blue-300">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Comparison */}
      <div className="max-w-5xl mx-auto px-6 py-12">
        <h2 className="text-2xl font-bold text-navy text-center mb-2">System Comparison</h2>
        <p className="text-center text-gray-500 text-sm mb-6">JanSetu vs CPGRAMS vs NYC 311</p>
        <div className="overflow-x-auto card">
          <table className="w-full text-sm">
            <thead className="bg-navy text-white">
              <tr>{CMP_TABLE[0].map(h => <th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>)}</tr>
            </thead>
            <tbody>
              {CMP_TABLE.slice(1).map((row, i) => (
                <tr key={i} className={`${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'} border-b border-gray-100`}>
                  {row.map((cell, j) => (
                    <td key={j} className={`px-4 py-3 ${j === 3 ? 'font-semibold text-india-green' : ''}`}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CPGRAMS Crisis Stats */}
      <div className="bg-red-50 border-l-4 border-red-500 max-w-5xl mx-auto mx-6 rounded-xl p-6 mb-10">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-xl font-bold text-red-800 mb-4">🚨 India's Current Grievance Crisis</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { n: '22,637', l: 'UP complaints/month', c: '#dc2626' },
              { n: '1,85,519', l: 'Pending nationally', c: '#d97706' },
              { n: '51%', l: 'Citizen satisfaction', c: '#2563eb' },
              { n: '30+ days', l: 'Avg resolution time', c: '#6b7280' },
            ].map(s => (
              <div key={s.l} className="text-center">
                <div className="text-3xl font-black" style={{ color: s.c }}>{s.n}</div>
                <div className="text-xs text-gray-600 mt-1">{s.l}</div>
              </div>
            ))}
          </div>
          <p className="text-xs text-red-600 mt-4">Source: DARPG CPGRAMS 29th Monthly Report, December 2024</p>
        </div>
      </div>

      {/* Features */}
      <div className="max-w-5xl mx-auto px-6 pb-12">
        <h2 className="text-2xl font-bold text-navy text-center mb-6">Platform Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {FEATURES.map(f => (
            <div key={f.title} className="card p-5">
              <div className="text-3xl mb-3">{f.icon}</div>
              <h3 className="font-bold text-navy mb-1">{f.title}</h3>
              <p className="text-sm text-gray-500">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* How it works */}
      <div className="bg-navy text-white py-12 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">How It Works</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { step: '1', icon: '📝', title: 'File Complaint', desc: 'In Hindi or English' },
              { step: '2', icon: '🤖', title: 'AI Processes', desc: 'Groq categorizes instantly' },
              { step: '3', icon: '📋', title: 'Auto Assigned', desc: 'Correct department gets it' },
              { step: '4', icon: '✅', title: 'Track & Resolve', desc: 'Real-time updates' },
            ].map(s => (
              <div key={s.step}>
                <div className="w-10 h-10 bg-saffron text-white rounded-full flex items-center justify-center font-black mx-auto mb-3">{s.step}</div>
                <div className="text-2xl mb-1">{s.icon}</div>
                <div className="font-semibold text-sm">{s.title}</div>
                <div className="text-blue-300 text-xs mt-1">{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="flag-strip" />
    </div>
  )
}
