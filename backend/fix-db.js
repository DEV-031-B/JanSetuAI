require('dotenv').config()
const mongoose = require('mongoose')

async function fix() {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('✅ Connected to MongoDB')

    const db = mongoose.connection.db
    const collection = db.collection('complaints')

    console.log('🗑️ Dropping existing complaints index...')
    try {
      await collection.dropIndex('location_2dsphere')
      console.log('✅ Index dropped')
    } catch (e) {
      console.log('ℹ️ Index not found or already dropped')
    }

    console.log('🗑️ Clearing all complaints...')
    await collection.deleteMany({})
    console.log('✅ Collection cleared')

    console.log('🚀 Re-running seeder...')
    const { execSync } = require('child_process')
    execSync('node seed/seed.js', { stdio: 'inherit' })

    console.log('✅ Database repaired and re-seeded')
    process.exit(0)
  } catch (err) {
    console.error('❌ Fix error:', err.message)
    process.exit(1)
  }
}

fix()
