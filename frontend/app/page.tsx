'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import SearchBar from '@/components/SearchBar';
import { RiskPoint } from '@/types';

// Dynamic import for MapView to avoid SSR issues with Leaflet
const MapView = dynamic(() => import('@/components/MapView'), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full flex items-center justify-center bg-gray-100">
      <div className="text-xl text-gray-600">Loading map...</div>
    </div>
  ),
});

// Mock geocoding function
const mockGeocode = async (query: string): Promise<{ lat: number; lng: number } | null> => {
  const lowerQuery = query.toLowerCase().trim();
  
  // Check if it's coordinates
  const coordMatch = query.match(/^(-?\d+\.?\d*),\s*(-?\d+\.?\d*)$/);
  if (coordMatch) {
    return {
      lat: parseFloat(coordMatch[1]),
      lng: parseFloat(coordMatch[2]),
    };
  }
  
  // Mock locations
  const mockLocations: Record<string, { lat: number; lng: number }> = {
    'times square': { lat: 40.758, lng: -73.9855 },
    'central park': { lat: 40.785091, lng: -73.968285 },
    'brooklyn bridge': { lat: 40.7061, lng: -73.9969 },
    'statue of liberty': { lat: 40.6892, lng: -74.0445 },
    'empire state building': { lat: 40.7484, lng: -73.9857 },
    'wall street': { lat: 40.7074, lng: -74.0113 },
  };
  
  for (const [key, value] of Object.entries(mockLocations)) {
    if (lowerQuery.includes(key)) {
      return value;
    }
  }
  
  return null;
};

export default function Home() {
  const [center, setCenter] = useState<[number, number]>([40.758, -73.9855]);
  const [zoom, setZoom] = useState(12);
  const [points, setPoints] = useState<RiskPoint[]>([]);
  const [loading, setLoading] = useState(false);

  // Load mock data on mount
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const response = await fetch('/mock-data.json');
        const data = await response.json();
        setPoints(data);
      } catch (error) {
        console.error('Failed to load mock data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  const handleSearch = async (query: string, hour?: number, day?: number, month?: number) => {
    if (!query.trim()) return;
    
    const location = await mockGeocode(query);
    if (location) {
      setCenter([location.lat, location.lng]);
      setZoom(15);
    } else {
      alert('Location not found. Try: Times Square, Central Park, or coordinates like 40.758,-73.985');
    }
  };

  const handleUseLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCenter([position.coords.latitude, position.coords.longitude]);
        setZoom(14);
      },
      (error) => {
        alert('Unable to retrieve your location: ' + error.message);
      }
    );
  };

  const handleClear = () => {
    setCenter([40.758, -73.9855]);
    setZoom(12);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50">
      {/* Header - Full Width */}
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center font-bold text-lg shadow-lg">
                🗽
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                NYC Risk Predictor
              </span>
            </div>

            {/* Navigation Menu */}
            <nav className="hidden md:flex items-center gap-8">
              <a href="#" className="text-gray-700 hover:text-orange-600 transition-colors font-medium">
                Main
              </a>
              <div className="h-6 w-px bg-gray-300"></div>
              <a href="#" className="text-gray-700 hover:text-orange-600 transition-colors font-medium">
                Docs
              </a>
            </nav>

            {/* Mobile Menu Button */}
            <button className="md:hidden text-gray-700 hover:text-orange-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        <div className="flex flex-col gap-6">
          {/* Hero Section */}
          <div className="text-center mb-4">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-3">
              NYC Accident Risk Predictor
            </h1>
            <p className="text-lg text-gray-600">
              Interactive risk map — <span className="text-green-600 font-semibold">🟢 Low</span> | <span className="text-orange-600 font-semibold">🟠 Medium</span> | <span className="text-red-600 font-semibold">🔴 High</span>
            </p>
          </div>

          {/* Search Bar */}
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden hover:shadow-2xl transition-shadow">
            <SearchBar
              onSearch={handleSearch}
              onUseLocation={handleUseLocation}
              onClear={handleClear}
            />
          </div>

          {/* Status Bar */}
          <div className="bg-gradient-to-r from-orange-500 to-red-500 px-6 py-4 text-white rounded-2xl shadow-lg">
            <div className="flex justify-between items-center">
              <span className="font-medium">
                {loading ? '⏳ Loading...' : `📍 Showing ${points.length} risk points`}
              </span>
              <span className="text-sm opacity-90">
                Zoom: {zoom} | {center[0].toFixed(3)}, {center[1].toFixed(3)}
              </span>
            </div>
          </div>

          {/* Map Container */}
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 hover:shadow-orange-200 hover:shadow-2xl transition-all" style={{ height: '600px' }}>
            <MapView
              center={center}
              zoom={zoom}
              points={points}
              onBoundsChange={(bounds, newZoom) => {
                setZoom(newZoom);
              }}
            />
          </div>
        </div>
      </div>

      {/* Footer - Full Width */}
      <footer className="bg-white border-t border-gray-200 px-6 py-6 text-sm mt-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-3">
            <div className="text-gray-600">
              Data: NYC Collision Dataset (2019–2024) — <span className="text-orange-600 font-medium">Mock data used for demo</span>
            </div>
            <div className="flex gap-6 items-center text-gray-600">
              <a href="https://github.com" className="hover:text-orange-600 transition-colors font-medium" target="_blank" rel="noopener noreferrer">
                GitHub
              </a>
              <span className="text-gray-400">|</span>
              <span>Developer: <span className="text-orange-600 font-medium">ฟาเอง อิอิ</span></span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
