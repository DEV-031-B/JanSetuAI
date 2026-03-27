const express = require('express')
const router = express.Router()
const Voter = require('../models/Voter')

// GET /api/voters
router.get('/', async (req, res) => {
  try {
    const voters = await Voter.find({}).sort({ influenceScore: -1 })
    res.json(voters)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST /api/voters/segment
router.post('/segment', async (req, res) => {
  try {
    const { ward } = req.body
    const voters = await Voter.find({ ward: { $regex: ward, $options: 'i' } })
    const segments = {
      youth: voters.filter(v => v.age >= 18 && v.age <= 29).length,
      farmers: voters.filter(v => /farmer|kisan|krishak/i.test(v.occupation || '')).length,
      women: voters.filter(v => v.gender === 'female').length,
      businessmen: voters.filter(v => /business|vyapari|shop|dukan/i.test(v.occupation || '')).length,
      keyVoters: voters.filter(v => v.influenceScore >= 7).length,
      senior: voters.filter(v => v.age >= 60).length
    }
    res.json({ ward, total: voters.length, segments })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
