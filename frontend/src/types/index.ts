// =====================================================
// TYPES POUR LE NOUVEAU SCHÉMA CRM V2
// =====================================================

export interface Contact {
  id: number;
  lead_id?: number;
  full_name: string;
  headline?: string;
  summary?: string;
  location?: string;
  country?: string;
  connections_count?: number;
  lead_quality_score?: number;
  linkedin_url?: string;
  years_of_experience?: number;
  department?: string;
  current_title_normalized?: string;
  profile_picture_url?: string;
  created_at: string;
  updated_at: string;
  // Nouveaux champs pour migration
  sector?: string;
  email?: string;
  telephone?: string;
  interests?: string;
  historic?: string;
  follow_up?: string;
  date_creation?: string;
  date_modification?: string;
  // Relations
  experiences?: Experience[];
  languages?: ContactLanguage[];
  skills?: ContactSkill[];
  interests_list?: ContactInterest[];
  experience_count?: number;
  companies?: string;
}

export interface Company {
  id: number;
  company_id?: number;
  company_name: string;
  company_description?: string;
  company_industry?: string;
  company_subindustry?: string;
  company_size?: string;
  company_website_url?: string;
  headquarters_city?: string;
  headquarters_country?: string;
  employee_count?: number;
  revenue_bucket?: string;
  company_type?: string;
  created_at: string;
  updated_at: string;
  // Relations
  contacts?: Contact[];
  contact_count?: number;
}

export interface Experience {
  id: number;
  contact_id: number;
  company_id: number;
  title?: string;
  title_normalized?: string;
  department?: string;
  date_from?: string;
  date_to?: string;
  duration?: string;
  description?: string;
  location?: string;
  is_current: boolean;
  order_in_profile?: number;
  created_at: string;
  // Nouveaux champs
  job_category?: string;
  // Relations
  company_name?: string;
  company_industry?: string;
  company_size?: string;
  company_description?: string;
  company_subindustry?: string;
  company_website_url?: string;
  headquarters_city?: string;
  headquarters_country?: string;
  employee_count?: number;
  revenue_bucket?: string;
  company_type?: string;
}

export interface ContactLanguage {
  id: number;
  contact_id: number;
  language?: string;
  proficiency?: string;
  order_in_profile?: number;
  created_at: string;
}

export interface ContactSkill {
  id: number;
  contact_id: number;
  skill_name?: string;
  order_in_profile?: number;
  created_at: string;
}

export interface ContactInterest {
  id: number;
  contact_id: number;
  interest_name?: string;
  order_in_profile?: number;
  created_at: string;
}

export interface FollowUpStage {
  id: number;
  stage_name: string;
  stage_order?: number;
  color: string;
  description?: string;
  created_at: string;
}

export interface ContactNote {
  id: number;
  contact_id: number;
  note_content: string;
  note_type: string;
  created_at: string;
  updated_at: string;
}

// =====================================================
// TYPES POUR L'ANCIEN SCHÉMA (COMPATIBILITÉ)
// =====================================================

export interface Prospect {
  id: number;
  nom_complet: string;
  entreprise?: string;
  categorie_poste?: string;
  poste_specifique?: string;
  pays?: string;
  taille_entreprise?: string;
  site_web?: string;
  secteur?: string;
  email?: string;
  telephone?: string;
  linkedin?: string;
  interets?: string;
  historique?: string;
  etape_suivi?: 'à contacter' | 'linkedin envoyé' | 'email envoyé' | 'call effectué' | 'entretien 1' | 'entretien 2' | 'entretien 3' | 'OK' | 'KO';
  date_creation?: string;
  date_modification?: string;
}

export interface CreateProspectData {
  nom_complet: string;
  entreprise?: string;
  categorie_poste?: string;
  poste_specifique?: string;
  pays?: string;
  taille_entreprise?: string;
  site_web?: string;
  secteur?: string;
  email?: string;
  telephone?: string;
  linkedin?: string;
  interets?: string;
  historique?: string;
  etape_suivi?: string;
}

export interface UpdateProspectData extends Partial<CreateProspectData> {
  id: number;
}

// Types pour les données de référence
export interface CategoriePoste {
  id: number;
  nom: string;
  actif: boolean;
}

export interface TailleEntreprise {
  id: number;
  nom: string;
  actif: boolean;
}

export interface Secteur {
  id: number;
  nom: string;
  actif: boolean;
}

export interface Pays {
  id: number;
  nom: string;
  actif: boolean;
}
