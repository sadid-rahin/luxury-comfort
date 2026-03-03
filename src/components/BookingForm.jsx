import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Lock, Phone, Plus, PlaneLanding, PlaneTakeoff, MoveRight, Clock } from 'lucide-react';
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { motion, AnimatePresence } from 'framer-motion';

const BACKEND_URL = "https://elite-transport-backend.onrender.com";
const stripePromise = loadStripe("pk_test_51Sx57rFVFmdbJGhjAMobcQfMvc9Ur2fWde1AilhYul33gzBMeLpUSWGWKYKzWX7FkNjRetx7e0Rf0DdINpMUWQ6800szEvZVwl");

// ─────────────────────────────────────────────────────────────────────────────
// CONFIGURATION (MATCHED TO ROYAL FALCON PRICING)
// ─────────────────────────────────────────────────────────────────────────────
const FLEET_PRICING = {
  zones: {
    abu_dhabi: { arrival: { Sedan: 110, Business: 120, SUV: 120, MPV: 140, MiniBus: 180, Viano: 300 }, transfer: { Sedan: 110, Business: 120, SUV: 120, MPV: 140, MiniBus: 180, Viano: 300 } },
    dxb: { arrival: { Sedan: 300, Business: 350, SUV: 350, MPV: 400, MiniBus: 450, Viano: 650 }, transfer: { Sedan: 300, Business: 350, SUV: 350, MPV: 400, MiniBus: 450, Viano: 650 } },
    shj: { arrival: { Sedan: 400, Business: 450, SUV: 400, MPV: 450, MiniBus: 600, Viano: 750 }, transfer: { Sedan: 400, Business: 450, SUV: 450, MPV: 500, MiniBus: 600, Viano: 750 } },
    ajman: { transfer: { Sedan: 400, Business: 450, SUV: 450, MPV: 450, MiniBus: 600, Viano: 750 } },
    umm_al_quwain: { transfer: { Sedan: 450, Business: 500, SUV: 500, MPV: 550, MiniBus: 650, Viano: 800 } },
    ras_al_khaimah: { transfer: { Sedan: 550, Business: 600, SUV: 600, MPV: 650, MiniBus: 750, Viano: 950 } },
    fujeirah: { transfer: { Sedan: 600, Business: 700, SUV: 700, MPV: 750, MiniBus: 850, Viano: 1000 } },
    al_ain: { transfer: { Sedan: 400, Business: 450, SUV: 450, MPV: 500, MiniBus: 600, Viano: 700 } }
  },
  hourly: {
    half_day: { Sedan: 400, Business: 450, SUV: 400, MPV: 450, MiniBus: 550, Viano: 900 }, 
    full_day: { Sedan: 650, Business: 750, SUV: 700, MPV: 800, MiniBus: 900, Viano: 1500 }
  }
};

const FLEET_DATA = [
  { id: 'Sedan', name: 'Standard Sedan' },
  { id: 'Business', name: 'Business sedan' },
  { id: 'SUV', name: 'Premium SUV' },
  { id: 'MPV', name: 'Luxury MPV' },
  { id: 'MiniBus', name: 'Hiace / Mini Bus' },
  { id: 'Viano', name: 'Mercedes V-Class' }
];

