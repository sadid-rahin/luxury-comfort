import React, { useState, useEffect } from 'react';
import { MapPin, Loader2, Lock, CreditCard, ShieldCheck, Phone, Plus, Clock } from 'lucide-react';
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";

const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwHgxuyiNIQ0u5_G5FbZU9c9l0lX9klj31ECzPCHoM7L83yQhl5uxfvju8H4UmRibyB/exec";
const BACKEND_URL = "https://elite-transport-backend.onrender.com/create-payment-intent";
const stripePromise = loadStripe("pk_test_51Sx57rFVFmdbJGhjAMobcQfMvc9Ur2fWde1AilhYul33gzBMeLpUSWGWKYKzWX7FkNjRetx7e0Rf0DdINpMUWQ6800szEvZVwl");

const FLEET_DATA = [
  { id: 'Lexus', name: 'Sedan (Lexus / Axis)' },
  { id: 'SUV', name: 'SUV (Highlander / Outlander)' },
  { id: 'MiniBus', name: 'MPV (Carnival / Staria)' },
  { id: 'Viano', name: 'Luxury Van (V-Class / Citroën)' }
];

const PRICE_LIST = {
  transfers: {
    "ABU DHABI CITY HOTELS": { "Lexus": 120, "SUV": 110, "MiniBus": 150, "Viano": 250 },
    "DUBAI": { "Lexus": 300, "SUV": 300, "MiniBus": 450, "Viano": 600 },
  }
};

