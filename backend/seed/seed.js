require('dotenv').config()
const mongoose = require('mongoose')
const Complaint = require('../models/Complaint')
const Worker = require('../models/Worker')
const Task = require('../models/Task')
const Voter = require('../models/Voter')
const SentimentReport = require('../models/SentimentReport')
const { predictResolutionDays, calculateSLADeadline } = require('../utils/mlPredictor')

const DEPT_MAP = {
  Water: 'Jal Nigam — Water Authority',
  Roads: 'PWD — Public Works Department',
  Electricity: 'UPPCL — Electricity Department',
  Garbage: 'Nagar Palika — Sanitation Wing',
  Other: 'General Administration'
}

function makeComplaint(data) {
  const id = 'GRV-' + (Date.now() + Math.floor(Math.random() * 99999))
  const { type, urgency, status, ward, wardNumber, desc, isEscalated = false } = data
  const slaDeadline = calculateSLADeadline(type)
  const predictedDays = predictResolutionDays(type, urgency, wardNumber)
  const resolvedAt = status === 'resolved' ? new Date(Date.now() - Math.random() * 5 * 86400000) : null
  return {
    serviceRequestId: id,
    serviceType: type,
    agencyName: DEPT_MAP[type],
    description: desc,
    descriptionHindi: desc,
    address: ward + ', Greater Noida',
    ward,
    wardNumber,
    district: 'Greater Noida',
    state: 'Uttar Pradesh',
    citizenName: ['Ramesh Kumar', 'Sunita Devi', 'Manoj Singh', 'Geeta Sharma', 'Rajesh Yadav'][Math.floor(Math.random() * 5)],
    citizenPhone: '9' + Math.floor(Math.random() * 900000000 + 100000000),
    status,
    urgency,
    aiCategory: type,
    aiUrgency: urgency,
    aiSummary: `Complaint about ${type.toLowerCase()} issue in ${ward}.`,
    aiHindiSummary: `${ward} में ${type === 'Water' ? 'पानी' : type === 'Roads' ? 'सड़क' : type === 'Electricity' ? 'बिजली' : type === 'Garbage' ? 'सफाई' : 'अन्य'} की समस्या।`,
    aiKeywords: [type, ward, urgency],
    aiSentiment: urgency === 'High' ? 'frustrated' : 'neutral',
    isEscalated,
    predictedResolutionDays: predictedDays,
    slaDeadline,
    isSlaBreach: status !== 'resolved' && new Date() > slaDeadline,
    source: 'jansetu',
    resolvedAt,
    actualResolutionDays: resolvedAt ? Math.ceil((resolvedAt - new Date(Date.now() - 15 * 86400000)) / 86400000) : null,
    location: { type: 'Point', coordinates: [77.4977 + Math.random() * 0.1, 28.4744 + Math.random() * 0.1] }
  }
}

