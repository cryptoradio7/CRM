const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'crm',
  user: process.env.DB_USER || 'egx',
  password: process.env.DB_PASSWORD || 'Luxembourg1978',
});

async function fixRemainingDependencies() {
  const client = await pool.connect();
  
  try {
    console.log('🔧 Correction des dernières dépendances incorrectes...\n');
    
    // Corrections spécifiques pour les derniers cas
    const corrections = [
      {
        from: 'Manufacturing',
        to: 'Professional Services',
        subindustry: 'Engineering Services',
        reason: 'Engineering Services appartient à Professional Services'
      },
      {
        from: 'Manufacturing',
        to: 'Hospitals and Health Care',
        subindustry: 'Medical Equipment Manufacturing',
        reason: 'Medical Equipment Manufacturing appartient à Hospitals and Health Care'
      },
      {
        from: 'Manufacturing',
        to: 'Manufacturing',
        subindustry: 'Paper and Forest Product Manufacturing',
        reason: 'Déjà correct, mais vérifier la correspondance'
      },
      {
        from: 'Manufacturing',
        to: 'Manufacturing',
        subindustry: 'Textile Manufacturing',
        reason: 'Déjà correct, mais vérifier la correspondance'
      }
    ];
    
    let totalUpdated = 0;
    
    for (const correction of corrections) {
      if (correction.from !== correction.to) {
        const result = await client.query(`
          UPDATE contacts 
          SET current_company_industry = $1
          WHERE current_company_subindustry = $2
            AND current_company_industry = $3
          RETURNING id
        `, [correction.to, correction.subindustry, correction.from]);
        
        if (result.rowCount > 0) {
          console.log(`✅ ${result.rowCount} contacts mis à jour: ${correction.subindustry} de ${correction.from} vers ${correction.to}`);
          console.log(`   Raison: ${correction.reason}`);
          totalUpdated += result.rowCount;
        }
      } else {
        console.log(`ℹ️  ${correction.subindustry} est déjà dans le bon secteur (${correction.from})`);
      }
    }
    
    // Vérification finale
    const finalCheck = await client.query(`
      SELECT 
        current_company_industry,
        current_company_subindustry,
        COUNT(*) as count
      FROM contacts 
      WHERE current_company_industry IS NOT NULL 
        AND current_company_industry != ''
        AND current_company_subindustry IS NOT NULL 
        AND current_company_subindustry != ''
      GROUP BY current_company_industry, current_company_subindustry
      ORDER BY current_company_industry, current_company_subindustry
    `);
    
    console.log('\n📊 VÉRIFICATION FINALE:');
    console.log('Toutes les combinaisons secteur/sous-secteur:');
    finalCheck.rows.forEach(row => {
      console.log(`  ${row.current_company_industry} | ${row.current_company_subindustry} (${row.count})`);
    });
    
    console.log(`\n✅ Correction terminée: ${totalUpdated} contacts mis à jour`);
    
  } catch (error) {
    console.error('❌ Erreur lors de la correction:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

fixRemainingDependencies();
