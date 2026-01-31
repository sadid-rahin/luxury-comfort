import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, RefreshCw, LogOut, User, MapPin, Volume2, VolumeX } from 'lucide-react';
import Auth from './Auth';

// 🔴 PASTE YOUR NEW URL HERE 🔴
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwHgxuyiNIQ0u5_G5FbZU9c9l0lX9klj31ECzPCHoM7L83yQhl5uxfvju8H4UmRibyB/exec"; 

export default function HostPanel() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [hasNewOrder, setHasNewOrder] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const prevCount = useRef(0);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(SCRIPT_URL, { cache: 'no-cache' });
      const data = await res.json();
      
      if (Array.isArray(data)) {
        // Universal Status Check
        const pending = data.filter(b => {
           const s = b.Status || b.status || "";
           return String(s).trim().toLowerCase() === 'pending';
        });

        if (pending.length > prevCount.current) {
          setHasNewOrder(true);
          if (soundEnabled) {
            new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3').play().catch(()=>{});
          }
        }
        prevCount.current = pending.length;
        setBookings(data.reverse());
      }
    } catch (e) { console.error("Sync Error"); }
    finally { setLoading(false); }
  }, [soundEnabled]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchOrders();
      const interval = setInterval(fetchOrders, 4000); 
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, fetchOrders]);

  const handleDispatch = async (e) => {
    e.preventDefault();
    if (!selectedBooking) return;
    const formData = new FormData(e.target);
    
    // Updates using the UNIQUE ID (Source)
    const update = { 
      "Source": selectedBooking.Source || selectedBooking.source, 
      "Guest_name": selectedBooking.Guest_name || selectedBooking.guest_name,
      "Agency": formData.get('agency'),
      "Driver": formData.get('driver'), 
      "Driver_number": formData.get('driverNum'),
      "Status": "Host Confirmed" 
    };
    try {
      await fetch(SCRIPT_URL, { method: 'POST', mode: 'no-cors', body: JSON.stringify({ data: [update] }) });
      alert("Dispatch Confirmed!"); setSelectedBooking(null); fetchOrders();
    } catch (e) { alert("Error"); }
  };

  if (!isAuthenticated) return <div className="min-h-screen bg-[#060b18] flex items-center justify-center"><Auth onAuthSuccess={() => setIsAuthenticated(true)} /></div>;

  return (
    <div className="min-h-screen bg-[#060b18] p-4 md:p-10 text-white font-sans">
      <AnimatePresence>
        {hasNewOrder && (
          <motion.div initial={{ y: -100 }} animate={{ y: 0 }} className="fixed top-0 left-0 right-0 z-[5000] bg-amber-500 text-slate-900 p-6 flex justify-between items-center font-black uppercase shadow-2xl">
            <span className="flex items-center gap-4 text-xl"><Bell className="animate-bounce" /> New Guest!</span>
            <button onClick={() => setHasNewOrder(false)} className="bg-slate-900 text-white px-8 py-3 rounded-full text-xs">OK</button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto flex justify-between items-center mb-10">
        <h2 className="text-4xl font-black italic uppercase text-amber-500">Terminal</h2>
        <div className="flex gap-4">
          <button onClick={() => setSoundEnabled(!soundEnabled)} className={`p-4 rounded-2xl font-bold text-xs uppercase ${soundEnabled ? 'bg-emerald-500 text-slate-900' : 'bg-red-500/20 text-red-500 border border-red-500'}`}>
            {soundEnabled ? "Sound Active" : "Enable Sound"}
          </button>
          <button onClick={fetchOrders} className="p-4 bg-slate-800 rounded-2xl"><RefreshCw className={loading ? 'animate-spin' : ''} /></button>
          <button onClick={() => setIsAuthenticated(false)} className="p-4 bg-slate-800 rounded-2xl"><LogOut /></button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="bg-slate-900/40 p-8 rounded-[3rem] border border-slate-800">
          <h3 className="text-[10px] font-black uppercase mb-8 text-slate-500 tracking-[0.3em]">Live Waitlist</h3>
          <div className="space-y-4 max-h-[550px] overflow-y-auto pr-2">
            {bookings.filter(b => {
                const s = b.Status || b.status || "";
                return String(s).trim().toLowerCase() === 'pending';
            }).map((b, i) => (
              <div key={i} onClick={() => setSelectedBooking(b)} className={`p-6 rounded-[2.5rem] border-2 cursor-pointer ${selectedBooking?.source === b.source ? 'border-amber-500 bg-amber-500/10' : 'border-slate-800 bg-slate-900'}`}>
                <div className="font-black text-sm uppercase flex items-center gap-2 mb-2"><User size={14} className="text-amber-500" /> {b.Guest_name || b.guest_name}</div>
                <div className="text-[10px] text-slate-400"><MapPin size={12} /> {b.Pickup || b.pickup} → {b.Drop_off || b["Drop off"] || b.drop_off}</div>
              </div>
            ))}
             {bookings.filter(b => (b.Status || b.status || "").toLowerCase() === 'pending').length === 0 && (
                <div className="text-slate-600 italic text-center mt-10">No pending guests...</div>
            )}
          </div>
        </div>

        <div className="bg-white p-10 rounded-[3rem] text-slate-900 shadow-2xl sticky top-10">
          <h3 className="text-2xl font-black uppercase italic mb-8 border-b pb-4">Dispatch Order</h3>
          <form onSubmit={handleDispatch} className="space-y-6">
            <div className="bg-slate-100 p-5 rounded-2xl border-2 border-slate-200">
              <label className="text-[9px] font-black uppercase text-slate-400 block mb-2">Guest</label>
              <input value={selectedBooking ? (selectedBooking.Guest_name || selectedBooking.guest_name) : ''} readOnly className="w-full bg-transparent font-black uppercase text-sm outline-none" placeholder="Select from waitlist..." required />
            </div>
            <input name="agency" placeholder="Agency" className="w-full p-5 bg-slate-50 border-2 rounded-2xl font-bold" required />
            <input name="driver" placeholder="Driver Name" className="w-full p-5 bg-slate-50 border-2 rounded-2xl font-bold" required />
            <input name="driverNum" placeholder="Driver Phone" className="w-full p-5 bg-slate-50 border-2 rounded-2xl font-bold" required />
            <button disabled={!selectedBooking} className="w-full bg-slate-900 text-white py-6 rounded-[2rem] font-black uppercase tracking-widest disabled:opacity-20 shadow-xl">Confirm Dispatch</button>
          </form>
        </div>
      </div>
    </div>
  );
}