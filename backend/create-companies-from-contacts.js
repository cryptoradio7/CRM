const { Pool } = require('pg');

const pool = new Pool({
  user: 'egx',
  host: 'localhost',
  database: 'crm_db',
  password: 'Luxembourg1978',
  port: 5432,
});

async function createCompaniesFromContacts() {
  try {
    console.log('🔄 Extraction des entreprises depuis les contacts...');
    
    // Récupérer toutes les entreprises distinctes des contacts
    const companiesQuery = `
      SELECT DISTINCT 
        current_company_name as company_name,
        current_company_industry as company_industry,
        current_company_website_url as company_url,
        current_company_linkedin_url as linkedin_url,
        current_company_domain as company_domain,
        current_company_founded as company_founded,
        current_company_employees_count as employees_count,
        current_company_employees_count_growth as employees_count_growth,
        current_company_subindustry as company_subindustry,
        current_company_headquarters_city as headquarters_city,
        current_company_headquarters_country as headquarters_country,
        current_company_description as company_description,
        current_company_type as company_type
      FROM contacts 
      WHERE current_company_name IS NOT NULL 
        AND current_company_name != ''
      ORDER BY current_company_name;
    `;
    
    const result = await pool.query(companiesQuery);
    const companies = result.rows;
    
    console.log(`📊 ${companies.length} entreprises trouvées dans les contacts`);
    
    // Insérer les entreprises dans la table companies
    let inserted = 0;
    for (const company of companies) {
      try {
        const insertQuery = `
          INSERT INTO companies (
            company_name, company_industry, company_url, linkedin_url,
            company_domain, company_founded, employees_count, employees_count_growth,
            company_subindustry, headquarters_city, headquarters_country,
            company_description, company_type, created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW(), NOW())
          ON CONFLICT (company_name) DO NOTHING;
        `;
        
        await pool.query(insertQuery, [
          company.company_name,
          company.company_industry,
          company.company_url,
          company.linkedin_url,
          company.company_domain,
          company.company_founded,
          company.employees_count,
          company.employees_count_growth,
          company.company_subindustry,
          company.headquarters_city,
          company.headquarters_country,
          company.company_description,
          company.company_type
        ]);
        
        inserted++;
        if (inserted % 100 === 0) {
          console.log(`✅ ${inserted}/${companies.length} entreprises traitées...`);
        }
      } catch (error) {
        console.error(`❌ Erreur pour l'entreprise ${company.company_name}:`, error.message);
      }
    }
    
    console.log(`🎉 Terminé ! ${inserted} entreprises créées`);
    
    // Vérifier le résultat
    const countResult = await pool.query('SELECT COUNT(*) FROM companies');
    console.log(`📈 Total d'entreprises en base: ${countResult.rows[0].count}`);
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await pool.end();
  }
}

createCompaniesFromContacts();
