import React, { useState, useEffect } from 'react';
import { API, fetchStations } from '../api/metroApi';
import { LogIn, LogOut, TrainFront, ShieldAlert } from 'lucide-react';

export default function StationGate() {
  const [stations, setStations] = useState([]);
  const [selectedStation, setSelectedStation] = useState('');
  const [qrInput, setQrInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState({ msg: '', type: '' });

  useEffect(() => {
    fetchStations().then(res => setStations(res.data));
  }, []);

  const handlePunch = async (type) => {
    if (!selectedStation || !qrInput) {
      return setFeedback({ msg: "Please select station and scan QR", type: "error" });
    }

    setLoading(true);
    try {
      const res = await API.post('/tickets/punch', {
        qrData: qrInput,
        currentStationId: selectedStation
      });
      setFeedback({ msg: res.data.message, type: "success" });
    } catch (err) {
      setFeedback({ msg: err.response?.data?.error || "Gate Error", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 min-h-screen">
      <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-200">
        <div className="bg-slate-900 p-8 text-center text-white">
          <TrainFront className="mx-auto mb-2 text-green-500" size={40} />
          <h1 className="text-2xl font-black tracking-tighter italic">MRT-6 GATE SIMULATOR</h1>
        </div>

        <div className="p-8 space-y-6">
          {/* Station Selector */}
          <div>
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Physical Location</label>
            <select 
              className="w-full mt-2 p-4 bg-slate-50 rounded-2xl font-bold border-2 border-transparent focus:border-green-500 outline-none"
              onChange={(e) => setSelectedStation(e.target.value)}
            >
              <option value="">Choose Station Gate...</option>
              {stations.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          {/* QR Input */}
          <div>
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Digital Ticket (QR String)</label>
            <textarea 
              className="w-full mt-2 p-4 bg-slate-50 rounded-2xl font-mono text-xs h-24 border-2 border-transparent focus:border-blue-500 outline-none"
              placeholder="Paste TICKET-userId-timestamp... string here"
              value={qrInput}
              onChange={(e) => setQrInput(e.target.value)}
            />
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-4">
            <button 
              disabled={loading}
              onClick={() => handlePunch('ENTRY')}
              className="bg-green-600 text-white p-6 rounded-3xl font-black flex flex-col items-center gap-2 hover:bg-green-700 transition-all active:scale-95 disabled:opacity-50"
            >
              <LogIn size={24} /> ENTRY GATE
            </button>
            <button 
              disabled={loading}
              onClick={() => handlePunch('EXIT')}
              className="bg-red-600 text-white p-6 rounded-3xl font-black flex flex-col items-center gap-2 hover:bg-red-700 transition-all active:scale-95 disabled:opacity-50"
            >
              <LogOut size={24} /> EXIT GATE
            </button>
          </div>

          {/* Status Feedback */}
          {feedback.msg && (
            <div className={`p-4 rounded-2xl text-center font-bold text-sm flex items-center justify-center gap-2 animate-in fade-in zoom-in-95 ${
              feedback.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}>
              {feedback.type === 'error' && <ShieldAlert size={18} />}
              {feedback.msg}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}