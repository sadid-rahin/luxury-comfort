import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Phone, Mail, MapPin } from 'lucide-react'; // Added icons for menu/contact
import BookingForm from './BookingForm'; 
import HowItWorks from './HowItWorks'; 
import OurServices from './OurServices'; 
import VehicleCategories from './VehicleCategories'; 

// YOUR CORRECT SCRIPT URL
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwHgxuyiNIQ0u5_G5FbZU9c9l0lX9klj31ECzPCHoM7L83yQhl5uxfvju8H4UmRibyB/exec";

export default function Home() {
  const [step, setStep] = useState('booking'); 
  const [guestData, setGuestData] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false); // State for Mobile Menu

  const handleBookingSuccess = (data) => {
    setGuestData(data);
    setStep('waiting');
  };

  // Scroll Function
  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsMenuOpen(false); // Close mobile menu after clicking
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-white font-sans selection:bg-amber-500 selection:text-slate-900">
      
      {/* --- NAVIGATION BAR --- */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 md:h-16 flex items-center justify-between gap-4">
          {/* Left: Logo + Brand */}
          <a
            href="#"
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

      {/* HERO SECTION (Added padding-top to account for fixed navbar) */}
      <section className="pt-32 pb-20 px-6 md:px-12 border-b border-slate-800">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div initial={{ x: -50, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
            <h1 className="text-6xl md:text-8xl font-black italic uppercase leading-[0.8] tracking-tighter mb-4">
              Elite <br /><span className="text-amber-500">Dubai</span> <br />Transport
            </h1>
            <div className="h-1.5 w-24 bg-amber-500 rounded-full mb-6"></div>
          </motion.div>
          <div className="relative">
            <AnimatePresence mode="wait">
              {step === 'booking' ? (
                <motion.div key="form" exit={{ opacity: 0, y: -20 }}>
                  <BookingForm onBookingSuccess={handleBookingSuccess} />
                </motion.div>
              ) : (
                <BookingWaitingScreen data={guestData} />
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

      <VehicleCategories onSelect={() => window.scrollTo({ top: 0, behavior: 'smooth' })} />

      {/* ADDED ID FOR LINKING */}
      <div id="how-it-works">
        <HowItWorks />
      </div>

      {/* ADDED ID FOR LINKING */}
      <div id="services">
        <OurServices />
      </div>
      
      {/* UPDATED FOOTER WITH CONTACT INFO */}
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
    return (
      <div className="bg-white p-10 rounded-[3rem] text-slate-900 shadow-2xl border-t-[15px] border-emerald-500">
        <h2 className="text-4xl font-black uppercase italic mb-8 border-b-4 border-slate-100 pb-4">Receipt</h2>
        <div className="space-y-4 mb-8">
          <div className="flex justify-between border-b pb-2"><span className="text-xs font-bold uppercase">Driver</span><span className="font-black text-emerald-600 uppercase">{confirmedData.Driver || confirmedData.driver}</span></div>
          <div className="flex justify-between border-b pb-2"><span className="text-xs font-bold uppercase">Phone</span><span className="font-black">{confirmedData.Driver_number || confirmedData.driver_number}</span></div>
          <div className="flex justify-between border-b pb-2"><span className="text-xs font-bold uppercase">Agency</span><span className="font-black uppercase">{confirmedData.Agency || confirmedData.agency}</span></div>
          <div className="flex justify-between pt-4 font-black text-amber-600"><span>Total</span><span className="text-3xl">AED {confirmedData.Price || confirmedData.price}</span></div>
        </div>
        <button onClick={() => window.print()} className="w-full bg-slate-900 text-white py-6 rounded-3xl font-black uppercase text-xs">Print Receipt</button>
      </div>
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