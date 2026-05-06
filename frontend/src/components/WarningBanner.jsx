import React, { useState } from 'react';

const WarningBanner = ({ verdict }) => {
  const [dismissed, setDismissed] = useState(false);
  const isDangerous = verdict === 'FALSE' || verdict === 'MISLEADING';

  if (!isDangerous || dismissed) return null;

  const bgColor = verdict === 'FALSE' ? 'bg-red-600 border-red-800' : 'bg-orange-500 border-orange-700';

  return (
    <div className={`w-full ${bgColor} text-white p-4 shadow-xl border-b-4 rounded-2xl animate-in slide-in-from-top duration-500`}>
      <div className="flex items-center justify-center space-x-4 relative">
        <span className="text-3xl">⚠️</span>
        <div className="text-center">
          <h2 className="font-black text-lg tracking-tight uppercase">
            {verdict === 'FALSE' ? 'This is likely misinformation. Think before you share.' : 'This claim is misleading. Key context is missing.'}
          </h2>
          <p className="text-sm font-medium opacity-90">
            Sharing false climate information contributes to real world harm.
          </p>
        </div>
        <button 
          onClick={() => setDismissed(true)}
          className="absolute right-0 top-0 text-white/70 hover:text-white text-xl font-bold transition-colors"
          aria-label="Dismiss warning"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

export default WarningBanner;

