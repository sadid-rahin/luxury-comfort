import React from 'react';
import { motion } from 'framer-motion';
import * as Icons from 'lucide-react';

export default function CategoryCard({ item, index, onSelect }) {
  const IconComponent = Icons[item.icon];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.15, type: 'spring', stiffness: 100 }}
      whileHover={{ y: -20 }}
      onClick={() => onSelect(item.name)}
      className="group relative h-[500px] w-full rounded-[3rem] overflow-hidden cursor-pointer shadow-2xl border border-white/10"
    >
      {/* Dynamic Background Image */}
      <img 
        src={item.image} 
        alt={item.name} 
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-125"
      />

      {/* Dark Overlay that lightens on hover */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent group-hover:from-amber-900/80 transition-colors duration-500" />

      {/* Floating UI Elements */}
      <div className="absolute inset-0 p-10 flex flex-col justify-end items-center text-center">
        <motion.div 
          animate={{ y: [0, -10, 0] }}
          transition={{ repeat: Infinity, duration: 3 }}
          className="mb-6 p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20"
        >
          <IconComponent className="text-amber-500" size={32} />
        </motion.div>
        
        <h3 className="text-4xl font-black uppercase italic tracking-tighter text-white mb-3">
          {item.name}
        </h3>
        
        <p className="text-slate-200 text-sm leading-relaxed max-w-[200px] opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-4 group-hover:translate-y-0">
          {item.desc}
        </p>

        {/* Animated Action Bar */}
        <div className="mt-6 w-0 group-hover:w-full h-1.5 bg-amber-500 rounded-full transition-all duration-700" />
      </div>
    </motion.div>
  );
}