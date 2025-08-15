-- =====================================================
-- SCRIPT D'OPTIMISATION DES PERFORMANCES CRM
-- =====================================================

-- 1. ANALYSE DES PERFORMANCES ACTUELLES
-- =====================================================
ANALYZE prospects;

-- 2. INDEX OPTIMISÉS POUR LES REQUÊTES FRÉQUENTES
-- =====================================================

-- Index composite pour les requêtes de statistiques
CREATE INDEX IF NOT EXISTS idx_prospects_statut_date_creation 
ON prospects(statut, date_creation);

-- Index pour les requêtes par région
CREATE INDEX IF NOT EXISTS idx_prospects_region_statut 
ON prospects(region, statut);

-- Index pour les recherches par email
CREATE INDEX IF NOT EXISTS idx_prospects_email_lower 
ON prospects(LOWER(email));

-- Index pour les recherches par nom/prénom
CREATE INDEX IF NOT EXISTS idx_prospects_nom_prenom 
ON prospects(nom, prenom);

-- Index pour les requêtes temporelles
CREATE INDEX IF NOT EXISTS idx_prospects_date_creation_month_year 
ON prospects(EXTRACT(MONTH FROM date_creation), EXTRACT(YEAR FROM date_creation));

-- 3. OPTIMISATION DES STATISTIQUES
-- =====================================================

-- Vue matérialisée pour les statistiques (optionnel - pour de très grosses bases)
-- CREATE MATERIALIZED VIEW IF NOT EXISTS mv_prospects_stats AS
-- SELECT 
--   COUNT(*) as total_prospects,
--   COUNT(CASE WHEN statut = 'Prospects' THEN 1 END) as active_prospects,
--   COUNT(CASE WHEN statut = 'N/A' THEN 1 END) as total_na,
--   COUNT(CASE WHEN statut = 'Clients' THEN 1 END) as total_clients,
--   COUNT(CASE WHEN EXTRACT(MONTH FROM date_creation) = EXTRACT(MONTH FROM CURRENT_DATE) 
--               AND EXTRACT(YEAR FROM date_creation) = EXTRACT(YEAR FROM CURRENT_DATE) THEN 1 END) as new_this_month
-- FROM prospects;

-- 4. CONFIGURATION POSTGRESQL POUR PERFORMANCES
-- =====================================================

-- Augmenter la mémoire partagée (à exécuter en tant que superuser)
-- ALTER SYSTEM SET shared_buffers = '256MB';
-- ALTER SYSTEM SET effective_cache_size = '1GB';
-- ALTER SYSTEM SET work_mem = '4MB';
-- ALTER SYSTEM SET maintenance_work_mem = '64MB';

-- 5. VÉRIFICATION DES INDEX
-- =====================================================
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_scan as scans,
  idx_tup_read as tuples_read,
  idx_tup_fetch as tuples_fetched
FROM pg_stat_user_indexes 
WHERE tablename = 'prospects'
ORDER BY idx_scan DESC;

-- 6. STATISTIQUES DE PERFORMANCE
-- =====================================================
SELECT 
  schemaname,
  tablename,
  seq_scan,
  seq_tup_read,
  idx_scan,
  idx_tup_fetch,
  n_tup_ins,
  n_tup_upd,
  n_tup_del,
  n_live_tup,
  n_dead_tup
FROM pg_stat_user_tables 
WHERE tablename = 'prospects';

-- 7. NETTOYAGE ET MAINTENANCE
-- =====================================================
VACUUM ANALYZE prospects;

-- 8. VÉRIFICATION FINALE
-- =====================================================
SELECT 'Optimisation terminée' as status;
