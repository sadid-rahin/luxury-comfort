import React from 'react';
import { motion } from 'framer-motion';
import { Users, Briefcase, ShieldCheck, Zap, Shield, Crown } from 'lucide-react';

export default function VehicleCategories({ onSelect }) {
  // Updated data with fixed Luxury image
  const vehicles = [
    { 
      id: 'Budget', 
      name: 'Budget / Standard', 
      models: 'Toyota Camry, Lexus ES300h', 
      specialty: 'Best for City Transfers',
      passengers: 3, 
      luggage: 2,
      hook: 'Smart choice for solo travelers.',
      icon: <Zap className="text-amber-500" />,
      img: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?auto=format&fit=crop&w=800'
    },
    { 
      id: 'Comfort', 
      name: 'Comfort / SUV', 
      models: 'Toyota Previa, Honda Odyssey', 
      specialty: 'Ideal for Families',
      passengers: 5, 
      luggage: 5,
      hook: 'Extra space for group journeys.',
      icon: <Shield className="text-amber-500" />,
      img: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800'
    },
    { 
      id: 'Luxury', 
      name: 'Luxury / Executive', 
      models: 'Mercedes S-Class, BMW 7 Series', 
      specialty: 'Premium Chauffeur Experience',
      passengers: 3, 
      luggage: 2,
      hook: 'Arrive in style with VIP service.',
      icon: <Crown className="text-amber-500" />,
      // FIXED LUXURY IMAGE URL BELOW
      img: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800'
    }
  ];

  return (
    <section className="py-20 bg-[#0f172a]">
      <div className="flex flex-col items-center mb-16 text-center">
        <h2 className="text-3xl md:text-5xl font-black italic uppercase tracking-tighter text-white">
          Choose Your <span className="text-amber-500">Elite Fleet</span>
        </h2>
        <div className="w-24 h-1 bg-amber-500 mt-4 rounded-full"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        {vehicles.map((car) => (
          <motion.div 
            key={car.id}
            whileHover={{ y: -15 }}
            onClick={() => onSelect(car.id)}
            className="group relative bg-slate-800/50 rounded-[2.5rem] border border-slate-700 overflow-hidden cursor-pointer shadow-2xl transition-all hover:border-amber-500/50"
          >
            <div className="h-56 overflow-hidden bg-slate-700">
              <img 
                src={car.img} 
                alt={car.name} 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=800'; }} // Fallback image if link breaks
              />
              <div className="absolute top-4 right-4 bg-slate-900/80 backdrop-blur-md px-4 py-2 rounded-full border border-slate-700">
                <p className="text-[10px] font-black uppercase text-amber-500 tracking-widest italic">
                  Premium {car.id}
                </p>
              </div>
            </div>

            <div className="p-8">
              <div className="flex justify-between items-start mb-4 text-white">
                <div>
                  <h3 className="text-2xl font-black uppercase italic leading-none">{car.name}</h3>
                  <p className="text-amber-500 text-[10px] font-bold uppercase mt-1">{car.models}</p>
                </div>
                {car.icon}
              </div>

              <p className="text-slate-300 text-xs italic mb-6 leading-relaxed text-white">"{car.hook}"</p>

              <div className="flex gap-4 mb-8 text-white">
                <div className="flex items-center gap-2">
                  <Users size={14} className="text-amber-500" />
                  <span className="text-xs font-bold">{car.passengers} Seats</span>
                </div>
                <div className="flex items-center gap-2">
                  <Briefcase size={14} className="text-amber-500" />
                  <span className="text-xs font-bold">{car.luggage} Bags</span>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-slate-900/50 p-3 rounded-2xl border border-slate-700/50">
                <ShieldCheck size={18} className="text-emerald-500" />
                <span className="text-[10px] font-bold text-slate-400 uppercase">{car.specialty}</span>
              </div>

              <div className="mt-8">
                <button className="w-full bg-white text-slate-900 py-3 rounded-xl font-black uppercase text-xs hover:bg-amber-500 transition-all">
                  Select {car.id} Fleet
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}