const SEED_COMPLAINTS = [
  // Ward 1 — Sector 12 (5 complaints)
  { type: 'Water', urgency: 'High', status: 'pending', ward: 'Ward 1 — Sector 12', wardNumber: 1,
    desc: 'Sector 12 mein paani 5 din se bilkul band hai, log tanker ke liye road par ghante khade rehte hain, bacho ko school nahi ja pa rahe' },
  { type: 'Roads', urgency: 'High', status: 'in_progress', ward: 'Ward 1 — Sector 12', wardNumber: 1,
    desc: 'Sector 16 main road par itne bade gadhde hain ki motorcycle palat gayi, 2 logon ko chot aayi, koi sunwai nahi' },
  { type: 'Garbage', urgency: 'Medium', status: 'resolved', ward: 'Ward 1 — Sector 12', wardNumber: 1,
    desc: 'Ecotech 1 mein dustbin full ho gayi, kachra sadak par bikhar raha hai aur bimari failne ka darr hai' },
  { type: 'Electricity', urgency: 'Medium', status: 'pending', ward: 'Ward 1 — Sector 12', wardNumber: 1,
    desc: 'Sector 12 Block B mein street lights 10 din se band hain, raat andhera rehta hai mahilayein darri hain' },
  { type: 'Water', urgency: 'High', status: 'escalated', ward: 'Ward 1 — Sector 12', wardNumber: 1, isEscalated: true,
    desc: 'Sector 12 Block C mein main pipe fut gaya hai, pure mohalle mein paani waste ho raha hai, 3 din ho gaye koi nahi aaya' },
  // Ward 2 — Knowledge Park (4 complaints)
  { type: 'Roads', urgency: 'High', status: 'escalated', ward: 'Ward 2 — Knowledge Park', wardNumber: 2, isEscalated: true,
    desc: 'Knowledge Park 2 road par bahut bade gadhde, is mahine 2 serious accidents ho chuke hain' },
  { type: 'Water', urgency: 'Medium', status: 'in_progress', ward: 'Ward 2 — Knowledge Park', wardNumber: 2,
    desc: 'Knowledge Park 3 mein water pressure itna kam ki 3rd floor tak paani bilkul nahi pahunchta' },
  { type: 'Electricity', urgency: 'High', status: 'resolved', ward: 'Ward 2 — Knowledge Park', wardNumber: 2,
    desc: 'KP 1 mein transformer kharab ho gaya 2 din se puri society mein bijli nahi' },
  { type: 'Garbage', urgency: 'Medium', status: 'pending', ward: 'Ward 2 — Knowledge Park', wardNumber: 2,
    desc: 'Knowledge Park society mein sweepers 1 hafte se nahi aaye bahut buri condition' },
  // Ward 3 — Sector 15 (4 complaints)
  { type: 'Roads', urgency: 'High', status: 'pending', ward: 'Ward 3 — Sector 15', wardNumber: 3,
    desc: 'Sector 15 main crossing par traffic signal 2 hafte se kharab hai roz accidents ka darr' },
  { type: 'Water', urgency: 'High', status: 'escalated', ward: 'Ward 3 — Sector 15', wardNumber: 3, isEscalated: true,
    desc: 'Omicron 1 mein naali overflow ho rahi hai ghar ke andar paani ghus gaya sab pareshan' },
  { type: 'Electricity', urgency: 'Medium', status: 'in_progress', ward: 'Ward 3 — Sector 15', wardNumber: 3,
    desc: 'Sector 18 mein bijli transformer overload ho raha hai roz trip karta hai' },
  { type: 'Garbage', urgency: 'Low', status: 'resolved', ward: 'Ward 3 — Sector 15', wardNumber: 3,
    desc: 'Sector 15 park mein mahino se safai nahi hui bachon ko khelne nahi de sakte' },
  // Ward 4 — Alpha 1 (4 complaints)
  { type: 'Water', urgency: 'High', status: 'escalated', ward: 'Ward 4 — Alpha 1', wardNumber: 4, isEscalated: true,
    desc: 'Alpha 1 mein naali overflow ho rahi hai ghar ke andar paani ghus gaya furniture kharab' },
  { type: 'Roads', urgency: 'High', status: 'pending', ward: 'Ward 4 — Alpha 1', wardNumber: 4,
    desc: 'Alpha 2 main road par sewer line toot gayi 3 din se sadak par paani bhar gaya' },
  { type: 'Electricity', urgency: 'Medium', status: 'resolved', ward: 'Ward 4 — Alpha 1', wardNumber: 4,
    desc: 'Alpha Commercial Belt mein 15 din se street lights band hain dukandaron ko dikkat' },
  { type: 'Garbage', urgency: 'Medium', status: 'in_progress', ward: 'Ward 4 — Alpha 1', wardNumber: 4,
    desc: 'Alpha 1 mein kachra 5 din se nahi utha makkhi machhar bahut ho gaye dengue ka darr' },
  // Ward 5 — Beta 2 (4 complaints)
  { type: 'Electricity', urgency: 'High', status: 'pending', ward: 'Ward 5 — Beta 2', wardNumber: 5,
    desc: 'Beta 2 society mein roz 8-10 ghante bijli nahi aati inverter bhi charge nahi hota' },
  { type: 'Roads', urgency: 'Medium', status: 'pending', ward: 'Ward 5 — Beta 2', wardNumber: 5,
    desc: 'Beta 1 flyover ke neeche sadak bahut kharab baarish mein aur bura hoga' },
  { type: 'Water', urgency: 'High', status: 'in_progress', ward: 'Ward 5 — Beta 2', wardNumber: 5,
    desc: 'Chi Phi area mein paani sirf 1 ghanta aata hai subah tank bhi nahi bharta' },
  { type: 'Garbage', urgency: 'High', status: 'escalated', ward: 'Ward 5 — Beta 2', wardNumber: 5, isEscalated: true,
    desc: 'Beta 2 mein safai wale ek hafte se nahi aaye health hazard ban raha hai' },
  // Ward 6 — Gamma 1 (4 complaints)
  { type: 'Garbage', urgency: 'High', status: 'pending', ward: 'Ward 6 — Gamma 1', wardNumber: 6,
    desc: 'Gamma 1 market ke paas kachra ek hafte se nahi utha bimari failne ka serious darr' },
  { type: 'Water', urgency: 'Medium', status: 'resolved', ward: 'Ward 6 — Gamma 1', wardNumber: 6,
    desc: 'Gamma 2 mein paani ka pressure bahut kam hai oopar ke floor mein nahi pahunchta' },
  { type: 'Electricity', urgency: 'High', status: 'pending', ward: 'Ward 6 — Gamma 1', wardNumber: 6,
    desc: 'Delta sector mein street lights ki wiring kharab short circuit ka darr' },
  { type: 'Roads', urgency: 'Medium', status: 'in_progress', ward: 'Ward 6 — Gamma 1', wardNumber: 6,
    desc: 'Gamma 1 main road par bade gadhde hain baarish mein pond ban jaata hai' }
]

