import { useState, useEffect } from 'react'
import api from '../api'
import KPICard from '../components/KPICard'
import WardCard from '../components/WardCard'
import ComplaintTable from '../components/ComplaintTable'
import GovDataPanel from '../components/GovDataPanel'
import BackButton from '../components/BackButton'
import WardMap from '../components/WardMap'
import { useNavigate } from 'react-router-dom'

export default function Dashboard() {
  const [realComplaints, setRealComplaints] = useState([])
  const [realWardScores, setRealWardScores] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const navigate = useNavigate()

  async function loadData() {
    try {
      const [c, w, s] = await Promise.all([
        api.getComplaints(),
        api.getWardScores(),
        api.getStats()
      ])
      setRealComplaints(c)
      setRealWardScores(w)
      setStats(s)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
    const interval = setInterval(loadData, 10000)
    return () => clearInterval(interval)
  }, [])

  const handleLiveSync = async () => {
    setSyncing(true)
    try {
      const res = await api.triggerLiveSync()
      if (res.success) {
        loadData()
      }
    } catch (err) {
      console.error(err)
    } finally {
      setSyncing(false)
    }
  }

  if (loading && !stats) {
    return <div className="p-8 flex items-center justify-center h-full"><div className="animate-pulse text-navy">Loading dashboard data...</div></div>
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <BackButton />
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-black text-navy flex items-center gap-3">
            Command Center
            <div className="text-[10px] bg-green-50 text-green-700 border border-green-200 px-2 flex items-center gap-1.5 py-1 rounded-full uppercase tracking-wider font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
              Auto-Sync Active (30s)
            </div>
          </h1>
          <p className="text-gray-500 text-sm">Real-time civic intelligence overview</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full font-medium border border-blue-200">
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
          Background Polling (10s)
        </div>
      </div>

      {/* Comparisons */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard icon="📬" label="Total Received" value={stats?.total || 0} sub="JanSetu AI Network" variant="default" />
        <KPICard icon="✅" label="Resolution Rate" value={`${stats?.resolutionRate || 0}%`} sub={`Avg: ${stats?.avgResolutionDays || 0} days`} variant="green" />
        <KPICard icon="🚨" label="Escalated" value={stats?.escalated || 0} sub="Requires attention" variant="red" />
        <KPICard icon="⏳" label="In Progress" value={stats?.inProgress || 0} sub="Active resolution" variant="saffron" />
      </div>

      {/* Wards GIS */}
      <div>
        <h2 className="text-lg font-bold text-navy mb-4">Delhi NCR Regional Governance (GIS)</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {realWardScores.map(w => <WardCard key={w.wardNumber} ward={w} />)}
        </div>
      </div>

      {/* Interactive GIS Spatial Map */}
      <div className="card">
        <div className="p-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-navy">Interactive Grievance Heatmap</h2>
          <p className="text-xs text-gray-500">Live geographic distribution of civic tickets</p>
        </div>
        <WardMap complaints={realComplaints} />
      </div>

      <GovDataPanel dark={false} />

      {/* Live Feed */}
      <div className="card">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-lg font-bold text-navy">Live Complaint Feed</h2>
          <span className="badge badge-pending">{realComplaints.filter(c => c.status === 'pending').length} Pending</span>
        </div>
        <ComplaintTable 
          complaints={realComplaints.slice(0, 5)} 
          onUpdateStatus={(id, status) => {
            api.updateStatus(id, status).then(loadData)
          }} 
        />
        <div className="p-3 text-center border-t border-gray-50">
          <button onClick={() => navigate('/complaints')} className="text-xs font-semibold text-blue-600 hover:text-blue-800">View All Complaints →</button>
        </div>
      </div>
    </div>
  )
}
