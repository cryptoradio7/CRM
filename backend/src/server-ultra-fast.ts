import express from 'express';
import cors from 'cors';
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 3003;

// Configuration de la base de données
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'crm_db',
  password: process.env.DB_PASSWORD || 'password',
  port: parseInt(process.env.DB_PORT || '5432'),
});

// Middleware
app.use(cors());
app.use(express.json());

// Test de connexion à la base de données
pool.connect()
  .then(() => {
    console.log('✅ Connexion à PostgreSQL réussie');
  })
  .catch(err => {
    console.error('❌ Erreur de connexion à PostgreSQL:', err);
  });

// GET - Liste des contacts avec pagination ULTRA-RAPIDE
app.get('/api/contacts', async (req, res) => {
  try {
    const { page = '1', limit = '20', q } = req.query;
    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

    if (q) {
      // Recherche ULTRA-RAPIDE - seulement dans les entreprises actuelles
      const searchTerm = (q as string).trim();
      const normalizedSearchTerm = searchTerm
        .toLowerCase()
        .replace(/[éèêëàáâãäåíìîïóòôõöúùûüýÿçñßæœ]/g, 'e')
        .replace(/[ÉÈÊËÀÁÂÃÄÅÍÌÎÏÓÒÔÕÖÚÙÛÜÝŸÇÑßÆŒ]/g, 'E');
      
      const searchPattern = `%${normalizedSearchTerm}%`;
      const originalSearchPattern = `%${searchTerm.toLowerCase()}%`;
      const hasAccents = /[éèêëàáâãäåíìîïóòôõöúùûüýÿçñßæœÉÈÊËÀÁÂÃÄÅÍÌÎÏÓÒÔÕÖÚÙÛÜÝŸÇÑßÆŒ]/.test(searchTerm);

      const result = await pool.query(`
        SELECT 
          c.id,
          c.full_name,
          c.headline,
          c.location,
          c.country,
          c.current_company_name,
          c.current_company_industry,
          c.linkedin_url,
          c.profile_picture_url,
          c.lead_quality_score,
          c.connections_count,
          c.years_of_experience,
          c.created_at,
          c.updated_at,
          '[]'::json as experiences,
          '[]'::json as languages,
          '[]'::json as skills,
          '[]'::json as interests,
          '[]'::json as education
        FROM contacts c
        WHERE 
          c.current_company_name IS NOT NULL 
          AND c.current_company_name != ''
          AND (
            ${hasAccents ? 
              'LOWER(c.current_company_name) LIKE $1 OR LOWER(c.current_company_name) LIKE $2' : 
              'LOWER(c.current_company_name) LIKE $1'
            }
          )
        ORDER BY c.id DESC
        LIMIT 1000
      `, hasAccents ? [searchPattern, originalSearchPattern] : [searchPattern]);

      res.json({
        contacts: result.rows,
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total: result.rows.length,
          pages: 1
        }
      });
    } else {
      // Liste normale ULTRA-RAPIDE
      const result = await pool.query(`
        SELECT 
          c.id,
          c.full_name,
          c.headline,
          c.location,
          c.country,
          c.current_company_name,
          c.current_company_industry,
          c.linkedin_url,
          c.profile_picture_url,
          c.lead_quality_score,
          c.connections_count,
          c.years_of_experience,
          c.created_at,
          c.updated_at,
          '[]'::json as experiences,
          '[]'::json as languages,
          '[]'::json as skills,
          '[]'::json as interests,
          '[]'::json as education
        FROM contacts c
        ORDER BY c.id DESC
        LIMIT $1 OFFSET $2
      `, [parseInt(limit as string), offset]);

      // Compter le total
      const countResult = await pool.query('SELECT COUNT(*) as total FROM contacts');
      const totalCount = parseInt(countResult.rows[0].total);

      res.json({
        contacts: result.rows,
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total: totalCount,
          pages: Math.ceil(totalCount / parseInt(limit as string))
        }
      });
    }
  } catch (error) {
    console.error('Erreur lors de la récupération des contacts:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET - Détail d'un contact ULTRA-RAPIDE
app.get('/api/contacts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(`
      SELECT 
        c.id,
        c.full_name,
        c.headline,
        c.location,
        c.country,
        c.current_company_name,
        c.current_company_industry,
        c.linkedin_url,
        c.profile_picture_url,
        c.lead_quality_score,
        c.connections_count,
        c.years_of_experience,
        c.created_at,
        c.updated_at,
        '[]'::json as experiences,
        '[]'::json as languages,
        '[]'::json as skills,
        '[]'::json as interests,
        '[]'::json as education
      FROM contacts c
      WHERE c.id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Contact non trouvé' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erreur lors de la récupération du contact:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET - Liste des entreprises ULTRA-RAPIDE
app.get('/api/companies', async (req, res) => {
  try {
    const { page = '1', limit = '20', q } = req.query;
    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

    if (q) {
      // Recherche d'entreprises
      const searchTerm = (q as string).trim();
      const result = await pool.query(`
        SELECT DISTINCT
          c.company_name,
          COUNT(*) as employee_count
        FROM contacts c
        WHERE c.current_company_name ILIKE $1
        GROUP BY c.company_name
        ORDER BY employee_count DESC
        LIMIT 100
      `, [`%${searchTerm}%`]);

      res.json({
        companies: result.rows,
        pagination: {
          page: 1,
          limit: 100,
          total: result.rows.length,
          pages: 1
        }
      });
    } else {
      // Liste normale
      const result = await pool.query(`
        SELECT DISTINCT
          c.current_company_name as company_name,
          COUNT(*) as employee_count
        FROM contacts c
        WHERE c.current_company_name IS NOT NULL 
        AND c.current_company_name != ''
        GROUP BY c.current_company_name
        ORDER BY employee_count DESC
        LIMIT $1 OFFSET $2
      `, [parseInt(limit as string), offset]);

      // Compter le total
      const countResult = await pool.query(`
        SELECT COUNT(DISTINCT c.current_company_name) as total 
        FROM contacts c 
        WHERE c.current_company_name IS NOT NULL 
        AND c.current_company_name != ''
      `);
      const totalCount = parseInt(countResult.rows[0].total);

      res.json({
        companies: result.rows,
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total: totalCount,
          pages: Math.ceil(totalCount / parseInt(limit as string))
        }
      });
    }
  } catch (error) {
    console.error('Erreur lors de la récupération des entreprises:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET - Détail d'une entreprise ULTRA-RAPIDE
app.get('/api/companies/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Recherche par nom d'entreprise
    const result = await pool.query(`
      SELECT 
        c.current_company_name as company_name,
        COUNT(*) as employee_count,
        c.current_company_industry as industry
      FROM contacts c
      WHERE c.current_company_name ILIKE $1
      GROUP BY c.current_company_name, c.current_company_industry
      LIMIT 1
    `, [`%${id}%`]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Entreprise non trouvée' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'entreprise:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Démarrage du serveur
app.listen(port, () => {
  console.log(`🚀 Serveur ULTRA-RAPIDE démarré sur le port ${port}`);
  console.log('📊 API optimisée pour les performances maximales');
  console.log('🔗 Endpoints disponibles:');
  console.log('   - GET /api/contacts (avec pagination ultra-rapide)');
  console.log('   - GET /api/contacts/:id (fiche contact simplifiée)');
  console.log('   - GET /api/companies (avec pagination ultra-rapide)');
  console.log('   - GET /api/companies/:id (fiche entreprise simplifiée)');
});
