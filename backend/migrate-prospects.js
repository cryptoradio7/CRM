const { Pool } = require('pg');
const fs = require('fs');

// Configuration de la base de données
const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'crm_db',
  user: 'egx',
  password: 'Luxembourg1978'
});

async function migrateProspects() {
  const client = await pool.connect();
  
  try {
    console.log('🚀 Début de la migration des prospects...');
    
    // 1. Récupérer tous les prospects
    console.log('📊 Récupération des prospects...');
    const prospectsResult = await client.query('SELECT * FROM prospects ORDER BY id');
    const prospects = prospectsResult.rows;
    console.log(`✅ ${prospects.length} prospects trouvés`);
    
    let successCount = 0;
    let errorCount = 0;
    const errors = [];
    
    // 2. Migrer chaque prospect
    for (const prospect of prospects) {
      try {
        await client.query('BEGIN');
        
        // 2.1. Créer ou récupérer l'entreprise
        let companyId = null;
        if (prospect.entreprise && prospect.entreprise.trim() !== '') {
          // Vérifier si l'entreprise existe déjà
          const existingCompany = await client.query(
            'SELECT id FROM companies WHERE company_name = $1',
            [prospect.entreprise.trim()]
          );
          
          if (existingCompany.rows.length > 0) {
            companyId = existingCompany.rows[0].id;
          } else {
            // Créer une nouvelle entreprise
            const companyResult = await client.query(`
              INSERT INTO companies (
                company_name, 
                company_size, 
                company_website_url, 
                company_industry,
                created_at
              ) VALUES ($1, $2, $3, $4, NOW())
              RETURNING id
            `, [
              prospect.entreprise.trim(),
              prospect.taille_entreprise || null,
              prospect.site_web || null,
              prospect.secteur || null
            ]);
            companyId = companyResult.rows[0].id;
          }
        }
        
        // 2.2. Créer le contact
        const contactResult = await client.query(`
          INSERT INTO contacts (
            full_name,
            country,
            sector,
            email,
            telephone,
            linkedin_url,
            interests,
            historic,
            follow_up,
            date_creation,
            date_modification,
            created_at,
            updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW())
          RETURNING id
        `, [
          prospect.nom_complet,
          prospect.pays || 'Luxembourg',
          prospect.secteur || null,
          prospect.email || null,
          prospect.telephone || null,
          prospect.linkedin || null,
          prospect.interets || null,
          prospect.historique || null,
          prospect.etape_suivi || 'à contacter',
          prospect.date_creation || null,
          prospect.date_modification || null
        ]);
        
        const contactId = contactResult.rows[0].id;
        
        // 2.3. Créer l'expérience si on a une entreprise et un poste
        if (companyId && (prospect.categorie_poste || prospect.poste_specifique)) {
          await client.query(`
            INSERT INTO experiences (
              contact_id,
              company_id,
              title,
              job_category,
              is_current,
              order_in_profile,
              created_at
            ) VALUES ($1, $2, $3, $4, true, 1, NOW())
          `, [
            contactId,
            companyId,
            prospect.poste_specifique || prospect.categorie_poste || 'Poste non spécifié',
            prospect.categorie_poste || null
          ]);
        }
        
        // 2.4. Enregistrer le mapping
        await client.query(`
          INSERT INTO migration_mapping (
            old_prospect_id,
            new_contact_id,
            new_company_id,
            migration_status,
            migration_date
          ) VALUES ($1, $2, $3, 'success', NOW())
        `, [prospect.id, contactId, companyId]);
        
        await client.query('COMMIT');
        successCount++;
        
        if (successCount % 100 === 0) {
          console.log(`📈 ${successCount} prospects migrés...`);
        }
        
      } catch (error) {
        await client.query('ROLLBACK');
        errorCount++;
        errors.push({
          prospectId: prospect.id,
          prospectName: prospect.nom_complet,
          error: error.message
        });
        
        // Enregistrer l'erreur dans le mapping
        await client.query(`
          INSERT INTO migration_mapping (
            old_prospect_id,
            migration_status,
            error_message,
            migration_date
          ) VALUES ($1, 'error', $2, NOW())
        `, [prospect.id, error.message]);
        
        console.error(`❌ Erreur pour prospect ${prospect.id} (${prospect.nom_complet}): ${error.message}`);
      }
    }
    
    // 3. Statistiques finales
    console.log('\n🎉 Migration terminée !');
    console.log(`✅ Succès: ${successCount}`);
    console.log(`❌ Erreurs: ${errorCount}`);
    
    // 4. Vérifications
    const totalContacts = await client.query('SELECT COUNT(*) FROM contacts');
    const totalCompanies = await client.query('SELECT COUNT(*) FROM companies');
    const totalExperiences = await client.query('SELECT COUNT(*) FROM experiences');
    const mappingStats = await client.query(`
      SELECT migration_status, COUNT(*) 
      FROM migration_mapping 
      GROUP BY migration_status
    `);
    
    console.log('\n📊 Statistiques finales:');
    console.log(`👥 Contacts totaux: ${totalContacts.rows[0].count}`);
    console.log(`🏢 Entreprises totales: ${totalCompanies.rows[0].count}`);
    console.log(`💼 Expériences totales: ${totalExperiences.rows[0].count}`);
    console.log('\n📋 Statut de migration:');
    mappingStats.rows.forEach(row => {
      console.log(`  ${row.migration_status}: ${row.count}`);
    });
    
    if (errors.length > 0) {
      console.log('\n❌ Erreurs détaillées:');
      errors.slice(0, 10).forEach(error => {
        console.log(`  - Prospect ${error.prospectId} (${error.prospectName}): ${error.error}`);
      });
      if (errors.length > 10) {
        console.log(`  ... et ${errors.length - 10} autres erreurs`);
      }
    }
    
  } catch (error) {
    console.error('💥 Erreur générale:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

// Exécuter la migration
migrateProspects().catch(console.error);
