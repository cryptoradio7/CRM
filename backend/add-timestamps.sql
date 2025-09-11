-- =====================================================
-- AJOUT DES COLONNES TIMESTAMP DANS LE SCHÉMA EXISTANT
-- =====================================================

-- 1. CONTACTS - Ajouter profile_picture_url, created_at, updated_at
ALTER TABLE contacts 
ADD COLUMN IF NOT EXISTS profile_picture_url TEXT,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();

-- 2. ENTREPRISES - Ajouter created_at, updated_at
ALTER TABLE companies 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();

-- 3. EXPÉRIENCES - Ajouter created_at
ALTER TABLE experiences 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW();

-- 4. LANGUES DE PROFIL - Ajouter created_at
ALTER TABLE contact_languages 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW();

-- 5. COMPÉTENCES DES CONTACTS - Ajouter created_at
ALTER TABLE contact_skills 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW();

-- 6. INTÉRÊTS DES CONTACTS - Ajouter created_at
ALTER TABLE contact_interests 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW();

-- 7. ÉTAPES DE SUIVI CRM - Ajouter created_at
ALTER TABLE follow_up_stages 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW();

-- 8. NOTES ET INTERACTIONS - Ajouter created_at, updated_at
ALTER TABLE contact_notes 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();

-- =====================================================
-- CRÉER LES TRIGGERS POUR UPDATED_AT
-- =====================================================

-- Trigger pour contacts.updated_at
CREATE OR REPLACE FUNCTION update_contacts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_contacts_updated_at ON contacts;
CREATE TRIGGER trigger_contacts_updated_at
    BEFORE UPDATE ON contacts
    FOR EACH ROW
    EXECUTE FUNCTION update_contacts_updated_at();

-- Trigger pour companies.updated_at
CREATE OR REPLACE FUNCTION update_companies_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_companies_updated_at ON companies;
CREATE TRIGGER trigger_companies_updated_at
    BEFORE UPDATE ON companies
    FOR EACH ROW
    EXECUTE FUNCTION update_companies_updated_at();

-- Trigger pour contact_notes.updated_at
CREATE OR REPLACE FUNCTION update_contact_notes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_contact_notes_updated_at ON contact_notes;
CREATE TRIGGER trigger_contact_notes_updated_at
    BEFORE UPDATE ON contact_notes
    FOR EACH ROW
    EXECUTE FUNCTION update_contact_notes_updated_at();

-- =====================================================
-- CRÉER LES INDEX POUR PERFORMANCE
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_contacts_created_at ON contacts(created_at);
CREATE INDEX IF NOT EXISTS idx_companies_created_at ON companies(created_at);
CREATE INDEX IF NOT EXISTS idx_experiences_created_at ON experiences(created_at);
CREATE INDEX IF NOT EXISTS idx_contact_languages_created_at ON contact_languages(created_at);
CREATE INDEX IF NOT EXISTS idx_contact_skills_created_at ON contact_skills(created_at);
CREATE INDEX IF NOT EXISTS idx_contact_interests_created_at ON contact_interests(created_at);
CREATE INDEX IF NOT EXISTS idx_follow_up_stages_created_at ON follow_up_stages(created_at);
CREATE INDEX IF NOT EXISTS idx_contact_notes_created_at ON contact_notes(created_at);

-- =====================================================
-- MISE À JOUR DES DONNÉES EXISTANTES
-- =====================================================

-- Mettre à jour les enregistrements existants avec des timestamps
UPDATE contacts SET created_at = NOW() WHERE created_at IS NULL;
UPDATE companies SET created_at = NOW() WHERE created_at IS NULL;
UPDATE experiences SET created_at = NOW() WHERE created_at IS NULL;
UPDATE contact_languages SET created_at = NOW() WHERE created_at IS NULL;
UPDATE contact_skills SET created_at = NOW() WHERE created_at IS NULL;
UPDATE contact_interests SET created_at = NOW() WHERE created_at IS NULL;
UPDATE follow_up_stages SET created_at = NOW() WHERE created_at IS NULL;
UPDATE contact_notes SET created_at = NOW() WHERE created_at IS NULL;

-- Mettre à jour updated_at pour les contacts et entreprises existants
UPDATE contacts SET updated_at = NOW() WHERE updated_at IS NULL;
UPDATE companies SET updated_at = NOW() WHERE updated_at IS NULL;
UPDATE contact_notes SET updated_at = NOW() WHERE updated_at IS NULL;

-- =====================================================
-- VÉRIFICATION
-- =====================================================
SELECT 'CONTACTS' as table_name, COUNT(*) as total, 
       COUNT(created_at) as with_created_at, 
       COUNT(updated_at) as with_updated_at,
       COUNT(profile_picture_url) as with_profile_pic
FROM contacts
UNION ALL
SELECT 'COMPANIES', COUNT(*), COUNT(created_at), COUNT(updated_at), 0
FROM companies
UNION ALL
SELECT 'EXPERIENCES', COUNT(*), COUNT(created_at), 0, 0
FROM experiences
UNION ALL
SELECT 'CONTACT_LANGUAGES', COUNT(*), COUNT(created_at), 0, 0
FROM contact_languages
UNION ALL
SELECT 'CONTACT_SKILLS', COUNT(*), COUNT(created_at), 0, 0
FROM contact_skills
UNION ALL
SELECT 'CONTACT_INTERESTS', COUNT(*), COUNT(created_at), 0, 0
FROM contact_interests
UNION ALL
SELECT 'FOLLOW_UP_STAGES', COUNT(*), COUNT(created_at), 0, 0
FROM follow_up_stages
UNION ALL
SELECT 'CONTACT_NOTES', COUNT(*), COUNT(created_at), COUNT(updated_at), 0
FROM contact_notes;


