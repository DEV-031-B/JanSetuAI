const mongoose = require('mongoose')

const GovDataSchema = new mongoose.Schema({
  source: String,
  dataType: String,
  records: mongoose.Schema.Types.Mixed,
  fetchedAt: { type: Date, default: Date.now }
}, { timestamps: true })

module.exports = mongoose.model('GovData', GovDataSchema)
