-- Aggiungi colonne mancanti a officer
ALTER TABLE officer ADD COLUMN IF NOT EXISTS club_name TEXT;

-- Aggiungi colonne mancanti a service_activities  
ALTER TABLE service_activities ADD COLUMN IF NOT EXISTS club_name TEXT;
ALTER TABLE service_activities ADD COLUMN IF NOT EXISTS tipo_text TEXT;
ALTER TABLE service_activities ADD COLUMN IF NOT EXISTS livello TEXT;

-- Aggiungi colonna a soci se serve
ALTER TABLE soci ADD COLUMN IF NOT EXISTS id_club_temp INTEGER;