// src/types.ts

export interface Plan {
  id: number;
  title: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed';
  category?: string;
  due_date?: string;
  is_public: boolean;
  created_at?: string;
}

export interface AuthResponse {
  token: string;
  username: string;
}