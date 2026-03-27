const express = require('express')
const router = express.Router()
const Worker = require('../models/Worker')
const Task = require('../models/Task')

// GET /api/workers
router.get('/', async (req, res) => {
  try {
    const workers = await Worker.find({}).sort({ createdAt: -1 })
    res.json(workers)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST /api/workers
router.post('/', async (req, res) => {
  try {
    const worker = await Worker.create(req.body)
    res.status(201).json({ success: true, id: worker._id, worker })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// PUT /api/workers/:id
router.put('/:id', async (req, res) => {
  try {
    const updated = await Worker.findByIdAndUpdate(req.params.id, req.body, { new: true })
    if (!updated) return res.status(404).json({ error: 'Worker not found' })
    res.json({ success: true, worker: updated })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// DELETE /api/workers/:id
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Worker.findByIdAndDelete(req.params.id)
    if (!deleted) return res.status(404).json({ error: 'Worker not found' })
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/workers/tasks
router.get('/tasks', async (req, res) => {
  try {
    const tasks = await Task.find({}).sort({ createdAt: -1 })
    res.json(tasks)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST /api/workers/tasks
router.post('/tasks', async (req, res) => {
  try {
    const task = await Task.create(req.body)
    res.status(201).json({ success: true, id: task._id, task })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// PATCH /api/workers/tasks/:id
router.patch('/tasks/:id', async (req, res) => {
  try {
    const { status, notes } = req.body
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { status, notes, updatedAt: new Date() },
      { new: true }
    )
    if (!task) return res.status(404).json({ error: 'Task not found' })
    res.json({ success: true, task })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
