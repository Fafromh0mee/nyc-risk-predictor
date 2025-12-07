"use client";

import { useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
  useMap,
  useMapEvents,
  Circle,
} from "react-leaflet";
import L from "leaflet";
import { RiskPoint } from "@/types";

// Fix for default marker icons in Next.js
import "leaflet/dist/leaflet.css";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: undefined,
  iconUrl: undefined,
  shadowUrl: undefined,
});

// NYC Accident Hotspots (aggregated from historical data)
export const NYC_HOTSPOTS = [
  { lat: 40.758, lng: -73.9855, count: 2847, name: "Times Square" },
  { lat: 40.7527, lng: -73.9772, count: 2156, name: "Grand Central" },
  { lat: 40.7061, lng: -73.9969, count: 1893, name: "Brooklyn Bridge" },
  { lat: 40.7484, lng: -73.9857, count: 1654, name: "Herald Square" },
  { lat: 40.7589, lng: -73.9851, count: 1543, name: "Rockefeller Center" },
  { lat: 40.7128, lng: -74.006, count: 1432, name: "Financial District" },
  { lat: 40.7614, lng: -73.9776, count: 1287, name: "Columbus Circle" },
  { lat: 40.7282, lng: -73.7949, count: 1198, name: "Queens Blvd" },
  { lat: 40.8296, lng: -73.9262, count: 1156, name: "Yankee Stadium" },
  { lat: 40.6892, lng: -73.9442, count: 1089, name: "Downtown Brooklyn" },
  { lat: 40.7831, lng: -73.9712, count: 987, name: "Upper West Side" },
  { lat: 40.6501, lng: -73.9496, count: 876, name: "Flatbush" },
  { lat: 40.8448, lng: -73.8648, count: 823, name: "Bronx Hub" },
  { lat: 40.5795, lng: -74.1502, count: 654, name: "Staten Island Ferry" },
];

interface MapViewProps {
  center: [number, number];
  zoom: number;
  flyToKey?: number; // Only flyTo when this key changes
  points: RiskPoint[];
  showHotspots?: boolean;
  onMapClick?: (lat: number, lng: number) => void;
}

function MapController({
  center,
  zoom,
  flyToKey,
}: {
  center: [number, number];
  zoom: number;
  flyToKey?: number;
}) {
  const map = useMap();

  useEffect(() => {
    // Only flyTo when flyToKey changes (triggered by user actions like search, quick location, etc.)
    if (flyToKey !== undefined && flyToKey > 0) {
      map.flyTo(center, zoom, { duration: 1.5 });
    }
  }, [flyToKey]); // Only depend on flyToKey, not center/zoom

  return null;
}

function MapEvents({
  onMapClick,
}: {
  onMapClick?: (lat: number, lng: number) => void;
}) {
  const map = useMap();

  useMapEvents({
    click: (e) => {
      if (onMapClick) {
        onMapClick(e.latlng.lat, e.latlng.lng);
      }
    },
  });

  // Change cursor to crosshair when click is enabled
  useEffect(() => {
    if (onMapClick) {
      map.getContainer().style.cursor = "crosshair";
    }
    return () => {
      map.getContainer().style.cursor = "";
    };
  }, [map, onMapClick]);

  return null;
}

const levelColor = (level: string): string => {
  switch (level) {
    case "low":
      return "#22c55e";
    case "medium":
      return "#f97316";
    case "high":
      return "#ef4444";
    default:
      return "#666666";
  }
};

// Zoom-aware radius calculation
const getRadiusForZoom = (
  zoom: number,
  level: string,
  isPrediction?: boolean
): number => {
  let baseRadius = 8;

  if (zoom <= 10) baseRadius = 18;
  else if (zoom <= 12) baseRadius = 12;
  else if (zoom <= 14) baseRadius = 8;
  else baseRadius = 6;

  // Prediction points are larger
  if (isPrediction) {
    return baseRadius * 2;
  }

  // High risk points are slightly bigger
  const multiplier = level === "high" ? 1.3 : level === "medium" ? 1.1 : 0.9;
  return baseRadius * multiplier;
};

// Hotspot radius based on count
const getHotspotRadius = (count: number, zoom: number): number => {
  const baseRadius = Math.min(Math.max(count / 50, 100), 500);
  const zoomMultiplier =
    zoom <= 10 ? 0.3 : zoom <= 12 ? 0.5 : zoom <= 14 ? 0.8 : 1;
  return baseRadius * zoomMultiplier;
};

