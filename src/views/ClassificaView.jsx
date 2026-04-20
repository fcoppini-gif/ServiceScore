// =============================================================================
// CLASSIFICA - Premium Club Rankings with Scoring System
// =============================================================================
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Medal, Star, Filter, Heart, Users, DollarSign, Target, Zap, Info } from 'lucide-react';
import { supabase } from '../lib/supabase';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const SCORING = {
  basePerActivity: 10,
  perPersonServed: 0.5,
  perEuro: 0.1,
  perVolunteer: 2,
  perHour: 0.5,
  causeBonus: {
    'Fame': 15, 'Vista': 12, 'Ambiente': 12, 'Diabete': 10,
    'Cancro infantile': 10, 'Giovani': 8, 'Altro servizio umanitario': 5,
  },
  projectBonus: {
    'Sensibilizzazione e istruzione e advocacy': 8,
    'Donazione': 5, 'Formazione e istruzione degli adulti': 6,
    'Evento di distribuzione di alimenti alla comunità': 10,
    'Bonifica e ripristino ambientale': 8,
    'Raccolta, preparazione e distribuzione di alimenti': 12,
    'Attività di rafforzamento del club': 3,
  }
};

const METRICS = [
  { key: 'points', label: 'Punteggio', icon: Star, color: 'from-yellow-400 to-orange-500' },
  { key: 'activities', label: 'Attività', icon: Heart, color: 'from-rose-400 to-pink-500' },
  { key: 'persone', label: 'Persone', icon: Users, color: 'from-emerald-400 to-teal-500' },
  { key: 'fondi', label: 'Fondi', icon: DollarSign, color: 'from-blue-400 to-indigo-500' },
];

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

