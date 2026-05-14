import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell 
} from 'recharts';

const Dashboard = () => {
  const [stats, setStats] = useState({
    falseToday: 0,
    misleadingToday: 0,
    topTopic: 'None',
    protectedCount: 0,
    chartData: [],
    allClaims: [] // Store everything
  });
  const [loading, setLoading] = useState(true);
  const [selectedClaim, setSelectedClaim] = useState(null); // For modal detail view

  const fetchStats = async () => {
    try {
      // Fetch ALL claims to calculate all stats from one source of truth
      const { data: allClaims, error: err } = await supabase
        .from('claims')
        .select('*')
        .order('created_at', { ascending: false });

      if (err) throw err;
      if (!allClaims || allClaims.length === 0) {
        setLoading(false);
        return;
      }

      const now = new Date();
      const todayStart = new Date(now.setHours(0, 0, 0, 0));
      const lastWeekStart = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

      // 1. Calculate Today's Stats (Proper Date Comparison)
      const todayClaims = allClaims.filter(c => new Date(c.created_at) >= todayStart);
      const falseToday = todayClaims.filter(c => c.verdict?.toUpperCase() === 'FALSE').length;
      const misleadingToday = todayClaims.filter(c => c.verdict?.toUpperCase() === 'MISLEADING').length;

      // 2. Calculate Top Topics (From all time or last week)
      const topicMap = {};
      allClaims.forEach(c => {
        if (!c.topic || c.topic === 'N/A') return;
        const t = c.topic.toLowerCase().trim();
        topicMap[t] = (topicMap[t] || 0) + 1;
      });

      const chartData = Object.entries(topicMap)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      const topTopic = chartData[0]?.name || 'N/A';

      // 3. Calculate Global Protection (All time)
      const totalFalseOrMisleading = allClaims.filter(c => 
        ['FALSE', 'MISLEADING'].includes(c.verdict?.toUpperCase())
      ).length;

      setStats({
        falseToday,
        misleadingToday,
        topTopic,
        protectedCount: totalFalseOrMisleading * 230,
        chartData,
        allClaims
      });
    } catch (error) {
      console.error("Dashboard Fetch Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchStats, 30000);
    // Cleanup to prevent memory leaks
    return () => clearInterval(interval);
  }, []);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-600 border-t-transparent"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8 space-y-10 max-w-7xl mx-auto pb-20">
      {/* Header */}
      <header className="space-y-1">
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Global Impact Dashboard</h1>
        <p className="text-sm text-gray-500 font-bold uppercase tracking-widest">Real-time misinformation tracking</p>
      </header>

      {/* SECTION 1: Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="False Claims Today" value={stats.falseToday} color="text-red-600" icon="🔴" />
        <StatCard title="Misleading Today" value={stats.misleadingToday} color="text-orange-500" icon="🟠" />
        <StatCard title="Most Common Topic" value={stats.topTopic} color="text-blue-600" icon="🏷️" />
        <StatCard 
          title="Global Impact" 
          value={stats.protectedCount.toLocaleString()} 
          color="text-green-600" 
          icon="🛡️" 
          footer="Est. impact: 230 people protected for every false claim caught."
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* SECTION 2: Recharts Bar Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <h3 className="text-lg font-black text-gray-800 mb-6 uppercase tracking-tight">Top Misinformation Topics This Week</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fontWeight: 'bold', fill: '#9ca3af' }} 
                />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
                <Tooltip 
                  cursor={{ fill: '#f9fafb' }}
                  contentStyle={{ borderRadius: '15px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="count" radius={[10, 10, 0, 0]} barSize={50}>
                  {stats.chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#dc2626' : '#ea580c'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Info Card */}
        <div className="bg-green-600 rounded-3xl p-8 text-white flex flex-col justify-center space-y-4">
          <h2 className="text-3xl font-black leading-tight">Fighting the climate infodemic.</h2>
          <p className="opacity-90 font-medium">
            TruthLeaf uses real-time historical weather data and global news to debunk false claims before they go viral.
          </p>
          <div className="pt-4">
            <div className="text-4xl font-black">100%</div>
            <div className="text-xs font-bold uppercase tracking-widest opacity-70">Evidence Based</div>
          </div>
        </div>
      </div>

      {/* SECTION 3: Historical Fact Checks */}
      <div className="space-y-8">
        <h3 className="text-xl font-black text-gray-800 uppercase tracking-tight flex items-center gap-2">
          Fact Check History <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
        </h3>
        
        {/* Monthly Groups */}
        {renderMonthlyGroups(stats.allClaims, setSelectedClaim)}
      </div>

      {/* Detail Modal */}
      {selectedClaim && (
        <DetailModal claim={selectedClaim} onClose={() => setSelectedClaim(null)} />
      )}
    </div>
  );
};

