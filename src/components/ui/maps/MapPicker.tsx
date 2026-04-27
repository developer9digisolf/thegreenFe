'use client';

import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons - critical for marker visibility
if (typeof window !== 'undefined') {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  });
}

interface MapPickerProps {
  value?: { lat: number; lng: number };
  onChange?: (val: { lat: number; lng: number }) => void;
  disabled?: boolean;
}

function LocationMarker({ value, onChange, disabled }: MapPickerProps) {
  const map = useMapEvents({
    click(e) {
      if (!disabled && onChange) {
        console.log('Map clicked:', e.latlng);
        onChange(e.latlng);
        map.flyTo(e.latlng, map.getZoom());
      }
    },
  });

  const markerRef = useRef<any>(null);
  const eventHandlers = React.useMemo(() => ({
    dragend() {
      const marker = markerRef.current;
      if (marker != null && onChange) {
        const latlng = marker.getLatLng();
        console.log('Marker dragged:', latlng);
        onChange(latlng);
      }
    },
  }), [onChange]);

  const hasValidValue = value && 
                        typeof value.lat === 'number' && !isNaN(value.lat) && 
                        typeof value.lng === 'number' && !isNaN(value.lng);

  return hasValidValue ? (
    <Marker 
      draggable={!disabled}
      eventHandlers={eventHandlers}
      position={[value!.lat, value!.lng]} 
      ref={markerRef}
    />
  ) : null;
}

function SyncMap({ center }: { center: [number, number] }) {
  const map = useMap();
  const isFirstRender = useRef(true);
  
  useEffect(() => {
    // Skip first render to avoid conflict
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    
    // Check if center is valid
    if (!center || center.length !== 2 || isNaN(center[0]) || isNaN(center[1])) {
      return;
    }
    
    const currentCenter = map.getCenter();
    const deltaLat = Math.abs(currentCenter.lat - center[0]);
    const deltaLng = Math.abs(currentCenter.lng - center[1]);
    
    // Only sync if the change is significant
    if (deltaLat > 0.0001 || deltaLng > 0.0001) {
      map.panTo(center);
    }
  }, [center[0], center[1], map]);
  
  return null;
}

export default function MapPicker({ value, onChange, disabled }: MapPickerProps) {
  const defaultCenter: [number, number] = [3.5952, 98.6722]; // Medan, Indonesia
  
  // Gunakan nilai dari props jika valid, fallback ke default
  const getValidCenter = (): [number, number] => {
    if (value?.lat && value?.lng && 
        !isNaN(value.lat) && !isNaN(value.lng)) {
      return [value.lat, value.lng];
    }
    return defaultCenter;
  };

  const position = getValidCenter();

  return (
    <div className={`w-full h-[300px] rounded-xl overflow-hidden border-2 border-gray-100 relative z-0 ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
      <MapContainer
        center={position}
        zoom={13}
        scrollWheelZoom={false}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker value={value} onChange={onChange} disabled={disabled} />
        {!disabled && <SyncMap center={position} />}
      </MapContainer>
      {disabled && (
        <div className="absolute inset-0 bg-white/20 z-[1000] cursor-not-allowed backdrop-blur-[1px]" />
      )}
    </div>
  );
}