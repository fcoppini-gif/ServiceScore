// =============================================================================
// DASHBOARD PRINCIPALE - Lista Club con statistiche
// =============================================================================
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Users, Heart, Clock, DollarSign, ArrowRight, Search } from 'lucide-react';
import { supabase } from '../lib/supabase';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import StatsCards from '../components/StatsCards';

export default function DashboardView({ isAdmin, userClubs, userProfile, ThemeSwitcher }) {
  const navigate = useNavigate();
  const [clubs, setClubs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({ totClub: 0, totOfficer: 0, totActivity: 0, totPersone: 0, totFondi: 0 });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    const { data: clubsData } = await supabase
      .from('club')
      .select('nome, id_lions, circoscrizione, zona')
      .order('nome');
    setClubs(clubsData || []);
  };

  // Filtra per search
  const filteredClubs = clubs.filter(c => 
    c.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#060D1F]">
      <Navbar isAdmin={isAdmin} userProfile={userProfile} ThemeSwitcher={ThemeSwitcher} />
      
      <div className="max-w-6xl mx-auto p-4 sm:p-8 pb-24 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black uppercase text-slate-800 dark:text-white">
              Lions District 108
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Panoramica completa delle attività lionistiche</p>
          </div>
        </div>

        {/* Stats Cards */}
        <StatsCards />

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Cerca club per nome, zona o circoscrizione..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-lg shadow-sm focus:shadow-lg focus:border-brand-blue transition-all"
          />
        </div>

        {/* Lista Club */}
        <div className="space-y-3">
          <h2 className="text-xl font-black uppercase text-slate-700 dark:text-slate-200">Club ({filteredClubs.length})</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredClubs.map((club, i) => (
              <button
                key={i}
                onClick={() => navigate(`/club/${encodeURIComponent(club.nome)}`)}
                className="w-full text-left p-5 bg-white dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10 hover:border-brand-blue hover:shadow-lg hover:shadow-brand-blue/10 transition-all flex justify-between items-center group"
              >
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-brand-blue truncate group-hover:text-brand-red transition-colors">{club.nome}</div>
                  <div className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                    <span className="bg-slate-100 dark:bg-white/10 px-2 py-0.5 rounded-full">{club.circoscrizione}</span>
                    <span className="bg-slate-100 dark:bg-white/10 px-2 py-0.5 rounded-full">{club.zona}</span>
                  </div>
                </div>
                <ArrowRight size={20} className="text-slate-400 group-hover:text-brand-blue group-hover:translate-x-1 transition-all flex-shrink-0 ml-2" />
              </button>
            ))}
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}