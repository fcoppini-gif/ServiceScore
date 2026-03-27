// =============================================================================
// HOOK: useAuth - Gestisce stato utente, ruolo e club associati
// =============================================================================

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function useAuth() {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [userClubs, setUserClubs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        loadUserProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session?.user) {
          setUser(session.user);
          loadUserProfile(session.user.id);
        } else {
          setUser(null);
          setUserProfile(null);
          setUserClubs([]);
          setLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const loadUserProfile = async (userId) => {
    try {
      // Usa maybeSingle() per non fallire se il profilo non esiste
      const { data: profile, error: profileErr } = await supabase
        .from('utenti')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (profileErr) {
        console.error('Errore caricamento profilo:', profileErr);
        setLoading(false);
        return;
      }

      // Se il profilo non esiste, crealo automaticamente
      if (!profile) {
        const { data: newProfile, error: insertErr } = await supabase
          .from('utenti')
          .insert({
            id: userId,
            username: 'nuovo_utente',
            password_hash: 'managed_by_supabase_auth',
            ruolo: 'referente',
          })
          .select()
          .single();

        if (insertErr) {
          console.error('Errore creazione profilo:', insertErr);
          setLoading(false);
          return;
        }
        setUserProfile(newProfile);
        setLoading(false);
        return;
      }

      setUserProfile(profile);

      // Se non è admin, carica i club associati
      if (profile && profile.ruolo !== 'admin') {
        const { data: clubs, error: clubsErr } = await supabase
          .from('utenti_club')
          .select('id_club')
          .eq('id_utente', userId);

        if (clubsErr) {
          console.error('Errore caricamento club:', clubsErr);
        } else {
          setUserClubs(clubs?.map((c) => c.id_club) || []);
        }
      } else {
        setUserClubs([]);
      }
    } catch (err) {
      console.error('Errore caricamento profilo:', err);
    } finally {
      setLoading(false);
    }
  };

  const isAdmin = userProfile?.ruolo === 'admin';

  return {
    user,
    userProfile,
    isAdmin,
    userClubs,
    loading,
    refresh: () => user && loadUserProfile(user.id),
  };
}
