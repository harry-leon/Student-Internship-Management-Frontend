import { api, setStoredToken, removeStoredToken } from './apiClient';
import { Role } from '../types';
import { normalizeRole } from '../auth/roles';

export interface LoginRequest {
  username: string;
  password?: string;
}

export interface LoginResponse {
  username: string;
  fullName: string;
  tokenType: string;
  token: string;
  role: Role;
}

export interface UserResponse {
  userId: number;
  username: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  avatarUrl?: string;
  authProvider?: string;
  role: Role;
  isActive: boolean;
}

export const authService = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const data = await api.post<LoginResponse>('/api/auth/login', credentials);
    if (data.token) {
      setStoredToken(data.token);
    }
    return {
      ...data,
      role: normalizeRole(data.role),
    };
  },

  loginWithOAuth2: async (email: string, name?: string, providerId?: string): Promise<LoginResponse> => {
    const data = await api.post<LoginResponse>('/api/auth/oauth2/exchange', {
      email,
      name,
      providerId,
      provider: 'GOOGLE',
    });
    if (data.token) {
      setStoredToken(data.token);
    }
    return {
      ...data,
      role: normalizeRole(data.role),
    };
  },

  getCurrentUser: async (): Promise<UserResponse> => {
    const data = await api.get<UserResponse>('/api/auth/me');
    return {
      ...data,
      role: normalizeRole(data.role),
    };
  },

  uploadMyAvatar: async (file: File): Promise<UserResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    const data = await api.post<UserResponse>('/api/users/me/avatar', formData);
    return {
      ...data,
      role: normalizeRole(data.role),
    };
  },

  deleteMyAvatar: async (): Promise<UserResponse> => {
    const data = await api.delete<UserResponse>('/api/users/me/avatar');
    return {
      ...data,
      role: normalizeRole(data.role),
    };
  },

  logout: async (): Promise<void> => {
    try {
      await api.post<void>('/api/auth/logout');
    } finally {
      removeStoredToken();
    }
  },
};
