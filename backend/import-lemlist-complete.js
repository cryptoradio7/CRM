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
const JSON_FILE_PATH = path.join(__dirname, '..', 'all_lemlist_contacts.json');
const TEST_LIMIT = 100; // Limite pour le test

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

// Fonction pour extraire les données d'un contact (VERSION COMPLÈTE)
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
    years_of_experience: contact.years_of_exp_bucket || '',
    department: contact.department || '',
    current_title_normalized: contact.experiences && contact.experiences.length > 0 ? 
      contact.experiences[0].title_normalized || '' : '',
    // NOUVEAUX CHAMPS IMPORTANTS
    canonical_shorthand_name: contact.canonical_shorthand_name || '',
    profile_picture_url: contact.lead_logo_url || '',
    experience_count: contact.experience_count || 0,
    connections_count_bucket: contact.connections_count_bucket || '',
    linkedin_short: contact.linkedin_short || '',
    updated_at: contact.updated_at ? new Date(contact.updated_at).toISOString() : null,
    // Données de l'entreprise actuelle
    current_company_name: contact.current_exp_company_name || '',
    current_company_industry: contact.current_exp_company_industry || '',
    current_company_subindustry: contact.current_exp_company_subindustry || ''
  };
}

// Fonction pour extraire les données d'une entreprise (VERSION COMPLÈTE)
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
    company_type: companyInfo.company_type || '',
    // NOUVEAUX CHAMPS
    logo_url: companyInfo.company_logo_url || '',
    linkedin_url: companyInfo.company_linkedin_url || '',
    created_at: companyInfo.created_at ? new Date(companyInfo.created_at).toISOString() : null,
    updated_at: companyInfo.updated_at ? new Date(companyInfo.updated_at).toISOString() : null
  };
}

// Fonction pour extraire les expériences (VERSION COMPLÈTE)
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
      order_in_profile: exp.order_in_profile || index + 1,
      // NOUVEAUX CHAMPS
      job_category: exp.job_category || '',
      company_name: exp.company_name || '',
      created_at: exp.created_at ? new Date(exp.created_at).toISOString() : null,
      updated_at: exp.updated_at ? new Date(exp.updated_at).toISOString() : null
    };
  }).filter(exp => exp.company_id); // Filtrer les expériences sans entreprise
}

// Fonction pour extraire les langues (VERSION COMPLÈTE)
function extractLanguages(contact, contactId) {
  if (!contact.languages || !Array.isArray(contact.languages)) return [];
  
  return contact.languages.map((lang, index) => ({
    contact_id: contactId,
    language: lang.language || '',
    proficiency: lang.proficiency || '',
    order_in_profile: lang.order_in_profile || index + 1,
    // NOUVEAUX CHAMPS
    created_at: lang.created_at ? new Date(lang.created_at).toISOString() : null,
    updated_at: lang.updated_at ? new Date(lang.updated_at).toISOString() : null
  }));
}

// Fonction pour extraire les compétences (VERSION COMPLÈTE)
function extractSkills(contact, contactId) {
  if (!contact.skills || !Array.isArray(contact.skills)) return [];
  
  return contact.skills.map((skill, index) => ({
    contact_id: contactId,
    skill_name: skill.name || skill,
    order_in_profile: index + 1,
    // NOUVEAUX CHAMPS
    created_at: skill.created_at ? new Date(skill.created_at).toISOString() : null,
    updated_at: skill.updated_at ? new Date(skill.updated_at).toISOString() : null
  }));
}

// Fonction pour extraire les intérêts (VERSION COMPLÈTE)
function extractInterests(contact, contactId) {
  if (!contact.interests || !Array.isArray(contact.interests)) return [];
  
  return contact.interests.map((interest, index) => ({
    contact_id: contactId,
    interest_name: interest.name || interest,
    order_in_profile: index + 1,
    // NOUVEAUX CHAMPS
    created_at: interest.created_at ? new Date(interest.created_at).toISOString() : null,
    updated_at: interest.updated_at ? new Date(interest.updated_at).toISOString() : null
  }));
}

// Fonction pour extraire l'éducation (NOUVELLE)
function extractEducation(contact, contactId) {
  if (!contact.education || !Array.isArray(contact.education)) return [];
  
  return contact.education.map((edu, index) => ({
    contact_id: contactId,
    institution: edu.institution || '',
    degree: edu.degree || '',
    field_of_study: edu.field_of_study || '',
    start_date: parseDate(edu.start_date),
    end_date: parseDate(edu.end_date),
    order_in_profile: index + 1,
    created_at: edu.created_at ? new Date(edu.created_at).toISOString() : null,
    updated_at: edu.updated_at ? new Date(edu.updated_at).toISOString() : null
  }));
}

