// apps/frontend/src/pages/SecretMetroControl.jsx
import React, { useState, useEffect } from 'react';
const baseURL= import.meta.env.VITE_API_URL ? 
`${import.meta.env.VITE_API_URL}/api` : 
'http://localhost:5000/api';




export default function SecretMetroControl() {
  const [stations, setStations] = useState([]);
  const [selectedStationId, setSelectedStationId] = useState('1');
  const [selectedStatus, setSelectedStatus] = useState('normal');
  const [customNotice, setCustomNotice] = useState('');
  const [message, setMessage] = useState('');

  // Fetch initial list to look up names
  useEffect(() => {
    fetch(`${baseURL}/stations/live-stream`)
      .then(res => {
        const reader = res.body.getReader();
        return reader.read().then(({ value }) => {
          const text = new TextDecoder().decode(value);
          const rawData = text.replace('data: ', '');
          setStations(JSON.parse(rawData));
        });
      })
      .catch(err => console.error(err));
  }, []);

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    setMessage('Updating...');
    
    const response = await fetch(`${baseURL}/stations/update`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: selectedStationId, status: selectedStatus, notice: customNotice }),
    });

    if (response.ok) {
      setMessage('Status broadcasted successfully onto all commuter maps!');
      setCustomNotice('');
    } else {
      setMessage('Failed to update system state.');
    }
  };

  return (
    <div className="min-h-screen bg-neutral-900 text-white flex items-center justify-center p-6">
      <div className="w-full max-w-xl bg-neutral-950 border border-neutral-800 rounded-2xl p-6 shadow-2xl">
        <h2 className="text-xl font-black text-amber-400 mb-1">🚇 MRT Line 6 Central Command</h2>
        <p className="text-xs text-neutral-400 mb-6">Secured Operator Console Database Interface</p>
        
        {message && <div className="mb-4 p-2.5 rounded bg-neutral-800 text-xs font-semibold text-amber-200 border border-neutral-700">{message}</div>}

        <form onSubmit={handleUpdateStatus} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-neutral-400">Select Station Node</label>
            <select value={selectedStationId} onChange={(e) => setSelectedStationId(e.target.value)} className="bg-neutral-800 border border-neutral-700 rounded px-3 py-2 text-sm text-white focus:ring-1 focus:ring-amber-400 outline-none">
              {stations.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-neutral-400">Target Condition</label>
            <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)} className="bg-neutral-800 border border-neutral-700 rounded px-3 py-2 text-sm text-white focus:ring-1 focus:ring-amber-400 outline-none">
              <option value="normal">🟢 Normal</option>
              <option value="moderate">🟡 Moderate Crowd</option>
              <option value="busy">🔴 Very Busy</option>
              <option value="closed">⚪ Closed / Maintenance</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-neutral-400">System Notice Text</label>
            <input type="text" placeholder="e.g. Processing long ticket lines..." value={customNotice} onChange={(e) => setCustomNotice(e.target.value)} className="bg-neutral-800 border border-neutral-700 rounded px-3 py-2 text-sm text-white placeholder:text-neutral-600 focus:ring-1 focus:ring-amber-400 outline-none" />
          </div>

          <button type="submit" className="w-full mt-2 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-sm py-2.5 rounded transition-all active:scale-98">
            Commit & Sync Live Map
          </button>
        </form>
      </div>
    </div>
  );
}