function CheckoutForm({ onBookingSuccess, selectedVehicle }) {
  const stripe = useStripe();
  const elements = useElements();

  const [pickup, setPickup] = useState(''); 
  const [destination, setDestination] = useState('');
  const [carType, setCarType] = useState('Lexus');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [date, setDate] = useState('');
  const [time, setTime] = useState(''); 
  const [extraStops, setExtraStops] = useState(0); 
  const [stopNames, setStopNames] = useState(['', '', '']);
  
  const [price, setPrice] = useState(0);
  const [breakdown, setBreakdown] = useState(null); 
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);

  // 🔥 LISTENER: Updates form dropdown when grid is clicked!
  useEffect(() => {
    if (selectedVehicle) {
      setCarType(selectedVehicle);
    }
  }, [selectedVehicle]);

  useEffect(() => {
    let base = PRICE_LIST.transfers[destination]?.[carType] || 0;
    if (base === 0) {
      setPrice(0); setBreakdown(null); return;
    }

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
      base, stopsFee, peakFee: Math.round(peakFee), cardFee: Math.round(cardFee), vat: Math.round(vat)
    });
    setPrice(total);
  }, [destination, carType, paymentMethod, date, time, extraStops]);

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

    if (!nameInput || !phoneInput || !emailInput || !pickup || !destination || !date || !time) {
      alert("Please fill in all details.");
      setLoading(false);
      return;
    }

    let finalPaymentStatus = "Cash";
    let transactionId = "";

    if (paymentMethod === 'Card') {
      if (!stripe || !elements) { setLoading(false); return; }
      try {
        const res = await fetch(BACKEND_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount: price }),
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
          finalPaymentStatus = "Card (Paid)";
          transactionId = result.paymentIntent.id;
        }
      } catch (err) { alert("Server Error. Ensure Backend is running."); setLoading(false); return; }
    }

    const uniqueID = `Web-${Date.now()}`;
    const paymentLabel = transactionId ? `Paid Card (Ref: ${transactionId})` : finalPaymentStatus;

    const formattedStops = extraStops > 0 
      ? stopNames.slice(0, extraStops).map((name, i) => `Stop ${i + 1}: ${name}`).join(' | ') 
      : "None";

    const bookingData = {
      "Date": date,
      "Time": time,
      "Guest_name": nameInput,
      "Guest_number": phoneInput, 
      "Email": emailInput,
      "Pickup": pickup, 
      "Drop_off": destination,    
      "Flight": document.getElementsByName('flight')[0]?.value || "N/A",
      "Source": uniqueID, 
      "Agency": "",
      "Car_type": carType,        
      "Driver": "",
      "Driver_number": "",
      "Vehicle_number": "",       
      "Status": "Pending",
      "Price": price,             
      "Payment": paymentLabel,
      "Extra_Stops": extraStops,
      "Stop_Names": formattedStops
    };

    try {
      await fetch(SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        body: JSON.stringify({ data: [bookingData] })
      });
      onBookingSuccess(bookingData);
    } catch (e) { alert("Error submitting booking."); }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-slate-900 p-8 rounded-[3rem] border-t-8 border-amber-500 shadow-2xl space-y-4">
      <input name="name" required placeholder="Guest Name" className="w-full p-4 bg-slate-800 rounded-xl text-white outline-none text-xs" />
      <div className="relative">
        <input name="phone" required type="tel" placeholder="Mobile Number (e.g. +971...)" className="w-full p-4 bg-slate-800 rounded-xl text-white outline-none text-xs pl-10" />
        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
      </div>
      <input name="email" required type="email" placeholder="Email Address" className="w-full p-4 bg-slate-800 rounded-xl text-white outline-none text-xs" />
      
      <div className="grid grid-cols-2 gap-4">
        <div className="relative">
          <input name="pickup" value={pickup} onChange={(e) => setPickup(e.target.value)} required placeholder="Pickup Location" className="w-full p-4 bg-slate-800 rounded-xl text-white outline-none text-xs pr-10" />
          <button type="button" onClick={handleGetLocation} disabled={locationLoading} className="absolute right-3 top-1/2 -translate-y-1/2 text-amber-500 hover:text-white">
            {locationLoading ? <Loader2 className="animate-spin" size={16} /> : <MapPin size={18} />}
          </button>
        </div>
        <select required value={destination} onChange={e => setDestination(e.target.value)} className="p-4 bg-slate-800 text-white rounded-xl text-xs font-bold outline-none">
          <option value="">Drop off Point</option>
          {Object.keys(PRICE_LIST.transfers).map(loc => <option key={loc} value={loc}>{loc}</option>)}
        </select>
      </div>

      <div className="relative">
         <select value={extraStops} onChange={e => setExtraStops(Number(e.target.value))} className="w-full p-4 bg-slate-800 text-white rounded-xl text-xs font-bold outline-none pl-10 appearance-none">
           <option value={0}>No Extra Stops (Direct Route)</option>
           <option value={1}>1 Extra Stop (+ AED 50)</option>
           <option value={2}>2 Extra Stops (+ AED 100)</option>
           <option value={3}>3 Extra Stops (+ AED 150)</option>
         </select>
         <Plus className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-500" size={16} />
      </div>

      {extraStops > 0 && (
        <div className="space-y-3 animate-in fade-in slide-in-from-top-2 p-4 bg-slate-800/50 rounded-xl border border-amber-500/20">
          <p className="text-[10px] uppercase font-bold text-amber-500 mb-1">Enter Extra Stop Locations</p>
          {Array.from({ length: extraStops }).map((_, index) => (
            <div key={index} className="relative">
              <input
                required
                placeholder={`Short Name for Stop ${index + 1} (e.g. Dubai Mall)`}
                value={stopNames[index]}
                onChange={(e) => {
                  const newStops = [...stopNames];
                  newStops[index] = e.target.value;
                  setStopNames(newStops);
                }}
                className="w-full p-4 bg-slate-900 border border-slate-700 rounded-xl text-white outline-none text-xs pl-10 focus:border-amber-500 transition-colors"
              />
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-500" size={14} />
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <input type="date" value={date} onChange={e => setDate(e.target.value)} required className="p-4 bg-slate-800 rounded-xl text-white text-xs" />
        <input name="time" type="time" value={time} onChange={e => setTime(e.target.value)} required className="p-4 bg-slate-800 rounded-xl text-white text-xs" />
      </div>
      <input name="flight" placeholder="Flight Number" className="w-full p-4 bg-slate-800 rounded-xl text-white outline-none text-xs" />
      
      <div className="grid grid-cols-2 gap-4">
        <select value={carType} onChange={e => setCarType(e.target.value)} className="p-4 bg-slate-800 text-white rounded-xl text-xs border border-amber-500/50">
          {FLEET_DATA.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
        </select>
        <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)} className="p-4 bg-slate-800 text-white rounded-xl text-xs">
          <option value="Cash">Cash to Driver</option>
          <option value="Card">Pay with Card</option>
        </select>
      </div>

      {paymentMethod === 'Card' && (
        <div className="bg-slate-800 p-4 rounded-2xl border border-slate-700 animate-in fade-in slide-in-from-top-2">
           <div className="flex justify-between items-center mb-3 border-b border-slate-700 pb-2">
              <span className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-1"><Lock size={10} className="text-emerald-500" /> Secure Encryption</span>
              <div className="flex gap-2"><CreditCard size={14} className="text-white opacity-50"/><ShieldCheck size={14} className="text-white opacity-50"/></div>
           </div>
           <div className="p-3 bg-slate-900 rounded-lg border border-slate-600">
              <CardElement options={{ style: { base: { fontSize: '14px', color: '#fff', '::placeholder': { color: '#64748b' } }, invalid: { color: '#ef4444' } } }}/>
           </div>
        </div>
      )}

      <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 flex gap-3 text-slate-400 text-[10px] leading-relaxed">
        <Clock className="text-amber-500 shrink-0 mt-0.5" size={16} />
        <div>
          <span className="font-bold text-white uppercase tracking-wider block mb-1">Waiting Time Policy</span>
          Your booking includes a complimentary <span className="text-amber-500 font-bold">60 minutes</span> of free waiting time. Any additional waiting time will incur a penalty of <span className="text-amber-500 font-bold">AED 60 per hour</span>, payable directly to the driver in cash.
        </div>
      </div>

      {breakdown && (
        <div className="bg-slate-800/50 p-4 rounded-xl text-[10px] font-bold uppercase tracking-widest space-y-2 border border-slate-700">
           <div className="flex justify-between text-slate-400"><span>Base Route Fare</span> <span>AED {breakdown.base}</span></div>
           {breakdown.stopsFee > 0 && <div className="flex justify-between text-amber-500"><span>Extra Stops</span> <span>+ AED {breakdown.stopsFee}</span></div>}
           {breakdown.peakFee > 0 && <div className="flex justify-between text-rose-400"><span>Night Surcharge (25%)</span> <span>+ AED {breakdown.peakFee}</span></div>}
           {breakdown.cardFee > 0 && <div className="flex justify-between text-blue-400"><span>Card Processing (5%)</span> <span>+ AED {breakdown.cardFee}</span></div>}
           <div className="flex justify-between text-slate-400"><span>VAT (5%)</span> <span>+ AED {breakdown.vat}</span></div>
           <div className="flex justify-between text-sm text-white border-t border-slate-700 pt-2 mt-2"><span>Final Total</span> <span>AED {price}</span></div>
        </div>
      )}

      <button type="submit" disabled={loading || (paymentMethod === 'Card' && !stripe)} className="w-full bg-amber-500 text-slate-900 py-5 rounded-2xl font-black uppercase text-xs hover:bg-amber-400 shadow-xl transition-all mt-4">
        {loading ? "Processing..." : (paymentMethod === 'Card' ? `Pay AED ${price} & Book` : "Confirm Booking")}
      </button>
    </form>
  );
}

export default function BookingForm(props) {
  return <Elements stripe={stripePromise}><CheckoutForm {...props} /></Elements>;
}