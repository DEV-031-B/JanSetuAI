/**
 * CPGRAMS Complaint Status Tracker
 * Tracks complaints on pgportal.gov.in
 */

async function trackCPGRAMSComplaint(registrationId) {
  try {
    const res = await fetch('https://pgportal.gov.in/home/ViewStatus', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `Grievance_No=${registrationId}`
    })
    const html = await res.text()
    const statusMatch = html.match(/Status[:\s]+([A-Za-z\s]+)/i)
    const deptMatch = html.match(/Department[:\s]+([A-Za-z\s]+)/i)
    return {
      registrationId,
      status: statusMatch ? statusMatch[1].trim() : 'In Process',
      department: deptMatch ? deptMatch[1].trim() : 'Under Review',
      source: 'cpgrams',
      trackedAt: new Date().toISOString()
    }
  } catch (err) {
    return {
      registrationId,
      status: 'Status tracking temporarily unavailable',
      message: 'Please check pgportal.gov.in directly',
      portalUrl: `https://pgportal.gov.in/home/ViewStatus?ref=${registrationId}`,
      source: 'cpgrams',
      trackedAt: new Date().toISOString()
    }
  }
}

module.exports = { trackCPGRAMSComplaint }
