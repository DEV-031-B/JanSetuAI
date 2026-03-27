const mongoose = require('mongoose')

const ComplaintSchema = new mongoose.Schema({
  serviceRequestId: String,
  serviceType: {
    type: String,
    enum: ['Water','Roads','Electricity','Garbage','Other'],
    required: true
  },
  agencyName: String,
  submissionType: {
    type: String,
    enum: ['online','mobile','phone','csc'],
    default: 'online'
  },
  description: { type: String, required: true },
  descriptionHindi: String,
  address: String,
  ward: String,
  wardNumber: { type: Number },
  galiId: String,
  district: { type: String, default: 'Greater Noida' },
  state: { type: String, default: 'Uttar Pradesh' },
  pincode: String,
  citizenName: String,
  citizenPhone: String,
  citizenId: String,
  status: {
    type: String,
    enum: ['pending','in_progress','resolved','escalated','closed'],
    default: 'pending'
  },
  urgency: {
    type: String,
    enum: ['High','Medium','Low'],
    default: 'Medium'
  },
  aiCategory: String,
  aiUrgency: String,
  aiSummary: String,
  aiHindiSummary: String,
  aiKeywords: [String],
  aiSentiment: String,
  isEscalated: { type: Boolean, default: false },
  clusterGroup: String,
  similarComplaintsCount: { type: Number, default: 0 },
  predictedResolutionDays: Number,
  actualResolutionDays: Number,
  assignedTo: { type: String, default: '' },
  assignedDepartment: String,
  notes: { type: String, default: '' },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: true,
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      required: true,
      default: [77.4977, 28.4744]
    }
  },
  resolvedAt: Date,
  slaDeadline: Date,
  isSlaBreach: { type: Boolean, default: false },
  cpgramsRefId: String,
  source: { type: String, default: 'jansetu' }
}, { timestamps: true })

ComplaintSchema.index({ ward:1, serviceType:1, createdAt:-1 })
ComplaintSchema.index({ status:1, urgency:1 })
ComplaintSchema.index({ location:'2dsphere' })
ComplaintSchema.index({ wardNumber:1 })
ComplaintSchema.index({ isEscalated:1, status:1 })

module.exports = mongoose.model('Complaint', ComplaintSchema)
