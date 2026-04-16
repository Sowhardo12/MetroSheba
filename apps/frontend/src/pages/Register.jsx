import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../api/metroApi';
import { UserPlus } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(formData);
      alert("Account created! Please login.");
      navigate('/login');
    } catch (err) { alert("Registration failed."); }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl border border-slate-100">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold text-slate-800">Create Account</h2>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="text" placeholder="Full Name" className="w-full rounded-lg border p-3 outline-none focus:ring-2 focus:ring-green-500" onChange={(e) => setFormData({...formData, name: e.target.value})} required />
          <input type="email" placeholder="Email" className="w-full rounded-lg border p-3 outline-none focus:ring-2 focus:ring-green-500" onChange={(e) => setFormData({...formData, email: e.target.value})} required />
          <input type="password" placeholder="Password" className="w-full rounded-lg border p-3 outline-none focus:ring-2 focus:ring-green-500" onChange={(e) => setFormData({...formData, password: e.target.value})} required />
          <button type="submit" className="w-full rounded-lg bg-green-600 py-3 font-bold text-white hover:bg-green-700">Register</button>
        </form>
        <p className="mt-4 text-center text-sm text-slate-500">Already have an account? <Link to="/login" className="text-green-600 font-bold">Login</Link></p>
      </div>
    </div>
  );
};

export default Register;