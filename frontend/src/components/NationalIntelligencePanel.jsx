import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function NationalIntelligencePanel({ upStats, delhiStats, jansetuCount, yearlyTrend }) {
  if (!upStats || !delhiStats || !yearlyTrend) return null

  // 2024 total from yearlyTrend
  const total2024 = yearlyTrend.find(y => y.year.toString() === '2024')?.received || 2298208

  return (
    <div className="card p-5 mt-6 border-l-4 border-india-green bg-gradient-to-br from-white to-green-50">
      <div className="flex items-center gap-3 mb-4">
        <span className="text-2xl">🏛️</span>
        <div>
          <h2 className="text-xl font-bold text-navy">National Grievance Intelligence</h2>
          <p className="text-xs text-gray-500">Real DARPG / CPGRAMS Data Integration</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Core Stats */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white rounded-lg p-3 border border-gray-100 shadow-sm">
            <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">India Total (2024)</div>
            <div className="text-2xl font-black text-navy mt-1">{total2024.toLocaleString('en-IN')}</div>
          </div>
          
          <div className="bg-white rounded-lg p-3 border border-gray-100 shadow-sm flex justify-between items-center">
            <div>
              <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">Uttar Pradesh</div>
              <div className="text-xl font-black text-saffron mt-1">{upStats.receipt?.toLocaleString('en-IN')}</div>
            </div>
            <span className="bg-saffron text-white text-[10px] px-2 py-1 rounded font-bold">RANK 1</span>
          </div>

          <div className="bg-white rounded-lg p-3 border border-gray-100 shadow-sm">
            <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">Delhi (NCT)</div>
            <div className="text-xl font-black text-gray-700 mt-1">{delhiStats.receipt?.toLocaleString('en-IN')}</div>
          </div>

          <div className="bg-navy rounded-lg p-3 border border-blue-800 shadow-sm text-white relative overflow-hidden">
            <div className="absolute -right-2 -bottom-2 text-4xl opacity-10">🤖</div>
            <div className="text-xs font-bold text-blue-300 uppercase tracking-widest">JanSetu Local Node</div>
            <div className="text-xl font-black text-green-400 mt-1">{jansetuCount} <span className="text-xs text-white opacity-60 font-normal">Active</span></div>
          </div>
        </div>

        {/* Chart */}
        <div className="lg:col-span-2 bg-white rounded-lg p-4 border border-gray-100 shadow-sm">
          <h3 className="text-sm font-bold text-gray-700 mb-4">India 5-Year Grievance Trend (2020-2024)</h3>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={yearlyTrend} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="year" tick={{fontSize: 12}} tickLine={false} axisLine={false} />
                <YAxis dataKey="received" tickFormatter={(v) => (v/1000000).toFixed(1) + 'M'} tick={{fontSize: 12}} tickLine={false} axisLine={false} width={40} />
                <Tooltip 
                  formatter={(value) => [value.toLocaleString('en-IN'), 'Complaints']}
                  contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                />
                <Line type="monotone" dataKey="received" stroke="#1e3a5f" strokeWidth={3} dot={{r: 4, fill: '#1e3a5f', strokeWidth: 2, stroke: 'white'}} activeDot={{r: 6, fill: '#FF9933', stroke: 'white'}} name="Received" />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[10px] text-gray-400 text-center mt-2 mt-4 italic">Data source: Rajya Sabha Session 266, Annexure 447</p>
        </div>
      </div>
    </div>
  )
}
