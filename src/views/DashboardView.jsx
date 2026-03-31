// =============================================================================
// VIEW: DashboardView - Pagina principale dopo il login
// =============================================================================
// ADMIN: mostra TUTTI i club + classifica completa
// REFERENTE: mostra classifica filtrata solo dei club associati
// =============================================================================

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, Plus, Shield, Download, BarChart3 } from 'lucide-react';
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
  const [statsData, setStatsData] = useState({ servicesByMonth: [], servicesByType: [], topClubs: [] });

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
        const clubName = s.club?.nome || 'Sconosciuto';
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

  if (showStats) {
    return (
      <div className="min-h-screen bg-slate-100 dark:bg-[#060D1F] transition-colors duration-500">
        <Navbar isAdmin={isAdmin} userProfile={userProfile} ThemeSwitcher={ThemeSwitcher} />
        
        <div className="max-w-5xl mx-auto p-4 sm:p-12 space-y-8 pb-24 text-brand-dark dark:text-white animate-fade-in-up">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setShowStats(false)}
              className="cursor-pointer bg-brand-blue dark:bg-brand-yellow text-white dark:text-brand-dark font-black px-6 py-3 rounded-2xl flex items-center gap-2 shadow-lg hover:scale-105 transition-all border-none"
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
                  <Bar dataKey="service" fill="#0033A0" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {statsData.servicesByType.length > 0 && (
              <div className="bg-white dark:bg-white/[0.08] p-8 rounded-[3rem] border border-slate-200 dark:border-white/20 shadow-2xl">
                <h3 className="text-lg font-black uppercase tracking-widest text-brand-red dark:text-brand-yellow mb-6">Tipologie</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={statsData.servicesByType} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={40} outerRadius={70}>
                      {statsData.servicesByType.map((_, i) => (
                        <Cell key={i} fill={['#0033A0', '#E31837', '#FFC72C', '#28A745', '#6F42C1'][i % 5]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
            
            {statsData.topClubs.length > 0 && (
              <div className="bg-white dark:bg-white/[0.08] p-8 rounded-[3rem] border border-slate-200 dark:border-white/20 shadow-2xl">
                <h3 className="text-lg font-black uppercase tracking-widest text-brand-yellow mb-6">Top Club</h3>
                <div className="space-y-3">
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
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-12 space-y-10 pb-24 text-brand-dark dark:text-white">
      {/* HERO */}
        <div className="p-10 rounded-[3.5rem] bg-white dark:bg-white/[0.08] border border-slate-200 dark:border-white/20 relative overflow-hidden shadow-xl group animate-fade-in-up">
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-brand-blue/5 dark:bg-brand-blue/15 rounded-full blur-3xl group-hover:bg-brand-blue/20 transition-all duration-700 animate-pulse-glow"></div>
          <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-brand-yellow/10 dark:bg-brand-yellow/5 rounded-full blur-3xl"></div>
          <div className="relative z-10 text-center sm:text-left">
            <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-red dark:text-brand-yellow mb-3 font-bold shimmer-text">
              Lions District Network
            </h2>
            <h1 className="text-4xl lg:text-5xl font-black tracking-tighter mb-10 uppercase">
              {isAdmin ? 'Classifica Completa' : 'La Mia Classifica'}
            </h1>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => navigate('/insert')}
                className="w-full sm:w-auto cursor-pointer bg-brand-blue dark:bg-white text-white dark:text-brand-dark font-black px-10 py-5 rounded-3xl flex items-center justify-center gap-4 shadow-2xl hover:scale-105 hover-glow transition-all text-lg border-none glow-blue"
              >
                <Plus size={24} className="bg-white dark:bg-brand-dark text-brand-blue dark:text-white rounded-xl p-1" />
                NUOVA ANALISI
              </button>
              <button
                onClick={() => setShowStats(!showStats)}
                className="w-full sm:w-auto cursor-pointer bg-brand-yellow text-brand-dark font-black px-8 py-5 rounded-3xl flex items-center justify-center gap-3 shadow-xl hover:scale-105 hover-glow transition-all text-sm border-none glow-yellow"
              >
                <BarChart3 size={20} /> {showStats ? 'CLASSIFICA' : 'STATISTICHE'}
              </button>
              {isAdmin && (
                <button
                  onClick={() => navigate('/admin/classifica')}
                  className="w-full sm:w-auto cursor-pointer bg-brand-red text-white font-black px-8 py-5 rounded-3xl flex items-center justify-center gap-3 shadow-xl hover:scale-105 hover-glow transition-all text-sm border-none glow-red"
                >
                  <Shield size={20} /> ADMIN
                </button>
              )}
            </div>
          </div>
        </div>

        {/* LEADERBOARD */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 ml-4">
            <h3 className="text-xl font-black uppercase tracking-tight flex items-center gap-3">
              <Trophy className="text-brand-yellow drop-shadow-sm" /> Ranking Live
            </h3>
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="Cerca club..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-4 py-2 rounded-xl text-sm font-bold bg-white dark:bg-white/[0.08] border border-slate-200 dark:border-white/20 text-brand-dark dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-brand-blue"
              />
              <button
                onClick={exportPDF}
                className="px-4 py-2 bg-brand-blue dark:bg-brand-yellow text-white dark:text-brand-dark rounded-xl font-black text-sm flex items-center gap-2 cursor-pointer border-none hover:shadow-lg transition-all"
              >
                <Download size={16} /> PDF
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 font-bold">
            {leaderboard.length === 0 ? (
              <div className="text-center p-16 bg-white dark:bg-white/[0.08] rounded-[3rem] border border-dashed border-slate-300 dark:border-white/20 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest text-xs italic">
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
                    className={`relative overflow-hidden p-6 rounded-[2.5rem] border transition-all shadow-sm group animate-slide-up ${
                      i === 0 
                        ? 'bg-gradient-to-r from-brand-yellow/20 to-transparent dark:from-brand-yellow/10 border-brand-yellow/50 shadow-[0_0_30px_rgba(255,199,44,0.3)]' 
                        : 'bg-white dark:bg-white/[0.08] border-slate-200 dark:border-white/20 hover:border-brand-blue/40'
                    }`}
                    style={{ animationDelay: `${i * 80}ms` }}
                  >
                    {/* Progress bar background */}
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-200 dark:bg-white/10">
                      <div 
                        className={`h-full transition-all duration-1000 ${i === 0 ? 'bg-brand-yellow' : 'bg-brand-blue'}`}
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
