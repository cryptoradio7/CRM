const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'crm',
  user: process.env.DB_USER || 'egx',
  password: process.env.DB_PASSWORD || 'Luxembourg1978',
});

// Mapping des dépendances correctes
const correctDependencies = {
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
    'Medical Equipment Manufacturing',
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
    'Paper and Forest Product Manufacturing',
    'Plastics and Rubber Product Manufacturing',
    'Primary Metal Manufacturing',
    'Printing Services',
    'Sporting Goods Manufacturing',
    'Textile Manufacturing',
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
    'IT Services and IT Consulting',
    'Services for Renewable Energy'
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

async function validateDependencies() {
  const client = await pool.connect();
  
  try {
    console.log('🔍 Validation des dépendances secteur/sous-secteur...\n');
    
    // Récupérer toutes les combinaisons existantes
    const result = await client.query(`
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
    
    let correctCount = 0;
    let incorrectCount = 0;
    let totalContacts = 0;
    const incorrectDependencies = [];
    
    for (const row of result.rows) {
      const { current_company_industry, current_company_subindustry, count } = row;
      totalContacts += parseInt(count);
      
      // Vérifier si cette combinaison est correcte
      const validSubindustries = correctDependencies[current_company_industry] || [];
      const isValid = validSubindustries.includes(current_company_subindustry);
      
      if (isValid) {
        correctCount += parseInt(count);
      } else {
        incorrectCount += parseInt(count);
        incorrectDependencies.push({
          industry: current_company_industry,
          subindustry: current_company_subindustry,
          count: parseInt(count)
        });
      }
    }
    
    console.log('📊 RÉSULTATS DE LA VALIDATION:');
    console.log(`✅ Combinaisons correctes: ${correctCount} contacts`);
    console.log(`❌ Combinaisons incorrectes: ${incorrectCount} contacts`);
    console.log(`📈 Taux de conformité: ${((correctCount / totalContacts) * 100).toFixed(2)}%`);
    
    if (incorrectDependencies.length > 0) {
      console.log('\n❌ DÉPENDANCES INCORRECTES DÉTECTÉES:');
      incorrectDependencies.forEach(dep => {
        console.log(`  ${dep.industry} | ${dep.subindustry} (${dep.count} contacts)`);
      });
    } else {
      console.log('\n🎉 Toutes les dépendances sont correctes !');
    }
    
    // Afficher les secteurs avec le plus de contacts
    console.log('\n📈 TOP 10 DES SECTEURS:');
    const sectorStats = await client.query(`
      SELECT 
        current_company_industry,
        COUNT(*) as count
      FROM contacts 
      WHERE current_company_industry IS NOT NULL 
        AND current_company_industry != ''
      GROUP BY current_company_industry
      ORDER BY count DESC
      LIMIT 10
    `);
    
    sectorStats.rows.forEach((row, index) => {
      console.log(`  ${index + 1}. ${row.current_company_industry}: ${row.count} contacts`);
    });
    
  } catch (error) {
    console.error('❌ Erreur lors de la validation:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

validateDependencies();
