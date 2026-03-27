import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useLang } from '../context/LangContext'
import api from '../api'
import BackButton from '../components/BackButton'

const CATEGORIES = ['Water', 'Roads', 'Electricity', 'Garbage', 'Other']
const URGENCY_LEVELS = ['High', 'Medium', 'Low']

export default function CitizenPortal() {
  const { user } = useAuth()
  const { lang } = useLang()
  const isHi = lang === 'hi'
  
  const [step, setStep] = useState(1)
  const [listening, setListening] = useState(false)
  const [formData, setFormData] = useState({
    serviceType: 'Other',
    description: '',
    address: user?.ward || '',
    ward: user?.ward || '',
    citizenName: user?.name || '',
    citizenPhone: '',
    urgency: 'Medium'
  })
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [cpgramsId, setCpgramsId] = useState('')
  const [trackResult, setTrackResult] = useState(null)

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition || window.mozSpeechRecognition || window.msSpeechRecognition
    if (!SpeechRecognition) {
      alert(isHi ? 'आपका ब्राउज़र माइक सपोर्ट नहीं करता।' : 'Browser does not support Speech API.')
      return
    }
    const recognition = new SpeechRecognition()
    recognition.lang = isHi ? 'hi-IN' : 'en-IN'
    recognition.interimResults = false
    recognition.onstart = () => setListening(true)
    recognition.onresult = (e) => {
      const transcript = e.results[0][0].transcript
      setFormData(f => ({ ...f, description: f.description ? f.description + ' ' + transcript : transcript }))
    }
    recognition.onerror = () => setListening(false)
    recognition.onend = () => setListening(false)
    recognition.start()
  }

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await api.submitComplaint(formData)
      if (res.success) {
        setResult(res)
        setStep(4)
      }
    } catch (err) {
      console.error(err)
      alert('Failed to submit complaint')
    } finally {
      setLoading(false)
    }
  }

  const handleTrack = async () => {
    if (!cpgramsId) return
    try {
      const res = await api.trackCPGRAMS(cpgramsId)
      setTrackResult(res)
    } catch (err) {
      alert('Failed to track CPGRAMS')
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <BackButton />
      <h1 className="text-2xl font-black text-navy mb-1">{isHi ? 'नागरिक पोर्टल' : 'Citizen Portal'}</h1>
      <p className="text-gray-500 text-sm mb-6">{isHi ? 'सरकारी शिकायतें दर्ज करें और ट्रैक करें' : 'File civic complaints and track resolution'}</p>

      {/* JanSetu Complaint Form */}
      <div className="card p-6 relative">
        <h2 className="text-lg font-bold text-navy mb-4 border-b pb-2">{isHi ? 'नई शिकायत दर्ज करें' : 'File New Complaint'}</h2>
        
        {step < 4 ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            {step === 1 && (
              <div className="space-y-4 fade-in">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="form-label mb-0">{isHi ? 'विवरण (बोल कर या टाइप करें)' : 'Describe the issue (Speak or Type)'}</label>
                    <button type="button" onClick={startListening} className={`p-1.5 rounded-full ${listening ? 'bg-red-100 text-red-600 animate-pulse ring-2 ring-red-400' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'} transition-all`} title="Voice Typing">
                      🎤
                    </button>
                  </div>
                  <textarea name="description" value={formData.description} onChange={handleChange} required rows={4} className="form-input text-lg" placeholder={isHi ? "उदाहरण: सेक्टर 12 में पानी नहीं आ रहा है..." : "e.g., Sector 12 mein paani nahi aa raha hai..."} />
                </div>
                <button type="button" onClick={() => setStep(2)} disabled={!formData.description} className="btn-primary w-full">{isHi ? 'आगे बढ़ें →' : 'Next →'}</button>
              </div>
            )}
            
            {step === 2 && (
              <div className="space-y-4 fade-in">
                <div>
                  <label className="form-label">Category (AI will auto-correct later if needed)</label>
                  <select name="serviceType" value={formData.serviceType} onChange={handleChange} className="form-input">
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="form-label">Urgency</label>
                  <select name="urgency" value={formData.urgency} onChange={handleChange} className="form-input">
                    {URGENCY_LEVELS.map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
                <div className="flex gap-3">
                  <button type="button" onClick={() => setStep(1)} className="px-4 py-2 border rounded-lg hover:bg-gray-50 flex-1">Back</button>
                  <button type="button" onClick={() => setStep(3)} className="btn-primary flex-1">Next →</button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4 fade-in">
                <div>
                  <label className="form-label">Address</label>
                  <input name="address" value={formData.address} onChange={handleChange} required className="form-input" placeholder="Full address" />
                </div>
                <div>
                  <label className="form-label">Ward</label>
                  <input name="ward" value={formData.ward} onChange={handleChange} required className="form-input" placeholder="e.g., Ward 1 — Sector 12" />
                </div>
                <div>
                  <label className="form-label">Your Phone</label>
                  <input name="citizenPhone" value={formData.citizenPhone} onChange={handleChange} className="form-input" placeholder="10-digit mobile" />
                </div>
                <div className="flex gap-3 mt-6">
                  <button type="button" onClick={() => setStep(2)} className="px-4 py-2 border rounded-lg hover:bg-gray-50 flex-1">Back</button>
                  <button type="submit" disabled={loading} className="btn-saffron flex-1">
                    {loading ? 'Submitting...' : 'Submit Complaint ✓'}
                  </button>
                </div>
              </div>
            )}
          </form>
        ) : (
          <div className="fade-in space-y-4">
            <div className="bg-green-50 border border-green-200 text-green-800 p-4 rounded-lg flex items-start gap-3">
              <span className="text-2xl">✅</span>
              <div>
                <h3 className="font-bold">Complaint Submitted Successfully</h3>
                <p className="text-sm mt-1">ID: <span className="font-mono bg-white px-2 py-0.5 rounded border border-green-300">{result?.serviceRequestId}</span></p>
                <div className="mt-3 text-sm flex items-center gap-2">
                  <span className="badge badge-pending">Status: Pending</span>
                  <span className="text-gray-600">•</span>
                  <span className="text-gray-600">Expected Resolution: <b>{result?.complaint?.predictedResolutionDays || 7} Days</b></span>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg">
              <h4 className="text-xs font-bold text-blue-800 uppercase tracking-wider mb-2">Groq AI Analysis Applied</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div><span className="text-gray-500 text-xs block">Category</span> <span className="font-medium">{result?.aiResult?.category}</span></div>
                <div><span className="text-gray-500 text-xs block">Urgency</span> <span className={`badge badge-${result?.aiResult?.urgency}`}>{result?.aiResult?.urgency}</span></div>
                <div className="col-span-2 mt-1">
                  <span className="text-gray-500 text-xs block">Summary (Hindi)</span>
                  <span className="text-gray-800 text-sm">{result?.aiResult?.hindi_summary}</span>
                </div>
              </div>
            </div>
            
            <button onClick={() => { setStep(1); setFormData({...formData, description: ''}); setResult(null) }} className="btn-primary w-full mt-4 text-sm py-2">
              {isHi ? 'दूसरी शिकायत दर्ज करें' : 'File Another Complaint'}
            </button>

            {/* Simulated Mobile SMS Push Notification */}
            <div className="fixed top-6 right-6 bg-white/95 backdrop-blur-md shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-3xl p-4 w-80 border border-gray-100 z-50 transition-all duration-500 ease-out transform translate-y-0 opacity-100">
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center text-white text-2xl shadow-inner mt-1">
                  💬
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-0.5">
                    <span className="font-bold text-gray-900 text-sm tracking-tight">JanSetu Alert</span>
                    <span className="text-gray-400 text-xs font-medium">now</span>
                  </div>
                  <p className="text-gray-600 text-[13px] leading-tight font-medium">
                    {isHi 
                      ? `आपकी शिकायत (ID: ${result?.serviceRequestId?.slice(-4)}) दर्ज हो गई है। AI ने इसे '${result?.aiResult?.department}' विभाग को भेज दिया है।`
                      : `Complaint (ID: ${result?.serviceRequestId?.slice(-4)}) registered cleanly. AI routed it functionally to the '${result?.aiResult?.department}' sector.`
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* CPGRAMS Tracker */}
      <div className="card p-6">
        <div className="flex items-center gap-2 mb-4 border-b pb-2">
          <span className="text-xl">🏛️</span>
          <h2 className="text-lg font-bold text-navy">National CPGRAMS Tracker</h2>
        </div>
        <p className="text-xs text-gray-500 mb-4">Track complaints filed on pgportal.gov.in directly from JanSetu AI.</p>
        
        <div className="flex gap-2">
          <input 
            value={cpgramsId} onChange={e => setCpgramsId(e.target.value)}
            className="form-input flex-1" placeholder="Enter Registration No. (e.g. DARPG/E/2024/00001)" 
          />
          <button onClick={handleTrack} className="bg-navy text-white px-4 rounded-lg font-medium hover:bg-blue-800 transition-colors whitespace-nowrap">
            Track Status
          </button>
        </div>

        {trackResult && (
          <div className="mt-4 bg-gray-50 border border-gray-200 p-4 rounded-lg fade-in">
            <h4 className="font-semibold text-gray-800">Status: {trackResult.status}</h4>
            <p className="text-sm text-gray-600 mt-1">Department: {trackResult.department}</p>
            {trackResult.message && <p className="text-xs text-red-600 mt-2">{trackResult.message}</p>}
            {trackResult.portalUrl && (
              <a href={trackResult.portalUrl} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline block mt-2">
                Open in PG Portal →
              </a>
            )}
          </div>
        )}

        <div className="mt-4 pt-4 border-t border-gray-100 text-center">
          <p className="text-xs text-gray-500 mb-2">For official national record, you can also file directly on CPGRAMS.</p>
          <a href="https://pgportal.gov.in" target="_blank" rel="noreferrer" className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors border border-blue-200 rounded px-3 py-1.5 inline-block bg-blue-50">
            Open CPGRAMS Portal →
          </a>
        </div>
      </div>
    </div>
  )
}