// Fonction principale d'import (VERSION COMPLÈTE)
async function importLemlistDataComplete() {
  const client = await pool.connect();
  
  try {
    log('🚀 Début de l\'import COMPLET des données Lemlist (100 contacts)', 'bright');
    
    // Lire le fichier JSON
    log('📖 Lecture du fichier JSON...', 'blue');
    const jsonData = JSON.parse(fs.readFileSync(JSON_FILE_PATH, 'utf8'));
    const testData = jsonData.slice(0, TEST_LIMIT);
    
    log(`📊 ${testData.length} contacts à importer (test)`, 'cyan');
    
    // Étape 1: Extraire et insérer les contacts (VERSION COMPLÈTE)
    log('👥 Import des contacts (version complète)...', 'yellow');
    const contactMap = new Map();
    const companyMap = new Map();
    
    for (const contact of testData) {
      const contactData = extractContactData(contact);
      
      // Vérifier si le contact existe déjà
      const existingContact = await client.query(
        'SELECT id FROM contacts WHERE lead_id = $1',
        [contactData.lead_id]
      );
      
      let contactId;
      if (existingContact.rows.length > 0) {
        // Mettre à jour le contact existant
        contactId = existingContact.rows[0].id;
        await client.query(`
          UPDATE contacts SET
            full_name = $2, headline = $3, summary = $4, location = $5, country = $6,
            connections_count = $7, lead_quality_score = $8, linkedin_url = $9,
            years_of_experience = $10, department = $11, current_title_normalized = $12,
            canonical_shorthand_name = $13, profile_picture_url = $14, experience_count = $15,
            connections_count_bucket = $16, linkedin_short = $17, updated_at = $18,
            current_company_name = $19, current_company_industry = $20, current_company_subindustry = $21
          WHERE id = $1
        `, [
          contactId, contactData.full_name, contactData.headline,
          contactData.summary, contactData.location, contactData.country,
          contactData.connections_count, contactData.lead_quality_score,
          contactData.linkedin_url, contactData.years_of_experience,
          contactData.department, contactData.current_title_normalized,
          contactData.canonical_shorthand_name, contactData.profile_picture_url,
          contactData.experience_count, contactData.connections_count_bucket,
          contactData.linkedin_short, contactData.updated_at,
          contactData.current_company_name, contactData.current_company_industry,
          contactData.current_company_subindustry
        ]);
        log(`🔄 Contact mis à jour: ${contactData.full_name}`, 'yellow');
      } else {
        // Créer un nouveau contact
        const result = await client.query(`
          INSERT INTO contacts (
            lead_id, full_name, headline, summary, location, country,
            connections_count, lead_quality_score, linkedin_url,
            years_of_experience, department, current_title_normalized,
            canonical_shorthand_name, profile_picture_url, experience_count,
            connections_count_bucket, linkedin_short, updated_at,
            current_company_name, current_company_industry, current_company_subindustry
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)
          RETURNING id
        `, [
          contactData.lead_id, contactData.full_name, contactData.headline,
          contactData.summary, contactData.location, contactData.country,
          contactData.connections_count, contactData.lead_quality_score,
          contactData.linkedin_url, contactData.years_of_experience,
          contactData.department, contactData.current_title_normalized,
          contactData.canonical_shorthand_name, contactData.profile_picture_url,
          contactData.experience_count, contactData.connections_count_bucket,
          contactData.linkedin_short, contactData.updated_at,
          contactData.current_company_name, contactData.current_company_industry,
          contactData.current_company_subindustry
        ]);
        contactId = result.rows[0].id;
        log(`✅ Nouveau contact créé: ${contactData.full_name}`, 'green');
      }
      
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
                    revenue_bucket, company_type, logo_url, linkedin_url,
                    created_at, updated_at
                  ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
                  RETURNING id
                `, [
                  companyData.company_id, companyData.company_name, companyData.company_description,
                  companyData.company_industry, companyData.company_subindustry, companyData.company_size,
                  companyData.company_website_url, companyData.headquarters_city, companyData.headquarters_country,
                  companyData.employee_count, companyData.revenue_bucket, companyData.company_type,
                  companyData.logo_url, companyData.linkedin_url, companyData.created_at, companyData.updated_at
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
    
    // Étape 2: Insérer les expériences (VERSION COMPLÈTE)
    log('💼 Import des expériences (version complète)...', 'yellow');
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
                is_current, order_in_profile, job_category, company_name,
                created_at, updated_at
              ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
            `, [
              exp.contact_id, exp.company_id, exp.title, exp.title_normalized,
              exp.department, exp.date_from, exp.date_to, exp.duration,
              exp.description, exp.location, exp.is_current, exp.order_in_profile,
              exp.job_category, exp.company_name, exp.created_at, exp.updated_at
            ]);
            experienceCount++;
          } catch (error) {
            log(`⚠️  Erreur lors de l'insertion de l'expérience: ${error.message}`, 'red');
          }
        }
      }
    }
    
    log(`✅ ${experienceCount} expériences importées`, 'green');
    
    // Étape 3: Insérer les langues (VERSION COMPLÈTE)
    log('🗣️  Import des langues (version complète)...', 'yellow');
    let languageCount = 0;
    
    for (const contact of testData) {
      const contactId = contactMap.get(contact.lead_id);
      if (contactId) {
        const languages = extractLanguages(contact, contactId);
        
        for (const lang of languages) {
          try {
            await client.query(`
              INSERT INTO contact_languages (contact_id, language, proficiency, order_in_profile, created_at, updated_at)
              VALUES ($1, $2, $3, $4, $5, $6)
            `, [lang.contact_id, lang.language, lang.proficiency, lang.order_in_profile, lang.created_at, lang.updated_at]);
            languageCount++;
          } catch (error) {
            log(`⚠️  Erreur lors de l'insertion de la langue: ${error.message}`, 'red');
          }
        }
      }
    }
    
    log(`✅ ${languageCount} langues importées`, 'green');
    
    // Étape 4: Insérer les compétences (VERSION COMPLÈTE)
    log('🎯 Import des compétences (version complète)...', 'yellow');
    let skillCount = 0;
    
    for (const contact of testData) {
      const contactId = contactMap.get(contact.lead_id);
      if (contactId) {
        const skills = extractSkills(contact, contactId);
        
        for (const skill of skills) {
          try {
            await client.query(`
              INSERT INTO contact_skills (contact_id, skill_name, order_in_profile, created_at, updated_at)
              VALUES ($1, $2, $3, $4, $5)
            `, [skill.contact_id, skill.skill_name, skill.order_in_profile, skill.created_at, skill.updated_at]);
            skillCount++;
          } catch (error) {
            log(`⚠️  Erreur lors de l'insertion de la compétence: ${error.message}`, 'red');
          }
        }
      }
    }
    
    log(`✅ ${skillCount} compétences importées`, 'green');
    
    // Étape 5: Insérer les intérêts (VERSION COMPLÈTE)
    log('❤️  Import des intérêts (version complète)...', 'yellow');
    let interestCount = 0;
    
    for (const contact of testData) {
      const contactId = contactMap.get(contact.lead_id);
      if (contactId) {
        const interests = extractInterests(contact, contactId);
        
        for (const interest of interests) {
          try {
            await client.query(`
              INSERT INTO contact_interests (contact_id, interest_name, order_in_profile, created_at, updated_at)
              VALUES ($1, $2, $3, $4, $5)
            `, [interest.contact_id, interest.interest_name, interest.order_in_profile, interest.created_at, interest.updated_at]);
            interestCount++;
          } catch (error) {
            log(`⚠️  Erreur lors de l'insertion de l'intérêt: ${error.message}`, 'red');
          }
        }
      }
    }
    
    log(`✅ ${interestCount} intérêts importés`, 'green');
    
    // Étape 6: Insérer l'éducation (NOUVELLE)
    log('🎓 Import de l\'éducation...', 'yellow');
    let educationCount = 0;
    
    for (const contact of testData) {
      const contactId = contactMap.get(contact.lead_id);
      if (contactId) {
        const education = extractEducation(contact, contactId);
        
        for (const edu of education) {
          try {
            await client.query(`
              INSERT INTO contact_education (contact_id, institution, degree, field_of_study, start_date, end_date, order_in_profile, created_at, updated_at)
              VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            `, [edu.contact_id, edu.institution, edu.degree, edu.field_of_study, edu.start_date, edu.end_date, edu.order_in_profile, edu.created_at, edu.updated_at]);
            educationCount++;
          } catch (error) {
            log(`⚠️  Erreur lors de l'insertion de l'éducation: ${error.message}`, 'red');
          }
        }
      }
    }
    
    log(`✅ ${educationCount} formations importées`, 'green');
    
    // Statistiques finales
    log('\n📊 RÉSUMÉ DE L\'IMPORT COMPLET:', 'bright');
    log(`👥 Contacts: ${contactMap.size}`, 'green');
    log(`🏢 Entreprises: ${companyMap.size}`, 'green');
    log(`💼 Expériences: ${experienceCount}`, 'green');
    log(`🗣️  Langues: ${languageCount}`, 'green');
    log(`🎯 Compétences: ${skillCount}`, 'green');
    log(`❤️  Intérêts: ${interestCount}`, 'green');
    log(`🎓 Éducation: ${educationCount}`, 'green');
    
    log('\n🎉 Import COMPLET terminé avec succès !', 'bright');
    log('🔗 Les liens contact-entreprise sont maintenant disponibles', 'cyan');
    
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
  importLemlistDataComplete().catch(console.error);
}

module.exports = { importLemlistDataComplete };
