import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Pool } from 'pg';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'crm_db',
  password: process.env.DB_PASSWORD || '',
  port: parseInt(process.env.DB_PORT || '5432'),
});

pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Erreur de connexion à PostgreSQL:', err);
  } else {
    console.log('✅ Connexion à PostgreSQL réussie');
  }
});

// Routes de base
app.get('/', (req, res) => {
  res.json({ message: 'API CRM Backend - Fonctionnel!' });
});

// GET - Récupérer tous les prospects
app.get('/api/prospects', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM prospects ORDER BY date_creation DESC');
    res.json(result.rows);
  } catch (err) {
    console.error('Erreur lors de la récupération des prospects:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET - Récupérer un prospect par ID
app.get('/api/prospects/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM prospects WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Prospect non trouvé' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Erreur lors de la récupération du prospect:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// POST - Créer un nouveau prospect
app.post('/api/prospects', async (req, res) => {
  try {
    const { nom, prenom, email, telephone, entreprise, typeEntreprise, role, ville, statut, linkedin, interets, historique, etapeSuivi } = req.body;

    if (!nom) {
      return res.status(400).json({ error: 'Le nom est requis' });
    }

    const result = await pool.query(
      'INSERT INTO prospects (nom, prenom, email, telephone, entreprise, role, ville, statut, linkedin, interets, historique) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *',
              [nom, prenom, email, telephone, entreprise, role, ville, statut || "Prospects", linkedin, interets, historique]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Erreur lors de la création du prospect:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// PUT - Mettre à jour un prospect
app.put('/api/prospects/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nom, prenom, email, telephone, entreprise, typeEntreprise, role, ville, statut, linkedin, interets, historique, etapeSuivi } = req.body;

    const result = await pool.query(
      'UPDATE prospects SET nom = $1, prenom = $2, email = $3, telephone = $4, entreprise = $5, type_entreprise = $6, role = $7, ville = $8, ville = $9, statut = $10, linkedin = $11, interets = $12, historique = $13, etape_suivi = $14 WHERE id = $15 RETURNING *',
      [nom, prenom, email, telephone, entreprise, typeEntreprise, role, ville, statut, linkedin, interets, historique, etapeSuivi, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Prospect non trouvé' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Erreur lors de la mise à jour du prospect:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// DELETE - Supprimer un prospect
app.delete('/api/prospects/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM prospects WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Prospect non trouvé' });
    }
    
    res.json({ message: 'Prospect supprimé avec succès' });
  } catch (err) {
    console.error('Erreur lors de la suppression du prospect:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET - Statistiques du dashboard
app.get('/api/dashboard/stats', async (req, res) => {
  try {
    // Règles de gestion pour les métriques
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1; // 1-12
    const currentYear = currentDate.getFullYear();
    
    // 1. Total Prospects (tous les prospects)
    const totalProspectsResult = await pool.query('SELECT COUNT(*) as total FROM prospects');
    const totalProspects = parseInt(totalProspectsResult.rows[0].total);
    
    // 2. Prospects Actifs (statut = .Prospects.)
    const activeProspectsResult = await pool.query(
      'SELECT COUNT(*) as total FROM prospects WHERE statut = $1',
      ['Prospects']
    );
    const activeProspects = parseInt(activeProspectsResult.rows[0].total);
    
    // 2.5. Contacts N/A
    const naResult = await pool.query(
      'SELECT COUNT(*) as total FROM prospects WHERE statut = $1',
      ['N/A']
    );
    const totalNA = parseInt(naResult.rows[0].total);
    
    // 3. Nouveaux ce mois (créés dans le mois en cours)
    const newThisMonthResult = await pool.query(
      'SELECT COUNT(*) as total FROM prospects WHERE EXTRACT(MONTH FROM date_creation) = $1 AND EXTRACT(YEAR FROM date_creation) = $2',
      [currentMonth, currentYear]
    );
    const newThisMonth = parseInt(newThisMonthResult.rows[0].total);
    
    // 4. Taux de conversion (Clients / Total Contacts * 100)
    const clientsResult = await pool.query(
      'SELECT COUNT(*) as total FROM prospects WHERE statut = $1',
      ['Clients']
    );
    const totalClients = parseInt(clientsResult.rows[0].total);
    const conversionRate = totalProspects > 0 ? Math.round((totalClients / totalProspects) * 100) : 0;
    
    // 5. Activité récente (derniers prospects créés/modifiés)
    const recentActivityResult = await pool.query(
      'SELECT id, nom, prenom, entreprise, statut, date_creation FROM prospects ORDER BY date_creation DESC LIMIT 5'
    );
    
    // 6. Répartition par statut
    const statusDistributionResult = await pool.query(
      'SELECT statut, COUNT(*) as count FROM prospects GROUP BY statut ORDER BY count DESC'
    );
    
    // 7. Répartition par région
    const villeDistributionResult = await pool.query(
      'SELECT ville, COUNT(*) as count FROM prospects WHERE ville IS NOT NULL GROUP BY ville ORDER BY count DESC'
    );
    
    // 8. Tendances (comparaison avec le mois précédent)
    const lastMonth = currentMonth === 1 ? 12 : currentMonth - 1;
    const lastMonthYear = currentMonth === 1 ? currentYear - 1 : currentYear;
    
    const lastMonthResult = await pool.query(
      'SELECT COUNT(*) as total FROM prospects WHERE EXTRACT(MONTH FROM date_creation) = $1 AND EXTRACT(YEAR FROM date_creation) = $2',
      [lastMonth, lastMonthYear]
    );
    const lastMonthCount = parseInt(lastMonthResult.rows[0].total);
    
    const growthRate = lastMonthCount > 0 ? Math.round(((newThisMonth - lastMonthCount) / lastMonthCount) * 100) : 0;
    
    res.json({
      metrics: {
        totalProspects,
        activeProspects,
        newThisMonth,
        conversionRate,
        totalClients,
        totalNA,
        growthRate
      },
      recentActivity: recentActivityResult.rows,
      statusDistribution: statusDistributionResult.rows,
      villeDistribution: villeDistributionResult.rows,
      calculatedAt: new Date().toISOString()
    });
  } catch (err) {
    console.error('Erreur lors du calcul des statistiques:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// POST - Corriger la base de données (endpoint temporaire)
app.post('/api/fix-database', async (req, res) => {
  try {
    // Ajouter la colonne ville si elle n'existe pas
    await pool.query('ALTER TABLE prospects ADD COLUMN IF NOT EXISTS ville VARCHAR(100)');
    
    // Mettre à jour les valeurs de ville basées sur ville
    await pool.query(`
      UPDATE prospects 
      SET ville = CASE 
        WHEN ville IN ('Juan les pins', 'Provence-Alpes-Côte d''Azur') THEN 'Provence-Alpes-Côte d''Azur'
        WHEN ville IN ('Paris', 'Île-de-France') THEN 'Île-de-France'
        WHEN ville IN ('Luxembourg', 'Centre', 'Sud', 'Nord', 'Est', 'Ouest') THEN 'Luxembourg'
        WHEN ville IN ('Genève', 'Vaud', 'Zurich', 'Bâle', 'Berne') THEN 'Suisse'
        ELSE 'Autre'
      END
      WHERE ville IS NULL OR ville = ''
    `);
    
    // Mettre à jour les statuts "Client" vers "Clients"
    await pool.query("UPDATE prospects SET statut = .Client. WHERE statut = 'Client'");
    
    // Mettre à jour les statuts "Prospects à contacter" vers "Prospects"
    await pool.query("UPDATE prospects SET statut = .Prospects. WHERE statut = .Prospects.à contacter'");
    
    // Récupérer les données mises à jour
    const result = await pool.query('SELECT id, nom, prenom, ville, statut FROM prospects');
    
    res.json({ 
      message: 'Base de données corrigée avec succès',
      data: result.rows 
    });
  } catch (err) {
    console.error('Erreur lors de la correction de la base de données:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
  console.log(`📊 API disponible sur http://localhost:${PORT}/api`);
}); 