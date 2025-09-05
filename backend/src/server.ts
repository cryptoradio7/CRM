import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Pool } from 'pg';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3003;

app.use(cors());
app.use(express.json());

const pool = new Pool({
  user: process.env.DB_USER || 'egx',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'crm_db',
  password: process.env.DB_PASSWORD || 'Luxembourg1978',
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
    console.error('Erreur lors du chargement des prospects:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET - Récupérer les catégories de poste
app.get('/api/categories-poste', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM categories_poste WHERE actif = true ORDER BY nom');
    res.json(result.rows);
  } catch (err) {
    console.error('Erreur lors du chargement des catégories de poste:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET - Récupérer les tailles d'entreprise
app.get('/api/tailles-entreprise', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM tailles_entreprise WHERE actif = true ORDER BY ordre ASC');
    res.json(result.rows);
  } catch (err) {
    console.error('Erreur lors du chargement des tailles d\'entreprise:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET - Récupérer les secteurs
app.get('/api/secteurs', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM secteurs WHERE actif = true ORDER BY nom');
    res.json(result.rows);
  } catch (err) {
    console.error('Erreur lors du chargement des secteurs:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET - Récupérer les pays
app.get('/api/pays', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM pays WHERE actif = true ORDER BY nom');
    res.json(result.rows);
  } catch (err) {
    console.error('Erreur lors du chargement des pays:', err);
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
    const { 
      nom_complet, 
      entreprise, 
      categorie_poste, 
      poste_specifique, 
      pays, 
      taille_entreprise, 
      site_web, 
      secteur, 
      mx_record_exists, 
      email, 
      telephone, 
      linkedin, 
      interets, 
      historique, 
      etape_suivi 
    } = req.body;

    if (!nom_complet) {
      return res.status(400).json({ error: 'Le nom complet est requis' });
    }

    const result = await pool.query(
      `INSERT INTO prospects (
        nom_complet, entreprise, categorie_poste, poste_specifique, pays, 
        taille_entreprise, site_web, secteur, mx_record_exists, email, 
        telephone, linkedin, interets, historique, etape_suivi
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15) RETURNING *`,
      [
        nom_complet, entreprise, categorie_poste, poste_specifique, pays || 'Luxembourg',
        taille_entreprise, site_web, secteur, mx_record_exists || false, email,
        telephone, linkedin, interets, historique, etape_suivi || 'à contacter'
      ]
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
    const { 
      nom_complet, 
      entreprise, 
      categorie_poste, 
      poste_specifique, 
      pays, 
      taille_entreprise, 
      site_web, 
      secteur, 
      mx_record_exists, 
      email, 
      telephone, 
      linkedin, 
      interets, 
      historique, 
      etape_suivi 
    } = req.body;

    const result = await pool.query(
      `UPDATE prospects SET 
        nom_complet = $1, entreprise = $2, categorie_poste = $3, poste_specifique = $4, 
        pays = $5, taille_entreprise = $6, site_web = $7, secteur = $8, 
        mx_record_exists = $9, email = $10, telephone = $11, linkedin = $12, 
        interets = $13, historique = $14, etape_suivi = $15
      WHERE id = $16 RETURNING *`,
      [
        nom_complet, entreprise, categorie_poste, poste_specifique, pays,
        taille_entreprise, site_web, secteur, mx_record_exists, email,
        telephone, linkedin, interets, historique, etape_suivi, id
      ]
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


// POST - Corriger la base de données (endpoint temporaire)
app.post('/api/fix-database', async (req, res) => {
  try {
    // Récupérer les données actuelles
    const result = await pool.query('SELECT id, nom_complet, entreprise, etape_suivi FROM prospects');
    
    res.json({ 
      message: 'Base de données vérifiée avec succès',
      data: result.rows 
    });
  } catch (err) {
    console.error('Erreur lors de la vérification de la base de données:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
  console.log(`📊 API disponible sur http://localhost:${PORT}/api`);
});