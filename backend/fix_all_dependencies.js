const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'crm',
  user: process.env.DB_USER || 'egx',
  password: process.env.DB_PASSWORD || 'Luxembourg1978',
});

// Mapping complet des corrections secteur -> sous-secteur
const industrySubindustryMapping = {
  'Accommodation Services': [
    'Food and Beverage Services',
    'Hospitality'
  ],
  'Administrative and Support Services': [
    'Collection Agencies',
    'Events Services',
    'Facilities Services',
    'Fundraising',
    'Office Administration',
    'Security and Investigations',
    'Staffing and Recruiting',
    'Telephone Call Centers',
    'Translation and Localization',
    'Travel Arrangements',
    'Writing and Editing'
  ],
  'Construction': [
    'Building Construction',
    'Civil Engineering',
    'Specialty Trade Contractors'
  ],
  'Consumer Services': [
    'Civic and Social Organizations',
    'Household Services',
    'Non-profit Organizations',
    'Personal and Laundry Services',
    'Philanthropic Fundraising Services',
    'Religious Institutions',
    'Repair and Maintenance'
  ],
  'Education': [
    'E-Learning Providers',
    'Higher Education',
    'Primary and Secondary Education',
    'Professional Training and Coaching',
    'Technical and Vocational Training'
  ],
  'Entertainment Providers': [
    'Artists and Writers',
    'Museums, Historical Sites, and Zoos',
    'Musicians',
    'Performing Arts and Spectator Sports',
    'Recreational Facilities'
  ],
  'Farming, Ranching, Forestry': [
    'Farming',
    'Forestry and Logging'
  ],
  'Financial Services': [
    'Capital Markets',
    'Credit Intermediation',
    'Funds and Trusts',
    'Insurance'
  ],
  'Government Administration': [
    'Administration of Justice',
    'Economic Programs',
    'Environmental Quality Programs',
    'Health and Human Services',
    'Housing and Community Development',
    'Military and International Affairs',
    'Public Policy Offices',
    'Space Research and Technology'
  ],
  'Hospitals and Health Care': [
    'Community Services',
    'Hospitals',
    'Individual and Family Services',
    'Medical Practices',
    'Nursing Homes and Residential Care'
  ],
  'Manufacturing': [
    'Apparel Manufacturing',
    'Appliances, Electrical, and Electronics Manufacturing',
    'Chemical Manufacturing',
    'Climate Technology Products Manufacturing',
    'Computers and Electronics Manufacturing',
    'Fabricated Metal Products',
    'Food and Beverage Manufacturing',
    'Furniture and Home Furnishings Manufacturing',
    'Glass, Ceramics and Concrete Manufacturing',
    'Leather Product Manufacturing',
    'Machinery Manufacturing',
    'Oil and Coal Product Manufacturing',
    'Plastics and Rubber Product Manufacturing',
    'Primary Metal Manufacturing',
    'Printing Services',
    'Sporting Goods Manufacturing',
    'Tobacco Manufacturing',
    'Transportation Equipment Manufacturing',
    'Wood Product Manufacturing'
  ],
  'Oil, Gas, and Mining': [
    'Mining',
    'Oil and Gas'
  ],
  'Professional Services': [
    'Accounting',
    'Advertising Services',
    'Architecture and Planning',
    'Business Consulting and Services',
    'Design Services',
    'Engineering Services',
    'Legal Services',
    'Photography',
    'Research Services',
    'Services for Renewable Energy',
    'Veterinary Services'
  ],
  'Real Estate and Equipment Rental Services': [
    'Equipment Rental Services',
    'Real Estate'
  ],
  'Retail': [
    'Food and Beverage Retail',
    'Online and Mail Order Retail',
    'Retail Apparel and Fashion',
    'Retail Appliances, Electrical, and Electronics',
    'Retail Art Dealers',
    'Retail Art Supplies',
    'Retail Books and Printed News',
    'Retail Building Materials and Garden',
    'Retail Florists',
    'Retail Furniture and Home Furnishings',
    'Retail Gasoline',
    'Retail Health and Personal Care Products',
    'Retail Luxury Goods and Jewelry',
    'Retail Motor Vehicles',
    'Retail Musical Instruments',
    'Retail Office Equipment',
    'Retail Office Supplies and Gifts',
    'Retail Recyclable Materials & Used Merchandise'
  ],
  'Technology, Information and Media': [
    'Media and Telecommunications',
    'Technology, Information and Internet',
    'IT Services and IT Consulting'
  ],
  'Transportation, Logistics, Supply Chain and Storage': [
    'Airlines and Aviation',
    'Freight and Package Transportation',
    'Ground Passenger Transportation',
    'Maritime Transportation',
    'Pipeline Transportation',
    'Postal Services',
    'Rail Transportation',
    'Truck Transportation',
    'Warehousing and Storage'
  ],
  'Utilities': [
    'Electric Power Generation',
    'Electric Power Transmission, Control, and Distribution',
    'Natural Gas Distribution',
    'Water, Waste, Steam and Air Conditioning'
  ],
  'Wholesale': [
    'Wholesale Alcoholic Beverages',
    'Wholesale Apparel and Sewing Supplies',
    'Wholesale Appliances, Electrical',
    'Wholesale Building Materials',
    'Wholesale Chemical and Allied Products',
    'Wholesale Computer Equipment',
    'Wholesale Drugs and Sundries',
    'Wholesale Food and Beverage',
    'Wholesale Footwear',
    'Wholesale Hardware, Plumbing, Heating',
    'Wholesale Import and Export',
    'Wholesale Luxury Goods and Jewelry',
    'Wholesale Metals and Minerals',
    'Wholesale Motor Vehicles and Parts',
    'Wholesale Paper Products',
    'Wholesale Petroleum and Petroleum Products',
    'Wholesale Photography Equipment and Supplies',
    'Wholesale Raw Farm Products',
    'Wholesale Recyclable Materials'
  ]
};

