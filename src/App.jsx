import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './components/Home'; 
import HostPanel from './components/HostPanel';


// You can add a simple protection check here
const ProtectedRoute = ({ children }) => {
  // In a real app, you'd check Firebase auth state here
  // For now, we will allow the redirect from Home.jsx to work
  return children;
};

function App() {
  return (
    <Router>
      <div className="app-container">
        <Routes>
          {/* Main Booking Page */}
          <Route path="/" element={<Home />} />

          {/* Host Management Panel */}
          <Route 
            path="/host" 
            element={
              <ProtectedRoute>
                <HostPanel />
              </ProtectedRoute>
            } 
          />

          {/* Redirect any unknown paths back to Home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;