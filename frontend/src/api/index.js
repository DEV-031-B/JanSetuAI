const BASE = 'https://jansetuai-1.onrender.com/api'

async function req(path, opts = {}) {
  try {
    const token = localStorage.getItem('jansetu_token')
    const headers = { 'Content-Type': 'application/json', ...opts.headers }
    if (token) headers['Authorization'] = `Bearer ${token}`
    const res = await fetch(BASE + path, { ...opts, headers })
    if (!res.ok) throw new Error('HTTP ' + res.status)
    return res.json()
  } catch (e) {
    console.error('API[' + path + ']:', e.message)
    throw e
  }
}

export const api = {
  // Auth
  login: (u, p) => req('/auth/login', { method: 'POST', body: JSON.stringify({ username: u, password: p }) }),

  // Complaints
  getComplaints: (params = {}) => {
    const q = new URLSearchParams(params).toString()
    return req('/complaints' + (q ? '?' + q : ''))
  },
  submitComplaint: d => req('/complaints', { method: 'POST', body: JSON.stringify(d) }),
  updateStatus: (id, status, notes = '') =>
    req(`/complaints/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status, notes }) }),
  assign: (id, dept, to = 'Admin', notes = '') =>
    req(`/complaints/${id}/assign`, { method: 'PATCH', body: JSON.stringify({ assignedDepartment: dept, assignedTo: to, notes }) }),
  getStats: () => req('/complaints/stats'),

  // Wards
  getWardScores: () => req('/wards/scores'),

  // AI
  categorize: text => req('/ai/categorize', { method: 'POST', body: JSON.stringify({ text }) }),
  executiveBrief: () => req('/ai/executive-brief', { method: 'POST', body: JSON.stringify({}) }),

  // Sentiment
  analyzeSentiment: (posts, ward) => req('/sentiment/analyze', { method: 'POST', body: JSON.stringify({ posts, ward }) }),
  getSentimentReports: () => req('/sentiment/reports'),

  // Workers / Tasks
  getWorkers: () => req('/workers'),
  addWorker: d => req('/workers', { method: 'POST', body: JSON.stringify(d) }),
  updateWorker: (id, d) => req(`/workers/${id}`, { method: 'PUT', body: JSON.stringify(d) }),
  deleteWorker: id => req(`/workers/${id}`, { method: 'DELETE' }),
  getTasks: () => req('/workers/tasks'),
  addTask: d => req('/workers/tasks', { method: 'POST', body: JSON.stringify(d) }),
  updateTask: (id, s) => req(`/workers/tasks/${id}`, { method: 'PATCH', body: JSON.stringify({ status: s }) }),

  // Voters
  getVoters: () => req('/voters'),
  segmentVoters: ward => req('/voters/segment', { method: 'POST', body: JSON.stringify({ ward }) }),

  // GovData
  getGovDashboardPanel: () => req('/govdata/dashboard-panel'),
  getGovStats: () => req('/govdata/stats'),
  getStateRankings: () => req('/govdata/state-rankings'),
  getYearlyTrend: () => req('/govdata/yearly-trend'),
  getNYCBenchmark: () => req('/govdata/nyc-benchmark'),
  trackCPGRAMS: id => req('/govdata/cpgrams-track', { method: 'POST', body: JSON.stringify({ registrationId: id }) }),

  // Live Sync
  triggerLiveSync: () => req('/sync/live', { method: 'POST' })
}

export default api
