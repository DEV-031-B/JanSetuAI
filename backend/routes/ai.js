const express = require('express')
const router = express.Router()
const { callGroq } = require('../utils/groq')
const Complaint = require('../models/Complaint')
const { calculateGIS } = require('../utils/gis')
const { WARD_NAMES } = require('../utils/wardDetector')

// POST /api/ai/categorize
router.post('/categorize', async (req, res) => {
  try {
    const { text } = req.body
    const result = await callGroq(
      'You are an AI assistant for India civic complaint system in Greater Noida. Always respond with valid JSON only.',
      `Analyze this complaint and return ONLY valid JSON:
{ "category": "Water|Roads|Electricity|Garbage|Other", "urgency": "High|Medium|Low", "summary": "one English sentence", "hindi_summary": "same in Hindi Devanagari", "keywords": ["word1","word2","word3"], "department": "department name", "ward_suggestion": "ward name based on address if present", "sentiment": "frustrated|neutral|urgent|satisfied" }
Text: ${text}`,
      {
        category: 'Other', urgency: 'Medium',
        summary: 'Civic complaint received.',
        hindi_summary: 'नागरिक शिकायत प्राप्त हुई।',
        keywords: ['complaint', 'issue', 'area'],
        department: 'General Administration',
        ward_suggestion: 'Ward 1 — Sector 12',
        sentiment: 'neutral'
      }
    )
    res.json({ success: true, result })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST /api/ai/executive-brief
router.post('/executive-brief', async (req, res) => {
  try {
    // Gather stats
    const all = await Complaint.find({})
    const total = all.length
    const resolved = all.filter(c => c.status === 'resolved').length
    const pending = all.filter(c => c.status === 'pending').length
    const escalated = all.filter(c => c.status === 'escalated').length
    const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0
    const stats = { total, resolved, pending, escalated, resolutionRate }

    // Ward scores
    const wardScores = []
    for (const w of WARD_NAMES) {
      const wComplaints = await Complaint.find({ ward: { $regex: w.keyword, $options: 'i' } })
      const gis = calculateGIS(wComplaints)
      wardScores.push({ wardName: w.wardName, score: gis.score, status: gis.status })
    }

    const brief = await callGroq(
      'You are an AI governance analyst for India. Always respond with valid JSON only. No markdown.',
      `Generate a weekly executive intelligence brief for Greater Noida district.
Return ONLY valid JSON:
{ "executive_summary": "2 sentences max", "key_insight": "one important finding", "critical_alerts": [{"type":"string","message":"string","ward":"string","action":"string"}], "top_recommendations": [{"priority":"High|Medium|Low","title":"string","description":"string"}], "performance_insight": "best vs worst ward comparison", "best_ward": "ward name", "worst_ward": "ward name", "predicted_escalations": ["ward names"], "resolution_trend": "improving|declining|stable" }
Data: ${JSON.stringify({ stats, wardScores })}`,
      {
        executive_summary: `Greater Noida has ${total} active complaints with ${resolutionRate}% resolution rate.`,
        key_insight: 'Escalated complaints need immediate attention.',
        critical_alerts: [],
        top_recommendations: [
          { priority: 'High', title: 'Resolve escalated complaints', description: 'Focus on escalated ward issues.' }
        ],
        performance_insight: 'Best performing ward has highest resolution rate.',
        best_ward: wardScores.sort((a, b) => b.score - a.score)[0]?.wardName || 'Alpha 1',
        worst_ward: wardScores.sort((a, b) => a.score - b.score)[0]?.wardName || 'Gamma 1',
        predicted_escalations: [],
        resolution_trend: 'stable'
      }
    )
    res.json({ success: true, brief, stats, wardScores })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
