// src/types.ts

export interface Plan {
  id: number;
  title: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed';
  category?: string;
  priority: number; // <--- 新增 (0: 无, 1: 低, 2: 中, 3: 高)
  due_date?: string;
  is_public: boolean;
  created_at?: string;
}

export interface AuthResponse {
  token: string;
  username: string;
}