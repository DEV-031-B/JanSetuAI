export default function KPICard({ icon, label, value, sub, variant = 'default' }) {
  const variantClass = {
    default: 'kpi-card',
    saffron: 'kpi-card saffron',
    green: 'kpi-card green',
    red: 'kpi-card red'
  }[variant]

  return (
    <div className={`${variantClass} p-5`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm opacity-80">{label}</p>
          <p className="text-3xl font-black mt-1">{value}</p>
          {sub && <p className="text-xs opacity-70 mt-1">{sub}</p>}
        </div>
        <span className="text-3xl opacity-80">{icon}</span>
      </div>
    </div>
  )
}
