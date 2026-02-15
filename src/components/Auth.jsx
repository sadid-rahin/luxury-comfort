// LOCATION: src/components/Auth.jsx
import React, { useState } from 'react';

// 🔴 CRITICAL FIX: The ".." tells it to go UP one folder to find firebase.js
import { auth } from '../firebase'; 
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';

export default function Auth({ onAuthSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      let userCredential;
      if (isLogin) {
        userCredential = await signInWithEmailAndPassword(auth, email, password);
      } else {
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
      }

      const user = userCredential.user;
      if (user && onAuthSuccess) {
        onAuthSuccess();
      }
    } catch (err) {
      console.error("Auth Error:", err.code);
      if (err.code === 'auth/email-already-in-use') {
        setError("This host email is already registered.");
      } else if (err.code === 'auth/weak-password') {
        setError("Password must be at least 6 characters.");
      } else if (err.code === 'auth/invalid-credential') {
        setError("Invalid email or password.");
      } else {
        setError(err.message);
      }
    }
  };

  return (
    <div className="bg-slate-900 p-8 rounded-[3rem] border border-slate-800 shadow-2xl max-w-md mx-auto mt-10">
      <h2 className="text-2xl font-black uppercase italic text-amber-500 mb-6 text-center">
        {isLogin ? 'Host Login' : 'Host Registration'}
      </h2>
      
      {error && (
        <div className="bg-red-500/10 border border-red-500 text-red-500 text-[10px] font-bold p-3 rounded-xl mb-4 text-center uppercase tracking-widest">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <label className="text-[9px] font-black uppercase text-slate-500 ml-2">Host Email</label>
          <input 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            placeholder="email@example.com" 
            className="w-full p-4 bg-slate-800 text-white rounded-xl outline-none border-b-2 border-slate-700 focus:border-amber-500 text-xs transition-all" 
            required 
          />
        </div>

        <div className="space-y-1">
          <label className="text-[9px] font-black uppercase text-slate-500 ml-2">Secure Password</label>
          <input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            placeholder="••••••••" 
            className="w-full p-4 bg-slate-800 text-white rounded-xl outline-none border-b-2 border-slate-700 focus:border-amber-500 text-xs transition-all" 
            required 
          />
        </div>

        <button type="submit" className="w-full bg-amber-500 text-slate-900 py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-white transition-all text-xs shadow-xl mt-4">
          {isLogin ? 'Enter Host Terminal' : 'Create Host Account'}
        </button>
      </form>

      <button 
        onClick={() => { setIsLogin(!isLogin); setError(''); }} 
        className="w-full mt-6 text-[10px] uppercase font-black text-slate-500 hover:text-amber-500 transition-colors tracking-widest"
      >
        {isLogin ? "Request New Host Access?" : "Already Have Access? Login"}
      </button>
    </div>
  );
}