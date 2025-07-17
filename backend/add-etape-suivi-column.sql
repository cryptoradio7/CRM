-- Ajoute la colonne etape_suivi pour le suivi d'action
ALTER TABLE prospects ADD COLUMN IF NOT EXISTS etape_suivi VARCHAR(32) DEFAULT 'à contacter'; 