-- Mise à jour complète du schéma pour supporter toutes les données Lemlist
-- Exécuter avec: PGPASSWORD="Luxembourg1978" psql -h localhost -p 5432 -U egx -d crm_db -f update_schema_complete.sql

-- =====================================================
-- MISE À JOUR TABLE CONTACTS
-- =====================================================

-- Ajouter les nouvelles colonnes à la table contacts
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS canonical_shorthand_name VARCHAR(255);
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS profile_picture_url TEXT;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS experience_count INTEGER DEFAULT 0;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS connections_count_bucket VARCHAR(50);
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS linkedin_short VARCHAR(255);
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS current_company_name VARCHAR(255);
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS current_company_industry VARCHAR(255);
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS current_company_subindustry VARCHAR(255);
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS lead_location_geopoint_array JSONB;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS _score DECIMAL(10,8);

-- =====================================================
-- MISE À JOUR TABLE COMPANIES
-- =====================================================

-- Ajouter les nouvelles colonnes à la table companies
ALTER TABLE companies ADD COLUMN IF NOT EXISTS company_shorthand_name VARCHAR(255);
ALTER TABLE companies ADD COLUMN IF NOT EXISTS logo_url TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS linkedin_url TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS company_followers_count INTEGER DEFAULT 0;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS company_founded INTEGER;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS company_domain VARCHAR(255);
ALTER TABLE companies ADD COLUMN IF NOT EXISTS employees_count_growth INTEGER;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS business_customer VARCHAR(50);
ALTER TABLE companies ADD COLUMN IF NOT EXISTS company_subsubindustry VARCHAR(255);
ALTER TABLE companies ADD COLUMN IF NOT EXISTS company_url TEXT;

-- =====================================================
-- MISE À JOUR TABLE EXPERIENCES
-- =====================================================

-- Ajouter les nouvelles colonnes à la table experiences
ALTER TABLE experiences ADD COLUMN IF NOT EXISTS job_category VARCHAR(255);
ALTER TABLE experiences ADD COLUMN IF NOT EXISTS company_name VARCHAR(255);
ALTER TABLE experiences ADD COLUMN IF NOT EXISTS current_exp_bucket VARCHAR(100);
ALTER TABLE experiences ADD COLUMN IF NOT EXISTS company_shorthand_name VARCHAR(255);
ALTER TABLE experiences ADD COLUMN IF NOT EXISTS company_description TEXT;
ALTER TABLE experiences ADD COLUMN IF NOT EXISTS company_employee_count INTEGER;
ALTER TABLE experiences ADD COLUMN IF NOT EXISTS company_followers_count INTEGER;
ALTER TABLE experiences ADD COLUMN IF NOT EXISTS company_headquarters_city VARCHAR(255);
ALTER TABLE experiences ADD COLUMN IF NOT EXISTS company_headquarters_country VARCHAR(255);
ALTER TABLE experiences ADD COLUMN IF NOT EXISTS company_linkedin_url TEXT;
ALTER TABLE experiences ADD COLUMN IF NOT EXISTS company_logo_url TEXT;
ALTER TABLE experiences ADD COLUMN IF NOT EXISTS company_website_url TEXT;
ALTER TABLE experiences ADD COLUMN IF NOT EXISTS company_type VARCHAR(100);
ALTER TABLE experiences ADD COLUMN IF NOT EXISTS company_size VARCHAR(50);
ALTER TABLE experiences ADD COLUMN IF NOT EXISTS revenue_bucket VARCHAR(50);
ALTER TABLE experiences ADD COLUMN IF NOT EXISTS company_domain VARCHAR(255);
ALTER TABLE experiences ADD COLUMN IF NOT EXISTS employees_count_growth INTEGER;
ALTER TABLE experiences ADD COLUMN IF NOT EXISTS business_customer VARCHAR(50);
ALTER TABLE experiences ADD COLUMN IF NOT EXISTS company_industry VARCHAR(255);
ALTER TABLE experiences ADD COLUMN IF NOT EXISTS company_subindustry VARCHAR(255);
ALTER TABLE experiences ADD COLUMN IF NOT EXISTS company_subsubindustry VARCHAR(255);
ALTER TABLE experiences ADD COLUMN IF NOT EXISTS company_url TEXT;

