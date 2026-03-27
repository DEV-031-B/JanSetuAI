const mongoose = require('mongoose')

const WorkerSchema = new mongoose.Schema({
  name: String,
  phone: String,
  ward: String,
  wardNumber: Number,
  zone: String,
  designation: {
    type: String,
    enum: ['Booth Adhyaksh','Mandal Prabhari','Shakti Kendra','Ground Volunteer']
  },
  assignedBooths: [Number],
  status: { type: String, default: 'active' },
  performanceScore: { type: Number, default: 0 },
  tasksCompleted: { type: Number, default: 0 }
}, { timestamps: true })

module.exports = mongoose.model('Worker', WorkerSchema)
