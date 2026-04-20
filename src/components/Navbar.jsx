// =============================================================================
// Navbar - Premium animated navbar with haptic feedback
// =============================================================================
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, User, Settings, Shield, ChevronDown, Globe, Filter, Plus, Trophy, Menu, X, ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';
import BrandLogo from './BrandLogo';
import { useI18n } from '../lib/i18n';

const haptic = (type = 'light') => {
  if (navigator.vibrate) {
    const patterns = { light: 10, medium: 20, heavy: 40, success: [10, 50, 10] };
    navigator.vibrate(patterns[type] || 10);
  }
};

export default function Navbar({ isAdmin, userProfile, ThemeSwitcher }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { toggleLang, t } = useI18n();
  const avatarUrl = userProfile?.avatar_url || null;

  const navButtons = [
    { path: '/selezioni', label: 'Selezioni', icon: Filter },
    { path: '/classifica', label: 'Classifica', icon: Trophy },
  ];

  if (isAdmin) {
    navButtons.push({ path: '/nuovo-service', label: 'Nuovo', icon: Plus });
    navButtons.push({ path: '/admin/utenti', label: 'Admin', icon: Shield });
  }

  const handleNavClick = (path) => {
    haptic('light');
    navigate(path);
    setMobileMenuOpen(false);
  };

  return (
    <motion.nav 
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="px-3 sm:px-4 py-2 sm:py-3 flex justify-between items-center border-b border-slate-100 dark:border-white/[0.03] bg-white/90 dark:bg-brand-dark/90 backdrop-blur-2xl sticky top-0 z-50"
    >
      {/* Logo */}
      <button onClick={() => handleNavClick('/dashboard')} className="cursor-pointer bg-transparent border-none">
        <BrandLogo className="h-6 sm:h-8" />
      </button>

      {/* Desktop Nav */}
      <div className="hidden md:flex items-center gap-1.5">
        {navButtons.map((btn) => (
          <motion.button
            key={btn.path}
            onClick={() => handleNavClick(btn.path)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer border-none ${
              location.pathname.includes(btn.path)
                ? 'bg-brand-blue text-white shadow-lg shadow-brand-blue/25'
                : 'bg-transparent text-slate-600 dark:text-slate-200 hover:bg-brand-blue/10 hover:shadow-md'
            }`}
          >
            <btn.icon size={14} />
            {btn.label}
          </motion.button>
        ))}
      </div>

      {/* Right Area */}
      <div className="flex items-center gap-2">
        <ThemeSwitcher />
        
        <button onClick={toggleLang} className="p-2 bg-slate-100 dark:bg-white/5 rounded-xl cursor-pointer border-none text-brand-blue dark:text-brand-yellow hover:bg-slate-200 dark:hover:bg-white/10 transition-colors">
          <Globe size={16} />
        </button>

        {/* User Menu */}
        <div className="relative">
          <motion.button
            onClick={() => { haptic('light'); setMenuOpen(!menuOpen); }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 p-1.5 sm:p-2 bg-slate-100 dark:bg-white/5 rounded-2xl cursor-pointer border-none text-brand-dark dark:text-white"
          >
            {avatarUrl ? (
              <img src={avatarUrl} alt="Avatar" className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl object-cover" />
            ) : (
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-brand-blue dark:bg-brand-red rounded-xl flex items-center justify-center">
                <User size={14} className="text-white" />
              </div>
            )}
            <span className="hidden sm:block text-xs font-black uppercase truncate max-w-[80px]">
              {userProfile?.username || 'Utente'}
            </span>
            <ChevronDown size={14} className={`hidden sm:block transition-transform ${menuOpen ? 'rotate-180' : ''}`} />
          </motion.button>

          <AnimatePresence>
            {menuOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-brand-dark border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50"
              >
                <div className="p-4 border-b border-slate-100 dark:border-white/5">
                  <div className="text-xs font-black uppercase text-brand-blue dark:text-brand-yellow">
                    {userProfile?.username}
                  </div>
                  <div className="text-[10px] text-slate-400 uppercase mt-1">
                    {isAdmin ? 'Amministratore' : 'Referente'}
                  </div>
                </div>
                <div className="p-2">
                  <button
                    onClick={() => { haptic('light'); navigate('/account'); setMenuOpen(false); }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-brand-dark dark:text-white hover:bg-slate-100 dark:hover:bg-white/5 cursor-pointer border-none bg-transparent"
                  >
                    <Settings size={16} /> Account
                  </button>
                  <button
                    onClick={() => { haptic('medium'); supabase.auth.signOut(); setMenuOpen(false); }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-brand-red hover:bg-red-50 dark:hover:bg-brand-red/10 cursor-pointer border-none bg-transparent"
                  >
                    <LogOut size={16} /> Esci
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Mobile Menu Button */}
        <motion.button
          onClick={() => { haptic('light'); setMobileMenuOpen(!mobileMenuOpen); }}
          whileTap={{ scale: 0.9 }}
          className="md:hidden p-2 bg-slate-100 dark:bg-white/5 rounded-xl"
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </motion.button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden absolute top-full left-0 right-0 bg-white dark:bg-brand-dark border-b border-slate-200 dark:border-white/10 z-40 overflow-hidden"
          >
            <div className="p-4 space-y-2">
              {navButtons.map((btn) => (
                <motion.button
                  key={btn.path}
                  onClick={() => handleNavClick(btn.path)}
                  whileTap={{ scale: 0.95 }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold cursor-pointer border-none ${
                    location.pathname.includes(btn.path)
                      ? 'bg-brand-blue text-white'
                      : 'bg-slate-100 dark:bg-white/5 text-brand-dark dark:text-white'
                  }`}
                >
                  <btn.icon size={18} />
                  {btn.label}
                </motion.button>
              ))}
              <hr className="border-slate-200 dark:border-white/10 my-2" />
              <button
                onClick={() => { haptic('light'); navigate('/account'); setMobileMenuOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold bg-slate-100 dark:bg-white/5 text-brand-dark dark:text-white"
              >
                <Settings size={18} /> Account
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}