async function fixAllDependencies() {
  const client = await pool.connect();
  
  try {
    console.log('🔧 Début de la correction complète des dépendances secteur/sous-secteur...');
    
    // Statistiques avant correction
    const beforeStats = await client.query(`
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
      ORDER BY count DESC
      LIMIT 15
    `);
    
    console.log('📊 Avant correction (top 15):');
    beforeStats.rows.forEach(row => {
      console.log(`  ${row.current_company_industry} | ${row.current_company_subindustry} (${row.count})`);
    });
    
    let totalUpdated = 0;
    
    // Parcourir chaque secteur et corriger les sous-secteurs incorrects
    for (const [correctIndustry, validSubindustries] of Object.entries(industrySubindustryMapping)) {
      console.log(`\n🔍 Traitement du secteur: ${correctIndustry}`);
      
      // Trouver les contacts avec des sous-secteurs qui appartiennent à ce secteur
      for (const subindustry of validSubindustries) {
        // Chercher les contacts avec ce sous-secteur mais un secteur incorrect
        const result = await client.query(`
          UPDATE contacts 
          SET current_company_industry = $1
          WHERE current_company_subindustry = $2 
            AND current_company_industry != $1
            AND current_company_industry IS NOT NULL
            AND current_company_industry != ''
          RETURNING id
        `, [correctIndustry, subindustry]);
        
        if (result.rowCount > 0) {
          console.log(`  ✅ ${result.rowCount} contacts mis à jour: ${subindustry} -> ${correctIndustry}`);
          totalUpdated += result.rowCount;
        }
      }
    }
    
    // Corrections spéciales pour les cas spécifiques
    const specialCorrections = [
      {
        from: 'Professional Services',
        to: 'Technology, Information and Media',
        subindustry: 'IT Services and IT Consulting'
      },
      {
        from: 'Professional Services',
        to: 'Technology, Information and Media',
        subindustry: 'Services for Renewable Energy'
      },
      {
        from: 'Professional Services',
        to: 'Manufacturing',
        subindustry: 'Engineering Services'
      }
    ];
    
    for (const correction of specialCorrections) {
      const result = await client.query(`
        UPDATE contacts 
        SET current_company_industry = $1
        WHERE current_company_subindustry = $2
          AND current_company_industry = $3
        RETURNING id
      `, [correction.to, correction.subindustry, correction.from]);
      
      if (result.rowCount > 0) {
        console.log(`  ✅ ${result.rowCount} contacts ${correction.subindustry} déplacés de ${correction.from} vers ${correction.to}`);
        totalUpdated += result.rowCount;
      }
    }
    
    // Statistiques après correction
    const afterStats = await client.query(`
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
      ORDER BY count DESC
      LIMIT 15
    `);
    
    console.log('\n📊 Après correction (top 15):');
    afterStats.rows.forEach(row => {
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

fixAllDependencies();
