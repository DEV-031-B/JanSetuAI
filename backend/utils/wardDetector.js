/**
 * Ward Detector — Greater Noida ward mapping
 * Covers Delhi NCR + Greater Noida localities
 */
const WARD_NAMES = [
  { wardNumber: 1, wardName: 'Alpha 1',         keyword: 'alpha 1' },
  { wardNumber: 2, wardName: 'Alpha 2',         keyword: 'alpha 2' },
  { wardNumber: 3, wardName: 'Beta 1',          keyword: 'beta 1' },
  { wardNumber: 4, wardName: 'Beta 2',          keyword: 'beta' },
  { wardNumber: 5, wardName: 'Gamma 1',         keyword: 'gamma' },
  { wardNumber: 6, wardName: 'Delta 1',         keyword: 'delta' },
  { wardNumber: 7, wardName: 'Knowledge Park',  keyword: 'knowledge park' },
  { wardNumber: 8, wardName: 'Tech Zone',       keyword: 'tech zone' },
  { wardNumber: 9, wardName: 'Sector 1',        keyword: 'sector 1' },
  { wardNumber: 10, wardName: 'Sector 4',       keyword: 'sector 4' },
  { wardNumber: 11, wardName: 'Sector 12',      keyword: 'sector 12' },
  { wardNumber: 12, wardName: 'Sector 15',      keyword: 'sector 15' },
  { wardNumber: 13, wardName: 'Sector 37',      keyword: 'sector 37' },
  { wardNumber: 14, wardName: 'Sector 50',      keyword: 'sector 50' },
  { wardNumber: 15, wardName: 'Sector 62',      keyword: 'sector 62' },
  { wardNumber: 16, wardName: 'Sector 137',     keyword: 'sector 137' }
]

function detectWard(address, wardInput) {
  const combined = `${address || ''} ${wardInput || ''}`.toLowerCase()
  
  // Exact match override from form
  if (wardInput && wardInput.trim() !== '') {
    const directMatch = WARD_NAMES.find(w => w.wardName.toLowerCase() === wardInput.toLowerCase().trim())
    if (directMatch) return { ward: directMatch.wardName, wardNumber: directMatch.wardNumber }
  }

  // NLP fuzzy mapping
  for (const w of WARD_NAMES) {
    if (combined.includes(w.keyword)) {
      return { ward: w.wardName, wardNumber: w.wardNumber }
    }
  }

  return { ward: 'Sector 12', wardNumber: 11 } // Default fallback
}

module.exports = { detectWard, WARD_NAMES }
