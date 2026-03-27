const express = require('express')
const router = express.Router()
const Complaint = require('../models/Complaint')
const { calculateGIS } = require('../utils/gis')
const { WARD_NAMES } = require('../utils/wardDetector')

// GET /api/wards/scores
router.get('/scores', async (req, res) => {
  try {
    const results = []
    for (const w of WARD_NAMES) {
      const complaints = await Complaint.find({
        ward: { $regex: w.keyword, $options: 'i' }
      })
      const gis = calculateGIS(complaints)
      results.push({
        wardNumber: w.wardNumber,
        wardName: w.wardName,
        fullWardName: `Ward ${w.wardNumber} — ${w.wardName}`,
        score: gis.score,
        status: gis.status,
        total: gis.total,
        resolved: gis.resolved,
        escalated: gis.escalated,
        slaBreach: gis.slaBreach,
        resolutionRate: gis.resolutionRate
      })
    }
    res.json(results)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
