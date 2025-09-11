// =====================================================
// SERVICE API POUR LE CRM V2
// =====================================================

const API_BASE_URL = 'http://localhost:3003/api';

// =====================================================
// TYPES POUR LES RÉPONSES API
// =====================================================

interface PaginatedResponse<T> {
  [key: string]: T[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

interface SearchResponse<T> extends PaginatedResponse<T> {
  searchTerm: string;
}

// =====================================================
// API CONTACTS
// =====================================================

export const contactsApi = {
  // Récupérer tous les contacts avec pagination
  async getAll(page: number = 1, limit: number = 20) {
    const response = await fetch(`${API_BASE_URL}/contacts?page=${page}&limit=${limit}`);
    if (!response.ok) throw new Error('Erreur lors du chargement des contacts');
    return response.json() as Promise<PaginatedResponse<any>>;
  },

  // Récupérer un contact par ID
  async getById(id: number) {
    const response = await fetch(`${API_BASE_URL}/contacts/${id}`);
    if (!response.ok) throw new Error('Contact non trouvé');
    return response.json() as Promise<any>;
  },

  // Rechercher des contacts
  async search(query: string, page: number = 1, limit: number = 20) {
    const response = await fetch(`${API_BASE_URL}/contacts/search?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`);
    if (!response.ok) throw new Error('Erreur lors de la recherche');
    return response.json() as Promise<SearchResponse<any>>;
  },

  // Récupérer les notes d'un contact
  async getNotes(contactId: number) {
    const response = await fetch(`${API_BASE_URL}/contacts/${contactId}/notes`);
    if (!response.ok) throw new Error('Erreur lors du chargement des notes');
    return response.json() as Promise<{ notes: any[] }>;
  },

  // Créer une note
  async createNote(contactId: number, noteContent: string, noteType: string = 'general') {
    const response = await fetch(`${API_BASE_URL}/contacts/${contactId}/notes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ note_content: noteContent, note_type: noteType })
    });
    if (!response.ok) throw new Error('Erreur lors de la création de la note');
    return response.json() as Promise<{ note: any }>;
  },

  // Modifier une note
  async updateNote(noteId: number, noteContent: string, noteType: string) {
    const response = await fetch(`${API_BASE_URL}/notes/${noteId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ note_content: noteContent, note_type: noteType })
    });
    if (!response.ok) throw new Error('Erreur lors de la modification de la note');
    return response.json() as Promise<{ note: any }>;
  },

  // Supprimer une note
  async deleteNote(noteId: number) {
    const response = await fetch(`${API_BASE_URL}/notes/${noteId}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Erreur lors de la suppression de la note');
    return response.json() as Promise<{ message: string }>;
  }
};

// =====================================================
// API ENTREPRISES
// =====================================================

export const companiesApi = {
  // Récupérer toutes les entreprises avec pagination
  async getAll(page: number = 1, limit: number = 20) {
    const response = await fetch(`${API_BASE_URL}/companies?page=${page}&limit=${limit}`);
    if (!response.ok) throw new Error('Erreur lors du chargement des entreprises');
    return response.json() as Promise<PaginatedResponse<any>>;
  },

  // Récupérer une entreprise par ID
  async getById(id: number) {
    const response = await fetch(`${API_BASE_URL}/companies/${id}`);
    if (!response.ok) throw new Error('Entreprise non trouvée');
    return response.json() as Promise<any>;
  },

  // Rechercher des entreprises
  async search(query: string, page: number = 1, limit: number = 20) {
    const response = await fetch(`${API_BASE_URL}/companies/search?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`);
    if (!response.ok) throw new Error('Erreur lors de la recherche d\'entreprises');
    return response.json() as Promise<SearchResponse<any>>;
  }
};

// =====================================================
// API ÉTAPES DE SUIVI
// =====================================================

export const followUpStagesApi = {
  // Récupérer toutes les étapes
  async getAll() {
    const response = await fetch(`${API_BASE_URL}/follow-up-stages`);
    if (!response.ok) throw new Error('Erreur lors du chargement des étapes');
    return response.json() as Promise<{ stages: any[] }>;
  },

  // Créer une étape
  async create(stageName: string, stageOrder: number, color: string = '#4CAF50', description?: string) {
    const response = await fetch(`${API_BASE_URL}/follow-up-stages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stage_name: stageName, stage_order: stageOrder, color, description })
    });
    if (!response.ok) throw new Error('Erreur lors de la création de l\'étape');
    return response.json() as Promise<{ stage: any }>;
  },

  // Modifier une étape
  async update(id: number, stageName: string, stageOrder: number, color: string, description?: string) {
    const response = await fetch(`${API_BASE_URL}/follow-up-stages/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stage_name: stageName, stage_order: stageOrder, color, description })
    });
    if (!response.ok) throw new Error('Erreur lors de la modification de l\'étape');
    return response.json() as Promise<{ stage: any }>;
  },

  // Supprimer une étape
  async delete(id: number) {
    const response = await fetch(`${API_BASE_URL}/follow-up-stages/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Erreur lors de la suppression de l\'étape');
    return response.json() as Promise<{ message: string }>;
  }
};

// =====================================================
// API PROSPECTS (ANCIEN SCHÉMA - COMPATIBILITÉ)
// =====================================================

export const prospectsApi = {
  // Récupérer tous les prospects (ancien système)
  async getAll() {
    const response = await fetch(`${API_BASE_URL}/prospects`);
    if (!response.ok) throw new Error('Erreur lors du chargement des prospects');
    return response.json() as Promise<any[]>;
  },

  // Récupérer un prospect par ID
  async getById(id: number) {
    const response = await fetch(`${API_BASE_URL}/prospects/${id}`);
    if (!response.ok) throw new Error('Prospect non trouvé');
    return response.json() as Promise<any>;
  },

  // Créer un prospect
  async create(data: any) {
    const response = await fetch(`${API_BASE_URL}/prospects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Erreur lors de la création du prospect');
    return response.json() as Promise<any>;
  },

  // Modifier un prospect
  async update(id: number, data: any) {
    const response = await fetch(`${API_BASE_URL}/prospects/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Erreur lors de la modification du prospect');
    return response.json() as Promise<any>;
  },

  // Supprimer un prospect
  async delete(id: number) {
    const response = await fetch(`${API_BASE_URL}/prospects/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Erreur lors de la suppression du prospect');
    return response.json() as Promise<{ message: string }>;
  },

  // Filtrer les prospects
  async filter(filters: any) {
    const response = await fetch(`${API_BASE_URL}/prospects/filter`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(filters)
    });
    if (!response.ok) throw new Error('Erreur lors du filtrage');
    return response.json() as Promise<any>;
  }
};

// =====================================================
// EXPORT PAR DÉFAUT
// =====================================================

export default {
  contacts: contactsApi,
  companies: companiesApi,
  followUpStages: followUpStagesApi,
  prospects: prospectsApi
};