const SEED_VOTERS = [
  // Ward 1
  { name: 'Mohan Lal Verma', age: 45, gender: 'male', phone: '9876543210', address: 'Sector 12, Block A', ward: 'Ward 1 — Sector 12', wardNumber: 1, occupation: 'Government Employee', influenceScore: 8, isKeyVoter: true, schemes: [{ name: 'Ayushman Bharat', enrolled: true, benefitAmount: 500000 }] },
  { name: 'Savitri Devi', age: 52, gender: 'female', phone: '9876543211', address: 'Sector 12, Block B', ward: 'Ward 1 — Sector 12', wardNumber: 1, occupation: 'Housewife', influenceScore: 5, isKeyVoter: false, schemes: [{ name: 'Ujjwala Yojana', enrolled: true, benefitAmount: 3200 }] },
  { name: 'Rohit Sharma', age: 24, gender: 'male', phone: '9876543212', address: 'Ecotech 1', ward: 'Ward 1 — Sector 12', wardNumber: 1, occupation: 'Student', influenceScore: 3, isKeyVoter: false, schemes: [] },
  { name: 'Kamla Singh', age: 65, gender: 'female', phone: '9876543213', address: 'Sector 16', ward: 'Ward 1 — Sector 12', wardNumber: 1, occupation: 'Retired Teacher', influenceScore: 9, isKeyVoter: true, schemes: [{ name: 'Ayushman Bharat', enrolled: true, benefitAmount: 500000 }] },
  { name: 'Deepak Yadav', age: 38, gender: 'male', phone: '9876543214', address: 'Sector 12, Block C', ward: 'Ward 1 — Sector 12', wardNumber: 1, occupation: 'Shop Owner', influenceScore: 6, isKeyVoter: false, schemes: [{ name: 'PM Kisan', enrolled: false, benefitAmount: 0 }] },
  // Ward 2
  { name: 'Priya Mishra', age: 29, gender: 'female', phone: '9876543215', address: 'Knowledge Park 1', ward: 'Ward 2 — Knowledge Park', wardNumber: 2, occupation: 'Software Engineer', influenceScore: 4, isKeyVoter: false, schemes: [] },
  { name: 'Suresh Gupta', age: 55, gender: 'male', phone: '9876543216', address: 'Knowledge Park 2', ward: 'Ward 2 — Knowledge Park', wardNumber: 2, occupation: 'Businessman', influenceScore: 8, isKeyVoter: true, schemes: [{ name: 'PM Kisan', enrolled: true, benefitAmount: 6000 }] },
  { name: 'Anita Kumari', age: 33, gender: 'female', phone: '9876543217', address: 'Knowledge Park 3', ward: 'Ward 2 — Knowledge Park', wardNumber: 2, occupation: 'Teacher', influenceScore: 6, isKeyVoter: false, schemes: [{ name: 'Ayushman Bharat', enrolled: true, benefitAmount: 500000 }] },
  { name: 'Vijay Kumar', age: 48, gender: 'male', phone: '9876543218', address: 'KP 1 Market', ward: 'Ward 2 — Knowledge Park', wardNumber: 2, occupation: 'Kisan', influenceScore: 7, isKeyVoter: true, schemes: [{ name: 'PM Kisan', enrolled: true, benefitAmount: 6000 }] },
  { name: 'Rekha Sharma', age: 41, gender: 'female', phone: '9876543219', address: 'KP 2', ward: 'Ward 2 — Knowledge Park', wardNumber: 2, occupation: 'Nurse', influenceScore: 5, isKeyVoter: false, schemes: [{ name: 'Ujjwala Yojana', enrolled: true, benefitAmount: 3200 }] },
  // Ward 3
  { name: 'Ashok Pandey', age: 62, gender: 'male', phone: '9876543220', address: 'Sector 15', ward: 'Ward 3 — Sector 15', wardNumber: 3, occupation: 'Retired', influenceScore: 9, isKeyVoter: true, schemes: [{ name: 'Ayushman Bharat', enrolled: true, benefitAmount: 500000 }] },
  { name: 'Meena Tiwari', age: 27, gender: 'female', phone: '9876543221', address: 'Omicron 1', ward: 'Ward 3 — Sector 15', wardNumber: 3, occupation: 'Nurse', influenceScore: 4, isKeyVoter: false, schemes: [] },
  { name: 'Ramkumar Patel', age: 50, gender: 'male', phone: '9876543222', address: 'Sector 18', ward: 'Ward 3 — Sector 15', wardNumber: 3, occupation: 'Kisan', influenceScore: 6, isKeyVoter: false, schemes: [{ name: 'PM Kisan', enrolled: true, benefitAmount: 6000 }] },
  { name: 'Sunita Joshi', age: 35, gender: 'female', phone: '9876543223', address: 'Sector 15, Block A', ward: 'Ward 3 — Sector 15', wardNumber: 3, occupation: 'Dukandaar', influenceScore: 5, isKeyVoter: false, schemes: [] },
  { name: 'Naveen Tripathi', age: 22, gender: 'male', phone: '9876543224', address: 'Sector 15, Block B', ward: 'Ward 3 — Sector 15', wardNumber: 3, occupation: 'Student', influenceScore: 2, isKeyVoter: false, schemes: [] },
  // Ward 4
  { name: 'Saroj Devi', age: 58, gender: 'female', phone: '9876543225', address: 'Alpha 1, Block C', ward: 'Ward 4 — Alpha 1', wardNumber: 4, occupation: 'Housewife', influenceScore: 7, isKeyVoter: true, schemes: [{ name: 'Ujjwala Yojana', enrolled: true, benefitAmount: 3200 }] },
  { name: 'Dinesh Chaudhary', age: 43, gender: 'male', phone: '9876543226', address: 'Alpha 2', ward: 'Ward 4 — Alpha 1', wardNumber: 4, occupation: 'Vyapari', influenceScore: 8, isKeyVoter: true, schemes: [] },
  { name: 'Puja Agarwal', age: 31, gender: 'female', phone: '9876543227', address: 'Alpha Commercial', ward: 'Ward 4 — Alpha 1', wardNumber: 4, occupation: 'Accountant', influenceScore: 4, isKeyVoter: false, schemes: [{ name: 'Ayushman Bharat', enrolled: true, benefitAmount: 500000 }] },
  { name: 'Manoj Dubey', age: 19, gender: 'male', phone: '9876543228', address: 'Alpha 1', ward: 'Ward 4 — Alpha 1', wardNumber: 4, occupation: 'Student', influenceScore: 2, isKeyVoter: false, schemes: [] },
  { name: 'Lakshmi Prasad', age: 66, gender: 'male', phone: '9876543229', address: 'Alpha 1, Block A', ward: 'Ward 4 — Alpha 1', wardNumber: 4, occupation: 'Retired', influenceScore: 9, isKeyVoter: true, schemes: [{ name: 'Ayushman Bharat', enrolled: true, benefitAmount: 500000 }] },
  // Ward 5
  { name: 'Geeta Rawat', age: 39, gender: 'female', phone: '9876543230', address: 'Beta 2', ward: 'Ward 5 — Beta 2', wardNumber: 5, occupation: 'Teacher', influenceScore: 6, isKeyVoter: false, schemes: [] },
  { name: 'Rajesh Negi', age: 47, gender: 'male', phone: '9876543231', address: 'Beta 1', ward: 'Ward 5 — Beta 2', wardNumber: 5, occupation: 'Mobile Shop', influenceScore: 5, isKeyVoter: false, schemes: [] },
  { name: 'Pooja Chauhan', age: 25, gender: 'female', phone: '9876543232', address: 'Chi Phi', ward: 'Ward 5 — Beta 2', wardNumber: 5, occupation: 'Student', influenceScore: 3, isKeyVoter: false, schemes: [] },
  { name: 'Harish Bhatt', age: 53, gender: 'male', phone: '9876543233', address: 'Beta 2, Block D', ward: 'Ward 5 — Beta 2', wardNumber: 5, occupation: 'Kisan', influenceScore: 7, isKeyVoter: true, schemes: [{ name: 'PM Kisan', enrolled: true, benefitAmount: 6000 }] },
  { name: 'Renu Bhandari', age: 61, gender: 'female', phone: '9876543234', address: 'Beta 1 Market', ward: 'Ward 5 — Beta 2', wardNumber: 5, occupation: 'Retired', influenceScore: 8, isKeyVoter: true, schemes: [{ name: 'Ayushman Bharat', enrolled: true, benefitAmount: 500000 }] },
  // Ward 6
  { name: 'Sunil Sharma', age: 44, gender: 'male', phone: '9876543235', address: 'Gamma 1 Market', ward: 'Ward 6 — Gamma 1', wardNumber: 6, occupation: 'Vyapari', influenceScore: 7, isKeyVoter: true, schemes: [] },
  { name: 'Usha Rani', age: 49, gender: 'female', phone: '9876543236', address: 'Gamma 2', ward: 'Ward 6 — Gamma 1', wardNumber: 6, occupation: 'Housewife', influenceScore: 4, isKeyVoter: false, schemes: [{ name: 'Ujjwala Yojana', enrolled: true, benefitAmount: 3200 }] },
  { name: 'Anil Kumar', age: 36, gender: 'male', phone: '9876543237', address: 'Delta Sector', ward: 'Ward 6 — Gamma 1', wardNumber: 6, occupation: 'Electrician', influenceScore: 5, isKeyVoter: false, schemes: [] },
  { name: 'Kavita Jain', age: 28, gender: 'female', phone: '9876543238', address: 'Gamma 1, Block B', ward: 'Ward 6 — Gamma 1', wardNumber: 6, occupation: 'Teacher', influenceScore: 4, isKeyVoter: false, schemes: [] },
  { name: 'Vinod Saxena', age: 70, gender: 'male', phone: '9876543239', address: 'Gamma 1, Block A', ward: 'Ward 6 — Gamma 1', wardNumber: 6, occupation: 'Retired', influenceScore: 9, isKeyVoter: true, schemes: [{ name: 'Ayushman Bharat', enrolled: true, benefitAmount: 500000 }] }
]

