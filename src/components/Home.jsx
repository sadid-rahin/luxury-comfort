import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Phone, Mail, MapPin, Printer } from 'lucide-react'; 
import BookingForm from './BookingForm'; 
import HowItWorks from './HowItWorks'; 
import OurServices from './OurServices'; 
import VehicleCategories from './VehicleCategories'; 

// YOUR CORRECT SCRIPT URL
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwHgxuyiNIQ0u5_G5FbZU9c9l0lX9klj31ECzPCHoM7L83yQhl5uxfvju8H4UmRibyB/exec";

export default function Home() {
  const [step, setStep] = useState('booking'); 
  const [guestData, setGuestData] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleBookingSuccess = (data) => {
    setGuestData(data);
    setStep('waiting');
  };

  // Scroll Function
  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsMenuOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-white font-sans selection:bg-amber-500 selection:text-slate-900">
      
      {/* --- NAVIGATION BAR --- */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-white/10 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 md:h-16 flex items-center justify-between gap-4">
          {/* Left: Logo + Brand */}
          <a
            href="#!"
            onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            className="flex items-center gap-2.5 min-w-0 flex-shrink-0"
          >
            <img src="/Logo.png" alt="Elite Ride logo" className="h-11 w-11 md:h-12 md:w-12 object-contain flex-shrink-0" />
            <span className="text-lg md:text-xl font-black italic uppercase whitespace-nowrap tracking-tight">
              Elite <span className="text-amber-500">Ride</span>
            </span>
          </a>

          {/* Right: Desktop Menu */}
          <div className="hidden md:flex items-center gap-6 lg:gap-8 flex-shrink-0">
            <button onClick={() => scrollToSection('how-it-works')} className="text-xs font-bold uppercase tracking-widest hover:text-amber-500 transition-colors whitespace-nowrap">How to Process</button>
            <button onClick={() => scrollToSection('services')} className="text-xs font-bold uppercase tracking-widest hover:text-amber-500 transition-colors whitespace-nowrap">Services</button>
            <button onClick={() => scrollToSection('contact')} className="text-xs font-bold uppercase tracking-widest hover:text-amber-500 transition-colors whitespace-nowrap">Contact Us</button>
          </div>

          {/* Right: Mobile Menu Toggle */}
          <button
            type="button"
            className="md:hidden flex-shrink-0 p-2 -mr-1 text-white hover:text-amber-500 transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
          >
            {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile Dropdown */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-slate-900 border-b border-white/10 p-6 flex flex-col gap-6 shadow-2xl">
            <button onClick={() => scrollToSection('how-it-works')} className="text-left font-bold uppercase text-sm">How to Process</button>
            <button onClick={() => scrollToSection('services')} className="text-left font-bold uppercase text-sm">Services</button>
            <button onClick={() => scrollToSection('contact')} className="text-left font-bold uppercase text-sm text-amber-500">Contact Us</button>
          </div>
        )}
      </nav>

      {/* HERO SECTION */}
      <section className="pt-32 pb-20 px-6 md:px-12 border-b border-slate-800">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          <motion.div initial={{ x: -50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="no-print">
            <h1 className="text-6xl md:text-8xl font-black italic uppercase leading-[0.8] tracking-tighter mb-4">
              Elite <br /><span className="text-amber-500">Dubai</span> <br />Transport
            </h1>
            <div className="h-1.5 w-24 bg-amber-500 rounded-full mb-6"></div>
          </motion.div>

          <div className="relative">
            <AnimatePresence mode="wait">
              {step === 'booking' ? (
                <motion.div key="form" exit={{ opacity: 0, y: -20 }} className="no-print">
                  <BookingForm onBookingSuccess={handleBookingSuccess} />
                </motion.div>
              ) : (
                <BookingWaitingScreen data={guestData} />
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* WRAPPER TO HIDE ALL BOTTOM CONTENT WHEN PRINTING */}
      <div className="no-print">
        <VehicleCategories onSelect={() => window.scrollTo({ top: 0, behavior: 'smooth' })} />

        <div id="how-it-works">
          <HowItWorks />
        </div>

        <div id="services">
          <OurServices />
        </div>
        
        <footer id="contact" className="py-16 bg-slate-900 border-t border-slate-800">
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
            
            {/* Brand */}
            <div>
              <h3 className="text-2xl font-black italic uppercase text-white mb-4">Elite <span className="text-amber-500">Dubai</span></h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Premium chauffeur services providing luxury, comfort, and reliability across the UAE.
              </p>
            </div>

            {/* Contact Details */}
            <div>
              <h4 className="text-sm font-bold uppercase tracking-widest text-white mb-6">Contact Us</h4>
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-slate-400 text-sm">
                  <Phone size={16} className="text-amber-500" />
                  <span>+971 50 000 0000</span>
                </div>
                <div className="flex items-center gap-3 text-slate-400 text-sm">
                  <Mail size={16} className="text-amber-500" />
                  <span>bookings@elitedubaitransport.com</span>
                </div>
                <div className="flex items-center gap-3 text-slate-400 text-sm">
                  <MapPin size={16} className="text-amber-500" />
                  <span>Downtown Dubai, UAE</span>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-sm font-bold uppercase tracking-widest text-white mb-6">Legal</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li className="hover:text-amber-500 cursor-pointer">Privacy Policy</li>
                <li className="hover:text-amber-500 cursor-pointer">Terms of Service</li>
                <li className="hover:text-amber-500 cursor-pointer">Driver Partners</li>
              </ul>
            </div>
          </div>

          <div className="text-center pt-8 border-t border-slate-800">
            <p className="text-slate-600 text-[10px] uppercase font-black tracking-[0.4em]">© 2026 Elite Dubai Transport</p>
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
        const res = await fetch(SCRIPT_URL, { cache: 'no-cache' });
        const allRows = await res.json();
        
        const match = allRows.find(row => {
          const rowID = String(row.Source || row.source || "").trim();
          const myID = String(data.Source).trim();
          const status = String(row.Status || row.status || "").trim().toLowerCase();
          
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
    // Helper to determine if payment was card (green theme) or cash (standard theme)
    const isPaidByCard = String(confirmedData.Payment || confirmedData.payment || "").toLowerCase().includes('card');

    return (
      <>
        {/* --- PRINT STYLES --- */}
        <style>
          {`
            @media print {
              body * { visibility: hidden; }
              #printable-receipt, #printable-receipt * { visibility: visible; }
              #printable-receipt { 
                position: absolute; 
                left: 0; 
                top: 0; 
                width: 100%; 
                margin: 0 !important; 
                padding: 20px !important; 
                background: white !important; 
                color: black !important;
                box-shadow: none !important;
                border: none !important;
                border-radius: 0 !important;
              }
              .no-print-btn, .no-print { display: none !important; }
            }
          `}
        </style>

        {/* --- CUSTOMIZED RECEIPT DESIGN --- */}
        <div id="printable-receipt" className="bg-white p-6 md:p-8 rounded-[2.5rem] text-slate-900 shadow-2xl border border-slate-200/50 font-sans relative overflow-hidden text-left">
          
          {/* Top Gold Accent Bar */}
          <div className="absolute top-0 left-0 right-0 h-3 bg-amber-500"></div>
          
          {/* Header */}
          <div className="flex justify-between items-center mb-6 mt-4 pb-4 border-b border-slate-100">
            <div>
               {/* Uses Logo logic from your Navbar */}
               <img src="/Logo.png" alt="Elite Ride logo" className="h-10 w-auto object-contain mb-1" />
               <div className="text-xl font-black italic uppercase tracking-tighter leading-none">
                  Elite <span className="text-amber-600">Ride</span>
               </div>
            </div>
            <div className="text-right">
               <h2 className="text-2xl font-black uppercase text-slate-800 leading-none">Receipt</h2>
            </div>
          </div>
          
          {/* Meta Info: Date & ID */}
          <div className="flex flex-col md:flex-row justify-between text-xs mb-6 text-slate-500 bg-slate-50 p-3 rounded-xl">
            <div>
              <span className="block uppercase tracking-wider font-bold text-[10px]">Date Issued</span>
              <span className="font-bold text-slate-900 text-sm">{new Date().toLocaleDateString()}</span>
            </div>
            <div className="mt-2 md:mt-0 md:text-right">
               <span className="block uppercase tracking-wider font-bold text-[10px]">Booking Ref</span>
               <span className="font-black text-slate-900 text-sm font-mono">{confirmedData.Source || confirmedData.source}</span>
            </div>
          </div>
          
          {/* Details Grid */}
          <div className="space-y-6">
            {/* 1. Passenger */}
            <section>
               <h4 className="text-xs font-black uppercase text-slate-400 mb-2 tracking-[0.2em]">Passenger Details</h4>
               <div className="bg-white border border-slate-100 p-4 rounded-2xl">
                 <div className="grid grid-cols-1 gap-2">
                    <div>
                      <span className="block text-[10px] font-bold uppercase text-slate-400">Guest Name</span>
                      <span className="font-bold text-lg text-slate-900">{confirmedData.Guest_name || confirmedData.guest_name}</span>
                    </div>
                 </div>
               </div>
            </section>

            {/* 2. Trip (Visual Route) */}
            <section>
               <h4 className="text-xs font-black uppercase text-slate-400 mb-2 tracking-[0.2em]">Trip Details</h4>
               <div className="bg-white border border-slate-100 p-4 rounded-2xl space-y-4 relative overflow-hidden">
                  {/* Vertical Connecting Line */}
                  <div className="absolute left-[27px] top-[60px] bottom-[85px] w-0.5 bg-slate-200/80 z-0"></div>

                  <div className="grid grid-cols-2 gap-4 relative z-10">
                     <div>
                        <span className="block text-[10px] font-bold uppercase text-slate-400">Date & Time</span>
                        <span className="font-bold text-sm">{confirmedData.Date} <span className="text-amber-600">@</span> {confirmedData.Time}</span>
                     </div>
                     <div>
                        <span className="block text-[10px] font-bold uppercase text-slate-400">Car Type</span>
                        <span className="font-bold text-sm capitalize">{confirmedData.Car_type || confirmedData.car_type || "Standard"}</span>
                     </div>
                  </div>

                  <div className="space-y-3 relative z-10">
                     <div className="flex items-start gap-3">
                        <div className="mt-1 w-3 h-3 rounded-full bg-amber-500 border-2 border-white shadow-sm shrink-0"></div>
                        <div>
                           <span className="block text-[10px] font-bold uppercase text-slate-400 leading-none mb-1">Pickup Location</span>
                           <span className="font-bold text-sm leading-tight block">{confirmedData.Pickup || confirmedData.pickup}</span>
                        </div>
                     </div>
                     <div className="flex items-start gap-3">
                        <div className="mt-1 w-3 h-3 rounded-full bg-slate-900 border-2 border-white shadow-sm shrink-0"></div>
                        <div>
                           <span className="block text-[10px] font-bold uppercase text-slate-400 leading-none mb-1">Dropoff Location</span>
                           <span className="font-bold text-sm leading-tight block">{confirmedData.Drop_off || confirmedData.drop_off}</span>
                        </div>
                     </div>
                  </div>
               </div>
            </section>

            {/* 3. Driver */}
            <section>
               <h4 className="text-xs font-black uppercase text-slate-400 mb-2 tracking-[0.2em]">Driver Details</h4>
               <div className="bg-white border border-slate-100 p-4 rounded-2xl">
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="block text-[10px] font-bold uppercase text-slate-400">Chauffeur</span>
                      <span className="font-black text-sm uppercase text-amber-600">{confirmedData.Driver || confirmedData.driver}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] font-bold uppercase text-slate-400">Contact</span>
                      <span className="font-bold text-sm font-mono">{confirmedData.Driver_number || confirmedData.driver_number}</span>
                    </div>
                 </div>
               </div>
            </section>

            {/* 4. Payment */}
            <section>
               <div className={`p-5 rounded-2xl ${isPaidByCard ? 'bg-emerald-50 border border-emerald-100' : 'bg-slate-50 border border-slate-100'}`}>
                 <div className="flex justify-between items-center mb-3 pb-3 border-b border-slate-200/50">
                    <span className="text-xs font-bold uppercase text-slate-500 tracking-wider">Total Amount</span>
                    <span className={`text-3xl font-black ${isPaidByCard ? 'text-emerald-600' : 'text-slate-900'}`}>AED {confirmedData.Price || confirmedData.price}</span>
                 </div>
                 <div className="flex justify-between items-center">
                    <span className="text-xs font-bold uppercase text-slate-500 tracking-wider flex items-center gap-2">
                       Payment Status
                    </span>
                    <span className={`font-black text-sm uppercase px-3 py-1 rounded-full ${isPaidByCard ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-700'}`}>
                        {confirmedData.Payment || confirmedData.payment || "Pay to Driver"}
                    </span>
                 </div>
               </div>
            </section>
          </div>

          <div className="text-center pt-6 mt-6 border-t border-slate-100">
             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Thanks for choosing Elite Ride Transport</p>
          </div>

          <button onClick={() => window.print()} className="no-print-btn w-full mt-6 bg-slate-900 text-white py-4 rounded-2xl font-black uppercase text-sm hover:bg-amber-500 hover:text-slate-900 transition-all flex items-center justify-center gap-2 shadow-lg active:scale-95">
            <Printer size={18} /> Print Official Receipt
          </button>
        </div>
      </>
    );
  }

  return (
    <div className="text-center p-16 bg-slate-800/10 rounded-[4rem] border-2 border-dashed border-slate-700/50 backdrop-blur-md">
      <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full mx-auto mb-8 animate-spin" />
      <h2 className="text-3xl font-black uppercase italic text-white">Awaiting Host</h2>
      <p className="text-slate-400 text-xs mt-6 uppercase font-bold tracking-widest">Receipt will appear automatically.</p>
    </div>
  );
}