import { api } from './api';
import { LoginRequest, RegisterRequest, AuthResponse } from '../types/auth';
import { User } from '../types/user';

export const loginApi = async (data: LoginRequest): Promise<AuthResponse> => {
  const res = await api.post<AuthResponse>('/auth/login', data);
  return res.data;
};

export const registerApi = async (data: RegisterRequest): Promise<AuthResponse> => {
  const res = await api.post<AuthResponse>('/auth/register', data);
  return res.data;
};

// Fetch the current authenticated user (uses the provided token if given)
export const getProfile = async (token?: string): Promise<User> => {
  if (token) {
    const res = await api.get<User>('/users/me', {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  }
  const res = await api.get<User>('/auth/me');
  return res.data;
};
