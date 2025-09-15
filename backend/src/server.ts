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
    const { 
      page = '1', 
      limit = '20', 
      q, // recherche textuelle rapide (full_name)
      title, // titre/poste (current_title_normalized)
      country, // pays (country)
      years_exp, // années d'expérience (years_of_experience)
      company_name, // recherche d'entreprise (current_company_name)
      industry, // secteur d'activité (current_company_industry)
      subindustry // sous secteur (current_company_subindustry)
    } = req.query;
    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

    // Construction de la clause WHERE dynamique
    let whereConditions = [];
    let queryParams = [];
    let paramIndex = 1;

    // Recherche textuelle rapide (full_name)
    if (q && typeof q === 'string' && q.trim()) {
      const searchTerm = q.trim();
      const normalizedSearchTerm = searchTerm
        .toLowerCase()
        .replace(/[éèêëàáâãäåíìîïóòôõöúùûüýÿçñßæœ]/g, 'e')
        .replace(/[ÉÈÊËÀÁÂÃÄÅÍÌÎÏÓÒÔÕÖÚÙÛÜÝŸÇÑßÆŒ]/g, 'E');
      
      const searchPattern = `%${normalizedSearchTerm}%`;
      const originalSearchPattern = `%${searchTerm.toLowerCase()}%`;
      const hasAccents = /[éèêëàáâãäåíìîïóòôõöúùûüýÿçñßæœÉÈÊËÀÁÂÃÄÅÍÌÎÏÓÒÔÕÖÚÙÛÜÝŸÇÑßÆŒ]/.test(searchTerm);

      if (hasAccents) {
        whereConditions.push(`(LOWER(c.full_name) LIKE $${paramIndex} OR LOWER(c.full_name) LIKE $${paramIndex + 1} OR LOWER(c.current_company_name) LIKE $${paramIndex} OR LOWER(c.current_company_name) LIKE $${paramIndex + 1})`);
        queryParams.push(searchPattern, originalSearchPattern);
        paramIndex += 2;
      } else {
        whereConditions.push(`(LOWER(c.full_name) LIKE $${paramIndex} OR LOWER(c.current_company_name) LIKE $${paramIndex})`);
        queryParams.push(searchPattern);
        paramIndex++;
      }
    }

    // Titre/poste (current_title_normalized)
    if (title && typeof title === 'string' && title.trim()) {
      whereConditions.push(`LOWER(c.current_title_normalized) LIKE $${paramIndex}`);
      queryParams.push(`%${title.toLowerCase()}%`);
      paramIndex++;
    }

    // Pays (country)
    if (country && typeof country === 'string' && country.trim()) {
      whereConditions.push(`LOWER(c.country) LIKE $${paramIndex}`);
      queryParams.push(`%${country.toLowerCase()}%`);
      paramIndex++;
    }

    // Années d'expérience (years_of_experience)
    if (years_exp && typeof years_exp === 'string' && years_exp.trim()) {
      whereConditions.push(`c.years_of_experience = $${paramIndex}`);
      queryParams.push(parseInt(years_exp));
      paramIndex++;
    }

    // Recherche d'entreprise (current_company_name)
    if (company_name && typeof company_name === 'string' && company_name.trim()) {
      whereConditions.push(`LOWER(c.current_company_name) LIKE $${paramIndex}`);
      queryParams.push(`%${company_name.toLowerCase()}%`);
      paramIndex++;
    }

    // Secteur d'activité (current_company_industry)
    if (industry && typeof industry === 'string' && industry.trim()) {
      whereConditions.push(`LOWER(c.current_company_industry) LIKE $${paramIndex}`);
      queryParams.push(`%${industry.toLowerCase()}%`);
      paramIndex++;
    }

    // Sous secteur (current_company_subindustry)
    if (subindustry && typeof subindustry === 'string' && subindustry.trim()) {
      whereConditions.push(`LOWER(c.current_company_subindustry) LIKE $${paramIndex}`);
      queryParams.push(`%${subindustry.toLowerCase()}%`);
      paramIndex++;
    }

    // Construction de la requête finale
    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
    
    // Ajout des paramètres de pagination
    queryParams.push(parseInt(limit as string), offset);

    const result = await pool.query(`
      SELECT 
        c.id,
        c.full_name,
        c.headline,
        c.location,
        c.country,
        c.current_company_name,
        c.current_company_industry,
        c.current_company_subindustry,
        c.current_title_normalized,
        c.years_of_experience,
        c.linkedin_url,
        c.profile_picture_url,
        c.lead_quality_score,
        c.connections_count,
        c.created_at,
        c.updated_at,
        '[]'::json as experiences,
        '[]'::json as languages,
        '[]'::json as skills,
        '[]'::json as interests,
        '[]'::json as education
      FROM contacts c
      ${whereClause}
      ORDER BY c.id DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `, queryParams);

    // Compter le total pour la pagination
    const countResult = await pool.query(`
      SELECT COUNT(*) as total 
      FROM contacts c 
      ${whereClause}
    `, queryParams.slice(0, -2)); // Exclure limit et offset pour le count

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