// Helper to group and render by month
const renderMonthlyGroups = (claims, onSelect) => {
  const now = new Date();
  const thisMonth = now.getMonth();
  const thisYear = now.getFullYear();
  
  const groups = {
    'This Month': [],
    'Previous Month': [],
    'Earlier': []
  };

  claims.forEach(claim => {
    const d = new Date(claim.created_at);
    const m = d.getMonth();
    const y = d.getFullYear();

    if (y === thisYear && m === thisMonth) {
      groups['This Month'].push(claim);
    } else if (y === thisYear && m === thisMonth - 1) {
      groups['Previous Month'].push(claim);
    } else if (y === thisYear - 1 && thisMonth === 0 && m === 11) {
       groups['Previous Month'].push(claim); // December of last year
    } else {
      groups['Earlier'].push(claim);
    }
  });

  return Object.entries(groups).map(([name, items]) => (
    items.length > 0 && (
      <div key={name} className="space-y-4">
        <div className="flex items-center gap-4">
          <span className="text-xs font-black uppercase tracking-widest text-gray-400 whitespace-nowrap">{name}</span>
          <div className="h-px w-full bg-gray-100"></div>
        </div>
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50/50 text-[10px] font-black uppercase tracking-widest text-gray-400">
                <tr>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Verdict</th>
                  <th className="px-6 py-4">Topic</th>
                  <th className="px-6 py-4">Score</th>
                  <th className="px-6 py-4">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {items.map((claim, i) => (
                  <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 text-xs font-bold text-gray-500">
                      {new Date(claim.created_at).toLocaleDateString(undefined, { day: '2-digit', month: 'short' })}
                    </td>
                    <td className="px-6 py-4">
                      <VerdictBadge verdict={claim.verdict} />
                    </td>
                    <td className="px-6 py-4 text-sm font-black text-gray-700 capitalize">
                      {claim.topic}
                    </td>
                    <td className="px-6 py-4 text-xs font-black text-red-600">
                      {claim.fake_percentage}%
                    </td>
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => onSelect(claim)}
                        className="text-[10px] font-black uppercase tracking-widest text-green-600 hover:text-green-800 transition-colors"
                      >
                        View Proof →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    )
  ));
};

const DetailModal = ({ claim, onClose }) => (
  <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
    <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={onClose}></div>
    <div className="relative bg-white w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
      <div className="p-8 space-y-8">
        <div className="flex justify-between items-center">
          <VerdictBadge verdict={claim.verdict} />
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-widest text-red-500">Original Claim (Fake)</label>
            <div className="p-5 bg-red-50 rounded-3xl border border-red-100 text-sm font-medium text-red-900 italic">
              "{claim.claim_text}"
            </div>
          </div>
          
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-widest text-green-600">Verified Truth (Real)</label>
            <div className="p-5 bg-green-50 rounded-3xl border border-green-100 text-sm font-bold text-green-900">
              {claim.real_version}
            </div>
          </div>
        </div>

        <div className="space-y-6 pt-6 border-t border-gray-100">
          <div className="space-y-2">
            <h4 className="text-xs font-black uppercase tracking-widest text-gray-400">Scientific Evidence</h4>
            <p className="text-sm text-gray-600 leading-relaxed">{claim.climate_evidence}</p>
          </div>
          <div className="space-y-2">
            <h4 className="text-xs font-black uppercase tracking-widest text-gray-400">News Reports Found</h4>
            <p className="text-sm text-gray-600 leading-relaxed">{claim.news_evidence}</p>
          </div>
        </div>

        <button 
          onClick={onClose}
          className="w-full bg-gray-900 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-gray-800 transition-all"
        >
          Close Report
        </button>
      </div>
    </div>
  </div>
);

const StatCard = ({ title, value, color, icon, footer }) => (
  <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-2">
    <div className="flex justify-between items-start">
      <span className="text-2xl">{icon}</span>
      <span className={`text-3xl font-black ${color}`}>{value}</span>
    </div>
    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{title}</p>
    {footer && <p className="text-[9px] text-gray-400 italic pt-2 border-t border-gray-50">{footer}</p>}
  </div>
);

const VerdictBadge = ({ verdict }) => {
  const colors = {
    TRUE: 'bg-green-100 text-green-700',
    FALSE: 'bg-red-100 text-red-700',
    MISLEADING: 'bg-orange-100 text-orange-700',
    UNVERIFIABLE: 'bg-gray-100 text-gray-700'
  };
  return (
    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${colors[verdict] || colors.UNVERIFIABLE}`}>
      {verdict}
    </span>
  );
};

export default Dashboard;
