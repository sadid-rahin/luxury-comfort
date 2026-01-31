// ============================================
// OUR SERVICES COMPONENT
// ============================================
// Displays available service offerings
// TO MODIFY: Add/remove services, change icons, update descriptions

import React from 'react';
import { Plane, Building, UserCheck } from 'lucide-react';

export default function OurServices() {
  // ============================================
  // SERVICES DATA
  // ============================================
  // Array of services with icon, name, and description
  // TO MODIFY: Add new services, change icons, update text
  const services = [
    { icon: <Plane />, name: "Airport Transfer", desc: "Professional pickup from DXB, AUH, or Sharjah terminals." },
    { icon: <Building />, name: "Business Travel", desc: "Luxury transport for corporate events and executive meetings." },
    { icon: <UserCheck />, name: "Private Chauffeur", desc: "Full-day or half-day dedicated drivers for your convenience." }
  ];

  return (
    // ============================================
    // SECTION CONTAINER
    // ============================================
    <section className="py-12 sm:py-16 md:py-20 lg:py-24 px-4 sm:px-6 bg-slate-900/30">
      <div className="max-w-7xl mx-auto">
        {/* ============================================
            SECTION HEADER
            ============================================
            Title, subtitle, and description
            TO MODIFY: Change heading text, tagline, description
        */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 sm:mb-12 md:mb-16 gap-4 sm:gap-6">
           {/* Title Section - TO MODIFY: Change "Our Services" and tagline */}
           <div>
             <h2 className="text-3xl sm:text-4xl md:text-5xl font-black italic uppercase text-white tracking-tighter">Our <span className="text-amber-500">Services</span></h2>
             <p className="text-slate-500 font-bold uppercase text-[9px] sm:text-[10px] tracking-widest mt-2">Premium Dubai Solutions</p>
           </div>
           {/* Description Text - TO MODIFY: Change description */}
           <div className="text-slate-400 max-w-md text-xs sm:text-sm italic">Tailored transportation solutions for businesses and individuals across the UAE.</div>
        </div>

        {/* ============================================
            SERVICES GRID
            ============================================
            Responsive grid: 1 col (mobile) → 2 cols (tablet) → 3 cols (desktop)
            TO MODIFY: Change grid layout, card styling
        */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7 md:gap-8">
          {services.map((s, i) => (
            // Individual Service Card - TO MODIFY: Change border color, styling
            <div key={i} className="bg-slate-900 p-6 sm:p-7 md:p-8 rounded-2xl sm:rounded-[2rem] md:rounded-[2.5rem] border-l-4 border-amber-500 shadow-xl">
               {/* Service Icon - Rendered from services array */}
               <div className="text-amber-500 mb-4 sm:mb-5 md:mb-6 text-2xl sm:text-3xl md:text-4xl">{s.icon}</div>
               {/* Service Name - Rendered from services array */}
               <h4 className="text-lg sm:text-xl font-black uppercase italic text-white mb-2">{s.name}</h4>
               {/* Service Description - Rendered from services array */}
               <p className="text-slate-500 text-xs sm:text-sm leading-relaxed uppercase font-bold">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}