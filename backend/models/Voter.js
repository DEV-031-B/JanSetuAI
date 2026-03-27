const mongoose = require('mongoose')

const VoterSchema = new mongoose.Schema({
  name: String,
  age: Number,
  gender: { type: String, enum: ['male','female','other'] },
  phone: String,
  address: String,
  ward: String,
  wardNumber: Number,
  galiId: String,
  occupation: String,
  segments: [{
    type: String,
    enum: ['Youth','Farmer','Women','Businessman','Senior','KeyVoter']
  }],
  influenceScore: { type: Number, default: 0, min:0, max:10 },
  swingProbability: { type: Number, default: 0 },
  isKeyVoter: { type: Boolean, default: false },
  schemes: [{
    name: String,
    enrolled: Boolean,
    benefitAmount: Number
  }],
  lastContacted: Date,
  contactCount: { type: Number, default: 0 }
}, { timestamps: true })

module.exports = mongoose.model('Voter', VoterSchema)
