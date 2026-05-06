import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Temporary placeholders to prevent the app from crashing until we build the pages
const HomePlaceholder = () => <div className="p-8 text-center text-xl mt-20">Home Page (Coming Soon)</div>;
const DashboardPlaceholder = () => <div className="p-8 text-center text-xl mt-20">Live Dashboard (Coming Soon)</div>;

function App() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans flex flex-col">
      
      {/* Global Navigation Bar */}
      <nav className="bg-white shadow-sm border-b py-4 px-8 flex justify-between items-center sticky top-0 z-50">
        <Link to="/" className="text-2xl font-bold text-green-700 tracking-tight">
          TruthLeaf
        </Link>
        <div className="space-x-6">
          <Link to="/" className="text-gray-600 hover:text-green-600 font-medium transition-colors">
            Fact Check
          </Link>
          <Link to="/dashboard" className="text-gray-600 hover:text-green-600 font-medium transition-colors">
            Live Dashboard
          </Link>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto">
        <Routes>
          <Route path="/" element={<HomePlaceholder />} />
          <Route path="/dashboard" element={<DashboardPlaceholder />} />
        </Routes>
      </main>

      {/* Global Toast Notification Container */}
      <Toaster 
        position="bottom-center"
        toastOptions={{
          style: {
            background: '#333',
            color: '#fff',
            borderRadius: '8px',
          },
        }} 
      />
      
    </div>
  );
}

export default App;
