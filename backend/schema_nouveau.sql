-- Nouveau schéma CRM avec les données du moteur de recherche
-- Base de données: crm_db
-- User: egx

-- Table principale des prospects avec les nouveaux champs
CREATE TABLE prospects (
    id SERIAL PRIMARY KEY,
    nom_complet VARCHAR(255) NOT NULL,
    entreprise VARCHAR(255),
    categorie_poste VARCHAR(100),
    poste_specifique VARCHAR(255),
    pays VARCHAR(100) DEFAULT 'Luxembourg',
    taille_entreprise VARCHAR(50),
    site_web VARCHAR(255),
    secteur VARCHAR(100),
    mx_record_exists BOOLEAN DEFAULT false,
    email VARCHAR(255),
    telephone VARCHAR(50),
    linkedin TEXT,
    interets TEXT,
    historique TEXT,
    statut VARCHAR(100) DEFAULT 'Prospect à contacter',
    etape_suivi VARCHAR(32) DEFAULT 'à contacter',
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_modification TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des catégories de poste
CREATE TABLE categories_poste (
    id SERIAL PRIMARY KEY,
    nom VARCHAR(100) NOT NULL UNIQUE,
    actif BOOLEAN DEFAULT true
);

-- Table des tailles d'entreprise
CREATE TABLE tailles_entreprise (
    id SERIAL PRIMARY KEY,
    nom VARCHAR(50) NOT NULL UNIQUE,
    actif BOOLEAN DEFAULT true
);

-- Table des secteurs
CREATE TABLE secteurs (
    id SERIAL PRIMARY KEY,
    nom VARCHAR(100) NOT NULL UNIQUE,
    actif BOOLEAN DEFAULT true
);

-- Table des pays
CREATE TABLE pays (
    id SERIAL PRIMARY KEY,
    nom VARCHAR(100) NOT NULL UNIQUE,
    actif BOOLEAN DEFAULT true
);

-- Insertion des données de référence
INSERT INTO categories_poste (nom) VALUES
('Académique'),
('Administratif'),
('Assistance'),
('Audit'),
('Autre poste'),
('Communication'),
('Comptable/Financier'),
('Coach'),
('Direction'),
('Exécutif'),
('Fonction publique'),
('Founder'),
('Gouvernance'),
('Gestion'),
('Indépendant'),
('Juridique'),
('Médiation'),
('Représentation'),
('Recherche'),
('Ressources Humaines'),
('Responsable'),
('Service'),
('Techniques de l''Information'),
('Technique'),
('Vente/Marketing');

INSERT INTO tailles_entreprise (nom) VALUES
('1-10'),
('11-50'),
('51-200'),
('201-500'),
('501-1000'),
('1001-5000'),
('5001-10000'),
('10001+');

INSERT INTO secteurs (nom) VALUES
('Administrative & Support Services'),
('Aerospace'),
('Agriculture'),
('Automotive'),
('Chemicals'),
('Construction'),
('Consumer Goods'),
('Consumer Services'),
('Education'),
('Energy'),
('Finance'),
('Healthcare'),
('Hospitality'),
('Manufacturing'),
('Media & Entertainment'),
('Non profit'),
('Organizations'),
('Professional Services'),
('Public Administration'),
('Real Estate'),
('Retail'),
('Technology'),
('Telecommunications'),
('Transportation'),
('Utilities'),
('Wholesale');

INSERT INTO pays (nom) VALUES
('Luxembourg'),
('Suisse');

-- Index pour les performances
CREATE INDEX IF NOT EXISTS idx_prospects_nom_complet ON prospects(nom_complet);
CREATE INDEX IF NOT EXISTS idx_prospects_entreprise ON prospects(entreprise);
CREATE INDEX IF NOT EXISTS idx_prospects_categorie_poste ON prospects(categorie_poste);
CREATE INDEX IF NOT EXISTS idx_prospects_pays ON prospects(pays);
CREATE INDEX IF NOT EXISTS idx_prospects_taille_entreprise ON prospects(taille_entreprise);
CREATE INDEX IF NOT EXISTS idx_prospects_secteur ON prospects(secteur);
CREATE INDEX IF NOT EXISTS idx_prospects_email ON prospects(email);
CREATE INDEX IF NOT EXISTS idx_prospects_statut ON prospects(statut);
CREATE INDEX IF NOT EXISTS idx_prospects_date_creation ON prospects(date_creation);

-- Vues pour les statistiques
CREATE OR REPLACE VIEW v_prospects_par_pays AS
SELECT pays, COUNT(*) as nombre_prospects,
       COUNT(CASE WHEN statut = 'Client' THEN 1 END) as clients,
       COUNT(CASE WHEN statut = 'Prospect à contacter' THEN 1 END) as prospects
FROM prospects
GROUP BY pays
ORDER BY nombre_prospects DESC;

CREATE OR REPLACE VIEW v_prospects_par_secteur AS
SELECT secteur, COUNT(*) as nombre_prospects,
       COUNT(CASE WHEN statut = 'Client' THEN 1 END) as clients,
       COUNT(CASE WHEN statut = 'Prospect à contacter' THEN 1 END) as prospects
FROM prospects
WHERE secteur IS NOT NULL
GROUP BY secteur
ORDER BY nombre_prospects DESC;

CREATE OR REPLACE VIEW v_prospects_par_taille_entreprise AS
SELECT taille_entreprise, COUNT(*) as nombre_prospects,
       COUNT(CASE WHEN statut = 'Client' THEN 1 END) as clients,
       COUNT(CASE WHEN statut = 'Prospect à contacter' THEN 1 END) as prospects
FROM prospects
WHERE taille_entreprise IS NOT NULL
GROUP BY taille_entreprise
ORDER BY nombre_prospects DESC;

CREATE OR REPLACE VIEW v_prospects_a_contacter AS
SELECT id, nom_complet, entreprise, categorie_poste, poste_specifique, 
       pays, taille_entreprise, secteur, email, telephone, date_creation
FROM prospects
WHERE statut = 'Prospect à contacter'
ORDER BY date_creation ASC;

-- Fonction pour mettre à jour la date de modification
CREATE OR REPLACE FUNCTION update_date_modification()
RETURNS TRIGGER AS $$
BEGIN
    NEW.date_modification = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour la date de modification
CREATE TRIGGER trigger_update_date_modification
    BEFORE UPDATE ON prospects
    FOR EACH ROW
    EXECUTE FUNCTION update_date_modification();

-- Données de test
INSERT INTO prospects (nom_complet, entreprise, categorie_poste, poste_specifique, pays, taille_entreprise, secteur, email, telephone, statut) VALUES
('Jean Dupont', 'TechCorp Luxembourg', 'Direction', 'CEO', 'Luxembourg', '51-200', 'Technology', 'jean.dupont@techcorp.lu', '+352 123 456 789', 'Prospect à contacter'),
('Marie Martin', 'Finance SA', 'Comptable/Financier', 'Directeur Financier', 'Luxembourg', '201-500', 'Finance', 'marie.martin@finance.lu', '+352 987 654 321', 'Client'),
('Pierre Schmidt', 'Startup AG', 'Founder', 'Fondateur', 'Suisse', '11-50', 'Technology', 'pierre@startup.ch', '+41 44 123 4567', 'Prospect à contacter');
