-- =====================================================
-- OPTIMISATION INDEX POUR RECHERCHE D'ENTREPRISES
-- =====================================================
-- Script pour optimiser les performances de recherche
-- sur les 3 champs d'entreprise de la table contacts
-- =====================================================

-- 1. Index composite pour la recherche multi-champs
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_contacts_company_search_multi 
ON contacts (current_company_name, current_company_industry, current_company_subindustry, id) 
WHERE current_company_name IS NOT NULL 
AND current_company_name != '';

-- 2. Extension trigramme pour recherche partielle rapide
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- 3. Index de trigramme pour recherche partielle sur les 3 champs
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_contacts_company_name_trgm 
ON contacts USING gin (current_company_name gin_trgm_ops);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_contacts_company_industry_trgm 
ON contacts USING gin (current_company_industry gin_trgm_ops);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_contacts_company_subindustry_trgm 
ON contacts USING gin (current_company_subindustry gin_trgm_ops);

-- 4. Index pour les suggestions (recherche par préfixe)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_contacts_company_name_prefix 
ON contacts (current_company_name) 
WHERE current_company_name IS NOT NULL 
AND current_company_name != '';

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_contacts_company_industry_prefix 
ON contacts (current_company_industry) 
WHERE current_company_industry IS NOT NULL 
AND current_company_industry != '';

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_contacts_company_subindustry_prefix 
ON contacts (current_company_subindustry) 
WHERE current_company_subindustry IS NOT NULL 
AND current_company_subindustry != '';

-- 5. Index pour le tri par qualité et connexions
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_contacts_quality_sort 
ON contacts (lead_quality_score DESC, id DESC) 
WHERE current_company_name IS NOT NULL 
AND current_company_name != '';

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_contacts_connections_sort 
ON contacts (connections_count DESC, id DESC) 
WHERE current_company_name IS NOT NULL 
AND current_company_name != '';

-- 6. Mise à jour des statistiques
ANALYZE contacts;

-- 7. Vérification des index créés
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'contacts' 
AND indexname LIKE '%company%'
ORDER BY indexname;

-- 8. Statistiques de performance
SELECT 
    schemaname,
    tablename,
    attname,
    n_distinct,
    correlation
FROM pg_stats 
WHERE tablename = 'contacts' 
AND attname IN ('current_company_name', 'current_company_industry', 'current_company_subindustry');
