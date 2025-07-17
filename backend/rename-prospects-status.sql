-- Script pour renommer "Prospects à contacter" en "Prospects"
-- Exécutez ce script pour mettre à jour la base de données

UPDATE prospects 
SET statut = 'Prospects' 
WHERE statut = 'Prospects à contacter';

-- Vérification
SELECT statut, COUNT(*) as count 
FROM prospects 
GROUP BY statut 
ORDER BY statut; 