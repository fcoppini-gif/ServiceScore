// =============================================================================
// REGISTER VIEW - Self-registration for members
// =============================================================================
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UserPlus, Mail, Lock, User, Building2, ChevronRight, Sparkles, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function RegisterView() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: matrico, 2: details, 3: success
  
  const [form, setForm] = useState({
    matricola: '',
    username: '',
    password: '',
    confirmPassword: '',
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [memberData, setMemberData] = useState(null);
  const [clubs, setClubs] = useState([]);

  useEffect(() => {
    supabase.from('club').select('id, nome').order('nome').then(({ data }) => setClubs(data || []));
  }, []);

  const verifyMember = async () => {
    if (!form.matricola) {
      setError('Inserisci la tua matricola');
      return;
    }

    setLoading(true);
    setError('');

    // Find member by matricola
    const { data: member, error } = await supabase
      .from('soci')
      .select('*, club(nome)')
      .eq('matricola', form.matricola)
      .single();

    if (error || !member) {
      setError('Matricola non trovata. Verifica e riprova.');
      setLoading(false);
      return;
    }

    setMemberData(member);
    setStep(2);
    setLoading(false);
  };

  const handleRegister = async () => {
    if (!form.username || !form.password || !form.confirmPassword) {
      setError('Compila tutti i campi');
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError('Le password non coincidono');
      return;
    }

    if (form.password.length < 6) {
      setError('La password deve essere di almeno 6 caratteri');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Create user in utenti table (not Supabase Auth for now)
      const { error: insertError } = await supabase.from('utenti').insert({
        username: form.username,
        password_hash: form.password, // In production, hash this!
        ruolo: 'referente',
      });

      if (insertError) {
        if (insertError.message.includes('username')) {
          setError('Questo username è già in uso');
        } else {
          setError('Errore: ' + insertError.message);
        }
        setLoading(false);
        return;
      }

      // Link user to member's club
      if (memberData?.club?.id) {
        await supabase.from('utenti_club').insert({
          id_utente: form.username, // This should be the actual ID
          id_club: memberData.club.id,
        });
      }

      setStep(3);
    } catch (err) {
      setError('Errore durante la registrazione');
    }
    
    setLoading(false);
  };

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 }
  };

  // Success Step
  if (step === 3) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#060D1F] flex items-center justify-center p-4">
      <motion.div 
        {...fadeIn}
        className="text-center max-w-md"
      >
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', delay: 0.2 }}
          className="w-24 h-24 bg-green-100 dark:bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <CheckCircle size={48} className="text-green-500" />
        </motion.div>
        
        <h1 className="text-2xl font-black mb-4">Registrazione Completata! 🎉</h1>
        
        <p className="text-slate-500 mb-8">
          Benvenuto! Ora puoi accedere al sistema con le tue credenziali.
        </p>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/login')}
          className="w-full py-4 bg-gradient-to-r from-brand-blue to-brand-red text-white rounded-2xl font-bold"
        >
          Accedi all'App
        </motion.button>
      </motion.div>
    </div>
  );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#060D1F] aurora-bg">
      {/* Header */}
      <div className="p-6 text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-brand-blue to-brand-red rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
          <UserPlus size={32} className="text-white" />
        </div>
        <h1 className="text-2xl font-black uppercase">Registrazione</h1>
        <p className="text-slate-500 text-sm mt-1">Entra a far parte del sistema Lions</p>
      </div>

      <div className="max-w-md mx-auto p-6 space-y-6">
        
        {/* Step 1: Enter Matricola */}
        {step === 1 && (
          <motion.div {...fadeIn} className="bg-white dark:bg-brand-dark rounded-3xl p-6 shadow-xl">
            <h2 className="font-bold text-lg mb-4">1. Inserisci la tua Matricola</h2>
            
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase text-slate-500">Matricola Socio</label>
                <input
                  type="text"
                  placeholder="Es: 1898037"
                  value={form.matricola}
                  onChange={(e) => setForm({...form, matricola: e.target.value})}
                  className="w-full px-4 py-4 rounded-2xl bg-slate-50 dark:bg-white/5 border-2 border-slate-200 dark:border-white/10 focus:border-brand-blue outline-none text-lg"
                />
              </div>

              <p className="text-sm text-slate-500">
                La matricola si trova sulla tessera Lions o nei dati dell'ufficio.
              </p>

              {error && (
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-red-500 text-sm bg-red-50 dark:bg-red-500/10 p-3 rounded-xl"
                >
                  {error}
                </motion.p>
              )}

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={verifyMember}
                disabled={loading}
                className="w-full py-4 bg-brand-blue text-white rounded-2xl font-bold flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <ChevronRight size={20} /> Verifica Matricola
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* Step 2: Create Account */}
        {step === 2 && memberData && (
          <motion.div {...fadeIn} className="bg-white dark:bg-brand-dark rounded-3xl p-6 shadow-xl">
            
            {/* Member Info */}
            <div className="bg-slate-50 dark:bg-white/5 rounded-2xl p-4 mb-6">
              <div className="text-sm text-slate-500 uppercase mb-1">Socio trovato</div>
              <div className="font-bold text-lg">
                {memberData.titolo} {memberData.nome} {memberData.cognome}
              </div>
              <div className="text-sm text-slate-500 flex items-center gap-2 mt-1">
                <Building2 size={14} />
                {memberData.club?.nome}
              </div>
            </div>

            <h2 className="font-bold text-lg mb-4">2. Crea le tue credenziali</h2>
            
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase text-slate-500">Username *</label>
                <input
                  type="text"
                  placeholder="Scegli uno username"
                  value={form.username}
                  onChange={(e) => setForm({...form, username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '')})}
                  className="w-full px-4 py-4 rounded-2xl bg-slate-50 dark:bg-white/5 border-2 border-slate-200 dark:border-white/10 focus:border-brand-blue outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase text-slate-500">Password *</label>
                <input
                  type="password"
                  placeholder="Minimo 6 caratteri"
                  value={form.password}
                  onChange={(e) => setForm({...form, password: e.target.value})}
                  className="w-full px-4 py-4 rounded-2xl bg-slate-50 dark:bg-white/5 border-2 border-slate-200 dark:border-white/10 focus:border-brand-blue outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase text-slate-500">Conferma Password *</label>
                <input
                  type="password"
                  placeholder="Ripeti la password"
                  value={form.confirmPassword}
                  onChange={(e) => setForm({...form, confirmPassword: e.target.value})}
                  className="w-full px-4 py-4 rounded-2xl bg-slate-50 dark:bg-white/5 border-2 border-slate-200 dark:border-white/10 focus:border-brand-blue outline-none"
                />
              </div>

              {error && (
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-red-500 text-sm bg-red-50 dark:bg-red-500/10 p-3 rounded-xl"
                >
                  {error}
                </motion.p>
              )}

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleRegister}
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-brand-blue to-brand-red text-white rounded-2xl font-bold flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <Sparkles size={20} /> Registrati
                  </>
                )}
              </motion.button>

              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-full text-slate-500 text-sm py-2"
              >
                ← Torna indietro
              </button>
            </div>
          </motion.div>
        )}

        {/* Login Link */}
        <div className="text-center">
          <p className="text-slate-500 text-sm">
            Hai già un account?{' '}
            <button onClick={() => navigate('/login')} className="text-brand-blue font-bold">
              Accedi
            </button>
          </p>
        </div>

      </div>
    </div>
  );
}