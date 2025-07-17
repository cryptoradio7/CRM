import axios from 'axios';
import { Prospect, ApiResponse } from '../types';

const API_BASE_URL = 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const prospectsApi = {
  // Récupérer tous les prospects
  getAll: async (): Promise<Prospect[]> => {
    const response = await api.get<Prospect[]>('/prospects');
    return response.data;
  },

  // Créer un nouveau prospect
  create: async (prospect: Omit<Prospect, 'id' | 'created_at'>): Promise<Prospect> => {
    const response = await api.post<Prospect>('/prospects', prospect);
    return response.data;
  },

  // Mettre à jour un prospect
  update: async (id: number, prospect: Partial<Prospect>): Promise<Prospect> => {
    const response = await api.put<Prospect>(`/prospects/${id}`, prospect);
    return response.data;
  },

  // Supprimer un prospect
  delete: async (id: number): Promise<void> => {
    await api.delete(`/prospects/${id}`);
  },
};

export default api; 