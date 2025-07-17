-- Script pour ajouter la colonne region à la table prospects existante
-- Ce script préserve toutes les données existantes

-- Ajouter la colonne region si elle n'existe pas
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'prospects' AND column_name = 'region'
    ) THEN
        ALTER TABLE prospects ADD COLUMN region VARCHAR(100);
        RAISE NOTICE 'Colonne region ajoutée avec succès';
    ELSE
        RAISE NOTICE 'La colonne region existe déjà';
    END IF;
END $$;

-- Mettre à jour les valeurs de region basées sur ville pour les données existantes
UPDATE prospects 
SET region = CASE 
    WHEN ville IN ('Luxembourg', 'Centre', 'Sud', 'Nord', 'Est', 'Ouest') THEN 'Luxembourg'
    WHEN ville IN ('Genève', 'Vaud', 'Zurich', 'Bâle', 'Berne') THEN 'Suisse'
    WHEN ville IN ('Paris', 'Île-de-France', 'Grand Est', 'Auvergne-Rhône-Alpes', 'Occitanie', 'Provence-Alpes-Côte d''Azur') THEN 'France'
    ELSE 'Autre'
END
WHERE region IS NULL;

-- Afficher la structure mise à jour
\d prospects; 