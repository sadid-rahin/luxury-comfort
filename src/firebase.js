// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAgurSheB6ZpwZVIwyQ0nmMutxAJbw5VmM",
  authDomain: "luxury-comfort-18.firebaseapp.com",
  projectId: "luxury-comfort-18",
  storageBucket: "luxury-comfort-18.firebasestorage.app",
  messagingSenderId: "723730102733",
  appId: "1:723730102733:web:e2a417319152a5d9026c84",
  measurementId: "G-YRZ8BTD5LB"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth
const auth = getAuth(app);

// 2. EXPORT auth so your Auth.jsx component can find it
export { auth };