-- =====================================================
-- CRÉATION TABLE ALIAS ENTREPRISES
-- =====================================================
-- Table pour gérer les variantes de noms d'entreprises
-- et améliorer la correspondance entre expériences et base

CREATE TABLE IF NOT EXISTS company_aliases (
    id SERIAL PRIMARY KEY,
    company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
    alias_name VARCHAR(255) NOT NULL,
    alias_type VARCHAR(50) DEFAULT 'variant', -- 'variant', 'abbreviation', 'old_name'
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index pour optimiser les recherches
CREATE INDEX IF NOT EXISTS idx_company_aliases_name ON company_aliases(alias_name);
CREATE INDEX IF NOT EXISTS idx_company_aliases_company_id ON company_aliases(company_id);

-- =====================================================
-- INSERTION DES ALIAS BASÉS SUR L'ANALYSE
-- =====================================================

-- Alias pour BNP Paribas Cardif
INSERT INTO company_aliases (company_id, alias_name, alias_type, is_primary) 
SELECT id, 'Cardif Lux vie sa', 'variant', false FROM companies WHERE company_name = 'BNP Paribas Cardif';

INSERT INTO company_aliases (company_id, alias_name, alias_type, is_primary) 
SELECT id, 'Cardif Lux Vie sa', 'variant', false FROM companies WHERE company_name = 'BNP Paribas Cardif';

INSERT INTO company_aliases (company_id, alias_name, alias_type, is_primary) 
SELECT id, 'Cardif', 'abbreviation', false FROM companies WHERE company_name = 'BNP Paribas Cardif';

-- Alias pour BGL BNP Paribas
INSERT INTO company_aliases (company_id, alias_name, alias_type, is_primary) 
SELECT id, 'BGL', 'abbreviation', false FROM companies WHERE company_name = 'BGL BNP Paribas';

-- Alias pour Fortis Luxembourg Assurances
INSERT INTO company_aliases (company_id, alias_name, alias_type, is_primary) 
SELECT id, 'Fortis', 'abbreviation', false FROM companies WHERE company_name = 'Fortis Luxembourg Assurances';

-- Alias pour Patriotique Assurances ING
INSERT INTO company_aliases (company_id, alias_name, alias_type, is_primary) 
SELECT id, 'Patriotique', 'abbreviation', false FROM companies WHERE company_name = 'Patriotique Assurances ING';

-- Alias pour Royal Touring Club
INSERT INTO company_aliases (company_id, alias_name, alias_type, is_primary) 
SELECT id, 'Royal', 'abbreviation', false FROM companies WHERE company_name = 'Royal Touring Club';

-- Alias pour Test Experience Company Final Success
INSERT INTO company_aliases (company_id, alias_name, alias_type, is_primary) 
SELECT id, 'Test Experience Company Final Success After Restart', 'variant', false 
FROM companies WHERE company_name = 'Test Experience Company Final Success';

-- =====================================================
-- FONCTION DE RECHERCHE AVEC ALIAS
-- =====================================================

CREATE OR REPLACE FUNCTION find_company_by_name_or_alias(search_name TEXT)
RETURNS TABLE(
    company_id INTEGER,
    company_name VARCHAR(255),
    match_type VARCHAR(50)
) AS $$
BEGIN
    RETURN QUERY
    WITH search_results AS (
        -- Recherche exacte par nom d'entreprise
        SELECT c.id, c.company_name, 'exact'::VARCHAR(50) as match_type
        FROM companies c
        WHERE LOWER(c.company_name) = LOWER(search_name)
        
        UNION ALL
        
        -- Recherche par alias
        SELECT c.id, c.company_name, 'alias'::VARCHAR(50) as match_type
        FROM companies c
        JOIN company_aliases ca ON c.id = ca.company_id
        WHERE LOWER(ca.alias_name) = LOWER(search_name)
        
        UNION ALL
        
        -- Recherche partielle par nom d'entreprise
        SELECT c.id, c.company_name, 'partial'::VARCHAR(50) as match_type
        FROM companies c
        WHERE LOWER(c.company_name) LIKE '%' || LOWER(search_name) || '%'
        
        UNION ALL
        
        -- Recherche partielle par alias
        SELECT c.id, c.company_name, 'partial_alias'::VARCHAR(50) as match_type
        FROM companies c
        JOIN company_aliases ca ON c.id = ca.company_id
        WHERE LOWER(ca.alias_name) LIKE '%' || LOWER(search_name) || '%'
    )
    SELECT 
        sr.id as company_id,
        sr.company_name,
        sr.match_type
    FROM search_results sr
    ORDER BY 
        CASE sr.match_type 
            WHEN 'exact' THEN 1
            WHEN 'alias' THEN 2
            WHEN 'partial' THEN 3
            WHEN 'partial_alias' THEN 4
        END,
        sr.company_name;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- VUE POUR FACILITER LES RECHERCHES
-- =====================================================

CREATE OR REPLACE VIEW company_search_view AS
SELECT 
    c.id,
    c.company_name,
    c.company_description,
    c.company_industry,
    c.company_size,
    c.company_website_url,
    c.headquarters_city,
    c.headquarters_country,
    c.employee_count,
    c.revenue_bucket,
    c.company_type,
    c.created_at,
    c.updated_at,
    -- Alias disponibles
    STRING_AGG(ca.alias_name, ', ') as aliases
FROM companies c
LEFT JOIN company_aliases ca ON c.id = ca.company_id
GROUP BY c.id, c.company_name, c.company_description, c.company_industry, 
         c.company_size, c.company_website_url, c.headquarters_city, 
         c.headquarters_country, c.employee_count, c.revenue_bucket, 
         c.company_type, c.created_at, c.updated_at;
