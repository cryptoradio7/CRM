-- =====================================================
-- AJOUT DES CHAMPS POUR LA MIGRATION DES PROSPECTS
-- =====================================================

-- 1. AJOUTER LES CHAMPS MANQUANTS DANS LA TABLE CONTACTS
ALTER TABLE contacts 
ADD COLUMN IF NOT EXISTS sector VARCHAR(100),
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS telephone VARCHAR(50),
ADD COLUMN IF NOT EXISTS interests TEXT,
ADD COLUMN IF NOT EXISTS historic TEXT,
ADD COLUMN IF NOT EXISTS follow_up VARCHAR(32),
ADD COLUMN IF NOT EXISTS date_creation TIMESTAMP,
ADD COLUMN IF NOT EXISTS date_modification TIMESTAMP;

-- 2. AJOUTER LE CHAMP MANQUANT DANS LA TABLE EXPERIENCES
ALTER TABLE experiences 
ADD COLUMN IF NOT EXISTS job_category VARCHAR(100);

-- 3. RENOMMER LE CHAMP DANS COMPANIES POUR CORRESPONDRE AU MAPPING
-- (company_website_url existe déjà, on garde le nom actuel)

-- 4. CRÉER LA TABLE DE MAPPING POUR LA MIGRATION
CREATE TABLE IF NOT EXISTS migration_mapping (
    id SERIAL PRIMARY KEY,
    old_prospect_id INTEGER NOT NULL,
    new_contact_id INTEGER,
    new_company_id INTEGER,
    migration_status VARCHAR(50) DEFAULT 'pending',
    migration_date TIMESTAMP DEFAULT NOW(),
    error_message TEXT,
    UNIQUE(old_prospect_id)
);

-- 5. CRÉER LES INDEX POUR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_contacts_sector ON contacts(sector);
CREATE INDEX IF NOT EXISTS idx_contacts_email ON contacts(email);
CREATE INDEX IF NOT EXISTS idx_contacts_follow_up ON contacts(follow_up);
CREATE INDEX IF NOT EXISTS idx_experiences_job_category ON experiences(job_category);
CREATE INDEX IF NOT EXISTS idx_migration_old_id ON migration_mapping(old_prospect_id);
CREATE INDEX IF NOT EXISTS idx_migration_status ON migration_mapping(migration_status);

-- 6. VÉRIFICATION DES CHAMPS AJOUTÉS
SELECT 'CONTACTS - Nouveaux champs' as table_info, 
       column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'contacts' 
  AND column_name IN ('sector', 'email', 'telephone', 'interests', 'historic', 'follow_up', 'date_creation', 'date_modification')
ORDER BY column_name;

SELECT 'EXPERIENCES - Nouveaux champs' as table_info,
       column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'experiences' 
  AND column_name = 'job_category';

SELECT 'MIGRATION_MAPPING - Table créée' as table_info,
       COUNT(*) as table_exists
FROM information_schema.tables 
WHERE table_name = 'migration_mapping';


