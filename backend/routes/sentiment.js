const express = require('express')
const router = express.Router()
const SentimentReport = require('../models/SentimentReport')
const { callGroq } = require('../utils/groq')

// POST /api/sentiment/analyze
router.post('/analyze', async (req, res) => {
  try {
    const { posts = [], ward = '' } = req.body
    const wardNumber = parseInt((ward.match(/\d+/) || ['1'])[0]) || 1

    const result = await callGroq(
      'You are a political sentiment analyst for India. Analyze Hindi, English, and Hinglish social media posts. Always respond with valid JSON only.',
      `Analyze these public posts about a ward in Greater Noida.
Return ONLY valid JSON:
{ "overall_sentiment": "positive|negative|neutral", "score": 0-100, "top_issues": ["issue1","issue2","issue3"], "ward_mood": "one sentence describing public mood", "alert": true_if_score_below_30, "recommended_action": "one actionable sentence", "language_breakdown": {"hindi": percentage, "english": percentage, "hinglish": percentage} }
Posts:
${posts.join('\n')}`,
      {
        overall_sentiment: 'neutral',
        score: 50,
        top_issues: ['Infrastructure', 'Water supply', 'Sanitation'],
        ward_mood: 'Citizens have mixed feelings about civic services.',
        alert: false,
        recommended_action: 'Address infrastructure complaints promptly.',
        language_breakdown: { hindi: 40, english: 30, hinglish: 30 }
      }
    )

    const report = await SentimentReport.create({
      ward,
      wardNumber,
      postsAnalyzed: posts.length,
      result,
      rawPosts: posts.slice(0, 20)
    })

    res.json({ success: true, result, reportId: report._id })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/sentiment/reports
router.get('/reports', async (req, res) => {
  try {
    const reports = await SentimentReport.find({}).sort({ createdAt: -1 }).limit(50)
    res.json(reports)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
