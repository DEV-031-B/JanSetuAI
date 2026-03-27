const _xpn = require('express')
const rSys = _xpn.Router()
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

rSys.get('/stats', (req, res) => {
  try {
    console.log('HIT: GET /api/govdata/stats')
    const data = getCompleteGovData()
    res.json({ success: true, data })
  } catch (err) {
    console.error('govdata/stats error:', err.message)
    res.status(500).json({ success: false, error: err.message })
  }
})

rSys.get('/national', (req, res) => {
  try {
    console.log('HIT: GET /api/govdata/national')
    const stats = getNationalStats()
    res.json({ success: true, stats })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

rSys.get('/state-rankings', (req, res) => {
  try {
    console.log('HIT: GET /api/govdata/state-rankings')
    const rankings = getStateRankings()
    res.json({ success: true, rankings })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

rSys.get('/yearly-trend', (req, res) => {
  try {
    console.log('HIT: GET /api/govdata/yearly-trend')
    const trend = getYearlyTrend()
    res.json({ success: true, trend })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

rSys.get('/portal-comparison', (req, res) => {
  try {
    console.log('HIT: GET /api/govdata/portal-comparison')
    const comparison = getPortalComparison()
    res.json({ success: true, comparison })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

rSys.get('/ml-accuracy', (req, res) => {
  try {
    console.log('HIT: GET /api/govdata/ml-accuracy')
    const accuracy = getPredictiveAccuracy()
    res.json({ success: true, accuracy })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

rSys.get('/nyc-benchmark', async (req, res) => {
  try {
    console.log('HIT: GET /api/govdata/nyc-benchmark')
    const data = await fetchNYC311Sample()
    res.json(data)
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

rSys.post('/cpgrams-track', async (req, res) => {
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

rSys.get('/dashboard-panel', (req, res) => {
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
        realGovAccuracy: mlAccuracy.realGovAccuracy,
        mlMonthly: mlAccuracy.monthlyData,
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

module.exports = rSys