function CheckoutForm({ onBookingSuccess, selectedVehicle }) {
  const stripe = useStripe();
  const elements = useElements();
  
  // 🔥 GOOGLE REFS
  const pickupInputRef = useRef(null);
  const destInputRef = useRef(null);
  const stopRefs = useRef([]);

  const EXTRA_STOP_FEE = 50;
  const [extraStops, setExtraStops] = useState(0);
  const [stopNames, setStopNames] = useState([]); 

  const [mode, setMode] = useState('arrival');
  const [hourlyType, setHourlyType] = useState('half_day'); 
  const [pax, setPax] = useState(1);
  const [luggage, setLuggage] = useState(0);
  const [pickup, setPickup] = useState('');
  const [destination, setDestination] = useState('');
  const [carType, setCarType] = useState('Business');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [price, setPrice] = useState(0);
  const [breakdown, setBreakdown] = useState(null);
  const [loading, setLoading] = useState(false);
  const [resolvedZone, setResolvedZone] = useState(null);

  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [flightNumber, setFlightNumber] = useState('');

  // 🔥 GOOGLE AUTOCOMPLETE LOGIC
  useEffect(() => {
    if (window.google && window.google.maps) {
      const options = { 
        componentRestrictions: { country: "ae" }, 
        fields: ["formatted_address", "address_components"] 
      };

      const pickupAuto = new window.google.maps.places.Autocomplete(pickupInputRef.current, options);
      pickupAuto.addListener("place_changed", () => {
        const place = pickupAuto.getPlace();
        if (place.formatted_address) {
          setPickup(place.formatted_address);
          if (mode !== 'arrival') setResolvedZone(resolveZoneFromGoogle(place.formatted_address));
        }
      });

      const destAuto = new window.google.maps.places.Autocomplete(destInputRef.current, options);
      destAuto.addListener("place_changed", () => {
        const place = destAuto.getPlace();
        if (place.formatted_address) {
          setDestination(place.formatted_address);
          if (mode === 'arrival') setResolvedZone(resolveZoneFromGoogle(place.formatted_address));
        }
      });
    }
  }, [mode]);

  // 🔥 FIX FOR EXTRA STOPS AUTOCOMPLETE
  useEffect(() => {
    if (window.google && window.google.maps && window.google.maps.places && extraStops > 0) {
      for (let i = 0; i < extraStops; i++) {
        const inputEl = document.getElementById(`extra-stop-${i}`);
        if (inputEl && !stopRefs.current[i]) {
          const stopAuto = new window.google.maps.places.Autocomplete(inputEl, { componentRestrictions: { country: "ae" } });
          stopAuto.addListener("place_changed", () => {
            const p = stopAuto.getPlace();
            if (p.formatted_address) {
              setStopNames(prev => {
                const newNames = [...prev];
                newNames[i] = p.formatted_address;
                return newNames;
              });
            }
          });
          stopRefs.current[i] = stopAuto;
        }
      }
    }
  }, [extraStops]);

  const resolveZoneFromGoogle = (address) => {
    const text = address.toLowerCase();
    if (text.includes('dubai')) return 'dxb';
    if (text.includes('sharjah')) return 'shj';
    if (text.includes('ajman')) return 'ajman';
    if (text.includes('umm al quwain')) return 'umm_al_quwain';
    if (text.includes('ras al khaimah')) return 'ras_al_khaimah';
    if (text.includes('fujairah')) return 'fujeirah';
    if (text.includes('al ain')) return 'al_ain';
    return 'abu_dhabi';
  };

  useEffect(() => { if (selectedVehicle) setCarType(selectedVehicle); }, [selectedVehicle]);

  useEffect(() => {
    let base = 0;
    let outOfCitySurcharge = 0;

    if (mode === 'hourly') {
        base = FLEET_PRICING.hourly[hourlyType][carType] || 0;
        // Check if Hourly pickup is outside Abu Dhabi
        const pickupZone = resolveZoneFromGoogle(pickup);
        if (pickupZone && pickupZone !== 'abu_dhabi') {
            outOfCitySurcharge = 100;
        }
    } else {
        if (!resolvedZone) { setPrice(0); return; }
        const category = (mode === 'arrival') ? 'arrival' : 'transfer';
        const zoneData = FLEET_PRICING.zones[resolvedZone];
        base = (zoneData[category] || zoneData['transfer'])[carType] || 0;
    }
    
    if (base === 0) return;
    
    let extraStopsCost = (mode === 'arrival' || mode === 'departure') ? (extraStops * EXTRA_STOP_FEE) : 0;
    let subtotal = base + extraStopsCost + outOfCitySurcharge;
    let cardFee = paymentMethod === 'Card' ? (subtotal * 0.05) : 0;
    let vat = (subtotal + cardFee) * 0.05;
    let total = Math.round(subtotal + cardFee + vat);
    
    setBreakdown({ 
      base: base + outOfCitySurcharge,
      extraStopsCost, 
      cardFee: Math.round(cardFee), 
      vat: Math.round(vat) 
    });
    setPrice(total);
  }, [resolvedZone, pickup, carType, paymentMethod, mode, hourlyType, extraStops]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    if (!stripe || !elements || !price) { alert("Please select a location or hourly type."); setLoading(false); return; }
    const chargeAmount = paymentMethod === 'Card' ? price : Math.round(price * 0.25);
    try {
      const res = await fetch(`${BACKEND_URL}/create-payment-intent`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: chargeAmount }),
      });
      const uniqueSourceId = 'Web-' + Date.now();
      const { clientSecret } = await res.json();
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: { card: elements.getElement(CardElement), billing_details: { name: guestName, email: guestEmail } },
      });
      if (result.error) { alert(result.error.message); setLoading(false); return; }
      const formattedStops = stopNames.filter(n => n && n.trim() !== '').join(' | ');
      const bookingData = {
        "Source": uniqueSourceId,
        "Date": date, "Time": time, "Guest_name": guestName, "Guest_number": guestPhone, "Pax": pax,
        "Luggage": luggage, "Email": guestEmail, "Pickup": pickup, "Drop_off": destination,
        "Flight": flightNumber || "N/A", "Car_type": carType,
        "Extra_Stops": mode === 'arrival' || mode === 'departure' ? extraStops : 0,
        "Stop_Names": (mode === 'arrival' || mode === 'departure') && extraStops > 0 && formattedStops ? formattedStops : "None",
        "Price": price, "Payment": paymentMethod === 'Card' ? "100% Paid" : "25% Deposit Paid",
        "Type": mode === 'hourly' ? `Hourly (${hourlyType === 'half_day' ? '5h' : '10h'})` : mode,
        "Status": "Pending"
      };
      await fetch(`${BACKEND_URL}/sync-google`, { method: 'POST', headers: { "Content-Type": "application/json" }, body: JSON.stringify({ data: [bookingData] }) });
      onBookingSuccess(bookingData);
    } catch (e) { alert("Submission error."); }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-slate-900 p-8 rounded-[3rem] border-t-8 border-amber-500 shadow-2xl space-y-4">
      <div className="flex bg-slate-800 p-1 rounded-2xl mb-2 overflow-x-auto no-scrollbar">
        {[
          { id: 'arrival', label: 'Arrival', icon: PlaneLanding },
          { id: 'departure', label: 'Departure', icon: PlaneTakeoff },
          { id: 'transfer', label: 'Transfer', icon: MoveRight },
          { id: 'hourly', label: 'Hourly', icon: Clock }
        ].map((item) => (
          <button key={item.id} type="button" onClick={() => { setMode(item.id); setResolvedZone(null); setPickup(''); setDestination(''); setExtraStops(0); setStopNames([]); stopRefs.current = []; }} className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${mode === item.id ? 'bg-amber-500 text-slate-900' : 'text-slate-400 hover:text-white'}`}>
            <item.icon size={14} /> {item.label}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {/* PICKUP */}
        <div className="relative">
          <input 
            ref={pickupInputRef}
            defaultValue={pickup}
            required 
            placeholder={mode === 'arrival' ? "Arrival Airport" : "Pickup Address"} 
            className="w-full p-4 bg-slate-800 rounded-xl text-white outline-none text-xs focus:border-amber-500 border border-transparent" 
          />
          <MapPin className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
        </div>

        {/* DESTINATION */}
        <div className="relative">
          <input 
            ref={destInputRef}
            defaultValue={destination}
            required 
            placeholder={mode === 'departure' ? "Departure Airport" : "Drop-off Address"} 
            className="w-full p-4 bg-slate-800 rounded-xl text-white outline-none text-xs focus:border-amber-500 border border-transparent" 
          />
          <MapPin className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
        </div>
      </div>

      {(mode === 'arrival' || mode === 'departure') && (
        <div className="space-y-3 mt-4">
          <label className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] flex items-center justify-between">
            <span>Extra Stops (Optional)</span>
            {extraStops > 0 && <span className="text-amber-500">+ AED {extraStops * EXTRA_STOP_FEE}</span>}
          </label>
          <div className="flex items-center gap-4">
            <button type="button" onClick={() => { 
              if (extraStops > 0) { 
                setExtraStops(extraStops - 1); 
                setStopNames(prev => prev.slice(0, -1)); 
                stopRefs.current.pop(); 
              } 
            }} className="w-12 h-12 bg-slate-800 rounded-2xl text-amber-500 hover:bg-slate-700 transition-colors flex items-center justify-center font-black text-xl border border-slate-700/50">-</button>
            <span className="text-xl font-black w-8 text-center text-white">{extraStops}</span>
            <button type="button" onClick={() => { 
              setExtraStops(extraStops + 1); 
              setStopNames(prev => [...prev, '']); 
            }} className="w-12 h-12 bg-slate-800 rounded-2xl text-amber-500 hover:bg-slate-700 transition-colors flex items-center justify-center font-black text-xl border border-slate-700/50">+</button>
          </div>
          
          <AnimatePresence>
            {extraStops > 0 && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-visible relative space-y-2 mt-2">
                {stopNames.map((_, index) => (
                  <div key={index} className="relative">
                    <input 
                      id={`extra-stop-${index}`}
                      type="text" 
                      placeholder={`Extra Stop ${index + 1} Address...`} 
                      className="w-full bg-[#0a101f] border border-slate-800 rounded-xl py-4 px-5 text-xs outline-none focus:border-amber-500 transition-all text-white placeholder-slate-600 pr-10" 
                      required 
                    />
                    <MapPin className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {mode === 'hourly' && (
        <div className="flex bg-slate-800/50 p-1 rounded-xl gap-2">
            <button type="button" onClick={() => setHourlyType('half_day')} className={`flex-1 py-2 rounded-lg text-[9px] font-bold uppercase ${hourlyType === 'half_day' ? 'bg-slate-700 text-amber-500 border border-amber-500/30' : 'text-slate-500'}`}>5 Hours (Half Day)</button>
            <button type="button" onClick={() => setHourlyType('full_day')} className={`flex-1 py-2 rounded-lg text-[9px] font-bold uppercase ${hourlyType === 'full_day' ? 'bg-slate-700 text-amber-500 border border-amber-500/30' : 'text-slate-500'}`}>10 Hours (Full Day)</button>
        </div>
      )}

      <input name="name" required value={guestName} onChange={e => setGuestName(e.target.value)} placeholder="Guest Name" className="w-full p-4 bg-slate-800 rounded-xl text-white outline-none text-xs focus:border-amber-500 border border-transparent" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="relative"><input name="phone" required type="tel" value={guestPhone} onChange={e => setGuestPhone(e.target.value)} placeholder="Mobile (+971...)" className="w-full p-4 bg-slate-800 rounded-xl text-white outline-none text-xs pl-10 focus:border-amber-500 border border-transparent" /><Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} /></div>
        <input name="email" required type="email" value={guestEmail} onChange={e => setGuestEmail(e.target.value)} placeholder="Email Address" className="w-full p-4 bg-slate-800 rounded-xl text-white outline-none text-xs focus:border-amber-500 border border-transparent" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <input type="date" value={date} onChange={e => setDate(e.target.value)} required className="p-4 bg-slate-800 rounded-xl text-white text-xs" />
        <input name="time" type="time" value={time} onChange={e => setTime(e.target.value)} required className="p-4 bg-slate-800 rounded-xl text-white text-xs" />
      </div>

      {mode === 'arrival' && <input name="flight" value={flightNumber} onChange={e => setFlightNumber(e.target.value)} placeholder="Flight Number" className="w-full p-4 bg-slate-800 rounded-xl text-white outline-none text-xs" />}

      <div className="grid grid-cols-2 gap-4">
        <select value={carType} onChange={e => setCarType(e.target.value)} className="p-4 bg-slate-800 text-white rounded-xl text-xs border border-amber-500/50 outline-none">{FLEET_DATA.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}</select>
        <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)} className="p-4 bg-slate-800 text-white rounded-xl text-xs outline-none focus:border-amber-500 border border-transparent"><option value="Cash">25% Card Deposit</option><option value="Card">100% Prepay (Card)</option></select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-[#0a101f] border border-slate-800 p-3 rounded-2xl flex justify-between items-center"><span className="text-[9px] font-black uppercase text-slate-500 px-2">Pax</span><div className="flex gap-4"><button type="button" onClick={() => setPax(Math.max(1, pax - 1))} className="text-amber-500">-</button><span className="text-sm font-bold text-white">{pax}</span><button type="button" onClick={() => setPax(pax + 1)} className="text-amber-500">+</button></div></div>
        <div className="bg-[#0a101f] border border-slate-800 p-3 rounded-2xl flex justify-between items-center"><span className="text-[9px] font-black uppercase text-slate-500 px-2">Luggage</span><div className="flex gap-4"><button type="button" onClick={() => setLuggage(Math.max(0, luggage - 1))} className="text-amber-500">-</button><span className="text-sm font-bold text-white">{luggage}</span><button type="button" onClick={() => setLuggage(luggage + 1)} className="text-amber-500">+</button></div></div>
      </div>

      <button type="button" onClick={() => { const name = guestName || 'New Guest'; window.open(`https://wa.me/971XXXXXXXXX?text=${encodeURIComponent(`Special Requirement for ${name}:\nPickup: ${pickup}\nDropoff: ${destination}`)}`, '_blank'); }} className="w-full mt-2 flex items-center justify-between p-4 rounded-2xl bg-[#0a101f] border border-slate-800 hover:border-amber-500/50 transition-all group"><span className="text-[10px] font-black uppercase tracking-widest text-amber-500">Special Requirement</span><Plus className="text-amber-500" size={16} /></button>

      <div className="bg-slate-800 p-4 rounded-2xl border border-slate-700">
        <div className="flex justify-between items-center mb-2 border-b border-slate-700 pb-2"><span className="text-[9px] font-bold text-slate-400 uppercase flex items-center gap-1"><Lock size={10} className="text-emerald-500"/> Secure Payment</span></div>
        <CardElement options={{ style: { base: { fontSize: '14px', color: '#fff' } } }} />
      </div>

      <button type="submit" disabled={loading || !stripe || price === 0} className="w-full bg-amber-500 text-slate-900 py-5 rounded-2xl font-black uppercase text-xs hover:bg-amber-400 shadow-xl transition-all mt-4">{loading ? "Processing..." : (price > 0 ? `Pay ${paymentMethod === 'Card' ? 'AED ' + price : 'AED ' + Math.round(price * 0.25) + ' Deposit'} & Book` : "Search Address to Book")}</button>

      {price > 0 && breakdown && (
        <div className="bg-slate-800/50 p-4 rounded-xl text-[10px] font-bold uppercase tracking-widest space-y-2 border border-slate-700">
          <div className="flex justify-between text-slate-400"><span>Base Fare {mode === 'hourly' && `(${hourlyType === 'half_day' ? '5h' : '10h'})`}</span> <span>AED {breakdown.base}</span></div>
          {breakdown.outOfCitySurcharge > 0 && <div className="flex justify-between text-amber-500"><span>Out of City Surcharge</span> <span>+ AED {breakdown.outOfCitySurcharge}</span></div>}
          {breakdown.extraStopsCost > 0 && <div className="flex justify-between text-slate-400"><span>Extra Stops ({extraStops})</span> <span>+ AED {breakdown.extraStopsCost}</span></div>}
          <div className="flex justify-between text-slate-400"><span>VAT (5%)</span> <span>+ AED {breakdown.vat}</span></div>
          {breakdown.cardFee > 0 && <div className="flex justify-between text-blue-400"><span>Card Fee (5%)</span> <span>+ AED {breakdown.cardFee}</span></div>}
          <div className="flex justify-between text-sm text-white border-t border-slate-700 pt-2"><span>Total</span> <span>AED {price}</span></div>
        </div>
      )}
    </form>
  );
}

export default function BookingForm(props) {
  return <Elements stripe={stripePromise}><CheckoutForm {...props} /></Elements>;
}