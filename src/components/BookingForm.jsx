import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion'; 
import { MapPin, Loader2, Lock, CreditCard, ShieldCheck, Phone, Plus, Clock, Info, ShieldAlert } from 'lucide-react';
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";

// 🛡️ SECURITY UPDATE: Using Backend Proxy
const BACKEND_URL = "https://elite-transport-backend.onrender.com";
const stripePromise = loadStripe("pk_test_51Sx57rFVFmdbJGhjAMobcQfMvc9Ur2fWde1AilhYul33gzBMeLpUSWGWKYKzWX7FkNjRetx7e0Rf0DdINpMUWQ6800szEvZVwl");

const FLEET_DATA = [
  { id: 'Sedan', name: 'Standard Sedan ' },
  { id: 'Business', name: 'Business Sedan ' },
  { id: 'SUV', name: 'SUV ' },
  { id: 'MPV', name: 'MPV ' },
  { id: 'MiniBus', name: 'Van / Mini Bus' },
  { id: 'Viano', name: 'Premium Van ' }
];

const PRICE_LIST = {
  "ABU DHABI ARRIVAL": { "Sedan": 110, "Business": 130, "SUV": 120, "MPV": 130, "MiniBus": 150, "Viano": 250 },
  "ABU DHABI DEPARTURE / TRANSFER": { "Sedan": 110, "Business": 130, "SUV": 120, "MPV": 130, "MiniBus": 150, "Viano": 250 },
  "AUH - DXB ARRIVAL": { "Sedan": 300, "Business": 350, "SUV": 350, "MPV": 400, "MiniBus": 550, "Viano": 600 },
  "AUH - DXB DEPARTURE / TRANSFER": { "Sedan": 300, "Business": 350, "SUV": 350, "MPV": 400, "MiniBus": 550, "Viano": 600 },
  "AUH - SHJ TRANSFER": { "Sedan": 400, "Business": 450, "SUV": 450, "MPV": 450, "MiniBus": 600, "Viano": 700 },
  "AUH - AJMAN TRANSFER": { "Sedan": 400, "Business": 450, "SUV": 450, "MPV": 450, "MiniBus": 600, "Viano": 700 },
  "AUH - UMM AL QUWAIN TRANSFER": { "Sedan": 450, "Business": 500, "SUV": 500, "MPV": 500, "MiniBus": 650, "Viano": 700 },
  "AUH - RAS AL KHAIMAH TRANSFER": { "Sedan": 550, "Business": 600, "SUV": 600, "MPV": 600, "MiniBus": 700, "Viano": 900 },
  "AUH - FUJAIRAH TRANSFER": { "Sedan": 600, "Business": 700, "SUV": 700, "MPV": 700, "MiniBus": 800, "Viano": 900 },
  "AUH - AL AIN TRANSFER": { "Sedan": 400, "Business": 500, "SUV": 500, "MPV": 500, "MiniBus": 550, "Viano": 600 },
  "AUH - HAMEEM / LIWA / RUWAIS / JEBEL DANNA": { "Sedan": 550, "Business": 600, "SUV": 600, "MPV": 600, "MiniBus": 750, "Viano": 110 },
  "AUH - Qasar Al Sarab": { "Sedan": 600, "Business": 700, "SUV": 700, "MPV": 700, "MiniBus": 750, "Viano": 1100 }
};

const HOURLY_RATES = { "Sedan": 90, "Business": 100, "SUV": 100, "MPV": 100, "MiniBus": 120, "Viano": 150 };

