// =============================================================================
// DASHBOARD - Premium graphics with animations
// =============================================================================
import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ArrowRight, Sparkles, TrendingUp, Users, Heart, DollarSign, Building2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

const staggerContainer = {
  animate: {
    transition: { staggerChildren: 0.1 }
  }
};

export default function DashboardView({ isAdmin, userClubs, userProfile, ThemeSwitcher }) {
  const navigate = useNavigate();
  const [clubs, setClubs] = useState([]);
  const [stats, setStats] = useState({ clubs: 0, soci: 0, officers: 0, activities: 0, persone: 0, fondi: 0 });
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [{ data: clubsData }, { data: soci }, { data: officers }, { data: activities }] = await Promise.all([
      supabase.from('club').select('id, nome, id_lions, circoscrizione, zona'),
      supabase.from('soci').select('id'),
      supabase.from('officer').select('id'),
      supabase.from('service_activities').select('persone_servite, fondi_donati'),
    ]);

    const totalePersone = activities?.reduce((s, a) => s + (a.persone_servite || 0), 0) || 0;
    const totaleFondi = activities?.reduce((s, a) => s + (a.fondi_donati || 0), 0) || 0;

    setStats({
      clubs: clubsData?.length || 0,
      soci: soci?.length || 0,
      officers: officers?.length || 0,
      activities: activities?.length || 0,
      persone: totalePersone,
      fondi: totaleFondi,
    });
    setClubs(clubsData || []);
    setLoading(false);
  };

  const filteredClubs = useMemo(() => {
    if (!searchTerm) return clubs;
    const term = searchTerm.toLowerCase();
    return clubs.filter(c => 
      c.nome?.toLowerCase().includes(term) ||
      c.circoscrizione?.toLowerCase().includes(term) ||
      c.zona?.toLowerCase().includes(term)
    );
  }, [clubs, searchTerm]);

  const statCards = [
    { label: 'Club', value: stats.clubs, icon: Building2, color: 'from-blue-500 to-blue-600', bg: 'bg-blue-500' },
    { label: 'Soci', value: stats.soci, icon: Users, color: 'from-emerald-500 to-emerald-600', bg: 'bg-emerald-500' },
    { label: 'Attività', value: stats.activities, icon: Heart, color: 'from-rose-500 to-rose-600', bg: 'bg-rose-500' },
    { label: 'Persone', value: stats.persone.toLocaleString(), icon: TrendingUp, color: 'from-amber-500 to-amber-600', bg: 'bg-amber-500' },
    { label: 'Fondi', value: `€${stats.fondi.toLocaleString()}`, icon: DollarSign, color: 'from-violet-500 to-violet-600', bg: 'bg-violet-500' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#060D1F] aurora-bg">
      <Navbar isAdmin={isAdmin} userProfile={userProfile} ThemeSwitcher={ThemeSwitcher} />
      
      <div className="max-w-6xl mx-auto p-4 sm:p-8 pb-24 space-y-8">
        
        {/* Hero Section */}
        <motion.div 
          {...fadeInUp}
          className="relative overflow-hidden bg-gradient-to-r from-brand-blue via-[#0044B8] to-brand-red rounded-[2.5rem] p-8 sm:p-10 text-white"
        >
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-yellow-400/20 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl"></div>
          
          <div className="relative z-10">
            <h1 className="text-3xl sm:text-5xl font-black uppercase mb-3 tracking-tight">
              Lions District 108
            </h1>
            <p className="text-white/80 text-lg sm:text-xl max-w-xl">
              Panoramica completa delle attività lionistiche • Servire è il nostro motto
            </p>
          </div>

          {/* Floating Stats */}
          <div className="relative z-10 mt-8 flex flex-wrap gap-3">
            {statCards.slice(0, 3).map((card, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="flex items-center gap-2 bg-white/15 backdrop-blur-sm px-4 py-2 rounded-2xl border border-white/20"
              >
                <card.icon size={18} className="text-white/80" />
                <span className="font-black text-lg">{card.value}</span>
                <span className="text-white/60 text-sm">{card.label}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div 
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="grid grid-cols-2 md:grid-cols-5 gap-4"
        >
          {statCards.map((card, i) => (
            <motion.div
              key={i}
              variants={fadeInUp}
              whileHover={{ scale: 1.03, y: -5 }}
              className="group relative overflow-hidden bg-white dark:bg-white/[0.03] rounded-2xl p-5 shadow-lg hover:shadow-xl transition-all border border-slate-100 dark:border-white/5"
            >
              <div className={`absolute top-0 right-0 w-16 h-16 ${card.bg} opacity-10 rounded-bl-full -mr-2 -mt-2`}></div>
              <div className={`w-10 h-10 ${card.bg} rounded-xl flex items-center justify-center mb-3 shadow-lg`}>
                <card.icon className="text-white" size={20} />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-white">
                {card.value}
              </div>
              <div className="text-xs font-bold uppercase text-slate-400">{card.label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Search */}
        <motion.div {...fadeInUp} transition={{ delay: 0.3 }}>
          <div className="relative">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={22} />
            <input
              type="text"
              placeholder="Cerca club per nome, zona o circoscrizione..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-14 pr-5 py-4 rounded-2xl bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 text-lg shadow-sm focus:shadow-xl focus:border-brand-blue transition-all outline-none"
            />
          </div>
        </motion.div>

        {/* Clubs Grid */}
        <motion.div {...fadeInUp} transition={{ delay: 0.4 }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-black uppercase text-slate-700 dark:text-slate-200">
              Club ({filteredClubs.length})
            </h2>
            <div className="flex gap-2">
              <select className="px-3 py-1.5 rounded-lg text-sm bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10">
                <option>Ordina per nome</option>
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence mode="popLayout">
              {filteredClubs.map((club, i) => (
                <motion.button
                  key={club.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.03 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate(`/club/${encodeURIComponent(club.nome)}`)}
                  className="group relative overflow-hidden text-left p-5 bg-white dark:bg-white/[0.03] rounded-2xl border border-slate-200 dark:border-white/10 hover:border-brand-blue hover:shadow-xl transition-all"
                >
                  {/* Hover gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-brand-blue/5 to-brand-red/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  
                  <div className="relative z-10">
                    <div className="font-bold text-brand-blue group-hover:text-brand-red transition-colors truncate">
                      {club.nome}
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs bg-slate-100 dark:bg-white/10 px-2 py-1 rounded-full">
                        {club.circoscrizione}
                      </span>
                      <span className="text-xs bg-slate-100 dark:bg-white/10 px-2 py-1 rounded-full">
                        {club.zona}
                      </span>
                    </div>
                  </div>
                  
                  <ArrowRight size={20} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 group-hover:text-brand-blue group-hover:translate-x-1 transition-all" />
                </motion.button>
              ))}
            </AnimatePresence>
          </div>
          
          {filteredClubs.length === 0 && (
            <div className="text-center py-12 text-slate-400">
              <Sparkles size={48} className="mx-auto mb-4 opacity-50" />
              <p>Nessun club trovato</p>
            </div>
          )}
        </motion.div>

      </div>

      <Footer />
    </div>
  );
}