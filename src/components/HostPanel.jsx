import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, RefreshCw, LogOut, User, MapPin, Phone, Car, Printer, Briefcase, Users, Clock, Trash2, Calendar, Plane, CreditCard } from 'lucide-react';
import Auth from './Auth';

// 🛡️ SECURITY UPDATE: Using Backend Proxy
const BACKEND_URL = "https://elite-transport-backend.onrender.com";

const DRIVER_DB = [
  { name: "Ahmed Ali", phone: "+971 50 123 4567", plate: "DXB 55401" },
  { name: "John Smith", phone: "+971 55 987 6543", plate: "AUH 11223" },
  { name: "Muhammad Khan", phone: "+971 52 333 4444", plate: "SHJ 99887" }
];

const getVal = (obj, keys, fallback = "N/A") => {
  if (!obj) return fallback;
  for (let k of keys) {
    if (obj[k] !== undefined && obj[k] !== null && String(obj[k]).trim() !== "") {
      return String(obj[k]);
    }
  }
  return fallback;
};

const formatDate = (str) => {
  if (!str || str === "N/A") return "N/A";
  let s = String(str);
  if (s.includes('T')) return s.split('T')[0];
  return s;
};

const formatTime = (str) => {
  if (!str || str === "N/A") return "N/A";
  let s = String(str);
  if (s.includes('T')) {
    const timePart = s.split('T')[1].substring(0, 5);
    let [h, m] = timePart.split(':');
    let hr = parseInt(h, 10);
    let ampm = hr >= 12 ? 'PM' : 'AM';
    hr = hr % 12 || 12;
    return `${hr}:${m} ${ampm}`;
  }
  return s;
};

