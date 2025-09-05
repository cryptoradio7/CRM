import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Pool } from 'pg';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3003;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


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
        taille_entreprise, site_web, secteur, email, 
        telephone, linkedin, interets, historique, etape_suivi
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15) RETURNING *`,
      [
        nom_complet, entreprise, categorie_poste, poste_specifique, pays || 'Luxembourg',
        taille_entreprise, site_web, secteur, email,
        telephone, linkedin, interets, historique, etape_suivi || 'à contacter'
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Erreur lors de la création du prospect:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// POST - Import en lot de prospects
app.post('/api/prospects/bulk', async (req, res) => {
  try {
    const prospects = req.body;
    
    if (!Array.isArray(prospects) || prospects.length === 0) {
      return res.status(400).json({ error: 'Un tableau de prospects est requis' });
    }

    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      const results = [];
      
      for (const prospect of prospects) {
        const { 
          nom_complet, 
          entreprise, 
          categorie_poste, 
          poste_specifique, 
          pays, 
          taille_entreprise, 
          site_web, 
          secteur, 
          email
        } = prospect;

        if (!nom_complet) {
          console.warn('Prospect ignoré - nom complet manquant:', prospect);
          continue;
        }

        const result = await client.query(
          `INSERT INTO prospects (
            nom_complet, entreprise, categorie_poste, poste_specifique, pays, 
            taille_entreprise, site_web, secteur, email, 
            telephone, linkedin, interets, historique, etape_suivi
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) RETURNING *`,
          [
            nom_complet, 
            entreprise, 
            categorie_poste, 
            poste_specifique, 
            pays || 'Luxembourg',
            taille_entreprise, 
            site_web, 
            secteur, 
            email, // Tous les emails concaténés avec ';'
            null, // telephone - pas importé
            null, // linkedin - pas importé
            null, // interets - pas importé
            null, // historique - pas importé
            'à contacter' // etape_suivi - valeur par défaut
          ]
        );
        
        results.push(result.rows[0]);
      }
      
      await client.query('COMMIT');
      res.status(201).json({ 
        message: `${results.length} prospects importés avec succès`,
        count: results.length,
        prospects: results
      });
      
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
    
  } catch (err) {
    console.error('Erreur lors de l\'import en lot:', err);
    res.status(500).json({ error: 'Erreur serveur lors de l\'import' });
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
        email = $9, telephone = $10, linkedin = $11, 
        interets = $12, historique = $13, etape_suivi = $14
      WHERE id = $15 RETURNING *`,
      [
        nom_complet, entreprise, categorie_poste, poste_specifique, pays,
        taille_entreprise, site_web, secteur, email,
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

// Endpoint pour récupérer les notes
app.get('/api/notes', async (req, res) => {
  try {
    const result = await pool.query('SELECT content FROM notes ORDER BY updated_at DESC LIMIT 1');
    if (result.rows.length > 0) {
      res.json({ content: result.rows[0].content });
    } else {
      res.json({ content: '' });
    }
  } catch (error) {
    console.error('Erreur lors de la récupération des notes:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Endpoint pour sauvegarder les notes
app.post('/api/notes', async (req, res) => {
  try {
    // Gérer les deux formats : JSON et FormData
    let content;
    if (req.body.content) {
      // Format JSON
      content = req.body.content;
    } else if (req.body && typeof req.body === 'object') {
      // Format FormData
      content = Object.values(req.body)[0] as string;
    } else {
      console.error('❌ Format de données non reconnu:', req.body);
      return res.status(400).json({ error: 'Format de données invalide' });
    }
    
    if (!content) {
      console.error('❌ Contenu vide reçu');
      return res.status(400).json({ error: 'Contenu vide' });
    }
    
    // Vérifier s'il existe déjà une note
    const existingNote = await pool.query('SELECT id FROM notes ORDER BY updated_at DESC LIMIT 1');
    
    if (existingNote.rows.length > 0) {
      // Mettre à jour la note existante
      await pool.query('UPDATE notes SET content = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', 
        [content, existingNote.rows[0].id]);
    } else {
      // Créer une nouvelle note
      await pool.query('INSERT INTO notes (content) VALUES ($1)', [content]);
    }
    
    console.log('✅ Notes sauvegardées en base de données:', content.substring(0, 50) + '...');
    res.json({ success: true });
  } catch (error) {
    console.error('❌ Erreur lors de la sauvegarde des notes:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
  console.log(`📊 API disponible sur http://localhost:${PORT}/api`);
}); 