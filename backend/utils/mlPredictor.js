/**
 * ML Predictor — Resolution time prediction
 * Inspired by NYC 311 resolution time analysis patterns
 * from references/Analyzing-NYC-311-Service-Requests/
 */

const BASE_DAYS = {
  Water: 2,
  Roads: 7,
  Electricity: 1,
  Garbage: 3,
  Other: 10
}

const URGENCY_MULTIPLIER = {
  High: 0.5,
  Medium: 1.0,
  Low: 1.5
}

// Ward factor based on infrastructure capacity
const WARD_FACTOR = {
  1: 1.0,
  2: 1.1,
  3: 1.3,
  4: 0.9,
  5: 1.2,
  6: 1.4
}

const SLA_DAYS = {
  Water: 2,
  Roads: 7,
  Electricity: 1,
  Garbage: 3,
  Other: 10
}

function predictResolutionDays(category, urgency, wardNumber) {
  const base = BASE_DAYS[category] || 7
  const mult = URGENCY_MULTIPLIER[urgency] || 1.0
  const factor = WARD_FACTOR[wardNumber] || 1.0
  return Math.max(1, Math.round(base * mult * factor))
}

function calculateSLADeadline(category) {
  const deadline = new Date()
  deadline.setDate(deadline.getDate() + (SLA_DAYS[category] || 10))
  return deadline
}

module.exports = { predictResolutionDays, calculateSLADeadline, SLA_DAYS }
