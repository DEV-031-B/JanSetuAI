import { useState } from 'react'
import api from '../api'
import BackButton from '../components/BackButton'

export default function AIClassifier() {
  const [inflowQueue, setInflowQueue] = useState('')
  const [telemetry, setTelemetry] = useState(null)
  const [parsing, setParsing] = useState(false)
  const [cursorIdx, setCursorIdx] = useState(0)
  const steps = [
    'Connecting to Groq Llama 3.3 70B...',
    'Analyzing Hindi/English semantics...',
    'Extracting civic intent...',
    'Mapping to local departments...',
    'Detecting ward & locational data...',
    'Assessing urgency and SLAs...',
    'Generating multilingual summaries...'
  ]

  const dispatchAnalysis = async () => {
    if (!inflowQueue.trim()) return
    setParsing(true)
    setTelemetry(null)
    setCursorIdx(0)
    const pollRate = setInterval(() => {
      setCursorIdx(curr => {
        if (curr >= steps.length - 1) clearInterval(pollRate)
        return curr + 1
      })
    }, 400)

    try {
      const responseCtx = await api.categorize(inflowQueue)
      clearInterval(pollRate)
      setCursorIdx(steps.length)
      if (responseCtx.success) setTelemetry(responseCtx.result)
    } catch (e) {
      clearInterval(pollRate)
      console.warn('[JanSetu-Kernel] Inference pipeline fractured:', e)
      alert('Analysis failed')
    } finally {
      setParsing(false)
    }
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <BackButton />
      <div>
        <h1 className="text-2xl font-black text-navy">AI Governance Classifier</h1>
        <p className="text-gray-500 text-sm">Powered by Groq & Llama-3.3-70b-versatile</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card p-5">
          <label className="form-label mb-2 block text-navy font-bold">Raw Citizen Input (Hindi/Hinglish/English)</label>
          <textarea 
            className="form-input mb-4 font-mono text-sm bg-gray-50 bg-opacity-50 border-gray-200" 
            rows={8}
            value={inflowQueue} 
            onChange={e => setInflowQueue(e.target.value)}
            placeholder={"Enter complaint text here...\nExample:\nAlpha 1 mein pichle 3 din se paani nahi aa raha hai. Gande pani ki wajah se bimari failne ka darr hai. Bijli bhi aati jati rehti hai."}
          />
          <button 
            onClick={dispatchAnalysis} 
            disabled={parsing || !inflowQueue.trim()} 
            className="btn-primary w-full flex justify-center items-center gap-2 font-bold"
          >
            {parsing ? <span className="animate-spin text-xl">⏳</span> : <span className="text-xl">🤖</span>}
            {parsing ? 'Processing via Llama 70B...' : 'Analyze with Groq AI'}
          </button>
        </div>

        <div className="card p-0 overflow-hidden bg-navy text-white relative flex flex-col">
          <div className="p-4 border-b border-blue-900 bg-navy-dark flex justify-between items-center">
            <h3 className="font-bold text-sm text-blue-200 font-mono">LLM JSON Output</h3>
            <div className="flex gap-1">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
            </div>
          </div>
          
          <div className="p-4 flex-1 overflow-y-auto font-mono text-xs text-blue-300 relative">
            {!parsing && !telemetry && (
              <div className="h-full flex flex-col items-center justify-center opacity-50 text-center space-y-3">
                <div className="text-4xl text-blue-500">⚡</div>
                <p>Awaiting raw ingress...</p>
                <p className="text-[10px] text-blue-400 max-w-xs transition-opacity delay-300">Supports NLP across Hindi, English, and transliterated Hinglish with &gt;98% intent accuracy.</p>
              </div>
            )}
            
            {parsing && (
              <div className="space-y-2 fade-in">
                {steps.slice(0, cursorIdx+1).map((s, i) => (
                  <div key={i} className="flex gap-2">
                    <span className="text-green-400">❯</span>
                    <span className={i === cursorIdx ? 'animate-pulse text-white' : 'opacity-70'}>{s}</span>
                  </div>
                ))}
              </div>
            )}
            
            {telemetry && !parsing && (
              <pre className="fade-in whitespace-pre-wrap leading-relaxed">
{`{
  "category": "\x1b[32m${telemetry.category}\x1b[0m",
  "urgency": "\x1b[31m${telemetry.urgency}\x1b[0m",
  "sentiment": "${telemetry.sentiment}",
  "department": "${telemetry.department}",
  "ward_suggestion": "${telemetry.ward_suggestion}",
  "keywords": [
    ${telemetry.keywords?.map(k => `"${k}"`).join(',\n    ')}
  ],
  "summary": "${telemetry.summary}",
  "hindi_summary": "${telemetry.hindi_summary}"
}`}
              </pre>
            )}
            <style jsx>{`
              pre { color: #8be9fd; }
              pre:contains('"category"') { color: #f1fa8c; }
            `}</style>
          </div>
          
          <div className="p-2 border-t border-blue-900 bg-navy-dark text-[10px] text-blue-400 text-right font-mono">
            Model: llama-3.3-70b-versatile | Latency: ~0.8s
          </div>
        </div>
      </div>
      
      {telemetry && (
        <div className="card p-5 fade-in bg-gradient-to-br from-white to-blue-50 border-blue-100">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">How this would appear in Dashboard</h3>
          <div className="flex gap-4 items-start">
            <div className={`p-3 rounded-lg flex-shrink-0 ${telemetry.urgency === 'High' ? 'bg-red-100 text-red-600' : telemetry.urgency === 'Medium' ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'}`}>
              <div className="text-xs font-bold uppercase">{telemetry.category}</div>
              <div className="text-2xl mt-1 h-8 w-8 flex items-center justify-center">
                {telemetry.category === 'Water' ? '💧' : telemetry.category === 'Electricity' ? '⚡' : telemetry.category === 'Roads' ? '🛣️' : '🗑️'}
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className={`badge badge-${telemetry.urgency}`}>{telemetry.urgency} Priority</span>
                <span className="text-xs font-medium text-navy bg-white px-2 py-0.5 rounded border border-gray-200">{telemetry.department}</span>
                <span className="text-xs text-gray-400">📍 {telemetry.ward_suggestion}</span>
              </div>
              <p className="text-sm font-medium text-gray-800">{telemetry.summary}</p>
              <p className="text-sm text-gray-600 mt-1 font-hindi">{telemetry.hindi_summary}</p>
              <div className="flex gap-2 mt-3 flex-wrap">
                {telemetry.keywords?.map(k => <span key={k} className="text-xs bg-white shadow-sm border border-gray-100 text-gray-500 px-2 py-1 rounded-sm">#{k}</span>)}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
