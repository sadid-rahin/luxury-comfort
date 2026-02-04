import React, { useState, useEffect } from 'react';
import { MapPin, Loader2, CreditCard, Lock } from 'lucide-react';

// YOUR LATEST SCRIPT URL
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwHgxuyiNIQ0u5_G5FbZU9c9l0lX9klj31ECzPCHoM7L83yQhl5uxfvju8H4UmRibyB/exec";

// --- UPDATED: New List as Requested ---
// We keep the 'id' same so the Price List works, but change the 'name' the user sees.
const FLEET_DATA = [
  { id: 'Lexus', name: 'Sedan / 4 Seater' },
  { id: 'SUV', name: 'SUV / 7 Seater' },
  { id: 'MiniBus', name: 'Mini Bus / Van' },
  { id: 'Viano', name: 'Mercedes V-Class' }
];

const PRICE_LIST = {
  transfers: {
    "ABU DHABI CITY HOTELS": { "Lexus": 120, "SUV": 110, "MiniBus": 150, "Viano": 250 },
    "DUBAI": { "Lexus": 300, "SUV": 300, "MiniBus": 450, "Viano": 600 },
  }
};

export default function BookingForm({ onBookingSuccess }) {
  // Form State
  const [pickup, setPickup] = useState(''); 
  const [destination, setDestination] = useState('');
  const [carType, setCarType] = useState('Lexus');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [date, setDate] = useState('');
  const [price, setPrice] = useState(0);
  
  // Processing State
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);

  // Card Inputs
  const [cardNum, setCardNum] = useState('');
  const [cardExp, setCardExp] = useState('');
  const [cardCVC, setCardCVC] = useState('');

  // Calculate Price
  useEffect(() => {
    let currentPrice = PRICE_LIST.transfers[destination]?.[carType] || 0;
    if (date) {
      const bDate = new Date(date);
      const d = bDate.getDate();
      const m = bDate.getMonth() + 1;
      if ((m === 12 && [24, 25, 26, 31].includes(d)) || (m === 1 && d === 1)) currentPrice *= 1.5;
    }
    // Stripe/Card processing usually adds a fee
    if (paymentMethod === 'Card') currentPrice *= 1.05;
    setPrice(Math.round(currentPrice));
  }, [destination, carType, paymentMethod, date]);

  // --- LIVE LOCATION LOGIC ---
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }
    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude, longitude } = position.coords;
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
        const data = await res.json();
        if (data.display_name) {
          const shortAddress = data.display_name.split(',').slice(0, 3).join(',');
          setPickup(shortAddress);
        } else {
          setPickup(`${latitude}, ${longitude}`);
        }
      } catch (error) { setPickup(`${latitude}, ${longitude}`); }
      setLocationLoading(false);
    }, () => {
      alert("Unable to retrieve location.");
      setLocationLoading(false);
    });
  };

  // --- PAYMENT SIMULATION LOGIC ---
  const simulatePaymentGateway = () => {
    return new Promise((resolve, reject) => {
      // Basic validation logic
      if (cardNum.length < 16 || cardCVC.length < 3 || !cardExp.includes('/')) {
        reject("Invalid Card Details");
        return;
      }
      // Simulate API Network Delay (2 seconds)
      setTimeout(() => {
        resolve("txn_" + Date.now()); // Fake Transaction ID
      }, 2000);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.target);
    const uniqueID = `Web-${Date.now()}`;

    // 1. HANDLE PAYMENT FLOW
    let finalPaymentStatus = paymentMethod;
    
    if (paymentMethod === 'Card') {
      setPaymentProcessing(true); // Show Overlay
      try {
        await simulatePaymentGateway();
        finalPaymentStatus = "Card (Paid)"; // Mark as Paid for Host
      } catch (error) {
        alert("Payment Declined: Check card details.");
        setPaymentProcessing(false);
        setLoading(false);
        return; // Stop submission
      }
    }

    // 2. PREPARE DATA
    const bookingData = {
      "Date": date,
      "Time": formData.get('time'),
      "Guest_name": formData.get('name'),
      "Email": formData.get('email'),
      "Pickup": pickup, 
      "Drop_off": destination,
      "Flight": formData.get('flight') || "N/A",
      "Source": uniqueID, 
      "Agency": "",
      "Car_type": carType,
      "Driver": "",
      "Driver_number": "",
      "Status": "Pending",
      "Price": price,
      "Payment": finalPaymentStatus // Sends "Card (Paid)" or "Cash"
    };

    // 3. SEND TO SHEET
    try {
      await fetch(SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        body: JSON.stringify({ data: [bookingData] })
      });
      setPaymentProcessing(false);
      onBookingSuccess(bookingData);
    } catch (e) { 
      alert("Submission failed."); 
      setPaymentProcessing(false);
    }
    setLoading(false);
  };

  return (
    <div className="relative">
      {/* PAYMENT PROCESSING OVERLAY */}
      {paymentProcessing && (
        <div className="absolute inset-0 bg-slate-900/90 z-50 rounded-[3rem] flex flex-col items-center justify-center backdrop-blur-sm border-2 border-emerald-500/50">
          <Loader2 className="w-16 h-16 text-emerald-500 animate-spin mb-4" />
          <div className="text-2xl font-black uppercase italic text-white">Processing...</div>
          <div className="text-emerald-500 text-xs font-bold mt-2 uppercase tracking-widest">Securing Payment</div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-slate-900 p-8 rounded-[3rem] border-t-8 border-amber-500 shadow-2xl space-y-4">
        <input name="name" required placeholder="Guest Name" className="w-full p-4 bg-slate-800 rounded-xl text-white outline-none text-xs" />
        <input name="email" required type="email" placeholder="Email Address" className="w-full p-4 bg-slate-800 rounded-xl text-white outline-none text-xs" />
        
        <div className="grid grid-cols-2 gap-4">
          {/* LOCATION INPUT WITH BUTTON */}
          <div className="relative">
            <input 
              name="pickup" 
              value={pickup}
              onChange={(e) => setPickup(e.target.value)}
              required 
              placeholder="Pickup Location" 
              className="w-full p-4 bg-slate-800 rounded-xl text-white outline-none text-xs pr-10" 
            />
            <button 
              type="button" 
              onClick={handleGetLocation}
              disabled={locationLoading}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-amber-500 hover:text-white transition-colors"
            >
              {locationLoading ? <Loader2 className="animate-spin" size={16} /> : <MapPin size={18} />}
            </button>
          </div>
          <select required value={destination} onChange={e => setDestination(e.target.value)} className="p-4 bg-slate-800 text-white rounded-xl text-xs font-bold outline-none">
            <option value="">Drop off Point</option>
            {Object.keys(PRICE_LIST.transfers).map(loc => <option key={loc} value={loc}>{loc}</option>)}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <input type="date" value={date} onChange={e => setDate(e.target.value)} required className="p-4 bg-slate-800 rounded-xl text-white text-xs" />
          <input name="time" type="time" required className="p-4 bg-slate-800 rounded-xl text-white text-xs" />
        </div>
        <input name="flight" placeholder="Flight Number" className="w-full p-4 bg-slate-800 rounded-xl text-white outline-none text-xs" />
        
        {/* CAR & PAYMENT SELECTION */}
        <div className="grid grid-cols-2 gap-4">
          <select value={carType} onChange={e => setCarType(e.target.value)} className="p-4 bg-slate-800 text-white rounded-xl text-xs">
            {FLEET_DATA.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
          </select>
          <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)} className="p-4 bg-slate-800 text-white rounded-xl text-xs">
            <option value="Cash">Cash to Driver</option>
            <option value="Card">Pay with Card</option>
          </select>
        </div>

        {/* SECURE CARD INPUT UI (Visible only if Card selected) */}
        {paymentMethod === 'Card' && (
          <div className="bg-slate-800 p-4 rounded-2xl border border-slate-700 animate-in fade-in slide-in-from-top-2">
            <div className="flex justify-between items-center mb-3">
              <span className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-1">
                <Lock size={10} /> Secure SSL Payment
              </span>
              <div className="flex gap-1 opacity-50">
                 <div className="w-6 h-4 bg-white/10 rounded"></div>
                 <div className="w-6 h-4 bg-white/10 rounded"></div>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="relative">
                <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                <input 
                  required 
                  maxLength={19}
                  placeholder="0000 0000 0000 0000" 
                  value={cardNum}
                  onChange={(e) => setCardNum(e.target.value.replace(/\D/g,'').substring(0,16))}
                  className="w-full pl-9 p-3 bg-slate-900 rounded-lg text-white text-xs outline-none border border-slate-700 focus:border-amber-500 transition-colors" 
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input 
                  required 
                  maxLength={5}
                  placeholder="MM/YY" 
                  value={cardExp}
                  onChange={(e) => setCardExp(e.target.value)}
                  className="p-3 bg-slate-900 rounded-lg text-white text-xs outline-none border border-slate-700 focus:border-amber-500" 
                />
                <input 
                  required 
                  maxLength={3}
                  type="password"
                  placeholder="CVC" 
                  value={cardCVC}
                  onChange={(e) => setCardCVC(e.target.value.replace(/\D/g,'').substring(0,3))}
                  className="p-3 bg-slate-900 rounded-lg text-white text-xs outline-none border border-slate-700 focus:border-amber-500" 
                />
              </div>
            </div>
          </div>
        )}

        {/* DYNAMIC BUTTON */}
        <button type="submit" disabled={loading} className={`w-full py-5 rounded-2xl font-black uppercase text-xs transition-all shadow-xl ${paymentMethod === 'Card' ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-900' : 'bg-amber-500 hover:bg-amber-400 text-slate-900'}`}>
          {loading ? "Processing..." : (
            paymentMethod === 'Card' 
              ? `Pay AED ${price} & Book Now` 
              : "Confirm Booking"
          )}
        </button>
        
        {price > 0 && <div className="text-center text-3xl font-black text-white/20 italic mt-2 uppercase">Total: AED {price}</div>}
      </form>
    </div>
  );
}