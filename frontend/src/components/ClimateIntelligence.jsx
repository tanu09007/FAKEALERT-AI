import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ClimateIntelligence = () => {
  const [weather, setWeather] = useState(null);
  const [alert, setAlert] = useState(null);
  const [indiaAlerts, setIndiaAlerts] = useState([]);
  const [hazards, setHazards] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [wRes, aRes, hRes, nRes] = await Promise.all([
          axios.get('http://localhost:5000/api/weather'),
          axios.get('http://localhost:5000/api/alerts'),
          axios.get('http://localhost:5000/api/disasters'),
          axios.get('http://localhost:5000/api/india-alerts')
        ]);
        setWeather(wRes.data);
        setAlert(aRes.data);
        setHazards(hRes.data);
        setIndiaAlerts(nRes.data);
      } catch (err) {
        console.error("Intelligence Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 300000); // Auto-refresh every 5 minutes
    return () => clearInterval(interval);
  }, []);

  if (loading) return null;

  return (
    <div className="space-y-6 w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* 1. IMD WARNING BANNER */}
      {alert && (
        <div className={`p-4 rounded-2xl border flex items-center gap-4 ${
          alert.level === 'Red' ? 'bg-red-50 border-red-200 text-red-800' : 
          alert.level === 'Orange' ? 'bg-orange-50 border-orange-200 text-orange-800' : 
          'bg-yellow-50 border-yellow-200 text-yellow-800'
        }`}>
          <div className="text-2xl">⚠️</div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-black uppercase tracking-widest text-[10px]">IMD {alert.level} ALERT</span>
              <span className="h-1 w-1 rounded-full bg-current opacity-30"></span>
              <span className="text-xs font-bold">{alert.source}</span>
            </div>
            <p className="text-sm font-black mt-1">{alert.advisory}</p>
            <div className="flex gap-2 mt-2">
              {alert.districts.map(d => (
                <span key={d} className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-white/50 border border-current/10 capitalize">
                  {d}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 2. OPEN-METEO DISPLAY CARDS */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase tracking-[0.2em] text-gray-400">Live Atmosphere:</span>
            <span className="text-xs font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded-full border border-green-100">
              {weather?.location || 'Chennai, India'}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Dynamic Sync</span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <WeatherCard 
            label="Temperature" 
            value={weather?.current?.temperature_2m !== undefined ? `${weather.current.temperature_2m}°C` : '--°C'} 
            sub={weather?.current?.temperature_2m !== undefined ? `Feels like ${Math.round(weather.current.temperature_2m + 2)}°C` : 'Loading...'}
            icon="🌡️"
            color="text-orange-600"
          />
        <WeatherCard 
          label="Precipitation" 
          value={weather?.current?.precipitation !== undefined ? `${weather.current.precipitation}mm` : '--mm'} 
          sub="Current rainfall"
          icon="🌧️"
          color="text-blue-600"
        />
        <WeatherCard 
          label="Wind Speed" 
          value={weather?.current?.wind_speed_10m !== undefined ? `${weather.current.wind_speed_10m} km/h` : '-- km/h'} 
          sub="Surface wind"
          icon="🌬️"
          color="text-gray-600"
        />
        </div>
      </div>

      {/* 3. HAZARD & INDIA FEED */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* GDACS */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">Global Hazards</h3>
            <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">GDACS Live</span>
          </div>
          <div className="space-y-3">
            {hazards.map((h, i) => (
              <a 
                key={i} 
                href={h.link} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${
                    h.severity === 'Red' ? 'bg-red-500' : 
                    h.severity === 'Orange' ? 'bg-orange-500' : 'bg-green-500'
                  }`}></div>
                  <div className="space-y-0.5">
                    <p className="text-[11px] font-black text-gray-800 capitalize leading-tight">{h.type.replace(/_/g, ' ')}: {h.location}</p>
                    <p className="text-[9px] text-gray-400 font-bold uppercase">{new Date(h.date).toLocaleDateString()}</p>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* INDIA ALERTS */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">Instant Alerts</h3>
            <span className="text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">India & TN</span>
          </div>
          <div className="space-y-3">
            {indiaAlerts.slice(0, 6).map((a, i) => (
              <div key={i} className={`p-3 rounded-xl border space-y-1 ${
                a.state.toLowerCase() === 'tamil nadu' ? 'bg-green-50/50 border-green-100' : 'bg-gray-50/50 border-gray-50'
              }`}>
                <div className="flex justify-between items-start">
                  <div className="space-y-0.5">
                    <p className="text-[11px] font-black text-gray-800 leading-tight">{a.district}, {a.state}</p>
                    <p className="text-[10px] font-bold text-gray-600 leading-tight">{a.level}</p>
                  </div>
                  {a.state.toLowerCase() === 'tamil nadu' && (
                    <span className="text-[8px] font-black bg-green-600 text-white px-1.5 py-0.5 rounded uppercase tracking-tighter">
                      Priority
                    </span>
                  )}
                </div>
                <p className="text-[9px] text-gray-500 font-medium leading-tight line-clamp-2">{a.description}</p>
              </div>
            ))}
            {indiaAlerts.length === 0 && (
              <p className="text-[10px] text-gray-400 text-center py-4 italic font-medium">No active alerts for India</p>
            )}
          </div>
        </div>
      </div>

    </div>
  );
};

const WeatherCard = ({ label, value, sub, icon, color }) => (
  <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex justify-between items-start mb-4">
      <span className="text-2xl">{icon}</span>
      <span className={`text-xl font-black ${color}`}>{value}</span>
    </div>
    <div className="space-y-0.5">
      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">{label}</p>
      <p className="text-[9px] font-bold text-gray-500">{sub}</p>
    </div>
  </div>
);

export default ClimateIntelligence;
