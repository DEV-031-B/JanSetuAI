import { useState, useEffect } from 'react'
import api from '../api'
import BackButton from '../components/BackButton'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'

export default function SentimentEngine() {
  const [reports, setReports] = useState([])
  const [posts, setPosts] = useState('')
  const SECTORS = ['Alpha 1', 'Beta 2', 'Knowledge Park', 'Sector 12', 'Sector 50', 'Sector 62']
  const [ward, setWard] = useState(SECTORS[0])
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)

  async function loadData() {
    try {
      const data = await api.getSentimentReports()
      setReports(data)
    } catch (err) {
      console.error(err)
    } finally {
      setInitialLoading(false)
    }
  }

  useEffect(() => {
    loadData()
    const int = setInterval(loadData, 10000)
    return () => clearInterval(int)
  }, [])

  const handleAnalyze = async () => {
    if (!posts.trim()) return
    setLoading(true)
    try {
      const postArray = posts.split('\n').filter(p => p.trim())
      await api.analyzeSentiment(postArray, ward)
      setPosts('')
      loadData()
    } catch (err) {
      alert('Failed to analyze sentiment')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <BackButton />
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-black text-navy border-b-2 border-saffron inline-block pb-1">Sentiment Engine</h1>
          <p className="text-gray-500 text-sm mt-2">Multilingual Political & Governance Sentiment Analysis</p>
        </div>
        <div className="text-xs bg-white px-3 py-1 border border-gray-200 rounded text-gray-500 italic">
          Supports: Hindi (Devanagari), Hinglish, English
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Analysis Form */}
        <div className="card p-5 lg:col-span-1 h-fit">
          <h2 className="font-bold text-navy mb-4 border-b pb-2">New Analysis</h2>
          <div className="space-y-4">
            <div>
              <label className="form-label">Select Ward</label>
              <select className="form-input" value={ward} onChange={e => setWard(e.target.value)}>
                {SECTORS.map(s => <option key={s} value={s}>{s} (Greater Noida/NCR)</option>)}
              </select>
            </div>
            <div>
              <label className="form-label">Social Media Posts (one per line)</label>
              <textarea 
                className="form-input" rows={8} value={posts} onChange={e => setPosts(e.target.value)}
                placeholder={"Write posts here...\nSample:\nRoad bahut kharab hai\nNo water for 2 days\nकचरा नहीं उठाया गया"}
              />
            </div>
            <button onClick={handleAnalyze} disabled={loading || !posts.trim()} className="btn-primary w-full">
              {loading ? 'Analyzing with AI...' : 'Analyze Sentiment'}
            </button>
          </div>
        </div>

        {/* Reports Feed */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="font-bold text-navy mb-2">Recent Sentiment Reports</h2>
          
          {initialLoading ? (
            <div className="animate-pulse text-center p-8 text-navy">Loading reports...</div>
          ) : reports.length === 0 ? (
            <div className="card p-8 text-center text-gray-500">No reports generated yet.</div>
          ) : reports.map(r => (
            <div key={r._id} className={`card p-5 border-l-4 ${r.result?.overall_sentiment === 'negative' ? 'border-red-500' : r.result?.overall_sentiment === 'positive' ? 'border-green-500' : 'border-orange-400'}`}>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-lg text-navy">{r.ward}</h3>
                  <p className="text-xs text-gray-500">{new Date(r.createdAt).toLocaleString()} • {r.postsAnalyzed} Posts Analyzed</p>
                </div>
                <div className={`text-2xl font-black ${r.result?.score >= 60 ? 'text-green-600' : r.result?.score <= 40 ? 'text-red-600' : 'text-orange-500'}`}>
                  {r.result?.score}/100
                </div>
              </div>

              <div className="bg-gray-50 p-3 rounded mb-4 text-sm text-gray-700 italic border-l-2 border-gray-300">
                "{r.result?.ward_mood}"
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Top Issues Identified</h4>
                  <ul className="text-sm space-y-1">
                    {r.result?.top_issues?.map((issue, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <span className="text-red-500">•</span> {issue}
                      </li>
                    ))}
                  </ul>
                </div>
                
                {r.result?.language_breakdown && (
                  <div>
                    <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Language Breakdown</h4>
                    <div className="h-24 w-full relative -ml-4">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={[
                            { name: 'Hindi', value: r.result.language_breakdown.hindi },
                            { name: 'English', value: r.result.language_breakdown.english },
                            { name: 'Hinglish', value: r.result.language_breakdown.hinglish }
                          ]} dataKey="value" cx="50%" cy="50%" outerRadius={35} innerRadius={20}>
                            <Cell fill="#FF9933" /> {/* Hindi Saffron */}
                            <Cell fill="#1e3a5f" /> {/* English Navy */}
                            <Cell fill="#138808" /> {/* Hinglish Green */}
                          </Pie>
                          <Tooltip contentStyle={{ fontSize: '12px', padding: '4px' }}/>
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="absolute top-1/2 right-0 -translate-y-1/2 text-[10px] text-gray-500 space-y-1">
                        <div className="flex items-center gap-1"><div className="w-2 h-2 bg-saffron rounded"></div> HI ({r.result.language_breakdown.hindi}%)</div>
                        <div className="flex items-center gap-1"><div className="w-2 h-2 bg-navy rounded"></div> EN ({r.result.language_breakdown.english}%)</div>
                        <div className="flex items-center gap-1"><div className="w-2 h-2 bg-india-green rounded"></div> HN ({r.result.language_breakdown.hinglish}%)</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {r.result?.alert && (
                <div className="mt-4 bg-red-50 text-red-700 p-2 rounded text-xs font-bold flex gap-2 items-center">
                  <span className="text-lg">🚨</span> {r.result.recommended_action}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
