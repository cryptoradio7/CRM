import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Pool } from 'pg';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3003;

app.use(cors());
app.use(express.json({ limit: '500mb' }));
app.use(express.urlencoded({ extended: true, limit: '500mb' }));

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
  res.json({ message: 'API CRM Backend - Fonctionnel avec toutes les données!' });
});

// =====================================================
// API CONTACTS - VERSION COMPLÈTE
// =====================================================

// GET - Récupérer tous les contacts avec pagination et toutes les données
app.get('/api/contacts', async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;
    
    // Récupérer le nombre total de contacts
    const countResult = await pool.query('SELECT COUNT(*) FROM contacts');
    const totalCount = parseInt(countResult.rows[0].count);
    
    // Récupérer les contacts paginés avec toutes les données
    const result = await pool.query(`
      SELECT 
        c.*,
        COALESCE(
          json_agg(
            DISTINCT jsonb_build_object(
              'id', e.id,
              'title', e.title,
              'title_normalized', e.title_normalized,
              'department', e.department,
              'date_from', e.date_from,
              'date_to', e.date_to,
              'duration', e.duration,
              'description', e.description,
              'location', e.location,
              'is_current', e.is_current,
              'order_in_profile', e.order_in_profile,
              'is_current', e.is_current,
              'job_category', e.job_category,
              'company_name', COALESCE(comp.company_name, e.company_name),
              'company_id', e.company_id,
              'company_industry', e.company_industry,
              'company_size', e.company_size,
              'company_website_url', e.company_website_url,
              'company_logo_url', e.company_logo_url,
              'company_linkedin_url', e.company_linkedin_url
            )
          ) FILTER (WHERE e.id IS NOT NULL), 
          '[]'::json
        ) as experiences,
        COALESCE(
          json_agg(
            DISTINCT jsonb_build_object(
              'id', l.id,
              'language', l.language,
              'proficiency', l.proficiency,
              'order_in_profile', l.order_in_profile
            )
          ) FILTER (WHERE l.id IS NOT NULL), 
          '[]'::json
        ) as languages,
        COALESCE(
          json_agg(
            DISTINCT jsonb_build_object(
              'id', s.id,
              'skill_name', s.skill_name,
              'order_in_profile', s.order_in_profile
            )
          ) FILTER (WHERE s.id IS NOT NULL), 
          '[]'::json
        ) as skills,
        COALESCE(
          json_agg(
            DISTINCT jsonb_build_object(
              'id', i.id,
              'interest_name', i.interest_name,
              'order_in_profile', i.order_in_profile
            )
          ) FILTER (WHERE i.id IS NOT NULL), 
          '[]'::json
        ) as interests,
        COALESCE(
          json_agg(
            DISTINCT jsonb_build_object(
              'id', edu.id,
              'institution', edu.institution,
              'degree', edu.degree,
              'field_of_study', edu.field_of_study,
              'start_date', edu.start_date,
              'end_date', edu.end_date,
              'order_in_profile', edu.order_in_profile
            )
          ) FILTER (WHERE edu.id IS NOT NULL), 
          '[]'::json
        ) as education
      FROM contacts c
      LEFT JOIN experiences e ON c.id = e.contact_id
      LEFT JOIN companies comp ON e.company_id = comp.id
      LEFT JOIN contact_languages l ON c.id = l.contact_id
      LEFT JOIN contact_skills s ON c.id = s.contact_id
      LEFT JOIN contact_interests i ON c.id = i.contact_id
      LEFT JOIN contact_education edu ON c.id = edu.contact_id
      GROUP BY c.id
      ORDER BY c.id DESC
      LIMIT $1 OFFSET $2
    `, [limit, offset]);
    
    res.json({
      contacts: result.rows,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des contacts:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET - Recherche de contacts
app.get('/api/contacts/search', async (req, res) => {
  try {
    const { q, page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);
    
    if (!q) {
      return res.status(400).json({ error: 'Paramètre de recherche manquant' });
    }

    const searchTerm = `%${q}%`;
    
    // Compter le total des résultats (recherche insensible aux accents)
    const countResult = await pool.query(`
      SELECT COUNT(DISTINCT c.id) as total
      FROM contacts c
      WHERE LOWER(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(c.full_name, 'é', 'e'), 'è', 'e'), 'ê', 'e'), 'ë', 'e'), 'à', 'a')) ILIKE LOWER(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE($1, 'é', 'e'), 'è', 'e'), 'ê', 'e'), 'ë', 'e'), 'à', 'a'))
         OR LOWER(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(c.headline, 'é', 'e'), 'è', 'e'), 'ê', 'e'), 'ë', 'e'), 'à', 'a')) ILIKE LOWER(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE($1, 'é', 'e'), 'è', 'e'), 'ê', 'e'), 'ë', 'e'), 'à', 'a'))
         OR LOWER(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(c.current_company_name, 'é', 'e'), 'è', 'e'), 'ê', 'e'), 'ë', 'e'), 'à', 'a')) ILIKE LOWER(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE($1, 'é', 'e'), 'è', 'e'), 'ê', 'e'), 'ë', 'e'), 'à', 'a'))
         OR LOWER(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(c.location, 'é', 'e'), 'è', 'e'), 'ê', 'e'), 'ë', 'e'), 'à', 'a')) ILIKE LOWER(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE($1, 'é', 'e'), 'è', 'e'), 'ê', 'e'), 'ë', 'e'), 'à', 'a'))
         OR LOWER(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(c.country, 'é', 'e'), 'è', 'e'), 'ê', 'e'), 'ë', 'e'), 'à', 'a')) ILIKE LOWER(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE($1, 'é', 'e'), 'è', 'e'), 'ê', 'e'), 'ë', 'e'), 'à', 'a'))
    `, [searchTerm]);
    
    const totalCount = parseInt(countResult.rows[0].total);
    
    // Récupérer les contacts avec toutes les données
    const result = await pool.query(`
      SELECT 
        c.*,
        COALESCE(
          json_agg(
            DISTINCT jsonb_build_object(
              'id', e.id,
              'title', e.title,
              'title_normalized', e.title_normalized,
              'department', e.department,
              'date_from', e.date_from,
              'date_to', e.date_to,
              'duration', e.duration,
              'description', e.description,
              'location', e.location,
              'is_current', e.is_current,
              'order_in_profile', e.order_in_profile,
              'is_current', e.is_current,
              'job_category', e.job_category,
              'company_name', COALESCE(comp.company_name, e.company_name),
              'company_id', e.company_id,
              'company_industry', e.company_industry,
              'company_size', e.company_size,
              'company_website_url', e.company_website_url,
              'company_linkedin_url', e.company_linkedin_url,
              'company_logo_url', e.company_logo_url,
              'company_employee_count', e.company_employee_count,
              'company_followers_count', e.company_followers_count,
              'company_headquarters_city', e.company_headquarters_city,
              'company_headquarters_country', e.company_headquarters_country,
              'company_description', e.company_description,
              'company_type', e.company_type,
              'revenue_bucket', e.revenue_bucket
            )
          ) FILTER (WHERE e.id IS NOT NULL), 
          '[]'::json
        ) as experiences,
        COALESCE(
          json_agg(
            DISTINCT jsonb_build_object(
              'id', l.id,
              'language', l.language,
              'proficiency', l.proficiency,
              'order_in_profile', l.order_in_profile
            )
          ) FILTER (WHERE l.id IS NOT NULL), 
          '[]'::json
        ) as languages,
        COALESCE(
          json_agg(
            DISTINCT jsonb_build_object(
              'id', s.id,
              'skill_name', s.skill_name,
              'order_in_profile', s.order_in_profile
            )
          ) FILTER (WHERE s.id IS NOT NULL), 
          '[]'::json
        ) as skills,
        COALESCE(
          json_agg(
            DISTINCT jsonb_build_object(
              'id', i.id,
              'interest_name', i.interest_name,
              'order_in_profile', i.order_in_profile
            )
          ) FILTER (WHERE i.id IS NOT NULL), 
          '[]'::json
        ) as interests,
        COALESCE(
          json_agg(
            DISTINCT jsonb_build_object(
              'id', edu.id,
              'institution', edu.institution,
              'degree', edu.degree,
              'field_of_study', edu.field_of_study,
              'start_date', edu.start_date,
              'end_date', edu.end_date,
              'order_in_profile', edu.order_in_profile
            )
          ) FILTER (WHERE edu.id IS NOT NULL), 
          '[]'::json
        ) as education
      FROM contacts c
      LEFT JOIN experiences e ON c.id = e.contact_id
      LEFT JOIN companies comp ON e.company_id = comp.id
      LEFT JOIN contact_languages l ON c.id = l.contact_id
      LEFT JOIN contact_skills s ON c.id = s.contact_id
      LEFT JOIN contact_interests i ON c.id = i.contact_id
      LEFT JOIN contact_education edu ON c.id = edu.contact_id
      WHERE LOWER(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(c.full_name, 'é', 'e'), 'è', 'e'), 'ê', 'e'), 'ë', 'e'), 'à', 'a')) ILIKE LOWER(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE($1, 'é', 'e'), 'è', 'e'), 'ê', 'e'), 'ë', 'e'), 'à', 'a'))
         OR LOWER(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(c.headline, 'é', 'e'), 'è', 'e'), 'ê', 'e'), 'ë', 'e'), 'à', 'a')) ILIKE LOWER(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE($1, 'é', 'e'), 'è', 'e'), 'ê', 'e'), 'ë', 'e'), 'à', 'a'))
         OR LOWER(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(c.current_company_name, 'é', 'e'), 'è', 'e'), 'ê', 'e'), 'ë', 'e'), 'à', 'a')) ILIKE LOWER(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE($1, 'é', 'e'), 'è', 'e'), 'ê', 'e'), 'ë', 'e'), 'à', 'a'))
         OR LOWER(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(c.location, 'é', 'e'), 'è', 'e'), 'ê', 'e'), 'ë', 'e'), 'à', 'a')) ILIKE LOWER(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE($1, 'é', 'e'), 'è', 'e'), 'ê', 'e'), 'ë', 'e'), 'à', 'a'))
         OR LOWER(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(c.country, 'é', 'e'), 'è', 'e'), 'ê', 'e'), 'ë', 'e'), 'à', 'a')) ILIKE LOWER(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE($1, 'é', 'e'), 'è', 'e'), 'ê', 'e'), 'ë', 'e'), 'à', 'a'))
      GROUP BY c.id
      ORDER BY c.id DESC
      LIMIT $2 OFFSET $3
    `, [searchTerm, parseInt(limit as string), offset]);
    
    res.json({
      contacts: result.rows,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total: totalCount,
        pages: Math.ceil(totalCount / parseInt(limit as string))
      }
    });
  } catch (error) {
    console.error('Erreur lors de la recherche des contacts:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET - Récupérer un contact par ID avec toutes les données
app.get('/api/contacts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(`
      SELECT 
        c.*,
        COALESCE(
          json_agg(
            DISTINCT jsonb_build_object(
              'id', e.id,
              'title', e.title,
              'title_normalized', e.title_normalized,
              'department', e.department,
              'date_from', e.date_from,
              'date_to', e.date_to,
              'duration', e.duration,
              'description', e.description,
              'location', e.location,
              'is_current', e.is_current,
              'order_in_profile', e.order_in_profile,
              'is_current', e.is_current,
              'job_category', e.job_category,
              'company_name', COALESCE(comp.company_name, e.company_name),
              'company_id', e.company_id,
              'company_industry', e.company_industry,
              'company_size', e.company_size,
              'company_website_url', e.company_website_url,
              'company_logo_url', e.company_logo_url,
              'company_linkedin_url', e.company_linkedin_url,
              'company_description', e.company_description,
              'company_headquarters_city', e.company_headquarters_city,
              'company_headquarters_country', e.company_headquarters_country,
              'company_type', e.company_type,
              'revenue_bucket', e.revenue_bucket,
              'company_followers_count', e.company_followers_count,
              'company_employee_count', e.company_employee_count
            )
          ) FILTER (WHERE e.id IS NOT NULL), 
          '[]'::json
        ) as experiences,
        COALESCE(
          json_agg(
            DISTINCT jsonb_build_object(
              'id', l.id,
              'language', l.language,
              'proficiency', l.proficiency,
              'order_in_profile', l.order_in_profile
            )
          ) FILTER (WHERE l.id IS NOT NULL), 
          '[]'::json
        ) as languages,
        COALESCE(
          json_agg(
            DISTINCT jsonb_build_object(
              'id', s.id,
              'skill_name', s.skill_name,
              'order_in_profile', s.order_in_profile
            )
          ) FILTER (WHERE s.id IS NOT NULL), 
          '[]'::json
        ) as skills,
        COALESCE(
          json_agg(
            DISTINCT jsonb_build_object(
              'id', i.id,
              'interest_name', i.interest_name,
              'order_in_profile', i.order_in_profile
            )
          ) FILTER (WHERE i.id IS NOT NULL), 
          '[]'::json
        ) as interests,
        COALESCE(
          json_agg(
            DISTINCT jsonb_build_object(
              'id', edu.id,
              'institution', edu.institution,
              'degree', edu.degree,
              'field_of_study', edu.field_of_study,
              'start_date', edu.start_date,
              'end_date', edu.end_date,
              'order_in_profile', edu.order_in_profile
            )
          ) FILTER (WHERE edu.id IS NOT NULL), 
          '[]'::json
        ) as education
      FROM contacts c
      LEFT JOIN experiences e ON c.id = e.contact_id
      LEFT JOIN companies comp ON e.company_id = comp.id
      LEFT JOIN contact_languages l ON c.id = l.contact_id
      LEFT JOIN contact_skills s ON c.id = s.contact_id
      LEFT JOIN contact_interests i ON c.id = i.contact_id
      LEFT JOIN contact_education edu ON c.id = edu.contact_id
      WHERE c.id = $1
      GROUP BY c.id
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

// GET - Rechercher des contacts
app.get('/api/contacts/search', async (req, res) => {
  try {
    const { q, page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);
    
    if (!q) {
      return res.json({ contacts: [], pagination: { page: 1, limit: 20, total: 0, pages: 0 } });
    }
    
    const searchTerm = `%${q}%`;
    
    const result = await pool.query(`
      SELECT 
        c.*,
        COALESCE(
          json_agg(
            DISTINCT jsonb_build_object(
              'id', e.id,
              'title', e.title,
              'company_name', COALESCE(comp.company_name, e.company_name),
              'is_current', e.is_current
            )
          ) FILTER (WHERE e.id IS NOT NULL), 
          '[]'::json
        ) as experiences
      FROM contacts c
      LEFT JOIN experiences e ON c.id = e.contact_id
      WHERE 
        c.full_name ILIKE $1 OR 
        c.headline ILIKE $1 OR 
        c.location ILIKE $1 OR 
        c.country ILIKE $1 OR
        c.current_company_name ILIKE $1 OR
        c.current_company_industry ILIKE $1
      GROUP BY c.id
      ORDER BY c.created_at DESC
      LIMIT $2 OFFSET $3
    `, [searchTerm, limit, offset]);
    
    res.json({
      contacts: result.rows,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total: result.rows.length,
        pages: Math.ceil(result.rows.length / parseInt(limit as string))
      }
    });
  } catch (error) {
    console.error('Erreur lors de la recherche de contacts:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// =====================================================
// API COMPANIES - VERSION COMPLÈTE
// =====================================================

// GET - Récupérer toutes les entreprises avec pagination
app.get('/api/companies', async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;
    
    const countResult = await pool.query('SELECT COUNT(*) FROM companies');
    const totalCount = parseInt(countResult.rows[0].count);
    
    const result = await pool.query(`
      SELECT 
        c.*,
        COUNT(e.id) as employee_count
      FROM companies c
      LEFT JOIN experiences e ON c.id = e.company_id
      GROUP BY c.id
      ORDER BY c.created_at DESC
      LIMIT $1 OFFSET $2
    `, [limit, offset]);
    
    res.json({
      companies: result.rows,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des entreprises:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET - Rechercher des entreprises
app.get('/api/companies/search', async (req, res) => {
  try {
    const { q, page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);
    
    if (!q) {
      return res.json({ companies: [], pagination: { page: 1, limit: 20, total: 0, pages: 0 } });
    }
    
    const searchTerm = `%${q}%`;
    
    const result = await pool.query(`
      SELECT 
        c.*
      FROM companies c
      WHERE 
        c.company_name ILIKE $1 OR 
        c.company_industry ILIKE $1 OR 
        c.company_description ILIKE $1
      ORDER BY c.created_at DESC
      LIMIT $2 OFFSET $3
    `, [searchTerm, limit, offset]);
    
    res.json({
      companies: result.rows,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total: result.rows.length,
        pages: Math.ceil(result.rows.length / parseInt(limit as string))
      }
    });
  } catch (error) {
    console.error('Erreur lors de la recherche d\'entreprises:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET - Récupérer une entreprise par ID
app.get('/api/companies/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 20, current_only = false } = req.query;
    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);
    
    // Récupérer les infos de l'entreprise
    const companyResult = await pool.query(`
      SELECT * FROM companies WHERE id = $1
    `, [id]);
    
    if (companyResult.rows.length === 0) {
      return res.status(404).json({ error: 'Entreprise non trouvée' });
    }
    
    // Compter le total d'employés
    const countQuery = current_only === 'true' 
      ? `SELECT COUNT(DISTINCT e.id) as total FROM experiences e WHERE e.company_id = $1 AND e.is_current = true`
      : `SELECT COUNT(DISTINCT e.id) as total FROM experiences e WHERE e.company_id = $1`;
    
    const countResult = await pool.query(countQuery, [id]);
    const totalEmployees = parseInt(countResult.rows[0].total);
    
    // Récupérer les employés avec pagination
    const employeesQuery = current_only === 'true'
      ? `
        SELECT DISTINCT
          e.id,
          e.title,
          cont.full_name,
          e.is_current,
          e.date_from,
          e.date_to,
          e.location
        FROM experiences e
        JOIN contacts cont ON e.contact_id = cont.id
        WHERE e.company_id = $1 AND e.is_current = true
        ORDER BY e.date_from DESC
        LIMIT $2 OFFSET $3
      `
      : `
        SELECT DISTINCT
          e.id,
          e.title,
          cont.full_name,
          e.is_current,
          e.date_from,
          e.date_to,
          e.location
        FROM experiences e
        JOIN contacts cont ON e.contact_id = cont.id
        WHERE e.company_id = $1
        ORDER BY e.is_current DESC, e.date_from DESC
        LIMIT $2 OFFSET $3
      `;
    
    const employeesResult = await pool.query(employeesQuery, [id, parseInt(limit as string), offset]);
    
    res.json({
      ...companyResult.rows[0],
      employees: employeesResult.rows,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total: totalEmployees,
        pages: Math.ceil(totalEmployees / parseInt(limit as string))
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'entreprise:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET - Récupérer les employés d'une entreprise (endpoint séparé)
app.get('/api/companies/:id/employees', async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 50, current_only = false } = req.query;
    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);
    
    // Requête simple pour tester
    const employeesQuery = `
      SELECT 
        e.id,
        e.title,
        cont.full_name,
        cont.email,
        e.is_current,
        e.date_from,
        e.date_to,
        e.location
      FROM experiences e
      JOIN contacts cont ON e.contact_id = cont.id
      WHERE e.company_id = $1
      ORDER BY e.is_current DESC, e.date_from DESC
      LIMIT $2 OFFSET $3
    `;
    
    const employeesResult = await pool.query(employeesQuery, [id, parseInt(limit as string), offset]);
    
    // Compter le total
    const countResult = await pool.query(
      'SELECT COUNT(DISTINCT e.id) as total FROM experiences e WHERE e.company_id = $1', 
      [id]
    );
    const totalEmployees = parseInt(countResult.rows[0].total);
    
    res.json({
      employees: employeesResult.rows,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total: totalEmployees,
        pages: Math.ceil(totalEmployees / parseInt(limit as string))
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des employés:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});


// =====================================================
// API EXPORT
// =====================================================

// GET - Exporter tous les contacts en CSV
app.get('/api/contacts/export', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        full_name, headline, location, country, 
        connections_count, lead_quality_score, linkedin_url,
        years_of_experience, department, current_company_name,
        current_company_industry, experience_count, created_at
      FROM contacts
      ORDER BY created_at DESC
    `);
    
    // Convertir en CSV
    const csvHeader = 'Nom,Poste,Localisation,Pays,Connexions,Score,LinkedIn,Expérience,Département,Entreprise,Secteur,Expériences,Créé\n';
    const csvData = result.rows.map(row => 
      `"${row.full_name || ''}","${row.headline || ''}","${row.location || ''}","${row.country || ''}",${row.connections_count || 0},${row.lead_quality_score || 0},"${row.linkedin_url || ''}",${row.years_of_experience || 0},"${row.department || ''}","${row.current_company_name || ''}","${row.current_company_industry || ''}",${row.experience_count || 0},"${row.created_at || ''}"`
    ).join('\n');
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=contacts.csv');
    res.send(csvHeader + csvData);
  } catch (error) {
    console.error('Erreur lors de l\'export des contacts:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET - Exporter toutes les entreprises en CSV
app.get('/api/companies/export', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        company_name, company_industry, company_size, 
        headquarters_city, headquarters_country, employee_count,
        company_website_url, company_linkedin_url, created_at
      FROM companies
      ORDER BY created_at DESC
    `);
    
    // Convertir en CSV
    const csvHeader = 'Nom,Secteur,Taille,Ville,Pays,Employés,Site Web,LinkedIn,Créé\n';
    const csvData = result.rows.map(row => 
      `"${row.company_name || ''}","${row.company_industry || ''}","${row.company_size || ''}","${row.headquarters_city || ''}","${row.headquarters_country || ''}",${row.employee_count || 0},"${row.company_website_url || ''}","${row.company_linkedin_url || ''}","${row.created_at || ''}"`
    ).join('\n');
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=companies.csv');
    res.send(csvHeader + csvData);
  } catch (error) {
    console.error('Erreur lors de l\'export des entreprises:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// =====================================================
// API IMPORT JSON
// =====================================================

// POST - Importer des contacts depuis un fichier JSON
app.post('/api/contacts/import', async (req, res) => {
  try {
    const { filePath, jsonData } = req.body;
    
    let dataToImport;
    
    if (jsonData) {
      dataToImport = jsonData;
    } else if (filePath) {
      const fs = require('fs');
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: 'Fichier JSON non trouvé' });
      }
      dataToImport = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } else {
      return res.status(400).json({ error: 'Chemin du fichier JSON ou données JSON requises' });
    }
    
    if (!Array.isArray(dataToImport)) {
      return res.status(400).json({ error: 'Le fichier JSON doit contenir un tableau de contacts' });
    }

    let importedCount = 0;
    let companyCount = 0;
    let experienceCount = 0;
    let languageCount = 0;
    let skillCount = 0;
    let interestCount = 0;
    let educationCount = 0;
    let errorCount = 0;
    const errors = [];

    // Fonction pour créer un ID unique pour une entreprise
  const generateCompanyId = (companyName: string) => {
    // Générer un ID simple basé sur le nom et le timestamp
    const timestamp = Date.now();
    const nameHash = companyName.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    return Math.abs(nameHash + timestamp) % 1000000; // Limiter à 6 chiffres
  };

    console.log(`🚀 Début import de ${dataToImport.length} contacts`);

    // Importer chaque contact
    for (const contact of dataToImport) {
      try {
        console.log(`\n📋 Traitement contact: ${contact.full_name} (ID: ${contact.lead_id})`);
        console.log(`🔍 Contact data keys:`, Object.keys(contact));
        console.log(`🔍 Has experiences:`, !!contact.experiences);
        console.log(`🔍 Has languages:`, !!contact.languages);
        console.log(`🔍 Has skills:`, !!contact.skills);
        console.log(`🔍 Has interests:`, !!contact.interests);
        console.log(`🔍 Has education:`, !!contact.education);
        
        // 1. CRÉER/METTRE À JOUR LE CONTACT
        let contactId;
        const existingContact = await pool.query(
          'SELECT id FROM contacts WHERE lead_id = $1',
          [contact.lead_id]
        );

        if (existingContact.rows.length > 0) {
          // Mettre à jour le contact existant
          await pool.query(`
            UPDATE contacts SET
              full_name = $1, headline = $2, summary = $3, location = $4,
              country = $5, connections_count = $6, lead_quality_score = $7,
              linkedin_url = $8, years_of_experience = $9, department = $10,
              current_title_normalized = $11, current_company_name = $12,
              current_company_industry = $13, current_company_subindustry = $14,
              profile_picture_url = $15, connections_count_bucket = $16,
              updated_at = $17
            WHERE lead_id = $18
          `, [
            contact.full_name || '',
            contact.headline || '',
            contact.summary || '',
            contact.location || '',
            contact.country || '',
            contact.connections_count || 0,
            contact.lead_quality_score || 0,
            contact.lead_linkedin_url || '',
            contact.years_of_exp_bucket ? parseInt(contact.years_of_exp_bucket.replace(/\D/g, '')) || 0 : 0,
            contact.department || '',
            contact.experiences && contact.experiences.length > 0 ? contact.experiences[0].title || '' : '',
            contact.current_exp_company_name || '',
            contact.current_exp_company_industry || '',
            contact.current_exp_company_subindustry || '',
            contact.lead_logo_url || '',
            contact.connections_count_bucket || '',
            contact.updated_at || new Date().toISOString(),
            contact.lead_id
          ]);
          contactId = existingContact.rows[0].id;
          console.log(`✅ Contact mis à jour (ID: ${contactId})`);
        } else {
          // Créer un nouveau contact
          const result = await pool.query(`
            INSERT INTO contacts (
              lead_id, full_name, headline, summary, location, country,
              connections_count, lead_quality_score, linkedin_url, years_of_experience,
              department, current_title_normalized, current_company_name,
              current_company_industry, current_company_subindustry, profile_picture_url,
              connections_count_bucket, created_at, updated_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
            RETURNING id
          `, [
            contact.lead_id,
            contact.full_name || '',
            contact.headline || '',
            contact.summary || '',
            contact.location || '',
            contact.country || '',
            contact.connections_count || 0,
            contact.lead_quality_score || 0,
            contact.lead_linkedin_url || '',
            contact.years_of_exp_bucket ? parseInt(contact.years_of_exp_bucket.replace(/\D/g, '')) || 0 : 0,
            contact.department || '',
            contact.experiences && contact.experiences.length > 0 ? contact.experiences[0].title || '' : '',
            contact.current_exp_company_name || '',
            contact.current_exp_company_industry || '',
            contact.current_exp_company_subindustry || '',
            contact.lead_logo_url || '',
            contact.connections_count_bucket || '',
            contact.created_at || new Date().toISOString(),
            contact.updated_at || new Date().toISOString()
          ]);
          contactId = result.rows[0].id;
          console.log(`✅ Contact créé (ID: ${contactId})`);
        }

        // 2. SUPPRIMER LES DONNÉES DÉTAILLÉES EXISTANTES
        await pool.query('DELETE FROM experiences WHERE contact_id = $1', [contactId]);
        await pool.query('DELETE FROM contact_languages WHERE contact_id = $1', [contactId]);
        await pool.query('DELETE FROM contact_skills WHERE contact_id = $1', [contactId]);
        await pool.query('DELETE FROM contact_interests WHERE contact_id = $1', [contactId]);
        await pool.query('DELETE FROM contact_education WHERE contact_id = $1', [contactId]);

        // 3. IMPORTER LES EXPÉRIENCES ET ENTREPRISES
        if (contact.experiences && Array.isArray(contact.experiences)) {
          console.log(`  📈 ${contact.experiences.length} expériences à traiter`);
          for (const exp of contact.experiences) {
            console.log(`    🔍 Expérience: ${exp.company_name}`);
            // Vérifier si c'est une expérience complète avec données d'entreprise
            if (exp.company_description && exp.company_industry) {
              console.log(`    🏢 Création entreprise: ${exp.company_name}`);
              const companyId = generateCompanyId(exp.company_name);
              console.log(`    🏢 Company ID généré: ${companyId}`);
              await pool.query(`
                INSERT INTO companies (
                  company_id, company_name, company_description, company_industry,
                  company_subindustry, business_business_customer, company_employee_count,
                  employees_count_growth, company_headquarters_city, company_headquarters_country,
                  company_linkedin_url, company_logo_url, company_type, company_website_url,
                  company_url, company_size, revenue_bucket, company_domain,
                  created_at, updated_at
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)
                ON CONFLICT (company_id) DO NOTHING
              `, [
                companyId, 
                exp.company_name || '', 
                exp.company_description || '', 
                exp.company_industry || '',
                exp.company_subindustry || '', 
                exp.business_business_customer || '', 
                exp.company_employee_count || 0,
                exp.employees_count_growth || 0, 
                exp.company_headquarters_city || '', 
                exp.company_headquarters_country || '',
                exp.company_linkedin_url || '', 
                exp.company_logo_url || '', 
                exp.company_type || '', 
                exp.company_website_url || '',
                exp.company_url || '', 
                exp.company_size || '', 
                exp.revenue_bucket || '', 
                exp.company_domain || '',
                exp.created_at || new Date().toISOString(), 
                exp.updated_at || new Date().toISOString()
              ]);
              companyCount++;
              console.log(`    🏢 Entreprise créée: ${exp.company_name}`);
            }

            // Créer l'expérience
            // Convertir les dates au format PostgreSQL
            const formatDate = (dateStr: string) => {
              if (!dateStr) return null;
              // Si c'est juste une année, ajouter le 1er janvier
              if (/^\d{4}$/.test(dateStr)) {
                return `${dateStr}-01-01`;
              }
              // Si c'est déjà au bon format, le retourner
              if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
                return dateStr;
              }
              // Sinon, essayer de parser la date
              try {
                const date = new Date(dateStr);
                return date.toISOString().split('T')[0];
              } catch {
                return null;
              }
            };

            await pool.query(`
              INSERT INTO experiences (
                contact_id, company_name, title, date_from, date_to, description,
                duration, location, order_in_profile, created_at, updated_at
              ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            `, [
              contactId, 
              exp.company_name || '', 
              exp.title || '', 
              formatDate(exp.date_from),
              formatDate(exp.date_to), 
              exp.description || '', 
              exp.duration || '', 
              exp.location || '', 
              exp.order_in_profile || 0,
              exp.created_at || new Date().toISOString(), 
              exp.updated_at || new Date().toISOString()
            ]);
            experienceCount++;
          }
        }

        // 4. IMPORTER LES LANGUES
        if (contact.languages && Array.isArray(contact.languages)) {
          console.log(`  🌍 ${contact.languages.length} langues à traiter`);
          for (const lang of contact.languages) {
            await pool.query(`
              INSERT INTO contact_languages (
                contact_id, language, proficiency, order_in_profile, created_at, updated_at
              ) VALUES ($1, $2, $3, $4, $5, $6)
            `, [
              contactId, lang.language, lang.proficiency, lang.order_in_profile,
              lang.created_at || new Date().toISOString(), lang.updated_at || new Date().toISOString()
            ]);
            languageCount++;
          }
        }

        // 5. IMPORTER LES COMPÉTENCES
        if (contact.skills && Array.isArray(contact.skills)) {
          console.log(`  🛠️ ${contact.skills.length} compétences à traiter`);
          for (let i = 0; i < contact.skills.length; i++) {
            const skill = contact.skills[i];
            await pool.query(`
              INSERT INTO contact_skills (
                contact_id, skill_name, order_in_profile, created_at, updated_at
              ) VALUES ($1, $2, $3, $4, $5)
            `, [
              contactId, skill.name || skill, i + 1, new Date().toISOString(), new Date().toISOString()
            ]);
            skillCount++;
          }
        }

        // 6. IMPORTER LES INTÉRÊTS
        if (contact.interests && Array.isArray(contact.interests)) {
          console.log(`  ❤️ ${contact.interests.length} intérêts à traiter`);
          for (let i = 0; i < contact.interests.length; i++) {
            const interest = contact.interests[i];
            await pool.query(`
              INSERT INTO contact_interests (
                contact_id, interest_name, order_in_profile, created_at, updated_at
              ) VALUES ($1, $2, $3, $4, $5)
            `, [
              contactId, interest.name || interest, i + 1, new Date().toISOString(), new Date().toISOString()
            ]);
            interestCount++;
          }
        }

        // 7. IMPORTER LA FORMATION
        if (contact.education && Array.isArray(contact.education)) {
          console.log(`  🎓 ${contact.education.length} formations à traiter`);
          for (let i = 0; i < contact.education.length; i++) {
            const edu = contact.education[i];
            await pool.query(`
              INSERT INTO contact_education (
                contact_id, institution, degree, field_of_study, order_in_profile, created_at, updated_at
              ) VALUES ($1, $2, $3, $4, $5, $6, $7)
            `, [
              contactId, edu.school_name, edu.degree, edu.field_of_study, i + 1,
              edu.created_at || new Date().toISOString(), edu.updated_at || new Date().toISOString()
            ]);
            educationCount++;
          }
        }
        
        importedCount++;
        console.log(`✅ Contact ${contact.full_name} traité avec succès\n`);
      } catch (error) {
        errorCount++;
        const errorMsg = `Contact ${contact.lead_id}: ${error instanceof Error ? error.message : 'Erreur inconnue'}`;
        errors.push(errorMsg);
        console.error(`❌ Erreur: ${errorMsg}`);
      }
    }

    console.log(`\n🎉 Import terminé: ${importedCount} contacts, ${companyCount} entreprises, ${experienceCount} expériences, ${languageCount} langues, ${skillCount} compétences, ${interestCount} intérêts, ${educationCount} formations`);

    res.json({
      success: true,
      message: `Import terminé: ${importedCount} contacts, ${companyCount} entreprises, ${experienceCount} expériences, ${languageCount} langues, ${skillCount} compétences, ${interestCount} intérêts, ${educationCount} formations`,
      importedCount,
      companyCount,
      experienceCount,
      languageCount,
      skillCount,
      interestCount,
      educationCount,
      errorCount,
      totalProcessed: dataToImport.length,
      errors: errors.slice(0, 10)
    });

  } catch (error) {
    console.error('Erreur lors de l\'import JSON:', error);
    res.status(500).json({ error: 'Erreur lors de l\'import JSON' });
  }
});

// =====================================================
// API NOTES
// =====================================================

// GET - Récupérer les notes
app.get('/api/notes', async (req, res) => {
  try {
    // Pour l'instant, retourner des notes vides
    // TODO: Implémenter la récupération depuis la base de données
    res.json({ notes: '' });
  } catch (error) {
    console.error('Erreur lors de la récupération des notes:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// POST - Sauvegarder les notes
app.post('/api/notes', async (req, res) => {
  try {
    const { notes } = req.body || {};
    
    // Pour l'instant, juste confirmer la réception
    // TODO: Implémenter la sauvegarde en base de données
    console.log('Notes reçues:', notes);
    
    res.json({ success: true, message: 'Notes sauvegardées' });
  } catch (error) {
    console.error('Erreur lors de la sauvegarde des notes:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// =====================================================
// DÉMARRAGE DU SERVEUR
// =====================================================

app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur le port ${PORT}`);
  console.log(`📊 API complète avec toutes les données Lemlist`);
  console.log(`🔗 Endpoints disponibles:`);
  console.log(`   - GET /api/contacts (avec pagination et toutes les données)`);
  console.log(`   - GET /api/contacts/:id (fiche contact complète)`);
  console.log(`   - GET /api/contacts/search (recherche avancée)`);
  console.log(`   - POST /api/contacts/import (import JSON)`);
  console.log(`   - GET /api/companies (avec pagination)`);
  console.log(`   - GET /api/companies/:id (fiche entreprise complète)`);
  console.log(`   - GET /api/companies/search (recherche avancée)`);
  console.log(`   - GET /api/notes (récupérer les notes)`);
  console.log(`   - POST /api/notes (sauvegarder les notes)`);
  console.log(`   - GET /api/contacts/export (export CSV)`);
  console.log(`   - GET /api/companies/export (export CSV)`);
});
