-- =============================================================================
-- ANALIZZA I DATI
-- =============================================================================
SELECT 'club' as table_name, COUNT(*) as total FROM club
UNION ALL
SELECT 'officer', COUNT(*) FROM officer
UNION ALL  
SELECT 'service_activities', COUNT(*) FROM service_activities;

-- Verifica struttura service_activities
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'service_activities'
ORDER BY ordinal_position;