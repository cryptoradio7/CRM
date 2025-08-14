-- =====================================================
-- SCHEMA COMPLET CRM - Script unifié de base de données
-- =====================================================
-- Ce fichier remplace tous les scripts SQL individuels
-- Date: $(date)
-- =====================================================

-- 1. CRÉATION DE LA TABLE PRINCIPALE
-- =====================================================
DROP TABLE IF EXISTS prospects;

CREATE TABLE prospects (
    id SERIAL PRIMARY KEY,
    nom VARCHAR(255) NOT NULL,
    prenom VARCHAR(255),
    email VARCHAR(255),
    telephone VARCHAR(50),
    entreprise VARCHAR(255),
    role VARCHAR(255),
    ville VARCHAR(100),
    region VARCHAR(100),
    type_entreprise VARCHAR(100),
    statut VARCHAR(100) DEFAULT 'Prospect à contacter',
    etape_suivi VARCHAR(32) DEFAULT 'à contacter',
    linkedin TEXT,
    interets TEXT,
    historique TEXT,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. DONNÉES DE TEST
-- =====================================================
INSERT INTO prospects (
    nom, prenom, email, telephone, entreprise, role, ville, 
    region, type_entreprise, statut, etape_suivi, linkedin, interets, historique
) VALUES 
    ('Dupont', 'Jean', 'jean.dupont@email.com', '0123456789', 'Entreprise A', 'Directeur Commercial', 'Luxembourg', 'Luxembourg', 'PME', 'Prospect à contacter', 'à contacter', 'https://linkedin.com/in/jeandupont', 'Technologies, Innovation', 'Premier contact lors du salon Tech 2024'),
    ('Martin', 'Marie', 'marie.martin@email.com', '0987654321', 'Entreprise B', 'CEO', 'Genève', 'Suisse', 'Grande entreprise', 'Client', 'en cours', 'https://linkedin.com/in/mariemartin', 'Management, Stratégie', 'Client depuis 2023, très satisfait de nos services'),
    ('Durand', 'Pierre', 'pierre.durand@email.com', '0555666777', 'Entreprise C', 'Développeur', 'Paris', 'France', 'Startup', 'Prospect à contacter', 'à contacter', 'https://linkedin.com/in/pierredurand', 'Développement web, IA', 'À contacter cette semaine pour présenter nos solutions');

-- 3. FONCTIONS UTILITAIRES
-- =====================================================

-- Fonction pour mettre à jour automatiquement la région basée sur la ville
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

-- 4. INDEX POUR OPTIMISER LES PERFORMANCES
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_prospects_statut ON prospects(statut);
CREATE INDEX IF NOT EXISTS idx_prospects_region ON prospects(region);
CREATE INDEX IF NOT EXISTS idx_prospects_date_creation ON prospects(date_creation);
CREATE INDEX IF NOT EXISTS idx_prospects_email ON prospects(email);

-- 5. VUES UTILES
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

-- 6. VÉRIFICATION FINALE
-- =====================================================
-- Afficher la structure de la table
\d prospects;

-- Afficher les données insérées
SELECT COUNT(*) as total_prospects FROM prospects;

-- Afficher la répartition par statut
SELECT statut, COUNT(*) as nombre 
FROM prospects 
GROUP BY statut 
ORDER BY nombre DESC;

-- Afficher la répartition par région
SELECT * FROM v_prospects_par_region;
