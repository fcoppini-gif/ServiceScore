-- =============================================================================
-- ServiceScore - Schema Update per Importazione Dati Lions
-- =============================================================================
-- Query da eseguire su Supabase SQL Editor
-- =============================================================================

-- =============================================================================
-- 1. AGGIORNA TABELLA club - Aggiungi campi da Member Detail
-- =============================================================================

-- Aggiungi colonne mancanti alla tabella club
ALTER TABLE club 
ADD COLUMN IF NOT EXISTS id_lions TEXT,
ADD COLUMN IF NOT EXISTS distretto TEXT,
ADD COLUMN IF NOT EXISTS circoscrizione TEXT,
ADD COLUMN IF NOT EXISTS zona TEXT,
ADD COLUMN IF NOT EXISTS tipo TEXT DEFAULT 'Lions Club',
ADD COLUMN IF NOT EXISTS categoria TEXT,
ADD COLUMN IF NOT EXISTS programma TEXT;

-- Rendi opzionale la colonna id_utente_referente (era obbligatoria prima)
ALTER TABLE club ALTER COLUMN id_utente_referente DROP NOT NULL;

-- =============================================================================
-- 2. CREA TABELLA officer - Referenti/Officer dei Club
-- =============================================================================

DROP TABLE IF EXISTS officer;

CREATE TABLE officer (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_club INTEGER REFERENCES club(id) ON DELETE CASCADE,
    id_socio TEXT,  -- Matricola socio da Lions
    titolo TEXT NOT NULL,  -- Presidente, Segretario, Tesoriere, etc.
    nome TEXT,
    cognome TEXT,
    email TEXT,
    telefono TEXT,
    data_inizio DATE,
    data_fine DATE,
    stato TEXT DEFAULT 'active',  -- active, pending, past
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Abilita RLS
ALTER TABLE officer ENABLE ROW LEVEL SECURITY;

-- Policy per tutti gli utenti autenticati
CREATE POLICY "Modifica officer" ON officer FOR ALL USING (true) WITH CHECK (true);

-- =============================================================================
-- 3. CREA TABELLA service_activities - Attività di Service (da Excel)
-- =============================================================================

DROP TABLE IF EXISTS service_activities;

CREATE TABLE service_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_club INTEGER REFERENCES club(id) ON DELETE SET NULL,
    
    -- Dati attività
    titolo TEXT NOT NULL,
    descrizione TEXT,
    causa TEXT,  -- Ambiente, Fame, Vista, Cancro infantile, Diabete, etc.
    tipo_progetto TEXT,  -- Donazione, Attività di rafforzamento, etc.
    attivita_distintiva BOOLEAN DEFAULT false,
    
    -- Date
    data_inizio DATE,
    data_conclusione DATE,
    stato TEXT DEFAULT 'Comunicato',  -- Comunicato, Bozza, etc.
    
    -- Persone e volontari
    persone_servite INTEGER DEFAULT 0,
    totale_volontari INTEGER DEFAULT 0,
    totale_ore_servizio INTEGER DEFAULT 0,
    
    -- Fondi
    fondi_donati NUMERIC(12,2) DEFAULT 0,
    fondi_raccolti NUMERIC(12,2) DEFAULT 0,
    donazione_lcif NUMERIC(12,2) DEFAULT 0,
    
    -- Beneficiario
    organizzazione_beneficiaria TEXT,
    
    -- Dati originali Excel (per riferimento)
    rapporto_completo BOOLEAN DEFAULT false,
    livello TEXT,  -- Lions Club, Multiple District, etc.
    tipo_text TEXT,  -- Tipo progetto text
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Abilita RLS
ALTER TABLE service_activities ENABLE ROW LEVEL SECURITY;

-- Policy
CREATE POLICY "Modifica service_activities" ON service_activities FOR ALL USING (true) WITH CHECK (true);

-- =============================================================================
-- 4. CREA TABELLA soci - Soci (opzionale, da Member Detail)
-- =============================================================================

DROP TABLE IF EXISTS soci;

CREATE TABLE soci (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_club INTEGER REFERENCES club(id) ON DELETE SET NULL,
    
    -- Dati soci
    matricola TEXT UNIQUE,  -- Identificativo Lions
    nome TEXT,
    cognome TEXT,
    titolo TEXT,  -- Geom, Dott, etc.
    sesso TEXT,  -- Maschio, Femmina
    data_nascita DATE,
    professione TEXT,
    
    -- Contatti
    email_personal TEXT,
    email_work TEXT,
    cellulare TEXT,
    telefono TEXT,
    
    -- Indirizzo
    indirizzo TEXT,
    citta TEXT,
    provincia TEXT,
    cap TEXT,
    paese TEXT DEFAULT 'Italy',
    
    -- Statoassociativo
    categoria TEXT,  -- Socio effettivo, Socio onorario, etc.
    stato_associativo TEXT,  -- Lion, Leo, etc.
    tipo_associazione TEXT,
    data_ingresso DATE,
    
    -- Famiglia
    nome_coniuge TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE soci ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Modifica soci" ON soci FOR ALL USING (true) WITH CHECK (true);

-- =============================================================================
-- 5. CREA INDICI per performance
-- =============================================================================

-- Indici per club
CREATE INDEX IF NOT EXISTS idx_club_distretto ON club(distretto);
CREATE INDEX IF NOT EXISTS idx_club_circoscrizione ON club(circoscrizione);
CREATE INDEX IF NOT EXISTS idx_club_zona ON club(zona);

-- Indici per officer
CREATE INDEX IF NOT EXISTS idx_officer_club ON officer(id_club);
CREATE INDEX IF NOT EXISTS idx_officer_titolo ON officer(titolo);
CREATE INDEX IF NOT EXISTS idx_officer_stato ON officer(stato);

-- Indici per service_activities
CREATE INDEX IF NOT EXISTS idx_service_club ON service_activities(id_club);
CREATE INDEX IF NOT EXISTS idx_service_causa ON service_activities(causa);
CREATE INDEX IF NOT EXISTS idx_service_data ON service_activities(data_inizio);
CREATE INDEX IF NOT EXISTS idx_service_conclusione ON service_activities(data_conclusione);

-- Indici per soci
CREATE INDEX IF NOT EXISTS idx_soci_club ON soci(id_club);
CREATE INDEX IF NOT EXISTS idx_soci_matricola ON soci(matricola) WHERE matricola IS NOT NULL;

-- =============================================================================
-- FINE
-- =============================================================================