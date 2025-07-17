-- Script pour ajouter la colonne type_entreprise à la table prospects existante
-- Ce script préserve toutes les données existantes

-- Ajouter la colonne type_entreprise si elle n'existe pas
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'prospects' AND column_name = 'type_entreprise'
    ) THEN
        ALTER TABLE prospects ADD COLUMN type_entreprise VARCHAR(100);
        RAISE NOTICE 'Colonne type_entreprise ajoutée avec succès';
    ELSE
        RAISE NOTICE 'La colonne type_entreprise existe déjà';
    END IF;
END $$;

-- Afficher la structure mise à jour
\d prospects; 