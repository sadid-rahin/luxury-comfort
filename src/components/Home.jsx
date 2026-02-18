import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Phone, Mail, MapPin, Printer, Users, Briefcase, Clock, ShieldCheck, RotateCcw, AlertTriangle, FileText, Search } from 'lucide-react';
import BookingForm from './BookingForm';
import HowItWorks from './HowItWorks';
import OurServices from './OurServices';
import VehicleCategories from './VehicleCategories';

// 🛡️ SECURITY UPDATE: Using Backend Proxy
const BACKEND_URL = "https://elite-transport-backend.onrender.com";

const FLEET_CAPACITY = {
  'Sedan': { pax: 3, luggage: 2 },
  'Business': { pax: 3, luggage: 2 },
  'SUV': { pax: 5, luggage: 5 },
  'MPV': { pax: 7, luggage: 6 },
  'MiniBus': { pax: 10, luggage: 8 },
  'Viano': { pax: 7, luggage: 6 }
};

const CAR_CATEGORY_MAP = {
  'Lexus': 'Business',
  'Axis': 'Sedan',
  'Highlander': 'SUV',
  'Outlander': 'SUV',
  'Carnival': 'MPV',
  'Staria': 'MPV',
  'Citroen': 'Viano',
  'VClass': 'Viano'
};

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

