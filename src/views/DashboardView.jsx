// =============================================================================
// DASHBOARD PRINCIPALE - Lista Club con statistiche
// =============================================================================
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Users, Heart, Clock, DollarSign, ArrowRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function DashboardView({ isAdmin, userClubs, userProfile, ThemeSwitcher }) {
  const navigate = useNavigate();
  const [clubs, setClubs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({ totClub: 0, totOfficer: 0, totActivity: 0, totPersone: 0, totFondi: 0 });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    // Fetch club con count officer e activities
    const { data: clubsData } = await supabase
      .from('club')
      .select('nome, id_lions, circoscrizione, zona')
      .order('nome');
    
    // Fetch officer per club
    const { data: officers } = await supabase.from('officer').select('club_name');
    
    // Fetch activities
    const { data: activities } = await supabase.from('service_activities').select('*');
    
    // Calcola stats
    let totPersone = 0, totFondi = 0;
    activities?.forEach(a => {
      totPersone += a.persone_servite || 0;
      totFondi += a.fondi_donati || 0;
    });
    
    setStats({
      totClub: clubsData?.length || 0,
      totOfficer: officers?.length || 0,
      totActivity: activities?.length || 0,
      totPersone,
      totFondi
    });
    
    setClubs(clubsData || []);
  };

  // Filtra per search
  const filteredClubs = clubs.filter(c => 
    c.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#060D1F]">
      <Navbar isAdmin={isAdmin} userProfile={userProfile} ThemeSwitcher={ThemeSwitcher} />
      
      <div className="max-w-5xl mx-auto p-4 sm:p-8 pb-24 space-y-8">
        {/* HERO con stats */}
        <div className="bg-gradient-to-br from-brand-blue to-brand-red p-8 rounded-[2rem] text-white">
          <h1 className="text-3xl sm:text-4xl font-black uppercase mb-6">Lions District 108</h1>
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div>
              <div className="text-3xl font-black">{stats.totClub}</div>
              <div className="text-xs uppercase opacity-70">Club</div>
            </div>
            <div>
              <div className="text-3xl font-black">{stats.totOfficer}</div>
              <div className="text-xs uppercase opacity-70">Officer</div>
            </div>
            <div>
              <div className="text-3xl font-black">{stats.totActivity}</div>
              <div className="text-xs uppercase opacity-70">Attività</div>
            </div>
            <div>
              <div className="text-3xl font-black">{stats.totPersone}</div>
              <div className="text-xs uppercase opacity-70">Persone</div>
            </div>
            <div>
              <div className="text-3xl font-black">€{stats.totFondi}</div>
              <div className="text-xs uppercase opacity-70">Fondi</div>
            </div>
          </div>
        </div>

        {/* Search */}
        <input
          type="text"
          placeholder="Cerca club..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-3 rounded-2xl bg-white dark:bg-white/10 border border-slate-200 dark:border-white/20"
        />

        {/* Lista Club */}
        <div className="space-y-3">
          <h2 className="text-xl font-black uppercase">Club ({filteredClubs.length})</h2>
          
          {filteredClubs.map((club, i) => (
            <button
              key={i}
              onClick={() => navigate(`/club/${encodeURIComponent(club.nome)}`)}
              className="w-full text-left p-4 bg-white dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10 hover:border-brand-blue transition-all flex justify-between items-center"
            >
              <div>
                <div className="font-black text-brand-blue">{club.nome}</div>
                <div className="text-xs text-slate-500">{club.circoscrizione} • {club.zona}</div>
              </div>
              <ArrowRight size={20} className="text-slate-400" />
            </button>
          ))}
        </div>
      </div>
      
      <Footer />
    </div>
  );
}