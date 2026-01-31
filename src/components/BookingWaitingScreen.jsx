import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Clock, MapPin, Calendar, CreditCard } from 'lucide-react';

export default function BookingWaitingScreen({ data }) {
  if (!data) return null;

  return (
    <motion.div 
      key="waiting" 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-900 p-8 rounded-[3rem] border-t-8 border-amber-500 shadow-2xl"
    >
      <div className="text-center mb-6">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
          className="inline-block mb-4"
        >
          <CheckCircle className="w-16 h-16 text-amber-500" />
        </motion.div>
        <h2 className="text-2xl font-black uppercase italic text-amber-500 mb-2">
          Booking Submitted!
        </h2>
        <p className="text-slate-400 text-xs">
          Your request is being processed. You'll receive confirmation shortly.
        </p>
      </div>

      <div className="space-y-4 bg-slate-800/50 p-6 rounded-2xl border border-slate-700">
        <div className="flex items-center gap-3">
          <Calendar className="w-5 h-5 text-amber-500" />
          <div>
            <p className="text-[10px] text-slate-500 uppercase font-black">Date & Time</p>
            <p className="text-sm font-bold text-white">{data.Date} at {data.Time}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <MapPin className="w-5 h-5 text-amber-500" />
          <div>
            <p className="text-[10px] text-slate-500 uppercase font-black">Route</p>
            <p className="text-sm font-bold text-white">{data.Pickup} → {data.Drop_off}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <CreditCard className="w-5 h-5 text-amber-500" />
          <div>
            <p className="text-[10px] text-slate-500 uppercase font-black">Payment</p>
            <p className="text-sm font-bold text-white">{data.Payment} - AED {data.Price}</p>
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-center gap-2 text-amber-500">
        <Clock className="w-4 h-4 animate-pulse" />
        <p className="text-xs font-black uppercase tracking-wider">Status: Pending Confirmation</p>
      </div>
    </motion.div>
  );
}
