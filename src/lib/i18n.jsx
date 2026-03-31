// =============================================================================
// I18N - Sistema di internazionalizzazione
// =============================================================================
import { createContext, useContext, useState, useEffect } from 'react';

const translations = {
  it: {
    appName: 'ServiceScore',
    login: 'Accedi',
    logout: 'Esci',
    dashboard: 'Classifica',
    insert: 'Nuova Analisi',
    admin: 'Admin',
    account: 'Account',
    search: 'Cerca',
    save: 'Salva',
    cancel: 'Annulla',
    delete: 'Elimina',
    edit: 'Modifica',
    add: 'Aggiungi',
    confirm: 'Conferma',
    back: 'Indietro',
    next: 'Avanti',
    club: 'Club',
    service: 'Service',
    score: 'Punteggio',
    ranking: 'Classifica',
    total: 'Totale',
    mandatory: 'Obbligatorio',
    optional: 'Opzionale',
    year: 'Anno',
    export: 'Esporta',
    backup: 'Backup',
    statistics: 'Statistiche',
    trend: 'Trend',
    email: 'Email',
    notifications: 'Notifiche',
    privacy: 'Privacy',
    terms: 'Termini',
    contract: 'Contratto',
    language: 'Lingua',
    italiano: 'Italiano',
    english: 'English',
    loading: 'Caricamento...',
    error: 'Errore',
    success: 'Successo',
    noData: 'Nessun dato',
    selectClub: 'Seleziona Club',
    selectService: 'Seleziona Service',
    configAnalysis: 'Configura Analisi',
    operationalData: 'Dati Operativi',
    summary: 'Riepilogo',
    missionCompleted: 'MISSIONE COMPLETATA',
    goToRanking: 'CLASSIFICA',
  },
  en: {
    appName: 'ServiceScore',
    login: 'Login',
    logout: 'Logout',
    dashboard: 'Ranking',
    insert: 'New Analysis',
    admin: 'Admin',
    account: 'Account',
    search: 'Search',
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    add: 'Add',
    confirm: 'Confirm',
    back: 'Back',
    next: 'Next',
    club: 'Club',
    service: 'Service',
    score: 'Score',
    ranking: 'Ranking',
    total: 'Total',
    mandatory: 'Mandatory',
    optional: 'Optional',
    year: 'Year',
    export: 'Export',
    backup: 'Backup',
    statistics: 'Statistics',
    trend: 'Trend',
    email: 'Email',
    notifications: 'Notifications',
    privacy: 'Privacy',
    terms: 'Terms',
    contract: 'Contract',
    language: 'Language',
    italiano: 'Italiano',
    english: 'English',
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    noData: 'No data',
    selectClub: 'Select Club',
    selectService: 'Select Service',
    configAnalysis: 'Configure Analysis',
    operationalData: 'Operational Data',
    summary: 'Summary',
    missionCompleted: 'MISSION COMPLETED',
    goToRanking: 'RANKING',
  }
};

const I18nContext = createContext();

export function I18nProvider({ children }) {
  const [lang, setLang] = useState(() => {
    return localStorage.getItem('servicescore_lang') || 'it';
  });

  useEffect(() => {
    localStorage.setItem('servicescore_lang', lang);
  }, [lang]);

  const t = (key) => translations[lang]?.[key] || translations.it[key] || key;
  const toggleLang = () => setLang(lang === 'it' ? 'en' : 'it');

  return (
    <I18nContext.Provider value={{ t, lang, setLang, toggleLang }}>
      {children}
    </I18nContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) throw new Error('useI18n must be used within I18nProvider');
  return context;
}