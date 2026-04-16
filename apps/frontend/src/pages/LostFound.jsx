import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API, fetchStations } from '../api/metroApi';
import { ArrowLeft, PackageSearch, Megaphone, MapPin, Loader2 } from 'lucide-react';

const LostFound = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ item_name: '', description: '', station_id: '' });

  useEffect(() => {
    const loadData = async () => {
      try {
        const [stationsRes, itemsRes] = await Promise.all([
          fetchStations(),
          API.get('/lost-found')   //http://localhost:5000/api/lost-found  
          //in backend app.js: app.use('/api/lost-found', lostFoundRoutes);  where request comes [POST/GET]
        ]);
        setStations(stationsRes.data);
        setItems(itemsRes.data);
      } catch (err) {
        console.error("Data fetch failed", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post('/lost-found', formData);
      alert("Item reported successfully!");
      // Refresh list
      const { data } = await API.get('/lost-found');
      setItems(data);
      setFormData({ item_name: '', description: '', station_id: '' });
    } catch (err) {
      alert("Error reporting item.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b p-4 flex items-center gap-4 sticky top-0 z-10 shadow-sm">
        <button onClick={() => navigate('/dashboard')} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
          <ArrowLeft size={24} className="text-slate-600" />
        </button>
        <h1 className="text-xl font-black text-slate-800 tracking-tight">Lost & Found</h1>
      </div>

      <div className="max-w-6xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Report Form */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-200 sticky top-24">
            <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-6">
              <Megaphone size={20} className="text-orange-500" /> 
              Report Found Item
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input 
                type="text" 
                placeholder="Item Name (e.g., Wallet, Umbrella)" 
                className="w-full p-4 bg-slate-50 rounded-2xl outline-none border-2 border-transparent focus:border-orange-400 transition-all font-medium"
                value={formData.item_name}
                onChange={e => setFormData({...formData, item_name: e.target.value})}
                required 
              />
              <textarea 
                placeholder="Description (Color, Brand, etc.)" 
                className="w-full p-4 bg-slate-50 rounded-2xl outline-none min-h-[100px] resize-none border-2 border-transparent focus:border-orange-400 transition-all font-medium"
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
              />
              <select 
                className="w-full p-4 bg-slate-50 rounded-2xl outline-none border-2 border-transparent focus:border-orange-400 transition-all font-medium appearance-none"
                value={formData.station_id}
                onChange={e => setFormData({...formData, station_id: e.target.value})}
                required
              >
                <option value="">Where was it found?</option>
                {stations.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
              <button 
                type="submit" 
                className="w-full bg-orange-500 text-white py-4 rounded-2xl font-black text-lg hover:bg-orange-600 active:scale-95 transition-all shadow-lg shadow-orange-100"
              >
                Submit Report
              </button>
            </form>
          </div>
        </div>

        {/* Items List */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-2">
            <PackageSearch size={20} className="text-slate-400" />
            Recent Reports
          </h3>
          
          {loading ? (
            <div className="flex justify-center p-20"><Loader2 className="animate-spin text-slate-300" size={40} /></div>
          ) : items.length === 0 ? (
            <div className="bg-white p-12 rounded-[2rem] text-center border-2 border-dashed border-slate-200">
              <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No Items Found Yet</p>
            </div>
          ) : (
            items.map(item => (
              <div key={item.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex justify-between items-start animate-in fade-in slide-in-from-bottom-2">
                <div className="space-y-2">
                  <h4 className="font-black text-lg text-slate-800">{item.item_name}</h4>
                  <p className="text-slate-500 text-sm leading-relaxed">{item.description}</p>
                  <div className="flex items-center gap-2 pt-2">
                    <div className="flex items-center gap-1 bg-slate-100 px-3 py-1 rounded-full text-[10px] font-black text-slate-500 uppercase">
                      <MapPin size={12}/> {item.station_name || 'Unknown Station'}
                    </div>
                    <span className="text-[10px] font-bold text-slate-300 uppercase">
                      {new Date(item.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                    item.status === 'claimed' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'
                  }`}>
                    {item.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default LostFound;