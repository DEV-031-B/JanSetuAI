const _xpn = require('express')
const jT = require('jsonwebtoken')
const aRoute = _xpn.Router()

const USERS = [
  {
    username: 'citizen',
    password: 'citizen123',
    role: 'citizen',
    name: 'Ramesh Kumar',
    designation: 'Citizen',
    ward: 'Ward 1 — Sector 12',
    avatar: '👤'
  },
  {
    username: 'admin',
    password: 'admin123',
    role: 'admin',
    name: 'Priya Sharma',
    designation: 'Ward Administrator',
    dept: 'Greater Noida Authority',
    avatar: '👩‍💼'
  },
  {
    username: 'leader',
    password: 'leader123',
    role: 'leader',
    name: 'Shri Arun Mishra',
    designation: 'District Magistrate',
    dept: 'District Collectorate, Greater Noida',
    avatar: '🏛️'
  }
]

aRoute.post('/login', (req, res) => {
  try {
    const { username, password } = req.body
    const found = USERS.find(u => u.username === username && u.password === password)
    if (!found) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' })
    }
    const { password: _, username: __, ...user } = found
    const token = jT.sign(
      { username, role: user.role },
      process.env.JWT_SECRET || 'jansetu_secret_2026',
      { expiresIn: '24h' }
    )
    res.json({ success: true, token, user })
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' })
  }
})

module.exports = aRoute
