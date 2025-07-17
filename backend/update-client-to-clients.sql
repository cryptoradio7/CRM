-- Mise à jour des statuts "Client" vers "Clients"
UPDATE prospects SET statut = 'Clients' WHERE statut = 'Client';

-- Vérification des mises à jour
SELECT statut, COUNT(*) as count FROM prospects GROUP BY statut ORDER BY statut; 