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
    recentClaims: []
  });
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const lastWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

      // Query 1 & 2: Get claims from last 7 days to calculate everything locally (to save API calls)
      const { data: allRecent, error: err1 } = await supabase
        .from('claims')
        .select('verdict, created_at, topic')
        .gte('created_at', lastWeek.toISOString());

      if (err1) throw err1;

      // Filter Today's Stats
      const todayStr = today.toISOString().split('T')[0];
      const todayClaims = allRecent.filter(c => c.created_at.startsWith(todayStr));
      const falseToday = todayClaims.filter(c => c.verdict === 'FALSE').length;
      const misleadingToday = todayClaims.filter(c => c.verdict === 'MISLEADING').length;

      // Calculate Top Topics (Query 2)
      const topicMap = {};
      allRecent.forEach(c => {
        if (!c.topic) return;
        topicMap[c.topic] = (topicMap[c.topic] || 0) + 1;
      });

      const chartData = Object.entries(topicMap)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      const topTopic = chartData[0]?.name || 'N/A';

      // Query 3: Most Recent 10 Claims
      const { data: recentClaims, error: err3 } = await supabase
        .from('claims')
        .select('created_at, verdict, topic, fake_percentage')
        .order('created_at', { ascending: false })
        .limit(10);

      if (err3) throw err3;

      setStats({
        falseToday,
        misleadingToday,
        topTopic,
        protectedCount: (falseToday + misleadingToday) * 230,
        chartData,
        recentClaims
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
          title="Potentially Protected" 
          value={stats.protectedCount.toLocaleString()} 
          color="text-green-600" 
          icon="🛡️" 
          footer="Based on avg 230 shares per social media post"
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

      {/* SECTION 3: Recent Claims Table */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex justify-between items-center">
          <h3 className="text-lg font-black text-gray-800 uppercase tracking-tight">Recent Fact Checks</h3>
          <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50 text-[10px] font-black uppercase tracking-widest text-gray-400">
              <tr>
                <th className="px-6 py-4">Time</th>
                <th className="px-6 py-4">Verdict</th>
                <th className="px-6 py-4">Topic</th>
                <th className="px-6 py-4">Fake Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {stats.recentClaims.map((claim, i) => (
                <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 text-xs font-bold text-gray-500">
                    {new Date(claim.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="px-6 py-4">
                    <VerdictBadge verdict={claim.verdict} />
                  </td>
                  <td className="px-6 py-4 text-sm font-black text-gray-700 capitalize">
                    {claim.topic}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-black ${claim.fake_percentage > 50 ? 'text-red-600' : 'text-green-600'}`}>
                      {claim.fake_percentage}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

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
