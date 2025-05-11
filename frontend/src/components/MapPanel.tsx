import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Icon } from 'leaflet';
import { motion } from 'framer-motion';

interface MapPanelProps {
  location: string;
  coordinates: [number, number]; // [lat, lng]
}

export function MapPanel({ location, coordinates }: MapPanelProps) {
  // Default to Delhi coordinates if none provided
  const [lat, lng] = coordinates && coordinates.length === 2 
    ? coordinates 
    : [28.6139, 77.2090]; // Delhi coordinates as default
    
  // Fix for Leaflet marker icons in Next.js
  useEffect(() => {
    // This is needed to fix the marker icon issue with Leaflet in Next.js
    delete (Icon.Default.prototype as any)._getIconUrl;
    Icon.Default.mergeOptions({
      iconRetinaUrl: '/images/marker-icon-2x.png',
      iconUrl: '/images/marker-icon.png',
      shadowUrl: '/images/marker-shadow.png',
    });
  }, []);

  return (
    <div className="h-full bg-white">
      <div className="h-full w-full relative">
        <MapContainer 
          center={[lat, lng]} 
          zoom={13} 
          style={{ height: '100%', width: '100%' }}
          zoomControl={false}
          attributionControl={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={[lat, lng]}>
            <Popup>
              Emergency at {location || 'this location'}
            </Popup>
          </Marker>
        </MapContainer>
        
        {/* Emergency location overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-white bg-opacity-90 p-4 border-t border-gray-200">
          <div className="flex items-center">
            <div className="h-2 w-2 rounded-full bg-red-500 mr-2 animate-pulse"></div>
            <h3 className="font-medium">Emergency Location</h3>
          </div>
          <p className="text-sm mt-1">{location || 'Unknown location'}</p>
        </div>
      </div>
    </div>
  );
}
