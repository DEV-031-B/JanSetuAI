export default function IndiaFlagStrip({ withGovBar = false }) {
  return (
    <div>
      <div className="flag-strip" />
      {withGovBar && (
        <div className="gov-bar">
          <span>🇮🇳 भारत सरकार — Government of India | JanSetu AI v2.0</span>
          <span>Greater Noida Municipal Corporation — UP | {new Date().toLocaleDateString('en-IN')}</span>
        </div>
      )}
    </div>
  )
}