const SEED_WORKERS = [
  { name: 'Rakesh Yadav', phone: '9988776651', ward: 'Ward 1 — Sector 12', wardNumber: 1, zone: 'Zone A', designation: 'Booth Adhyaksh', assignedBooths: [1, 2, 3], performanceScore: 87, tasksCompleted: 12 },
  { name: 'Sanjay Tiwari', phone: '9988776652', ward: 'Ward 2 — Knowledge Park', wardNumber: 2, zone: 'Zone B', designation: 'Mandal Prabhari', assignedBooths: [4, 5], performanceScore: 72, tasksCompleted: 8 },
  { name: 'Priti Sharma', phone: '9988776653', ward: 'Ward 3 — Sector 15', wardNumber: 3, zone: 'Zone A', designation: 'Ground Volunteer', assignedBooths: [6, 7, 8], performanceScore: 65, tasksCompleted: 15 },
  { name: 'Arun Misra', phone: '9988776654', ward: 'Ward 4 — Alpha 1', wardNumber: 4, zone: 'Zone C', designation: 'Shakti Kendra', assignedBooths: [9, 10], performanceScore: 91, tasksCompleted: 20 },
  { name: 'Meena Agarwal', phone: '9988776655', ward: 'Ward 5 — Beta 2', wardNumber: 5, zone: 'Zone B', designation: 'Booth Adhyaksh', assignedBooths: [11, 12, 13], performanceScore: 78, tasksCompleted: 11 }
]

