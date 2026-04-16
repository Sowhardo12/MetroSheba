import React, { useState, useEffect } from 'react';
import QRCode from 'react-qr-code';
import { fetchStations, API } from '../api/metroApi'; // Ensure API is exported from metroApi
import { X, TrainFront, ArrowRight } from 'lucide-react';

const TicketModal = ({ isOpen, onClose, onPurchaseSuccess }) => {
  const [stations, setStations] = useState([]);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [fareInfo, setFareInfo] = useState(null);
  const [ticket, setTicket] = useState(null);

  useEffect(() => {
    fetchStations().then(res => setStations(res.data));
  }, []);

  // Fetch fare when from/to changes
  useEffect(() => {
    if (from && to && from !== to) {
      API.get(`/stations/fare?startId=${from}&endId=${to}`)
        .then(res => setFareInfo(res.data));
    } else {
      setFareInfo(null);
    }
  }, [from, to]);

  const handleBuy = async () => {
    try {
      const { data } = await API.post('/tickets/buy', {
        from_station: from,
        to_station: to,
        fare: fareInfo.fare
      });
      setTicket(data);
      onPurchaseSuccess(); // To refresh balance in dashboard
    } catch (err) {
      alert(err.response?.data?.error || "Purchase failed");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[3000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl">
        <div className="bg-green-600 p-6 text-white flex justify-between items-center">
          <h2 className="text-xl font-bold flex items-center gap-2"><TrainFront /> Get Ticket</h2>
          <button onClick={onClose}><X /></button>
        </div>

        <div className="p-6">
          {!ticket ? (
            <div className="space-y-4">
              <select className="w-full p-3 border rounded-xl outline-none" onChange={e => setFrom(e.target.value)}>
                <option value="">Starting Station</option>
                {stations.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
              
              <div className="flex justify-center text-slate-300"><ArrowRight /></div>

              <select className="w-full p-3 border rounded-xl outline-none" onChange={e => setTo(e.target.value)}>
                <option value="">Destination Station</option>
                {stations.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>

              {fareInfo && (
                <div className="bg-slate-50 p-4 rounded-2xl flex justify-between items-center">
                  <span className="text-slate-500">Total Fare:</span>
                  <span className="text-2xl font-black text-slate-800">৳{fareInfo.fare}</span>
                </div>
              )}

              <button 
                disabled={!fareInfo}
                onClick={handleBuy}
                className="w-full bg-green-600 text-white py-4 rounded-2xl font-bold disabled:bg-slate-200"
              >
                Confirm & Pay
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center py-4">
              <div className="p-4 bg-white border-4 border-dashed border-green-200 rounded-2xl mb-4">
                <QRCode value={ticket.qr_code_data} size={180} />
              </div>
              <p className="text-sm text-slate-500 mb-1">One-time QR Code</p>
              <p className="font-bold text-green-600 uppercase tracking-widest text-xs">Valid for 60 Minutes</p>
              <button onClick={onClose} className="mt-6 text-slate-400 font-bold underline">Close</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TicketModal;