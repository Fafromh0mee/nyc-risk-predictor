'use client';

import React, { useState } from 'react';

interface SearchBarProps {
  onSearch: (query: string, hour?: number, day?: number, month?: number) => void;
  onUseLocation: () => void;
  onClear: () => void;
}

export default function SearchBar({ onSearch, onUseLocation, onClear }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [hour, setHour] = useState<string>('');
  const [day, setDay] = useState<string>('');
  const [month, setMonth] = useState<string>('');

  const handleSearch = () => {
    onSearch(
      query,
      hour ? parseInt(hour) : undefined,
      day ? parseInt(day) : undefined,
      month ? parseInt(month) : undefined
    );
  };

  const handleClear = () => {
    setQuery('');
    setHour('');
    setDay('');
    setMonth('');
    onClear();
  };

  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-col gap-3">
        {/* Main search input */}
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="Place or coordinates (e.g., Times Square or 40.758,-73.985)"
          className="w-full px-4 md:px-5 py-3 rounded-xl border-2 border-gray-200 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 text-gray-900 transition-all"
        />
        
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Time inputs */}
          <div className="flex gap-2 flex-1">
            <select
              value={hour}
              onChange={(e) => setHour(e.target.value)}
              className="flex-1 sm:w-24 px-3 py-3 rounded-xl border-2 border-gray-200 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 text-gray-900 transition-all cursor-pointer"
            >
              <option value="">Time</option>
              {Array.from({ length: 24 }, (_, i) => (
                <option key={i} value={i}>
                  {i.toString().padStart(2, '0')}:00
                </option>
              ))}
            </select>
            <select
              value={day}
              onChange={(e) => setDay(e.target.value)}
              className="flex-1 sm:w-24 px-3 py-3 rounded-xl border-2 border-gray-200 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 text-gray-900 transition-all cursor-pointer"
            >
              <option value="">Day</option>
              {Array.from({ length: 31 }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  {i + 1}
                </option>
              ))}
            </select>
            <select
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="flex-1 sm:w-32 px-3 py-3 rounded-xl border-2 border-gray-200 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 text-gray-900 transition-all cursor-pointer"
            >
              <option value="">Month</option>
              <option value="1">January</option>
              <option value="2">February</option>
              <option value="3">March</option>
              <option value="4">April</option>
              <option value="5">May</option>
              <option value="6">June</option>
              <option value="7">July</option>
              <option value="8">August</option>
              <option value="9">September</option>
              <option value="10">October</option>
              <option value="11">November</option>
              <option value="12">December</option>
            </select>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2">
            <button
              onClick={handleSearch}
              className="flex-1 sm:flex-none px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all whitespace-nowrap"
            >
              🔍 Search
            </button>
            <button
              onClick={onUseLocation}
              className="flex-1 sm:flex-none px-4 md:px-5 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all whitespace-nowrap"
            >
              <span className="hidden sm:inline">📍 My Location</span>
              <span className="sm:hidden">📍 Location</span>
            </button>
            <button
              onClick={handleClear}
              className="px-4 md:px-5 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition-all border-2 border-gray-200"
            >
              ✕
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
