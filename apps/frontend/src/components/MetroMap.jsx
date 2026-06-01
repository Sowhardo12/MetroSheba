// apps/frontend/src/components/MetroMap.jsx
import React, { useState, useEffect } from 'react';

const baseURL = import.meta.env.VITE_API_URL ? 
  `${import.meta.env.VITE_API_URL}/api` : 
  'http://localhost:5000/api';

const STATUS_STYLES = {
  normal: { ring: 'stroke-green-500', dot: 'fill-neutral-900', bg: 'bg-green-500', text: 'text-green-600', label: 'Normal Service' },
  moderate: { ring: 'stroke-amber-500', dot: 'fill-neutral-900', bg: 'bg-amber-500', text: 'text-amber-600', label: 'Moderate Crowd' },
  busy: { ring: 'stroke-red-600', dot: 'fill-neutral-900', bg: 'bg-red-600', text: 'text-red-600', label: 'Very Busy' },
  closed: { ring: 'stroke-neutral-400', dot: 'fill-neutral-400', bg: 'bg-neutral-400', text: 'text-neutral-400', label: 'Station Closed' },
};

export default function MetroMap() {
  const [stations, setStations] = useState([]);

  useEffect(() => {
    const stream = new EventSource(`${baseURL}/stations/live-stream`);

    stream.onmessage = (event) => {
      const freshData = JSON.parse(event.data);
      setStations(freshData);
    };

    return () => stream.close();
  }, []);

  // Compute live system metrics for the production header metrics bar
  const totalStations = stations.length;
  const closedCount = stations.filter(s => s.status === 'closed').length;
  const busyCount = stations.filter(s => s.status === 'busy').length;

  if (stations.length === 0) {
    return (
      <div className="w-full max-w-5xl mx-auto p-12 flex flex-col items-center justify-center border border-neutral-200/60 rounded-2xl bg-neutral-50/50">
        <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-sm text-neutral-500 font-medium tracking-wide">Synchronizing live transit network data...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto bg-white border border-neutral-200/80 rounded-2xl shadow-xs overflow-hidden font-sans">
      
      {/* 1. AGENCY BRANDING & METADATA HEADER */}
      <div className="p-5 border-b border-neutral-100 bg-neutral-50/70 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-emerald-700 text-white text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-sm">
              Line 6
            </span>
            <h1 className="text-xl font-bold text-neutral-900 tracking-tight">Dhaka Metro Rail Live Network</h1>
          </div>
          <p className="text-xs text-neutral-500 mt-1">
            Real-time route congestion tracking and station advisory operations.
          </p>
        </div>

        {/* Real-time System Health Summary Indicators */}
        <div className="flex flex-wrap gap-3">
          <div className="bg-white border border-neutral-200/60 rounded-lg px-3 py-1.5 flex flex-col">
            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Line Status</span>
            <span className="text-xs font-bold text-neutral-800 flex items-center gap-1.5 mt-0.5">
              <span className={`w-2 h-2 rounded-full ${closedCount > 3 ? 'bg-amber-500' : 'bg-green-500'}`}></span>
              {closedCount === 0 ? 'Fully Operational' : `${totalStations - closedCount}/${totalStations} Active`}
            </span>
          </div>
          {busyCount > 0 && (
            <div className="bg-red-50 border border-red-100 rounded-lg px-3 py-1.5 flex flex-col">
              <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider">Crowd Alert</span>
              <span className="text-xs font-bold text-red-700 mt-0.5">{busyCount} Stations Congested</span>
            </div>
          )}
        </div>
      </div>

      {/* 2. DYNAMIC BROADCAST LEGEND BAR */}
      <div className="px-5 py-3 bg-white border-b border-neutral-100 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-neutral-600 font-medium">
          <span className="text-neutral-400 text-[11px] font-bold uppercase mr-1">Legend:</span>
          {Object.entries(STATUS_STYLES).map(([key, style]) => (
            <div key={key} className="flex items-center gap-1.5">
              <span className={`w-2.5 h-2.5 rounded-full ${style.bg}`}></span>
              <span className="text-neutral-700">{style.label}</span>
            </div>
          ))}
        </div>
        <div className="text-neutral-400 text-[11px] font-medium flex items-center gap-1">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
          Live stream connected
        </div>
      </div>

      {/* 3. VECTOR SVG MAP CANVAS WORKSPACE */}
      <div className="p-6 bg-neutral-50/30">
        <div className="w-full overflow-x-auto border border-neutral-200/70 rounded-xl bg-white shadow-2xs scrollbar-thin">
          
          {/* Top Boundary Guideline Header Inside Container */}
          <div className="min-w-[2400px] px-20 pt-4 flex justify-between text-[10px] font-bold uppercase tracking-widest text-neutral-400 select-none">
            <span>← Terminus: Uttara North</span>
            <span>Destination: Motijheel →</span>
          </div>

          <svg viewBox="0 0 2450 280" className="w-full min-w-[2400px] h-auto select-none font-sans">
            {/* TRACK PATH CONNECTIONS */}
            <g id="tracks">
              {stations.map((station, index) => {
                if (index === stations.length - 1) return null;
                const nextStation = stations[index + 1];
                const isClosed = station.status === 'closed' || nextStation.status === 'closed';
                return (
                  <line
                    key={`track-${station.id}`}
                    x1={station.gridX} y1={station.gridY} x2={nextStation.gridX} y2={nextStation.gridY}
                    className={`stroke-[6px] transition-all duration-500 ${isClosed ? 'stroke-neutral-200 stroke-dasharray-4' : 'stroke-neutral-900'}`}
                    style={{ strokeLinecap: 'round' }}
                  />
                );
              })}
            </g>

            {/* STATIONS DOT NODES & OVERLAYS */}
            <g id="stations">
              {stations.map((station) => {
                const currentStyle = STATUS_STYLES[station.status] || STATUS_STYLES.normal;
                return (
                  <g key={station.id} className="group cursor-pointer">
                    {/* Status Outer Ring indicator */}
                    <circle 
                      cx={station.gridX} 
                      cy={station.gridY} 
                      r="14" 
                      strokeWidth="4" 
                      className={`fill-white transition-all duration-500 ${currentStyle.ring} group-hover:r-[16px]`} 
                    />
                    {/* Core Anchor Node */}
                    <circle 
                      cx={station.gridX} 
                      cy={station.gridY} 
                      r="6" 
                      className={`transition-all duration-500 ${currentStyle.dot}`} 
                    />

                    {/* Vector Descriptive Typography Labels */}
                    <g transform={`translate(${station.gridX}, ${station.gridY})`}>
                      {/* Station Text Label */}
                      <text y="-28" textAnchor="middle" className="font-bold text-[13px] fill-neutral-800 tracking-tight">
                        {station.name}
                      </text>
                      {/* Dynamic Status Text */}
                      <text 
                        y="28" 
                        textAnchor="middle" 
                        className={`text-[11px] font-bold uppercase tracking-wider transition-all duration-300 ${currentStyle.text}`}
                      >
                        {currentStyle.label}
                      </text>

                      {/* Active Alert Notice Box rendering */}
                      {station.notice && (
                        <g transform="translate(-60, 40)">
                          <rect width="120" height="26" rx="6" className="fill-amber-50/90 stroke stroke-amber-200 shadow-2xs" />
                          <text x="60" y="16" textAnchor="middle" className="fill-amber-900 text-[10px] font-semibold tracking-wide">
                            {station.notice}
                          </text>
                        </g>
                      )}
                    </g>
                  </g>
                );
              })}
            </g>
          </svg>
        </div>
      </div>

      {/* 4. FOOTER REGULATORY LEGAL NOTES */}
      <div className="px-5 py-3 border-t border-neutral-100 bg-neutral-50/50 flex flex-col sm:flex-row sm:items-center sm:justify-between text-[11px] text-neutral-400 font-medium gap-2">
        <span>© 2026 Dhaka Mass Transit Transit Authority (DMTCL). All rights reserved.</span>
        <span className="flex items-center gap-3">
          <a href="#refresh" onClick={(e) => { e.preventDefault(); window.location.reload(); }} className="hover:text-neutral-600 transition-colors">Force Re-sync</a>
          <span>•</span>
          <span>System Version 2.4.0-Production</span>
        </span>
      </div>
    </div>
  );
}