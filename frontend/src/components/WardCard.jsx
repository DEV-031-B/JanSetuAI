const STATUS_COLORS = {
  EXCELLENT: '#16a34a', GOOD: '#2563eb', AVERAGE: '#d97706', POOR: '#ea580c', CRITICAL: '#dc2626'
}

export default function WardCard({ ward }) {
  const color = STATUS_COLORS[ward.status] || '#6b7280'
  return (
    <div className="card p-4">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="font-bold text-navy text-sm">{ward.wardName}</div>
          <div className="text-xs text-gray-400 mt-0.5">Greater Noida / NCR</div>
        </div>
        <div className="score-ring text-sm" style={{ borderColor: color, color }}>
          {ward.score}
        </div>
      </div>
      <div className="mt-3 text-xs font-bold" style={{ color }}>{ward.status}</div>
      <div className="mt-2 grid grid-cols-3 gap-2 text-center">
        <div className="bg-gray-50 rounded p-1.5">
          <div className="font-bold text-gray-700 text-sm">{ward.total || 0}</div>
          <div className="text-gray-400 text-xs">Total</div>
        </div>
        <div className="bg-green-50 rounded p-1.5">
          <div className="font-bold text-green-700 text-sm">{ward.resolved || 0}</div>
          <div className="text-green-500 text-xs">Resolved</div>
        </div>
        <div className="bg-red-50 rounded p-1.5">
          <div className="font-bold text-red-700 text-sm">{ward.escalated || 0}</div>
          <div className="text-red-500 text-xs">Escalated</div>
        </div>
      </div>
      {ward.total > 0 && (
        <div className="mt-2">
          <div className="text-xs text-gray-500 mb-1">Resolution Rate</div>
          <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all" style={{ width: `${ward.resolutionRate || 0}%`, backgroundColor: color }} />
          </div>
          <div className="text-xs mt-0.5 text-gray-500">{ward.resolutionRate || 0}%</div>
        </div>
      )}
    </div>
  )
}
