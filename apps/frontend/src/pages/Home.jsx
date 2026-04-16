import { Link } from 'react-router-dom';
import { TrainFront, Map, ShieldCheck, Cpu } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <nav className="flex items-center justify-between p-6 bg-white shadow-sm">
        <div className="flex items-center gap-2">
          <TrainFront className="text-green-600" size={32} />
          <span className="text-2xl font-black italic text-slate-800 tracking-tighter">MetroSheba</span>
        </div>
        <div className="space-x-4">
          <Link to="/login" className="px-4 py-2 font-bold text-slate-600 hover:text-green-600">Login</Link>
          <Link to="/register" className="bg-green-600 text-white px-6 py-2 rounded-full font-bold hover:bg-green-700 shadow-md transition-all">Join Now</Link>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-20 text-center">
        <h1 className="text-5xl md:text-7xl font-black text-slate-900 leading-tight">
          Dhaka's <span className="text-green-600">Smartest</span> <br /> MRT-6 Companion.
        </h1>
        <p className="mt-6 text-xl text-slate-600 max-w-2xl mx-auto">
          Real-time maps, AI-powered landmark discovery, and instant QR ticketing for the modern commuter.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Link to="/register" className="bg-slate-900 text-white px-8 py-4 rounded-xl font-bold text-lg hover:scale-105 transition-transform">Get Started Free</Link>
        </div>
      </main>
    </div>
  );
}