-- Script pour corriger la base de données CRM
-- Ajouter la colonne region et mettre à jour les données existantes

-- 1. Ajouter la colonne region si elle n'existe pas
ALTER TABLE prospects ADD COLUMN IF NOT EXISTS region VARCHAR(100);

-- 2. Mettre à jour les valeurs de region basées sur ville
UPDATE prospects 
SET region = CASE 
    WHEN ville IN ('Juan les pins', 'Provence-Alpes-Côte d''Azur') THEN 'Provence-Alpes-Côte d''Azur'
    WHEN ville IN ('Paris', 'Île-de-France') THEN 'Île-de-France'
    WHEN ville IN ('Luxembourg', 'Centre', 'Sud', 'Nord', 'Est', 'Ouest') THEN 'Luxembourg'
    WHEN ville IN ('Genève', 'Vaud', 'Zurich', 'Bâle', 'Berne') THEN 'Suisse'
    ELSE 'Autre'
END
WHERE region IS NULL OR region = '';

-- 3. Afficher les résultats
SELECT id, nom, prenom, ville, region FROM prospects; 