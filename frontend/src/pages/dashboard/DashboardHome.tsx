import { useEffect, useState } from 'react';
import { ListTodo, TrendingUp, CheckCircle, Clock, Users, AlertTriangle, ArrowUpRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, Cell } from 'recharts';
import api from '../../api';

export default function DashboardHome() {
  const [stats, setStats] = useState<any>(null);
  const [trendData, setTrendData] = useState<any[]>([]);
  const [verticalStats, setVerticalStats] = useState<any[]>([]);
  const [fetching, setFetching] = useState(true);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/stats/dashboard');
        setStats(res.data.stats);
        setTrendData(res.data.trendData);
        setVerticalStats(res.data.verticalStats);
      } catch (err) {
        console.error(err);
      } finally {
        setFetching(false);
      }
    };
    fetchStats();
  }, []);

  if (fetching) return <div className="p-6 md:p-8 text-gray-500 font-bold uppercase tracking-widest text-[10px] animate-pulse">Syncing Global Intelligence...</div>;

  const cardData = [
    { title: 'Total Tasks', value: stats?.total_tasks || 0, icon: ListTodo, color: 'text-primary', bg: 'bg-primary/5' },
    { title: 'In Progress', value: stats?.in_progress || 0, icon: TrendingUp, color: 'text-yellow-400', bg: 'bg-yellow-400/5' },
    { title: 'Completed', value: stats?.completed || 0, icon: CheckCircle, color: 'text-secondary', bg: 'bg-secondary/5' },
    { title: 'Rework Required', value: stats?.pending_rework || 0, icon: AlertTriangle, color: 'text-danger', bg: 'bg-danger/5' },
  ];

  return (
    <div className="p-4 md:p-8 space-y-6 md:space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tighter">Enterprise Overview</h1>
          <p className="text-gray-500 text-[9px] md:text-[10px] uppercase font-bold tracking-[0.4em] mt-1.5 md:mt-2 opacity-60">System Intelligence & Global Analytics</p>
        </div>
        <div className="flex gap-2 text-[9px] md:text-[10px] font-black uppercase tracking-widest text-gray-500 bg-surface border border-border px-4 py-2 rounded-xl">
             <span className="text-primary animate-pulse">Live</span> • Sync OK
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {cardData.map((card, i) => (
          <div key={i} className={`p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border border-border bg-surface hover:border-primary/20 transition-all group relative overflow-hidden shadow-2xl`}>
             <div className="flex justify-between items-start relative z-10">
                <div>
                   <p className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">{card.title}</p>
                   <h3 className="text-3xl md:text-4xl font-black text-white tracking-tighter">{card.value}</h3>
                </div>
                <div className={`${card.bg} ${card.color} p-3 md:p-4 rounded-xl md:rounded-2xl group-hover:scale-110 transition-transform`}>
                   <card.icon size={20} />
                </div>
             </div>
             <div className="absolute -bottom-4 -right-4 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity">
                <card.icon size={100} />
             </div>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
        
        {/* Trend Area Chart */}
        <div className="bg-surface border border-border rounded-[2rem] md:rounded-[3rem] p-6 md:p-10 shadow-2xl overflow-hidden">
           <div className="flex justify-between items-center mb-6 md:mb-10">
              <h4 className="text-white font-black uppercase tracking-widest text-[10px] md:text-xs">Production Velocity</h4>
              <ArrowUpRight className="text-secondary" />
           </div>
           <div className="h-[250px] md:h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={trendData}>
                    <defs>
                       <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                       </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                    <XAxis dataKey="label" stroke="#4b5563" fontSize={9} axisLine={false} tickLine={false} />
                    <YAxis stroke="#4b5563" fontSize={9} axisLine={false} tickLine={false} />
                    <Tooltip 
                       contentStyle={{ background: '#0a0a1a', border: '1px solid #ffffff10', borderRadius: '15px' }}
                       itemStyle={{ color: '#10b981', fontWeight: 'bold' }}
                    />
                    <Area type="monotone" dataKey="count" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorCount)" />
                 </AreaChart>
              </ResponsiveContainer>
           </div>
        </div>

        {/* Vertical Bar Chart (Admin Only) or Info Card */}
        {user.role === 'GLOBAL_ADMIN' ? (
            <div className="bg-surface border border-border rounded-[2rem] md:rounded-[3rem] p-6 md:p-10 shadow-2xl overflow-hidden">
                 <div className="flex justify-between items-center mb-6 md:mb-10">
                    <h4 className="text-white font-black uppercase tracking-widest text-[10px] md:text-xs">Departmental Map</h4>
                    <Users className="text-primary" />
                 </div>
                 <div className="h-[250px] md:h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                       <BarChart data={verticalStats}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                          <XAxis dataKey="name" stroke="#4b5563" fontSize={8} axisLine={false} tickLine={false} interval={0} angle={-25} textAnchor="end" height={50} />
                          <YAxis stroke="#4b5563" fontSize={9} axisLine={false} tickLine={false} />
                          <Tooltip 
                             cursor={{fill: '#ffffff05'}}
                             contentStyle={{ background: '#0a0a1a', border: '1px solid #ffffff10', borderRadius: '15px' }}
                             itemStyle={{ color: '#6366f1', fontWeight: 'bold' }}
                          />
                           <Bar dataKey="count" fill="#6366f1" radius={[6, 6, 0, 0]}>
                             {verticalStats.map((_, index) => (
                                <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#6366f1' : '#818cf8'} />
                             ))}
                          </Bar>
                       </BarChart>
                    </ResponsiveContainer>
                 </div>
            </div>
        ) : (
            <div className="bg-primary/5 border border-primary/20 rounded-[2rem] md:rounded-[3rem] p-8 md:p-12 flex flex-col justify-center items-center text-center space-y-4 md:space-y-6">
                <div className="w-16 h-16 md:w-20 md:h-20 bg-primary/20 rounded-full flex items-center justify-center text-primary">
                    <Clock size={32} />
                </div>
                <div>
                   <h3 className="text-white font-black text-xl md:text-2xl tracking-tight">Performance Tracking</h3>
                   <p className="text-gray-500 text-xs md:text-sm mt-2 max-w-xs md:max-w-sm">Keep track of your assigned tasks and production velocity to ensure organizational success.</p>
                </div>
            </div>
        )}
      </div>

      {/* Footer Banner */}
      <div className="bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10 border border-white/5 rounded-[2rem] p-6 md:p-10 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 md:gap-6 text-center sm:text-left">
              <div className="bg-surface p-3 rounded-2xl border border-border shadow-2xl hidden xs:block">
                  <TrendingUp size={24} className="text-primary" />
              </div>
              <div>
                  <h4 className="text-white font-bold text-sm md:text-base">Internal Operations Monitor</h4>
                  <p className="text-gray-500 text-[10px] md:text-xs">Proprietary workforce management system.</p>
              </div>
          </div>
          <button className="bg-white text-black px-8 h-12 rounded-xl md:rounded-2xl font-black uppercase tracking-widest text-[9px] md:text-[10px] hover:scale-105 transition-transform shadow-2xl whitespace-nowrap">Status Check</button>
      </div>
    </div>
  );
}
