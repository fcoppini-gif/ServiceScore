// =============================================================================
// CLUB DETAIL - Dettaglio singolo club con officer e activities
// =============================================================================
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Users, Heart, Calendar } from 'lucide-react';
import { supabase } from '../lib/supabase';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function ClubDetail({ ThemeSwitcher }) {
  const navigate = useNavigate();
  const { clubName } = useParams();
  const decodedName = decodeURIComponent(clubName || '');
  
  const [club, setClub] = useState(null);
  const [officers, setOfficers] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [decodedName]);

  const fetchData = async () => {
    setLoading(true);
    
    // Fetch club info
    const { data: clubData } = await supabase
      .from('club')
      .select('*')
      .eq('nome', decodedName)
      .single();
    setClub(clubData);
    
    // Fetch officers di questo club
    const { data: offData } = await supabase
      .from('officer')
      .select('*')
      .eq('club_name', decodedName);
    setOfficers(offData || []);
    
    // Fetch activities di questo club
    const { data: actData } = await supabase
      .from('service_activities')
      .select('*')
      .eq('club_name', decodedName)
      .order('data_inizio', { ascending: false });
    setActivities(actData || []);
    
    setLoading(false);
  };

  if (loading) {
    return <div className="min-h-screen bg-slate-50 dark:bg-[#060D1F] flex items-center justify-center">
      <div className="animate-spin w-8 h-8 border-4 border-brand-blue border-t-transparent rounded-full"></div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#060D1F]">
      <Navbar isAdmin={false} userProfile={null} ThemeSwitcher={ThemeSwitcher} />
      
      <div className="max-w-3xl mx-auto p-4 sm:p-8 pb-24 space-y-6">
        {/* Back */}
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-slate-500 hover:text-brand-blue"
        >
          <ArrowLeft size={20} /> Torna alla lista
        </button>

        {/* Club Header */}
        <div className="bg-gradient-to-br from-brand-blue to-brand-blue/80 p-6 rounded-[2rem] text-white">
          <h1 className="text-2xl font-black uppercase">{club?.nome}</h1>
          <div className="text-sm opacity-70 mt-2">
            ID: {club?.id_lions} • {club?.circoscrizione} • {club?.zona}
          </div>
        </div>

        {/* Officer */}
        <div className="bg-white dark:bg-white/5 p-6 rounded-2xl">
          <h2 className="text-lg font-black uppercase flex items-center gap-2 mb-4">
            <Users size={20} /> Officer ({officers.length})
          </h2>
          
          {officers.length === 0 ? (
            <div className="text-slate-400 italic">Nessun officer</div>
          ) : (
            <div className="space-y-3">
              {officers.map((o, i) => (
                <div key={i} className="flex justify-between items-center p-3 bg-slate-50 dark:bg-white/5 rounded-xl">
                  <div>
                    <div className="font-bold">{o.nome} {o.cognome}</div>
                    <div className="text-xs text-slate-500">{o.titolo}</div>
                  </div>
                  <div className="text-xs text-slate-400">
                    {o.data_inizio} - {o.data_fine || 'attuale'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Activities */}
        <div className="bg-white dark:bg-white/5 p-6 rounded-2xl">
          <h2 className="text-lg font-black uppercase flex items-center gap-2 mb-4">
            <Heart size={20} /> Attività ({activities.length})
          </h2>
          
          {activities.length === 0 ? (
            <div className="text-slate-400 italic">Nessuna attività</div>
          ) : (
            <div className="space-y-4">
              {activities.map((a, i) => (
                <div key={i} className="p-4 border border-slate-200 dark:border-white/10 rounded-xl">
                  <div className="flex justify-between items-start mb-2">
                    <div className="font-bold text-brand-blue">{a.titolo}</div>
                    <span className="text-xs px-2 py-1 bg-brand-yellow/20 rounded-full">{a.causa}</span>
                  </div>
                  <div className="text-xs text-slate-500 mb-3">
                    <Calendar size={12} className="inline" /> {a.data_inizio} - {a.data_conclusione}
                  </div>
                  <div className="grid grid-cols-4 gap-2 text-center text-xs">
                    <div className="bg-slate-100 dark:bg-white/5 p-2 rounded">
                      <div className="font-bold">{a.persone_servite}</div>
                      <div>Persone</div>
                    </div>
                    <div className="bg-slate-100 dark:bg-white/5 p-2 rounded">
                      <div className="font-bold">{a.totale_volontari}</div>
                      <div>Volontari</div>
                    </div>
                    <div className="bg-slate-100 dark:bg-white/5 p-2 rounded">
                      <div className="font-bold">{a.totale_ore_servizio}</div>
                      <div>Ore</div>
                    </div>
                    <div className="bg-slate-100 dark:bg-white/5 p-2 rounded">
                      <div className="font-bold">€{a.fondi_donati}</div>
                      <div>Fondi</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      <Footer />
    </div>
  );
}