-- =====================================================
-- CRÉATION TABLE CONTACT_EDUCATION
-- =====================================================

CREATE TABLE IF NOT EXISTS contact_education (
    id SERIAL PRIMARY KEY,
    contact_id INTEGER NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
    institution VARCHAR(255),
    degree VARCHAR(255),
    field_of_study VARCHAR(255),
    start_date DATE,
    end_date DATE,
    order_in_profile INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Index pour contact_education
CREATE INDEX IF NOT EXISTS idx_contact_education_contact_id ON contact_education(contact_id);
CREATE INDEX IF NOT EXISTS idx_contact_education_institution ON contact_education(institution);

-- =====================================================
-- MISE À JOUR TABLE CONTACT_LANGUES
-- =====================================================

-- Ajouter les nouvelles colonnes à contact_languages
ALTER TABLE contact_languages ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW();
ALTER TABLE contact_languages ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();

-- =====================================================
-- MISE À JOUR TABLE CONTACT_SKILLS
-- =====================================================

-- Ajouter les nouvelles colonnes à contact_skills
ALTER TABLE contact_skills ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW();
ALTER TABLE contact_skills ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();

-- =====================================================
-- MISE À JOUR TABLE CONTACT_INTERESTS
-- =====================================================

-- Ajouter les nouvelles colonnes à contact_interests
ALTER TABLE contact_interests ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW();
ALTER TABLE contact_interests ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();

-- =====================================================
-- CRÉATION D'INDEX POUR PERFORMANCE
-- =====================================================

-- Index pour les nouvelles colonnes contacts
CREATE INDEX IF NOT EXISTS idx_contacts_canonical_shorthand_name ON contacts(canonical_shorthand_name);
CREATE INDEX IF NOT EXISTS idx_contacts_experience_count ON contacts(experience_count);
CREATE INDEX IF NOT EXISTS idx_contacts_current_company_name ON contacts(current_company_name);
CREATE INDEX IF NOT EXISTS idx_contacts_current_company_industry ON contacts(current_company_industry);

-- Index pour les nouvelles colonnes companies
CREATE INDEX IF NOT EXISTS idx_companies_company_shorthand_name ON companies(company_shorthand_name);
CREATE INDEX IF NOT EXISTS idx_companies_company_followers_count ON companies(company_followers_count);
CREATE INDEX IF NOT EXISTS idx_companies_company_founded ON companies(company_founded);
CREATE INDEX IF NOT EXISTS idx_companies_company_domain ON companies(company_domain);

-- Index pour les nouvelles colonnes experiences
CREATE INDEX IF NOT EXISTS idx_experiences_job_category ON experiences(job_category);
CREATE INDEX IF NOT EXISTS idx_experiences_company_name ON experiences(company_name);
CREATE INDEX IF NOT EXISTS idx_experiences_company_industry ON experiences(company_industry);
CREATE INDEX IF NOT EXISTS idx_experiences_company_size ON experiences(company_size);

-- =====================================================
-- MISE À JOUR DES TYPES
-- =====================================================

-- Mettre à jour les types TypeScript
-- (Ceci sera fait dans le code frontend)

-- =====================================================
-- VÉRIFICATION
-- =====================================================

-- Vérifier que toutes les colonnes ont été ajoutées
SELECT 
    table_name, 
    column_name, 
    data_type 
FROM information_schema.columns 
WHERE table_name IN ('contacts', 'companies', 'experiences', 'contact_education', 'contact_languages', 'contact_skills', 'contact_interests')
    AND column_name IN (
        'canonical_shorthand_name', 'profile_picture_url', 'experience_count',
        'connections_count_bucket', 'linkedin_short', 'current_company_name',
        'company_shorthand_name', 'logo_url', 'linkedin_url', 'company_followers_count',
        'job_category', 'company_name', 'institution', 'degree'
    )
ORDER BY table_name, column_name;

-- Afficher le nombre de colonnes par table
SELECT 
    table_name,
    COUNT(*) as column_count
FROM information_schema.columns 
WHERE table_name IN ('contacts', 'companies', 'experiences', 'contact_education', 'contact_languages', 'contact_skills', 'contact_interests')
GROUP BY table_name
ORDER BY table_name;
