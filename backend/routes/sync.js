const express = require('express')
const router = express.Router()
const Complaint = require('../models/Complaint')
const { WARD_NAMES } = require('../utils/wardDetector')

const CATEGORIES = ['Water', 'Roads', 'Electricity', 'Garbage', 'Other']
const URGENCIES = ['High', 'Medium', 'Low']
const DESCRIPTIONS = [
  "Main water line pipe burst near Delta 1 sector park.",
  "Massive traffic jam due to unpaved road near Omega sector.",
  "A lot of garbage is dumped near the Gamma 1 community center.",
  "Power fluctuation has damaged home appliances.",
  "Street stray dogs are attacking pedestrians in Sector 50.",
  "Encroachment on public road near Sector 137 metro station.",
  "Sewage water overflowing into the streets of Alpha 2.",
  "A large pothole on the main road in Beta 1 needs urgent repair."
]

// POST /api/sync/live
// Exposes a fake CPGRAMS syncing bridge that dynamically generates a complaint and injects it into MongoDB
router.post('/live', async (req, res) => {
  try {
    const wardObj = WARD_NAMES[Math.floor(Math.random() * WARD_NAMES.length)]
    const category = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)]
    const urgency = URGENCIES[Math.floor(Math.random() * URGENCIES.length)]
    const desc = DESCRIPTIONS[Math.floor(Math.random() * DESCRIPTIONS.length)]

    const newComplaint = new Complaint({
      serviceRequestId: `CPG/LIVE/${new Date().getFullYear()}/${Math.floor(Math.random() * 90000) + 10000}`,
      serviceType: category,
      description: desc,
      address: `${wardObj.wardName}, Greater Noida, NCR`,
      ward: wardObj.wardName,
      wardNumber: wardObj.wardNumber,
      district: 'Greater Noida',
      state: 'Uttar Pradesh',
      citizenName: 'External CPGRAMS Sync',
      citizenPhone: '0000000000',
      status: 'pending',
      urgency: urgency,
      aiCategory: category,
      aiSeverity: urgency,
      aiSummary: `Live grievance synced from CPGRAMS API pertaining to ${wardObj.wardName}`,
      aiKeywords: ['cpgrams', 'sync', 'greater noida', category.toLowerCase()],
      predictedResolutionDays: Math.floor(Math.random() * 5) + 2,
      location: {
        type: 'Point',
        coordinates: [77.4977 + (Math.random() * 0.1 - 0.05), 28.4744 + (Math.random() * 0.1 - 0.05)]
      },
      source: 'cpgrams_live_sync'
    })

    await newComplaint.save()

    res.json({
      success: true,
      message: 'Successfully pulled 1 new complaint from National Hub (CPGRAMS)',
      data: newComplaint
    })
  } catch (err) {
    console.error('Live Sync Error:', err.message)
    res.status(500).json({ success: false, error: err.message })
  }
})

module.exports = router
