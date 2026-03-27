import { useNavigate } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';

export default function SuccessView({ resolvedTheme }) {
  const navigate = useNavigate();

  return (
    <div
      className={`min-h-screen flex flex-col items-center justify-center p-8 text-center transition-all duration-500 relative overflow-hidden ${
        resolvedTheme === 'dark' ? 'bg-[#0B132B]' : 'bg-slate-100'
      }`}
    >
      <div className="absolute inset-0 bg-radial-gradient from-brand-yellow/10 to-transparent opacity-30 animate-pulse"></div>
      <div className="bg-gradient-to-br from-[#0033A0] via-[#E31837] to-[#FFC72C] p-16 rounded-[5rem] animate-bounce shadow-2xl mb-12 relative z-10 border-4 border-white/20">
        <CheckCircle2 size={120} className="text-white drop-shadow-2xl" />
      </div>
      <h1 className="text-7xl font-black text-brand-blue dark:text-white tracking-tighter mb-6 uppercase leading-none relative z-10 italic">
        MISSIONE
        <br />
        <span className="text-brand-yellow">COMPLETATA</span>
      </h1>
      <p className="text-slate-600 dark:text-slate-400 font-black uppercase tracking-[0.5em] mb-16 relative z-10 text-sm italic">
        DATABASE AGGIORNATO
      </p>
      <button
        onClick={() => navigate('/dashboard')}
        className="px-24 py-8 bg-brand-blue dark:bg-white text-white dark:text-brand-dark font-black rounded-[3rem] uppercase tracking-widest text-xl hover:shadow-2xl active:scale-95 transition-all cursor-pointer relative z-10 border-none"
      >
        DASHBOARD
      </button>
    </div>
  );
}
