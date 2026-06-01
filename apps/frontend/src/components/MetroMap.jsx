import React, { useState, useEffect } from 'react';

const STATUS_STYLES = {
  normal: { ring: 'stroke-green-500', dot: 'fill-black', label: 'Normal' },
  moderate: { ring: 'stroke-amber-500', dot: 'fill-black', label: 'Moderate' },
  busy: { ring: 'stroke-red-600', dot: 'fill-black', label: 'Very Busy' },
  closed: { ring: 'stroke-neutral-400', dot: 'fill-neutral-400', label: 'Closed' },
};

export default function MetroMap() {
  const [stations, setStations] = useState([]);
  const [showDevPanel, setShowDevPanel] = useState(false);
  const [selectedStationId, setSelectedStationId] = useState('1');
  const [selectedStatus, setSelectedStatus] = useState('normal');
  const [customNotice, setCustomNotice] = useState('');

  // Listen to the backend's real-time data stream
  useEffect(() => {
    const stream = new EventSource('http://localhost:5000/api/stations/live-stream'); // Adjust port if needed

    stream.onmessage = (event) => {
      const freshData = JSON.parse(event.data);
      setStations(freshData);
    };

    return () => stream.close();
  }, []);

  // // Shift + D panel trigger
  // useEffect(() => {
  //   const handleKeyDown = (e) => {
  //     if (e.shiftKey && e.key.toLowerCase() === 'd') setShowDevPanel(prev => !prev);
  //   };
  //   window.addEventListener('keydown', handleKeyDown);
  //   return () => window.removeEventListener('keydown', handleKeyDown);
  // }, []);

  // Listen for developer secret hotkey with keyword validation gate
useEffect(() => {
  const handleKeyDown = (e) => {
    if (e.shiftKey && e.key.toLowerCase() === 'd') {
      // If the panel is already open, let them close it without a prompt
      if (showDevPanel) {
        setShowDevPanel(false);
        return;
      }

      // If they are opening it, demand the hidden security keyword
      const accessPassword = prompt("Enter Developer Security Passkey:");
      
      if (accessPassword === "dhakametrodev") {
        setShowDevPanel(true);
      } else if (accessPassword !== null) {
        alert("Access Denied: Invalid Security Passkey.");
      }
    }
  };
  
  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, [showDevPanel]); // Added showDevPanel dependency so the toggle closing logic works correctly

  // Submit modification to backend server
  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    await fetch('http://localhost:5000/api/stations/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: selectedStationId, status: selectedStatus, notice: customNotice }),
    });
  };

  if (stations.length === 0) return <div className="p-10 text-center text-neutral-400">Connecting to live transit stream...</div>;

  return (
    <div className="w-full bg-white p-4 flex flex-col items-center relative">
      <header className="mb-6 text-center">
        <h1 className="text-2xl font-bold text-neutral-800">Dhaka Metro Rail Live Map</h1>
        <p className="text-xs text-neutral-400 mt-0.5">Real-time synchronized network track</p>
      </header>

      {showDevPanel && (
        <div className="w-full max-w-5xl mb-8 p-5 bg-neutral-900 text-white border border-neutral-800 rounded-xl shadow-xl">
          <div className="flex items-center justify-between mb-3 border-b border-neutral-800 pb-2">
            <h3 className="text-xs font-bold uppercase text-amber-400">⚡ Global Developer Override</h3>
            <span className="text-[10px] text-neutral-400">Press <kbd className="bg-neutral-800 px-1 rounded">Shift + D</kbd> to close</span>
          </div>
          <form onSubmit={handleUpdateStatus} className="flex flex-wrap gap-4 items-end justify-between">
            <div className="flex flex-col gap-1">
              <label className="text-[11px] text-neutral-400">Station</label>
              <select value={selectedStationId} onChange={(e) => setSelectedStationId(e.target.value)} className="bg-neutral-800 p-1.5 text-sm rounded border border-neutral-700">
                {stations.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[11px] text-neutral-400">Status</label>
              <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)} className="bg-neutral-800 p-1.5 text-sm rounded border border-neutral-700">
                <option value="normal">Normal</option>
                <option value="moderate">Moderate</option>
                <option value="busy">Very Busy</option>
                <option value="closed">Closed</option>
              </select>
            </div>
            <div className="flex flex-col gap-1 flex-1">
              <label className="text-[11px] text-neutral-400">Notice</label>
              <input type="text" placeholder="No delays..." value={customNotice} onChange={(e) => setCustomNotice(e.target.value)} className="bg-neutral-800 p-1.5 text-sm rounded border border-neutral-700 w-full" />
            </div>
            <button type="submit" className="bg-amber-500 text-neutral-950 font-bold text-sm px-6 py-1.5 rounded hover:bg-amber-400">Broadcast to All Users</button>
          </form>
        </div>
      )}

      {/* --- SCROLLABLE MAP VIEW --- */}
      <div className="w-full max-w-5xl overflow-x-auto border border-neutral-200 rounded-2xl p-6 bg-neutral-50/50 shadow-xs">
        <svg viewBox="0 0 2450 280" className="w-full min-w-[2400px] h-auto select-none font-sans">
          <g id="tracks">
            {stations.map((station, index) => {
              if (index === stations.length - 1) return null;
              const nextStation = stations[index + 1];
              const isClosed = station.status === 'closed' || nextStation.status === 'closed';
              return (
                <line
                  key={`track-${station.id}`}
                  x1={station.gridX} y1={station.gridY} x2={nextStation.gridX} y2={nextStation.gridY}
                  className={`stroke-[6px] transition-all duration-500 ${isClosed ? 'stroke-neutral-300 stroke-dasharray-4' : 'stroke-neutral-900'}`}
                  style={{ strokeLinecap: 'round' }}
                />
              );
            })}
          </g>

          <g id="stations">
            {stations.map((station) => {
              const currentStyle = STATUS_STYLES[station.status] || STATUS_STYLES.normal;
              return (
                <g key={station.id} className="group">
                  <circle cx={station.gridX} cy={station.gridY} r="14" strokeWidth="4" className={`fill-white transition-all duration-500 ${currentStyle.ring} group-hover:r-[17px]`} />
                  <circle cx={station.gridX} cy={station.gridY} r="7" className={`transition-all duration-500 ${currentStyle.dot}`} />
                  <g transform={`translate(${station.gridX}, ${station.gridY})`}>
                    <text y="-26" textAnchor="middle" className="font-bold text-[13px] fill-neutral-800">{station.name}</text>
                    <text y="28" textAnchor="middle" className={`text-[11px] font-semibold transition-all duration-300 ${station.status === 'busy' ? 'fill-red-600' : station.status === 'moderate' ? 'fill-amber-600' : station.status === 'closed' ? 'fill-neutral-400' : 'fill-green-600'}`}>{currentStyle.label}</text>
                    {station.notice && (
                      <g transform="translate(-50, 38)">
                        <rect width="100" height="24" rx="4" className="fill-amber-50 stroke stroke-amber-200" />
                        <text x="50" y="15" textAnchor="middle" className="fill-amber-800 text-[9px] font-medium">{station.notice}</text>
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
  );
}


