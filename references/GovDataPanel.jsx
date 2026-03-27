// JanSetu AI v2.0 — Government Data Panel Component
// Shows real Indian government data vs JanSetu AI performance

import { useState, useEffect } from 'react'
import api from '../api'

export default function GovDataPanel({ dark = false }) {
  const [govData, setGovData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('national')

  const t = {
    bg: dark ? '#1a1a2e' : '#ffffff',
    card: dark ? '#16213e' : '#f8fafc',
    border: dark ? '#0f3460' : '#e2e8f0',
    text: dark ? '#e2e8f0' : '#1e293b',
    muted: dark ? '#94a3b8' : '#64748b',
    primary: '#2563eb',
    saffron: '#FF9933',
    green: '#138808',
    red: '#dc2626',
    yellow: '#d97706'
  }

  useEffect(() => {
    api.getGovDashboardPanel()
      .then(data => {
        if (data.success) setGovData(data.panel)
      })
      .catch(err => console.log('GovData error:', err.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div style={{ padding: 24, textAlign: 'center', color: t.muted }}>
      Loading real government data...
    </div>
  )

  if (!govData) return null

  const tabs = [
    { id: 'national', label: '🇮🇳 National' },
    { id: 'up', label: '📍 UP/Delhi' },
    { id: 'compare', label: '⚡ JanSetu vs CPGRAMS' },
    { id: 'trend', label: '📈 Trend' }
  ]

  return (
    <div style={{
      background: t.card,
      border: `1px solid ${t.border}`,
      borderRadius: 12,
      overflow: 'hidden',
      marginBottom: 24
    }}>
      {/* Header */}
      <div style={{
        background: `linear-gradient(135deg, #1e3a5f, #2563eb)`,
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div>
          <div style={{ color: '#fff', fontWeight: 700, fontSize: 14 }}>
            🏛️ India Grievance Intelligence Dashboard
          </div>
          <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11, marginTop: 2 }}>
            Real data from CPGRAMS + Rajya Sabha Reports + data.gov.in
          </div>
        </div>
        <div style={{
          background: 'rgba(255,255,255,0.15)',
          padding: '4px 10px',
          borderRadius: 20,
          color: '#fff',
          fontSize: 10,
          fontWeight: 600
        }}>
          LIVE GOVT DATA
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        borderBottom: `1px solid ${t.border}`,
        background: t.bg
      }}>
        {tabs.map(tab => (
          <button key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '10px 16px',
              border: 'none',
              background: activeTab === tab.id ? t.primary : 'transparent',
              color: activeTab === tab.id ? '#fff' : t.muted,
              cursor: 'pointer',
              fontSize: 11,
              fontWeight: activeTab === tab.id ? 700 : 400,
              borderBottom: activeTab === tab.id
                ? `2px solid ${t.primary}` : '2px solid transparent'
            }}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ padding: 20 }}>

        {/* NATIONAL TAB */}
        {activeTab === 'national' && govData.nationalStats && (
          <div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 12,
              marginBottom: 16
            }}>
              {[
                { label: 'Total Complaints (All India)', value: govData.nationalStats.totalComplaints?.toLocaleString('en-IN'), color: t.primary },
                { label: 'Currently Pending', value: govData.nationalStats.pending?.toLocaleString('en-IN'), color: t.red },
                { label: 'Resolution Rate', value: govData.nationalStats.resolutionRate + '%', color: t.green },
                { label: 'Avg Resolution', value: govData.nationalStats.avgResolutionDays + '+ days', color: t.yellow },
                { label: 'Satisfaction Rate', value: govData.nationalStats.satisfactionRate + '%', color: t.yellow },
                { label: 'Ministries Connected', value: govData.nationalStats.ministriesConnected, color: t.primary }
              ].map((stat, i) => (
                <div key={i} style={{
                  background: t.card,
                  border: `1px solid ${t.border}`,
                  borderRadius: 8,
                  padding: 12,
                  textAlign: 'center'
                }}>
                  <div style={{ color: stat.color, fontSize: 20, fontWeight: 800 }}>
                    {stat.value}
                  </div>
                  <div style={{ color: t.muted, fontSize: 10, marginTop: 4 }}>
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
            <div style={{
              background: dark ? 'rgba(37,99,235,0.1)' : '#eff6ff',
              border: `1px solid ${t.primary}`,
              borderRadius: 8,
              padding: 12,
              fontSize: 11,
              color: t.muted
            }}>
              📊 Source: {govData.source} |{' '}
              <a href={govData.reportUrl} target="_blank" rel="noreferrer"
                style={{ color: t.primary }}>
                View Official Report →
              </a>
            </div>
          </div>
        )}

        {/* UP/DELHI TAB */}
        {activeTab === 'up' && govData.upStats && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {[
              { title: '📍 Uttar Pradesh (JanSetu AI State)', data: govData.upStats },
              { title: '🏙️ Delhi NCR', data: govData.delhiStats }
            ].map((item, i) => (
              <div key={i} style={{
                background: t.card,
                border: `1px solid ${t.border}`,
                borderRadius: 8,
                padding: 16
              }}>
                <div style={{ fontWeight: 700, fontSize: 12, color: t.text, marginBottom: 12 }}>
                  {item.title}
                </div>
                {[
                  { label: 'Total Received', value: item.data.receipt?.toLocaleString('en-IN') },
                  { label: 'Pending', value: item.data.pending?.toLocaleString('en-IN') },
                  { label: 'Resolution Rate', value: item.data.resolutionRate + '%' }
                ].map((stat, j) => (
                  <div key={j} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '6px 0',
                    borderBottom: `1px solid ${t.border}`,
                    fontSize: 11
                  }}>
                    <span style={{ color: t.muted }}>{stat.label}</span>
                    <span style={{ color: t.text, fontWeight: 600 }}>{stat.value}</span>
                  </div>
                ))}
                {i === 0 && (
                  <div style={{
                    marginTop: 8,
                    background: dark ? 'rgba(255,153,51,0.1)' : '#fff7ed',
                    border: `1px solid ${t.saffron}`,
                    borderRadius: 6,
                    padding: 8,
                    fontSize: 10,
                    color: t.saffron
                  }}>
                    🏆 UP Rank #1 in India for grievances
                    Greater Noida is in UP — JanSetu AI serves this district
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* COMPARE TAB */}
        {activeTab === 'compare' && govData.vsJanSetuAI && (
          <div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
              gap: 2,
              background: t.border,
              borderRadius: 8,
              overflow: 'hidden'
            }}>
              {/* Header */}
              <div style={{ background: t.card, padding: '10px 12px', fontWeight: 700, fontSize: 11, color: t.muted }}>
                Feature
              </div>
              <div style={{ background: '#fef2f2', padding: '10px 12px', fontWeight: 700, fontSize: 11, color: t.red, textAlign: 'center' }}>
                CPGRAMS (Existing)
              </div>
              <div style={{ background: '#eff6ff', padding: '10px 12px', fontWeight: 700, fontSize: 11, color: t.primary, textAlign: 'center' }}>
                JanSetu AI (Our System)
              </div>

              {/* Rows */}
              {[
                ['Resolution Time', '30+ days', '2-7 days ⚡'],
                ['AI Categorization', '❌ None', '✅ Groq llama-3.3-70b'],
                ['Languages', '❌ English only', '✅ Hindi + English + Hinglish'],
                ['Ward GIS Score', '❌ None', '✅ Real-time formula'],
                ['Predictive Escalation', '❌ None', '✅ Auto at 3+ complaints'],
                ['Citizen Satisfaction', '51%', '✅ Real-time tracked'],
                ['Executive Brief', '❌ None', '✅ AI generated weekly'],
                ['Voter Intelligence', '❌ None', '✅ Booth-level segmentation'],
                ['Cost', '₹128 Crore govt budget', '✅ Free (Firebase + Groq)']
              ].map(([feature, cpgrams, jansetu], i) => (
                <>
                  <div key={`f${i}`} style={{
                    background: t.card,
                    padding: '8px 12px',
                    fontSize: 11,
                    color: t.text,
                    borderTop: `1px solid ${t.border}`
                  }}>
                    {feature}
                  </div>
                  <div key={`c${i}`} style={{
                    background: '#fef9f9',
                    padding: '8px 12px',
                    fontSize: 11,
                    color: t.red,
                    textAlign: 'center',
                    borderTop: `1px solid ${t.border}`
                  }}>
                    {cpgrams}
                  </div>
                  <div key={`j${i}`} style={{
                    background: '#f0f9ff',
                    padding: '8px 12px',
                    fontSize: 11,
                    color: t.primary,
                    textAlign: 'center',
                    borderTop: `1px solid ${t.border}`
                  }}>
                    {jansetu}
                  </div>
                </>
              ))}
            </div>

            <div style={{
              marginTop: 12,
              background: dark ? 'rgba(19,136,8,0.1)' : '#f0fdf4',
              border: `1px solid ${t.green}`,
              borderRadius: 8,
              padding: 12,
              fontSize: 11,
              color: t.green,
              fontStyle: 'italic'
            }}>
              💡 "CPGRAMS issued a tender in 2024 to rebuild with AI features worth ₹128 Crore.
              JanSetu AI is exactly that system — built, working, and free."
            </div>
          </div>
        )}

        {/* TREND TAB */}
        {activeTab === 'trend' && govData.yearlyData && (
          <div>
            <div style={{ marginBottom: 12, fontSize: 12, color: t.muted }}>
              India Grievance Volume 2018-2024 (Source: Rajya Sabha Reports)
            </div>
            {govData.yearlyData.map((year, i) => (
              <div key={i} style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                marginBottom: 8
              }}>
                <div style={{ width: 40, fontSize: 11, color: t.muted, fontWeight: 600 }}>
                  {year.year}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{
                    height: 20,
                    background: `linear-gradient(90deg, ${t.primary}, #60a5fa)`,
                    width: `${(year.received / 2400000) * 100}%`,
                    borderRadius: 4,
                    minWidth: 4
                  }} />
                </div>
                <div style={{ width: 80, fontSize: 11, color: t.text, textAlign: 'right' }}>
                  {year.received?.toLocaleString('en-IN')}
                </div>
              </div>
            ))}
            <div style={{
              marginTop: 12,
              fontSize: 11,
              color: t.muted,
              background: t.card,
              padding: 10,
              borderRadius: 8,
              border: `1px solid ${t.border}`
            }}>
              📈 India's complaint volume growing ~20% per year.
              Total 10.4 Million complaints received 2020-2024.
              JanSetu AI adds AI intelligence to handle this scale.
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
