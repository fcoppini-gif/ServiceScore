import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, Plus, LogOut } from 'lucide-react';
import { supabase } from '../lib/supabase';
import BrandLogo from '../components/BrandLogo';

export default function DashboardView({ resolvedTheme, ThemeSwitcher }) {
  const navigate = useNavigate();
  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      const { data, error } = await supabase
        .from('service_inseriti')
        .select(`punteggio_totale, id_club, club(nome)`);

      if (error) {
        console.error('Errore fetch classifica:', error);
        return;
      }

      if (data) {
        const scores = data.reduce((acc, item) => {
          const name = item.club?.nome || `Club ID: ${item.id_club}`;
          acc[name] = (acc[name] || 0) + (item.punteggio_totale || 0);
          return acc;
        }, {});

        const sorted = Object.entries(scores)
          .map(([nome, score]) => ({ nome, score }))
          .sort((a, b) => b.score - a.score);

        setLeaderboard(sorted);
      }
    };

    fetchLeaderboard();
  }, []);

  return (
    <div
      className={`min-h-screen transition-colors duration-500 ${
        resolvedTheme === 'dark' ? 'bg-[#0B132B]' : 'bg-slate-100'
      }`}
    >
      <nav className="px-6 py-4 sm:py-5 flex justify-between items-center border-b border-slate-200 dark:border-white/5 bg-white/80 dark:bg-white/5 backdrop-blur-xl sticky top-0 z-50 shadow-sm">
        <BrandLogo className="h-8 sm:h-10" />
        <div className="flex items-center gap-4">
          <ThemeSwitcher />
          <button
            onClick={() => supabase.auth.signOut()}
            className="p-3 bg-red-50 dark:bg-white/5 rounded-2xl text-brand-red hover:bg-brand-red hover:text-white transition-all shadow-sm cursor-pointer border-none"
          >
            <LogOut size={20} />
          </button>
        </div>
      </nav>
      <div className="max-w-5xl mx-auto p-4 sm:p-12 space-y-10 pb-24 text-brand-dark dark:text-white">
        <div className="p-10 rounded-[3.5rem] bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 relative overflow-hidden shadow-xl group">
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-brand-blue/5 dark:bg-brand-blue/10 rounded-full blur-3xl group-hover:bg-brand-blue/20 transition-all duration-700"></div>
          <div className="relative z-10 text-center sm:text-left">
            <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-red dark:text-brand-yellow mb-3 font-bold">
              Lions District Network
            </h2>
            <h1 className="text-4xl lg:text-5xl font-black tracking-tighter mb-10 uppercase">
              Classifica Club
            </h1>
            <button
              onClick={() => navigate('/insert')}
              className="w-full sm:w-auto cursor-pointer bg-brand-blue dark:bg-white text-white dark:text-brand-dark font-black px-10 py-5 rounded-3xl flex items-center justify-center gap-4 shadow-2xl hover:scale-105 transition-all text-lg border-none"
            >
              <Plus
                size={24}
                className="bg-white dark:bg-brand-dark text-brand-blue dark:text-white rounded-xl p-1"
              />{' '}
              NUOVA ANALISI
            </button>
          </div>
        </div>
        <div className="space-y-6">
          <h3 className="text-xl font-black uppercase tracking-tight flex items-center gap-3 ml-4">
            <Trophy className="text-brand-yellow drop-shadow-sm" /> Ranking Live
          </h3>
          <div className="grid grid-cols-1 gap-4 font-bold">
            {leaderboard.length === 0 ? (
              <div className="text-center p-16 bg-white dark:bg-white/5 rounded-[3rem] border border-dashed border-slate-300 dark:border-white/10 text-slate-400 font-bold uppercase tracking-widest text-xs italic">
                Nessun dato visibile. Controlla i permessi SELECT di Supabase.
              </div>
            ) : (
              leaderboard.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-6 bg-white dark:bg-white/5 rounded-[2.5rem] border border-slate-200 dark:border-white/10 hover:border-brand-blue/40 transition-all shadow-sm group"
                >
                  <div className="flex items-center gap-6">
                    <div
                      className={`w-14 h-14 flex items-center justify-center rounded-[1.25rem] font-black text-xl shadow-inner transition-transform group-hover:scale-110 ${
                        i === 0
                          ? 'bg-gradient-to-br from-brand-yellow to-amber-500 text-brand-dark'
                          : i === 1
                          ? 'bg-slate-300 text-slate-700'
                          : 'bg-slate-50 dark:bg-white/5 text-brand-blue/60 dark:text-white border dark:border-white/10 font-bold'
                      }`}
                    >
                      #{i + 1}
                    </div>
                    <span className="text-lg font-black uppercase tracking-tight truncate max-w-[200px] sm:max-w-none">
                      {item.nome}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-black text-brand-blue dark:text-white leading-none">
                      {item.score.toFixed(1)}
                    </div>
                    <div className="text-[9px] font-black uppercase text-brand-red dark:text-brand-yellow tracking-widest mt-1">
                      Punti Totali
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
