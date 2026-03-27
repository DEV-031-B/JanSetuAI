/**
 * Governance Intelligence Score (GIS)
 * Inspired by CPGRAMS Grievance Redressal Assessment Index (GRAI)
 * Measures ward-level civic governance health on 0-100 scale
 */
function calculateGIS(complaints) {
  if (!complaints || complaints.length === 0) {
    return {
      score: 100,
      status: 'EXCELLENT',
      total: 0,
      resolved: 0,
      escalated: 0,
      slaBreach: 0,
      resolutionRate: 100
    }
  }

  const total = complaints.length
  const resolved = complaints.filter(c => c.status === 'resolved')
  const escalated = complaints.filter(c =>
    c.status === 'escalated' || c.isEscalated === true)
  const slaBreach = complaints.filter(c => c.isSlaBreach === true)
  const highPending = complaints.filter(c =>
    c.urgency === 'High' && c.status !== 'resolved')

  const resolutionScore = (resolved.length / total) * 40
  const escalationPenalty = Math.min(escalated.length * 5, 30)
  const slaScore = Math.max(0, 20 - slaBreach.length * 4)
  const urgencyScore = Math.max(0, 10 - highPending.length * 2)

  let score = Math.round(
    resolutionScore + (30 - escalationPenalty) + slaScore + urgencyScore
  )
  score = Math.max(0, Math.min(100, score))

  const status =
    score >= 80 ? 'EXCELLENT' :
    score >= 65 ? 'GOOD' :
    score >= 50 ? 'AVERAGE' :
    score >= 35 ? 'POOR' : 'CRITICAL'

  return {
    score,
    status,
    total,
    resolved: resolved.length,
    escalated: escalated.length,
    slaBreach: slaBreach.length,
    resolutionRate: Math.round((resolved.length / total) * 100)
  }
}

module.exports = { calculateGIS }
