import { useState, useEffect } from 'react'
import api from '../api'
import BackButton from '../components/BackButton'
import ComplaintTable from '../components/ComplaintTable'

export default function Complaints() {
  const [complaints, setComplaints] = useState([])
  const [loading, setLoading] = useState(true)

  async function loadData() {
    try {
      const c = await api.getComplaints()
      setComplaints(c)
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

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <BackButton />
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-black text-navy flex items-center gap-3">
            Grievance Master Log
          </h1>
          <p className="text-gray-500 text-sm">Full chronological list of all active and historical complaints</p>
        </div>
        <div className="font-mono text-sm font-bold bg-blue-50 text-blue-700 px-3 py-1 rounded">
          {complaints.length} Total Records
        </div>
      </div>

      <div className="card">
        {loading ? (
          <div className="p-10 text-center animate-pulse text-navy">Loading complaints...</div>
        ) : (
          <ComplaintTable 
            complaints={complaints} 
            onUpdateStatus={(id, status) => {
              api.updateStatus(id, status).then(loadData)
            }} 
          />
        )}
      </div>
    </div>
  )
}
