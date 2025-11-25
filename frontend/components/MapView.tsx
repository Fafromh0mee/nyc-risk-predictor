'use client';

import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { RiskPoint } from '@/types';

// Fix for default marker icons in Next.js
import 'leaflet/dist/leaflet.css';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: undefined,
  iconUrl: undefined,
  shadowUrl: undefined,
});

interface MapViewProps {
  center: [number, number];
  zoom: number;
  points: RiskPoint[];
  onBoundsChange?: (bounds: L.LatLngBounds, zoom: number) => void;
}

function MapController({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  
  useEffect(() => {
    map.flyTo(center, zoom, { duration: 1.5 });
  }, [center, zoom, map]);
  
  return null;
}

function MapEvents({ onBoundsChange }: { onBoundsChange?: (bounds: L.LatLngBounds, zoom: number) => void }) {
  const map = useMap();
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useMapEvents({
    moveend: () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        if (onBoundsChange) {
          onBoundsChange(map.getBounds(), map.getZoom());
        }
      }, 300);
    },
    zoomend: () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        if (onBoundsChange) {
          onBoundsChange(map.getBounds(), map.getZoom());
        }
      }, 300);
    },
  });

  return null;
}

const levelColor = (level: string): string => {
  switch (level) {
    case 'low':
      return '#33cc33';
    case 'medium':
      return '#ff9900';
    case 'high':
      return '#e53935';
    default:
      return '#666666';
  }
};

// Zoom-aware radius calculation
const getRadiusForZoom = (zoom: number, level: string): number => {
  let baseRadius = 8;
  
  if (zoom <= 10) baseRadius = 18;
  else if (zoom <= 12) baseRadius = 12;
  else if (zoom <= 14) baseRadius = 8;
  else baseRadius = 6;
  
  // High risk points are slightly bigger
  const multiplier = level === 'high' ? 1.3 : level === 'medium' ? 1.1 : 0.9;
  return baseRadius * multiplier;
};

export default function MapView({ center, zoom, points, onBoundsChange }: MapViewProps) {
  return (
    <MapContainer
      center={center}
      zoom={zoom}
      style={{ height: '100%', width: '100%' }}
      className="z-0"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      <MapController center={center} zoom={zoom} />
      <MapEvents onBoundsChange={onBoundsChange} />

      {points.map((point, idx) => {
        const color = levelColor(point.level);
        const radius = getRadiusForZoom(zoom, point.level);
        
        return (
          <CircleMarker
            key={`${point.lat}-${point.lng}-${idx}`}
            center={[point.lat, point.lng]}
            radius={radius}
            pathOptions={{
              fillColor: color,
              color: color,
              weight: 2,
              opacity: 0.8,
              fillOpacity: 0.5,
            }}
          >
            <Popup>
              <div className="text-sm">
                <div className="font-bold text-lg mb-1 capitalize">{point.level} Risk</div>
                <div><strong>Score:</strong> {point.score.toFixed(2)}</div>
                {point.count !== undefined && (
                  <div><strong>Events:</strong> {point.count}</div>
                )}
                <div className="text-xs text-gray-500 mt-1">
                  {point.lat.toFixed(4)}, {point.lng.toFixed(4)}
                </div>
              </div>
            </Popup>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
}
