// =============================================================================
// CLASSIFICA - Club Rankings based on activities
// =============================================================================
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, Medal, ArrowUp, ArrowDown, Minus, Filter, Heart, Users, DollarSign } from 'lucide-react';
import { supabase } from '../lib/supabase';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const METRICS = [
  { key: 'activities', label: 'Attività', icon: Heart },
  { key: 'persone', label: 'Persone Servite', icon: Users },
  { key: 'fondi', label: 'Fondi Donati', icon: DollarSign },
];

export default function ClassificaView({ isAdmin, userProfile, ThemeSwitcher }) {
  const navigate = useNavigate();
  const [rankings, setRankings] = useState([]);
  const [metric, setMetric] = useState('activities');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRankings();
  }, [metric]);

  const fetchRankings = async () => {
    setLoading(true);
    
    const { data: clubs } = await supabase.from('club').select('id, nome, zona, circoscrizione');
    const { data: activities } = await supabase.from('service_activities').select('*');
    
    const stats = {};
    clubs?.forEach(c => {
      stats[c.id] = { 
        club: c, 
        activities: 0, 
        persone: 0, 
        fondi: 0, 
        volontari: 0 
      };
    });
    
    activities?.forEach(a => {
      if (a.id_club && stats[a.id_club]) {
        stats[a.id_club].activities++;
        stats[a.id_club].persone += a.persone_servite || 0;
        stats[a.id_club].fondi += a.fondi_donati || 0;
        stats[a.id_club].volontari += a.totale_volontari || 0;
      }
    });
    
    let sorted = Object.values(stats).sort((a, b) => b[metric] - a[metric]);
    
    sorted = sorted.map((item, i) => ({
      ...item,
      rank: i + 1,
      change: 0 // Could track rank changes over time
    }));
    
    setRankings(sorted);
    setLoading(false);
  };

  const getMedal = (rank) => {
    if (rank === 1) return { icon: Trophy, color: 'text-yellow-500', bg: 'bg-yellow-100' };
    if (rank === 2) return { icon: Medal, color: 'text-slate-400', bg: 'bg-slate-100' };
    if (rank === 3) return { icon: Medal, color: 'text-amber-600', bg: 'bg-amber-100' };
    return null;
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#060D1F]">
      <Navbar isAdmin={isAdmin} userProfile={userProfile} ThemeSwitcher={ThemeSwitcher} />
      
      <div className="max-w-4xl mx-auto p-4 sm:p-8 pb-24 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black uppercase">Classifica Club</h1>
            <p className="text-slate-500">Ranking basato sulle attività di service</p>
          </div>
          <button onClick={() => navigate('/dashboard')} className="px-4 py-2 bg-slate-200 dark:bg-white/10 rounded-xl text-sm font-bold">
            Torna
          </button>
        </div>

        {/* Metric Selector */}
        <div className="flex gap-2 bg-white dark:bg-white/5 p-2 rounded-2xl">
          {METRICS.map(m => (
            <button
              key={m.key}
              onClick={() => setMetric(m.key)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold transition-all ${
                metric === m.key 
                  ? 'bg-brand-blue text-white shadow-lg' 
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10'
              }`}
            >
              <m.icon size={18} />
              <span className="hidden sm:inline">{m.label}</span>
            </button>
          ))}
        </div>

        {/* Top 3 Podium */}
        {rankings.length >= 3 && (
          <div className="flex justify-center items-end gap-4 pt-8">
            {/* 2nd */}
            <div className="text-center">
              <div className="w-20 h-20 mx-auto bg-slate-100 dark:bg-white/10 rounded-full flex items-center justify-center mb-2">
                <span className="text-2xl font-black text-slate-400">2</span>
              </div>
              <div className="font-bold text-sm truncate max-w-[120px]">{rankings[1].club.nome}</div>
              <div className="text-xs text-slate-500">{rankings[1][metric].toLocaleString()}</div>
            </div>
            {/* 1st */}
            <div className="text-center">
              <div className="w-24 h-24 mx-auto bg-yellow-100 dark:bg-yellow-500/20 rounded-full flex items-center justify-center mb-2 ring-4 ring-yellow-400">
                <Trophy className="text-yellow-500" size={36} />
              </div>
              <div className="font-black text-sm truncate max-w-[140px]">{rankings[0].club.nome}</div>
              <div className="text-xs text-yellow-600 font-bold">{rankings[0][metric].toLocaleString()}</div>
            </div>
            {/* 3rd */}
            <div className="text-center">
              <div className="w-20 h-20 mx-auto bg-amber-100 dark:bg-amber-500/20 rounded-full flex items-center justify-center mb-2">
                <span className="text-2xl font-black text-amber-600">3</span>
              </div>
              <div className="font-bold text-sm truncate max-w-[120px]">{rankings[2].club.nome}</div>
              <div className="text-xs text-slate-500">{rankings[2][metric].toLocaleString()}</div>
            </div>
          </div>
        )}

        {/* Full Rankings Table */}
        <div className="bg-white dark:bg-brand-dark rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-100 dark:bg-white/5">
              <tr>
                <th className="p-4 text-left font-black uppercase w-16">#</th>
                <th className="p-4 text-left font-black uppercase">Club</th>
                <th className="p-4 text-left font-black uppercase hidden md:table-cell">Zona</th>
                <th className="p-4 text-right font-black uppercase">Att.</th>
                <th className="p-4 text-right font-black uppercase">Persone</th>
                <th className="p-4 text-right font-black uppercase">Fondi €</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="p-8 text-center">Caricamento...</td></tr>
              ) : rankings.map((item, i) => {
                const medal = getMedal(item.rank);
                return (
                  <tr key={item.club.id} className="border-b border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5">
                    <td className="p-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black ${
                        medal ? medal.bg : 'bg-slate-100 dark:bg-white/10'
                      }`}>
                        {medal ? <medal.icon size={16} className={medal.color} /> : item.rank}
                      </div>
                    </td>
                    <td className="p-4 font-bold">{item.club.nome}</td>
                    <td className="p-4 text-slate-500 hidden md:table-cell">{item.club.zona}</td>
                    <td className="p-4 text-right">{item.activities}</td>
                    <td className="p-4 text-right">{item.persone.toLocaleString()}</td>
                    <td className="p-4 text-right font-bold text-brand-blue">{item.fondi.toLocaleString()}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <Footer />
    </div>
  );
}