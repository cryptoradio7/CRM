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
        c.*,
        COUNT(e.id) as employee_count
      FROM companies c
      LEFT JOIN experiences e ON c.id = e.company_id
      WHERE 
        c.company_name ILIKE $1 OR 
        c.company_industry ILIKE $1 OR 
        c.company_description ILIKE $1 OR
        c.headquarters_city ILIKE $1 OR
        c.headquarters_country ILIKE $1
      GROUP BY c.id
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
    const { filePath } = req.body;
    
    if (!filePath) {
      return res.status(400).json({ error: 'Chemin du fichier JSON requis' });
    }

    // Vérifier que le fichier existe
    const fs = require('fs');
    const path = require('path');
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Fichier JSON non trouvé' });
    }

    // Lire et parser le fichier JSON
    const jsonData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    if (!Array.isArray(jsonData)) {
      return res.status(400).json({ error: 'Le fichier JSON doit contenir un tableau de contacts' });
    }

    let importedCount = 0;
    let errorCount = 0;
    const errors = [];

    // Fonction pour extraire les données d'un contact (copiée du script d'import)
    const extractContactData = (contact: any) => {
      return {
        lead_id: contact.lead_id,
        full_name: contact.full_name || '',
        headline: contact.headline || '',
        summary: contact.summary || '',
        location: contact.location || '',
        country: contact.country || '',
        connections_count: contact.connections_count || 0,
        lead_quality_score: contact.lead_quality_score || 0,
        linkedin_url: contact.lead_linkedin_url || '',
        years_of_experience: contact.years_of_exp_bucket ? 
          parseInt(contact.years_of_exp_bucket.replace(/\D/g, '')) || 0 : 0,
        department: contact.department || '',
        current_title_normalized: contact.experiences && contact.experiences.length > 0 ? 
          contact.experiences[0].title || '' : '',
        current_company_name: contact.current_exp_company_name || '',
        current_company_industry: contact.current_exp_company_industry || '',
        current_company_subindustry: contact.current_exp_company_subindustry || '',
        profile_picture_url: contact.lead_logo_url || '',
        telephone: contact.telephone || '',
        email: contact.email || '',
        interests: contact.interests ? contact.interests.join(', ') : '',
        historic: contact.historic || '',
        follow_up: contact.follow_up || '',
        date_creation: contact.created_at || new Date().toISOString(),
        date_modification: contact.updated_at || new Date().toISOString()
      };
    };

    // Importer chaque contact
    for (const contact of jsonData) {
      try {
        const contactData = extractContactData(contact);
        
        // Vérifier si le contact existe déjà
        const existingContact = await pool.query(
          'SELECT id FROM contacts WHERE lead_id = $1',
          [contactData.lead_id]
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
              profile_picture_url = $15, telephone = $16, email = $17,
              interests = $18, historic = $19, follow_up = $20,
              date_modification = $21
            WHERE lead_id = $22
          `, [
            contactData.full_name, contactData.headline, contactData.summary,
            contactData.location, contactData.country, contactData.connections_count,
            contactData.lead_quality_score, contactData.linkedin_url,
            contactData.years_of_experience, contactData.department,
            contactData.current_title_normalized, contactData.current_company_name,
            contactData.current_company_industry, contactData.current_company_subindustry,
            contactData.profile_picture_url, contactData.telephone, contactData.email,
            contactData.interests, contactData.historic, contactData.follow_up,
            contactData.date_modification, contactData.lead_id
          ]);
        } else {
          // Créer un nouveau contact
          await pool.query(`
            INSERT INTO contacts (
              lead_id, full_name, headline, summary, location, country,
              connections_count, lead_quality_score, linkedin_url, years_of_experience,
              department, current_title_normalized, current_company_name,
              current_company_industry, current_company_subindustry, profile_picture_url,
              telephone, email, interests, historic, follow_up,
              date_creation, date_modification
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22)
          `, [
            contactData.lead_id, contactData.full_name, contactData.headline,
            contactData.summary, contactData.location, contactData.country,
            contactData.connections_count, contactData.lead_quality_score,
            contactData.linkedin_url, contactData.years_of_experience,
            contactData.department, contactData.current_title_normalized,
            contactData.current_company_name, contactData.current_company_industry,
            contactData.current_company_subindustry, contactData.profile_picture_url,
            contactData.telephone, contactData.email, contactData.interests,
            contactData.historic, contactData.follow_up, contactData.date_creation,
            contactData.date_modification
          ]);
        }
        
        importedCount++;
      } catch (error) {
        errorCount++;
        errors.push(`Contact ${contact.lead_id}: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
      }
    }

    res.json({
      success: true,
      message: `Import terminé: ${importedCount} contacts importés/mis à jour, ${errorCount} erreurs`,
      importedCount,
      errorCount,
      totalProcessed: jsonData.length,
      errors: errors.slice(0, 10) // Limiter à 10 erreurs pour la réponse
    });

  } catch (error) {
    console.error('Erreur lors de l\'import JSON:', error);
    res.status(500).json({ error: 'Erreur lors de l\'import JSON' });
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
  console.log(`   - GET /api/contacts/export (export CSV)`);
  console.log(`   - GET /api/companies/export (export CSV)`);
});