export default function Home() {
  const [step, setStep] = useState('booking');
  const [guestData, setGuestData] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState('Business');

  // Recovery State
  const [searchEmail, setSearchEmail] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const handleBookingSuccess = (data) => {
    setGuestData(data);
    setStep('waiting');
  };

  const handleFindBooking = async (e) => {
    e.preventDefault();
    if (!searchEmail) return;
    setIsSearching(true);
    try {
      // ✅ SECURITY FIX: Fetch via Proxy
      const res = await fetch(`${BACKEND_URL}/sync-google`);
      const allRows = await res.json();
      const found = allRows.find(row =>
        getVal(row, ['Email', 'email']).toLowerCase() === searchEmail.toLowerCase() &&
        getVal(row, ['Status', 'status']).toLowerCase() !== 'cancelled'
      );
      if (found) {
        setGuestData(found);
        setStep('waiting');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        alert("No active booking found for this email.");
      }
    } catch (e) { alert("Error connecting to server."); }
    setIsSearching(false);
  };

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsMenuOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-white font-sans selection:bg-amber-500 selection:text-slate-900">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-white/10 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 md:h-16 flex items-center justify-between gap-4">
          <a href="#!" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="flex items-center gap-2.5 min-w-0 flex-shrink-0">
            <img src="/Logo.png" alt="Elite Ride logo" className="h-11 w-11 md:h-12 md:w-12 object-contain flex-shrink-0" />
            <span className="text-lg md:text-xl font-black italic uppercase whitespace-nowrap tracking-tight">Elite <span className="text-amber-500">Ride</span></span>
          </a>
          <div className="hidden md:flex items-center gap-6 lg:gap-8 flex-shrink-0">
            <button onClick={() => scrollToSection('how-it-works')} className="text-xs font-bold uppercase tracking-widest hover:text-amber-500 transition-colors whitespace-nowrap">How to Process</button>
            <button onClick={() => scrollToSection('services')} className="text-xs font-bold uppercase tracking-widest hover:text-amber-500 transition-colors whitespace-nowrap">Services</button>
            <button onClick={() => scrollToSection('policy')} className="text-xs font-bold uppercase tracking-widest hover:text-amber-500 transition-colors whitespace-nowrap">Terms & Policy</button>
            <button onClick={() => scrollToSection('contact')} className="text-xs font-bold uppercase tracking-widest hover:text-amber-500 transition-colors whitespace-nowrap">Contact Us</button>
          </div>
          <button type="button" className="md:hidden flex-shrink-0 p-2 -mr-1 text-white hover:text-amber-500 transition-colors" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </nav>

      <section className="pt-32 pb-20 px-6 md:px-12 border-b border-slate-800">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div initial={{ x: -50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="no-print">
            <h1 className="text-6xl md:text-8xl font-black italic uppercase leading-[0.8] tracking-tighter mb-4">Elite <br /><span className="text-amber-500">Dubai</span> <br />Transport</h1>
            <div className="h-1.5 w-24 bg-amber-500 rounded-full mb-6"></div>

            {/* Find My Booking Recovery UI */}
            <div className="max-w-xs mt-10 p-6 bg-slate-900/50 rounded-3xl border border-white/5">
              <p className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] mb-4">Manage Existing Booking</p>
              <form onSubmit={handleFindBooking} className="relative">
                <input
                  type="email"
                  required
                  value={searchEmail}
                  onChange={(e) => setSearchEmail(e.target.value)}
                  placeholder="Booking Email Address"
                  className="w-full bg-[#0f172a] border border-slate-800 rounded-2xl py-3 px-4 text-xs outline-none focus:border-amber-500 pr-10"
                />
                <button type="submit" disabled={isSearching} className="absolute right-2 top-1/2 -translate-y-1/2 text-amber-500 hover:scale-110 transition-transform">
                  {isSearching ? <Clock className="animate-spin" size={16} /> : <Search size={16} />}
                </button>
              </form>
            </div>
          </motion.div>

          <div className="relative">
            <AnimatePresence mode="wait">
              {step === 'booking' ? (
                <motion.div key="form" exit={{ opacity: 0, y: -20 }} className="no-print">
                  <BookingForm onBookingSuccess={handleBookingSuccess} selectedVehicle={selectedVehicle} />
                </motion.div>
              ) : (
                <BookingWaitingScreen data={guestData} />
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

      <div className="no-print">
        <VehicleCategories onSelect={(carId) => {
          const formCategory = CAR_CATEGORY_MAP[carId] || 'Business';
          setSelectedVehicle(formCategory);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }} />
        <div id="how-it-works"><HowItWorks /></div>
        <div id="services"><OurServices /></div>

        {/* --- 📜 PROFESSIONAL TERMS & CANCELLATION POLICY SECTION --- */}
        <section id="policy" className="py-24 px-6 bg-slate-900/50 border-t border-slate-800">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-4 mb-12">
              <div className="p-3 bg-amber-500 rounded-2xl text-slate-900">
                <FileText size={32} />
              </div>
              <div>
                <h2 className="text-4xl font-black italic uppercase text-white">Terms & <span className="text-amber-500">Conditions</span></h2>
                <p className="text-slate-500 text-xs uppercase font-bold tracking-[0.2em]">Comprehensive Cancellation & Refund Policy</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
              <div className="bg-slate-800/40 p-8 rounded-[2.5rem] border border-slate-700/50 hover:border-emerald-500/30 transition-all group">
                <div className="w-12 h-12 bg-emerald-500/10 text-emerald-500 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <RotateCcw size={24} />
                </div>
                <h3 className="text-xl font-bold uppercase mb-4 tracking-tight text-white">Free Cancellation</h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-4">Notice given <strong>more than 6 hours</strong> before scheduled pickup time.</p>
                <div className="text-emerald-500 font-black text-2xl uppercase italic">100% Refund</div>
              </div>

              <div className="bg-slate-800/40 p-8 rounded-[2.5rem] border border-slate-700/50 hover:border-amber-500/30 transition-all group">
                <div className="w-12 h-12 bg-amber-500/10 text-amber-500 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Clock size={24} />
                </div>
                <h3 className="text-xl font-bold uppercase mb-4 tracking-tight text-white">Partial Refund</h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-4">Notice given <strong>between 3 to 6 hours</strong> before scheduled pickup time.</p>
                <div className="text-amber-500 font-black text-2xl uppercase italic">50% Charge</div>
              </div>

              <div className="bg-slate-800/40 p-8 rounded-[2.5rem] border border-slate-700/50 hover:border-rose-500/30 transition-all group">
                <div className="w-12 h-12 bg-rose-500/10 text-rose-500 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <AlertTriangle size={24} />
                </div>
                <h3 className="text-xl font-bold uppercase mb-4 tracking-tight text-white">Late Cancellation</h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-4">Notice given <strong>less than 3 hours</strong> before pickup or No-Show.</p>
                <div className="text-rose-500 font-black text-2xl uppercase italic">No Refund</div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 bg-slate-800/20 p-10 rounded-[3rem] border border-slate-700/30">
              <div className="space-y-6">
                <h4 className="text-amber-500 font-black uppercase tracking-widest text-sm flex items-center gap-2">
                  <ShieldCheck size={18} /> Arrival & Waiting Policy
                </h4>
                <div className="space-y-4 text-sm text-slate-300">
                  <p>• <strong>Airport Pickups:</strong> 60 minutes complimentary waiting time after flight landing. After complimentary the exta time is chargeable per hour 60 AED. Customer is marked No-Show if not reached within this period.</p>
                  <p>• <strong>City/Hotel Pickups:</strong> 15 minutes complimentary waiting time. Standard hourly waiting charges apply thereafter.</p>
                  <p>• <strong>No-Show:</strong> Charged at 100% fare. Occurs when a guest does not arrive, respond, or exceeds waiting limits.</p>
                </div>
              </div>
              <div className="space-y-6">
                <h4 className="text-amber-500 font-black uppercase tracking-widest text-sm flex items-center gap-2">
                  <Clock size={18} /> Refund Details
                </h4>
                <ul className="space-y-3 text-slate-400 text-xs leading-relaxed italic">
                  <li>• Waiting charges and extra stop fees are strictly non-refundable once utilized.</li>
                  <li>• Approved refunds are credited to the original card within 5–10 business days.</li>
                  <li>• Booking and payment gateway processing fees are non-refundable.</li>
                  <li>• Manual review applies for Force Majeure (extreme weather/flight cancellations).</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <footer id="contact" className="py-16 bg-slate-900 border-t border-slate-800">
          <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between gap-8 md:gap-12 w-full">
            <div className="md:max-w-sm">
              <h3 className="text-2xl font-black italic uppercase text-white mb-4">Elite <span className="text-amber-500">Dubai</span></h3>
              <p className="text-slate-400 text-sm leading-relaxed">Premium chauffeur services providing luxury, comfort, and reliability across the UAE.</p>
            </div>
            <div className="text-slate-400 text-sm flex flex-col gap-2 leading-relaxed md:text-right">
              <div><span className="text-amber-500 font-bold mr-1">Email:</span>elitetransport.dubai@gmial.com</div>
              <div><span className="text-amber-500 font-bold mr-1">Phone:</span>+972 56 632 6983</div>
              <div><span className="text-amber-500 font-bold mr-1">Alternative Phone:</span>+971 56 964 7438</div>
              <div><span className="text-amber-500 font-bold mr-1">Address:</span>Dubai, UAE</div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

function BookingWaitingScreen({ data }) {
  const [confirmedData, setConfirmedData] = useState(null);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        // ✅ SECURITY FIX: Fetch via Proxy
        const res = await fetch(`${BACKEND_URL}/sync-google`);
        const allRows = await res.json();
        const match = allRows.find(row => {
          const rowID = getVal(row, ['Source', 'source', 'ID'], "");
          const myID = String(getVal(data, ['Source', 'source', 'ID'], "")).trim();
          const status = getVal(row, ['Status', 'status', 'STATUS'], "").toLowerCase();
          return rowID === myID && status === "host confirmed";
        });
        if (match) {
          setConfirmedData(match);
          clearInterval(interval);
        }
      } catch (e) { console.error("Syncing..."); }
    }, 4000);
    return () => clearInterval(interval);
  }, [data]);

  if (confirmedData) {
    const rx = confirmedData;
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
    const waitTime = Number(getVal(rx, ['Wait_Time', 'Wait Time', 'wait_time'], 0));
    const waitFee = Number(getVal(rx, ['Wait_Fee', 'Wait Fee', 'wait_fee'], 0));
    const capacity = FLEET_CAPACITY[carType] || { pax: 4, luggage: 2 };

    return (
      <>
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
                  <div><span className="block text-[10px] font-bold uppercase text-slate-400">Lead Passenger</span><span className="font-bold text-sm text-slate-900">{guestName}</span></div>
                  <div><span className="block text-[10px] font-bold uppercase text-slate-400">Pax & Luggage</span><span className="font-bold text-sm text-slate-900 flex items-center gap-2 mt-0.5">{capacity.pax} <Users size={14} className="text-amber-500" /> | {capacity.luggage} <Briefcase size={14} className="text-amber-500" /></span></div>
                  <div><span className="block text-[10px] font-bold uppercase text-slate-400">Booking Class</span><span className="font-bold text-sm capitalize text-slate-900">{carType}</span></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div><span className="block text-[10px] font-bold uppercase text-slate-400">Flight Number</span><span className="font-bold text-sm text-slate-900">{flightNum}</span></div>
                  <div><span className="block text-[10px] font-bold uppercase text-slate-400">Phone Number</span><span className="font-bold text-sm text-slate-900">{guestPhone}</span></div>
                  <div><span className="block text-[10px] font-bold uppercase text-slate-400">Email Address</span><span className="font-bold text-sm text-slate-900 truncate block">{guestEmail}</span></div>
                </div>
              </div>
            </section>

            <section>
              <h4 className="text-xs font-black uppercase text-slate-400 mb-2 tracking-[0.2em]">Trip Details</h4>
              <div className="bg-white border border-slate-100 p-4 rounded-2xl space-y-4 relative overflow-hidden">
                <div className="absolute left-[27px] top-[60px] bottom-[30px] w-0.5 bg-slate-200/80 z-0"></div>
                <div className="grid grid-cols-2 gap-4 relative z-10"><div><span className="block text-[10px] font-bold uppercase text-slate-400">Trip Date & Time</span><span className="font-bold text-sm">{tripDate} <span className="text-amber-600">@</span> {tripTime}</span></div></div>
                <div className="space-y-4 relative z-10 mt-2">
                  <div className="flex items-start gap-3"><div className="mt-1 w-3 h-3 rounded-full bg-amber-500 border-2 border-white shadow-sm shrink-0"></div><div><span className="block text-[10px] font-bold uppercase text-slate-400 leading-none mb-1">Pickup Location</span><span className="font-bold text-sm leading-tight block">{pickup}</span></div></div>
                  <div className="flex items-start gap-3"><div className="mt-1 w-3 h-3 rounded-full bg-slate-900 border-2 border-white shadow-sm shrink-0"></div><div><span className="block text-[10px] font-bold uppercase text-slate-400 leading-none mb-1">Dropoff Location</span><span className="font-bold text-sm leading-tight block">{dropoff}</span></div></div>
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
                  <span className="text-xs font-bold uppercase text-slate-500 tracking-wider">{payment.includes('100%') ? "Amount Due to Driver" : "Cash Due to Driver"}</span>
                  <span className={`text-3xl font-black ${payment.includes('100%') ? 'text-emerald-600' : 'text-slate-900'}`}>AED {payment.includes('100%') ? '0' : (payment.includes('25%') ? (Number(price) - Math.round(Number(price) * 0.25)) : price)}</span>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-xs font-bold uppercase text-slate-500 tracking-wider flex items-center gap-2">Status</span>
                  <span className={`font-black text-[9px] uppercase px-3 py-1 rounded-full text-right max-w-[200px] leading-tight ${payment.includes('100%') ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                    {payment.split(' (Ref')[0]}
                  </span>
                </div>
              </div>
            </section>

            {/* WhatsApp Cancellation Button */}
            <div className="no-print space-y-3 mt-6">
              <a
                href={`https://wa.me/971505555555?text=I%20wish%20to%20cancel%20my%20booking%20Ref:%20${sourceRef}`}
                target="_blank"
                rel="noreferrer"
                className="w-full bg-rose-500/10 text-rose-600 py-4 rounded-xl font-bold uppercase flex items-center justify-center gap-2 hover:bg-rose-600 hover:text-white transition-all border border-rose-200"
              >
                <X size={18} /> Cancel Booking via WhatsApp
              </a>
              <p className="text-[9px] text-slate-400 text-center italic uppercase font-black">
                * Cancellations are subject to the 6-hour refund policy.
              </p>
            </div>
          </div>
          <button onClick={() => window.print()} className="no-print-btn w-full mt-6 bg-slate-900 text-white py-4 rounded-xl font-bold uppercase flex items-center justify-center gap-2 hover:bg-slate-800 mb-3 transition-colors shadow-lg"><Printer size={18} /> Print Record</button>
        </div>
      </>
    );
  }

  return (
    <div className="text-center p-16 bg-slate-800/10 rounded-[4rem] border-2 border-dashed border-slate-700/50 backdrop-blur-md">
      <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full mx-auto mb-8 animate-spin" />
      <h2 className="text-3xl font-black uppercase italic text-white">Awaiting Host</h2>
      <p className="text-slate-400 text-xs mt-6 uppercase font-bold tracking-widest">Receipt will appear automatically when driver is assigned.</p>
    </div>
  );
}