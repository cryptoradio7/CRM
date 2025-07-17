export interface Prospect {
  id?: number;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  status: 'new' | 'contacted' | 'qualified' | 'proposal' | 'won' | 'lost';
  created_at?: string;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  error?: string;
} 