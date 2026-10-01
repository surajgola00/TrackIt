import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Custom Brutalist Marker
const brutalistIcon = L.divIcon({
  className: 'custom-brutalist-marker',
  html: `
    <div class="relative">
      <div class="w-12 h-12 bg-black border-4 border-white flex items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="white" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-map-pin"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
      </div>
    </div>
  `,
  iconSize: [48, 48],
  iconAnchor: [24, 24],
});

interface MapProps {
  path: [number, number][];
  currentLocation: [number, number] | null;
  zoom: number;
}

// Component to handle map view updates
const MapUpdater: React.FC<{ center: [number, number] | null; zoom: number }> = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, zoom);
    }
  }, [center, zoom, map]);
  return null;
};

export const Map: React.FC<MapProps> = ({ path, currentLocation, zoom }) => {
  const [initialCenter] = useState<[number, number]>(currentLocation || [40.7128, -74.0060]);

  return (
    <div className="w-full h-full border-4 md:border-8 border-black relative overflow-hidden bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] md:shadow-[16px_16px_0px_0px_rgba(0,0,0,1)]">
      <MapContainer 
        center={initialCenter} 
        zoom={zoom} 
        className="w-full h-full grayscale contrast-125"
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Polyline - Full session path */}
        <Polyline 
          positions={path} 
          pathOptions={{ 
            color: 'black', 
            weight: 6,
            lineCap: 'square',
            lineJoin: 'miter'
          }} 
        />
        <Polyline 
          positions={path} 
          pathOptions={{ 
            color: 'white', 
            weight: 2,
            dashArray: '10, 10'
          }} 
        />

        {/* Current Location Marker */}
        {currentLocation && (
          <Marker position={currentLocation} icon={brutalistIcon} />
        )}

        <MapUpdater center={currentLocation} zoom={zoom} />
      </MapContainer>
    </div>
  );
};
