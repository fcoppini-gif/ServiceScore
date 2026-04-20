-- =============================================================================
-- ELIMINA SISTEMA VECCHIO
-- =============================================================================

-- Drop old tables
DROP TABLE IF EXISTS dettaglio_inserimenti CASCADE;
DROP TABLE IF EXISTS service_inseriti CASCADE;
DROP TABLE IF EXISTS regole_calcolo CASCADE;
DROP TABLE IF EXISTS tipi_service CASCADE;
DROP TABLE IF EXISTS parametri CASCADE;

-- Verifica tabelle rimaste
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;