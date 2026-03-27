// =============================================================================
// VIEW: AccountView - Pannello impostazioni account
// =============================================================================
// Permette a TUTTI gli utenti di:
// 1. Cambiare la password
// 2. Caricare/cambiare l'avatar (su Supabase Storage bucket 'avatars')
// =============================================================================

import { useState } from 'react';
import { Camera, Lock, Activity } from 'lucide-react';
import { supabase } from '../lib/supabase';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function AccountView({ isAdmin, userProfile, ThemeSwitcher, toast, refresh }) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(userProfile?.avatar_url || null);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) { toast.error('La password deve avere almeno 6 caratteri'); return; }
    if (newPassword !== confirmPassword) { toast.error('Le password non coincidono'); return; }

    setIsChangingPassword(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      toast.error('Errore: ' + error.message);
    } else {
      toast.success('Password aggiornata con successo');
      setNewPassword('');
      setConfirmPassword('');
      refresh?.();
    }
    setIsChangingPassword(false);
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast.error('Seleziona un file immagine'); return; }
    if (file.size > 2 * 1024 * 1024) { toast.error('Immagine troppo grande (max 2MB)'); return; }
    if (!userProfile?.id) { toast.error('Profilo utente non caricato. Riprova.'); return; }

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userProfile.id}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('avatars').getPublicUrl(fileName);
      const publicUrl = data.publicUrl;

      const { error: updateError } = await supabase
        .from('utenti')
        .update({ avatar_url: publicUrl })
        .eq('id', userProfile.id);

      if (updateError) throw updateError;

      setAvatarUrl(publicUrl);
      toast.success('Avatar aggiornato');
      refresh?.();
    } catch (err) {
      toast.error('Errore upload: ' + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-[#060D1F] transition-colors duration-500">
      <Navbar isAdmin={isAdmin} userProfile={userProfile} ThemeSwitcher={ThemeSwitcher} />

      <div className="max-w-2xl mx-auto p-6 sm:p-12 space-y-8 text-brand-dark dark:text-white">
        <h1 className="text-4xl font-black uppercase tracking-tighter">Account</h1>

        {/* AVATAR */}
        <div className="bg-white dark:bg-white/[0.08] p-8 rounded-[2.5rem] border border-slate-200 dark:border-white/20 shadow-xl">
          <h2 className="text-sm font-black uppercase tracking-widest text-brand-blue dark:text-brand-yellow mb-6">Immagine Profilo</h2>
          <div className="flex items-center gap-6">
            <div className="relative">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="w-24 h-24 rounded-[1.5rem] object-cover border-2 border-brand-blue dark:border-brand-yellow" />
              ) : (
                <div className="w-24 h-24 rounded-[1.5rem] bg-brand-blue dark:bg-brand-red flex items-center justify-center">
                  <Camera size={32} className="text-white" />
                </div>
              )}
              <label className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-[1.5rem] opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
                <Camera size={24} className="text-white" />
                <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
              </label>
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-300 font-bold">Clicca sull'immagine per cambiarla</p>
              <p className="text-[10px] text-slate-400 dark:text-slate-400 mt-1">JPG, PNG o GIF (max 2MB)</p>
              {isUploading && <div className="flex items-center gap-2 mt-2 text-xs text-brand-blue"><Activity size={14} className="animate-spin" /> Caricamento...</div>}
            </div>
          </div>
        </div>

        {/* CAMBIO PASSWORD */}
        <div className="bg-white dark:bg-white/[0.08] p-8 rounded-[2.5rem] border border-slate-200 dark:border-white/20 shadow-xl">
          <h2 className="text-sm font-black uppercase tracking-widest text-brand-blue dark:text-brand-yellow mb-6">Cambio Password</h2>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-300 ml-2">Nuova Password</label>
              <input type="password" placeholder="Minimo 6 caratteri" value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                className="w-full pl-4 pr-4 py-4 bg-slate-50 dark:bg-black/50 border border-slate-200 dark:border-white/20 rounded-2xl text-brand-dark dark:text-white outline-none focus:ring-2 focus:ring-[#FFC72C] font-bold" required minLength={6} />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-300 ml-2">Conferma Password</label>
              <input type="password" placeholder="Ripeti la password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-4 pr-4 py-4 bg-slate-50 dark:bg-black/50 border border-slate-200 dark:border-white/20 rounded-2xl text-brand-dark dark:text-white outline-none focus:ring-2 focus:ring-[#FFC72C] font-bold" required minLength={6} />
            </div>
            <button type="submit" disabled={isChangingPassword}
              className="w-full cursor-pointer bg-brand-blue text-white font-black py-4 rounded-2xl uppercase tracking-widest text-sm hover:shadow-xl active:scale-95 transition-all border-none disabled:opacity-50 flex items-center justify-center gap-2">
              {isChangingPassword ? <Activity size={18} className="animate-spin" /> : <><Lock size={18} /> Aggiorna Password</>}
            </button>
          </form>
        </div>

        {/* INFO ACCOUNT */}
        <div className="bg-white dark:bg-white/[0.08] p-8 rounded-[2.5rem] border border-slate-200 dark:border-white/20 shadow-xl">
          <h2 className="text-sm font-black uppercase tracking-widest text-brand-blue dark:text-brand-yellow mb-6">Info Account</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-300">Username</span>
              <span className="font-black">{userProfile?.username || '...'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-300">Ruolo</span>
              <span className="font-black uppercase text-brand-blue dark:text-brand-yellow">{userProfile?.ruolo || '...'}</span>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
