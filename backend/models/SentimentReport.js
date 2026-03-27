const mongoose = require('mongoose')

const SentimentSchema = new mongoose.Schema({
  ward: String,
  wardNumber: Number,
  postsAnalyzed: Number,
  result: {
    overall_sentiment: String,
    score: Number,
    top_issues: [String],
    ward_mood: String,
    alert: Boolean,
    recommended_action: String,
    language_breakdown: {
      hindi: Number,
      english: Number,
      hinglish: Number
    }
  },
  rawPosts: [String]
}, { timestamps: true })

module.exports = mongoose.model('SentimentReport', SentimentSchema)
