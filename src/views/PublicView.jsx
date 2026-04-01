// =============================================================================
// VIEW: PublicView - Dashboard pubblica per visitatori non loggati
// =============================================================================
// Landing page + classifica pubblica + statistiche generali
// Accessibile senza login
// =============================================================================

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, BarChart3, Users, Building2, ArrowRight, LogIn } from 'lucide-react';
import { supabase } from '../lib/supabase';
import BrandLogo from '../components/BrandLogo';
import Footer from '../components/Footer';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function PublicView({ resolvedTheme, ThemeSwitcher }) {
  const navigate = useNavigate();
  const [leaderboard, setLeaderboard] = useState([]);
  const [stats, setStats] = useState({ total: 0, clubs: 0, topScore: 0 });
  const [statsData, setStatsData] = useState({ byType: [], byMonth: [] });

  useEffect(() => {
    const fetchData = async () => {
      // Fetch leaderboard
      const { data: services } = await supabase
        .from('service_inseriti')
        .select('punteggio_totale, id_club, club(nome, logo_url), data_inserimento, tipi_service(nome)');

      if (services && services.length > 0) {
        // Build leaderboard
        const scores = {};
        services.forEach((item) => {
          const name = item.club?.nome || `Club ${item.id_club}`;
          const logo = item.club?.logo_url || null;
          if (!scores[name]) scores[name] = { score: 0, logo };
          scores[name].score += (item.punteggio_totale || 0);
        });

        const lb = Object.entries(scores)
          .map(([nome, data]) => ({ nome, score: data.score, logo: data.logo }))
          .sort((a, b) => b.score - a.score);
        setLeaderboard(lb);

        // Stats
        const uniqueClubs = new Set(services.map((s) => s.club?.nome).filter(Boolean));
        setStats({
          total: services.length,
          clubs: uniqueClubs.size,
          topScore: lb[0]?.score || 0,
        });

        // By type
        const byType = {};
        services.forEach((s) => {
          const t = s.tipi_service?.nome || 'Altro';
          byType[t] = (byType[t] || 0) + 1;
        });
        setStatsData((prev) => ({
          ...prev,
          byType: Object.entries(byType)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 5),
        }));

        // By month
        const byMonth = {};
        services.forEach((s) => {
          const d = new Date(s.data_inserimento);
          const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
          byMonth[key] = (byMonth[key] || 0) + 1;
        });
        setStatsData((prev) => ({
          ...prev,
          byMonth: Object.entries(byMonth)
            .sort((a, b) => a[0].localeCompare(b[0]))
            .map(([month, count]) => ({ month, service: count })),
        }));
      }
    };
    fetchData();
  }, []);

  const chartColors = ['#0033A0', '#E31837', '#FFC72C', '#8B5CF6', '#10B981'];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#060D1F] transition-colors duration-500 aurora-bg overflow-x-hidden">
      {/* Top bar */}
      <nav className="relative z-50 flex justify-between items-center px-6 py-4">
        <BrandLogo className="h-8" />
        <div className="flex items-center gap-3">
          <ThemeSwitcher />
          <button
            onClick={() => navigate('/login')}
            className="flex items-center gap-2 px-5 py-2.5 bg-brand-blue text-white rounded-2xl font-black text-xs uppercase tracking-wider cursor-pointer border-none hover-lift shadow-lg shadow-brand-blue/20"
          >
            <LogIn size={16} /> Accedi
          </button>
        </div>
      </nav>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-8 pb-24">
        {/* HERO */}
        <section className="text-center py-16 sm:py-24 space-y-6 animate-fade-in-up">
          <div className="inline-block">
            <BrandLogo className="h-20 sm:h-28 mb-4" />
          </div>
          <h1 className="text-4xl sm:text-6xl font-black uppercase tracking-tighter text-brand-dark dark:text-white">
            Service<span className="text-brand-blue dark:text-brand-yellow">Score</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base font-medium max-w-xl mx-auto leading-relaxed">
            La piattaforma digitale per la rendicontazione e la classificazione dei Service Lions Club Italia.
            Trasparenza, competizione e beneficenza in un'unica app.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
            <button
              onClick={() => navigate('/login')}
              className="cursor-pointer bg-gradient-to-r from-brand-blue to-brand-blue/90 text-white font-black px-8 py-4 rounded-2xl shadow-lg shadow-brand-blue/20 hover-lift transition-all text-sm uppercase tracking-wider border-none"
            >
              Inizia Ora — È Gratis
            </button>
            <a
              href="#classifica"
              className="cursor-pointer bg-white dark:bg-white/[0.05] text-brand-blue dark:text-brand-yellow font-black px-8 py-4 rounded-2xl border border-slate-200 dark:border-white/[0.06] hover-lift transition-all text-sm uppercase tracking-wider text-center"
            >
              Vedi Classifica ↓
            </a>
          </div>
        </section>

        {/* KPI CARDS */}
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-16 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
          {[
            { label: 'Service Registrati', value: stats.total, icon: Trophy, color: 'from-brand-blue to-brand-blue/80' },
            { label: 'Club Attivi', value: stats.clubs, icon: Building2, color: 'from-brand-red to-brand-red/80' },
            { label: 'Punteggio Max', value: Math.round(stats.topScore), icon: BarChart3, color: 'from-brand-yellow to-amber-500' },
            { label: 'Referenti', value: '—', icon: Users, color: 'from-purple-600 to-purple-500' },
          ].map((kpi, i) => (
            <div key={i} className={`bg-gradient-to-br ${kpi.color} p-5 rounded-2xl text-white shadow-lg`}>
              <kpi.icon size={20} className="opacity-70 mb-2" />
              <div className="text-2xl sm:text-3xl font-black">{kpi.value}</div>
              <div className="text-[9px] font-bold uppercase tracking-widest opacity-80 mt-1">{kpi.label}</div>
            </div>
          ))}
        </section>

        {/* CLASSIFICA PUBBLICA */}
        <section id="classifica" className="space-y-6 mb-16">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-brand-dark dark:text-white">
              Classifica <span className="text-brand-blue dark:text-brand-yellow">Live</span>
            </h2>
            <p className="text-slate-400 dark:text-slate-500 text-xs font-bold uppercase tracking-widest">
              Ranking aggiornato in tempo reale
            </p>
          </div>

          <div className="space-y-3">
            {leaderboard.length === 0 ? (
              <div className="text-center p-16 bg-white dark:bg-white/[0.03] rounded-2xl border border-dashed border-slate-200 dark:border-white/10 text-slate-400 dark:text-slate-600 text-sm font-bold italic">
                Classifica in arrivo...
              </div>
            ) : (
              leaderboard.slice(0, 10).map((item, i) => {
                const maxScore = leaderboard[0]?.score || 1;
                const progress = (item.score / maxScore) * 100;
                return (
                  <div
                    key={i}
                    className={`relative overflow-hidden p-4 sm:p-5 rounded-2xl border transition-all stagger-item hover-magnetic ${
                      i === 0
                        ? 'bg-gradient-to-r from-brand-yellow/[0.08] to-transparent dark:from-brand-yellow/[0.04] border-brand-yellow/30 dark:border-brand-yellow/15'
                        : 'bg-white dark:bg-white/[0.03] border-slate-200/60 dark:border-white/[0.04]'
                    }`}
                  >
                    {/* Progress bar */}
                    <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-slate-100 dark:bg-white/[0.04]">
                      <div
                        className={`h-full rounded-full transition-all duration-1000 ${
                          i === 0 ? 'bg-gradient-to-r from-brand-yellow to-amber-400' : 'bg-gradient-to-r from-brand-blue to-brand-blue/60'
                        }`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between relative z-10">
                      <div className="flex items-center gap-3 sm:gap-4">
                        {/* Position */}
                        <div
                          className={`w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center rounded-xl font-black text-sm shadow-inner shrink-0 overflow-hidden ${
                            i === 0
                              ? 'bg-gradient-to-br from-brand-yellow to-amber-500 text-brand-dark'
                              : i === 1
                              ? 'bg-gradient-to-br from-slate-300 to-slate-400 text-slate-700'
                              : i === 2
                              ? 'bg-gradient-to-br from-amber-600 to-amber-700 text-white'
                              : 'bg-slate-50 dark:bg-white/[0.04] text-slate-500 dark:text-slate-400'
                          }`}
                        >
                          {item.logo ? (
                            <img src={item.logo} alt={item.nome} className="w-full h-full object-cover" />
                          ) : (
                            <>
                              {i < 3 ? ['👑', '🥈', '🥉'][i] : `#${i + 1}`}
                            </>
                          )}
                        </div>

                        <div>
                          <span className="font-black text-sm sm:text-base uppercase tracking-tight text-brand-dark dark:text-white">
                            {item.nome}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className={`text-xl sm:text-2xl font-black ${i === 0 ? 'text-brand-yellow' : 'text-brand-blue dark:text-white'}`}>
                          {item.score.toFixed(1)}
                        </span>
                        <div className="text-[8px] font-bold uppercase text-slate-400 dark:text-slate-500 tracking-widest">punti</div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {leaderboard.length > 0 && (
            <div className="text-center pt-4">
              <button
                onClick={() => navigate('/login')}
                className="inline-flex items-center gap-2 text-brand-blue dark:text-brand-yellow font-black text-xs uppercase tracking-widest hover:gap-3 transition-all cursor-pointer"
              >
                Vedi tutti i dettagli <ArrowRight size={14} />
              </button>
            </div>
          )}
        </section>

        {/* STATISTICHE PUBBLICHE */}
        {statsData.byType.length > 0 && (
          <section className="space-y-8 mb-16">
            <div className="text-center space-y-2">
              <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-brand-dark dark:text-white">
                Statistiche <span className="text-brand-red">General</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Servizi per mese */}
              {statsData.byMonth.length > 0 && (
                <div className="bg-white dark:bg-white/[0.03] p-6 sm:p-8 rounded-2xl border border-slate-200/60 dark:border-white/[0.04] shadow-sm">
                  <h3 className="text-sm font-black uppercase tracking-widest text-brand-blue dark:text-brand-yellow mb-4">
                    Andamento Mensile
                  </h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={statsData.byMonth}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,51,160,0.06)" />
                      <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                      <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} />
                      <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 30px rgba(0,0,0,0.08)' }} />
                      <Bar dataKey="service" fill="#0033A0" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Servizi per tipo */}
              <div className="bg-white dark:bg-white/[0.03] p-6 sm:p-8 rounded-2xl border border-slate-200/60 dark:border-white/[0.04] shadow-sm">
                <h3 className="text-sm font-black uppercase tracking-widest text-brand-red dark:text-brand-yellow mb-4">
                  Per Tipologia
                </h3>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={statsData.byType}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={4}
                      animationDuration={1500}
                    >
                      {statsData.byType.map((_, i) => (
                        <Cell key={i} fill={chartColors[i % 5]} stroke="none" />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 30px rgba(0,0,0,0.08)' }} />
                  </PieChart>
                </ResponsiveContainer>
                {/* Legend */}
                <div className="flex flex-wrap justify-center gap-3 mt-2">
                  {statsData.byType.map((item, i) => (
                    <div key={i} className="flex items-center gap-1.5 text-[10px] font-bold">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: chartColors[i % 5] }}></div>
                      <span className="text-slate-500 dark:text-slate-400">{item.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* CTA SECTION */}
        <section className="text-center py-16 space-y-6 bg-gradient-to-br from-brand-blue/[0.04] to-brand-yellow/[0.04] dark:from-brand-blue/[0.02] dark:to-brand-yellow/[0.02] rounded-3xl mb-8">
          <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tighter text-brand-dark dark:text-white">
            Partecipa al <span className="text-brand-blue dark:text-brand-yellow">Service</span>
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm max-w-md mx-auto leading-relaxed">
            Registrati per inserire i tuoi service, monitorare il tuo club e contribuire alla classifica Lions.
          </p>
          <button
            onClick={() => navigate('/login')}
            className="cursor-pointer bg-gradient-to-r from-brand-blue via-brand-red to-brand-yellow text-white font-black px-10 py-5 rounded-2xl shadow-xl hover-lift transition-all text-base uppercase tracking-wider border-none"
          >
            Registrati Ora — È Gratuito
          </button>
        </section>
      </div>

      <Footer />
    </div>
  );
}
