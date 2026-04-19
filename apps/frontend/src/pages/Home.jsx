import { Link } from 'react-router-dom';
import { TrainFront, ArrowRight } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-white font-sans selection:bg-green-100">
      <nav className="flex items-center justify-between p-6 sticky top-0 bg-white/80 backdrop-blur-md z-50">
        <div className="flex items-center gap-2">
          <TrainFront className="text-green-600" size={28} />
          {/* FONT OPTION 1: "font-black tracking-tighter italic" (Modern/Fast) */}
          <span className="text-2xl font-black italic text-slate-900 tracking-tighter">
            Metro<span className="text-green-600">Sheba</span>
          </span>
        </div>
        <div className="space-x-2 md:space-x-6 flex items-center">
          <p className="text-sm font-bold text-slate-600">Already have an account?</p>
          {/* <Link to="/login" className="text-sm font-bold text-slate-600 hover:text-green-600 px-2">Login</Link> */}
          <Link to="/login" className="bg-green-600 text-white px-5 py-2 rounded-lg font-bold text-sm hover:bg-green-700 transition-all shadow-lg shadow-green-200">
            Log In
          </Link>
        </div>
      </nav>

      <main>
        {/* HERO SECTION */}
        <section className="max-w-7xl mx-auto px-6 py-16 grid md:grid-cols-2 gap-12 items-center">
          <div className="text-left">
            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
              Your personal MRT-6 companion
            </span>
            <h1 className="mt-6 text-5xl md:text-7xl font-extrabold text-slate-900 leading-[1.1]">
              Navigate Dhaka <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-500">
                With Confidence.
              </span>
            </h1>
            <p className="mt-8 text-lg text-slate-600 leading-relaxed max-w-lg">
              Providing you with quick QR ticketing, intelligent AI guides and live crowed tracking, all in one place.
            </p>
            <div className="mt-10 flex items-center gap-4">
              <Link to="/register" className="bg-slate-900 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-slate-800 transition-all flex items-center gap-2 group">
                Start Your Journey <ArrowRight className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          <div className="relative">
            {/* METRO IMAGE BOX */}
            <div className="rounded-3xl overflow-hidden shadow-2xl rotate-2 hover:rotate-0 transition-transform duration-500 border-8 border-white">
              <img 
  src="/metro_rail.jpg" 
  alt="Dhaka Metro Rail" 
  className="w-full h-full object-cover"
/>
            </div>
            {/* Floating Info Tag */}
            {/* <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-2xl shadow-xl border border-slate-100 hidden md:block animate-bounce-slow">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                  <TrainFront size={24} />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-bold uppercase">Next Train</p>
                  <p className="text-lg font-black text-slate-800">04:20 PM</p>
                </div>
              </div>
            </div> */}
          </div>
        </section>
      </main>
    </div>
  );
}