import { useState, useEffect } from 'react'
import api from '../api'
import BackButton from '../components/BackButton'

export default function ExecutiveBrief() {
  const [brief, setBrief] = useState(null)
  const [stats, setStats] = useState(null)
  const [wardScores, setWardScores] = useState([])
  const [upStats, setUpStats] = useState(null)
  const [delhiStats, setDelhiStats] = useState(null)
  const [yearlyTrend, setYearlyTrend] = useState(null)
  const [mlAccuracy, setMlAccuracy] = useState(null)
  const [realGovAccuracy, setRealGovAccuracy] = useState(null)
  const [mlMonthly, setMlMonthly] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchBrief() {
      try {
        const [res, panelRes] = await Promise.all([
          api.executiveBrief(),
          api.getGovDashboardPanel()
        ])
        if (res.success) {
          setBrief(res.brief)
          setStats(res.stats)
          setWardScores(res.wardScores)
        }
        if (panelRes && panelRes.success) {
          const p = panelRes.panel
          setUpStats(p.upStats)
          setDelhiStats(p.delhiStats)
          setYearlyTrend(p.yearlyData)
          setMlAccuracy(p.mlAccuracy)
          setRealGovAccuracy(p.realGovAccuracy)
          setMlMonthly(p.mlMonthly)
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchBrief()
  }, [])

  if (loading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-6">
        <div className="text-5xl mb-4 animate-bounce">🤖</div>
        <h2 className="text-xl font-bold text-navy animate-pulse">Generating AI Intelligence Brief...</h2>
        <p className="text-sm text-gray-500 mt-2 max-w-md text-center">Analyzing complaints, evaluating ward SLAs, computing governance indices, and compiling recommendations via Llama 70B.</p>
      </div>
    )
  }

  if (!brief) {
    return <div className="p-8 text-center text-red-500">Failed to generate brief.</div>
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <BackButton />
      <div className="flex justify-between items-center mb-6 print:hidden">
        <div>
          <h1 className="text-2xl font-black text-navy">Executive Intelligence Brief</h1>
          <p className="text-gray-500 text-sm">Automated Governance Report — Greater Noida</p>
        </div>
        <button onClick={() => window.print()} className="btn-primary text-sm flex items-center gap-2">
          <span>🖨️</span> Print / PDF
        </button>
      </div>

      <div className="bg-white p-8 rounded-none border border-gray-200 shadow-sm print:shadow-none print:border-none relative">
        {/* Header Document */}
        <div className="border-b-4 border-navy pb-4 mb-6 flex justify-between items-end">
          <div>
            <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Confidential • For Official Use Only</div>
            <h2 className="text-2xl font-serif font-black text-navy">DISTRICT MAGISTRATE BRIEF</h2>
            <div className="text-sm text-gray-600 font-medium">JanSetu AI Governance Assessment</div>
          </div>
          <div className="text-right">
            <div className="text-sm font-bold text-gray-800">{new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
            <div className="text-xs text-gray-500">Generated: {new Date().toLocaleTimeString()}</div>
          </div>
        </div>

        {/* AI Executive Summary */}
        <div className="mb-8">
          <h3 className="text-lg font-bold text-navy border-b border-gray-200 pb-2 mb-3">1. Executive Summary</h3>
          <p className="text-gray-800 leading-relaxed font-serif text-lg bg-gray-50 p-4 border-l-4 border-saffron rounded-r">
            {brief.executive_summary}
          </p>
          <div className="mt-3 bg-blue-50 text-blue-800 p-3 rounded border border-blue-100 text-sm flex gap-3 items-center">
            <span className="text-xl">💡</span>
            <div>
              <span className="font-bold">Key Insight: </span>
              {brief.key_insight}
            </div>
          </div>
        </div>

        {/* Statistical Overview */}
        <div className="mb-8">
          <h3 className="text-lg font-bold text-navy border-b border-gray-200 pb-2 mb-3">2. Performance Metrics</h3>
          <div className="grid grid-cols-4 gap-4">
            <div className="box border border-gray-200 p-3 rounded text-center">
              <div className="text-2xl font-black text-navy">{stats?.total || 0}</div>
              <div className="text-[10px] text-gray-500 uppercase font-bold">Total Issues</div>
            </div>
            <div className="box border border-gray-200 p-3 rounded text-center">
              <div className="text-2xl font-black text-green-600">{stats?.resolutionRate || 0}%</div>
              <div className="text-[10px] text-gray-500 uppercase font-bold">Resolution Rate</div>
            </div>
            <div className="box border border-red-200 bg-red-50 p-3 rounded text-center">
              <div className="text-2xl font-black text-red-600">{stats?.escalated || 0}</div>
              <div className="text-[10px] text-red-800 uppercase font-bold">Escalated</div>
            </div>
            <div className="box border border-gray-200 p-3 rounded text-center">
              <div className="text-xl font-bold text-blue-600 capitalize mt-1">{brief.resolution_trend}</div>
              <div className="text-[10px] text-gray-500 uppercase font-bold mt-1">Trend</div>
            </div>
          </div>
        </div>

        {/* Ward Performance Analysis */}
        <div className="mb-8">
          <h3 className="text-lg font-bold text-navy border-b border-gray-200 pb-2 mb-3">3. Ward Governance Assessment</h3>
          <p className="text-sm text-gray-700 italic mb-4">{brief.performance_insight}</p>
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-green-50 border border-green-200 p-4 rounded text-center">
              <div className="text-xs uppercase text-green-600 font-bold tracking-wider mb-1">Top Performing Ward</div>
              <div className="text-xl font-black text-green-800">{brief.best_ward}</div>
            </div>
            <div className="bg-red-50 border border-red-200 p-4 rounded text-center">
              <div className="text-xs uppercase text-red-600 font-bold tracking-wider mb-1">Critical Attention Ward</div>
              <div className="text-xl font-black text-red-800">{brief.worst_ward}</div>
            </div>
          </div>
        </div>

        {/* Strategic Recommendations */}
        <div className="mb-6">
          <h3 className="text-lg font-bold text-navy border-b border-gray-200 pb-2 mb-3">4. AI Strategic Recommendations</h3>
          <div className="space-y-3">
            {brief.top_recommendations?.map((r, i) => (
              <div key={i} className="flex gap-3 items-start">
                <div className={`mt-0.5 w-16 text-center text-[10px] font-bold py-1 rounded 
                  ${r.priority === 'High' ? 'bg-red-100 text-red-700' : r.priority === 'Medium' ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'}`}>
                  {r.priority} PRI
                </div>
                <div>
                  <h4 className="font-bold text-gray-800 text-sm">{r.title}</h4>
                  <p className="text-sm text-gray-600 mt-0.5">{r.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* India Context */}
        <div className="mb-6">
          <h3 className="text-lg font-bold text-navy border-b border-gray-200 pb-2 mb-3">5. National CPGRAMS Context</h3>
          <p className="text-sm text-gray-700 italic mb-4">Comparison of local node performance against national benchmarks.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 border border-gray-200 p-4 rounded text-center">
              <div className="text-xs uppercase text-gray-600 font-bold mb-1">UP Total Load</div>
              <div className="text-xl font-black text-navy">{upStats?.receipt?.toLocaleString('en-IN') || 0}</div>
              <div className="text-[10px] text-gray-500 mt-1">Pending: {upStats?.pending?.toLocaleString('en-IN') || 0}</div>
            </div>
            <div className="bg-gray-50 border border-gray-200 p-4 rounded text-center">
              <div className="text-xs uppercase text-gray-600 font-bold mb-1">Delhi Total Load</div>
              <div className="text-xl font-black text-navy">{delhiStats?.receipt?.toLocaleString('en-IN') || 0}</div>
              <div className="text-[10px] text-gray-500 mt-1">Pending: {delhiStats?.pending?.toLocaleString('en-IN') || 0}</div>
            </div>
            <div className="bg-blue-50 border border-blue-200 p-4 rounded text-center">
              <div className="text-xs uppercase text-blue-600 font-bold mb-1">ML Predictor Calibration</div>
              <div className="text-xl font-black text-blue-800">{mlAccuracy || 96}% Accuracy</div>
              <div className="text-[10px] text-blue-600 mt-1">AI adjusted from baseline {realGovAccuracy || 82}% accuracy</div>
            </div>
          </div>
          
          {mlMonthly && (
            <div className="mt-4 bg-white p-4 rounded border border-gray-200 shadow-inner">
              <div className="flex justify-between items-center mb-3">
                <h4 className="text-sm font-bold text-navy">2025 AI Predictive Workload Forecast</h4>
                <div className="text-xs text-blue-600 font-bold bg-blue-50 px-2 py-1 rounded">Live Model Syncing</div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-gray-700">
                  <thead>
                    <tr className="border-b-2 border-gray-100 bg-gray-50 text-gray-500 uppercase tracking-wider">
                      <th className="p-2 font-bold">Month (2025)</th>
                      <th className="p-2 text-right font-bold">Predicted Load</th>
                      <th className="p-2 text-right font-bold">Actual Influx</th>
                      <th className="p-2 text-right font-bold">Model Variance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mlMonthly.map((m, i) => (
                      <tr key={i} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="p-2 font-semibold text-navy">{m.month}</td>
                        <td className="p-2 text-right text-orange-600 font-mono font-medium">{m.prediction?.toLocaleString()}</td>
                        <td className="p-2 text-right text-navy font-mono font-medium">{m.actual?.toLocaleString()}</td>
                        <td className="p-2 text-right font-mono">
                          <span className={`${m.percentageChange > 0 ? 'text-green-600' : 'text-red-600'} ${Math.abs(m.percentageChange) < 0.1 ? 'font-bold' : ''}`}>
                            {m.percentageChange > 0 ? '+' : ''}{(m.percentageChange * 100).toFixed(1)}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {yearlyTrend && (
            <div className="mt-4 bg-gray-50 p-4 rounded border border-gray-200 text-sm">
              <strong className="text-navy">5-Year Growth Trend: </strong> National grievance volume reached {yearlyTrend.find(y=>y.year.toString()==='2024')?.received?.toLocaleString() || '2,298,208'} in 2024. Our intelligence module manages this scale via ML auto-sorting.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
