const mongoose = require('mongoose')

const TaskSchema = new mongoose.Schema({
  title: String,
  type: {
    type: String,
    enum: ['Survey','Event','Voter Contact','Scheme Drive']
  },
  assignedTo: String,
  workerId: mongoose.Schema.Types.ObjectId,
  area: String,
  ward: String,
  deadline: Date,
  targetCount: Number,
  actualCount: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ['pending','in_progress','completed','verified'],
    default: 'pending'
  },
  notes: String
}, { timestamps: true })

module.exports = mongoose.model('Task', TaskSchema)
