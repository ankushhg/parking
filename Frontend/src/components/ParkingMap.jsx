import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix default marker icon broken in webpack/vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Custom colored marker
function coloredIcon(color) {
  return L.divIcon({
    className: "",
    html: `<div style="
      width:14px;height:14px;border-radius:50%;
      background:${color};border:2px solid white;
      box-shadow:0 1px 4px rgba(0,0,0,0.3)">
    </div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });
}

export default function ParkingMap({ slots, selectedLocation, onSelectLocation }) {
  // Group slots by location and compute stats
  const locationMap = {};
  slots.forEach((s) => {
    if (!s.location || !s.latitude || !s.longitude) return;
    if (!locationMap[s.location]) {
      locationMap[s.location] = {
        name: s.location,
        lat: s.latitude,
        lng: s.longitude,
        total: 0,
        free: 0,
      };
    }
    locationMap[s.location].total++;
    if (s.available) locationMap[s.location].free++;
  });

  const locations = Object.values(locationMap);

  if (locations.length === 0) {
    return (
      <div className="rounded-2xl bg-white/80 border border-black/5 p-6 shadow-sm flex items-center justify-center h-64 text-sm text-neutral-400">
        No location data available. Add slots with location from Admin Dashboard.
      </div>
    );
  }

  // Center map on first location
  const center = [locations[0].lat, locations[0].lng];

  return (
    <div className="rounded-2xl overflow-hidden border border-black/5 shadow-sm" style={{ height: "360px" }}>
      <MapContainer center={center} zoom={13} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {locations.map((loc) => {
          const isFull = loc.free === 0;
          const isSelected = selectedLocation === loc.name;
          return (
            <Marker
              key={loc.name}
              position={[loc.lat, loc.lng]}
              icon={coloredIcon(isFull ? "#ef4444" : isSelected ? "#0a0a0a" : "#10b981")}
            >
              <Popup>
                <div className="text-sm font-semibold">{loc.name}</div>
                <div className="text-xs text-gray-500 mt-1">
                  {loc.free} / {loc.total} slots free
                </div>
                <button
                  onClick={() => onSelectLocation(isSelected ? null : loc.name)}
                  style={{
                    marginTop: "8px",
                    padding: "4px 12px",
                    borderRadius: "999px",
                    background: isSelected ? "#f5f5f5" : "#0a0a0a",
                    color: isSelected ? "#333" : "#fff",
                    fontSize: "12px",
                    fontWeight: "600",
                    border: "none",
                    cursor: "pointer",
                    width: "100%",
                  }}
                >
                  {isSelected ? "Show all" : "View slots"}
                </button>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
