-- =============================================================================
-- AGGIORNA SCHEMA: Link tra tabelle e FK
-- =============================================================================
-- Esegui questo nel Supabase SQL Editor

-- 1. AGGIUNGI FK A OFFICER (link a club tramite nome)
ALTER TABLE officer ADD COLUMN IF NOT EXISTS id_club INTEGER;

-- 2. AGGIUNGI FK A SERVICE_ACTIVITIES (link a club tramite nome)
ALTER TABLE service_activities ADD COLUMN IF NOT EXISTS id_club INTEGER;

-- 3. CREA VISTA PER CLUB CON COUNT ACTIVITY E OFFICER
DROP VIEW IF EXISTS club_stats;

CREATE VIEW club_stats AS
SELECT 
    c.id,
    c.nome,
    c.id_lions,
    c.circoscrizione,
    c.zona,
    c.distretto,
    COUNT(DISTINCT o.id) as officer_count,
    COUNT(DISTINCT s.id) as activity_count,
    COALESCE(SUM(s.persone_servite), 0) as persone_servite,
    COALESCE(SUM(s.totale_volontari), 0) as volontari,
    COALESCE(SUM(s.fondi_donati), 0) as fondi_donati
FROM club c
LEFT JOIN officer o ON o.club_name = c.nome OR o.id_club = c.id
LEFT JOIN service_activities s ON s.club_name = c.nome OR s.id_club = c.id
GROUP BY c.id, c.nome, c.id_lions, c.circoscrizione, c.zona, c.distretto;

-- 4. CREA VISTA PER SERVICE ACTIVITIES COMPLETA
DROP VIEW IF EXISTS service_activities_view;

CREATE VIEW service_activities_view AS
SELECT 
    s.*,
    c.id as club_id,
    c.circoscrizione,
    c.zona,
    c.distretto
FROM service_activities s
LEFT JOIN club c ON c.nome = s.club_name OR c.id = s.id_club;

-- 5. CREA VISTA PER OFFICER COMPLETO
DROP VIEW IF EXISTS officer_view;

CREATE VIEW officer_view AS
SELECT 
    o.*,
    c.id as club_id,
    c.circoscrizione,
    c.zona,
    c.distretto
FROM officer o
LEFT JOIN club c ON c.nome = o.club_name OR c.id = o.id_club;

-- =============================================================================
-- FINE
-- =============================================================================