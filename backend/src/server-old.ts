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

// GET - Récupérer tous les prospects avec pagination
app.get('/api/prospects', async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;
    
    // Récupérer le nombre total de prospects
    const countResult = await pool.query('SELECT COUNT(*) FROM prospects');
    const totalCount = parseInt(countResult.rows[0].count);
    
    // Récupérer les prospects paginés
    const result = await pool.query(
      'SELECT * FROM prospects ORDER BY date_creation DESC LIMIT $1 OFFSET $2',
      [limit, offset]
    );
    
    res.json({
      prospects: result.rows,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasNextPage: page < Math.ceil(totalCount / limit),
        hasPrevPage: page > 1
      }
    });
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

// GET - Récupérer les prospects filtrés avec pagination
app.get('/api/prospects/filter', async (req, res) => {
  try {
    const { 
      categorie_poste, 
      taille_entreprise, 
      secteur, 
      pays, 
      etape_suivi,
      search,
      nom_complet,
      libelle_poste,
      entreprise,
      page = 1,
      limit = 20
    } = req.query;

    const pageNum = parseInt(page as string) || 1;
    const limitNum = parseInt(limit as string) || 20;
    const offset = (pageNum - 1) * limitNum;

    // Construire la requête SQL dynamiquement
    let whereConditions = [];
    let queryParams = [];
    let paramIndex = 1;

    // Filtre par catégorie de poste
    if (categorie_poste && categorie_poste !== '') {
      whereConditions.push(`categorie_poste = $${paramIndex}`);
      queryParams.push(categorie_poste);
      paramIndex++;
    }

    // Filtre par taille d'entreprise
    if (taille_entreprise && taille_entreprise !== '') {
      whereConditions.push(`taille_entreprise = $${paramIndex}`);
      queryParams.push(taille_entreprise);
      paramIndex++;
    }

    // Filtre par secteur
    if (secteur && secteur !== '') {
      whereConditions.push(`secteur = $${paramIndex}`);
      queryParams.push(secteur);
      paramIndex++;
    }

    // Filtre par pays
    if (pays && pays !== '') {
      whereConditions.push(`pays = $${paramIndex}`);
      queryParams.push(pays);
      paramIndex++;
    }

    // Filtre par étape de suivi
    if (etape_suivi && etape_suivi !== '') {
      whereConditions.push(`etape_suivi = $${paramIndex}`);
      queryParams.push(etape_suivi);
      paramIndex++;
    }

    // Filtre par nom complet spécifique
    if (nom_complet && nom_complet !== '') {
      whereConditions.push(`LOWER(nom_complet) LIKE LOWER($${paramIndex})`);
      queryParams.push(`%${nom_complet}%`);
      paramIndex++;
    }

    // Filtre par libellé de poste spécifique
    if (libelle_poste && libelle_poste !== '') {
      whereConditions.push(`LOWER(libelle_poste) LIKE LOWER($${paramIndex})`);
      queryParams.push(`%${libelle_poste}%`);
      paramIndex++;
    }

    // Filtre par entreprise spécifique
    if (entreprise && entreprise !== '') {
      whereConditions.push(`LOWER(entreprise) LIKE LOWER($${paramIndex})`);
      queryParams.push(`%${entreprise}%`);
      paramIndex++;
    }

    // Filtre par recherche textuelle globale (fallback)
    if (search && search !== '') {
      whereConditions.push(`(
        LOWER(nom_complet) LIKE LOWER($${paramIndex}) OR 
        LOWER(entreprise) LIKE LOWER($${paramIndex}) OR 
        LOWER(email) LIKE LOWER($${paramIndex})
      )`);
      queryParams.push(`%${search}%`);
      paramIndex++;
    }

    // Construire la clause WHERE
    let whereClause = '';
    if (whereConditions.length > 0) {
      whereClause = ' WHERE ' + whereConditions.join(' AND ');
    }

    // Compter le total des résultats
    const countQuery = `SELECT COUNT(*) FROM prospects${whereClause}`;
    const countResult = await pool.query(countQuery, queryParams);
    const totalCount = parseInt(countResult.rows[0].count);

    // Récupérer les résultats paginés
    const dataQuery = `SELECT * FROM prospects${whereClause} ORDER BY date_creation DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    const dataParams = [...queryParams, limitNum, offset];
    const result = await pool.query(dataQuery, dataParams);
    
    res.json({
      prospects: result.rows,
      pagination: {
        page: pageNum,
        limit: limitNum,
        totalCount,
        totalPages: Math.ceil(totalCount / limitNum),
        hasNextPage: pageNum < Math.ceil(totalCount / limitNum),
        hasPrevPage: pageNum > 1
      },
      filters: {
        categorie_poste,
        taille_entreprise,
        secteur,
        pays,
        etape_suivi,
        search
      }
    });
  } catch (err) {
    console.error('Erreur lors du filtrage des prospects:', err);
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
    if (req.body && req.body.content) {
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

// =====================================================
// NOUVELLES APIs - CONTACTS LEMLIST
// =====================================================

// GET - Récupérer tous les contacts avec pagination
app.get('/api/contacts', async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;
    
    // Récupérer le nombre total de contacts
    const countResult = await pool.query('SELECT COUNT(*) FROM contacts');
    const totalCount = parseInt(countResult.rows[0].count);
    
    // Récupérer les contacts paginés avec leurs expériences
    const result = await pool.query(`
      SELECT c.*, 
             COUNT(e.id) as experience_count,
             STRING_AGG(DISTINCT comp.company_name, ', ') as companies
      FROM contacts c
      LEFT JOIN experiences e ON c.id = e.contact_id
      LEFT JOIN companies comp ON e.company_id = comp.id
      GROUP BY c.id
      ORDER BY c.full_name ASC 
      LIMIT $1 OFFSET $2
    `, [limit, offset]);
    
    res.json({
      contacts: result.rows,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasNextPage: page < Math.ceil(totalCount / limit),
        hasPrevPage: page > 1
      }
    });
  } catch (err) {
    console.error('Erreur lors du chargement des contacts:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET - Récupérer un contact par ID avec toutes ses données
app.get('/api/contacts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Récupérer le contact principal
    const contactResult = await pool.query('SELECT * FROM contacts WHERE id = $1', [id]);
    
    if (contactResult.rows.length === 0) {
      return res.status(404).json({ error: 'Contact non trouvé' });
    }
    
    const contact = contactResult.rows[0];
    
    // Récupérer les expériences avec toutes les données des entreprises
    const experiencesResult = await pool.query(`
      SELECT e.*, 
             comp.company_name, comp.company_industry, comp.company_size,
             comp.company_description, comp.company_subindustry,
             comp.company_website_url, comp.headquarters_city,
             comp.headquarters_country, comp.employee_count,
             comp.revenue_bucket, comp.company_type
      FROM experiences e
      LEFT JOIN companies comp ON e.company_id = comp.id
      WHERE e.contact_id = $1
      ORDER BY e.order_in_profile ASC
    `, [id]);
    
    // Récupérer les langues
    const languagesResult = await pool.query(`
      SELECT * FROM contact_languages 
      WHERE contact_id = $1 
      ORDER BY order_in_profile ASC
    `, [id]);
    
    // Récupérer les compétences
    const skillsResult = await pool.query(`
      SELECT * FROM contact_skills 
      WHERE contact_id = $1 
      ORDER BY order_in_profile ASC
    `, [id]);
    
    // Récupérer les intérêts
    const interestsResult = await pool.query(`
      SELECT * FROM contact_interests 
      WHERE contact_id = $1 
      ORDER BY order_in_profile ASC
    `, [id]);
    
    res.json({
      ...contact,
      experiences: experiencesResult.rows,
      languages: languagesResult.rows,
      skills: skillsResult.rows,
      interests: interestsResult.rows
    });
  } catch (err) {
    console.error('Erreur lors de la récupération du contact:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET - Rechercher des contacts
app.get('/api/contacts/search', async (req, res) => {
  try {
    const { q, page = 1, limit = 20 } = req.query;
    const pageNum = parseInt(page as string) || 1;
    const limitNum = parseInt(limit as string) || 20;
    const offset = (pageNum - 1) * limitNum;
    
    if (!q || q.toString().trim() === '') {
      return res.status(400).json({ error: 'Paramètre de recherche requis' });
    }
    
    const searchTerm = `%${q.toString().toLowerCase()}%`;
    
    // Compter les résultats
    const countResult = await pool.query(`
      SELECT COUNT(*) FROM contacts 
      WHERE LOWER(full_name) LIKE $1 
         OR LOWER(headline) LIKE $1 
         OR LOWER(location) LIKE $1
    `, [searchTerm]);
    
    const totalCount = parseInt(countResult.rows[0].count);
    
    // Récupérer les résultats
    const result = await pool.query(`
      SELECT c.*, 
             COUNT(e.id) as experience_count,
             STRING_AGG(DISTINCT comp.company_name, ', ') as companies
      FROM contacts c
      LEFT JOIN experiences e ON c.id = e.contact_id
      LEFT JOIN companies comp ON e.company_id = comp.id
      WHERE LOWER(c.full_name) LIKE $1 
         OR LOWER(c.headline) LIKE $1 
         OR LOWER(c.location) LIKE $1
      GROUP BY c.id
      ORDER BY c.full_name ASC 
      LIMIT $2 OFFSET $3
    `, [searchTerm, limitNum, offset]);
    
    res.json({
      contacts: result.rows,
      pagination: {
        page: pageNum,
        limit: limitNum,
        totalCount,
        totalPages: Math.ceil(totalCount / limitNum),
        hasNextPage: pageNum < Math.ceil(totalCount / limitNum),
        hasPrevPage: pageNum > 1
      },
      searchTerm: q
    });
  } catch (err) {
    console.error('Erreur lors de la recherche de contacts:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// =====================================================
// APIs - ENTREPRISES
// =====================================================

// GET - Récupérer toutes les entreprises avec pagination
app.get('/api/companies', async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;
    
    // Récupérer le nombre total d'entreprises
    const countResult = await pool.query('SELECT COUNT(*) FROM companies');
    const totalCount = parseInt(countResult.rows[0].count);
    
    // Récupérer les entreprises paginées avec le nombre de contacts
    const result = await pool.query(`
      SELECT c.*, 
             COUNT(DISTINCT e.contact_id) as contact_count
      FROM companies c
      LEFT JOIN experiences e ON c.id = e.company_id
      GROUP BY c.id
      ORDER BY c.company_name ASC 
      LIMIT $1 OFFSET $2
    `, [limit, offset]);
    
    res.json({
      companies: result.rows,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasNextPage: page < Math.ceil(totalCount / limit),
        hasPrevPage: page > 1
      }
    });
  } catch (err) {
    console.error('Erreur lors du chargement des entreprises:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET - Récupérer une entreprise par ID avec ses contacts
app.get('/api/companies/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Récupérer l'entreprise principale
    const companyResult = await pool.query('SELECT * FROM companies WHERE id = $1', [id]);
    
    if (companyResult.rows.length === 0) {
      return res.status(404).json({ error: 'Entreprise non trouvée' });
    }
    
    const company = companyResult.rows[0];
    
    // Récupérer les contacts associés
    const contactsResult = await pool.query(`
      SELECT DISTINCT c.id, c.full_name, c.headline, c.current_title_normalized, 
             c.department, c.linkedin_url, e.title, e.is_current
      FROM contacts c
      JOIN experiences e ON c.id = e.contact_id
      WHERE e.company_id = $1
      ORDER BY e.is_current DESC, c.full_name ASC
    `, [id]);
    
    res.json({
      ...company,
      contacts: contactsResult.rows
    });
  } catch (err) {
    console.error('Erreur lors de la récupération de l\'entreprise:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET - Rechercher des entreprises
app.get('/api/companies/search', async (req, res) => {
  try {
    const { q, page = 1, limit = 20 } = req.query;
    const pageNum = parseInt(page as string) || 1;
    const limitNum = parseInt(limit as string) || 20;
    const offset = (pageNum - 1) * limitNum;
    
    if (!q || q.toString().trim() === '') {
      return res.status(400).json({ error: 'Paramètre de recherche requis' });
    }
    
    const searchTerm = `%${q.toString().toLowerCase()}%`;
    
    // Compter les résultats
    const countResult = await pool.query(`
      SELECT COUNT(*) FROM companies 
      WHERE LOWER(company_name) LIKE $1 
         OR LOWER(company_industry) LIKE $1 
         OR LOWER(headquarters_city) LIKE $1
    `, [searchTerm]);
    
    const totalCount = parseInt(countResult.rows[0].count);
    
    // Récupérer les résultats
    const result = await pool.query(`
      SELECT c.*, 
             COUNT(DISTINCT e.contact_id) as contact_count
      FROM companies c
      LEFT JOIN experiences e ON c.id = e.company_id
      WHERE LOWER(c.company_name) LIKE $1 
         OR LOWER(c.company_industry) LIKE $1 
         OR LOWER(c.headquarters_city) LIKE $1
      GROUP BY c.id
      ORDER BY c.company_name ASC 
      LIMIT $2 OFFSET $3
    `, [searchTerm, limitNum, offset]);
    
    res.json({
      companies: result.rows,
      pagination: {
        page: pageNum,
        limit: limitNum,
        totalCount,
        totalPages: Math.ceil(totalCount / limitNum),
        hasNextPage: pageNum < Math.ceil(totalCount / limitNum),
        hasPrevPage: pageNum > 1
      },
      searchTerm: q
    });
  } catch (err) {
    console.error('Erreur lors de la recherche d\'entreprises:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// =====================================================
// APIs - NOTES DE CONTACTS
// =====================================================

// GET - Récupérer les notes d'un contact
app.get('/api/contacts/:id/notes', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(`
      SELECT * FROM contact_notes 
      WHERE contact_id = $1 
      ORDER BY id DESC
    `, [id]);
    
    res.json({ notes: result.rows });
  } catch (err) {
    console.error('Erreur lors du chargement des notes:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// POST - Créer une nouvelle note
app.post('/api/contacts/:id/notes', async (req, res) => {
  try {
    const { id } = req.params;
    const { note_content, note_type = 'general' } = req.body;
    
    if (!note_content || note_content.trim() === '') {
      return res.status(400).json({ error: 'Le contenu de la note est requis' });
    }
    
    const result = await pool.query(`
      INSERT INTO contact_notes (contact_id, note_content, note_type)
      VALUES ($1, $2, $3)
      RETURNING *
    `, [id, note_content.trim(), note_type]);
    
    res.status(201).json({ note: result.rows[0] });
  } catch (err) {
    console.error('Erreur lors de la création de la note:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// PUT - Modifier une note
app.put('/api/notes/:noteId', async (req, res) => {
  try {
    const { noteId } = req.params;
    const { note_content, note_type } = req.body;
    
    if (!note_content || note_content.trim() === '') {
      return res.status(400).json({ error: 'Le contenu de la note est requis' });
    }
    
    const result = await pool.query(`
      UPDATE contact_notes 
      SET note_content = $1, note_type = $2
      WHERE id = $3
      RETURNING *
    `, [note_content.trim(), note_type, noteId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Note non trouvée' });
    }
    
    res.json({ note: result.rows[0] });
  } catch (err) {
    console.error('Erreur lors de la modification de la note:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// DELETE - Supprimer une note
app.delete('/api/notes/:noteId', async (req, res) => {
  try {
    const { noteId } = req.params;
    
    const result = await pool.query(`
      DELETE FROM contact_notes 
      WHERE id = $1
      RETURNING *
    `, [noteId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Note non trouvée' });
    }
    
    res.json({ message: 'Note supprimée avec succès' });
  } catch (err) {
    console.error('Erreur lors de la suppression de la note:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// =====================================================
// APIs - ÉTAPES DE SUIVI
// =====================================================

// GET - Récupérer toutes les étapes de suivi
app.get('/api/follow-up-stages', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT * FROM follow_up_stages 
      ORDER BY stage_order ASC
    `);
    
    res.json({ stages: result.rows });
  } catch (err) {
    console.error('Erreur lors du chargement des étapes:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// POST - Créer une nouvelle étape
app.post('/api/follow-up-stages', async (req, res) => {
  try {
    const { stage_name, stage_order, color = '#4CAF50', description } = req.body;
    
    if (!stage_name || stage_name.trim() === '') {
      return res.status(400).json({ error: 'Le nom de l\'étape est requis' });
    }
    
    const result = await pool.query(`
      INSERT INTO follow_up_stages (stage_name, stage_order, color, description)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [stage_name.trim(), stage_order, color, description]);
    
    res.status(201).json({ stage: result.rows[0] });
  } catch (err) {
    console.error('Erreur lors de la création de l\'étape:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// PUT - Modifier une étape
app.put('/api/follow-up-stages/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { stage_name, stage_order, color, description } = req.body;
    
    if (!stage_name || stage_name.trim() === '') {
      return res.status(400).json({ error: 'Le nom de l\'étape est requis' });
    }
    
    const result = await pool.query(`
      UPDATE follow_up_stages 
      SET stage_name = $1, stage_order = $2, color = $3, description = $4
      WHERE id = $5
      RETURNING *
    `, [stage_name.trim(), stage_order, color, description, id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Étape non trouvée' });
    }
    
    res.json({ stage: result.rows[0] });
  } catch (err) {
    console.error('Erreur lors de la modification de l\'étape:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// DELETE - Supprimer une étape
app.delete('/api/follow-up-stages/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(`
      DELETE FROM follow_up_stages 
      WHERE id = $1
      RETURNING *
    `, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Étape non trouvée' });
    }
    
    res.json({ message: 'Étape supprimée avec succès' });
  } catch (err) {
    console.error('Erreur lors de la suppression de l\'étape:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
  console.log(`📊 API disponible sur http://localhost:${PORT}/api`);
}); 