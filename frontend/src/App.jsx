import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Predict from './pages/Predict';
import HistoryLogs from './pages/History';
import Analytics from './pages/Analytics';
import Admin from './pages/Admin';

// Footer component for premium feel
const Footer = () => (
  <footer className="w-full py-6 mt-auto border-t border-slate-900 bg-slate-950/40 text-center text-xs text-slate-500 font-light">
    <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
      <span>© 2026 Crop Suggestion System. Intelligent Agricultural Assistance.</span>
      <div className="flex gap-4">
        <a href="#" className="hover:text-nature-400 transition-colors">Documentation</a>
        <a href="#" className="hover:text-nature-400 transition-colors">Privacy Policy</a>
        <a href="#" className="hover:text-nature-400 transition-colors">ML Model Info</a>
      </div>
    </div>
  </footer>
);

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="flex flex-col min-h-screen">
          {/* Global Navbar */}
          <Navbar />
          
          {/* Main Routing Container */}
          <main className="flex-1 flex flex-col">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              
              {/* Public / Optional auth route */}
              <Route path="/predict" element={<Predict />} />

              {/* Private Protected Routes */}
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/history" 
                element={
                  <ProtectedRoute>
                    <HistoryLogs />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/analytics" 
                element={
                  <ProtectedRoute>
                    <Analytics />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin" 
                element={
                  <ProtectedRoute adminOnly={true}>
                    <Admin />
                  </ProtectedRoute>
                } 
              />

              {/* Catch-all redirect */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          
          {/* Global Footer */}
          <Footer />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
