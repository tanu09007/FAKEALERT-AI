import React from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';

function App() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans flex flex-col">
      
      {/* Global Navigation Bar */}
      <nav className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-100 py-4 px-8 flex justify-between items-center sticky top-0 z-50">
        <Link to="/" className="text-2xl font-black text-green-800 tracking-tighter flex items-center gap-2">
          TruthLeaf <span className="text-green-500 text-lg">🌿</span>
        </Link>
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
          <Link 
            to="/" 
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              location.pathname === '/' ? 'bg-white text-green-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Fact Check
          </Link>
          <Link 
            to="/dashboard" 
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              location.pathname === '/dashboard' ? 'bg-white text-green-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Live Dashboard
          </Link>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </main>

      {/* Global Toast Notification Container */}
      <Toaster 
        position="bottom-center"
        toastOptions={{
          className: 'font-bold text-sm',
          duration: 4000,
          style: {
            background: '#166534',
            color: '#fff',
            borderRadius: '16px',
            padding: '12px 20px',
          },
        }} 
      />
      
    </div>
  );
}

export default App;
