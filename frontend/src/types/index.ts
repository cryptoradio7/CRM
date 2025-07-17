export interface Prospect {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  entreprise: string;
  type_entreprise: string;
  role: string;
  ville: string;
  region: string;
  statut: 'Prospects' | 'Clients' | 'N/A';
  linkedin: string;
  interets: string;
  historique: string;
  etape_suivi: 'à contacter' | 'linkedin envoyé' | 'email envoyé' | 'call effectué' | 'entretien 1' | 'entretien 2' | 'entretien 3' | 'OK' | 'KO';
  date_creation: string;
}

export interface CreateProspectData {
  nom: string;
  prenom?: string;
  email?: string;
  telephone?: string;
  entreprise?: string;
  role?: string;
  ville?: string;
  statut?: string;
  linkedin?: string;
  interets?: string;
  historique?: string;
}

export interface UpdateProspectData extends Partial<CreateProspectData> {
  id: number;
}
