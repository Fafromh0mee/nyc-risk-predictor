"use client";

import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import SearchBar from "@/components/SearchBar";
import { RiskPoint } from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

// Dynamic import for MapView to avoid SSR issues with Leaflet
const MapView = dynamic(() => import("@/components/MapView"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="text-center">
        <div className="text-4xl mb-3">🗺️</div>
        <div className="text-lg text-gray-600">Loading map...</div>
      </div>
    </div>
  ),
});

export default function Home() {
  const [center, setCenter] = useState<[number, number]>([40.758, -73.9855]);
  const [zoom, setZoom] = useState(12);
  const [flyToKey, setFlyToKey] = useState(0); // Key to trigger flyTo only when needed
  const [points, setPoints] = useState<RiskPoint[]>([]);
  const [predicting, setPredicting] = useState(false);
  const [lastPrediction, setLastPrediction] = useState<RiskPoint | null>(null);
  const [apiStatus, setApiStatus] = useState<"checking" | "online" | "offline">(
    "checking"
  );
  const [showHotspots, setShowHotspots] = useState(true);
  const [showWelcome, setShowWelcome] = useState(true);

  // Current time/day settings (synced with SearchBar)
  const [currentHour, setCurrentHour] = useState(() => new Date().getHours());
  const [currentDayOfWeek, setCurrentDayOfWeek] = useState(() => {
    const day = new Date().getDay();
    return day === 0 ? 6 : day - 1;
  });
  const [currentContribFactor, setCurrentContribFactor] = useState(0);

  // Check API health on mount
  useEffect(() => {
    const checkApi = async () => {
      try {
        const response = await fetch(`${API_URL}/health`);
        if (response.ok) {
          setApiStatus("online");
        } else {
          setApiStatus("offline");
        }
      } catch {
        setApiStatus("offline");
      }
    };

    checkApi();
    const interval = setInterval(checkApi, 30000);
    return () => clearInterval(interval);
  }, []);

  // Hide welcome after first prediction
  useEffect(() => {
    if (lastPrediction) {
      setShowWelcome(false);
    }
  }, [lastPrediction]);

  const handlePredict = async (
    lat: number,
    lng: number,
    hour: number,
    dayOfWeek: number,
    contribFactor: number
  ) => {
    if (apiStatus !== "online") return;

    setPredicting(true);
    try {
      const response = await fetch(`${API_URL}/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lat,
          lng,
          hour,
          day_of_week: dayOfWeek,
          contrib_factor: contribFactor,
        }),
      });

      if (response.ok) {
        const prediction = await response.json();

        const newPredictionPoint: RiskPoint = {
          lat: prediction.lat,
          lng: prediction.lng,
          level: prediction.level,
          score: prediction.score,
          probabilities: prediction.probabilities,
          isPrediction: true,
          contribFactorName: prediction.contrib_factor_name,
        };

        setPoints((prev) => {
          const oldPredictions = prev.filter((p) => p.isPrediction).slice(-4);
          return [...oldPredictions, newPredictionPoint];
        });
        setLastPrediction(newPredictionPoint);
      }
    } catch (error) {
      console.error("Prediction error:", error);
    } finally {
      setPredicting(false);
    }
  };

  const handleMapClick = (lat: number, lng: number) => {
    if (apiStatus !== "online") return;
    // Don't setCenter here - let the user freely navigate the map
    // Only predict at the clicked location
    handlePredict(
      lat,
      lng,
      currentHour,
      currentDayOfWeek,
      currentContribFactor
    );
  };

  const handleSearch = async (
    query: string,
    hour?: number,
    dayOfWeek?: number,
    contribFactor?: number
  ) => {
    // Update current settings
    if (hour !== undefined) setCurrentHour(hour);
    if (dayOfWeek !== undefined) setCurrentDayOfWeek(dayOfWeek);
    if (contribFactor !== undefined) setCurrentContribFactor(contribFactor);

    if (!query.trim()) return;

    const coordMatch = query.match(/^(-?\d+\.?\d*),\s*(-?\d+\.?\d*)$/);
    let lat: number, lng: number;

    if (coordMatch) {
      lat = parseFloat(coordMatch[1]);
      lng = parseFloat(coordMatch[2]);
    } else {
      const mockLocations: Record<string, { lat: number; lng: number }> = {
        "times square": { lat: 40.758, lng: -73.9855 },
        "central park": { lat: 40.785091, lng: -73.968285 },
        "brooklyn bridge": { lat: 40.7061, lng: -73.9969 },
        "wall street": { lat: 40.7074, lng: -74.0113 },
        "jfk airport": { lat: 40.6413, lng: -73.7781 },
        jfk: { lat: 40.6413, lng: -73.7781 },
        manhattan: { lat: 40.7831, lng: -73.9712 },
        brooklyn: { lat: 40.6782, lng: -73.9442 },
        queens: { lat: 40.7282, lng: -73.7949 },
        bronx: { lat: 40.8448, lng: -73.8648 },
        "staten island": { lat: 40.5795, lng: -74.1502 },
      };

      const lowerQuery = query.toLowerCase().trim();
      const found = Object.entries(mockLocations).find(([key]) =>
        lowerQuery.includes(key)
      );

      if (found) {
        lat = found[1].lat;
        lng = found[1].lng;
      } else {
        alert(
          "Location not found. Try: Times Square, Central Park, Brooklyn Bridge, or enter coordinates like 40.758,-73.985"
        );
        return;
      }
    }

    setCenter([lat, lng]);
    setZoom(15);
    setFlyToKey((k) => k + 1); // Trigger flyTo

    const h = hour ?? currentHour;
    const d = dayOfWeek ?? currentDayOfWeek;
    const c = contribFactor ?? currentContribFactor;
    await handlePredict(lat, lng, h, d, c);
  };

  const handleQuickLocation = (name: string, lat: number, lng: number) => {
    setCenter([lat, lng]);
    setZoom(15);
    setFlyToKey((k) => k + 1); // Trigger flyTo
  };

  const handleUseLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setCenter([lat, lng]);
        setZoom(14);
        setFlyToKey((k) => k + 1); // Trigger flyTo

        if (apiStatus === "online") {
          handlePredict(
            lat,
            lng,
            currentHour,
            currentDayOfWeek,
            currentContribFactor
          );
        }
      },
      (error) => {
        alert("Unable to retrieve your location: " + error.message);
      }
    );
  };

  const handleClear = () => {
    setCenter([40.758, -73.9855]);
    setZoom(12);
    setFlyToKey((k) => k + 1); // Trigger flyTo
    setLastPrediction(null);
    setPoints([]);
  };

  const handleTimeChange = (
    hour: number,
    dayOfWeek: number,
    contribFactor: number
  ) => {
    setCurrentHour(hour);
    setCurrentDayOfWeek(dayOfWeek);
    setCurrentContribFactor(contribFactor);
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case "high":
        return {
          bg: "bg-red-500",
          text: "text-red-600",
          light: "bg-red-50",
          border: "border-red-200",
        };
      case "medium":
        return {
          bg: "bg-orange-500",
          text: "text-orange-600",
          light: "bg-orange-50",
          border: "border-orange-200",
        };
      default:
        return {
          bg: "bg-green-500",
          text: "text-green-600",
          light: "bg-green-50",
          border: "border-green-200",
        };
    }
  };

  const formatTime = (hour: number) => {
    const ampm = hour < 12 ? "AM" : "PM";
    const h = hour % 12 || 12;
    return `${h}:00 ${ampm}`;
  };

  const getDayName = (day: number) => {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    return days[day];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="w-full px-4 md:px-8 lg:px-12 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center text-xl shadow-lg">
                🗽
              </div>
              <div>
                <h1 className="text-lg font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                  NYC Risk Predictor
                </h1>
                <p className="text-xs text-gray-500 hidden sm:block">
                  Click anywhere on map to predict risk
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Current Time Display */}
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-full text-xs text-gray-600">
                <span>🕐</span>
                <span>{formatTime(currentHour)}</span>
                <span className="text-gray-400">•</span>
                <span>{getDayName(currentDayOfWeek)}</span>
              </div>

              {/* Hotspots Toggle */}
              <button
                onClick={() => setShowHotspots(!showHotspots)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  showHotspots
                    ? "bg-red-100 text-red-700"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {showHotspots ? "🔥 Hotspots ON" : "Hotspots OFF"}
              </button>

              {/* API Status */}
              <div
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${
                  apiStatus === "online"
                    ? "bg-green-100 text-green-700"
                    : apiStatus === "offline"
                    ? "bg-red-100 text-red-700"
                    : "bg-yellow-100 text-yellow-700"
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    apiStatus === "online"
                      ? "bg-green-500 animate-pulse"
                      : apiStatus === "offline"
                      ? "bg-red-500"
                      : "bg-yellow-500 animate-pulse"
                  }`}
                />
                {apiStatus === "online"
                  ? "Ready"
                  : apiStatus === "offline"
                  ? "Offline"
                  : "..."}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Welcome Message - First Time */}
      {showWelcome && apiStatus === "online" && (
        <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
          <div className="w-full px-4 md:px-8 lg:px-12 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-2xl">👋</span>
                <div>
                  <div className="font-semibold">
                    Welcome! Click anywhere on the map to predict accident risk
                  </div>
                  <div className="text-sm text-blue-100">
                    Or use the quick buttons on the left • Red circles show
                    historical accident hotspots
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowWelcome(false)}
                className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded-lg text-sm"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}

      {/* API Offline Warning */}
      {apiStatus === "offline" && (
        <div className="bg-red-50 border-b border-red-200">
          <div className="w-full px-4 md:px-8 lg:px-12 py-3">
            <div className="flex items-center gap-3 text-red-700">
              <span className="text-xl">⚠️</span>
              <div>
                <span className="font-semibold">Backend API is offline.</span>
                <span className="text-red-600 ml-2">
                  Run:{" "}
                  <code className="bg-red-100 px-2 py-0.5 rounded text-sm">
                    cd backend && source venv/bin/activate && python main.py
                  </code>
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="w-full px-4 md:px-8 lg:px-12 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {/* Left Panel - Controls */}
          <div className="lg:col-span-1 space-y-4">
            {/* Search Card */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <SearchBar
                onSearch={handleSearch}
                onUseLocation={handleUseLocation}
                onClear={handleClear}
                onQuickLocation={handleQuickLocation}
                onTimeChange={handleTimeChange}
              />
            </div>

            {/* Prediction Result */}
            {lastPrediction && (
              <div
                className={`rounded-2xl shadow-lg border-2 overflow-hidden ${
                  getRiskColor(lastPrediction.level).light
                } ${getRiskColor(lastPrediction.level).border}`}
              >
                <div className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${
                          getRiskColor(lastPrediction.level).bg
                        } text-white shadow-lg`}
                      >
                        {lastPrediction.level === "high"
                          ? "🔴"
                          : lastPrediction.level === "medium"
                          ? "🟠"
                          : "🟢"}
                      </div>
                      <div>
                        <div className="text-2xl font-bold capitalize text-gray-800">
                          {lastPrediction.level} Risk
                        </div>
                        <div className="text-sm text-gray-500">
                          {lastPrediction.contribFactorName}
                        </div>
                      </div>
                    </div>
                  </div>

                  {lastPrediction.probabilities && (
                    <div className="space-y-3">
                      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        Probability Breakdown
                      </div>
                      {[
                        {
                          label: "Low",
                          value: lastPrediction.probabilities.low,
                          color: "bg-green-500",
                        },
                        {
                          label: "Medium",
                          value: lastPrediction.probabilities.medium,
                          color: "bg-orange-500",
                        },
                        {
                          label: "High",
                          value: lastPrediction.probabilities.high,
                          color: "bg-red-500",
                        },
                      ].map((item) => (
                        <div
                          key={item.label}
                          className="flex items-center gap-3"
                        >
                          <span className="w-16 text-sm font-medium text-gray-600">
                            {item.label}
                          </span>
                          <div className="flex-1 h-4 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${item.color} transition-all duration-500`}
                              style={{ width: `${item.value}%` }}
                            />
                          </div>
                          <span className="w-14 text-sm font-bold text-gray-700 text-right">
                            {item.value.toFixed(1)}%
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="text-xs text-gray-400">
                      📍 {lastPrediction.lat.toFixed(4)},{" "}
                      {lastPrediction.lng.toFixed(4)}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Empty State with Click Hint */}
            {!lastPrediction && apiStatus === "online" && (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 text-center">
                <div className="text-5xl mb-3 animate-bounce">👆</div>
                <div className="font-semibold text-gray-800 mb-1">
                  Click on Map to Predict
                </div>
                <div className="text-sm text-gray-500 mb-3">
                  Or use the quick location buttons above
                </div>
                <div className="text-xs text-gray-400 bg-gray-50 rounded-lg p-2">
                  🕐 {formatTime(currentHour)} • {getDayName(currentDayOfWeek)}
                </div>
              </div>
            )}

            {/* History */}
            {points.length > 1 && (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4">
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                  Recent Predictions ({points.length})
                </div>
                <div className="space-y-2">
                  {points
                    .slice()
                    .reverse()
                    .map((p, i) => (
                      <div
                        key={i}
                        className={`flex items-center gap-2 text-sm px-3 py-2 rounded-lg cursor-pointer hover:opacity-80 ${
                          i === 0 ? getRiskColor(p.level).light : "bg-gray-50"
                        }`}
                        onClick={() => {
                          setCenter([p.lat, p.lng]);
                          setFlyToKey((k) => k + 1); // Trigger flyTo
                        }}
                      >
                        <span>
                          {p.level === "high"
                            ? "🔴"
                            : p.level === "medium"
                            ? "🟠"
                            : "🟢"}
                        </span>
                        <span className="capitalize font-medium">
                          {p.level}
                        </span>
                        <span className="text-gray-400 text-xs">
                          ({p.lat.toFixed(3)}, {p.lng.toFixed(3)})
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Legend */}
            {showHotspots && (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4">
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                  Map Legend
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-red-400 opacity-40 border border-red-500"></div>
                    <span className="text-gray-600">
                      Historical Accident Hotspot
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-green-500 border-2 border-blue-900"></div>
                    <span className="text-gray-600">Low Risk Prediction</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-orange-500 border-2 border-blue-900"></div>
                    <span className="text-gray-600">
                      Medium Risk Prediction
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-red-500 border-2 border-blue-900"></div>
                    <span className="text-gray-600">High Risk Prediction</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Panel - Map */}
          <div className="lg:col-span-2 xl:col-span-3 relative">
            <div
              className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100"
              style={{ height: "calc(100vh - 200px)", minHeight: "500px" }}
            >
              {/* Predicting Overlay */}
              {predicting && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg text-sm font-medium text-orange-600 flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                  Predicting...
                </div>
              )}

              {/* Click Hint Overlay */}
              {!lastPrediction && apiStatus === "online" && !predicting && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 bg-black/70 text-white px-4 py-2 rounded-full text-sm font-medium pointer-events-none animate-pulse">
                  👆 Click anywhere to predict risk
                </div>
              )}

              <MapView
                center={center}
                zoom={zoom}
                flyToKey={flyToKey}
                points={points}
                showHotspots={showHotspots}
                onMapClick={handleMapClick}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-8">
        <div className="w-full px-4 md:px-8 lg:px-12 py-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-2 text-sm text-gray-500">
            <div>
              Data: NYC Collision Dataset (2019–2024) • Model: XGBoost (F1:
              0.65)
            </div>
            <div className="flex items-center gap-4">
              <a
                href="https://github.com/Fafromh0mee/nyc-risk-predictor"
                className="hover:text-orange-600 transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                GitHub
              </a>
              <span>Developer: ฟาเอง อิอิ</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
