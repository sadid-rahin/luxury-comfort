import React, { useState, useEffect } from 'react';
import { MapPin, Loader2 } from 'lucide-react'; // Added icons

// YOUR EXISTING URL (Keep this exactly as is)
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwHgxuyiNIQ0u5_G5FbZU9c9l0lX9klj31ECzPCHoM7L83yQhl5uxfvju8H4UmRibyB/exec";

const FLEET_DATA = [
  { id: 'Lexus', name: 'Lexus ES300h (4 Seater)' },
  { id: 'SUV', name: 'SUV / Highlander (7 Seater)' },
  { id: 'MiniBus', name: 'Mini Bus (14 Seater)' },
  { id: 'Viano', name: 'Mercedes Viano (Mini Van)' }
];

const PRICE_LIST = {
  transfers: {
    "ABU DHABI CITY HOTELS": { "Lexus": 120, "SUV": 110, "MiniBus": 150, "Viano": 250 },
    "DUBAI": { "Lexus": 300, "SUV": 300, "MiniBus": 450, "Viano": 600 },
  }
};

export default function BookingForm({ onBookingSuccess }) {
  // Added state for pickup to control the input
  const [pickup, setPickup] = useState(''); 
  const [destination, setDestination] = useState('');
  const [carType, setCarType] = useState('Lexus');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [date, setDate] = useState('');
  const [price, setPrice] = useState(0);
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false); // New loading state for GPS

  useEffect(() => {
    let currentPrice = PRICE_LIST.transfers[destination]?.[carType] || 0;
    if (date) {
      const bDate = new Date(date);
      const d = bDate.getDate();
      const m = bDate.getMonth() + 1;
      if ((m === 12 && [24, 25, 26, 31].includes(d)) || (m === 1 && d === 1)) currentPrice *= 1.5;
    }
    if (paymentMethod === 'Card') currentPrice *= 1.05;
    setPrice(Math.round(currentPrice));
  }, [destination, carType, paymentMethod, date]);

  // --- NEW: FUNCTION TO GET LIVE LOCATION ---
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    setLocationLoading(true);

    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude, longitude } = position.coords;
      
      try {
        // Try to convert coords to address using OpenStreetMap (Free)
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
        const data = await res.json();
        
        if (data.display_name) {
          // Shorten address for better display
          const shortAddress = data.display_name.split(',').slice(0, 3).join(',');
          setPickup(shortAddress);
        } else {
          // Fallback to Google Maps Link if address fails
          setPickup(`https://maps.google.com/?q=${latitude},${longitude}`);
        }
      } catch (error) {
        // Fallback to coordinates if API fails
        setPickup(`${latitude}, ${longitude}`);
      }
      setLocationLoading(false);
    }, () => {
      alert("Unable to retrieve location. Please check your browser permissions.");
      setLocationLoading(false);
    });
  };
  // -------------------------------------------

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.target);

    // GENERATE UNIQUE ID
    const uniqueID = `Web-${Date.now()}`;

    const bookingData = {
      "Date": date,
      "Time": formData.get('time'),
      "Guest_name": formData.get('name'),
      "Email": formData.get('email'),
      "Pickup": pickup, // Use the state variable here
      "Drop_off": destination,
      "Flight": formData.get('flight') || "N/A",
      "Source": uniqueID, 
      "Agency": "",
      "Car_type": carType,
      "Driver": "",
      "Driver_number": "",
      "Status": "Pending",
      "Price": price,
      "Payment": paymentMethod
    };

    try {
      await fetch(SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        body: JSON.stringify({ data: [bookingData] })
      });
      onBookingSuccess(bookingData);
    } catch (e) { alert("Submission failed."); }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-slate-900 p-8 rounded-[3rem] border-t-8 border-amber-500 shadow-2xl space-y-4">
      <input name="name" required placeholder="Guest Name" className="w-full p-4 bg-slate-800 rounded-xl text-white outline-none text-xs" />
      <input name="email" required type="email" placeholder="Email Address" className="w-full p-4 bg-slate-800 rounded-xl text-white outline-none text-xs" />
      
      <div className="grid grid-cols-2 gap-4">
        {/* MODIFIED PICKUP INPUT WITH LIVE LOCATION BUTTON */}
        <div className="relative">
          <input 
            name="pickup" 
            value={pickup}
            onChange={(e) => setPickup(e.target.value)}
            required 
            placeholder="Pickup Location" 
            className="w-full p-4 bg-slate-800 rounded-xl text-white outline-none text-xs pr-10" // added padding-right
          />
          <button 
            type="button" 
            onClick={handleGetLocation}
            disabled={locationLoading}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-amber-500 hover:text-white transition-colors"
            title="Use Current Location"
          >
            {locationLoading ? <Loader2 className="animate-spin" size={16} /> : <MapPin size={18} />}
          </button>
        </div>
        {/* END MODIFICATION */}

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
      
      <div className="grid grid-cols-2 gap-4">
        <select value={carType} onChange={e => setCarType(e.target.value)} className="p-4 bg-slate-800 text-white rounded-xl text-xs">
          {FLEET_DATA.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
        </select>
        <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)} className="p-4 bg-slate-800 text-white rounded-xl text-xs">
          <option value="Cash">Cash</option>
          <option value="Card">Card (+5%)</option>
        </select>
      </div>

      <button type="submit" disabled={loading} className="w-full bg-amber-500 text-slate-900 py-5 rounded-2xl font-black uppercase text-xs">
        {loading ? "Confirming..." : "Confirm Booking"}
      </button>
      
      {price > 0 && <div className="text-center text-3xl font-black text-amber-500 italic mt-2 uppercase">AED {price}</div>}
    </form>
  );
}