export default function HostPanel() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [receiptData, setReceiptData] = useState(null);

  const [agency, setAgency] = useState('');
  const [driverName, setDriverName] = useState('');
  const [driverPhone, setDriverPhone] = useState('');
  const [vehicleNum, setVehicleNum] = useState('');
  const [driverFee, setDriverFee] = useState(''); // 🔥 NEW: Driver Fee State
  const [waitingMinutes, setWaitingMinutes] = useState(0);

  const [hasNewOrder, setHasNewOrder] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  
  // 🔥 UNIFIED SELECTION LOGIC
  const [selectedForDeletion, setSelectedForDeletion] = useState(new Set());
  
  const prevCount = useRef(0);
  const processedIds = useRef(new Set());

  const getBookingKey = (b) => {
    const sourceId = getVal(b, ['Source', 'source'], "");
    if (sourceId && sourceId !== "N/A") return String(sourceId).trim();
    return getVal(b, ['Email', 'email']) + "-" + getVal(b, ['Time', 'time']);
  };

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/sync-google?nocache=${Date.now()}`, { 
        headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' }
      });
      const data = await res.json();

      let allRows = [];
      if (Array.isArray(data)) allRows = data;
      else if (data && Array.isArray(data.data)) allRows = data.data;

      if (allRows.length > 0) {
        const pendingRows = allRows.filter(b => {
          const status = getVal(b, ['Status', 'status', 'STATUS'], "").toLowerCase();
          const key = getBookingKey(b);
          return status === 'pending' && !processedIds.current.has(key);
        });

        if (pendingRows.length > prevCount.current) {
          setHasNewOrder(true);
          if (soundEnabled) new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3').play().catch(() => { });
        }
        
        prevCount.current = pendingRows.length;
        setBookings(pendingRows.reverse());
      }
    } catch (error) { console.error("Sync Error"); }
    setLoading(false);
  }, [soundEnabled]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchOrders();
      const interval = setInterval(fetchOrders, 4000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, fetchOrders]);

  const handleSelectBooking = (booking) => {
    setSelectedBooking(booking);
    setDriverName('');
    setDriverPhone('');
    setVehicleNum('');
    setAgency('');
    setDriverFee(''); // 🔥 Reset Driver Fee on new selection
    setWaitingMinutes(0);
  };

  // 🔥 UPDATED: Toggle Select All
  const toggleSelectAll = () => {
    if (selectedForDeletion.size === bookings.length && bookings.length > 0) {
      setSelectedForDeletion(new Set());
    } else {
      const allKeys = bookings.map(b => getBookingKey(b));
      setSelectedForDeletion(new Set(allKeys));
    }
  };

  const toggleDeleteSelection = (e, key) => {
    e.stopPropagation();
    setSelectedForDeletion(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const handleBulkDelete = async () => {
    if (selectedForDeletion.size === 0) return;
    const confirm = window.confirm(`Are you sure you want to permanently delete ${selectedForDeletion.size} selected booking(s)?`);
    if (!confirm) return;

    const bookingsToDelete = bookings.filter(b => selectedForDeletion.has(getBookingKey(b)));
    const deletePayload = bookingsToDelete.map(b => ({
      ...b, "Status": 'Cancelled', "status": 'Cancelled', "STATUS": 'Cancelled'
    }));

    bookingsToDelete.forEach(b => processedIds.current.add(getBookingKey(b)));
    setBookings(prev => prev.filter(b => !selectedForDeletion.has(getBookingKey(b))));
    
    if (selectedBooking && selectedForDeletion.has(getBookingKey(selectedBooking))) {
      setSelectedBooking(null);
    }
    setSelectedForDeletion(new Set());

    try {
      await fetch(`${BACKEND_URL}/sync-google`, {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: 'update', data: deletePayload }) 
      });
    } catch (error) {
      alert("Failed to delete bookings on the server.");
    }
  };

  const handleDeleteBooking = async (e, booking) => {
    e.stopPropagation();
    const guestName = getVal(booking, ['Guest_name', 'Guest Name', 'guest_name']);
    const isConfirmed = window.confirm(`Are you sure you want to delete the booking for ${guestName}?`);
    if (!isConfirmed) return;

    const targetKey = getBookingKey(booking);
    processedIds.current.add(targetKey);
    setBookings(prev => prev.filter(b => getBookingKey(b) !== targetKey));

    if (selectedBooking && getBookingKey(selectedBooking) === targetKey) {
      setSelectedBooking(null);
    }

    const deleteData = { ...booking, "Status": 'Cancelled', "status": 'Cancelled', "STATUS": 'Cancelled' };

    try {
      await fetch(`${BACKEND_URL}/sync-google`, {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: 'update', data: [deleteData] }) 
      });
    } catch (error) {
      alert("Failed to delete the booking on the server.");
    }
  };

  const handleDispatch = async (e) => {
    e.preventDefault();
    if (!selectedBooking) return;

    let waitFee = 0;
    if (waitingMinutes > 60) waitFee = waitingMinutes - 60;
    waitFee = Math.round(waitFee);

    const safeDriverPhone = driverPhone.startsWith('+') ? ` ${driverPhone}` : driverPhone;

    const updateData = {
      ...selectedBooking,
      "Agency": agency,
      "Driver": driverName,
      "Driver_number": safeDriverPhone,
      "Vehicle_number": vehicleNum,
      "Driver_Fee": driverFee, // 🔥 NEW: Driver Fee sent to the database
      "Wait_Time": waitingMinutes,
      "Wait_Fee": waitFee,
      "Status": 'Host Confirmed',
      "status": 'Host Confirmed',
      "STATUS": 'Host Confirmed'
    };

    const targetKey = getBookingKey(selectedBooking);
    processedIds.current.add(targetKey);
    setBookings(prev => prev.filter(b => getBookingKey(b) !== targetKey));

    setReceiptData(updateData);
    setSelectedBooking(null);
    setWaitingMinutes(0);

    try {
      await fetch(`${BACKEND_URL}/sync-google`, {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: 'update', data: [updateData] }) 
      });
    } catch (error) { 
      alert("Dispatch Failed to reach server"); 
    }
  };

  if (!isAuthenticated) return <div className="min-h-screen bg-[#060b18] flex items-center justify-center"><Auth onAuthSuccess={() => setIsAuthenticated(true)} /></div>;

  if (receiptData) {
    const rx = receiptData;
    const sourceRef = getVal(rx, ['Source', 'source']);
    const tripDate = formatDate(getVal(rx, ['Date', 'date']));
    const tripTime = formatTime(getVal(rx, ['Time', 'time']));
    const guestName = getVal(rx, ['Guest_name', 'Guest Name', 'guest_name']);
    const guestPhone = getVal(rx, ['Guest_number', 'Guest Number', 'guest_number']);
    const guestEmail = getVal(rx, ['Email', 'email']);
    const flightNum = getVal(rx, ['Flight', 'flight'], "N/A");
    const pickup = getVal(rx, ['Pickup', 'pickup']);
    const dropoff = getVal(rx, ['Drop_off', 'Drop off', 'drop_off']);
    const carType = getVal(rx, ['Car_type', 'Car type', 'car_type'], 'Business');
    const driverName = getVal(rx, ['Driver', 'driver'], "Pending");
    const driverPhone = getVal(rx, ['Driver_number', 'Driver number', 'driver_number'], "Pending");
    const vehiclePlate = getVal(rx, ['Vehicle_number', 'Vehicle number', 'vehicle_number'], "Pending");
    const price = getVal(rx, ['Price', 'price', 'Amount', 'amount'], "0");
    const payment = getVal(rx, ['Payment', 'payment'], "Cash");
    const extraStopsCount = Number(getVal(rx, ['Extra_Stops', 'Extra Stops', 'extra_stops'], 0));
    const stopNames = getVal(rx, ['Stop_Names', 'Stop Names', 'stop_names'], "None");
    const waitTime = Number(getVal(rx, ['Wait_Time', 'Wait Time', 'wait_time'], 0));
    const waitFee = Number(getVal(rx, ['Wait_Fee', 'Wait Fee', 'wait_fee'], 0));
    const paxCount = getVal(rx, ['Pax', 'pax'], "1");
    const luggageCount = getVal(rx, ['Luggage', 'luggage'], "0");

    return (
      <div className="min-h-screen bg-[#060b18] flex items-center justify-center p-6 font-sans text-left">
        <style>{`@media print { body * { visibility: hidden; } #printable-receipt, #printable-receipt * { visibility: visible; } #printable-receipt { position: absolute; left: 0; top: 0; width: 100%; margin: 0 !important; padding: 20px !important; background: white !important; color: black !important; border: none !important; } .no-print-btn, .no-print { display: none !important; } }`}</style>
        <div id="printable-receipt" className="bg-white p-6 md:p-8 rounded-[2.5rem] text-slate-900 shadow-2xl border border-slate-200/50 font-sans relative overflow-hidden text-left max-w-xl mx-auto w-full">
          <div className="absolute top-0 left-0 right-0 h-3 bg-amber-500"></div>
          <div className="flex justify-between items-center mb-6 mt-4 pb-4 border-b border-slate-100">
            <div>
              <img src="/Logo.png" alt="Elite Ride" className="h-10 w-auto object-contain mb-1" />
              <div className="text-xl font-black italic uppercase tracking-tighter leading-none">Elite <span className="text-amber-600">Ride</span></div>
            </div>
            <div className="text-right"><h2 className="text-2xl font-black uppercase text-slate-800 leading-none">Receipt</h2></div>
          </div>
          <div className="flex flex-col md:flex-row justify-between text-xs mb-6 text-slate-500 bg-slate-50 p-3 rounded-xl">
            <div><span className="block uppercase tracking-wider font-bold text-[10px]">Date Issued</span><span className="font-bold text-slate-900 text-sm">{new Date().toLocaleDateString()}</span></div>
            <div className="mt-2 md:mt-0 md:text-right"><span className="block uppercase tracking-wider font-bold text-[10px]">Booking Ref</span><span className="font-black text-slate-900 text-sm font-mono">{sourceRef}</span></div>
          </div>
          <div className="space-y-6">
            <section>
              <h4 className="text-xs font-black uppercase text-slate-400 mb-2 tracking-[0.2em]">Booking Details</h4>
              <div className="bg-slate-50 border border-slate-100 p-5 rounded-2xl">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4 pb-4 border-b border-slate-200">
                  <div>
                    <span className="block text-[10px] font-bold uppercase text-slate-400">Lead Passenger</span>
                    <span className="font-bold text-sm text-slate-900">{guestName}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold uppercase text-slate-400">Pax & Luggage</span>
                    <span className="font-bold text-sm text-slate-900 flex items-center gap-2 mt-0.5">
                      {paxCount} <Users size={14} className="text-amber-500" /> | {luggageCount} <Briefcase size={14} className="text-amber-500" />
                    </span>
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold uppercase text-slate-400">Booking Class</span>
                    <span className="font-bold text-sm capitalize text-slate-900">{carType}</span>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <span className="block text-[10px] font-bold uppercase text-slate-400">Flight Number</span>
                    <span className="font-bold text-sm text-slate-900">{flightNum}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold uppercase text-slate-400">Phone Number</span>
                    <span className="font-bold text-sm text-slate-900">{guestPhone}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold uppercase text-slate-400">Email Address</span>
                    <span className="font-bold text-sm text-slate-900 truncate block">{guestEmail}</span>
                  </div>
                </div>
              </div>
            </section>
            <section>
              <h4 className="text-xs font-black uppercase text-slate-400 mb-2 tracking-[0.2em]">Trip Details</h4>
              <div className="bg-white border border-slate-100 p-4 rounded-2xl space-y-4 relative overflow-hidden">
                <div className="absolute left-[27px] top-[60px] bottom-[30px] w-0.5 bg-slate-200/80 z-0"></div>
                <div className="grid grid-cols-2 gap-4 relative z-10">
                  <div><span className="block text-[10px] font-bold uppercase text-slate-400">Trip Date & Time</span><span className="font-bold text-sm">{tripDate} <span className="text-amber-600">@</span> {tripTime}</span></div>
                </div>
                <div className="space-y-4 relative z-10 mt-2">
                  <div className="flex items-start gap-3">
                    <div className="mt-1 w-3 h-3 rounded-full bg-amber-500 border-2 border-white shadow-sm shrink-0"></div>
                    <div><span className="block text-[10px] font-bold uppercase text-slate-400 leading-none mb-1">Pickup Location</span><span className="font-bold text-sm leading-tight block">{pickup}</span></div>
                  </div>
                  {extraStopsCount > 0 && (
                    <div className="flex items-start gap-3 ml-1">
                      <div className="mt-1 w-2 h-2 rounded-full bg-slate-400 border border-white shadow-sm shrink-0"></div>
                      <div><span className="block text-[10px] font-bold uppercase text-slate-400 leading-none mb-1">Extra Stops ({extraStopsCount})</span><span className="font-bold text-sm leading-tight block text-slate-600">{stopNames}</span></div>
                    </div>
                  )}
                  <div className="flex items-start gap-3">
                    <div className="mt-1 w-3 h-3 rounded-full bg-slate-900 border-2 border-white shadow-sm shrink-0"></div>
                    <div><span className="block text-[10px] font-bold uppercase text-slate-400 leading-none mb-1">Dropoff Location</span><span className="font-bold text-sm leading-tight block">{dropoff}</span></div>
                  </div>
                </div>
              </div>
            </section>
            <section>
              <h4 className="text-xs font-black uppercase text-slate-400 mb-2 tracking-[0.2em]">Driver Details</h4>
              <div className="bg-white border border-slate-100 p-4 rounded-2xl">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div><span className="block text-[10px] font-bold uppercase text-slate-400">Chauffeur</span><span className="font-black text-sm uppercase text-amber-600">{driverName}</span></div>
                  <div><span className="block text-[10px] font-bold uppercase text-slate-400">Contact</span><span className="font-bold text-sm font-mono">{driverPhone}</span></div>
                  <div><span className="block text-[10px] font-bold uppercase text-slate-400">Vehicle Plate</span><span className="font-bold text-sm text-amber-600 bg-amber-50 px-2 py-1 rounded uppercase border border-amber-200 inline-block">{vehiclePlate}</span></div>
                </div>
              </div>
            </section>
            <section>
              <div className={`p-5 rounded-2xl ${payment.includes('100%') ? 'bg-emerald-50 border border-emerald-100' : 'bg-amber-50 border border-amber-100'}`}>
                {waitFee > 0 && (
                  <div className="flex justify-between items-center mb-3 pb-3 border-b border-rose-200/50">
                    <span className="text-[10px] font-black uppercase text-rose-500">Late Waiting Penalty ({waitTime - 60} mins)</span>
                    <span className="text-sm font-black text-rose-600">+ AED {waitFee} (Due Cash)</span>
                  </div>
                )}
                <div className="flex justify-between items-center mb-3 pb-3 border-b border-slate-200/50">
                  <span className="text-xs font-bold uppercase text-slate-500 tracking-wider">Total Route Amount</span>
                  <span className="text-lg font-black text-slate-400">AED {price}</span>
                </div>
                {payment.includes('25%') && (
                  <div className="flex justify-between items-center mb-3 pb-3 border-b border-emerald-200/50">
                    <span className="text-[10px] font-black uppercase text-emerald-600">25% Deposit (Paid via Card)</span>
                    <span className="text-sm font-black text-emerald-600">- AED {Math.round(Number(price) * 0.25)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center mb-3 pb-3 border-b border-slate-200/50">
                  <span className="text-xs font-bold uppercase text-slate-500 tracking-wider">
                    {payment.includes('100%') ? "Amount Due to Driver" : "Cash Due to Driver"}
                  </span>
                  <span className={`text-3xl font-black ${payment.includes('100%') ? 'text-emerald-600' : 'text-slate-900'}`}>
                    AED {payment.includes('100%') ? '0' : (payment.includes('25%') ? (Number(price) - Math.round(Number(price) * 0.25)) : price)}
                  </span>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-xs font-bold uppercase text-slate-500 tracking-wider flex items-center gap-2">Status</span>
                  <span className={`font-black text-[9px] uppercase px-3 py-1 rounded-full text-right max-w-[200px] leading-tight ${payment.includes('100%') ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                    {payment.split(' (Ref')[0]}
                  </span>
                </div>
              </div>
            </section>
          </div>
          <button onClick={() => window.print()} className="no-print-btn w-full mt-6 bg-slate-900 text-white py-4 rounded-xl font-bold uppercase flex items-center justify-center gap-2 hover:bg-slate-800 mb-3 transition-colors shadow-lg">
            <Printer size={18} /> Print Record
          </button>
          <button onClick={() => setReceiptData(null)} className="no-print-btn w-full bg-slate-100 text-slate-500 py-4 rounded-xl font-bold uppercase hover:bg-slate-200 transition-colors">
            Back to Terminal
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#060b18] p-4 md:p-10 text-white font-sans text-left">
      <AnimatePresence>
        {hasNewOrder && (
          <motion.div initial={{ y: -100 }} animate={{ y: 0 }} className="fixed top-0 left-0 right-0 z-[5000] bg-amber-500 text-slate-900 p-6 flex justify-between items-center font-black uppercase shadow-2xl">
            <span className="flex items-center gap-4 text-xl"><Bell className="animate-bounce" /> New Guest!</span>
            <button onClick={() => setHasNewOrder(false)} className="bg-slate-900 text-white px-8 py-3 rounded-full text-xs">OK</button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
        <h2 className="text-3xl md:text-4xl font-black italic uppercase text-amber-500">Terminal</h2>
        <div className="flex gap-4 w-full md:w-auto">
          <button onClick={() => setSoundEnabled(!soundEnabled)} className={`flex-1 md:flex-none p-4 rounded-2xl font-bold text-xs uppercase ${soundEnabled ? 'bg-emerald-500 text-slate-900' : 'bg-red-500/20 text-red-500 border border-red-500'}`}>
            {soundEnabled ? "Sound Active" : "Enable Sound"}
          </button>
          <button onClick={fetchOrders} className="p-4 bg-slate-800 rounded-2xl"><RefreshCw className={loading ? 'animate-spin' : ''} /></button>
          <button onClick={() => setIsAuthenticated(false)} className="p-4 bg-slate-800 rounded-2xl"><LogOut /></button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10">
        
        {/* LEFT SECTION: LIVE WAITLIST */}
        <div className="bg-slate-900/40 p-6 md:p-8 rounded-[3rem] border border-slate-800">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-3">
              {/* 🔥 NEW: SELECT ALL CHECKBOX */}
              <div 
                onClick={toggleSelectAll}
                className={`w-5 h-5 rounded-md border-2 flex items-center justify-center cursor-pointer transition-all ${selectedForDeletion.size === bookings.length && bookings.length > 0 ? 'bg-amber-500 border-amber-500' : 'border-slate-700 bg-slate-800'}`}
              >
                {selectedForDeletion.size === bookings.length && bookings.length > 0 && <div className="w-2.5 h-2.5 bg-slate-900 rounded-sm"></div>}
              </div>
              <h3 className="text-[10px] font-black uppercase text-slate-500 tracking-[0.3em]">Select All / Waitlist</h3>
            </div>
            
            {/* 🔥 NEW: MULTI-DELETE BUTTON */}
            {selectedForDeletion.size > 0 && (
              <button
                onClick={handleBulkDelete}
                className="bg-red-500/20 text-red-500 hover:bg-red-500 hover:text-white border border-red-500/50 px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all flex items-center gap-2 shadow-lg"
              >
                <Trash2 size={14} /> Delete Selected ({selectedForDeletion.size})
              </button>
            )}
          </div>

          <div className="space-y-4 max-h-[550px] overflow-y-auto pr-2">
            {bookings.filter(b => {
              const isPending = getVal(b, ['Status', 'status'], "").toLowerCase() === 'pending';
              return isPending && !processedIds.current.has(getBookingKey(b));
            }).map((b, i) => {
              const bKey = getBookingKey(b);
              const isChecked = selectedForDeletion.has(bKey);

              return (
                <div
                  key={i}
                  onClick={() => handleSelectBooking(b)}
                  className={`p-6 rounded-[2.5rem] border-2 cursor-pointer transition-all ${getVal(selectedBooking, ['Source', 'source']) === getVal(b, ['Source', 'source']) ? 'border-amber-500 bg-amber-500/10' : 'border-slate-800 bg-slate-900'}`}
                >
                  <div className="font-black text-sm uppercase flex justify-between mb-2 items-center">
                    <span className="flex items-center gap-2">
                      {/* 🔥 INDIVIDUAL CHECKBOX */}
                      <div 
                        onClick={(e) => toggleDeleteSelection(e, bKey)}
                        className={`w-4 h-4 rounded border flex items-center justify-center transition-colors mr-2 ${isChecked ? 'bg-red-500 border-red-500' : 'border-slate-600 bg-slate-800'}`}
                      >
                        {isChecked && <div className="w-2 h-2 bg-white rounded-sm"></div>}
                      </div>
                      <User size={14} className="text-amber-500" /> {getVal(b, ['Guest_name', 'Guest Name', 'guest_name'])}
                    </span>

                    <div className="flex items-center gap-3">
                      <span className="text-slate-500 text-[10px]">{formatTime(getVal(b, ['Time', 'time']))}</span>
                      <button
                        onClick={(e) => handleDeleteBooking(e, b)}
                        className="p-1.5 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-md transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-[10px] text-slate-400 mb-2 pl-8">
                    <Phone size={10} /> {getVal(b, ['Guest_number', 'Guest Number', 'guest_number'])}
                  </div>
                  <div className="text-[10px] text-slate-400 pl-8"><MapPin size={10} /> {getVal(b, ['Pickup', 'pickup'])} → {getVal(b, ['Drop_off', 'Drop off', 'Drop Off', 'drop_off'])}</div>
                </div>
              );
            })}
            
            {bookings.length === 0 && (
              <p className="text-slate-500 text-xs text-center mt-10 uppercase font-bold tracking-widest">No pending bookings</p>
            )}
          </div>
        </div>

        {/* RIGHT SECTION: DISPATCH ORDER */}
        <div className="bg-white p-6 md:p-10 rounded-[3rem] text-slate-900 shadow-2xl sticky top-10 h-fit">
          <h3 className="text-2xl font-black uppercase italic mb-8 border-b pb-4">Dispatch Order</h3>
          <form onSubmit={handleDispatch} className="space-y-4">
            <div className={`p-5 rounded-3xl border-2 transition-all duration-300 ${selectedBooking ? 'bg-slate-900 text-white border-slate-900' : 'bg-slate-50 border-dashed border-slate-300'}`}>
              {!selectedBooking ? (
                <p className="text-center py-4 font-bold uppercase text-[10px] text-slate-400 tracking-widest">Select a guest from the waitlist</p>
              ) : (
                <div className="space-y-3">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                    <span className="text-[10px] font-black uppercase text-amber-500">Lead Passenger</span>
                    <span className="font-black text-sm uppercase">{getVal(selectedBooking, ['Guest_name', 'Guest Name', 'guest_name'])}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-[10px] font-bold uppercase">
                    <div className="flex items-center gap-2"><Phone size={12} className="text-amber-500"/> {getVal(selectedBooking, ['Guest_number', 'guest_number'])}</div>
                    <div className="flex items-center gap-2"><Calendar size={12} className="text-amber-500"/> {formatDate(getVal(selectedBooking, ['Date', 'date']))} @ {formatTime(getVal(selectedBooking, ['Time', 'time']))}</div>
                    <div className="flex items-center gap-2"><Plane size={12} className="text-amber-500"/> {getVal(selectedBooking, ['Flight', 'flight'])}</div>
                    <div className="flex items-center gap-2"><CreditCard size={12} className="text-amber-500"/> AED {getVal(selectedBooking, ['Price', 'price'])}</div>
                    <div className="flex items-center gap-2"><Users size={12} className="text-amber-500"/> {getVal(selectedBooking, ['Pax', 'pax'], "1")} Pax</div>
                    <div className="flex items-center gap-2"><Briefcase size={12} className="text-amber-500"/> {getVal(selectedBooking, ['Luggage', 'luggage'], "0")} Bags</div>
                  </div>
                  <div className="text-[9px] bg-slate-800 p-3 rounded-xl space-y-1">
                    <p className="flex items-start gap-1"><span className="text-amber-500 shrink-0">FROM:</span> {getVal(selectedBooking, ['Pickup', 'pickup'])}</p>
                    <p className="flex items-start gap-1"><span className="text-amber-500 shrink-0">TO:</span> {getVal(selectedBooking, ['Drop_off', 'drop_off'])}</p>
                  </div>
                  {Number(getVal(selectedBooking, ['Extra_Stops', 'Extra Stops', 'extra_stops'], 0)) > 0 && (
                      <p className="flex items-start gap-1">
                        <span className="text-amber-500 font-black shrink-0">STOPS ({getVal(selectedBooking, ['Extra_Stops', 'Extra Stops', 'extra_stops'])}):</span> 
                        <span className="text-slate-300">{getVal(selectedBooking, ['Stop_Names', 'Stop Names', 'stop_names'])}</span>
                      </p>
                    )}
                </div>
              )}
            </div>
            
            {/* 🔥 UPDATED INPUTS */}
            <input value={agency} onChange={e => setAgency(e.target.value)} placeholder="Agency Name" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm outline-none focus:border-amber-500 transition-all" />
            
            <input value={driverName} onChange={(e) => setDriverName(e.target.value)} placeholder="Driver Name" required className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm outline-none focus:border-amber-500 transition-all" />
            
            <div className="relative">
              <input value={driverPhone} onChange={(e) => setDriverPhone(e.target.value)} placeholder="Driver Phone (+971...)" required className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm outline-none focus:border-amber-500 transition-all" />
              <Phone className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            </div>
            
            <div className="relative">
              <input value={vehicleNum} onChange={(e) => setVehicleNum(e.target.value)} placeholder="Vehicle Plate No." required className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm outline-none focus:border-amber-500 transition-all" />
              <Car className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            </div>

            {/* 🔥 NEW: DRIVER FEE INPUT */}
            <div className="relative">
              <input value={driverFee} onChange={(e) => setDriverFee(e.target.value)} type="number" placeholder="Driver Fee (AED)" required className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm outline-none focus:border-amber-500 transition-all" />
              <CreditCard className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            </div>

            <button disabled={!selectedBooking} className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black uppercase hover:bg-amber-500 hover:text-slate-900 transition-all shadow-xl disabled:opacity-50 disabled:cursor-not-allowed">
              Dispatch & Print
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}