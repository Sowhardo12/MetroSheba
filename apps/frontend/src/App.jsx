import { Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import MetroMap from './components/MetroMap';
import React, { useEffect, useState } from 'react';
import { fetchStations } from './api/metroApi';
import BuyTicket from './pages/BuyTicket';
import LostFound from './pages/LostFound';
import TopUp from './pages/TopUp';
import { useLocation } from 'react-router-dom';
import Footer from './components/Footer';
import StationGate from './pages/StationGate'

function App() {
  const [stations, setStations] = useState([]);
  const location = useLocation();
  const showFooter = location.pathname !== '/map';
  
  useEffect(() => {
    fetchStations().then(res => setStations(res.data)).catch(err => console.log(err));
  }, []);

  const ProtectedRoute = ({ children }) => {
    return localStorage.getItem('token') ? children : <Navigate to="/login" />;
  };

  return (
    <div>
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>}/>
      <Route path="/topup" element={<ProtectedRoute><TopUp /></ProtectedRoute>} />
      <Route path="/buy-ticket" element={<ProtectedRoute><BuyTicket /></ProtectedRoute>} />
      <Route path="/lost-found" element={<ProtectedRoute><LostFound /></ProtectedRoute>} />
      <Route path="/station" element={<ProtectedRoute><StationGate /></ProtectedRoute>} />
      <Route path="/map" element={
        <ProtectedRoute>
          <div className="h-screen w-full relative">
            <MetroMap stations={stations} />
            <button 
              onClick={() => window.history.back()} 
              className="absolute top-4 right-4 z-[1001] bg-white px-4 py-2 rounded-lg font-bold shadow-md"
            >Back</button>
          </div>
        </ProtectedRoute>
      } />
    </Routes>
    {showFooter && <Footer />}
    </div>
  );
}

export default App;



















// import React, { useEffect, useState } from 'react';
// import { fetchStations } from './api/metroApi';
// import MetroMap from './components/MetroMap';
// import ChatBot from './components/ChatBot'; // We will create this next
// import { Loader2, TrainFront } from 'lucide-react';

// function App() {
//   const [stations, setStations] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const getInitialData = async () => {
//       try {
//         const { data } = await fetchStations();
//         setStations(data);
//       } catch (err) {
//         console.error("Error fetching metro data", err);
//       } finally {
//         setLoading(false);
//       }
//     };
//     getInitialData();
//   }, []);

//   if (loading) return (
//     <div className="flex h-screen w-full flex-col items-center justify-center bg-slate-50">
//       <Loader2 className="animate-spin text-blue-600 mb-4" size={40} />
//       <p className="text-slate-600 font-medium text-lg">Initializing MetroSheba...</p>
//     </div>
//   );

//   return (
//     <div className="relative h-screen w-full overflow-hidden bg-slate-100">
//       {/* 1. Header Overlay */}
//       <div className="absolute top-4 left-4 z-[1000] flex items-center gap-3 rounded-xl border border-slate-200 bg-white/90 p-3 shadow-lg backdrop-blur-md">
//         <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-600 text-white shadow-sm">
//           <TrainFront size={24} />
//         </div>
//         <div className="flex flex-col">
//           <h1 className="text-xl font-black tracking-tight text-slate-800 italic leading-none">
//             MetroSheba
//           </h1>
//           <p className="text-[9px] font-bold tracking-[0.1em] text-slate-500 uppercase">
//             MRT-6 Smart Companion
//           </p>
//         </div>
//       </div>

//       {/* 2. The Interactive Map - ONLY RENDER IF DATA EXISTS */}
//       <div className="h-full w-full">
//         {stations.length > 0 ? (
//           <MetroMap stations={stations} />
//         ) : (
//           <div className="flex h-full items-center justify-center text-slate-400">
//             Fetching coordinates...
//           </div>
//         )}
//       </div>

//       {/* 3. The AI Chatbot Overlay (Phase 5) */}
//       <ChatBot />
//     </div>
//   );
// }

// export default App;