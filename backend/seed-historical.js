require('dotenv').config()
const mongoose = require('mongoose')
const Complaint = require('./models/Complaint')
const { WARD_NAMES } = require('./utils/wardDetector')

const CATEGORIES = ['Water', 'Roads', 'Electricity', 'Garbage']
const URGENCIES = ['High', 'Medium', 'Low']
const STATUSES = ['resolved', 'closed', 'resolved', 'resolved', 'escalated'] // Mostly resolved historically

const SAMPLE_DESCRIPTIONS = [
  "Sector roads are severely damaged and full of potholes.",
  "No water supply for the past 2 days in our block.",
  "Street lights are not functioning, causing security risks.",
  "Garbage has not been collected for a week.",
  "Drainage system is blocked causing waterlogging.",
  "Transformer sparked and electricity is out since morning."
]

async function seedHistorical() {
  try {
    console.log('🔌 Connecting to MongoDB...')
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('✅ Connected')

    console.log('🗑️ Removing previous historical data (if any)...')
    await Complaint.deleteMany({ source: 'cpgrams_historical' })

    const historicalData = []
    
    // Generate 250 historical complaints
    for (let i = 0; i < 250; i++) {
      const wardObj = WARD_NAMES[Math.floor(Math.random() * WARD_NAMES.length)]
      const category = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)]
      const urgency = URGENCIES[Math.floor(Math.random() * URGENCIES.length)]
      const status = STATUSES[Math.floor(Math.random() * STATUSES.length)]
      const desc = SAMPLE_DESCRIPTIONS[Math.floor(Math.random() * SAMPLE_DESCRIPTIONS.length)]

      // Generate random date between Jan 1 2023 and Dec 31 2024
      const start = new Date(2023, 0, 1).getTime()
      const end = new Date(2024, 11, 31).getTime()
      const randomDate = new Date(start + Math.random() * (end - start))

      // Resolution date if resolved
      let resolvedAt = null
      if (status === 'resolved' || status === 'closed') {
        const resolutionTime = (Math.random() * 20 + 2) * 24 * 60 * 60 * 1000 // 2 to 22 days later
        resolvedAt = new Date(randomDate.getTime() + resolutionTime)
      }

      historicalData.push({
        serviceRequestId: `CPG/NCR/${randomDate.getFullYear()}/${Math.floor(Math.random() * 90000) + 10000}`,
        serviceType: category,
        description: desc,
        address: `${wardObj.wardName}, Greater Noida, Gautam Buddha Nagar, UP`,
        ward: wardObj.wardName,
        wardNumber: wardObj.wardNumber,
        district: 'Greater Noida',
        state: 'Uttar Pradesh',
        citizenName: 'External Citizen',
        citizenPhone: '9999999999',
        status: status,
        urgency: urgency,
        aiCategory: category,
        aiSeverity: urgency,
        aiSummary: `Historical record of ${category} issue in ${wardObj.wardName}`,
        aiKeywords: [category.toLowerCase(), 'historical', 'delhi ncr'],
        predictedResolutionDays: Math.floor(Math.random() * 10) + 5,
        location: {
          type: 'Point',
          coordinates: [77.4977 + (Math.random() * 0.1 - 0.05), 28.4744 + (Math.random() * 0.1 - 0.05)]
        },
        source: 'cpgrams_historical',
        createdAt: randomDate,
        updatedAt: resolvedAt || randomDate,
        resolvedAt: resolvedAt
      })
    }

    console.log(`📥 Inserting ${historicalData.length} records into Database...`)
    await Complaint.insertMany(historicalData)
    console.log('✅ Delhi NCR Historical Ingestion Complete!')
    
    mongoose.connection.close()
  } catch (err) {
    console.error('❌ Insertion failed:', err)
    mongoose.connection.close()
  }
}

seedHistorical()
