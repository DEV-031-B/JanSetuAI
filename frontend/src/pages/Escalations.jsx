import { useState, useEffect } from 'react'
import api from '../api'
import BackButton from '../components/BackButton'

export default function Escalations() {
  const [escalated, setEscalated] = useState([])
  const [loading, setLoading] = useState(true)
  const [assignModal, setAssignModal] = useState({ open: false, id: null, dept: '' })

  async function loadData() {
    try {
      const all = await api.getComplaints()
      // Filter for escalated status OR isEscalated flag
      const esc = all.filter(c => c.status === 'escalated' || c.isEscalated)
      setEscalated(esc)
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

  const handleResolve = async (id) => {
    if (!confirm('Mark this escalated issue as resolved?')) return
    await api.updateStatus(id, 'resolved', 'Resolved post-escalation.')
    loadData()
  }

  const handleAssignClick = (id) => {
    setAssignModal({ open: true, id, dept: '' })
  }

  const submitAssign = async () => {
    if (assignModal.dept) {
      await api.assign(assignModal.id, assignModal.dept, 'Emergency Response Team', 'Urgent assignment due to escalation.')
      setAssignModal({ open: false, id: null, dept: '' })
      loadData()
    }
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <BackButton />
      <div className="flex justify-between items-center bg-red-50 border border-red-100 p-4 rounded-xl">
        <div>
          <h1 className="text-2xl font-black text-red-800">Escalation Center</h1>
          <p className="text-red-600 text-sm">Issues unresolved past SLA or auto-escalated by AI</p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-black text-red-700">{escalated.length}</div>
          <div className="text-xs text-red-600 uppercase tracking-widest font-bold">Active Alerts</div>
        </div>
      </div>

      {loading ? (
        <div className="animate-pulse text-navy p-8 text-center">Loading escalations...</div>
      ) : escalated.length === 0 ? (
        <div className="card p-12 text-center text-gray-500">
          <div className="text-5xl mb-3">✅</div>
          <h2 className="text-xl font-bold text-gray-700">All Clear</h2>
          <p>No escalated complaints currently require attention.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {escalated.map(c => (
            <div key={c._id} className="card p-5 border-l-4 border-red-500 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-red-100 text-red-800 font-mono text-[10px] px-2 py-1 rounded-bl-lg">
                OVERDUE: {c.actualResolutionDays || c.predictedResolutionDays || 7} DAYS
              </div>
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="font-mono text-xs text-gray-400">{c.serviceRequestId || c._id.slice(-6)}</div>
                  <h3 className="font-bold text-navy text-lg">{c.serviceType}</h3>
                </div>
                <div className="text-right">
                  <span className="badge badge-High text-xs mb-1 block">CRITICAL</span>
                </div>
              </div>
              
              <div className="text-sm text-gray-700 mb-3 bg-red-50 p-2 rounded line-clamp-2">
                {c.description}
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 mb-4 bg-gray-50 p-2 rounded border border-gray-100">
                <div><span className="block text-[10px] uppercase text-gray-400">Ward</span> <span className="font-semibold text-gray-700">{c.ward}</span></div>
                <div><span className="block text-[10px] uppercase text-gray-400">Department</span> <span className="font-semibold text-gray-700">{c.agencyName || c.assignedDepartment || 'Unassigned'}</span></div>
                <div><span className="block text-[10px] uppercase text-gray-400">Complainant</span> <span className="font-semibold text-gray-700">{c.citizenName || 'Citizen'}</span></div>
                <div><span className="block text-[10px] uppercase text-gray-400">AI Context</span> <span className="font-semibold text-gray-700 truncate block">{c.aiSummary}</span></div>
              </div>

              <div className="flex gap-2 border-t pt-3 border-gray-100">
                <button 
                  onClick={() => handleAssignClick(c._id)}
                  className="flex-1 bg-blue-50 text-blue-700 text-xs font-bold py-2 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  ⚡ Assign Task Force
                </button>
                <button 
                  onClick={() => handleResolve(c._id)}
                  className="flex-1 bg-green-50 text-green-700 text-xs font-bold py-2 rounded-lg hover:bg-green-100 transition-colors"
                >
                  ✓ Force Resolve
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Custom Assignment Modal */}
      {assignModal.open && (
        <div className="fixed inset-0 bg-navy bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-50 fade-in">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full animate-slide-in-right">
            <h3 className="text-xl font-black text-navy mb-2">Assign Emergency Task Force</h3>
            <p className="text-xs text-gray-500 mb-4">Route this critical escalation directly to a regional department.</p>
            
            <label className="form-label text-xs uppercase tracking-wider text-gray-400">Target Department</label>
            <input 
              autoFocus
              type="text" 
              className="form-input mb-4 text-base bg-gray-50 border-gray-200 focus:bg-white" 
              placeholder="e.g. Water Works, PWD, Security"
              value={assignModal.dept}
              onChange={e => setAssignModal({...assignModal, dept: e.target.value})}
              onKeyDown={e => e.key === 'Enter' && submitAssign()}
            />
            
            <div className="flex gap-3">
              <button 
                className="flex-1 px-4 py-2 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 font-medium"
                onClick={() => setAssignModal({ open: false, id: null, dept: '' })}
              >
                Cancel
              </button>
              <button 
                className="flex-1 btn-primary"
                disabled={!assignModal.dept.trim()}
                onClick={submitAssign}
              >
                Confirm Dispatch ⚡
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
