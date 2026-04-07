import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { MapPin } from 'lucide-react';

// Fix Leaflet default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Deterministic color from SOS ID — no random flickering
const getColorFromId = (id = '') => {
  const colors = ['red', 'blue', 'orange', 'green', 'purple'];
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

const colorMap = {
  red:    { bg: '#ef4444', border: '#b91c1c' },
  blue:   { bg: '#3b82f6', border: '#1d4ed8' },
  orange: { bg: '#f97316', border: '#c2410c' },
  green:  { bg: '#22c55e', border: '#15803d' },
  purple: { bg: '#8b5cf6', border: '#6d28d9' },
};

const createSOSIcon = (sosId, isSelected = false) => {
  const colorName = isSelected ? 'red' : getColorFromId(sosId);
  const { bg, border } = colorMap[colorName] || colorMap.red;
  const size = isSelected ? 38 : 28;

  return L.divIcon({
    html: `
      <div style="
        width:${size}px; height:${size}px;
        background:${bg};
        border:2px solid ${isSelected ? '#facc15' : border};
        border-radius:50%;
        display:flex; align-items:center; justify-content:center;
        box-shadow:0 2px 8px rgba(0,0,0,0.3);
        ${isSelected ? 'animation: pulse 1.5s infinite;' : ''}
      ">
        <svg width="${size * 0.5}" height="${size * 0.5}" fill="white" viewBox="0 0 20 20">
          <path fill-rule="evenodd"
            d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
            clip-rule="evenodd"/>
        </svg>
      </div>
    `,
    className: '',
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size],
  });
};

// Auto fit map bounds when markers change
const MapFitBounds = ({ bounds }) => {
  const map = useMap();
  useEffect(() => {
    if (bounds?.length > 0) {
      const valid = bounds.filter(b => b && b.length === 2 && b[0] && b[1]);
      if (valid.length > 0) {
        map.fitBounds(valid, { padding: [50, 50], maxZoom: 15 });
      }
    }
  }, [bounds, map]);
  return null;
};

export const MapView = ({ sosList = [], selectedSOS, trackingPoints = [], loading }) => {
  // ✅ Only show loading overlay on first load, not on every poll
  const [initialLoaded, setInitialLoaded] = useState(false);
  useEffect(() => {
    if (!loading && !initialLoaded) setInitialLoaded(true);
  }, [loading]);

  const showLoadingOverlay = loading && !initialLoaded;

  // Default center — Delhi
  const defaultCenter = [28.6139, 77.2090];

  // Build bounds from SOS locations + tracking points
  const bounds = [
    ...sosList
      .filter(s => s.initialLocation?.latitude && s.initialLocation?.longitude)
      .map(s => [s.initialLocation.latitude, s.initialLocation.longitude]),
    ...trackingPoints
      .filter(p => p.location?.latitude && p.location?.longitude)
      .map(p => [p.location.latitude, p.location.longitude]),
  ];

  // Tracking path for selected SOS
  const trackingPolyline = trackingPoints
    .filter(p => p.location?.latitude && p.location?.longitude)
    .map(p => [p.location.latitude, p.location.longitude]);

  return (
    <div className="h-full bg-gray-100 relative rounded-xl overflow-hidden">

      {/* ✅ Only show on very first load */}
      {showLoadingOverlay && (
        <div className="absolute top-4 left-4 z-[1000] bg-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-gray-700">Loading map...</span>
        </div>
      )}

      {/* ✅ Subtle poll indicator — top right, doesn't cover map */}
      {loading && initialLoaded && (
        <div className="absolute top-4 right-4 z-[1000] bg-white px-3 py-1.5 rounded-full shadow flex items-center gap-1.5">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
          <span className="text-xs text-gray-500">Syncing...</span>
        </div>
      )}

      <MapContainer
        center={defaultCenter}
        zoom={12}
        className="h-full w-full"
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Auto fit bounds */}
        {bounds.length > 0 && <MapFitBounds bounds={bounds} />}

        {/* Tracking path */}
        {selectedSOS && trackingPolyline.length > 1 && (
          <Polyline
            positions={trackingPolyline}
            color="#06b6d4"
            weight={3}
            opacity={0.8}
            dashArray="6, 4"
          />
        )}

        {/* SOS markers */}
        {sosList.map((sos) => {
          if (!sos.initialLocation?.latitude || !sos.initialLocation?.longitude) return null;
          const isSelected = selectedSOS?._id === sos._id;
          return (
            <Marker
              key={sos._id}
              position={[sos.initialLocation.latitude, sos.initialLocation.longitude]}
              icon={createSOSIcon(sos._id, isSelected)}
            >
              <Popup>
                <div className="p-2 min-w-[200px]">
                  <p className="font-semibold text-gray-900 mb-1 text-sm">
                    SOS #{sos._id?.slice(-6)}
                  </p>
                  <p className="text-xs text-gray-600 mb-1">
                    📱 {sos.profile?.phone || sos.profile?.phoneNumber || 'N/A'}
                  </p>
                  <p className="text-xs text-gray-600 mb-1">
                    Mode: {sos.mode === 'guest' ? '👤 Guest' : '👥 User'}
                  </p>
                  <p className="text-xs text-gray-600 mb-2">
                    Status:{' '}
                    <span className={`font-semibold ${
                      sos.status === 'resolved' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {sos.status || 'Active'}
                    </span>
                  </p>
                  <p className="text-xs text-gray-400">
                    {new Date(sos.createdAt).toLocaleString()}
                  </p>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Legend */}
      <div className="absolute bottom-4 right-4 bg-white bg-opacity-95 p-3 rounded-lg shadow-lg text-xs z-[400]">
        <p className="font-semibold text-gray-800 mb-2">Legend</p>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-3 h-3 bg-red-500 rounded-full border-2 border-yellow-400" />
          <span className="text-gray-600">Selected SOS</span>
        </div>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-3 h-3 bg-blue-500 rounded-full" />
          <span className="text-gray-600">Active SOS</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-0.5 bg-cyan-500 border-dashed border-t-2 border-cyan-500" />
          <span className="text-gray-600">Tracking Path</span>
        </div>
      </div>

      {/* Empty state */}
      {sosList.length === 0 && !showLoadingOverlay && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="bg-white bg-opacity-90 rounded-xl px-6 py-4 text-center shadow">
            <MapPin className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-600 font-medium text-sm">No active SOS alerts</p>
            <p className="text-gray-400 text-xs mt-1">Waiting for emergency calls...</p>
          </div>
        </div>
      )}
    </div>
  );
};
