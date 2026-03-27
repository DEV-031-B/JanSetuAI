import { useNavigate } from 'react-router-dom'

export default function BackButton() {
  const navigate = useNavigate()
  return (
    <button 
      onClick={() => navigate(-1)} 
      className="mb-4 text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-navy flex items-center gap-2 transition-colors print:hidden"
    >
      <span>←</span> Back
    </button>
  )
}
