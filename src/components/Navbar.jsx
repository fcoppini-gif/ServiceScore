// =============================================================================
// COMPONENTE: Navbar - Barra di navigazione condivisa
// =============================================================================
// Mostra: logo, link navigazione, toggle tema, menu utente
// Si adatta in base al ruolo:
// - Admin: link a /admin/club, /admin/service, /admin/utenti
// - Referente: link a /dashboard
// - Tutti: link a /account
//
// COLLEGAMENTI:
// - Usato in DashboardView, InsertWizardView, AccountView, AdminView
// - Riceve isAdmin, userProfile, ThemeSwitcher come props
// =============================================================================

import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LogOut, User, Settings, Shield, BarChart3, ChevronDown, Globe } from 'lucide-react';
import { supabase } from '../lib/supabase';
import BrandLogo from './BrandLogo';
import { useI18n } from '../lib/i18n';

export default function Navbar({ isAdmin, userProfile, ThemeSwitcher }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const { toggleLang, t } = useI18n();

  // URL dell'avatar (se presente nel profilo)
  const avatarUrl = userProfile?.avatar_url || null;

  return (
    <nav className="px-6 py-4 sm:py-5 flex justify-between items-center border-b border-slate-200 dark:border-white/5 bg-white/80 dark:bg-white/5 backdrop-blur-xl sticky top-0 z-50 shadow-sm">
      {/* Logo: cliccabile → porta alla dashboard */}
      <button onClick={() => navigate('/dashboard')} className="cursor-pointer bg-transparent border-none">
        <BrandLogo className="h-8 sm:h-10" />
      </button>

      {/* Link admin (visibili solo se admin) */}
      {isAdmin && (
        <div className="hidden md:flex items-center gap-2 mx-4">
          <button
            onClick={() => navigate('/admin/classifica')}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer border-none ${
              location.pathname.includes('/admin/classifica')
                ? 'bg-brand-blue text-white'
                : 'bg-transparent text-brand-blue dark:text-white hover:bg-brand-blue/10'
            }`}
          >
            Classifica
          </button>
          <button
            onClick={() => navigate('/admin/club')}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer border-none ${
              location.pathname.includes('/admin/club')
                ? 'bg-brand-blue text-white'
                : 'bg-transparent text-brand-blue dark:text-white hover:bg-brand-blue/10'
            }`}
          >
            Club
          </button>
          <button
            onClick={() => navigate('/admin/service')}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer border-none ${
              location.pathname.includes('/admin/service')
                ? 'bg-brand-blue text-white'
                : 'bg-transparent text-brand-blue dark:text-white hover:bg-brand-blue/10'
            }`}
          >
            Service
          </button>
          <button
            onClick={() => navigate('/admin/utenti')}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer border-none ${
              location.pathname.includes('/admin/utenti')
                ? 'bg-brand-blue text-white'
                : 'bg-transparent text-brand-blue dark:text-white hover:bg-brand-blue/10'
            }`}
          >
            Utenti
          </button>
        </div>
      )}

      {/* Area destra: tema + lingua + menu utente */}
      <div className="flex items-center gap-3">
        <ThemeSwitcher />
        
        {/* Language toggle */}
        <button
          onClick={toggleLang}
          className="p-2 bg-slate-100 dark:bg-white/5 rounded-xl cursor-pointer border-none text-brand-blue dark:text-brand-yellow hover:bg-slate-200 dark:hover:bg-white/10 transition-colors"
          title={t('language')}
        >
          <Globe size={18} />
        </button>

        {/* Menu utente dropdown */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-2 p-2 bg-slate-100 dark:bg-white/5 rounded-2xl cursor-pointer border-none text-brand-dark dark:text-white"
          >
            {/* Avatar o icona default */}
            {avatarUrl ? (
              <img src={avatarUrl} alt="Avatar" className="w-8 h-8 rounded-xl object-cover" />
            ) : (
              <div className="w-8 h-8 bg-brand-blue dark:bg-brand-red rounded-xl flex items-center justify-center">
                <User size={16} className="text-white" />
              </div>
            )}
            <span className="hidden sm:block text-xs font-black uppercase truncate max-w-[100px]">
              {userProfile?.username || 'Utente'}
            </span>
            <ChevronDown size={14} className="hidden sm:block opacity-50" />
          </button>

          {/* Dropdown menu */}
          {menuOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-brand-dark border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50">
              {/* Info utente */}
              <div className="p-4 border-b border-slate-100 dark:border-white/5">
                <div className="text-xs font-black uppercase text-brand-blue dark:text-brand-yellow">
                  {userProfile?.username}
                </div>
                <div className="text-[10px] text-slate-400 uppercase mt-1">
                  {isAdmin ? 'Amministratore' : 'Referente'}
                </div>
              </div>

              {/* Link menu */}
              <div className="p-2">
                <button
                  onClick={() => { navigate('/account'); setMenuOpen(false); }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-brand-dark dark:text-white hover:bg-slate-100 dark:hover:bg-white/5 cursor-pointer border-none bg-transparent"
                >
                  <Settings size={16} /> Account
                </button>
                {isAdmin && (
                  <button
                    onClick={() => { navigate('/admin/classifica'); setMenuOpen(false); }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-brand-dark dark:text-white hover:bg-slate-100 dark:hover:bg-white/5 cursor-pointer border-none bg-transparent md:hidden"
                  >
                    <Shield size={16} /> Pannello Admin
                  </button>
                )}
                {/* Logout */}
                <button
                  onClick={() => { supabase.auth.signOut(); setMenuOpen(false); }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-brand-red hover:bg-red-50 dark:hover:bg-brand-red/10 cursor-pointer border-none bg-transparent"
                >
                  <LogOut size={16} /> Esci
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
