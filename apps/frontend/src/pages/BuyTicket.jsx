import React, { useState, useEffect, useRef } from 'react'; // Added useRef here
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { fetchStations, API } from '../api/metroApi';
import { ArrowLeft, TrainFront, Info, CreditCard, CheckCircle, Download } from 'lucide-react'; // Grouped icons
import jsPDF from 'jspdf';
// import html2canvas from 'html2canvas'; didn't work with tailwindcss v4
import html2canvas from 'html2canvas-pro';

const BuyTicket = () => {
  const navigate = useNavigate();
  const [stations, setStations] = useState([]);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [fareInfo, setFareInfo] = useState(null);
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(false);

  // Reference for the PDF generator
  const ticketRef = useRef();

  const downloadPDF = async () => {
    const element = ticketRef.current;
    try {
      // scale: 2 ensures the QR code and text are sharp in the PDF
      const canvas = await html2canvas(element, { 
        scale: 2,
        useCORS: true, 
        backgroundColor: '#ffffff' 
      }); 
      const imgData = canvas.toDataURL('image/png');
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const imgProps = pdf.getImageProperties(imgData);
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      // Centering the ticket image in the PDF
      pdf.addImage(imgData, 'PNG', 0, 20, pdfWidth, pdfHeight);
      pdf.save(`MetroSheba_Ticket_${Date.now()}.pdf`);
    } catch (err) {
      console.error("PDF Generation Error:", err);
      alert("Failed to generate PDF. Please try again.");
    }
  };

  useEffect(() => {
    fetchStations()
      .then(res => setStations(res.data))
      .catch(err => console.error("Error fetching stations:", err));
  }, []);

  useEffect(() => {
    if (from && to && from !== to) {
      API.get(`/stations/fare?startId=${from}&endId=${to}`)
        .then(res => setFareInfo(res.data))
        .catch(() => setFareInfo(null));
    } else {
      setFareInfo(null);
    }
  }, [from, to]);

  const handlePurchase = async () => {
    if (!fareInfo) return;
    setLoading(true);
    try {
      const { data } = await API.post('/tickets/buy', {
        from_station: parseInt(from),
        to_station: parseInt(to),
        fare: fareInfo.fare
      });

      const localUser = JSON.parse(localStorage.getItem('user') || '{}');
      localStorage.setItem('user', JSON.stringify({
        ...localUser,
        balance: data.newBalance
      }));

      setTicket(data);
    } catch (err) {
      console.error("Purchase error:", err);
      alert(err.response?.data?.error || "Transaction failed. Please check your balance.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-10">
      <div className="bg-white border-b p-4 flex items-center gap-4 shadow-sm">
        <button
          onClick={() => navigate('/dashboard')}
          className="p-2 hover:bg-slate-100 rounded-full transition-colors"
        >
          <ArrowLeft size={24} className="text-slate-600" />
        </button>
        <h1 className="text-xl font-black text-slate-800 tracking-tight">Purchase Ticket</h1>
      </div>

      <div className="max-w-xl mx-auto p-6">
        {!ticket ? (
          /* SELECTION VIEW */
          <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 p-8">
            <div className="space-y-6">
              <div className="flex items-center gap-3 text-green-600 mb-2">
                <TrainFront size={24} />
                <span className="font-bold uppercase text-xs tracking-widest">Journey Details</span>
              </div>

              <div className="space-y-4">
                <div className="relative">
                  <label className="text-xs font-bold text-slate-400 absolute left-4 top-2">From</label>
                  <select
                    value={from}
                    className="w-full pt-6 pb-3 px-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-green-500 outline-none transition-all font-bold text-slate-700 appearance-none"
                    onChange={e => setFrom(e.target.value)}
                  >
                    <option value="">Select Origin</option>
                    {stations.map(s => (
                      <option key={`from-${s.id}`} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>

                <div className="relative">
                  <label className="text-xs font-bold text-slate-400 absolute left-4 top-2">To</label>
                  <select
                    value={to}
                    className="w-full pt-6 pb-3 px-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-green-500 outline-none transition-all font-bold text-slate-700 appearance-none"
                    onChange={e => setTo(e.target.value)}
                  >
                    <option value="">Select Destination</option>
                    {stations.map(s => (
                      <option key={`to-${s.id}`} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {fareInfo && (
                <div className="bg-green-50 p-6 rounded-3xl border border-green-100 flex justify-between items-center animate-in fade-in slide-in-from-top-2">
                  <div>
                    <p className="text-green-600 text-xs font-bold uppercase">Total Fare</p>
                    <p className="text-3xl font-black text-green-700">৳{fareInfo.fare}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-slate-400 text-[10px] font-bold uppercase">Stops</p>
                    <p className="font-bold text-slate-600">{fareInfo.stops} Stations</p>
                  </div>
                </div>
              )}

              <button
                disabled={!fareInfo || loading}
                onClick={handlePurchase}
                className="w-full bg-green-600 text-white py-5 rounded-2xl font-black text-lg flex items-center justify-center gap-3 hover:bg-green-700 active:scale-[0.98] transition-all disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed"
              >
                <CreditCard size={20} />
                {loading ? "Processing..." : "Pay with Wallet"}
              </button>
            </div>
          </div>
        ) : (
          /* TICKET VIEW */
          <div className="flex flex-col gap-6 items-center">
            {/* Wrapper for PDF Capture */}
            <div ref={ticketRef} style={{ borderColor: '#16a34a' }} className="w-full bg-white rounded-[3rem] shadow-xl border-4 border-green-600 p-8 text-center animate-in zoom-in-95 duration-300">
              <div style={{ backgroundColor: '#16a34a' }} className=" text-white py-2 px-6 rounded-full inline-flex items-center gap-2 mb-8 mx-auto">
                <CheckCircle size={18} />
                <span className="font-bold text-sm tracking-tight">Active Journey Ticket</span>
              </div>

              <div className="bg-slate-100 p-4 rounded-3xl inline-block mb-6 shadow-inner">
                <div className="bg-white p-4 rounded-2xl">
                  {ticket?.qr_code_data ? (
                    <QRCodeSVG value={String(ticket.qr_code_data)} size={200} />
                  ) : (
                    <div className="w-[200px] h-[200px] flex items-center justify-center text-slate-400">
                      Generating QR...
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4 mb-4">
                <p className="text-2xl font-black text-slate-800 uppercase tracking-tighter">MRT-6 Digital Pass</p>
                <div className="flex justify-center items-center gap-4 text-slate-500 font-bold">
                  <span>Valid for 1 Hour</span>
                  <span className="h-1 w-1 bg-slate-300 rounded-full"></span>
                  <span>৳{ticket?.fare || fareInfo?.fare}</span>
                </div>
              </div>
            </div>

            {/* Actions Section - Not included in PDF */}
            <div className="w-full space-y-3">
              <button
                onClick={downloadPDF}
                className="w-full bg-green-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-green-700 transition-all shadow-lg shadow-green-100"
              >
                <Download size={20} />
                Download PDF Ticket
              </button>

              <button
                onClick={() => navigate('/dashboard')}
                className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-black transition-all"
              >
                Return to Dashboard
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BuyTicket;