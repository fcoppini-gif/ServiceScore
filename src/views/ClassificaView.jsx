// =============================================================================
// CLASSIFICA - Club Rankings with Scoring System
// =============================================================================
import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Trophy, Medal, Star, Filter, Heart, Users, DollarSign, Target, Zap } from 'lucide-react';
import { supabase } from '../lib/supabase';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

// Scoring system configuration
const SCORING = {
  basePerActivity: 10,       // Points per activity
  perPersonServed: 0.5,      // Points per person served
  perEuro: 0.1,              // Points per euro donated
  perVolunteer: 2,          // Points per volunteer
  perHour: 0.5,              // Points per service hour
  causeBonus: {              // Bonus by cause
    'Fame': 15,
    'Vista': 12,
    'Ambiente': 12,
    'Diabete': 10,
    'Cancro infantile': 10,
    'Giovani': 8,
    'Altro servizio umanitario': 5,
  },
  projectBonus: {           // Bonus by project type
    'Sensibilizzazione e istruzione e advocacy': 8,
    'Donazione': 5,
    'Formazione e istruzione degli adulti': 6,
    'Evento di distribuzione di alimenti alla comunità': 10,
    'Bonifica e ripristino ambientale': 8,
    'Raccolta, preparazione e distribuzione di alimenti': 12,
    'Attività di rafforzamento del club': 3,
  }
};

const METRICS = [
  { key: 'points', label: 'Punteggio', icon: Star, color: 'text-yellow-500' },
  { key: 'activities', label: 'Attività', icon: Heart, color: 'text-rose-500' },
  { key: 'persone', label: 'Persone', icon: Users, color: 'text-emerald-500' },
  { key: 'fondi', label: 'Fondi', icon: DollarSign, color: 'text-blue-500' },
];

