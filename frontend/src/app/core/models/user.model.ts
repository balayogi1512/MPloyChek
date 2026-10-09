export type UserRole = 'Admin' | 'General User';

export interface User {
  id: string;
  userId: string;
  username?: string;
  name: string;
  role: UserRole;
  department: string;
  email: string;
  createdAt: string;
}

export interface LoginCredentials {
  userId: string;
  password: string;
  role: UserRole;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  user?: User;
  token?: string;
}
