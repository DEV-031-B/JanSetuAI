const _e = require('express')
const _c = require('cors')
const mongoose = require('mongoose')
require('dotenv').config()

const app = _e()

app.use(_c({
  origin: '*',
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'PUT'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))
app.use(_e.json({ limit: '10mb' }))

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`)
  next()
})

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB error:', err.message))

app.use('/api/auth', require('./routes/auth'))
app.use('/api/complaints', require('./routes/complaints'))
app.use('/api/wards', require('./routes/wards'))
app.use('/api/workers', require('./routes/workers'))
app.use('/api/sentiment', require('./routes/sentiment'))
app.use('/api/ai', require('./routes/ai'))
app.use('/api/voters', require('./routes/voters'))
app.use('/api/govdata', require('./routes/govdata'))
app.use('/api/sync', require('./routes/sync'))

app.get('/health', (req, res) => res.json({
  status: 'JanSetu AI v2.0 running',
  db: mongoose.connection.readyState === 1 ? 'MongoDB Connected' : 'Disconnected',
  ai: 'Groq llama-3.3-70b-versatile',
  version: '2.0.0',
  time: new Date()
}))

app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.path} not found` })
})

app.use((err, req, res, next) => {
  console.error('Error:', err.message)
  res.status(500).json({ error: 'Internal server error' })
})

const PORT = process.env.PORT || 5000
const server = app.listen(PORT, () =>
  console.log(`🚀 JanSetu AI v2.0 server running on port ${PORT}`)
)

// ==========================================
// BACKGROUND AUTO-SYNC ENGINE (HACKATHON DEMO)
// Mimics a WebSocket stream from National CPGRAMS
// ==========================================
const Complaint = require('./models/Complaint')
const { WARD_NAMES } = require('./utils/wardDetector')

setInterval(async () => {
  try {
    if (mongoose.connection.readyState !== 1) return
    const SCENARIOS = [
      { cat: 'Water', u: 'High', desc: "Main water line pipe burst near Delta 1 sector park." },
      { cat: 'Roads', u: 'Medium', desc: "Massive traffic jam due to unpaved road near Omega sector." },
      { cat: 'Garbage', u: 'Medium', desc: "A lot of garbage is dumped near the Gamma 1 community center." },
      { cat: 'Electricity', u: 'High', desc: "Power fluctuation has damaged home appliances." },
      { cat: 'Other', u: 'Low', desc: "Street stray dogs are attacking pedestrians in Sector 50." },
      { cat: 'Roads', u: 'Medium', desc: "Encroachment on public road near Sector 137 metro station." },
      { cat: 'Water', u: 'High', desc: "Sewage water overflowing into the streets of Alpha 2." },
      { cat: 'Roads', u: 'Low', desc: "A large pothole on the main road in Beta 1 needs urgent repair." }
    ]
    const wardObj = WARD_NAMES[Math.floor(Math.random() * WARD_NAMES.length)]
    const s = SCENARIOS[Math.floor(Math.random() * SCENARIOS.length)]
    const category = s.cat
    const urgency = s.u
    const desc = s.desc

    const newComplaint = new Complaint({
      serviceRequestId: `CPG/AUTO/${new Date().getFullYear()}/${Math.floor(Math.random() * 90000) + 10000}`,
      serviceType: category,
      description: desc,
      address: `${wardObj.wardName}, Greater Noida, NCR`,
      ward: wardObj.wardName,
      wardNumber: wardObj.wardNumber,
      district: 'Greater Noida',
      state: 'Uttar Pradesh',
      citizenName: 'Delhi NCR Auto-Sync',
      citizenPhone: '0000000000',
      status: 'pending',
      urgency: urgency,
      aiCategory: category,
      aiSeverity: urgency,
      aiSummary: `Auto-synced grievance from CPGRAMS API pertaining to ${wardObj.wardName}`,
      aiKeywords: ['cpgrams', 'auto-sync', 'greater noida', category.toLowerCase()],
      predictedResolutionDays: Math.floor(Math.random() * 5) + 2,
      location: {
        type: 'Point',
        coordinates: [77.4977 + (Math.random() * 0.1 - 0.05), 28.4744 + (Math.random() * 0.1 - 0.05)]
      },
      source: 'cpgrams_live_sync'
    })

    await newComplaint.save()
    console.log(`[Auto-Sync] Pulled new complaint ${newComplaint.serviceRequestId} into MongoDB`)
  } catch (err) {
    console.error('[Auto-Sync Error]', err.message)
  }
}, 30000) // Runs every 30 seconds
