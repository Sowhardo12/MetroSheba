import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ChatBot from '../components/ChatBot';
import { Map as MapIcon, Ticket, History, Search, LogOut, Wallet, TrainFront, Loader2 } from 'lucide-react';
import { API } from '../api/metroApi';

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [journeys, setJourneys] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch everything in one go to prevent multiple re-renders
        const [userRes, ticketRes] = await Promise.all([
          API.get('/auth/me'),
          API.get('/tickets/my-tickets')
        ]);
        
        setUser(userRes.data);
        setJourneys(ticketRes.data);
        
        // Sync local storage
        localStorage.setItem('user', JSON.stringify(userRes.data));
      } catch (err) {
        console.error("Dashboard sync failed", err);
        // Fallback to local storage if API fails
        const localUser = localStorage.getItem('user');
        if (localUser) setUser(JSON.parse(localUser));
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Navbar */}
      <nav className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <div className="bg-green-600 p-2 rounded-lg text-white"><Ticket size={20}/></div>
          <span className="font-black text-xl italic tracking-tighter">MetroSheba</span>
        </div>
        <button onClick={handleLogout} className="text-red-500 font-bold flex items-center gap-2 hover:bg-red-50 px-3 py-2 rounded-xl transition-colors">
          <LogOut size={18}/> Logout
        </button>
      </nav>

      <div className="max-w-5xl mx-auto p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left: User Stats */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
            <h2 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">My Account</h2>
            <p className="text-2xl font-black text-slate-800">
              {loading ? <span className="text-slate-200">Loading...</span> : user?.name}
            </p>
            <div className="mt-4 p-4 bg-green-50 rounded-2xl flex items-center justify-between">
              <Wallet className="text-green-600" />
              <span className="text-xl font-bold text-green-700">
                ৳{loading ? '--' : (user?.balance || '0.00')}
              </span>
            </div>
          </div>

          <button 
            onClick={() => navigate('/map')}
            className="w-full flex items-center justify-center gap-3 bg-slate-900 text-white p-5 rounded-2xl font-bold hover:bg-black active:scale-[0.98] transition-all"
          >
            <MapIcon size={20} /> View Metro Map
          </button>
        </div>

        {/* Center/Right: Actions & History */}
        <div className="md:col-span-2 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div onClick={() => navigate('/buy-ticket')} className="group bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:border-green-500 cursor-pointer transition-all hover:shadow-md">
              <Ticket className="text-green-600 mb-3 group-hover:scale-110 transition-transform" size={32} />
              <h3 className="font-bold text-lg">Buy QR Ticket</h3>
              <p className="text-sm text-slate-500">Instant 1-hour valid ticket</p>
            </div>
            
            <div onClick={() => navigate('/lost-found')} className="group bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:border-orange-400 cursor-pointer transition-all hover:shadow-md">
              <Search className="text-orange-500 mb-3 group-hover:scale-110 transition-transform" size={32} />
              <h3 className="font-bold text-lg">Lost & Found</h3>
              <p className="text-sm text-slate-500">Report or claim items</p>
            </div>
          </div>

          {/* Recent Journeys Section */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <History size={20} className="text-slate-400" />
              <h3 className="font-bold text-slate-800">Recent Journeys</h3>
            </div>

            <div className="space-y-3">
              {loading ? (
                <div className="flex flex-col items-center py-10 gap-2">
                  <Loader2 className="animate-spin text-slate-200" size={30} />
                  <p className="text-slate-400 text-sm">Fetching trips...</p>
                </div>
              ) : journeys.length > 0 ? (
                journeys.map((j) => (
                  <div key={j.id} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-white hover:shadow-sm transition-all">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 rounded-xl text-green-600">
                        <TrainFront size={20} />
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 text-sm">
                          {j.from_station_name} → {j.to_station_name}
                        </p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">
                              {new Date(j.created_at).toLocaleDateString('en-GB', { 
                                  day: 'numeric', 
                                  month: 'short', 
                                  timeZone: 'Asia/Dhaka' 
                              })} • 
                              {new Date(j.created_at).toLocaleTimeString('en-US', { 
                                  hour: '2-digit', 
                                  minute: '2-digit',
                                  hour12: true,
                                  timeZone: 'Asia/Dhaka' 
                              })} • 
                              {" " + j.status}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
      <p className="font-black text-slate-700">৳{j.fare}</p>
      <p className="text-[9px] text-slate-300 font-bold">ID: #{j.id}</p>
    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10">
                  <p className="text-slate-400 italic text-sm">No recent trips found.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <ChatBot />
    </div>
  );
};

export default Dashboard;