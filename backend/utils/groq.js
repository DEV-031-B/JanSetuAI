const Groq = require('groq-sdk')
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

async function callGroq(systemPrompt, userContent, fallback) {
  try {
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      temperature: 0.3,
      max_tokens: 1000,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userContent }
      ]
    })
    let text = completion.choices[0].message.content
    text = text.replace(/```json/g, '').replace(/```/g, '').trim()
    return JSON.parse(text)
  } catch (err) {
    console.error('Groq error:', err.message)
    return fallback
  }
}

module.exports = { callGroq }
