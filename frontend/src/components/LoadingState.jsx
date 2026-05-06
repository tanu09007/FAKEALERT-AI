import React, { useState, useEffect } from 'react';

const messages = [
  "Reading the claim...",
  "Fetching real climate data...",
  "Cross-checking with news sources...",
  "Comparing with real evidence...",
  "Calculating fake percentage..."
];

const LoadingState = () => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % messages.length);
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center p-12 space-y-6">
      {/* Animated Spinner */}
      <div className="relative w-20 h-20">
        <div className="absolute inset-0 border-4 border-green-100 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-green-600 rounded-full border-t-transparent animate-spin"></div>
      </div>
      
      <div className="text-center space-y-2">
        <h3 className="text-xl font-bold text-gray-800 animate-pulse">
          {messages[index]}
        </h3>
        <p className="text-sm text-gray-500">
          Our AI is verifying this against real-world evidence.
        </p>
      </div>
    </div>
  );
};

export default LoadingState;
