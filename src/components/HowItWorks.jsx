// ============================================
// HOW IT WORKS COMPONENT
// ============================================
// Displays a 3-step process explanation
// TO MODIFY: Change steps, icons, or descriptions

import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Calendar, CheckCircle } from 'lucide-react';

export default function HowItWorks() {
  // ============================================
  // STEPS DATA
  // ============================================
  // Array of process steps with icon, title, and description
  // TO MODIFY: Add/remove steps, change icons, update text
  const steps = [
    { icon: <MapPin />, title: "1. Choose Locations", desc: "Select your pickup and drop-off points in Dubai or Abu Dhabi." },
    { icon: <Calendar />, title: "2. Select Date & Time", desc: "Pick a moment that aligns with your schedule and flight details." },
    { icon: <CheckCircle />, title: "3. Book Your Car", desc: "Instantly reserve your premium vehicle and get a direct receipt." }
  ];

  return (
    // ============================================
    // SECTION CONTAINER
    // ============================================
    <section className="py-12 sm:py-16 md:py-20 lg:py-24 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto text-center">
        {/* Section Title - TO MODIFY: Change "How It Works" text */}
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black italic uppercase text-white mb-3 sm:mb-4 tracking-tighter">How It <span className="text-amber-500">Works</span></h2>
        
        {/* Decorative Underline - TO MODIFY: Change color, width, height */}
        <div className="w-16 sm:w-20 h-1 bg-amber-500 mx-auto mb-8 sm:mb-12 md:mb-16"></div>
        
        {/* ============================================
            STEPS GRID
            ============================================
            Responsive grid: 1 col (mobile) → 2 cols (tablet) → 3 cols (desktop)
            TO MODIFY: Change grid layout, card styling
        */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 md:gap-10">
          {steps.map((step, i) => (
            // Individual Step Card - TO MODIFY: Change hover effects, styling
            <motion.div 
              key={i} whileHover={{ y: -10 }}
              className="bg-slate-900/50 p-6 sm:p-8 md:p-10 rounded-2xl sm:rounded-[2.5rem] md:rounded-[3rem] border border-slate-800 hover:border-amber-500 transition-all group"
            >
              {/* Step Icon Container - TO MODIFY: Change icon size, colors */}
              <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-slate-800 rounded-xl sm:rounded-2xl flex items-center justify-center text-amber-500 mb-4 sm:mb-5 md:mb-6 mx-auto group-hover:bg-amber-500 group-hover:text-slate-900 transition-colors">
                {step.icon}
              </div>
              {/* Step Title - Rendered from steps array */}
              <h3 className="text-lg sm:text-xl font-black uppercase italic text-white mb-3 sm:mb-4">{step.title}</h3>
              {/* Step Description - Rendered from steps array */}
              <p className="text-slate-500 text-xs sm:text-sm leading-relaxed px-2 sm:px-0">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}