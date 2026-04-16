import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API } from '../api/metroApi';
import { ArrowLeft, Landmark, ShieldCheck } from 'lucide-react';

const TopUp = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ account_number: '', pin: '', amount: '' });

  const handleTopUp = async (e) => {
    e.preventDefault();
    try {
      const { data } = await API.post('/payment/topup', form);
      alert(`Success! Your new balance is ৳${data.newBalance}`);
      navigate('/dashboard');
    } catch (err) {
      alert(err.response?.data?.error || "Payment Failed");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <div className="bg-white p-4 border-b flex items-center gap-4">
        <button onClick={() => navigate('/dashboard')}><ArrowLeft /></button>
        <h1 className="font-bold">Metro Wallet Top-Up</h1>
      </div>

      <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-[2rem] shadow-xl border border-slate-100">
        <div className="flex justify-center mb-6 text-green-600">
          <Landmark size={48} />
        </div>
        
        <form onSubmit={handleTopUp} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-400">Account Number (Try: 123456)</label>
            <input type="text" className="w-full p-4 bg-slate-50 rounded-xl" 
              onChange={e => setForm({...form, account_number: e.target.value})} required />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-400">PIN (Try: 1234)</label>
            <input type="password" max="4" className="w-full p-4 bg-slate-50 rounded-xl" 
              onChange={e => setForm({...form, pin: e.target.value})} required />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-400">Amount (৳)</label>
            <input type="number" className="w-full p-4 bg-slate-50 rounded-xl font-bold text-green-600" 
              onChange={e => setForm({...form, amount: e.target.value})} required />
          </div>

          <button type="submit" className="w-full bg-green-600 text-white py-4 rounded-xl font-black flex items-center justify-center gap-2">
            <ShieldCheck size={20}/> Authorize Transfer
          </button>
        </form>
      </div>
    </div>
  );
};

export default TopUp;