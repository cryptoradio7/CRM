export interface Prospect {
  id: number;
  nom: string;
  prenom?: string;
  email?: string;
  telephone?: string;
  entreprise?: string;
  typeEntreprise?: string;
  role?: string;
  ville?: string;
  statut: string;
  linkedin?: string;
  interets?: string;
  historique?: string;
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
