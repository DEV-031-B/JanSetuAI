import { useState, useEffect } from 'react'
import api from '../api'
import BackButton from '../components/BackButton'

export default function Workers() {
  const [workers, setWorkers] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState({ open: false, isEditing: false, data: {} })

  async function loadData() {
    try {
      const data = await api.getWorkers()
      setWorkers(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
    const int = setInterval(loadData, 10000)
    return () => clearInterval(int)
  }, [])

  async function handleSave(e) {
    e.preventDefault()
    try {
      if (modal.isEditing) {
        await api.updateWorker(modal.data._id, modal.data)
      } else {
        await api.addWorker(modal.data)
      }
      setModal({ open: false, isEditing: false, data: {} })
      loadData()
    } catch(err) {
      alert('Error saving worker')
    }
  }

  async function handleDelete(id) {
    if(confirm('Permanently delete this worker?')) {
      try {
        await api.deleteWorker(id)
        loadData()
      } catch(err) {
        alert('Error deleting worker')
      }
    }
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <BackButton />

      {modal.open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl relative z-50">
            <h2 className="text-xl font-bold mb-4">{modal.isEditing ? 'Edit Worker' : 'Add Field Worker'}</h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1 text-gray-700">Name</label>
                <input required className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500" value={modal.data.name || ''} onChange={e => setModal({...modal, data: {...modal.data, name: e.target.value}})} />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1 text-gray-700">Designation</label>
                <input required className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500" placeholder="e.g. Sanitation Engineer" value={modal.data.designation || ''} onChange={e => setModal({...modal, data: {...modal.data, designation: e.target.value}})} />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1 text-gray-700">Ward Assignment</label>
                <input required className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500" placeholder="e.g. Ward 1 — Sector Alpha" value={modal.data.ward || ''} onChange={e => setModal({...modal, data: {...modal.data, ward: e.target.value}})} />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1 text-gray-700">Phone</label>
                <input required className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500" placeholder="+91 98..." value={modal.data.phone || ''} onChange={e => setModal({...modal, data: {...modal.data, phone: e.target.value}})} />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1 text-gray-700">Performance Score (0-100)</label>
                <input type="number" min="0" max="100" className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500" value={modal.data.performanceScore || 0} onChange={e => setModal({...modal, data: {...modal.data, performanceScore: parseInt(e.target.value)}})} />
              </div>
              <div className="flex gap-3 justify-end mt-6 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setModal({open: false, data: {}})} className="px-4 py-2 border rounded hover:bg-gray-50 transition-colors">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 shadow-sm transition-colors">Safeguard Profile</button>
              </div>
            </form>
          </div>
        </div>
      )}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-navy">Field Force Management</h1>
          <p className="text-gray-500 text-sm">Ground volunteer and resource tracking</p>
        </div>
        <button onClick={() => setModal({ open: true, isEditing: false, data: { status: 'active', tasksCompleted: 0, performanceScore: 100 }})} className="btn-primary text-sm shadow-sm">➕ Add Worker</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-3 text-center p-8 animate-pulse text-navy">Loading workforce data...</div>
        ) : workers.map(w => (
          <div key={w._id} className="card p-5">
            <div className="flex items-center gap-4 mb-4 pb-4 border-b border-gray-100">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xl font-bold">
                {w.name?.charAt(0)}
              </div>
              <div>
                <h3 className="font-bold text-navy text-lg">{w.name}</h3>
                <p className="text-xs font-semibold text-saffron">{w.designation}</p>
              </div>
              <div className="ml-auto flex flex-col gap-1">
                <button onClick={() => setModal({ open: true, isEditing: true, data: w })} className="text-[10px] bg-blue-50 text-blue-700 px-2 py-1 rounded hover:bg-blue-100 transition-colors">✏️ Edit</button>
                <button onClick={() => handleDelete(w._id)} className="text-[10px] bg-red-50 text-red-700 px-2 py-1 rounded hover:bg-red-100 transition-colors">🗑️ Trash</button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
              <div>
                <span className="block text-xs text-gray-400">Ward</span>
                <span className="font-medium text-gray-700 truncate block">{w.ward?.split('—')[1] || w.ward}</span>
              </div>
              <div>
                <span className="block text-xs text-gray-400">Phone</span>
                <span className="font-medium text-gray-700">{w.phone}</span>
              </div>
              <div>
                <span className="block text-xs text-gray-400">Booths</span>
                <span className="font-medium text-gray-700 bg-gray-100 px-1.5 py-0.5 rounded mr-1">
                  {w.assignedBooths?.join(', ') || 'None'}
                </span>
              </div>
              <div>
                <span className="block text-xs text-gray-400">Score</span>
                <span className={`font-bold ${w.performanceScore >= 80 ? 'text-green-600' : 'text-orange-500'}`}>
                  {w.performanceScore}/100
                </span>
              </div>
            </div>

            <div className="bg-gray-50 p-2 text-center rounded text-xs font-semibold text-gray-600 border border-gray-100">
              {w.tasksCompleted || 0} Tasks Completed
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