function CheckoutForm({ onBookingSuccess, selectedVehicle }) {
  const stripe = useStripe();
  const elements = useElements();

  const [pickup, setPickup] = useState('');
  const [destination, setDestination] = useState('');
  const [isHourly, setIsHourly] = useState(false);
  const [customDestination, setCustomDestination] = useState('');
  const [durationHours, setDurationHours] = useState(3);
  const [carType, setCarType] = useState('Business');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [extraStops, setExtraStops] = useState(0);
  const [stopNames, setStopNames] = useState(['', '', '']);
  const [price, setPrice] = useState(0);
  const [breakdown, setBreakdown] = useState(null);
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);

  useEffect(() => {
    if (selectedVehicle) {
      setCarType(selectedVehicle);
    }
  }, [selectedVehicle]);

  useEffect(() => {
    if (destination === 'HOURLY_CUSTOM') {
      setIsHourly(true);
    } else {
      setIsHourly(false);
    }
  }, [destination]);

  useEffect(() => {
    if (!destination) {
      setPrice(0); setBreakdown(null); return;
    }

    let base = 0;
    let actualHours = Math.max(3, durationHours);

    if (isHourly) {
      base = HOURLY_RATES[carType] * actualHours;
    } else {
      base = PRICE_LIST[destination]?.[carType] || 0;
    }

    if (base === 0) return;

    let stopsFee = extraStops * 50;
    let subtotal = base + stopsFee;

    let isPeak = false;
    if (time) {
      const hour = parseInt(time.split(':')[0], 10);
      if (hour >= 22 || hour < 6) isPeak = true;
    }
    let peakFee = isPeak ? (subtotal * 0.25) : 0;
    subtotal += peakFee;

    let cardFee = paymentMethod === 'Card' ? (subtotal * 0.05) : 0;
    subtotal += cardFee;

    let vat = subtotal * 0.05;
    let total = Math.round(subtotal + vat);

    setBreakdown({
      base,
      isHourly,
      actualHours,
      stopsFee,
      peakFee: Math.round(peakFee),
      cardFee: Math.round(cardFee),
      vat: Math.round(vat)
    });
    setPrice(total);
  }, [destination, carType, paymentMethod, date, time, extraStops, isHourly, durationHours]);

  const handleGetLocation = () => {
    if (!navigator.geolocation) { alert("Geolocation not supported"); return; }
    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude, longitude } = position.coords;
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
        const data = await res.json();
        if (data.display_name) setPickup(data.display_name.split(',').slice(0, 3).join(','));
        else setPickup(`${latitude}, ${longitude}`);
      } catch (error) { setPickup(`${latitude}, ${longitude}`); }
      setLocationLoading(false);
    }, () => { alert("Unable to get location"); setLocationLoading(false); });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const nameInput = document.getElementsByName('name')[0]?.value;
    const phoneInput = document.getElementsByName('phone')[0]?.value;
    const emailInput = document.getElementsByName('email')[0]?.value;

    if (!nameInput || !phoneInput || !emailInput || !pickup || !date || !time) {
      alert("Please fill in all details.");
      setLoading(false);
      return;
    }

    if (isHourly && (!customDestination || durationHours < 3)) {
      alert("Please enter your custom destination and ensure duration is at least 3 hours.");
      setLoading(false);
      return;
    }

    if (!stripe || !elements) { setLoading(false); return; }

    const depositAmount = Math.round(price * 0.25);
    const dueToDriver = price - depositAmount;
    const chargeAmount = paymentMethod === 'Card' ? price : depositAmount;

    let finalPaymentStatus = "Pending";
    let transactionId = "";

    try {
      // ✅ SECURITY FIX: Fetch Payment Intent via Proxy Backend URL
      const res = await fetch(`${BACKEND_URL}/create-payment-intent`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: chargeAmount }),
      });
      const { clientSecret } = await res.json();
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: { name: nameInput, email: emailInput },
        },
      });
      if (result.error) { alert("Payment Failed: " + result.error.message); setLoading(false); return; }


      if (result.paymentIntent.status === "succeeded") {
        transactionId = result.paymentIntent.id;


        if (paymentMethod === 'Card') {
          finalPaymentStatus = `100% Paid by Card (Ref: ${transactionId})`;
        } else {
          finalPaymentStatus = `25% Prepaid by Card. COLLECT AED ${dueToDriver} CASH ON ARRIVAL (Ref: ${transactionId})`;
        }
      }
    } catch (err) { alert("Server Error. Ensure Backend is running."); setLoading(false); return; }

    const uniqueID = `Web-${Date.now()}`;
    const formattedStops = extraStops > 0 ? stopNames.slice(0, extraStops).map((name, i) => `Stop ${i + 1}: ${name}`).join(' | ') : "None";
    const finalDropOff = isHourly ? `${customDestination} (Hourly: ${Math.max(3, durationHours)} Hrs)` : destination;

    const bookingData = {
      "Date": date,
      "Time": time,
      "Guest_name": nameInput,
      "Guest_number": phoneInput,
      "Email": emailInput,
      "Pickup": pickup,
      "Drop_off": finalDropOff,
      "Flight": document.getElementsByName('flight')[0]?.value || "N/A",
      "Source": uniqueID,
      "Agency": "",
      "Car_type": carType,
      "Driver": "",
      "Driver_number": "",
      "Vehicle_number": "",
      "Status": "Pending",
      "Price": price,
      "Payment": finalPaymentStatus,
      "Extra_Stops": extraStops,
      "Stop_Names": formattedStops
    };

    try {
      // ✅ SECURITY FIX: Proxy Data to Google Script via Backend URL
      await fetch(`${BACKEND_URL}/sync-google`, {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: [bookingData] })
      });
      onBookingSuccess(bookingData);
    } catch (e) { alert("Error submitting booking."); }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-slate-900 p-8 rounded-[3rem] border-t-8 border-amber-500 shadow-2xl space-y-4">

      <input name="name" required placeholder="Guest Name" className="w-full p-4 bg-slate-800 rounded-xl text-white outline-none text-xs focus:border-amber-500 border border-transparent transition-colors" />

      <div className="relative">
        <input name="phone" required type="tel" placeholder="Mobile Number (e.g. +971...)" className="w-full p-4 bg-slate-800 rounded-xl text-white outline-none text-xs pl-10 focus:border-amber-500 border border-transparent transition-colors" />
        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
      </div>

      <input name="email" required type="email" placeholder="Email Address" className="w-full p-4 bg-slate-800 rounded-xl text-white outline-none text-xs focus:border-amber-500 border border-transparent transition-colors" />

      <div className="relative">
        <input name="pickup" value={pickup} onChange={(e) => setPickup(e.target.value)} required placeholder="Pickup Location (e.g. AUH Terminal 1)" className="w-full p-4 bg-slate-800 rounded-xl text-white outline-none text-xs pr-10 focus:border-amber-500 border border-transparent transition-colors" />
        <button type="button" onClick={handleGetLocation} disabled={locationLoading} className="absolute right-3 top-1/2 -translate-y-1/2 text-amber-500 hover:text-white transition-colors">
          {locationLoading ? <Loader2 className="animate-spin" size={16} /> : <MapPin size={18} />}
        </button>
      </div>

      <div className="relative z-10">
        <select required value={destination} onChange={e => setDestination(e.target.value)} className="w-full p-4 bg-slate-800 text-white rounded-xl text-xs font-bold outline-none focus:border-amber-500 border border-transparent transition-colors appearance-none cursor-pointer">
          <option value="" disabled>Drop off or Hourly Service</option>
          {Object.keys(PRICE_LIST).map(loc => <option key={loc} value={loc}>{loc}</option>)}
          <option value="HOURLY_CUSTOM" className="text-amber-500 font-black">🌍 Outside Abu Dhabi / Custom Route (Hourly)</option>
        </select>
        <MapPin className="absolute right-4 top-1/2 -translate-y-1/2 text-amber-500 pointer-events-none" size={16} />
      </div>

      <AnimatePresence>
        {isHourly && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-4 overflow-hidden">
            <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl">
              <div className="flex gap-2 items-start mb-3">
                <Info className="text-amber-500 shrink-0 mt-0.5" size={14} />
                <p className="text-[10px] text-amber-200 leading-relaxed font-medium">
                  Custom routes and locations outside the predefined zones are charged at a fixed hourly rate. <strong className="text-amber-500 font-black uppercase">Minimum 3 hours required.</strong>
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input required value={customDestination} onChange={(e) => setCustomDestination(e.target.value)} placeholder="Enter Drop-off City or Location" className="w-full p-4 bg-slate-900 border border-slate-700 rounded-xl text-white outline-none text-xs focus:border-amber-500 transition-colors" />
                <div className="relative">
                  <input required type="number" min="3" value={durationHours} onChange={(e) => setDurationHours(parseInt(e.target.value) || 3)} placeholder="Hours" className="w-full p-4 bg-slate-900 border border-slate-700 rounded-xl text-white outline-none text-xs pl-12 focus:border-amber-500 transition-colors" />
                  <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-500" size={14} />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative">
        <select value={extraStops} onChange={e => setExtraStops(Number(e.target.value))} className="w-full p-4 bg-slate-800 text-white rounded-xl text-xs font-bold outline-none pl-10 appearance-none focus:border-amber-500 border border-transparent transition-colors">
          <option value={0}>For Extra Stops (Direct Route)</option>
          <option value={1}>1 Extra Stop (+ AED 50)</option>
          <option value={2}>2 Extra Stops (+ AED 100)</option>
          <option value={3}>3 Extra Stops (+ AED 150)</option>
        </select>
        <Plus className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-500" size={16} />
      </div>

      {extraStops > 0 && (
        <div className="space-y-3 p-4 bg-slate-800/50 rounded-xl border border-amber-500/20">
          <p className="text-[10px] uppercase font-bold text-amber-500 mb-1">Enter Extra Stop Locations</p>
          {Array.from({ length: extraStops }).map((_, index) => (
            <div key={index} className="relative">
              <input required placeholder={`Short Name for Stop ${index + 1} (e.g. Dubai Mall)`} value={stopNames[index]} onChange={(e) => { const newStops = [...stopNames]; newStops[index] = e.target.value; setStopNames(newStops); }} className="w-full p-4 bg-slate-900 border border-slate-700 rounded-xl text-white outline-none text-xs pl-10 focus:border-amber-500 transition-colors" />
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-500" size={14} />
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <input type="date" value={date} onChange={e => setDate(e.target.value)} required className="p-4 bg-slate-800 rounded-xl text-white text-xs focus:border-amber-500 border border-transparent transition-colors" />
        <input name="time" type="time" value={time} onChange={e => setTime(e.target.value)} required className="p-4 bg-slate-800 rounded-xl text-white text-xs focus:border-amber-500 border border-transparent transition-colors" />
      </div>

      <input name="flight" placeholder="Flight Number (Optional)" className="w-full p-4 bg-slate-800 rounded-xl text-white outline-none text-xs focus:border-amber-500 border border-transparent transition-colors" />

      <div className="grid grid-cols-2 gap-4">
        <select value={carType} onChange={e => setCarType(e.target.value)} className="p-4 bg-slate-800 text-white rounded-xl text-xs border border-amber-500/50 outline-none">
          {FLEET_DATA.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
        </select>
        <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)} className="p-4 bg-slate-800 text-white rounded-xl text-xs outline-none focus:border-amber-500 border border-transparent transition-colors">
          <option value="Cash">Secure with 25% Deposit</option>
          <option value="Card">Prepay 100% (Card)</option>
        </select>
      </div>

      <div className="bg-slate-800 p-4 rounded-2xl border border-slate-700 animate-in fade-in slide-in-from-top-2">
        <div className="flex justify-between items-center mb-3 border-b border-slate-700 pb-2">
          <span className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-1"><Lock size={10} className="text-emerald-500" /> Secure Card Payment {paymentMethod === 'Cash' ? '(25% Deposit)' : '(100% Total)'}</span>
          <div className="flex gap-2"><CreditCard size={14} className="text-white opacity-50" /><ShieldCheck size={14} className="text-white opacity-50" /></div>
        </div>
        <div className="p-3 bg-slate-900 rounded-lg border border-slate-600">
          <CardElement options={{ style: { base: { fontSize: '14px', color: '#fff', '::placeholder': { color: '#64748b' } }, invalid: { color: '#ef4444' } } }} />
        </div>
      </div>

      {/* AGREEMENT DISCLAIMER */}
      <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 flex gap-3 text-slate-400 text-[10px] leading-relaxed">
        <ShieldAlert className="text-amber-500 shrink-0 mt-0.5" size={16} />
        <div>
          <span className="font-bold text-white uppercase tracking-wider block mb-1">Agreement Required</span>
          By confirming this booking, you agree to our <span className="text-amber-500 font-bold uppercase">Cancellation & Refund Policy</span>. Deposit is only refundable if notice is provided 6 hours prior to pickup.
        </div>
      </div>

      {breakdown && (
        <div className="bg-slate-800/50 p-4 rounded-xl text-[10px] font-bold uppercase tracking-widest space-y-2 border border-slate-700">
          <div className="flex justify-between text-slate-400">
            <span>{breakdown.isHourly ? `Hourly Rate (${breakdown.actualHours} hrs)` : 'Base Route Fare'}</span>
            <span>AED {breakdown.base}</span>
          </div>
          {breakdown.stopsFee > 0 && <div className="flex justify-between text-amber-500"><span>Extra Stops</span> <span>+ AED {breakdown.stopsFee}</span></div>}
          {breakdown.peakFee > 0 && <div className="flex justify-between text-rose-400"><span>Night Surcharge (25%)</span> <span>+ AED {breakdown.peakFee}</span></div>}
          {breakdown.cardFee > 0 && <div className="flex justify-between text-blue-400"><span>Card Processing (5%)</span> <span>+ AED {breakdown.cardFee}</span></div>}
          <div className="flex justify-between text-slate-400"><span>VAT (5%)</span> <span>+ AED {breakdown.vat}</span></div>
          <div className="flex justify-between text-sm text-white border-t border-slate-700 pt-2 mt-2"><span>Total Price</span> <span>AED {price}</span></div>
          {paymentMethod === 'Cash' && (
            <div className="mt-2 pt-2 border-t border-amber-500/20 space-y-2">
              <div className="flex justify-between text-amber-500 font-black"><span>25% Card Deposit Due Now</span> <span>AED {Math.round(price * 0.25)}</span></div>
              <div className="flex justify-between text-emerald-400 font-bold"><span>75% Cash Due to Driver</span> <span>AED {price - Math.round(price * 0.25)}</span></div>
            </div>
          )}
        </div>
      )}

      <button type="submit" disabled={loading || !stripe} className="w-full bg-amber-500 text-slate-900 py-5 rounded-2xl font-black uppercase text-xs hover:bg-amber-400 shadow-xl transition-all mt-4">
        {loading ? "Processing..." : (paymentMethod === 'Card' ? `Pay AED ${price} & Book` : `Pay AED ${Math.round(price * 0.25)} Deposit & Book`)}
      </button>
    </form>
  );
}

export default function BookingForm(props) {
  return <Elements stripe={stripePromise}><CheckoutForm {...props} /></Elements>;
}