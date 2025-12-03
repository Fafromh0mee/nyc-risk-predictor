'use client';

import React, { useState, useEffect } from 'react';
import { ContribFactor } from '@/types';

interface SearchBarProps {
  onSearch: (query: string, hour?: number, dayOfWeek?: number, contribFactor?: number) => void;
  onUseLocation: () => void;
  onClear: () => void;
  onQuickLocation: (name: string, lat: number, lng: number) => void;
  onTimeChange?: (hour: number, dayOfWeek: number, contribFactor: number) => void;
}

const DAYS_OF_WEEK = [
  { value: 0, label: 'Mon', fullLabel: 'Monday' },
  { value: 1, label: 'Tue', fullLabel: 'Tuesday' },
  { value: 2, label: 'Wed', fullLabel: 'Wednesday' },
  { value: 3, label: 'Thu', fullLabel: 'Thursday' },
  { value: 4, label: 'Fri', fullLabel: 'Friday' },
  { value: 5, label: 'Sat', fullLabel: 'Saturday' },
  { value: 6, label: 'Sun', fullLabel: 'Sunday' },
];

const CONTRIB_FACTORS: ContribFactor[] = [
  { id: 0, name: 'Any / Unspecified' },
  { id: 1, name: 'Driver Inattention' },
  { id: 2, name: 'Failure to Yield' },
  { id: 3, name: 'Following Too Closely' },
  { id: 5, name: 'Unsafe Speed' },
  { id: 6, name: 'Traffic Control Disregarded' },
  { id: 10, name: 'Slippery Road' },
];

const QUICK_LOCATIONS = [
  { name: 'Times Square', lat: 40.758, lng: -73.9855, icon: '🏙️' },
  { name: 'Central Park', lat: 40.785091, lng: -73.968285, icon: '🌳' },
  { name: 'Brooklyn Bridge', lat: 40.7061, lng: -73.9969, icon: '🌉' },
  { name: 'Wall Street', lat: 40.7074, lng: -74.0113, icon: '💰' },
  { name: 'JFK Airport', lat: 40.6413, lng: -73.7781, icon: '✈️' },
];

export default function SearchBar({ 
  onSearch, 
  onUseLocation, 
  onClear, 
  onQuickLocation,
  onTimeChange 
}: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [hour, setHour] = useState<number>(() => new Date().getHours());
  const [dayOfWeek, setDayOfWeek] = useState<number>(() => {
    const day = new Date().getDay();
    return day === 0 ? 6 : day - 1;
  });
  const [contribFactor, setContribFactor] = useState<number>(0);

  // Notify parent of time changes
  useEffect(() => {
    onTimeChange?.(hour, dayOfWeek, contribFactor);
  }, [hour, dayOfWeek, contribFactor, onTimeChange]);

  const handleSearch = () => {
    if (!query.trim()) {
      return;
    }
    onSearch(query, hour, dayOfWeek, contribFactor);
  };

  const handleQuickLocation = (loc: typeof QUICK_LOCATIONS[0]) => {
    setQuery(loc.name);
    onQuickLocation(loc.name, loc.lat, loc.lng);
    onSearch(`${loc.lat},${loc.lng}`, hour, dayOfWeek, contribFactor);
  };

  const setCurrentTime = () => {
    const now = new Date();
    setHour(now.getHours());
    const day = now.getDay();
    setDayOfWeek(day === 0 ? 6 : day - 1);
  };

  const handleClear = () => {
    setQuery('');
    setCurrentTime();
    setContribFactor(0);
    onClear();
  };

  const handleHourChange = (newHour: number) => {
    setHour(newHour);
  };

  const handleDayChange = (newDay: number) => {
    setDayOfWeek(newDay);
  };

  const handleFactorChange = (newFactor: number) => {
    setContribFactor(newFactor);
  };

  return (
    <div className="p-5 md:p-6 space-y-5">
      {/* Quick Location Buttons */}
      <div>
        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
          Quick Predict
        </div>
        <div className="flex flex-wrap gap-2">
          {QUICK_LOCATIONS.map((loc) => (
            <button
              key={loc.name}
              onClick={() => handleQuickLocation(loc)}
              className="px-3 py-2 bg-gray-50 hover:bg-orange-50 border border-gray-200 hover:border-orange-300 rounded-lg text-sm font-medium text-gray-700 hover:text-orange-600 transition-all flex items-center gap-1.5"
            >
              <span>{loc.icon}</span>
              <span>{loc.name}</span>
            </button>
          ))}
          <button
            onClick={onUseLocation}
            className="px-3 py-2 bg-blue-50 hover:bg-blue-100 border border-blue-200 hover:border-blue-300 rounded-lg text-sm font-medium text-blue-700 transition-all flex items-center gap-1.5"
          >
            <span>📍</span>
            <span>My Location</span>
          </button>
        </div>
      </div>

      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-gray-200"></div>
        <span className="text-xs text-gray-400 font-medium">OR SEARCH</span>
        <div className="flex-1 h-px bg-gray-200"></div>
      </div>

      {/* Search Input */}
      <div>
        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
          Location
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Place name or coordinates"
            className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-200 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 text-gray-900 transition-all"
          />
          <button
            onClick={handleSearch}
            disabled={!query.trim()}
            className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 disabled:from-gray-300 disabled:to-gray-400 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl disabled:shadow-none transition-all whitespace-nowrap"
          >
            🔮 Predict
          </button>
        </div>
      </div>

      {/* Time & Conditions */}
      <div className="space-y-4">
        {/* Row 1: Time and Cause */}
        <div className="grid grid-cols-2 gap-4">
          {/* Hour */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Time of Day
              </span>
              <button
                onClick={setCurrentTime}
                className="text-xs text-orange-600 hover:text-orange-700 font-medium"
              >
                Use Now
              </button>
            </div>
            <select
              value={hour}
              onChange={(e) => handleHourChange(parseInt(e.target.value))}
              className="w-full px-3 py-2.5 rounded-lg border-2 border-gray-200 focus:outline-none focus:border-orange-500 text-gray-900 cursor-pointer bg-white"
            >
              {Array.from({ length: 24 }, (_, i) => (
                <option key={i} value={i}>
                  {i.toString().padStart(2, '0')}:00 {i < 12 ? 'AM' : 'PM'}
                </option>
              ))}
            </select>
          </div>

          {/* Contributing Factor */}
          <div>
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Cause (Optional)
            </div>
            <select
              value={contribFactor}
              onChange={(e) => handleFactorChange(parseInt(e.target.value))}
              className="w-full px-3 py-2.5 rounded-lg border-2 border-gray-200 focus:outline-none focus:border-orange-500 text-gray-900 cursor-pointer bg-white"
            >
              {CONTRIB_FACTORS.map((factor) => (
                <option key={factor.id} value={factor.id}>
                  {factor.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Row 2: Day of Week - Full Width */}
        <div>
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            Day of Week
          </div>
          <div className="grid grid-cols-7 gap-2">
            {DAYS_OF_WEEK.map((day) => (
              <button
                key={day.value}
                onClick={() => handleDayChange(day.value)}
                className={`py-2.5 rounded-lg text-sm font-semibold transition-all ${
                  dayOfWeek === day.value
                    ? 'bg-orange-500 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                title={day.fullLabel}
              >
                {day.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Clear Button */}
      <div className="flex justify-end">
        <button
          onClick={handleClear}
          className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all"
        >
          Clear All
        </button>
      </div>
    </div>
  );
}