// GET - Recherche d'entreprises ULTRA-RAPIDE (nouvelle API dédiée)
app.get('/api/contacts/search/companies', async (req, res) => {
  try {
    const { q, page = '1', limit = '20', sort = 'name' } = req.query;
    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);
    const startTime = Date.now();

    if (q && typeof q === 'string' && q.trim()) {
      const searchTerm = q.trim();
      const normalizedSearchTerm = searchTerm
        .toLowerCase()
        .replace(/[éèêëàáâãäåíìîïóòôõöúùûüýÿçñßæœ]/g, 'e')
        .replace(/[ÉÈÊËÀÁÂÃÄÅÍÌÎÏÓÒÔÕÖÚÙÛÜÝŸÇÑßÆŒ]/g, 'E');
      
      const searchPattern = `%${normalizedSearchTerm}%`;
      const originalSearchPattern = `%${searchTerm.toLowerCase()}%`;
      const hasAccents = /[éèêëàáâãäåíìîïóòôõöúùûüýÿçñßæœÉÈÊËÀÁÂÃÄÅÍÌÎÏÓÒÔÕÖÚÙÛÜÝŸÇÑßÆŒ]/.test(searchTerm);

      // Requête optimisée pour collecter les données d'entreprise
      let query = `
        SELECT 
          c.id,
          c.full_name,
          c.headline,
          c.location,
          c.country,
          c.current_company_name as company_domain,
          c.current_company_industry as company_sector,
          c.current_company_subindustry as company_sub_sector,
          c.linkedin_url,
          c.profile_picture_url,
          c.lead_quality_score,
          c.connections_count,
          c.years_of_experience,
          c.created_at,
          c.updated_at,
          COUNT(*) OVER() as total_count
        FROM contacts c
        WHERE 
          c.current_company_name IS NOT NULL 
          AND c.current_company_name != ''
          AND (
            ${hasAccents ? 
              'LOWER(c.current_company_name) LIKE $1 OR LOWER(c.current_company_name) LIKE $2 OR ' +
              'LOWER(c.current_company_industry) LIKE $1 OR LOWER(c.current_company_industry) LIKE $2 OR ' +
              'LOWER(c.current_company_subindustry) LIKE $1 OR LOWER(c.current_company_subindustry) LIKE $2' : 
              'LOWER(c.current_company_name) LIKE $1 OR ' +
              'LOWER(c.current_company_industry) LIKE $1 OR ' +
              'LOWER(c.current_company_subindustry) LIKE $1'
            }
          )
        ORDER BY 
          CASE WHEN $3 = 'name' THEN c.current_company_name END ASC,
          CASE WHEN $3 = 'quality' THEN c.lead_quality_score END DESC,
          CASE WHEN $3 = 'connections' THEN c.connections_count END DESC,
          c.id DESC
        LIMIT ${hasAccents ? '$4' : '$2'} OFFSET ${hasAccents ? '$5' : '$3'}
      `;
      
      const result = await pool.query(query, hasAccents ? 
        [searchPattern, originalSearchPattern, sort, parseInt(limit as string), offset.toString()] : 
        [searchPattern, sort, parseInt(limit as string), offset.toString()]
      );

      const totalCount = result.rows.length > 0 ? parseInt(result.rows[0].total_count) : 0;

      res.json({
        contacts: result.rows.map(row => ({
          ...row,
          total_count: undefined // Retirer du résultat final
        })),
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total: totalCount,
          pages: Math.ceil(totalCount / parseInt(limit as string))
        },
        searchTerm: q,
        searchTime: Date.now() - startTime,
        searchFields: {
          company_domain: 'current_company_name',
          company_sector: 'current_company_industry', 
          company_sub_sector: 'current_company_subindustry'
        }
      });
    } else {
      // Liste normale des entreprises
      const result = await pool.query(`
        SELECT 
          c.id,
          c.full_name,
          c.headline,
          c.location,
          c.country,
          c.current_company_name as company_domain,
          c.current_company_industry as company_sector,
          c.current_company_subindustry as company_sub_sector,
          c.linkedin_url,
          c.profile_picture_url,
          c.lead_quality_score,
          c.connections_count,
          c.years_of_experience,
          c.created_at,
          c.updated_at,
          COUNT(*) OVER() as total_count
        FROM contacts c
        WHERE c.current_company_name IS NOT NULL 
        AND c.current_company_name != ''
        ORDER BY c.current_company_name ASC
        LIMIT $1 OFFSET $2
      `, [parseInt(limit as string), offset]);

      const totalCount = result.rows.length > 0 ? parseInt(result.rows[0].total_count) : 0;

      res.json({
        contacts: result.rows.map(row => ({
          ...row,
          total_count: undefined
        })),
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total: totalCount,
          pages: Math.ceil(totalCount / parseInt(limit as string))
        }
      });
    }
  } catch (error) {
    console.error('Erreur lors de la recherche d\'entreprises:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET - Suggestions d'entreprises pour autocomplétion
app.get('/api/companies/suggestions', async (req, res) => {
  const { q, field = 'all' } = req.query;
  
  if (!q || typeof q !== 'string' || q.length < 2) {
    return res.json({ suggestions: [] });
  }

  try {
    let query = '';
    let params = [`${q}%`];

    switch (field) {
      case 'domain':
        query = `
          SELECT DISTINCT 
            current_company_name as value,
            'company_domain' as field_type,
            COUNT(*) as employee_count
          FROM contacts 
          WHERE current_company_name ILIKE $1
          GROUP BY current_company_name
          ORDER BY employee_count DESC, current_company_name ASC
          LIMIT 10
        `;
        break;
      case 'sector':
        query = `
          SELECT DISTINCT 
            current_company_industry as value,
            'company_sector' as field_type,
            COUNT(*) as employee_count
          FROM contacts 
          WHERE current_company_industry ILIKE $1
          GROUP BY current_company_industry
          ORDER BY employee_count DESC, current_company_industry ASC
          LIMIT 10
        `;
        break;
      case 'sub_sector':
        query = `
          SELECT DISTINCT 
            current_company_subindustry as value,
            'company_sub_sector' as field_type,
            COUNT(*) as employee_count
          FROM contacts 
          WHERE current_company_subindustry ILIKE $1
          GROUP BY current_company_subindustry
          ORDER BY employee_count DESC, current_company_subindustry ASC
          LIMIT 10
        `;
        break;
      default: // 'all'
        query = `
          SELECT DISTINCT 
            current_company_name as value,
            'company_domain' as field_type,
            COUNT(*) as employee_count
          FROM contacts 
          WHERE current_company_name ILIKE $1
          GROUP BY current_company_name
          UNION ALL
          SELECT DISTINCT 
            current_company_industry as value,
            'company_sector' as field_type,
            COUNT(*) as employee_count
          FROM contacts 
          WHERE current_company_industry ILIKE $1
          GROUP BY current_company_industry
          UNION ALL
          SELECT DISTINCT 
            current_company_subindustry as value,
            'company_sub_sector' as field_type,
            COUNT(*) as employee_count
          FROM contacts 
          WHERE current_company_subindustry ILIKE $1
          GROUP BY current_company_subindustry
          ORDER BY employee_count DESC, value ASC
          LIMIT 15
        `;
    }

    const result = await pool.query(query, params);
    res.json({ suggestions: result.rows });
  } catch (error) {
    console.error('Erreur suggestions:', error);
    res.status(500).json({ error: 'Erreur suggestions' });
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
  console.log('   - GET /api/contacts/search/companies (recherche entreprises optimisée)');
  console.log('   - GET /api/companies/suggestions (suggestions autocomplétion)');
  console.log('   - GET /api/companies (avec pagination ultra-rapide)');
  console.log('   - GET /api/companies/:id (fiche entreprise simplifiée)');
});
