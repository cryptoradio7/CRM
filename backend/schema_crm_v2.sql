-- =====================================================
-- SCHÉMA CRM V2.0 - ULTRA-SIMPLIFIÉ
-- =====================================================
-- Version: 2.0
-- Date: $(date)
-- Description: Schéma optimisé pour import Lemlist
-- =====================================================

-- Supprimer les tables existantes si elles existent
DROP TABLE IF EXISTS contact_notes CASCADE;
DROP TABLE IF EXISTS follow_up_stages CASCADE;
DROP TABLE IF EXISTS contact_interests CASCADE;
DROP TABLE IF EXISTS contact_skills CASCADE;
DROP TABLE IF EXISTS contact_languages CASCADE;
DROP TABLE IF EXISTS experiences CASCADE;
DROP TABLE IF EXISTS companies CASCADE;
DROP TABLE IF EXISTS contacts CASCADE;

-- =====================================================
-- 1. CONTACTS (Personnes physiques)
-- =====================================================
CREATE TABLE contacts (
    id SERIAL PRIMARY KEY,
    lead_id BIGINT UNIQUE,
    full_name VARCHAR(255) NOT NULL,
    headline VARCHAR(500),
    summary TEXT,
    location VARCHAR(255),
    country VARCHAR(100),
    connections_count INTEGER,
    lead_quality_score FLOAT,
    linkedin_url TEXT,
    years_of_experience INTEGER,
    department VARCHAR(100),
    current_title_normalized VARCHAR(255)
);

-- =====================================================
-- 2. ENTREPRISES (Personnes morales)
-- =====================================================
CREATE TABLE companies (
    id SERIAL PRIMARY KEY,
    company_id BIGINT UNIQUE,
    company_name VARCHAR(255) NOT NULL,
    company_description TEXT,
    company_industry VARCHAR(100),
    company_subindustry VARCHAR(100),
    company_size VARCHAR(50),
    company_website_url TEXT,
    headquarters_city VARCHAR(100),
    headquarters_country VARCHAR(100),
    employee_count INTEGER,
    revenue_bucket VARCHAR(50),
    company_type VARCHAR(50)
);

-- =====================================================
-- 3. EXPÉRIENCES (Liaison contacts ↔ entreprises)
-- =====================================================
CREATE TABLE experiences (
    id SERIAL PRIMARY KEY,
    contact_id INTEGER REFERENCES contacts(id) ON DELETE CASCADE,
    company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
    title VARCHAR(255),
    title_normalized VARCHAR(255),
    department VARCHAR(100),
    date_from DATE,
    date_to DATE,
    duration VARCHAR(50),
    description TEXT,
    location VARCHAR(255),
    is_current BOOLEAN DEFAULT FALSE,
    order_in_profile INTEGER
);

-- =====================================================
-- 4. LANGUES DES CONTACTS
-- =====================================================
CREATE TABLE contact_languages (
    id SERIAL PRIMARY KEY,
    contact_id INTEGER REFERENCES contacts(id) ON DELETE CASCADE,
    language VARCHAR(100),
    proficiency VARCHAR(100),
    order_in_profile INTEGER
);

-- =====================================================
-- 5. COMPÉTENCES DES CONTACTS
-- =====================================================
CREATE TABLE contact_skills (
    id SERIAL PRIMARY KEY,
    contact_id INTEGER REFERENCES contacts(id) ON DELETE CASCADE,
    skill_name VARCHAR(255),
    order_in_profile INTEGER
);

-- =====================================================
-- 6. INTÉRÊTS DES CONTACTS
-- =====================================================
CREATE TABLE contact_interests (
    id SERIAL PRIMARY KEY,
    contact_id INTEGER REFERENCES contacts(id) ON DELETE CASCADE,
    interest_name VARCHAR(255),
    order_in_profile INTEGER
);

-- =====================================================
-- 7. ÉTAPES DE SUIVI CRM
-- =====================================================
CREATE TABLE follow_up_stages (
    id SERIAL PRIMARY KEY,
    stage_name VARCHAR(50) UNIQUE NOT NULL,
    stage_order INTEGER,
    color VARCHAR(7) DEFAULT '#4CAF50',
    description TEXT
);

