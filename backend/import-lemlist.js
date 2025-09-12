#!/usr/bin/env node

const fs = require('fs');
const { Pool } = require('pg');
const path = require('path');

// Configuration de la base de données
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'crm_db',
  user: process.env.DB_USER || 'egx',
  password: process.env.DB_PASSWORD || 'Luxembourg1978',
});

// Configuration
const JSON_FILE_PATH = process.argv[2] || path.join(__dirname, '..', 'all_lemlist_contacts.json');
const TEST_LIMIT = null; // Pas de limite - import complet

// Vérifier si le fichier existe
if (!fs.existsSync(JSON_FILE_PATH)) {
  console.error(`❌ Fichier JSON non trouvé: ${JSON_FILE_PATH}`);
  console.error('');
  console.error('Usage: node import-lemlist.js <chemin_vers_fichier.json>');
  console.error('');
  console.error('Exemples:');
  console.error('  node import-lemlist.js ../data/contacts.json');
  console.error('  node import-lemlist.js /path/to/your/file.json');
  console.error('');
  console.error('Note: Ce script est principalement utilisé via l\'interface web (Import JSON)');
  process.exit(1);
}

// Couleurs pour les logs
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Fonction pour parser les dates
function parseDate(dateStr) {
  if (!dateStr) return null;
  
  // Gérer différents formats de dates
  if (dateStr.match(/^\d{4}$/)) {
    return `${dateStr}-01-01`; // Année seulement
  }
  
  if (dateStr.match(/^[A-Za-z]+ \d{4}$/)) {
    const months = {
      'January': '01', 'February': '02', 'March': '03', 'April': '04',
      'May': '05', 'June': '06', 'July': '07', 'August': '08',
      'September': '09', 'October': '10', 'November': '11', 'December': '12',
      'janvier': '01', 'février': '02', 'mars': '03', 'avril': '04',
      'mai': '05', 'juin': '06', 'juillet': '07', 'août': '08',
      'septembre': '09', 'octobre': '10', 'novembre': '11', 'décembre': '12'
    };
    
    const [month, year] = dateStr.split(' ');
    const monthNum = months[month] || '01';
    return `${year}-${monthNum}-01`;
  }
  
  // Essayer de parser la date normalement
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return null;
    return date.toISOString().split('T')[0];
  } catch (e) {
    return null;
  }
}

// Fonction pour déterminer si c'est un poste actuel
function isCurrentJob(experience) {
  return !experience.date_to || 
         experience.date_to === '' || 
         experience.date_to.toLowerCase().includes('present') ||
         experience.date_to.toLowerCase().includes('actuel');
}

// Fonction pour extraire les données d'un contact
function extractContactData(contact) {
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
    // Nouvelles données de la structure analysée
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
}

// Fonction pour extraire les données d'une entreprise
function extractCompanyData(companyInfo) {
  if (!companyInfo || !companyInfo.company_name) return null;
  
  return {
    company_id: companyInfo.company_id,
    company_name: companyInfo.company_name,
    company_description: companyInfo.company_description || '',
    company_industry: companyInfo.company_industry || '',
    company_subindustry: companyInfo.company_subindustry || '',
    company_size: companyInfo.company_size || '',
    company_website_url: companyInfo.company_website_url || '',
    headquarters_city: companyInfo.company_headquarters_city || '',
    headquarters_country: companyInfo.company_headquarters_country || '',
    employee_count: companyInfo.company_employee_count || 0,
    revenue_bucket: companyInfo.revenue_bucket || '',
    company_type: companyInfo.company_type || ''
  };
}

// Fonction pour extraire les expériences
function extractExperiences(contact, contactId, companyMap) {
  if (!contact.experiences || !Array.isArray(contact.experiences)) return [];
  
  return contact.experiences.map((exp, index) => {
    const companyId = exp.company_id ? 
      companyMap.get(exp.company_id) : 
      companyMap.get(exp.company_name);
    
    return {
      contact_id: contactId,
      company_id: companyId,
      title: exp.title || '',
      title_normalized: exp.title_normalized || '',
      department: exp.department || '',
      date_from: parseDate(exp.date_from),
      date_to: parseDate(exp.date_to),
      duration: exp.duration || '',
      description: exp.description || '',
      location: exp.location || '',
      is_current: isCurrentJob(exp),
      order_in_profile: exp.order_in_profile || index + 1
    };
  }).filter(exp => exp.company_id); // Filtrer les expériences sans entreprise
}

