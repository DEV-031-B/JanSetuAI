// JanSetu AI v2.0 — Government Data Routes
// Real data from Indian government datasets + NYC 311

const express = require('express')
const router = express.Router()
const {
  getCompleteGovData,
  getNationalStats,
  getStateRankings,
  getYearlyTrend,
  getPortalComparison,
  getPredictiveAccuracy,
  fetchNYC311Sample,
  trackCPGRAMSComplaint
} = require('../utils/dataGovIn')

// GET /api/govdata/stats
// Complete government data package for dashboard
router.get('/stats', (req, res) => {
  try {
    console.log('HIT: GET /api/govdata/stats')
    const data = getCompleteGovData()
    res.json({ success: true, data })
  } catch (err) {
    console.error('govdata/stats error:', err.message)
    res.status(500).json({ success: false, error: err.message })
  }
})

// GET /api/govdata/national
// National CPGRAMS statistics
router.get('/national', (req, res) => {
  try {
    console.log('HIT: GET /api/govdata/national')
    const stats = getNationalStats()
    res.json({ success: true, stats })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// GET /api/govdata/state-rankings
// All states sorted by complaint volume
router.get('/state-rankings', (req, res) => {
  try {
    console.log('HIT: GET /api/govdata/state-rankings')
    const rankings = getStateRankings()
    res.json({ success: true, rankings })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// GET /api/govdata/yearly-trend
// 2018-2024 yearly complaint trend
router.get('/yearly-trend', (req, res) => {
  try {
    console.log('HIT: GET /api/govdata/yearly-trend')
    const trend = getYearlyTrend()
    res.json({ success: true, trend })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// GET /api/govdata/portal-comparison
// CPGRAMS vs EPFiGMS vs INGRAM comparison
router.get('/portal-comparison', (req, res) => {
  try {
    console.log('HIT: GET /api/govdata/portal-comparison')
    const comparison = getPortalComparison()
    res.json({ success: true, comparison })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// GET /api/govdata/ml-accuracy
// ML prediction accuracy from real government data
router.get('/ml-accuracy', (req, res) => {
  try {
    console.log('HIT: GET /api/govdata/ml-accuracy')
    const accuracy = getPredictiveAccuracy()
    res.json({ success: true, accuracy })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// GET /api/govdata/nyc-benchmark
// NYC 311 global benchmark data
router.get('/nyc-benchmark', async (req, res) => {
  try {
    console.log('HIT: GET /api/govdata/nyc-benchmark')
    const data = await fetchNYC311Sample()
    res.json(data)
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// POST /api/govdata/cpgrams-track
// Track a CPGRAMS complaint by registration ID
router.post('/cpgrams-track', async (req, res) => {
  try {
    console.log('HIT: POST /api/govdata/cpgrams-track')
    const { registrationId } = req.body
    if (!registrationId) {
      return res.status(400).json({
        success: false,
        error: 'Registration ID is required'
      })
    }
    const result = await trackCPGRAMSComplaint(registrationId)
    res.json({ success: true, result })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// GET /api/govdata/dashboard-panel
// Everything needed for the dashboard India vs JanSetu panel
router.get('/dashboard-panel', (req, res) => {
  try {
    console.log('HIT: GET /api/govdata/dashboard-panel')
    const national = getNationalStats()
    const mlAccuracy = getPredictiveAccuracy()
    const trend = getYearlyTrend()

    res.json({
      success: true,
      panel: {
        title: 'India Grievance Intelligence',
        subtitle: 'Real data from CPGRAMS + Rajya Sabha Reports',
        nationalStats: {
          totalComplaints: national.totalReceipt,
          pending: national.totalPending,
          resolutionRate: national.nationalResolutionRate,
          avgResolutionDays: 30,
          satisfactionRate: 51,
          ministriesConnected: 92
        },
        upStats: national.upStats,
        delhiStats: national.delhiStats,
        yearlyGrowth: '20% per year (2018-2024)',
        mlAccuracy: mlAccuracy.accuracy,
        trend2024: national.latest2024,
        yearlyData: trend.data,
        source: national.source,
        reportUrl: national.reportUrl,
        vsJanSetuAI: {
          avgResolution: '2-7 days (vs 30+ days CPGRAMS)',
          languages: 'Hindi + English + Hinglish (vs English only)',
          ai: 'Groq llama-3.3-70b (vs No AI)',
          wardScoring: 'Real-time GIS (vs None)',
          prediction: 'ML-based (vs None)',
          satisfaction: 'Real-time tracked (vs 51%)'
        }
      }
    })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

module.exports = router
