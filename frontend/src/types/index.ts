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
  mx_record_exists?: boolean;
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
  mx_record_exists?: boolean;
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
