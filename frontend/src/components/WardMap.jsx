import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Fix generic icon path issues with leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export default function WardMap({ complaints }) {
  // Center roughly on Greater Noida / UP region
  const center = [28.4744, 77.4977] 
  
  return (
    <div className="h-[400px] w-full rounded-xl overflow-hidden shadow-sm border border-gray-100 relative z-0">
      <MapContainer 
        center={center} 
        zoom={12} 
        scrollWheelZoom={false} 
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {complaints.map(c => {
          if(!c.location || !c.location.coordinates || c.location.coordinates.length < 2) return null;
          // MongoDB GeoJSON is [lng, lat], Leaflet renders with [lat, lng]
          const pos = [c.location.coordinates[1], c.location.coordinates[0]]
          return (
            <Marker key={c._id} position={pos}>
              <Popup>
                <div className="text-xs">
                  <strong className="text-sm text-navy">{c.serviceType}</strong><br/>
                  <span className="text-gray-500 mt-1 block">{c.ward}</span>
                  <div className="mt-1">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                      c.urgency === 'High' ? 'bg-red-100 text-red-700' : 
                      c.urgency === 'Medium' ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'
                    }`}>
                      {c.urgency} Priority
                    </span>
                    <span className={`ml-1 px-1.5 py-0.5 rounded text-[10px] font-bold ${
                      c.status === 'resolved' ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {c.status.replace('_', ' ')}
                    </span>
                  </div>
                  {c.aiSummary && <p className="text-gray-400 mt-2 line-clamp-2 max-w-[200px] leading-tight">{c.aiSummary}</p>}
                </div>
              </Popup>
            </Marker>
          )
        })}
      </MapContainer>
    </div>
  )
}
