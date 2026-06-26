import React, { useState } from 'react';
import { 
  APIProvider, 
  Map as GoogleMap, 
  AdvancedMarker, 
  Pin,
  InfoWindow
} from '@vis.gl/react-google-maps';
import { Issue, IssueCategory } from '../types';
import { MapPin, SlidersHorizontal, Info, Sparkles, Building } from 'lucide-react';

interface LiveMapDisplayProps {
  issues: Issue[];
  onSelectIssue: (issue: Issue) => void;
}

export default function LiveMapDisplay({ issues, onSelectIssue }: LiveMapDisplayProps) {
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);

  // Read Maps Key from server environment
  const API_KEY =
    (typeof process !== 'undefined' ? process.env?.GOOGLE_MAPS_PLATFORM_KEY : undefined) ||
    (import.meta as any).env?.VITE_GOOGLE_MAPS_PLATFORM_KEY ||
    (globalThis as any).GOOGLE_MAPS_PLATFORM_KEY ||
    '';

  const hasValidKey = Boolean(API_KEY) && API_KEY !== 'YOUR_API_KEY' && API_KEY !== 'MY_MAPS_KEY';

  // Filters issues based on selected category
  const filteredIssues = issues.filter(i => {
    if (categoryFilter === 'All') return true;
    return i.category === categoryFilter;
  });

  // Severity marker color helpers
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Critical': return '#EF4444'; // Red
      case 'High': return '#F97316'; // Orange
      case 'Medium': return '#EAB308'; // Yellow
      case 'Low': return '#10B981'; // Green
      default: return '#3B82F6';
    }
  };

  // Categories helper
  const categories = ['All', 'Roads', 'Water', 'Electricity', 'Waste', 'Public Safety'];

  // If Google Maps key is missing, show our Interactive SVG Civic Map Simulator!
  if (!hasValidKey) {
    return (
      <div className="space-y-6">
        {/* Notice of fall-back simulation */}
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-2xl flex items-start space-x-3 text-xs text-blue-800">
          <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold">Spatial Playground Active (Offline Vector Map Mode)</p>
            <p className="text-blue-700">No active Google Maps Key was detected. We have unlocked a custom interactive vector-grid blueprint of Ward 12 - Indiranagar below so you can test all spatial and proximity-reporting features immediately!</p>
            <p className="font-semibold text-[10px] uppercase text-blue-600 mt-2">
              To wire a production Google Map: Get an API Key → Open Settings (⚙️ Top-Right) → Secrets → Set GOOGLE_MAPS_PLATFORM_KEY
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Controls */}
          <div className="lg:col-span-1 bg-white border border-slate-200 rounded-3xl p-5 shadow-xs h-fit space-y-4">
            <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
              <SlidersHorizontal className="w-4 h-4 text-slate-500" />
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700">Map Filter</h3>
            </div>
            <div className="space-y-1.5">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`w-full text-left px-3.5 py-2 rounded-xl text-xs font-semibold transition flex items-center justify-between ${
                    categoryFilter === cat 
                      ? 'bg-blue-600 text-white' 
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span>{cat}</span>
                  <span className={`px-1.5 py-0.5 text-[9px] font-bold rounded-md font-mono ${
                    categoryFilter === cat ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {cat === 'All' ? issues.length : issues.filter(i => i.category === cat).length}
                  </span>
                </button>
              ))}
            </div>

            <div className="border-t border-slate-100 pt-4 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Severity Key</span>
              <div className="grid grid-cols-2 gap-1.5 text-[10px] font-bold">
                <span className="flex items-center"><div className="w-2.5 h-2.5 rounded-full bg-red-500 mr-1.5" /> Critical</span>
                <span className="flex items-center"><div className="w-2.5 h-2.5 rounded-full bg-orange-500 mr-1.5" /> High</span>
                <span className="flex items-center"><div className="w-2.5 h-2.5 rounded-full bg-yellow-500 mr-1.5" /> Medium</span>
                <span className="flex items-center"><div className="w-2.5 h-2.5 rounded-full bg-emerald-500 mr-1.5" /> Low</span>
              </div>
            </div>
          </div>

          {/* Map Area */}
          <div className="lg:col-span-3 bg-slate-950 border border-slate-800 rounded-3xl h-[450px] relative overflow-hidden flex items-center justify-center">
            {/* Grid background */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:30px_30px] opacity-40" />

            {/* Simulated Vector Grid Outline of Bengaluru Wards */}
            <svg className="w-[85%] h-[85%] text-slate-800/30 opacity-60 pointer-events-none" viewBox="0 0 500 500" fill="none" stroke="currentColor" strokeWidth="2">
              {/* Sector Outlines */}
              <path d="M 50 100 Q 250 80 450 100 L 450 400 Q 250 420 50 400 Z" strokeDasharray="5,5" />
              {/* Roads (Grid line paths) */}
              <line x1="50" y1="200" x2="450" y2="200" strokeWidth="4" /> {/* 100 Feet Road */}
              <line x1="250" y1="100" x2="250" y2="400" strokeWidth="3" /> {/* Double Road */}
              <line x1="50" y1="320" x2="450" y2="320" /> 
              {/* Park boundary outline */}
              <rect x="300" y="120" width="80" height="50" rx="10" stroke="#10B981" strokeWidth="1.5" fill="#10B981" fillOpacity="0.05" />
            </svg>

            {/* Label overlays */}
            <div className="absolute top-12 left-1/2 -translate-x-1/2 text-[10px] font-bold text-slate-500 uppercase tracking-widest pointer-events-none">
              Ward 12 - Indiranagar Spatial Map Grid
            </div>

            <div className="absolute top-[180px] left-12 text-[9px] font-bold text-slate-600 uppercase tracking-wider pointer-events-none">
              100 Feet Road
            </div>
            <div className="absolute top-[280px] right-24 text-[9px] font-bold text-slate-600 uppercase tracking-wider pointer-events-none">
              Indiranagar Double Road
            </div>
            <div className="absolute top-[135px] right-28 text-[9px] font-bold text-emerald-500/70 uppercase tracking-wider pointer-events-none">
              Public Park
            </div>

            {/* Plotted Interactive Pins */}
            {filteredIssues.map((issue) => {
              // Convert actual Coordinates to responsive % coordinates
              // Center around Bengaluru lat: 12.97, lng: 77.63
              const centerLat = 12.973;
              const centerLng = 77.625;
              const zoomScaleLat = 3000;
              const zoomScaleLng = 3000;

              const xPercent = 50 + (issue.longitude - centerLng) * zoomScaleLng;
              const yPercent = 50 - (issue.latitude - centerLat) * zoomScaleLat;

              // Constrain boundaries
              const pinX = Math.max(8, Math.min(92, xPercent));
              const pinY = Math.max(8, Math.min(92, yPercent));

              const isCritical = issue.severity === 'Critical';

              return (
                <div
                  key={issue.id}
                  style={{ left: `${pinX}%`, top: `${pinY}%` }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 z-10 group"
                >
                  {/* Glowing Pulse effect */}
                  <div 
                    style={{ backgroundColor: getSeverityColor(issue.severity) }}
                    className={`absolute -inset-2 rounded-full opacity-40 blur-xs transition group-hover:scale-150 ${isCritical ? 'animate-ping' : ''}`}
                  />
                  {/* Pin core */}
                  <button
                    onClick={() => setSelectedIssue(issue)}
                    style={{ backgroundColor: getSeverityColor(issue.severity) }}
                    className="relative w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-white shadow-xl hover:scale-110 active:scale-95 transition"
                  >
                    <MapPin className="w-4 h-4 fill-white/10" />
                  </button>

                  {/* Hover tooltip */}
                  <div className="absolute bottom-10 left-1/2 -translate-x-1/2 bg-slate-900 border border-slate-800 text-white p-2.5 rounded-xl shadow-2xl w-44 pointer-events-none opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100 transition duration-200 z-50">
                    <span className="text-[9px] font-extrabold uppercase text-slate-400 block mb-0.5">{issue.category}</span>
                    <p className="text-[10px] font-bold truncate leading-tight">{issue.title}</p>
                    <span className="inline-block text-[8px] font-extrabold uppercase mt-1 text-slate-300">
                      Severity: {issue.severity}
                    </span>
                  </div>
                </div>
              );
            })}

            {/* Info Window / Dialog overlay if a pin is active */}
            {selectedIssue && (
              <div className="absolute bottom-6 left-6 right-6 bg-slate-900/95 backdrop-blur-md border border-slate-800 p-4 rounded-2xl shadow-2xl z-30 flex justify-between items-center animate-in fade-in slide-in-from-bottom-4 duration-200">
                <div className="flex space-x-3 items-center">
                  <div 
                    style={{ backgroundColor: getSeverityColor(selectedIssue.severity) }}
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold shrink-0"
                  >
                    {selectedIssue.category.charAt(0)}
                  </div>
                  <div>
                    <span className="text-[9px] font-bold uppercase text-slate-400 block">{selectedIssue.category} • {selectedIssue.severity}</span>
                    <h4 className="text-xs font-bold text-white line-clamp-1 leading-snug">{selectedIssue.title}</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">{selectedIssue.address}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 pl-4">
                  <button 
                    onClick={() => onSelectIssue(selectedIssue)}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-extrabold px-3 py-2 rounded-xl transition"
                  >
                    Details
                  </button>
                  <button 
                    onClick={() => setSelectedIssue(null)}
                    className="text-slate-400 hover:text-white text-xs font-bold"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Loaded real Google Maps flow
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Controls */}
        <div className="lg:col-span-1 bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
            <SlidersHorizontal className="w-4 h-4 text-slate-500" />
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700">Map Filter</h3>
          </div>
          <div className="space-y-1.5">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`w-full text-left px-3.5 py-2 rounded-xl text-xs font-semibold transition flex items-center justify-between ${
                  categoryFilter === cat 
                    ? 'bg-blue-600 text-white' 
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span>{cat}</span>
                <span className={`px-1.5 py-0.5 text-[9px] font-bold rounded-md font-mono ${
                  categoryFilter === cat ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                }`}>
                  {cat === 'All' ? issues.length : issues.filter(i => i.category === cat).length}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Map View */}
        <div className="lg:col-span-3 h-[450px] rounded-3xl overflow-hidden border border-slate-200 shadow-sm relative">
          <APIProvider apiKey={API_KEY} version="weekly">
            <GoogleMap
              defaultCenter={{ lat: 12.9716, lng: 77.5946 }} // center Bengaluru
              defaultZoom={13}
              mapId="DEMO_MAP_ID"
              internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
              style={{ width: '100%', height: '100%' }}
            >
              {filteredIssues.map((issue) => (
                <AdvancedMarker
                  key={issue.id}
                  position={{ lat: issue.latitude, lng: issue.longitude }}
                  onClick={() => setSelectedIssue(issue)}
                >
                  <Pin 
                    background={getSeverityColor(issue.severity)} 
                    glyphColor="#fff" 
                  />
                </AdvancedMarker>
              ))}

              {selectedIssue && (
                <InfoWindow
                  position={{ lat: selectedIssue.latitude, lng: selectedIssue.longitude }}
                  onCloseClick={() => setSelectedIssue(null)}
                >
                  <div className="p-1 max-w-sm">
                    <span className="text-[9px] font-extrabold text-blue-600 uppercase block mb-0.5">
                      {selectedIssue.category} • {selectedIssue.severity}
                    </span>
                    <h4 className="text-xs font-bold text-slate-900 leading-tight line-clamp-1">{selectedIssue.title}</h4>
                    <p className="text-[10px] text-slate-500 mt-1 line-clamp-1">{selectedIssue.address}</p>
                    <button
                      onClick={() => onSelectIssue(selectedIssue)}
                      className="mt-2.5 w-full bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-extrabold py-1.5 rounded-lg transition"
                    >
                      View Full Incident
                    </button>
                  </div>
                </InfoWindow>
              )}
            </GoogleMap>
          </APIProvider>
        </div>
      </div>
    </div>
  );
}