const SEED_SENTIMENTS = [
  {
    ward: 'Ward 1 — Sector 12', wardNumber: 1, postsAnalyzed: 45,
    result: {
      overall_sentiment: 'negative', score: 28,
      top_issues: ['paani ki kami', 'sadak ki kharaabi', 'bijli gul'],
      ward_mood: 'Ward 1 mein logo ka mood bahut kharab hai, basic suvidhaon ki kami se log gusse mein hain.',
      alert: true,
      recommended_action: 'Urgent action required on water supply and road repairs in Sector 12.',
      language_breakdown: { hindi: 55, english: 15, hinglish: 30 }
    },
    rawPosts: ['paani 5 din se nahi aaya', 'sadak toot gayi hai', 'bijli jaati rehti hai']
  },
  {
    ward: 'Ward 3 — Sector 15', wardNumber: 3, postsAnalyzed: 38,
    result: {
      overall_sentiment: 'negative', score: 32,
      top_issues: ['traffic signal kharab', 'naali overflow', 'safai nahi'],
      ward_mood: 'Ward 3 mein nagrikoon mein aakrosh hai, especially traffic aur safai ke baare mein.',
      alert: true,
      recommended_action: 'Prioritize traffic signal repair and drainage cleaning in Sector 15.',
      language_breakdown: { hindi: 60, english: 10, hinglish: 30 }
    },
    rawPosts: ['signal kab theek hoga', 'naali overflow buri baat hai', 'safai waale nahi aate']
  },
  {
    ward: 'Ward 4 — Alpha 1', wardNumber: 4, postsAnalyzed: 29,
    result: {
      overall_sentiment: 'neutral', score: 55,
      top_issues: ['kachra uthwaana', 'bijli', 'road maintenance'],
      ward_mood: 'Ward 4 mein log thodi bhi khushi se nahi hain lekin crisis jaisi situation nahi hai.',
      alert: false,
      recommended_action: 'Continue regular waste collection and street light maintenance in Alpha sector.',
      language_breakdown: { hindi: 45, english: 25, hinglish: 30 }
    },
    rawPosts: ['kachra thoda late aata hai', 'bijli theek hai', 'road okay hai']
  }
]

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('✅ MongoDB connected for seeding')

    // Clear all
    await Promise.all([
      Complaint.deleteMany({}),
      Worker.deleteMany({}),
      Task.deleteMany({}),
      Voter.deleteMany({}),
      SentimentReport.deleteMany({})
    ])
    console.log('🗑️  Collections cleared')

    // Insert complaints
    const complaints = SEED_COMPLAINTS.map(makeComplaint)
    await Complaint.insertMany(complaints)
    console.log('📋 Complaints: 25 seeded')

    // Insert voters
    await Voter.insertMany(SEED_VOTERS)
    console.log('👥 Voters: 30 seeded')

    // Insert workers
    await Worker.insertMany(SEED_WORKERS)
    console.log('👷 Workers: 5 seeded')

    // Insert sentiment
    await SentimentReport.insertMany(SEED_SENTIMENTS)
    console.log('📊 Sentiment Reports: 3 seeded')

    console.log('')
    console.log('✅ JanSetu AI v2.0 Seeding Complete')
    console.log('📋 Complaints: 25')
    console.log('👥 Voters: 30')
    console.log('👷 Workers: 5')
    console.log('📊 Sentiment: 3')
    process.exit(0)
  } catch (err) {
    console.error('❌ Seeding error:', err.message)
    process.exit(1)
  }
}

seed()
