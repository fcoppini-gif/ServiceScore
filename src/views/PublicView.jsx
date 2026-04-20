// =============================================================================
// PUBLIC VIEW - Accessibile senza login (solo lettura)
// =============================================================================
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Heart, Users, DollarSign, ArrowRight, Filter, Trophy, Globe, ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function PublicView() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('club'); // club, selezioni, classifica
  const [clubs, setClubs] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Filter states
  const [filters, setFilters] = useState({
    causa: '',
    tipo: '',
    stato: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const [{ data: clubs }, { data: acts }] = await Promise.all([
      supabase.from('club').select('*').order('nome'),
      supabase.from('service_activities').select('*').order('data_inizio', { ascending: false }),
    ]);
    setClubs(clubs || []);
    setActivities(acts || []);
    setLoading(false);
  };

  const filteredClubs = clubs.filter(c => 
    c.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.zona?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredActivities = activities.filter(a => {
    if (filters.causa && a.causa !== filters.causa) return false;
    if (filters.tipo && a.tipo_progetto !== filters.tipo) return false;
    if (filters.stato && a.stato !== filters.stato) return false;
    return true;
  });

  const stats = {
    clubs: clubs.length,
    activities: activities.length,
    persone: activities.reduce((s, a) => s + (a.persone_servite || 0), 0),
    fondi: activities.reduce((s, a) => s + (a.fondi_donati || 0), 0),
  };

  const cause = [...new Set(activities.map(a => a.causa).filter(Boolean))].sort();
  const tipi = [...new Set(activities.map(a => a.tipo_progetto).filter(Boolean))].sort();

  // Ranking calculation
  const clubStats = {};
  clubs.forEach(c => { clubStats[c.id] = { nome: c.nome, attivita: 0, fondi: 0 }; });
  activities.forEach(a => {
    if (a.id_club && clubStats[a.id_club]) {
      clubStats[a.id_club].attivita++;
      clubStats[a.id_club].fondi += a.fondi_donati || 0;
    }
  });
  const ranking = Object.values(clubStats).sort((a, b) => b.fondi - a.fondi);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#060D1F]">
      {/* Header */}
      <div className="bg-gradient-to-r from-brand-blue to-brand-red p-6 text-white">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-black uppercase">Lions District 108</h1>
              <p className="text-sm opacity-80">Servire è il nostro motto</p>
            </div>
            <button onClick={() => navigate('/login')} className="px-4 py-2 bg-white text-brand-blue rounded-xl font-bold text-sm">
              Accedi
            </button>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white/10 rounded-xl p-4">
              <div className="text-2xl font-black">{stats.clubs}</div>
              <div className="text-xs uppercase opacity-70">Club</div>
            </div>
            <div className="bg-white/10 rounded-xl p-4">
              <div className="text-2xl font-black">{stats.activities}</div>
              <div className="text-xs uppercase opacity-70">Attività</div>
            </div>
            <div className="bg-white/10 rounded-xl p-4">
              <div className="text-2xl font-black">{stats.persone.toLocaleString()}</div>
              <div className="text-xs uppercase opacity-70">Persone</div>
            </div>
            <div className="bg-white/10 rounded-xl p-4">
              <div className="text-2xl font-black">€{stats.fondi.toLocaleString()}</div>
              <div className="text-xs uppercase opacity-70">Fondi</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex gap-2 mb-6">
          {[
            { id: 'club', label: 'Club', icon: Users },
            { id: 'selezioni', label: 'Attività', icon: Filter },
            { id: 'classifica', label: 'Classifica', icon: Trophy },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl font-bold transition-all ${
                activeTab === tab.id
                  ? 'bg-brand-blue text-white'
                  : 'bg-white dark:bg-white/5 text-slate-600 dark:text-white'
              }`}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* CLUB TAB */}
        {activeTab === 'club' && (
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="text"
                placeholder="Cerca club..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredClubs.map((club, i) => (
                <div key={i} className="bg-white dark:bg-white/5 p-5 rounded-2xl border border-slate-200 dark:border-white/10">
                  <h3 className="font-bold text-brand-blue mb-2">{club.nome}</h3>
                  <div className="flex gap-2 text-xs text-slate-500">
                    <span className="bg-slate-100 dark:bg-white/10 px-2 py-1 rounded-full">{club.circoscrizione}</span>
                    <span className="bg-slate-100 dark:bg-white/10 px-2 py-1 rounded-full">{club.zona}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ATTIVITA TAB */}
        {activeTab === 'selezioni' && (
          <div className="space-y-4">
            {/* Filters */}
            <div className="flex gap-4 flex-wrap">
              <select
                value={filters.causa}
                onChange={(e) => setFilters({...filters, causa: e.target.value})}
                className="px-4 py-2 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10"
              >
                <option value="">Tutte le cause</option>
                {cause.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <select
                value={filters.tipo}
                onChange={(e) => setFilters({...filters, tipo: e.target.value})}
                className="px-4 py-2 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10"
              >
                <option value="">Tutti i tipi</option>
                {tipi.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            {/* Activities List */}
            <div className="bg-white dark:bg-white/5 rounded-2xl overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-slate-100 dark:bg-white/5">
                  <tr>
                    <th className="p-3 text-left font-bold uppercase">Attività</th>
                    <th className="p-3 text-left font-bold uppercase hidden md:table-cell">Causa</th>
                    <th className="p-3 text-right font-bold uppercase">Persone</th>
                    <th className="p-3 text-right font-bold uppercase">Fondi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredActivities.slice(0, 50).map((a, i) => (
                    <tr key={i} className="border-b border-slate-100 dark:border-white/5">
                      <td className="p-3">
                        <div className="font-bold">{a.titolo}</div>
                        <div className="text-xs text-slate-500">{a.club_name}</div>
                      </td>
                      <td className="p-3 hidden md:table-cell">{a.causa}</td>
                      <td className="p-3 text-right">{a.persone_servite || 0}</td>
                      <td className="p-3 text-right font-bold">€{a.fondi_donati || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredActivities.length > 50 && (
                <div className="p-3 text-center text-slate-500 text-sm">
                  Primi 50 risultati su {filteredActivities.length}
                </div>
              )}
            </div>
          </div>
        )}

        {/* CLASSIFICA TAB */}
        {activeTab === 'classifica' && (
          <div className="space-y-4">
            <div className="bg-white dark:bg-white/5 rounded-2xl overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-slate-100 dark:bg-white/5">
                  <tr>
                    <th className="p-3 text-left font-black uppercase w-16">#</th>
                    <th className="p-3 text-left font-black uppercase">Club</th>
                    <th className="p-3 text-right font-black uppercase">Attività</th>
                    <th className="p-3 text-right font-black uppercase">Fondi €</th>
                  </tr>
                </thead>
                <tbody>
                  {ranking.map((c, i) => (
                    <tr key={i} className={`border-b border-slate-100 dark:border-white/5 ${i < 3 ? 'bg-yellow-50 dark:bg-yellow-500/10' : ''}`}>
                      <td className="p-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black ${
                          i === 0 ? 'bg-yellow-400 text-white' : 
                          i === 1 ? 'bg-slate-300 text-white' :
                          i === 2 ? 'bg-amber-600 text-white' :
                          'bg-slate-100 dark:bg-white/10'
                        }`}>
                          {i + 1}
                        </div>
                      </td>
                      <td className="p-3 font-bold">{c.nome}</td>
                      <td className="p-3 text-right">{c.attivita}</td>
                      <td className="p-3 text-right font-bold text-brand-blue">{c.fondi.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="text-center p-8 text-slate-500 text-sm">
        <p>ServiceScore - Lions District 108 Italia</p>
        <p className="mt-2">
          <button onClick={() => navigate('/login')} className="text-brand-blue underline">
            Accedi per inserire dati
          </button>
        </p>
      </div>
    </div>
  );
}