// Probability bar component for popup
function ProbabilityBar({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="w-14 font-medium">{label}</span>
      <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${value}%`, backgroundColor: color }}
        />
      </div>
      <span className="w-10 text-right font-semibold">{value.toFixed(1)}%</span>
    </div>
  );
}

export default function MapView({
  center,
  zoom,
  flyToKey,
  points,
  showHotspots = false,
  onMapClick,
}: MapViewProps) {
  return (
    <MapContainer
      center={center}
      zoom={zoom}
      style={{ height: "100%", width: "100%" }}
      className="z-0"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <MapController center={center} zoom={zoom} flyToKey={flyToKey} />
      <MapEvents onMapClick={onMapClick} />

      {/* Hotspots Layer */}
      {showHotspots &&
        NYC_HOTSPOTS.map((hotspot, idx) => (
          <Circle
            key={`hotspot-${idx}`}
            center={[hotspot.lat, hotspot.lng]}
            radius={getHotspotRadius(hotspot.count, zoom)}
            pathOptions={{
              fillColor: "#ef4444",
              color: "#dc2626",
              weight: 1,
              opacity: 0.6,
              fillOpacity: 0.2,
            }}
          >
            <Popup>
              <div className="text-sm">
                <div className="font-bold text-red-600 mb-1">
                  ⚠️ Accident Hotspot
                </div>
                <div className="font-semibold">{hotspot.name}</div>
                <div className="text-gray-600">
                  {hotspot.count.toLocaleString()} historical accidents
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  📍 {hotspot.lat.toFixed(4)}, {hotspot.lng.toFixed(4)}
                </div>
              </div>
            </Popup>
          </Circle>
        ))}

      {/* Prediction Points */}
      {points.map((point, idx) => {
        const color = levelColor(point.level);
        const radius = getRadiusForZoom(zoom, point.level, point.isPrediction);

        return (
          <CircleMarker
            key={`${point.lat}-${point.lng}-${idx}-${
              point.isPrediction ? "pred" : "data"
            }`}
            center={[point.lat, point.lng]}
            radius={radius}
            pathOptions={{
              fillColor: color,
              color: point.isPrediction ? "#1e3a8a" : color,
              weight: point.isPrediction ? 4 : 2,
              opacity: point.isPrediction ? 1 : 0.8,
              fillOpacity: point.isPrediction ? 0.7 : 0.5,
            }}
          >
            <Popup>
              <div className="text-sm min-w-[200px]">
                {/* Header */}
                <div
                  className="font-bold text-lg mb-2 pb-2 border-b capitalize flex items-center gap-2"
                  style={{ borderColor: color }}
                >
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                  {point.level} Risk
                  {point.isPrediction && (
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-normal">
                      Prediction
                    </span>
                  )}
                </div>

                {/* Probabilities */}
                {point.probabilities && (
                  <div className="space-y-1.5 mb-3">
                    <ProbabilityBar
                      label="Low"
                      value={point.probabilities.low}
                      color="#22c55e"
                    />
                    <ProbabilityBar
                      label="Medium"
                      value={point.probabilities.medium}
                      color="#f97316"
                    />
                    <ProbabilityBar
                      label="High"
                      value={point.probabilities.high}
                      color="#ef4444"
                    />
                  </div>
                )}

                {/* Score */}
                <div className="flex justify-between items-center text-gray-700">
                  <span>Confidence:</span>
                  <span className="font-semibold">
                    {(point.score * 100).toFixed(1)}%
                  </span>
                </div>

                {/* Contributing Factor */}
                {point.contribFactorName && (
                  <div className="mt-1 text-gray-600 text-xs">
                    <span className="font-medium">Factor:</span>{" "}
                    {point.contribFactorName}
                  </div>
                )}

                {/* Event count for historical data */}
                {point.count !== undefined && !point.isPrediction && (
                  <div className="flex justify-between items-center text-gray-700 mt-1">
                    <span>Historical Events:</span>
                    <span className="font-semibold">{point.count}</span>
                  </div>
                )}

                {/* Coordinates */}
                <div className="text-xs text-gray-400 mt-2 pt-2 border-t border-gray-200">
                  📍 {point.lat.toFixed(4)}, {point.lng.toFixed(4)}
                </div>
              </div>
            </Popup>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
}
