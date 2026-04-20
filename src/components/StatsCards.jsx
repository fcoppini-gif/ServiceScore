import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Users, UserCheck, Heart, TrendingUp, Target, DollarSign } from 'lucide-react';

export default function StatsCards() {
  const [stats, setStats] = useState({
    clubs: 0,
    soci: 0,
    officers: 0,
    activities: 0,
    persone: 0,
    fondi: 0,
    volontari: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    const [{ data: clubs }, { data: soci }, { data: officers }, { data: activities }] = await Promise.all([
      supabase.from('club').select('id', { count: 'exact', head: true }),
      supabase.from('soci').select('id', { count: 'exact', head: true }),
      supabase.from('officer').select('id', { count: 'exact', head: true }),
      supabase.from('service_activities').select('*'),
    ]);

    const persone = activities?.reduce((sum, a) => sum + (a.persone_servite || 0), 0) || 0;
    const fondi = activities?.reduce((sum, a) => sum + (a.fondi_donati || 0), 0) || 0;
    const volontari = activities?.reduce((sum, a) => sum + (a.totale_volontari || 0), 0) || 0;

    setStats({
      clubs: clubs?.length || 0,
      soci: soci?.length || 0,
      officers: officers?.length || 0,
      activities: activities?.length || 0,
      persone,
      fondi,
      volontari,
    });
    setLoading(false);
  };

  const cards = [
    { label: 'Club', value: stats.clubs, icon: Target, color: 'from-blue-500 to-blue-600', bg: 'bg-blue-500' },
    { label: 'Soci', value: stats.soci, icon: Users, color: 'from-emerald-500 to-emerald-600', bg: 'bg-emerald-500' },
    { label: 'Officer', value: stats.officers, icon: UserCheck, color: 'from-violet-500 to-violet-600', bg: 'bg-violet-500' },
    { label: 'Attività', value: stats.activities, icon: Heart, color: 'from-rose-500 to-rose-600', bg: 'bg-rose-500' },
    { label: 'Persone Servite', value: stats.persone.toLocaleString(), icon: TrendingUp, color: 'from-amber-500 to-amber-600', bg: 'bg-amber-500' },
    { label: 'Fondi Donati', value: `€${stats.fondi.toLocaleString()}`, icon: DollarSign, color: 'from-cyan-500 to-cyan-600', bg: 'bg-cyan-500' },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-24 bg-slate-200 dark:bg-white/5 animate-pulse rounded-2xl"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {cards.map((card, i) => (
        <div
          key={i}
          className="group relative overflow-hidden bg-white dark:bg-brand-dark rounded-2xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-slate-100 dark:border-white/5"
        >
          <div className={`absolute top-0 right-0 w-20 h-20 ${card.bg} opacity-10 rounded-bl-full -mr-4 -mt-4`}></div>
          <div className={`w-10 h-10 ${card.bg} rounded-xl flex items-center justify-center mb-3 shadow-lg`}>
            <card.icon className="text-white" size={20} />
          </div>
          <div className="text-2xl font-black text-slate-800 dark:text-white">{card.value}</div>
          <div className="text-xs font-bold uppercase text-slate-400">{card.label}</div>
        </div>
      ))}
    </div>
  );
}