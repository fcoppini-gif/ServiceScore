-- =============================================================================
-- Schema Update for Selezioni (Filters) Feature
-- =============================================================================

-- =============================================================================
-- 1. Add fields to SOCI table
-- =============================================================================

ALTER TABLE soci
ADD COLUMN IF NOT EXISTS club_name TEXT,
ADD COLUMN IF NOT EXISTS zona TEXT,
ADD COLUMN IF NOT EXISTS circoscrizione TEXT;

-- Update from club relationship
UPDATE soci s
SET club_name = c.nome,
    zona = c.zona,
    circoscrizione = c.circoscrizione
FROM club c
WHERE s.id_club = c.id;

-- =============================================================================
-- 2. Add fields to OFFICER table
-- =============================================================================

ALTER TABLE officer
ADD COLUMN IF NOT EXISTS club_name TEXT,
ADD COLUMN IF NOT EXISTS zona TEXT,
ADD COLUMN IF NOT EXISTS circoscrizione TEXT;

-- Update from club relationship
UPDATE officer o
SET club_name = c.nome,
    zona = c.zona,
    circoscrizione = c.circoscrizione
FROM club c
WHERE o.id_club = c.id;

-- =============================================================================
-- 3. Add fields to SERVICE_ACTIVITIES
-- =============================================================================

ALTER TABLE service_activities
ADD COLUMN IF NOT EXISTS club_name TEXT,
ADD COLUMN IF NOT EXISTS zona_sponsor TEXT,
ADD COLUMN IF NOT EXISTS circoscrizione_sponsor TEXT;

-- Update from club relationship
UPDATE service_activities sa
SET club_name = c.nome,
    zona_sponsor = c.zona,
    circoscrizione_sponsor = c.circoscrizione
FROM club c
WHERE sa.id_club = c.id;

-- =============================================================================
-- 4. Create indexes for filter performance
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_soci_club_name ON soci(club_name);
CREATE INDEX IF NOT EXISTS idx_soci_zona ON soci(zona);
CREATE INDEX IF NOT EXISTS idx_soci_circoscrizione ON soci(circoscrizione);
CREATE INDEX IF NOT EXISTS idx_soci_citta ON soci(citta);
CREATE INDEX IF NOT EXISTS idx_soci_provincia ON soci(provincia);
CREATE INDEX IF NOT EXISTS idx_soci_categoria ON soci(categoria);

CREATE INDEX IF NOT EXISTS idx_officer_club_name ON officer(club_name);
CREATE INDEX IF NOT EXISTS idx_officer_zona ON officer(zona);
CREATE INDEX IF NOT EXISTS idx_officer_circoscrizione ON officer(circoscrizione);

CREATE INDEX IF NOT EXISTS idx_service_club_name ON service_activities(club_name);
CREATE INDEX IF NOT EXISTS idx_service_zona ON service_activities(zona_sponsor);
CREATE INDEX IF NOT EXISTS idx_service_circoscrizione ON service_activities(circoscrizione_sponsor);
CREATE INDEX IF NOT EXISTS idx_service_causa ON service_activities(causa);
CREATE INDEX IF NOT EXISTS idx_service_tipo ON service_activities(tipo_progetto);
