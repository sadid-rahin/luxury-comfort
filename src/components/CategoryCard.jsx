import React from 'react';
import { motion } from 'framer-motion';
import { Users, Briefcase, CheckCircle } from 'lucide-react'; // Import specific icons instead of "All"

export default function CategoryCard({ item, index, onSelect }) {
  // We removed the "const IconComponent = Icons[item.icon]" line because it was causing the crash.

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -10 }}
      onClick={() => onSelect(item.id)}
      className="group bg-slate-900 rounded-[2.5rem] overflow-hidden border border-slate-800 hover:border-amber-500/50 transition-all duration-300 cursor-pointer shadow-xl hover:shadow-amber-500/10"
    >
      {/* 1. CAR PICTURE SECTION */}
      <div className="h-56 overflow-hidden relative">
        <img 
          src={item.img || item.image} // Handles both naming conventions safely
          alt={item.name} 
          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent opacity-80" />
        
        {/* Category Badge */}
        <div className="absolute top-4 left-4 bg-amber-500 text-slate-900 text-[10px] font-black uppercase px-3 py-1 rounded-full">
          {item.id} Class
        </div>
      </div>

      {/* 2. CONTENT SECTION */}
      <div className="p-8 -mt-6 relative">
        
        {/* CAR DEFINITION (Name & Model) */}
        <div className="mb-6">
          <h3 className="text-2xl font-black italic uppercase text-white mb-1">
            {item.name}
          </h3>
          <p className="text-amber-500 text-xs font-bold uppercase tracking-widest">
            {item.models}
          </p>
        </div>

        {/* SEATS & LUGGAGE CAPACITY */}
        <div className="flex gap-4 mb-6 border-y border-slate-800 py-4">
          <div className="flex items-center gap-2 text-slate-300">
            <div className="bg-slate-800 p-2 rounded-lg text-amber-500">
              <Users size={16} />
            </div>
            <div>
              <span className="block text-white font-bold text-sm">{item.passengers}</span>
              <span className="text-[10px] uppercase text-slate-500 font-bold">Seats</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-slate-300">
            <div className="bg-slate-800 p-2 rounded-lg text-amber-500">
              <Briefcase size={16} />
            </div>
            <div>
              <span className="block text-white font-bold text-sm">{item.luggage}</span>
              <span className="text-[10px] uppercase text-slate-500 font-bold">Bags</span>
            </div>
          </div>
        </div>

        {/* COMFORTABILITY & FEATURES */}
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <CheckCircle className="text-emerald-500 shrink-0 mt-0.5" size={16} />
            <div>
              <p className="text-white text-xs font-bold uppercase">{item.specialty}</p>
              <p className="text-slate-400 text-[10px] leading-relaxed mt-1">
                {item.hook}
              </p>
            </div>
          </div>
        </div>

        {/* SELECT BUTTON */}
        <div className="mt-8 w-full bg-slate-800 group-hover:bg-amber-500 text-white group-hover:text-slate-900 py-4 rounded-xl font-black uppercase text-xs tracking-widest text-center transition-colors">
          Select Vehicle
        </div>
      </div>
    </motion.div>
  );
}