export default function ClassificaView({ isAdmin, userProfile, ThemeSwitcher }) {
  const navigate = useNavigate();
  const [rankings, setRankings] = useState([]);
  const [metric, setMetric] = useState('points');
  const [loading, setLoading] = useState(true);
  const [showInfo, setShowInfo] = useState(false);

  useEffect(() => { fetchRankings(); }, [metric]);

  const fetchRankings = async () => {
    setLoading(true);
    const [{ data: clubs }, { data: activities }] = await Promise.all([
      supabase.from('club').select('id, nome, zona, circoscrizione'),
      supabase.from('service_activities').select('*'),
    ]);
    
    const stats = {};
    clubs?.forEach(c => { stats[c.id] = { club: c, activities: 0, persone: 0, fondi: 0, volontari: 0, ore: 0, points: 0 }; });
    
    activities?.forEach(a => {
      if (a.id_club && stats[a.id_club]) {
        const s = stats[a.id_club];
        let pts = SCORING.basePerActivity;
        pts += (a.persone_servite || 0) * SCORING.perPersonServed;
        pts += (a.fondi_donati || 0) * SCORING.perEuro;
        pts += (a.totale_volontari || 0) * SCORING.perVolunteer;
        pts += (a.totale_ore_servizio || 0) * SCORING.perHour;
        if (SCORING.causeBonus[a.causa]) pts += SCORING.causeBonus[a.causa];
        if (SCORING.projectBonus[a.tipo_progetto]) pts += SCORING.projectBonus[a.tipo_progetto];
        
        s.activities++; s.persone += a.persone_servite || 0;
        s.fondi += a.fondi_donati || 0; s.volontari += a.totale_volontari || 0;
        s.ore += a.totale_ore_servizio || 0; s.points += Math.round(pts);
      }
    });
    
    const sorted = Object.values(stats).sort((a, b) => b[metric] - a[metric])
      .map((item, i) => ({ ...item, rank: i + 1 }));
    setRankings(sorted);
    setLoading(false);
  };

  const getMedal = (rank) => {
    if (rank === 1) return { icon: Trophy, color: 'text-yellow-500 bg-yellow-100', shadow: 'shadow-yellow-400/50' };
    if (rank === 2) return { icon: Medal, color: 'text-slate-400 bg-slate-100', shadow: 'shadow-slate-400/30' };
    if (rank === 3) return { icon: Medal, color: 'text-amber-600 bg-amber-100', shadow: 'shadow-amber-600/30' };
    return null;
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#060D1F] aurora-bg">
      <Navbar isAdmin={isAdmin} userProfile={userProfile} ThemeSwitcher={ThemeSwitcher} />
      
      <div className="max-w-6xl mx-auto p-4 sm:p-8 pb-24 space-y-6">
        
        {/* Header */}
        <motion.div {...fadeInUp} className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black uppercase bg-gradient-to-r from-brand-blue to-brand-red bg-clip-text text-transparent">
              Classifica Club
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Ranking basato sul punteggio di service</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowInfo(!showInfo)}
            className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-bold border transition-all ${
              showInfo ? 'bg-brand-blue text-white border-brand-blue' : 'bg-white dark:bg-white/5 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-white/10'
            }`}
          >
            <Info size={18} /> Come si calcola?
          </motion.button>
        </motion.div>

        {/* Info Panel */}
        <AnimatePresence>
          {showInfo && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="bg-white dark:bg-white/5 rounded-2xl p-6 border border-slate-200 dark:border-white/10">
                <h3 className="font-black uppercase mb-4 flex items-center gap-2">
                  <Star className="text-yellow-500" size={20} /> Sistema di Punteggio
                </h3>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  {[
                    { label: 'Base attività', value: '+10 pt' },
                    { label: 'Per persona', value: '+0.5 pt' },
                    { label: 'Per euro', value: '+0.1 pt' },
                    { label: 'Per volontario', value: '+2 pt' },
                    { label: 'Per ora', value: '+0.5 pt' },
                    { label: 'Bonus Fame', value: '+15 pt' },
                    { label: 'Bonus Vista', value: '+12 pt' },
                    { label: 'Bonus Progetto', value: '3-12 pt' },
                  ].map((item, i) => (
                    <div key={i} className="bg-slate-50 dark:bg-white/5 rounded-xl p-3">
                      <div className="text-xs text-slate-500">{item.label}</div>
                      <div className="font-black text-brand-blue">{item.value}</div>
                    </div>
                  ))}
                </div>

                <div className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-500/10 dark:to-orange-500/10 rounded-xl">
                  <div className="text-sm font-bold text-yellow-700 uppercase mb-2">Bonus Cause</div>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(SCORING.causeBonus).map(([causa, bonus]) => (
                      <span key={causa} className="bg-white dark:bg-white/10 px-3 py-1 rounded-full text-sm font-medium">
                        {causa}: +{bonus}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Metric Selector */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex gap-2 overflow-x-auto pb-2"
        >
          {METRICS.map(m => (
            <motion.button
              key={m.key}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setMetric(m.key)}
              className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-bold whitespace-nowrap transition-all ${
                metric === m.key 
                  ? `bg-gradient-to-r ${m.color} text-white shadow-lg shadow-${m.color.split('-')[1]}/25` 
                  : 'bg-white dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:scale-105'
              }`}
            >
              <m.icon size={18} />
              {m.label}
            </motion.button>
          ))}
        </motion.div>

        {/* Top 3 Podium */}
        {!loading && rankings.length >= 3 && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex justify-center items-end gap-4 pt-8 pb-4"
          >
            {/* 2nd */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="text-center"
            >
              <div className="w-20 h-20 mx-auto bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600 rounded-full flex items-center justify-center mb-3 shadow-lg">
                <span className="text-2xl font-black text-slate-500">2</span>
              </div>
              <div className="font-bold text-sm truncate max-w-[140px]">{rankings[1]?.club?.nome}</div>
              <div className="text-sm font-black text-slate-500">
                {metric === 'points' ? rankings[1]?.points : rankings[1]?.[metric]?.toLocaleString()}
              </div>
            </motion.div>

            {/* 1st */}
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-center"
            >
              <div className="w-28 h-28 mx-auto bg-gradient-to-br from-yellow-300 to-yellow-500 rounded-full flex items-center justify-center mb-3 shadow-[0_0_40px_rgba(234,179,8,0.4)] ring-4 ring-yellow-400">
                <Trophy className="text-white" size={40} />
              </div>
              <div className="font-black text-sm truncate max-w-[160px]">{rankings[0]?.club?.nome}</div>
              <div className="text-lg font-black text-yellow-600">
                {metric === 'points' ? rankings[0]?.points : rankings[0]?.[metric]?.toLocaleString()}
              </div>
            </motion.div>

            {/* 3rd */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="text-center"
            >
              <div className="w-20 h-20 mx-auto bg-gradient-to-br from-amber-300 to-amber-500 dark:from-amber-600 dark:to-amber-700 rounded-full flex items-center justify-center mb-3 shadow-lg">
                <span className="text-2xl font-black text-amber-700">3</span>
              </div>
              <div className="font-bold text-sm truncate max-w-[140px]">{rankings[2]?.club?.nome}</div>
              <div className="text-sm font-black text-slate-500">
                {metric === 'points' ? rankings[2]?.points : rankings[2]?.[metric]?.toLocaleString()}
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Full Rankings Table */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-brand-dark rounded-2xl overflow-hidden shadow-xl"
        >
          <table className="w-full text-sm">
            <thead className="bg-slate-100 dark:bg-white/5">
              <tr>
                <th className="p-4 text-left font-black uppercase w-16">#</th>
                <th className="p-4 text-left font-black uppercase">Club</th>
                <th className="p-4 text-left font-black uppercase hidden md:table-cell">Zona</th>
                <th className="p-4 text-right font-black uppercase">Punti</th>
                <th className="p-4 text-right font-black uppercase hidden lg:table-cell">Att</th>
                <th className="p-4 text-right font-black uppercase hidden lg:table-cell">Persone</th>
                <th className="p-4 text-right font-black uppercase hidden lg:table-cell">Fondi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="p-12 text-center">
                  <div className="w-8 h-8 border-4 border-brand-blue border-t-transparent rounded-full animate-spin mx-auto"></div>
                </td></tr>
              ) : (
                rankings.map((item, i) => (
                  <motion.tr 
                    key={item.club.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.02 }}
                    className="border-b border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5"
                  >
                    <td className="p-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black ${
                        item.rank === 1 ? 'bg-yellow-100 text-yellow-600' :
                        item.rank === 2 ? 'bg-slate-100 text-slate-500' :
                        item.rank === 3 ? 'bg-amber-100 text-amber-600' :
                        'bg-slate-100 dark:bg-white/10 text-slate-400'
                      }`}>
                        {item.rank}
                      </div>
                    </td>
                    <td className="p-4 font-bold">{item.club?.nome}</td>
                    <td className="p-4 text-slate-500 hidden md:table-cell">{item.club?.zona}</td>
                    <td className="p-4 text-right font-black text-brand-blue text-lg">{item.points}</td>
                    <td className="p-4 text-right hidden lg:table-cell">{item.activities}</td>
                    <td className="p-4 text-right hidden lg:table-cell">{item.persone.toLocaleString()}</td>
                    <td className="p-4 text-right hidden lg:table-cell">€{item.fondi.toLocaleString()}</td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </motion.div>

      </div>

      <Footer />
    </div>
  );
}