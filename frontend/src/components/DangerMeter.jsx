import React from 'react';

const DangerMeter = ({ fake_percentage, fake_breakdown }) => {
  // Determine color and label based on percentage
  const getColor = () => {
    if (fake_percentage <= 30) return { stroke: '#16a34a', text: 'text-green-600', label: 'Low Risk' };
    if (fake_percentage <= 60) return { stroke: '#ea580c', text: 'text-orange-600', label: 'Medium Risk' };
    return { stroke: '#dc2626', text: 'text-red-600', label: 'High Danger', pulse: 'animate-pulse' };
  };

  const theme = getColor();
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (fake_percentage / 100) * circumference;

  return (
    <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm space-y-8">
      {/* A) Circular Progress Ring */}
      <div className="flex flex-col items-center justify-center relative">
        <svg className="w-48 h-48 transform -rotate-90">
          <circle
            cx="96" cy="96" r={radius}
            stroke="currentColor" strokeWidth="12" fill="transparent"
            className="text-gray-100"
          />
          <circle
            cx="96" cy="96" r={radius}
            stroke={theme.stroke} strokeWidth="12" fill="transparent"
            strokeDasharray={circumference}
            style={{ 
              strokeDashoffset: offset,
              transition: 'stroke-dashoffset 1.5s ease-in-out'
            }}
            className={`transition-all duration-1000 ${theme.pulse || ''}`}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-4xl font-black ${theme.text}`}>
            {fake_percentage}%
          </span>
          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
            FAKE
          </span>
        </div>
        <div className={`mt-4 px-4 py-1 rounded-full text-xs font-black uppercase tracking-tighter text-white ${theme.text.replace('text', 'bg')}`}>
          {theme.label}
        </div>
      </div>

      {/* B) Breakdown Bars */}
      <div className="space-y-4">
        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Detection Breakdown</h4>
        <div className="grid grid-cols-1 gap-3">
          <ScoreBar label="Climate Data" score={fake_breakdown?.climate_data_contradiction || 0} max={40} color="bg-blue-500" />
          <ScoreBar label="News Sources" score={fake_breakdown?.news_contradiction || 0} max={30} color="bg-indigo-500" />
          <ScoreBar label="Language" score={fake_breakdown?.emotional_language || 0} max={20} color="bg-purple-500" />
          <ScoreBar label="Source" score={fake_breakdown?.source_credibility || 0} max={10} color="bg-pink-500" />
        </div>
      </div>
    </div>
  );
};

const ScoreBar = ({ label, score, max, color }) => {
  const percent = (score / max) * 100;
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-[10px] font-bold uppercase text-gray-500">
        <span>{label}</span>
        <span>{score}/{max}</span>
      </div>
      <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
        <div 
          className={`h-full ${color} transition-all duration-1000`} 
          style={{ width: `${percent}%` }}
        ></div>
      </div>
    </div>
  );
};

export default DangerMeter;
