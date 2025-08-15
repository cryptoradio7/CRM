-- =====================================================
-- SCRIPT DE MIGRATION UNIFIÉE - CRM
-- =====================================================
-- Ce script met à jour une base de données existante
-- vers le nouveau schéma unifié
-- =====================================================

-- 1. AJOUT DES NOUVELLES COLONNES (si elles n'existent pas)
-- =====================================================

-- Ajouter la colonne region
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'prospects' AND column_name = 'region'
    ) THEN
        ALTER TABLE prospects ADD COLUMN region VARCHAR(100);
        RAISE NOTICE 'Colonne region ajoutée';
    END IF;
END $$;

-- Ajouter la colonne type_entreprise
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'prospects' AND column_name = 'type_entreprise'
    ) THEN
        ALTER TABLE prospects ADD COLUMN type_entreprise VARCHAR(100);
        RAISE NOTICE 'Colonne type_entreprise ajoutée';
    END IF;
END $$;

-- Ajouter la colonne etape_suivi
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'prospects' AND column_name = 'etape_suivi'
    ) THEN
        ALTER TABLE prospects ADD COLUMN etape_suivi VARCHAR(32) DEFAULT 'à contacter';
        RAISE NOTICE 'Colonne etape_suivi ajoutée';
    END IF;
END $$;

-- 2. MISE À JOUR DES DONNÉES EXISTANTES
-- =====================================================

-- Mettre à jour les régions basées sur les villes
UPDATE prospects 
SET region = CASE 
    WHEN ville IN ('Luxembourg', 'Centre', 'Sud', 'Nord', 'Est', 'Ouest') THEN 'Luxembourg'
    WHEN ville IN ('Genève', 'Vaud', 'Zurich', 'Bâle', 'Berne') THEN 'Suisse'
    WHEN ville IN ('Paris', 'Île-de-France', 'Grand Est', 'Auvergne-Rhône-Alpes', 'Occitanie', 'Provence-Alpes-Côte d''Azur') THEN 'France'
    ELSE 'Autre'
END
WHERE region IS NULL OR region = '';

-- Standardiser les statuts
UPDATE prospects 
SET statut = 'Prospect à contacter' 
WHERE statut IN ('À contacter', 'Prospects à contacter');

-- Initialiser etape_suivi pour les prospects
UPDATE prospects 
SET etape_suivi = 'à contacter' 
WHERE etape_suivi IS NULL AND statut = 'Prospect à contacter';

UPDATE prospects 
SET etape_suivi = 'en cours' 
WHERE etape_suivi IS NULL AND statut = 'Client';

-- 3. CRÉATION DES FONCTIONS ET TRIGGERS
-- =====================================================

-- Fonction pour mettre à jour automatiquement la région
CREATE OR REPLACE FUNCTION update_region_from_ville()
RETURNS TRIGGER AS $$
BEGIN
    NEW.region = CASE 
        WHEN NEW.ville IN ('Luxembourg', 'Centre', 'Sud', 'Nord', 'Est', 'Ouest') THEN 'Luxembourg'
        WHEN NEW.ville IN ('Genève', 'Vaud', 'Zurich', 'Bâle', 'Berne') THEN 'Suisse'
        WHEN NEW.ville IN ('Paris', 'Île-de-France', 'Grand Est', 'Auvergne-Rhône-Alpes', 'Occitanie', 'Provence-Alpes-Côte d''Azur') THEN 'France'
        ELSE 'Autre'
    END;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour mettre à jour automatiquement la région
DROP TRIGGER IF EXISTS trigger_update_region ON prospects;
CREATE TRIGGER trigger_update_region
    BEFORE INSERT OR UPDATE ON prospects
    FOR EACH ROW
    EXECUTE FUNCTION update_region_from_ville();

-- 4. CRÉATION DES INDEX
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_prospects_statut ON prospects(statut);
CREATE INDEX IF NOT EXISTS idx_prospects_region ON prospects(region);
CREATE INDEX IF NOT EXISTS idx_prospects_date_creation ON prospects(date_creation);
CREATE INDEX IF NOT EXISTS idx_prospects_email ON prospects(email);

-- 5. CRÉATION DES VUES
-- =====================================================

-- Vue des prospects par région
CREATE OR REPLACE VIEW v_prospects_par_region AS
SELECT region, COUNT(*) as nombre_prospects, 
       COUNT(CASE WHEN statut = 'Client' THEN 1 END) as clients,
       COUNT(CASE WHEN statut = 'Prospect à contacter' THEN 1 END) as prospects
FROM prospects 
GROUP BY region 
ORDER BY nombre_prospects DESC;

-- Vue des prospects à contacter
CREATE OR REPLACE VIEW v_prospects_a_contacter AS
SELECT id, nom, prenom, email, telephone, entreprise, ville, region, date_creation
FROM prospects 
WHERE statut = 'Prospect à contacter' 
ORDER BY date_creation ASC;

-- 6. VÉRIFICATION DE LA MIGRATION
-- =====================================================
SELECT 'Migration terminée avec succès' as status;

-- Afficher la structure finale
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'prospects' 
ORDER BY ordinal_position;

-- Afficher les statistiques
SELECT 
    COUNT(*) as total_prospects,
    COUNT(CASE WHEN statut = 'Client' THEN 1 END) as clients,
    COUNT(CASE WHEN statut = 'Prospect à contacter' THEN 1 END) as prospects
FROM prospects;


