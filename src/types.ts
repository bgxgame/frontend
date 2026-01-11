// src/types.ts

export interface Project {
  id: number;
  user_id: number;
  name: string;
  description?: string;
  status: 'active' | 'completed' | 'backlog' | 'paused' | 'canceled';
  color: string;
  created_at: string;
  updated_at: string;
}

export interface Issue {
  id: number;
  project_id: number;
  user_id: number;
  title: string;
  description?: string;
  status: 'backlog' | 'todo' | 'in_progress' | 'done' | 'canceled';
  priority: number; // 0-4
  due_date?: string;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  token: string;
  username: string;
}

export interface Comment {
  id: number;
  issue_id: number;
  user_id: number;
  username: string;
  content: string;
  created_at: string;
}