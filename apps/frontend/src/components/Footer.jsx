import { Phone, Globe, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 py-12 px-6">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10">
        <div>
          <h3 className="text-white font-black italic text-xl mb-4">MetroSheba</h3>
          <p className="text-sm leading-relaxed text-slate-400">
            Enhancing the MRT-6 commuting experience with smart technology and real-time data.
          </p>
        </div>
        
        <div>
          <h4 className="text-white font-bold mb-4 uppercase tracking-widest text-xs">Resources</h4>
          <ul className="space-y-2 text-sm">
            <li>
              <a href="https://dmtcl.gov.bd/" target="_blank" rel="noreferrer" className="hover:text-green-500 flex items-center gap-2">
                <Globe size={14} /> Official DMTCL Website
              </a>
            </li>
            <li><button className="hover:text-green-500">MRT-6 Route Map</button></li>
            <li><button className="hover:text-green-500">Fare Calculator</button></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-bold mb-4 uppercase tracking-widest text-xs">Emergency Helpline</h4>
          <div className="flex items-center gap-3 text-green-500 font-mono text-lg mb-2">
            <Phone size={18} /> 16162
          </div>
          <p className="text-xs text-slate-500 flex items-center gap-2">
            <Mail size={12} /> support@metrosheba.gov.bd
          </p>
        </div>
      </div>
      <div className="max-w-6xl mx-auto mt-10 pt-6 border-t border-slate-800 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} MetroSheba. Not an official DMTCL entity.
      </div>
    </footer>
  );
}