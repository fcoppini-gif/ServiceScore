// =============================================================================
// VIEW: SuccessView - Pagina di conferma dopo salvataggio riuscito
// =============================================================================
// Mostra un'animazione di successo e un pulsante per tornare alla dashboard.
// Appare dopo che InsertWizardView ha salvato con successo su Supabase.
//
// COLLEGAMENTI:
// - InsertWizardView naviga a /success dopo handleSave completato
// - Il pulsante "DASHBOARD" naviga a /dashboard
// =============================================================================

import { useNavigate } from 'react-router-dom';

export default function SuccessView({ resolvedTheme }) {
  const navigate = useNavigate();

  return (
    <div
      className={`min-h-screen flex flex-col items-center justify-center p-6 sm:p-8 text-center transition-all duration-500 relative overflow-hidden ${
        resolvedTheme === 'dark' ? 'bg-[#0B132B]' : 'bg-slate-100'
      }`}
    >
      {/* Sfondo con gradiente radiale pulsante */}
      <div className="absolute inset-0 bg-radial-gradient from-brand-yellow/10 to-transparent opacity-30 animate-pulse"></div>
      
      {/* Logo */}
      <div className="animate-bounce mb-8 sm:mb-12 relative z-10">
        <img 
          src="/logo_ufficiale.png" 
          alt="ServiceScore" 
          className="h-24 sm:h-32 w-auto object-contain drop-shadow-lg"
        />
      </div>

      <h1 className="text-4xl sm:text-6xl font-black text-brand-blue dark:text-white tracking-tighter mb-4 sm:mb-6 uppercase leading-none relative z-10 italic">
        MISSIONE
        <br />
        <span className="text-brand-yellow drop-shadow-lg animate-bounce inline-block" style={{ animationDuration: '2s' }}>COMPLETATA</span>
      </h1>

      <p className="text-slate-600 dark:text-slate-400 font-black uppercase tracking-[0.3em] sm:tracking-[0.5em] mb-10 sm:mb-16 relative z-10 text-xs sm:text-sm italic">
        DATABASE AGGIORNATO
      </p>

      {/* Pulsante per tornare alla classifica */}
      <button
        onClick={() => navigate('/dashboard')}
        className="group relative px-14 sm:px-28 py-6 sm:py-8 font-black rounded-[3rem] sm:rounded-[4rem] uppercase tracking-[0.2em] text-lg sm:text-2xl hover:scale-110 active:scale-95 transition-all cursor-pointer z-10 border-4 border-brand-yellow/50 shadow-[0_0_30px_rgba(255,199,44,0.4)] hover:shadow-[0_0_50px_rgba(255,199,44,0.6)]"
      >
        <span className="relative bg-gradient-to-r from-brand-blue via-brand-red to-brand-yellow bg-[length:200%_100%] bg-clip-text text-transparent group-hover:animate-gradient">
          CLASSIFICA
        </span>
      </button>
    </div>
  );
}
