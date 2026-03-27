import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

export default function ComplaintTable({ complaints, onUpdateStatus, onAssign }) {
  const [selectedId, setSelectedId] = useState(null)
  const { user } = useAuth()

  const statusColor = { pending: 'badge-pending', in_progress: 'badge-in_progress', resolved: 'badge-resolved', escalated: 'badge-escalated', closed: 'badge-closed' }
  const urgencyColor = { High: 'badge-High', Medium: 'badge-Medium', Low: 'badge-Low' }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-navy text-white text-xs uppercase tracking-wider">
            <th className="px-3 py-3 text-left">ID</th>
            <th className="px-3 py-3 text-left">Description</th>
            <th className="px-3 py-3 text-left">Ward</th>
            <th className="px-3 py-3 text-left">Type</th>
            <th className="px-3 py-3 text-left">Urgency</th>
            <th className="px-3 py-3 text-left">Status</th>
            <th className="px-3 py-3 text-left">AI Summary</th>
            {(onUpdateStatus || onAssign) && <th className="px-3 py-3 text-left">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {complaints.length === 0 && (
            <tr><td colSpan={8} className="text-center py-10 text-gray-400">No complaints found</td></tr>
          )}
          {complaints.map(c => (
            <tr key={c._id} className="table-row border-b border-gray-100">
              <td className="px-3 py-2.5 font-mono text-xs text-blue-700">{c.serviceRequestId || c._id?.slice(-6)}</td>
              <td className="px-3 py-2.5 max-w-xs">
                <div className="text-xs text-gray-800 line-clamp-2">{c.description}</div>
                <div className="text-xs text-gray-400 mt-0.5">{c.citizenName}</div>
              </td>
              <td className="px-3 py-2.5 text-xs text-gray-600">{c.ward?.split('—')[1]?.trim() || c.ward}</td>
              <td className="px-3 py-2.5">
                <span className="text-xs font-semibold text-navy">{c.serviceType}</span>
              </td>
              <td className="px-3 py-2.5">
                <span className={`badge ${urgencyColor[c.urgency] || ''}`}>{c.urgency}</span>
              </td>
              <td className="px-3 py-2.5">
                <span className={`badge ${statusColor[c.status] || ''}`}>{c.status?.replace('_', ' ')}</span>
                {c.isEscalated && <span className="ml-1 text-red-500 text-xs">⚠️</span>}
              </td>
              <td className="px-3 py-2.5 text-xs text-gray-500 max-w-xs">
                <div className="line-clamp-1">{c.aiSummary || c.description?.slice(0, 60)}</div>
                {c.aiHindiSummary && <div className="text-gray-400 text-xs line-clamp-1">{c.aiHindiSummary}</div>}
              </td>
              {(onUpdateStatus || onAssign) && (
                <td className="px-3 py-2.5">
                  <div className="flex gap-1 flex-wrap">
                    {onUpdateStatus && c.status !== 'resolved' && (
                      <div className="flex gap-1">
                        <button onClick={() => onUpdateStatus(c._id, 'resolved')}
                          className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200 transition-colors">
                          ✓ Resolve
                        </button>
                        {c.status !== 'escalated' && user?.role !== 'leader' && (
                          <button onClick={() => {
                            if(confirm('Escalate this directly to the District Magistrate?')) {
                              onUpdateStatus(c._id, 'escalated')
                            }
                          }} className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200 transition-colors">
                            ⚠️ Escalate to DM
                          </button>
                        )}
                      </div>
                    )}
                    {onAssign && (
                      <button onClick={() => onAssign(c)}
                        className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200 transition-colors">
                        📋 Assign
                      </button>
                    )}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
