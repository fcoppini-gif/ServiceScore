// =============================================================================
// SELEZIONI VIEW - Advanced filtering for Lions data
// =============================================================================
import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Filter, X, Download, ChevronDown, Search, Users, UserCheck, Heart } from 'lucide-react';
import { supabase } from '../lib/supabase';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const ITEMS_PER_PAGE = 20;

export default function SelezioniView({ isAdmin, userProfile, ThemeSwitcher }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('soci'); // soci, officer, activities

  // Data states
  const [sociData, setSociData] = useState([]);
  const [officerData, setOfficerData] = useState([]);
  const [activitiesData, setActivitiesData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [filters, setFilters] = useState({
    // Soci filters
    soci: {
      sesso: [],
      eta_min: '',
      eta_max: '',
      professione: '',
      anzianita_min: '',
      anzianita_max: '',
      citta: '',
      provincia: '',
      categoria: '',
      club: '',
      zona: '',
      circoscrizione: '',
    },
    // Officer filters
    officer: {
      titolo: '',
      data_inizio_da: '',
      data_inizio_a: '',
      club: '',
      zona: '',
      circoscrizione: '',
    },
    // Activities filters
    activities: {
      club: '',
      data_inizio_da: '',
      data_conclusione_da: '',
      rapporto: '',
      stato: '',
      titolo: '',
      livello: '',
      causa: '',
      tipo_progetto: '',
      attivita_distintiva: '',
      lcif_funded: '',
      persone_min: '',
      persone_max: '',
      volontari_min: '',
      volontari_max: '',
      ore_min: '',
      ore_max: '',
      fondi_donati_min: '',
      fondi_donati_max: '',
      fondi_raccolti_min: '',
      fondi_raccolti_max: '',
      organizzazione: '',
      zona: '',
      circoscrizione: '',
    },
  });

  const [pagination, setPagination] = useState({ page: 1 });

  // Filter options (computed from data)
  const [filterOptions, setFilterOptions] = useState({
    province: [],
    categorie: [],
    professioni: [],
   Titoli: [],
    clubNames: [],
    zone: [],
    circoscrizioni: [],
    cause: [],
    tipiProgetto: [],
    cause_attivita: [],
  });

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);

    // Fetch soci with filters
    const { data: soci } = await supabase
      .from('soci')
      .select('*')
      .order('cognome');
    setSociData(soci || []);

    // Fetch officers
    const { data: officers } = await supabase
      .from('officer')
      .select('*')
      .order('cognome');
    setOfficerData(officers || []);

    // Fetch activities
    const { data: activities } = await supabase
      .from('service_activities')
      .select('*')
      .order('data_inizio', { ascending: false });
    setActivitiesData(activities || []);

    // Compute filter options
    const unique = (arr, key) => [...new Set(arr?.map(x => x[key]).filter(Boolean))].sort();
    const province = unique(soci, 'provincia');
    const categorie = unique(soci, 'categoria');
    const professioni = unique(soci, 'professione');
    const Titoli = unique(officers, 'titolo');
    const clubNames = unique(soci, 'club_name');
    const zone = unique(soci, 'zona');
    const circoscrizioni = unique(soci, 'circoscrizione');
    const cause = unique(activities, 'causa');
    const tipiProgetto = unique(activities, 'tipo_progetto');

    setFilterOptions({
      province,
      categorie,
      professioni,
      Titoli,
      clubNames,
      zone,
      circoscrizioni,
      cause,
      tipiProgetto,
    });

    setLoading(false);
  };

  // Apply filters
  const filteredSoci = useMemo(() => {
    return sociData.filter(s => {
      const f = filters.soci;
      if (f.categoria.length && !f.categoria.includes(s.categoria)) return false;
      if (f.provincia && s.provincia !== f.provincia) return false;
      if (f.club && !s.club_name?.toLowerCase().includes(f.club.toLowerCase())) return false;
      if (f.zona && s.zona !== f.zona) return false;
      if (f.circoscrizione && s.circoscrizione !== f.circoscrizione) return false;
      return true;
    });
  }, [sociData, filters.soci]);

  const filteredOfficers = useMemo(() => {
    return officerData.filter(o => {
      const f = filters.officer;
      if (f.titolo && o.titolo !== f.titolo) return false;
      if (f.club && !o.club_name?.toLowerCase().includes(f.club.toLowerCase())) return false;
      if (f.zona && o.zona !== f.zona) return false;
      if (f.circoscrizione && o.circoscrizione !== f.circoscrizione) return false;
      return true;
    });
  }, [officerData, filters.officer]);

  const filteredActivities = useMemo(() => {
    return activitiesData.filter(a => {
      const f = filters.activities;
      if (f.club && !a.club_name?.toLowerCase().includes(f.club.toLowerCase())) return false;
      if (f.causa && a.causa !== f.causa) return false;
      if (f.tipo_progetto && a.tipo_progetto !== f.tipo_progetto) return false;
      if (f.stato && a.stato !== f.stato) return false;
      if (f.livello && a.livello !== f.livello) return false;
      if (f.zona && a.zona_sponsor !== f.zona) return false;
      if (f.circoscrizione && a.circoscrizione_sponsor !== f.circoscrizione) return false;
      if (f.persone_min && (a.persone_servite || 0) < parseInt(f.persone_min)) return false;
      if (f.persone_max && (a.persone_servite || 0) > parseInt(f.persone_max)) return false;
      if (f.volontari_min && (a.totale_volontari || 0) < parseInt(f.volontari_min)) return false;
      if (f.volontari_max && (a.totale_volontari || 0) > parseInt(f.volontari_max)) return false;
      if (f.fondi_donati_min && (a.fondi_donati || 0) < parseFloat(f.fondi_donati_min)) return false;
      if (f.fondi_donati_max && (a.fondi_donati || 0) > parseFloat(f.fondi_donati_max)) return false;
      if (f.fondi_raccolti_min && (a.fondi_raccolti || 0) < parseFloat(f.fondi_raccolti_min)) return false;
      if (f.fondi_raccolti_max && (a.fondi_raccolti || 0) > parseFloat(f.fondi_raccolti_max)) return false;
      return true;
    });
  }, [activitiesData, filters.activities]);

  // Pagination
  const paginatedData = useMemo(() => {
    const activeData = activeTab === 'soci' ? filteredSoci : activeTab === 'officer' ? filteredOfficers : filteredActivities;
    const start = (pagination.page - 1) * ITEMS_PER_PAGE;
    return activeData.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredSoci, filteredOfficers, filteredActivities, pagination.page, activeTab]);

  const totalPages = useMemo(() => {
    const activeData = activeTab === 'soci' ? filteredSoci : activeTab === 'officer' ? filteredOfficers : filteredActivities;
    return Math.ceil(activeData.length / ITEMS_PER_PAGE);
  }, [filteredSoci, filteredOfficers, filteredActivities, activeTab]);

  const updateFilter = (tab, key, value) => {
    setFilters(prev => ({
      ...prev,
      [tab]: { ...prev[tab], [key]: value },
    }));
    setPagination({ page: 1 });
  };

  const clearFilters = (tab) => {
    setFilters(prev => ({
      ...prev,
      [tab]: Object.keys(prev[tab]).reduce((acc, k) => ({ ...acc, [k]: '' }), {}),
    }));
    setPagination({ page: 1 });
  };

  const renderFilterPanel = () => {
    const tab = activeTab;
    const f = filters[tab];
    const opts = filterOptions;

    if (tab === 'soci') {
      return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <FilterSelect
            label="Categoria"
            value={f.categoria}
            options={opts.categorie}
            onChange={(v) => updateFilter('soci', 'categoria', v)}
          />
          <FilterSelect
            label="Provincia"
            value={f.provincia}
            options={opts.province}
            onChange={(v) => updateFilter('soci', 'provincia', v)}
          />
          <FilterInput
            label="Club"
            value={f.club}
            placeholder="Cerca club..."
            onChange={(v) => updateFilter('soci', 'club', v)}
          />
          <FilterSelect
            label="Zona"
            value={f.zona}
            options={opts.zone}
            onChange={(v) => updateFilter('soci', 'zona', v)}
          />
          <FilterSelect
            label="Circoscrizione"
            value={f.circoscrizione}
            options={opts.circoscrizioni}
            onChange={(v) => updateFilter('soci', 'circoscrizione', v)}
          />
          <FilterInput
            label="Città"
            value={f.citta}
            placeholder="Cerca città..."
            onChange={(v) => updateFilter('soci', 'citta', v)}
          />
          <FilterInput
            label="Professione"
            value={f.professione}
            placeholder="Cerca professione..."
            onChange={(v) => updateFilter('soci', 'professione', v)}
          />
          <FilterRange
            label="Anzianità"
            min={f.anzianita_min}
            max={f.anzianita_max}
            onMinChange={(v) => updateFilter('soci', 'anzeanita_min', v)}
            onMaxChange={(v) => updateFilter('soci', 'anzianita_max', v)}
          />
        </div>
      );
    }

    if (tab === 'officer') {
      return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <FilterSelect
            label="Titolo"
            value={f.titolo}
            options={opts.Titoli}
            onChange={(v) => updateFilter('officer', 'titolo', v)}
          />
          <FilterInput
            label="Club"
            value={f.club}
            placeholder="Cerca club..."
            onChange={(v) => updateFilter('officer', 'club', v)}
          />
          <FilterSelect
            label="Zona"
            value={f.zona}
            options={opts.zone}
            onChange={(v) => updateFilter('officer', 'zona', v)}
          />
          <FilterSelect
            label="Circoscrizione"
            value={f.circoscrizione}
            options={opts.circoscrizioni}
            onChange={(v) => updateFilter('officer', 'circoscrizione', v)}
          />
          <FilterDate
            label="Data inizio da"
            value={f.data_inizio_da}
            onChange={(v) => updateFilter('officer', 'data_inizio_da', v)}
          />
          <FilterDate
            label="Data inizio a"
            value={f.data_inizio_a}
            onChange={(v) => updateFilter('officer', 'data_inizio_a', v)}
          />
        </div>
      );
    }

    if (tab === 'activities') {
      return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <FilterInput
            label="Club"
            value={f.club}
            placeholder="Cerca club..."
            onChange={(v) => updateFilter('activities', 'club', v)}
          />
          <FilterSelect
            label="Causa"
            value={f.causa}
            options={opts.cause}
            onChange={(v) => updateFilter('activities', 'causa', v)}
          />
          <FilterSelect
            label="Tipo progetto"
            value={f.tipo_progetto}
            options={opts.tipiProgetto}
            onChange={(v) => updateFilter('activities', 'tipo_progetto', v)}
          />
          <FilterSelect
            label="Stato"
            value={f.stato}
            options={['Bozza', 'Pronto per comunicare i dati', 'Comunicato']}
            onChange={(v) => updateFilter('activities', 'stato', v)}
          />
          <FilterSelect
            label="Livello"
            value={f.livello}
            options={['Lions Club', 'Multiple District', 'District']}
            onChange={(v) => updateFilter('activities', 'livello', v)}
          />
          <FilterRange
            label="Persone servite"
            min={f.persone_min}
            max={f.persone_max}
            onMinChange={(v) => updateFilter('activities', 'persone_min', v)}
            onMaxChange={(v) => updateFilter('activities', 'persone_max', v)}
          />
          <FilterRange
            label="Volontari"
            min={f.volontari_min}
            max={f.volontari_max}
            onMinChange={(v) => updateFilter('activities', 'volontari_min', v)}
            onMaxChange={(v) => updateFilter('activities', 'volontari_max', v)}
          />
          <FilterRange
            label="Fondi donati"
            min={f.fondi_donati_min}
            max={f.fondi_donati_max}
            onMinChange={(v) => updateFilter('activities', 'fondi_donati_min', v)}
            onMaxChange={(v) => updateFilter('activities', 'fondi_donati_max', v)}
          />
          <FilterRange
            label="Fondi raccolti"
            min={f.fondi_raccolti_min}
            max={f.fondi_raccolti_max}
            onMinChange={(v) => updateFilter('activities', 'fondi_raccolti_min', v)}
            onMaxChange={(v) => updateFilter('activities', 'fondi_raccolti_max', v)}
          />
          <FilterSelect
            label="Zona"
            value={f.zona}
            options={opts.zone}
            onChange={(v) => updateFilter('activities', 'zona', v)}
          />
          <FilterSelect
            label="Circoscrizione"
            value={f.circoscrizione}
            options={opts.circoscrizioni}
            onChange={(v) => updateFilter('activities', 'circoscrizione', v)}
          />
        </div>
      );
    }

    return null;
  };

  const renderTable = () => {
    const data = paginatedData;

    if (activeTab === 'soci') {
      return (
        <table className="w-full text-sm">
          <thead className="bg-slate-100 dark:bg-white/5">
            <tr>
              <th className="p-3 text-left font-black uppercase">Matricola</th>
              <th className="p-3 text-left font-black uppercase">Nome</th>
              <th className="p-3 text-left font-black uppercase">Città</th>
              <th className="p-3 text-left font-black uppercase">Provincia</th>
              <th className="p-3 text-left font-black uppercase">Categoria</th>
              <th className="p-3 text-left font-black uppercase">Club</th>
            </tr>
          </thead>
          <tbody>
            {data.map((s, i) => (
              <tr key={i} className="border-b border-slate-100 dark:border-white/5">
                <td className="p-3">{s.matricola}</td>
                <td className="p-3">{s.titolo} {s.cognome}</td>
                <td className="p-3">{s.citta}</td>
                <td className="p-3">{s.provincia}</td>
                <td className="p-3">{s.categoria}</td>
                <td className="p-3">{s.club_name}</td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    }

    if (activeTab === 'officer') {
      return (
        <table className="w-full text-sm">
          <thead className="bg-slate-100 dark:bg-white/5">
            <tr>
              <th className="p-3 text-left font-black uppercase">Titolo</th>
              <th className="p-3 text-left font-black uppercase">Nome</th>
              <th className="p-3 text-left font-black uppercase">Club</th>
              <th className="p-3 text-left font-black uppercase">Email</th>
              <th className="p-3 text-left font-black uppercase">Telefono</th>
            </tr>
          </thead>
          <tbody>
            {data.map((o, i) => (
              <tr key={i} className="border-b border-slate-100 dark:border-white/5">
                <td className="p-3">{o.titolo}</td>
                <td className="p-3">{o.nome} {o.cognome}</td>
                <td className="p-3">{o.club_name}</td>
                <td className="p-3">{o.email}</td>
                <td className="p-3">{o.telefono}</td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    }

    if (activeTab === 'activities') {
      return (
        <table className="w-full text-sm">
          <thead className="bg-slate-100 dark:bg-white/5">
            <tr>
              <th className="p-3 text-left font-black uppercase">Titolo</th>
              <th className="p-3 text-left font-black uppercase">Club</th>
              <th className="p-3 text-left font-black uppercase">Causa</th>
              <th className="p-3 text-left font-black uppercase">Persone</th>
              <th className="p-3 text-right font-black uppercase">Fondi</th>
            </tr>
          </thead>
          <tbody>
            {data.map((a, i) => (
              <tr key={i} className="border-b border-slate-100 dark:border-white/5">
                <td className="p-3">{a.titolo}</td>
                <td className="p-3">{a.club_name}</td>
                <td className="p-3">{a.causa}</td>
                <td className="p-3 text-center">{a.persone_servite}</td>
                <td className="p-3 text-right">€{a.fondi_donati}</td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    }

    return null;
  };

  const currentFiltered = activeTab === 'soci' ? filteredSoci : activeTab === 'officer' ? filteredOfficers : filteredActivities;
  const totalCount = currentFiltered.length;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#060D1F]">
      <Navbar isAdmin={isAdmin} userProfile={userProfile} ThemeSwitcher={ThemeSwitcher} />
      
      <div className="max-w-7xl mx-auto p-4 sm:p-8 pb-24 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl sm:text-3xl font-black uppercase">Selezioni Dati</h1>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 bg-slate-200 dark:bg-white/10 rounded-xl text-sm font-black"
          >
            Torna al Dashboard
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-slate-200 dark:border-white/10">
          {[
            { id: 'soci', label: 'Soci', icon: Users, count: sociData.length },
            { id: 'officer', label: 'Officer', icon: UserCheck, count: officerData.length },
            { id: 'activities', label: 'Attività', icon: Heart, count: activitiesData.length },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setPagination({ page: 1 }); }}
              className={`flex items-center gap-2 px-4 py-3 font-black uppercase transition-colors ${
                activeTab === tab.id
                  ? 'border-b-2 border-brand-blue text-brand-blue'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <tab.icon size={18} />
              {tab.label}
              <span className="text-xs bg-slate-200 dark:bg-white/10 px-2 py-0.5 rounded-full">
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-brand-dark p-4 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter size={18} className="text-slate-400" />
              <span className="font-black uppercase text-sm">Filtri</span>
            </div>
            <button
              onClick={() => clearFilters(activeTab)}
              className="text-xs text-slate-500 hover:text-brand-red"
            >
              Pulisci fil-tri
            </button>
          </div>
          {renderFilterPanel()}
        </div>

        {/* Results */}
        <div className="bg-white dark:bg-brand-dark rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
            <span className="text-sm">
              <strong>{totalCount}</strong> risultati trovati
            </span>
            {totalCount > ITEMS_PER_PAGE && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPagination(p => ({ ...p, page: Math.max(1, p.page - 1) }))}
                  disabled={pagination.page === 1}
                  className="px-3 py-1 bg-slate-100 dark:bg-white/10 rounded-lg text-sm disabled:opacity-50"
                >
                  Precedente
                </button>
                <span className="text-sm">
                  {pagination.page} / {totalPages}
                </span>
                <button
                  onClick={() => setPagination(p => ({ ...p, page: Math.min(totalPages, p.page + 1) }))}
                  disabled={pagination.page >= totalPages}
                  className="px-3 py-1 bg-slate-100 dark:bg-white/10 rounded-lg text-sm disabled:opacity-50"
                >
                  Successivo
                </button>
              </div>
            )}
          </div>

          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin w-8 h-8 border-4 border-brand-blue border-t-transparent rounded-full mx-auto"></div>
            </div>
          ) : (
            renderTable()
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}

// Filter components
function FilterInput({ label, value, placeholder, onChange }) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-black uppercase text-slate-500">{label}</label>
      <input
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm"
      />
    </div>
  );
}

function FilterSelect({ label, value, options, onChange }) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-black uppercase text-slate-500">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm"
      >
        <option value="">Tutti</option>
        {options.map(opt => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    </div>
  );
}

function FilterRange({ label, min, max, onMinChange, onMaxChange }) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-black uppercase text-slate-500">{label}</label>
      <div className="flex gap-2">
        <input
          type="number"
          value={min}
          placeholder="Min"
          onChange={(e) => onMinChange(e.target.value)}
          className="flex-1 px-3 py-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm"
        />
        <input
          type="number"
          value={max}
          placeholder="Max"
          onChange={(e) => onMaxChange(e.target.value)}
          className="flex-1 px-3 py-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm"
        />
      </div>
    </div>
  );
}

function FilterDate({ label, value, onChange }) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-black uppercase text-slate-500">{label}</label>
      <input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm"
      />
    </div>
  );
}