export default function ClassificaView({ isAdmin, userProfile, ThemeSwitcher }) {
  const navigate = useNavigate();
  const [rankings, setRankings] = useState([]);
  const [metric, setMetric] = useState('points');
  const [loading, setLoading] = useState(true);
  const [showScoring, setShowScoring] = useState(false);

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
        volontari: 0,
        ore: 0,
        points: 0,
        details: [],
      };
    });
    
    activities?.forEach(a => {
      if (a.id_club && stats[a.id_club]) {
        const s = stats[a.id_club];
        
        // Base activity points
        let points = SCORING.basePerActivity;
        
        // Person served points
        const persone = a.persone_servite || 0;
        points += persone * SCORING.perPersonServed;
        
        // Funds points
        const fondi = a.fondi_donati || 0;
        points += fondi * SCORING.perEuro;
        
        // Volunteer points
        const volontari = a.totale_volontari || 0;
        points += volontari * SCORING.perVolunteer;
        
        // Hour points
        const ore = a.totale_ore_servizio || 0;
        points += ore * SCORING.perHour;
        
        // Cause bonus
        const causaCaused = a.causa || '';
        if (SCORING.causeBonus[causaCaused]) {
          points += SCORING.causeBonus[causaCaused];
        }
        
        // Project type bonus
        const tipo = a.tipo_progetto || '';
        if (SCORING.projectBonus[tipo]) {
          points += SCORING.projectBonus[tipo];
        }
        
        // Update stats
        s.activities++;
        s.persone += persone;
        s.fondi += fondi;
        s.volontari += volontari;
        s.ore += ore;
        s.points += Math.round(points);
        s.details.push({ ...a, points: Math.round(points) });
      }
    });
    
    let sorted = Object.values(stats).sort((a, b) => b[metric] - a[metric]);
    
    sorted = sorted.map((item, i) => ({
      ...item,
      rank: i + 1,
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

  const scoringExplanations = [
    { label: 'Base per attività', value: `+${SCORING.basePerActivity} pt` },
    { label: 'Per persona servita', value: `+${SCORING.perPersonServed} pt` },
    { label: 'Per euro donato', value: `+${SCORING.perEuro} pt` },
    { label: 'Per volontario', value: `+${SCORING.perVolunteer} pt` },
    { label: 'Per ora servizio', value: `+${SCORING.perHour} pt` },
    { label: 'Bonus causa', value: '5-15 pt' },
    { label: 'Bonus tipo progetto', value: '3-12 pt' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#060D1F]">
      <Navbar isAdmin={isAdmin} userProfile={userProfile} ThemeSwitcher={ThemeSwitcher} />
      
      <div className="max-w-5xl mx-auto p-4 sm:p-8 pb-24 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black uppercase">Classifica Club</h1>
            <p className="text-slate-500">Ranking basato sul punteggio di service</p>
          </div>
          <button 
            onClick={() => setShowScoring(!showScoring)}
            className="flex items-center gap-2 px-4 py-2 bg-brand-blue/10 text-brand-blue rounded-xl text-sm font-bold"
          >
            <Zap size={16} /> Come si calcola?
          </button>
        </div>

        {/* Scoring Explanation */}
        {showScoring && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="bg-white dark:bg-white/5 rounded-2xl p-6 border border-slate-200 dark:border-white/10"
          >
            <h3 className="font-black uppercase mb-4">Sistema di Punteggio</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {scoringExplanations.map((item, i) => (
                <div key={i} className="text-sm">
                  <div className="text-slate-500">{item.label}</div>
                  <div className="font-bold text-brand-blue">{item.value}</div>
                </div>
              ))}
            </div>
            <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-500/10 rounded-xl">
              <div className="text-xs font-bold uppercase text-yellow-700">Bonus Cause</div>
              <div className="text-sm flex flex-wrap gap-2 mt-1">
                {Object.entries(SCORING.causeBonus).map(([causa, bonus]) => (
                  <span key={causa} className="bg-white dark:bg-white/10 px-2 py-1 rounded-full text-xs">
                    {causa}: +{bonus}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Metric Selector */}
        <div className="flex gap-2 bg-white dark:bg-white/5 p-2 rounded-2xl overflow-x-auto">
          {METRICS.map(m => (
            <button
              key={m.key}
              onClick={() => setMetric(m.key)}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl font-bold transition-all whitespace-nowrap ${
                metric === m.key 
                  ? 'bg-brand-blue text-white shadow-lg' 
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10'
              }`}
            >
              <m.icon size={18} className={m.color} />
              <span className="hidden sm:inline">{m.label}</span>
            </button>
          ))}
        </div>

        {/* Top 3 Podium */}
        {rankings.length >= 3 && (
          <div className="flex justify-center items-end gap-4 pt-8">
            <div className="text-center">
              <div className="w-20 h-20 mx-auto bg-slate-100 dark:bg-white/10 rounded-full flex items-center justify-center mb-2">
                <span className="text-2xl font-black text-slate-400">2</span>
              </div>
              <div className="font-bold text-sm truncate max-w-[120px]">{rankings[1].club.nome}</div>
              <div className="text-xs text-slate-500">{metric === 'points' ? rankings[1].points : rankings[1][metric]}</div>
            </div>
            <div className="text-center">
              <div className="w-24 h-24 mx-auto bg-yellow-100 dark:bg-yellow-500/20 rounded-full flex items-center justify-center mb-2 ring-4 ring-yellow-400">
                <Trophy className="text-yellow-500" size={36} />
              </div>
              <div className="font-black text-sm truncate max-w-[140px]">{rankings[0].club.nome}</div>
              <div className="text-xs text-yellow-600 font-bold">{metric === 'points' ? rankings[0].points : rankings[0][metric]}</div>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 mx-auto bg-amber-100 dark:bg-amber-500/20 rounded-full flex items-center justify-center mb-2">
                <span className="text-2xl font-black text-amber-600">3</span>
              </div>
              <div className="font-bold text-sm truncate max-w-[120px]">{rankings[2].club.nome}</div>
              <div className="text-xs text-slate-500">{metric === 'points' ? rankings[2].points : rankings[2][metric]}</div>
            </div>
          </div>
        )}

        {/* Full Table */}
        <div className="bg-white dark:bg-brand-dark rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-100 dark:bg-white/5">
              <tr>
                <th className="p-4 text-left font-black uppercase w-16">#</th>
                <th className="p-4 text-left font-black uppercase">Club</th>
                <th className="p-4 text-left font-black uppercase hidden md:table-cell">Zona</th>
                <th className="p-4 text-right font-black uppercase">Punti</th>
                <th className="p-4 text-right font-black uppercase hidden lg:table-cell">Att.</th>
                <th className="p-4 text-right font-black uppercase hidden lg:table-cell">Persone</th>
                <th className="p-4 text-right font-black uppercase hidden lg:table-cell">Fondi €</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="p-8 text-center">Caricamento...</td></tr>
              ) : rankings.map((item) => {
                const medal = getMedal(item.rank);
                return (
                  <motion.tr 
                    key={item.club.id} 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="border-b border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5"
                  >
                    <td className="p-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black ${
                        medal ? medal.bg : 'bg-slate-100 dark:bg-white/10'
                      }`}>
                        {medal ? <medal.icon size={16} className={medal.color} /> : item.rank}
                      </div>
                    </td>
                    <td className="p-4 font-bold">{item.club.nome}</td>
                    <td className="p-4 text-slate-500 hidden md:table-cell">{item.club.zona}</td>
                    <td className="p-4 text-right font-black text-brand-blue">{item.points}</td>
                    <td className="p-4 text-right hidden lg:table-cell">{item.activities}</td>
                    <td className="p-4 text-right hidden lg:table-cell">{item.persone.toLocaleString()}</td>
                    <td className="p-4 text-right hidden lg:table-cell">{item.fondi.toLocaleString()}</td>
                  </motion.tr>
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