-- =====================================================
-- 8. NOTES ET INTERACTIONS
-- =====================================================
CREATE TABLE contact_notes (
    id SERIAL PRIMARY KEY,
    contact_id INTEGER REFERENCES contacts(id) ON DELETE CASCADE,
    note_content TEXT NOT NULL,
    note_type VARCHAR(50) DEFAULT 'general'
);

-- =====================================================
-- INDEX POUR PERFORMANCE
-- =====================================================
CREATE INDEX idx_contacts_lead_id ON contacts(lead_id);
CREATE INDEX idx_contacts_full_name ON contacts(full_name);
CREATE INDEX idx_contacts_country ON contacts(country);
CREATE INDEX idx_contacts_department ON contacts(department);
CREATE INDEX idx_companies_company_id ON companies(company_id);
CREATE INDEX idx_companies_name ON companies(company_name);
CREATE INDEX idx_companies_industry ON companies(company_industry);
CREATE INDEX idx_experiences_contact_id ON experiences(contact_id);
CREATE INDEX idx_experiences_company_id ON experiences(company_id);
CREATE INDEX idx_experiences_is_current ON experiences(is_current);

-- =====================================================
-- DONNÉES INITIALES
-- =====================================================
INSERT INTO follow_up_stages (stage_name, stage_order, color, description) VALUES
('À contacter', 1, '#FF9800', 'Nouveau contact à contacter'),
('En cours', 2, '#2196F3', 'Contact en cours de suivi'),
('Intéressé', 3, '#9C27B0', 'Contact intéressé par nos services'),
('Rendez-vous', 4, '#673AB7', 'Rendez-vous programmé'),
('Prospect chaud', 5, '#F44336', 'Prospect très intéressé'),
('Client', 6, '#4CAF50', 'Devenu client'),
('Non intéressé', 7, '#9E9E9E', 'Non intéressé pour le moment');

-- =====================================================
-- VUES POUR FACILITER LES REQUÊTES
-- =====================================================

-- Vue des contacts avec leur expérience actuelle
CREATE OR REPLACE VIEW v_contacts_current_job AS
SELECT 
    c.id,
    c.lead_id,
    c.full_name,
    c.headline,
    c.location,
    c.country,
    c.department,
    c.current_title_normalized,
    c.connections_count,
    c.lead_quality_score,
    comp.company_name,
    comp.company_industry,
    comp.company_size,
    e.title as current_title,
    e.date_from as current_job_start
FROM contacts c
LEFT JOIN experiences e ON c.id = e.contact_id AND e.is_current = true
LEFT JOIN companies comp ON e.company_id = comp.id;

-- Vue des entreprises avec nombre de contacts
CREATE OR REPLACE VIEW v_companies_stats AS
SELECT 
    comp.id,
    comp.company_id,
    comp.company_name,
    comp.company_industry,
    comp.company_size,
    comp.employee_count,
    comp.headquarters_city,
    comp.headquarters_country,
    COUNT(DISTINCT e.contact_id) as contacts_count,
    COUNT(DISTINCT CASE WHEN e.is_current = true THEN e.contact_id END) as current_contacts_count
FROM companies comp
LEFT JOIN experiences e ON comp.id = e.company_id
GROUP BY comp.id, comp.company_id, comp.company_name, comp.company_industry, 
         comp.company_size, comp.employee_count, comp.headquarters_city, comp.headquarters_country;

-- =====================================================
-- FONCTIONS UTILITAIRES
-- =====================================================

-- Fonction pour détecter les postes de direction
CREATE OR REPLACE FUNCTION is_management_position(title TEXT) 
RETURNS BOOLEAN AS $$
BEGIN
  RETURN title ILIKE '%director%' OR 
         title ILIKE '%ceo%' OR 
         title ILIKE '%cto%' OR 
         title ILIKE '%cfo%' OR 
         title ILIKE '%coo%' OR 
         title ILIKE '%president%' OR 
         title ILIKE '%vp%' OR 
         title ILIKE '%vice%' OR
         title ILIKE '%head%' OR
         title ILIKE '%chief%' OR
         title ILIKE '%manager%';
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- FIN DU SCHÉMA
-- =====================================================
