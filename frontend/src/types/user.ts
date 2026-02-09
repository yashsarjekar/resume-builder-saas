export interface User {
  id: number;
  email: string;
  name: string;
  subscription_type: 'free' | 'starter' | 'pro';
  resume_count: number;
  ats_analysis_count: number;
  created_at: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface SignupData {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}
