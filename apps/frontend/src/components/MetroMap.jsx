import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Custom Marker Function to avoid the "Missing Image" bug
const createCustomIcon = (color) => {
  return new L.DivIcon({
    html: `<div style="
      background-color: ${color}; 
      width: 15px; 
      height: 15px; 
      border-radius: 50%; 
      border: 2px solid white;
      box-shadow: 0 0 5px rgba(0,0,0,0.3);
    "></div>`,
    className: 'custom-div-icon',
    iconSize: [15, 15],
    iconAnchor: [7, 7],
  });
};

const MetroMap = ({ stations }) => {
  const position = [23.7761, 90.3773]; // Center

  return (
    <MapContainer center={position} zoom={12} className="h-full w-full">
      <TileLayer
        attribution='&copy; OpenStreetMap'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      {stations.map((station) => (
        <Marker 
          key={station.id} 
          position={[Number(station.lat), Number(station.lng)]}
          icon={createCustomIcon(station.status?.color || '#3b82f6')} // Uses Dynamic Color!
        >
          <Popup>
            <div className="p-1">
              <h3 className="font-bold text-slate-800">{station.name}</h3>
              <p className="text-xs text-slate-500 mb-2">Crowd: <strong>{station.status?.crowd}</strong></p>
              <div className="text-[10px] bg-slate-100 p-1 rounded">
                {station.accessibility_info}
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default MetroMap;