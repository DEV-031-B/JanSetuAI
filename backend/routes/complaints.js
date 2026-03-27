const _xpn = require('express')
const rSys = _xpn.Router()
const Complaint = require('../models/Complaint')
const { callGroq } = require('../utils/groq')
const { detectWard } = require('../utils/wardDetector')
const { predictResolutionDays, calculateSLADeadline } = require('../utils/mlPredictor')

const DEPT_MAP = {
  Water: 'Jal Nigam — Water Authority',
  Roads: 'PWD — Public Works Department',
  Electricity: 'UPPCL — Electricity Department',
  Garbage: 'Nagar Palika — Sanitation Wing',
  Other: 'General Administration'
}

rSys.get('/', async (req, res) => {
  try {
    const { ward, status, category, urgency } = req.query
    const filter = {}
    if (ward) filter.ward = { $regex: ward, $options: 'i' }
    if (status) filter.status = status
    if (category) filter.serviceType = category
    if (urgency) filter.urgency = urgency
    const complaints = await Complaint.find(filter).sort({ createdAt: -1 }).limit(100)
    res.json(complaints)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

rSys.post('/', async (req, res) => {
  try {
    const {
      serviceType = 'Other', description, address = '',
      ward = '', citizenName = '', citizenId = '',
      citizenPhone = '', urgency = 'Medium'
    } = req.body

    const wardInfo = detectWard(address, ward)
    const agencyName = DEPT_MAP[serviceType] || DEPT_MAP.Other
    const slaDeadline = calculateSLADeadline(serviceType)
    const predictedResolutionDays = predictResolutionDays(serviceType, urgency, wardInfo.wardNumber)
    const serviceRequestId = 'GRV-' + Date.now()

    const aiResult = await callGroq(
      'You are an AI assistant for India civic complaint system in Greater Noida. Always respond with valid JSON only. No markdown, no explanation.',
      `Analyze this complaint and return ONLY valid JSON with these exact keys:
{ "category": "Water|Roads|Electricity|Garbage|Other", "urgency": "High|Medium|Low", "summary": "one English sentence", "hindi_summary": "same in Hindi Devanagari script", "keywords": ["word1","word2","word3"], "sentiment": "frustrated|neutral|urgent|satisfied" }
Complaint: ${description}`,
      {
        category: serviceType || 'Other',
        urgency: urgency || 'Medium',
        summary: 'Civic complaint received for processing.',
        hindi_summary: 'नागरिक शिकायत प्राप्त हुई।',
        keywords: ['complaint', 'issue', 'area'],
        sentiment: 'neutral'
      }
    )

    const cutoff = new Date(Date.now() - 48 * 60 * 60 * 1000)
    const similarCount = await Complaint.countDocuments({
      ward: wardInfo.ward,
      serviceType: aiResult.category || serviceType,
      createdAt: { $gte: cutoff }
    })
    const shouldEscalate = similarCount >= 3
    const finalStatus = shouldEscalate ? 'escalated' : 'pending'

    const complaint = await Complaint.create({
      serviceRequestId,
      serviceType,
      agencyName,
      description,
      address,
      ward: wardInfo.ward,
      wardNumber: wardInfo.wardNumber,
      district: 'Greater Noida',
      state: 'Uttar Pradesh',
      citizenName,
      citizenId,
      citizenPhone,
      status: finalStatus,
      urgency: aiResult.urgency || urgency,
      aiCategory: aiResult.category,
      aiUrgency: aiResult.urgency,
      aiSummary: aiResult.summary,
      aiHindiSummary: aiResult.hindi_summary,
      aiKeywords: aiResult.keywords || [],
      aiSentiment: aiResult.sentiment,
      isEscalated: shouldEscalate,
      similarComplaintsCount: similarCount,
      predictedResolutionDays,
      slaDeadline,
      source: 'jansetu',
      location: { type: 'Point', coordinates: [77.4977 + Math.random() * 0.1, 28.4744 + Math.random() * 0.1] }
    })

    res.status(201).json({
      success: true,
      id: complaint._id,
      serviceRequestId,
      complaint,
      aiResult
    })
  } catch (err) {
    console.error('Complaint creation error:', err.message)
    res.status(500).json({ success: false, error: err.message })
  }
})

rSys.patch('/:id/status', async (req, res) => {
  try {
    const { status, notes } = req.body
    const update = { status, notes, updatedAt: new Date() }
    if (status === 'resolved') {
      update.resolvedAt = new Date()
      const complaint = await Complaint.findById(req.params.id)
      if (complaint) {
        const msPerDay = 1000 * 60 * 60 * 24
        update.actualResolutionDays = Math.round(
          (new Date() - complaint.createdAt) / msPerDay
        )
      }
    }
    const updated = await Complaint.findByIdAndUpdate(req.params.id, update, { new: true })
    if (!updated) return res.status(404).json({ error: 'Not found' })
    res.json({ success: true, id: req.params.id, status, complaint: updated })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

rSys.patch('/:id/assign', async (req, res) => {
  try {
    const { assignedDepartment, assignedTo = 'Admin', notes = '' } = req.body
    const updated = await Complaint.findByIdAndUpdate(
      req.params.id,
      { assignedDepartment, assignedTo, notes, status: 'in_progress', updatedAt: new Date() },
      { new: true }
    )
    if (!updated) return res.status(404).json({ error: 'Not found' })
    res.json({ success: true, id: req.params.id, assignedDepartment, complaint: updated })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

rSys.get('/stats', async (req, res) => {
  try {
    const all = await Complaint.find({})
    const total = all.length
    const resolved = all.filter(c => c.status === 'resolved').length
    const pending = all.filter(c => c.status === 'pending').length
    const escalated = all.filter(c => c.status === 'escalated').length
    const inProgress = all.filter(c => c.status === 'in_progress').length
    const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0
    const resolvedWithDays = all.filter(c => c.actualResolutionDays)
    const avgResolutionDays = resolvedWithDays.length > 0
      ? Math.round(resolvedWithDays.reduce((s, c) => s + c.actualResolutionDays, 0) / resolvedWithDays.length)
      : 0
    const slaBreaches = all.filter(c => c.isSlaBreach).length

    const catCount = {}
    all.forEach(c => { catCount[c.serviceType] = (catCount[c.serviceType] || 0) + 1 })
    const topIssues = Object.entries(catCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([category, count]) => ({ category, count, percentage: Math.round((count / total) * 100) || 0 }))

    const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
    const weeklyTrend = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dayStr = days[date.getDay()]
      const dayStart = new Date(date); dayStart.setHours(0, 0, 0, 0)
      const dayEnd = new Date(date); dayEnd.setHours(23, 59, 59, 999)
      const dayComplaints = all.filter(c => c.createdAt >= dayStart && c.createdAt <= dayEnd)
      weeklyTrend.push({
        day: dayStr,
        filed: dayComplaints.length,
        resolved: dayComplaints.filter(c => c.status === 'resolved').length,
        escalated: dayComplaints.filter(c => c.status === 'escalated').length
      })
    }

    const wardMap = {}
    all.forEach(c => {
      const w = c.ward || 'Unknown'
      if (!wardMap[w]) wardMap[w] = { ward: w, total: 0, resolved: 0, pending: 0 }
      wardMap[w].total++
      if (c.status === 'resolved') wardMap[w].resolved++
      if (c.status === 'pending') wardMap[w].pending++
    })
    const wardWise = Object.values(wardMap)

    res.json({
      total, resolved, pending, escalated, inProgress,
      resolutionRate, avgResolutionDays, slaBreaches,
      topIssues, weeklyTrend, wardWise
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = rSys