// Fonction pour extraire les langues
function extractLanguages(contact, contactId) {
  if (!contact.languages || !Array.isArray(contact.languages)) return [];
  
  return contact.languages.map((lang, index) => ({
    contact_id: contactId,
    language: lang.language || '',
    proficiency: lang.proficiency || '',
    order_in_profile: lang.order_in_profile || index + 1
  }));
}

// Fonction pour extraire les compétences
function extractSkills(contact, contactId) {
  if (!contact.skills || !Array.isArray(contact.skills)) return [];
  
  return contact.skills.map((skill, index) => ({
    contact_id: contactId,
    skill_name: skill.name || skill,
    order_in_profile: index + 1
  }));
}

// Fonction pour extraire les intérêts
function extractInterests(contact, contactId) {
  if (!contact.interests || !Array.isArray(contact.interests)) return [];
  
  return contact.interests.map((interest, index) => ({
    contact_id: contactId,
    interest_name: interest.name || interest,
    order_in_profile: index + 1
  }));
}

// Fonction principale d'import
async function importLemlistData() {
  const client = await pool.connect();
  
  try {
    log('🚀 Début de l\'import des données Lemlist (IMPORT COMPLET)', 'bright');
    
    // Lire le fichier JSON
    log('📖 Lecture du fichier JSON...', 'blue');
    const jsonData = JSON.parse(fs.readFileSync(JSON_FILE_PATH, 'utf8'));
    const testData = TEST_LIMIT ? jsonData.slice(0, TEST_LIMIT) : jsonData;
    
    log(`📊 ${testData.length} contacts à importer (import complet)`, 'cyan');
    
    // Étape 1: Extraire et insérer les contacts
    log('👥 Import des contacts...', 'yellow');
    const contactMap = new Map();
    const companyMap = new Map();
    
    for (const contact of testData) {
      const contactData = extractContactData(contact);
      
      const result = await client.query(`
        INSERT INTO contacts (
          lead_id, full_name, headline, summary, location, country,
          connections_count, lead_quality_score, linkedin_url,
          years_of_experience, department, current_title_normalized
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        RETURNING id
      `, [
        contactData.lead_id, contactData.full_name, contactData.headline,
        contactData.summary, contactData.location, contactData.country,
        contactData.connections_count, contactData.lead_quality_score,
        contactData.linkedin_url, contactData.years_of_experience,
        contactData.department, contactData.current_title_normalized
      ]);
      
      const contactId = result.rows[0].id;
      contactMap.set(contact.lead_id, contactId);
      
      // Extraire les entreprises des expériences
      if (contact.experiences) {
        for (const exp of contact.experiences) {
          if (exp.company_name) {
            const companyData = extractCompanyData(exp);
            if (companyData && !companyMap.has(companyData.company_id || companyData.company_name)) {
              try {
                const companyResult = await client.query(`
                  INSERT INTO companies (
                    company_id, company_name, company_description, company_industry,
                    company_subindustry, company_size, company_website_url,
                    headquarters_city, headquarters_country, employee_count,
                    revenue_bucket, company_type
                  ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
                  RETURNING id
                `, [
                  companyData.company_id, companyData.company_name, companyData.company_description,
                  companyData.company_industry, companyData.company_subindustry, companyData.company_size,
                  companyData.company_website_url, companyData.headquarters_city, companyData.headquarters_country,
                  companyData.employee_count, companyData.revenue_bucket, companyData.company_type
                ]);
                
                const companyId = companyResult.rows[0].id;
                companyMap.set(companyData.company_id || companyData.company_name, companyId);
              } catch (error) {
                if (error.code !== '23505') { // Ignorer les doublons
                  log(`⚠️  Erreur lors de l'insertion de l'entreprise ${companyData.company_name}: ${error.message}`, 'red');
                }
              }
            }
          }
        }
      }
    }
    
    log(`✅ ${contactMap.size} contacts importés`, 'green');
    log(`🏢 ${companyMap.size} entreprises importées`, 'green');
    
    // Étape 2: Insérer les expériences
    log('💼 Import des expériences...', 'yellow');
    let experienceCount = 0;
    
    for (const contact of testData) {
      const contactId = contactMap.get(contact.lead_id);
      if (contactId) {
        const experiences = extractExperiences(contact, contactId, companyMap);
        
        for (const exp of experiences) {
          try {
            await client.query(`
              INSERT INTO experiences (
                contact_id, company_id, title, title_normalized, department,
                date_from, date_to, duration, description, location,
                is_current, order_in_profile
              ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
            `, [
              exp.contact_id, exp.company_id, exp.title, exp.title_normalized,
              exp.department, exp.date_from, exp.date_to, exp.duration,
              exp.description, exp.location, exp.is_current, exp.order_in_profile
            ]);
            experienceCount++;
          } catch (error) {
            log(`⚠️  Erreur lors de l'insertion de l'expérience: ${error.message}`, 'red');
          }
        }
      }
    }
    
    log(`✅ ${experienceCount} expériences importées`, 'green');
    
    // Étape 3: Insérer les langues
    log('🗣️  Import des langues...', 'yellow');
    let languageCount = 0;
    
    for (const contact of testData) {
      const contactId = contactMap.get(contact.lead_id);
      if (contactId) {
        const languages = extractLanguages(contact, contactId);
        
        for (const lang of languages) {
          try {
            await client.query(`
              INSERT INTO contact_languages (contact_id, language, proficiency, order_in_profile)
              VALUES ($1, $2, $3, $4)
            `, [lang.contact_id, lang.language, lang.proficiency, lang.order_in_profile]);
            languageCount++;
          } catch (error) {
            log(`⚠️  Erreur lors de l'insertion de la langue: ${error.message}`, 'red');
          }
        }
      }
    }
    
    log(`✅ ${languageCount} langues importées`, 'green');
    
    // Étape 4: Insérer les compétences
    log('🎯 Import des compétences...', 'yellow');
    let skillCount = 0;
    
    for (const contact of testData) {
      const contactId = contactMap.get(contact.lead_id);
      if (contactId) {
        const skills = extractSkills(contact, contactId);
        
        for (const skill of skills) {
          try {
            await client.query(`
              INSERT INTO contact_skills (contact_id, skill_name, order_in_profile)
              VALUES ($1, $2, $3)
            `, [skill.contact_id, skill.skill_name, skill.order_in_profile]);
            skillCount++;
          } catch (error) {
            log(`⚠️  Erreur lors de l'insertion de la compétence: ${error.message}`, 'red');
          }
        }
      }
    }
    
    log(`✅ ${skillCount} compétences importées`, 'green');
    
    // Étape 5: Insérer les intérêts
    log('❤️  Import des intérêts...', 'yellow');
    let interestCount = 0;
    
    for (const contact of testData) {
      const contactId = contactMap.get(contact.lead_id);
      if (contactId) {
        const interests = extractInterests(contact, contactId);
        
        for (const interest of interests) {
          try {
            await client.query(`
              INSERT INTO contact_interests (contact_id, interest_name, order_in_profile)
              VALUES ($1, $2, $3)
            `, [interest.contact_id, interest.interest_name, interest.order_in_profile]);
            interestCount++;
          } catch (error) {
            log(`⚠️  Erreur lors de l'insertion de l'intérêt: ${error.message}`, 'red');
          }
        }
      }
    }
    
    log(`✅ ${interestCount} intérêts importés`, 'green');
    
    // Statistiques finales
    log('\n📊 RÉSUMÉ DE L\'IMPORT:', 'bright');
    log(`👥 Contacts: ${contactMap.size}`, 'green');
    log(`🏢 Entreprises: ${companyMap.size}`, 'green');
    log(`💼 Expériences: ${experienceCount}`, 'green');
    log(`🗣️  Langues: ${languageCount}`, 'green');
    log(`🎯 Compétences: ${skillCount}`, 'green');
    log(`❤️  Intérêts: ${interestCount}`, 'green');
    
    log('\n🎉 Import terminé avec succès !', 'bright');
    
  } catch (error) {
    log(`❌ Erreur lors de l'import: ${error.message}`, 'red');
    console.error(error);
  } finally {
    client.release();
    await pool.end();
  }
}

// Exécuter l'import
if (require.main === module) {
  importLemlistData().catch(console.error);
}

module.exports = { importLemlistData };


