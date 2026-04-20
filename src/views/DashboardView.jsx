// =============================================================================
// VIEW: DashboardView - Pagina principale dopo il login
// =============================================================================
// ADMIN: mostra TUTTI i club + classifica completa
// REFERENTE: mostra classifica filtrata solo dei club associati
// =============================================================================

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, Plus, Shield, Download, BarChart3, Heart, Users, Clock, DollarSign, Building2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function DashboardView({ isAdmin, userClubs, userProfile, ThemeSwitcher }) {
  const navigate = useNavigate();
  const [leaderboard, setLeaderboard] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showStats, setShowStats] = useState(false);
  const [showLionsStats, setShowLionsStats] = useState(false);
  const [statsData, setStatsData] = useState({ servicesByMonth: [], servicesByType: [], topClubs: [] });
  const [lionsStats, setLionsStats] = useState({ total: 0, clubs: 0, persone: 0, volontari: 0, ore: 0, fondi: 0, byCausa: [] });

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('ServiceScore - Classifica', 14, 20);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Data: ${new Date().toLocaleDateString('it-IT')}`, 14, 28);
    
    const tableData = leaderboard.map((item, i) => [
      `#${i + 1}`,
      item.nome,
      item.score.toFixed(1)
    ]);
    
    doc.autoTable({
      head: [['Pos.', 'Club', 'Punteggio']],
      body: tableData,
      startY: 35,
      theme: 'grid',
      headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: 'bold' },
      styles: { fontSize: 10 },
    });
    
    doc.save(`classifica_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  useEffect(() => {
    const fetchLeaderboard = async () => {
      const { data, error } = await supabase
        .from('service_inseriti')
        .select(`punteggio_totale, id_club, club(nome, logo_url)`);

      if (error) {
        console.error('Errore fetch classifica:', error);
        return;
      }

      if (data) {
        let filtered = data;
        if (!isAdmin && userClubs.length > 0) {
          filtered = data.filter((item) => userClubs.includes(item.id_club));
        }

        const scores = filtered.reduce((acc, item) => {
          const name = item.club?.nome || `Club ID: ${item.id_club}`;
          const logo = item.club?.logo_url || null;
          if (!acc[name]) {
            acc[name] = { score: 0, logo };
          }
          acc[name].score += (item.punteggio_totale || 0);
          return acc;
        }, {});

        setLeaderboard(
          Object.entries(scores)
            .map(([nome, data]) => ({ nome, score: data.score, logo: data.logo }))
            .sort((a, b) => b.score - a.score)
        );
      }
    };
    fetchLeaderboard();
  }, [userClubs, isAdmin]);

  // Fetch statistics
  useEffect(() => {
    const fetchStats = async () => {
      const { data: services } = await supabase
        .from('service_inseriti')
        .select('data_inserimento, punteggio_totale, id_club, club(nome), tipi_service(nome)')
        .order('data_inserimento');
      
      if (!services || services.length === 0) return;
      
      let filteredServices = services;
      if (!isAdmin && userClubs.length > 0) {
        filteredServices = services.filter((s) => userClubs.includes(s.id_club));
      }
      
      const byMonth = {};
      const byType = {};
      
      filteredServices.forEach((s) => {
        const date = new Date(s.data_inserimento);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        byMonth[monthKey] = (byMonth[monthKey] || 0) + 1;
        
        const typeName = s.tipi_service?.nome || 'Altro';
        byType[typeName] = (byType[typeName] || 0) + 1;
      });
      
      const servicesByMonth = Object.entries(byMonth)
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([month, count]) => ({ month, service: count }));
      
      const servicesByType = Object.entries(byType)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);
      
      const clubScores = {};
      filteredServices.forEach((s) => {
        const clubName = s.club?.nome || 'Altro';
        clubScores[clubName] = (clubScores[clubName] || 0) + (s.punteggio_totale || 0);
      });
      
      const topClubs = Object.entries(clubScores)
        .map(([name, score]) => ({ name, score: Math.round(score) }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 6);
      
      setStatsData({ servicesByMonth, servicesByType, topClubs });
    };
    
    fetchStats();
  }, [isAdmin, userClubs]);

  // Fetch Lions Activities stats
  useEffect(() => {
    const fetchLionsStats = async () => {
      const { data: activities } = await supabase.from('service_activities').select('*');
      const { data: clubs } = await supabase.from('club').select('id');
      
      if (!activities) return;
      
      const byCausa = {};
      let totalePersone = 0, totaleVolontari = 0, totaleOre = 0, totaleFondi = 0;
      
      activities.forEach(a => {
        totalePersone += a.persone_servite || 0;
        totaleVolontari += a.totale_volontari || 0;
        totaleOre += a.totale_ore_servizio || 0;
        totaleFondi += a.fondi_donati || 0;
        
        const causa = a.causa || 'Altro';
        byCausa[causa] = (byCausa[causa] || 0) + 1;
      });
      
      setLionsStats({
        total: activities.length,
        clubs: clubs?.length || 0,
        persone: totalePersone,
        volontari: totaleVolontari,
        ore: totaleOre,
        fondi: totaleFondi,
        byCausa: Object.entries(byCausa).map(([name, value]) => ({ name, value }))
      });
    };
    
    fetchLionsStats();
  }, []);

  if (showStats) {
    return (
      <div className="min-h-screen bg-slate-100 dark:bg-[#060D1F] transition-colors duration-500 aurora-bg">
        <Navbar isAdmin={isAdmin} userProfile={userProfile} ThemeSwitcher={ThemeSwitcher} />
        
        <div className="relative z-10 max-w-5xl mx-auto p-4 sm:p-12 space-y-8 pb-24 text-brand-dark dark:text-white animate-fade-in-up">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setShowStats(false)}
              className="cursor-pointer bg-brand-blue dark:bg-brand-yellow text-white dark:text-brand-dark font-black px-6 py-3 rounded-2xl flex items-center gap-2 shadow-lg hover-lift transition-all border-none"
            >
              ← Classifica
            </button>
          </div>
          
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-black uppercase tracking-tight bg-gradient-to-r from-brand-blue via-brand-red to-brand-yellow bg-clip-text text-transparent">Le Tue Statistiche</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-bold uppercase tracking-widest">Dashboard Interattiva</p>
          </div>
          
          {/* KPI */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-brand-blue to-brand-blue/80 p-6 rounded-[2rem] text-white shadow-xl">
              <div className="text-3xl font-black">{statsData.servicesByMonth.reduce((a, b) => a + b.service, 0)}</div>
              <div className="text-xs font-bold uppercase tracking-widest opacity-80 mt-1">Service Totali</div>
            </div>
            <div className="bg-gradient-to-br from-brand-red to-brand-red/80 p-6 rounded-[2rem] text-white shadow-xl">
              <div className="text-3xl font-black">{statsData.servicesByType.length}</div>
              <div className="text-xs font-bold uppercase tracking-widest opacity-80 mt-1">Tipologie</div>
            </div>
            <div className="bg-gradient-to-br from-brand-yellow to-amber-500 p-6 rounded-[2rem] text-brand-dark shadow-xl">
              <div className="text-3xl font-black">{statsData.topClubs[0]?.score || 0}</div>
              <div className="text-xs font-bold uppercase tracking-widest opacity-80 mt-1">Punteggio Max</div>
            </div>
            <div className="bg-gradient-to-br from-purple-600 to-purple-600/80 p-6 rounded-[2rem] text-white shadow-xl">
              <div className="text-3xl font-black">{statsData.topClubs.length}</div>
              <div className="text-xs font-bold uppercase tracking-widest opacity-80 mt-1">Club Attivi</div>
            </div>
          </div>
          
          {/* Grafici */}
          {statsData.servicesByMonth.length > 0 && (
            <div className="bg-white dark:bg-white/[0.08] p-8 rounded-[3rem] border border-slate-200 dark:border-white/20 shadow-2xl">
              <h3 className="text-lg font-black uppercase tracking-widest text-brand-blue dark:text-brand-yellow mb-6">Trend Mensile</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={statsData.servicesByMonth}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,51,160,0.1)" />
                  <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Bar dataKey="service" fill="#0033A0" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
          
          {statsData.servicesByType.length > 0 && (
            <div className="bg-white dark:bg-white/[0.08] p-8 rounded-[3rem] border border-slate-200 dark:border-white/20 shadow-2xl">
              <h3 className="text-lg font-black uppercase tracking-widest text-brand-blue dark:text-brand-yellow mb-6">Tipologie Service</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={statsData.servicesByType.slice(0, 5)}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                  >
                    {statsData.servicesByType.slice(0, 5).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={['#0033A0', '#E31837', '#FFC72C', '#8B5CF6', '#10B981'][index % 5]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
          
          {statsData.topClubs.length > 0 && (
            <div className="bg-white dark:bg-white/[0.08] p-8 rounded-[3rem] border border-slate-200 dark:border-white/20 shadow-2xl">
              <h3 className="text-lg font-black uppercase tracking-widest text-brand-blue dark:text-brand-yellow mb-6">Top Club</h3>
              <div className="space-y-4">
                {statsData.topClubs.slice(0, 4).map((club, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className={`font-black text-sm w-6 ${i === 0 ? 'text-brand-yellow' : 'text-slate-400'}`}>#{i + 1}</span>
                    <div className="flex-1 h-2 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-brand-blue" style={{ width: `${(club.score / statsData.topClubs[0].score) * 100}%` }} />
                    </div>
                    <span className="text-sm font-bold">{club.score}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <Footer />
      </div>
    );
  }

  // Lions Activities Stats View
  if (showLionsStats) {
    return (
      <div className="min-h-screen bg-slate-100 dark:bg-[#060D1F] transition-colors duration-500 aurora-bg">
        <Navbar isAdmin={isAdmin} userProfile={userProfile} ThemeSwitcher={ThemeSwitcher} />
        <div className="relative z-10 max-w-5xl mx-auto p-4 sm:p-12 space-y-8 pb-24 text-brand-dark dark:text-white animate-fade-in-up">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setShowLionsStats(false)}
              className="cursor-pointer bg-brand-blue dark:bg-brand-yellow text-white dark:text-brand-dark font-black px-6 py-3 rounded-2xl flex items-center gap-2 shadow-lg hover-lift transition-all border-none"
            >
              ← Classifica
            </button>
          </div>
          
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-black uppercase tracking-tight text-brand-red dark:text-brand-yellow">Attività Lions</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-bold uppercase tracking-widest">Service Activities</p>
          </div>
          
          {/* KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="bg-gradient-to-br from-brand-red to-brand-red/80 p-5 rounded-2xl text-white shadow-xl">
              <Heart size={20} className="opacity-70 mb-2" />
              <div className="text-3xl font-black">{lionsStats.total}</div>
              <div className="text-xs font-bold uppercase tracking-widest opacity-80 mt-1">Attività</div>
            </div>
            <div className="bg-gradient-to-br from-brand-blue to-brand-blue/80 p-5 rounded-2xl text-white shadow-xl">
              <Building2 size={20} className="opacity-70 mb-2" />
              <div className="text-3xl font-black">{lionsStats.clubs}</div>
              <div className="text-xs font-bold uppercase tracking-widest opacity-80 mt-1">Club</div>
            </div>
            <div className="bg-gradient-to-br from-green-500 to-green-600 p-5 rounded-2xl text-white shadow-xl">
              <Users size={20} className="opacity-70 mb-2" />
              <div className="text-3xl font-black">{lionsStats.persone}</div>
              <div className="text-xs font-bold uppercase tracking-widest opacity-80 mt-1">Persone</div>
            </div>
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-5 rounded-2xl text-white shadow-xl">
              <Users size={20} className="opacity-70 mb-2" />
              <div className="text-3xl font-black">{lionsStats.volontari}</div>
              <div className="text-xs font-bold uppercase tracking-widest opacity-80 mt-1">Volontari</div>
            </div>
            <div className="bg-gradient-to-br from-amber-500 to-amber-600 p-5 rounded-2xl text-white shadow-xl">
              <Clock size={20} className="opacity-70 mb-2" />
              <div className="text-3xl font-black">{lionsStats.ore}</div>
              <div className="text-xs font-bold uppercase tracking-widest opacity-80 mt-1">Ore</div>
            </div>
            <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-5 rounded-2xl text-white shadow-xl">
              <DollarSign size={20} className="opacity-70 mb-2" />
              <div className="text-3xl font-black">€{lionsStats.fondi}</div>
              <div className="text-xs font-bold uppercase tracking-widest opacity-80 mt-1">Fondi</div>
            </div>
          </div>
          
          {/* Causa Distribution */}
          {lionsStats.byCausa.length > 0 && (
            <div className="bg-white dark:bg-white/[0.08] p-8 rounded-[3rem] border border-slate-200 dark:border-white/20 shadow-2xl">
              <h3 className="text-lg font-black uppercase tracking-widest text-brand-blue dark:text-brand-yellow mb-6">Attività per Causa</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={lionsStats.byCausa}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                  >
                    {lionsStats.byCausa.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={['#0033A0', '#E31837', '#FFC72C', '#8B5CF6', '#10B981', '#F59E0B', '#EC4899'][index % 7]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-[#060D1F] transition-colors duration-500 aurora-bg">
      <Navbar isAdmin={isAdmin} userProfile={userProfile} ThemeSwitcher={ThemeSwitcher} />

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-8 pt-8 pb-24 space-y-8 text-brand-dark dark:text-white">
        {/* HERO */}
        <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-white to-slate-50 dark:from-white/[0.06] dark:to-transparent border border-slate-200/60 dark:border-white/[0.06] shadow-lg group animate-fade-in-up">
          {/* Background accent */}
          <div className="absolute top-0 right-0 w-72 h-72 bg-brand-blue/[0.04] dark:bg-brand-blue/[0.08] rounded-full blur-[80px] group-hover:bg-brand-blue/[0.06] dark:group-hover:bg-brand-blue/[0.12] transition-all duration-1000"></div>
          <div className="absolute bottom-0 left-0 w-56 h-56 bg-brand-yellow/[0.05] dark:bg-brand-yellow/[0.06] rounded-full blur-[60px]"></div>
          <div className="relative z-10 p-8 sm:p-10 text-center sm:text-left">
            <h2 className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.35em] text-brand-red/80 dark:text-brand-yellow/70 mb-2">
              Lions District Network
            </h2>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tighter mb-8 uppercase text-brand-dark dark:text-white">
              {isAdmin ? 'Classifica Completa' : 'La Mia Classifica'}
            </h1>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => navigate('/insert')}
                className="w-full sm:w-auto cursor-pointer bg-brand-blue dark:bg-white text-white dark:text-brand-dark font-black px-8 py-4 rounded-2xl flex items-center justify-center gap-3 shadow-lg shadow-brand-blue/20 dark:shadow-none hover-lift transition-all text-sm border-none"
              >
                <Plus size={20} /> NUOVA ANALISI
              </button>
              <button
                onClick={() => setShowStats(!showStats)}
                className="w-full sm:w-auto cursor-pointer bg-brand-yellow text-brand-dark font-black px-7 py-4 rounded-2xl flex items-center justify-center gap-3 shadow-lg shadow-brand-yellow/15 hover-lift transition-all text-sm border-none"
              >
                <BarChart3 size={18} /> {showStats ? 'CLASSIFICA' : 'STATISTICHE'}
              </button>
              {isAdmin && (
                <button
                  onClick={() => setShowLionsStats(!showLionsStats)}
                  className="w-full sm:w-auto cursor-pointer bg-brand-red/10 dark:bg-brand-red/20 text-brand-red dark:text-brand-yellow font-black px-7 py-4 rounded-2xl flex items-center justify-center gap-3 shadow-lg shadow-brand-red/10 hover-lift transition-all text-sm border-none"
                >
                  <Heart size={18} /> {showLionsStats ? 'CLASSIFICA' : 'ATTIVITÀ'}
                </button>
              )}
              {isAdmin && (
                <button
                  onClick={() => navigate('/admin/classifica')}
                  className="w-full sm:w-auto cursor-pointer bg-brand-red text-white font-black px-7 py-4 rounded-2xl flex items-center justify-center gap-3 shadow-lg shadow-brand-red/15 hover-lift transition-all text-sm border-none"
                >
                  <Shield size={18} /> ADMIN
                </button>
              )}
            </div>
          </div>
        </div>

        {/* LEADERBOARD */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h3 className="text-lg font-black uppercase tracking-tight flex items-center gap-2.5">
              <Trophy size={20} className="text-brand-yellow" /> Ranking Live
            </h3>
            <div className="flex gap-2.5">
              <input
                type="text"
                placeholder="Cerca club..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-4 py-2.5 rounded-2xl text-sm font-bold bg-white dark:bg-white/[0.04] border border-slate-200/60 dark:border-white/[0.06] text-brand-dark dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 outline-none focus:border-brand-blue/30 dark:focus:border-brand-yellow/20 transition-all"
              />
              <button
                onClick={exportPDF}
                className="px-4 py-2.5 bg-brand-blue/10 dark:bg-brand-yellow/10 text-brand-blue dark:text-brand-yellow rounded-2xl font-black text-sm flex items-center gap-2 cursor-pointer border-none hover:bg-brand-blue/15 dark:hover:bg-brand-yellow/15 transition-all"
              >
                <Download size={15} /> PDF
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-3">
            {leaderboard.length === 0 ? (
              <div className="text-center p-16 bg-slate-50 dark:bg-white/[0.02] rounded-[2rem] border border-dashed border-slate-200 dark:border-white/10 text-slate-400 dark:text-slate-600 font-bold uppercase tracking-widest text-xs italic">
                {isAdmin ? 'Nessun dato presente.' : 'Nessun dato per i tuoi club.'}
              </div>
            ) : (
              leaderboard
                .filter((item) => item.nome.toLowerCase().includes(searchTerm.toLowerCase()))
                .map((item, i) => {
                const maxScore = leaderboard[0]?.score || 1;
                const progress = (item.score / maxScore) * 100;
                return (
                  <div 
                    key={i} 
                    className={`relative overflow-hidden p-5 sm:p-6 rounded-[2rem] border transition-all shadow-sm group stagger-item hover-magnetic ${
                      i === 0 
                        ? 'bg-gradient-to-r from-brand-yellow/10 to-transparent dark:from-brand-yellow/[0.05] border-brand-yellow/30 dark:border-brand-yellow/20' 
                        : 'bg-white dark:bg-white/[0.03] border-slate-200/60 dark:border-white/[0.04]'
                    }`}
                  >
                    {/* Progress bar */}
                    <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-slate-100 dark:bg-white/[0.04]">
                      <div 
                        className={`h-full rounded-full transition-all duration-1000 ${i === 0 ? 'bg-gradient-to-r from-brand-yellow to-amber-400' : 'bg-gradient-to-r from-brand-blue to-brand-blue/60'}`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0 relative z-10">
                      <div className="flex items-center gap-3 sm:gap-6">
                        {/* Position badge with icons or club logo */}
                        <div className={`relative w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center rounded-[1rem] sm:rounded-[1.25rem] font-black text-lg sm:text-xl shadow-inner transition-transform group-hover:scale-110 shrink-0 overflow-hidden ${
                          i === 0 
                            ? 'bg-gradient-to-br from-brand-yellow to-amber-500 text-brand-dark' 
                            : i === 1 
                            ? 'bg-gradient-to-br from-slate-300 to-slate-400 text-slate-700'
                            : 'bg-slate-50 dark:bg-white/10 text-brand-blue dark:text-white border dark:border-white/20'
                        }`}>
                          {item.logo ? (
                            <img src={item.logo} alt={item.nome} className="w-full h-full object-cover" />
                          ) : (
                            <>
                              {i === 0 && (
                                <span className="absolute -top-2 -right-2 text-base sm:text-lg">👑</span>
                              )}
                              {i === 1 && (
                                <span className="absolute -top-2 -right-2 text-base sm:text-lg">🥈</span>
                              )}
                              {i === 2 && (
                                <span className="absolute -top-2 -right-2 text-base sm:text-lg">🥉</span>
                              )}
                              {i > 2 && `#${i + 1}`}
                            </>
                          )}
                        </div>
                        
                        <span className="text-sm sm:text-lg font-black uppercase tracking-tight">
                          {item.nome}
                        </span>
                      </div>
                      
                      <div className="text-right sm:text-left pl-14 sm:pl-0">
                        <div className={`text-2xl sm:text-3xl font-black leading-none ${i === 0 ? 'text-brand-yellow drop-shadow-md' : 'text-brand-blue dark:text-white'}`}>
                          {item.score.toFixed(1)}
                        </div>
                        <div className="text-[9px] font-black uppercase text-brand-red dark:text-brand-yellow tracking-widest mt-1">Punti</div>
                      </div>
                    </div>

                    {/* Progress percentage shown on hover */}
                    <div className="absolute bottom-2 right-4 text-[8px] font-bold opacity-0 group-hover:opacity-100 transition-opacity text-slate-400">
                      {progress.toFixed(0)}%
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
