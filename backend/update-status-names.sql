-- Script pour mettre à jour les noms de statut
-- Change "À contacter" en "Prospects à contacter"

UPDATE prospects 
SET statut = 'Prospects à contacter' 
WHERE statut = 'À contacter';

-- Afficher les résultats
SELECT statut, COUNT(*) as count 
FROM prospects 
GROUP BY statut 
ORDER BY count DESC; 