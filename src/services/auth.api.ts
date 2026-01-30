import { api } from './api';
import { LoginRequest, RegisterRequest, AuthResponse } from '../types/auth';

export const loginApi = async (data: LoginRequest): Promise<AuthResponse> => {
  const res = await api.post<AuthResponse>('/auth/login', data);
  return res.data;
};

export const registerApi = async (data: RegisterRequest): Promise<AuthResponse> => {
  const res = await api.post<AuthResponse>('/auth/register', data);
  return res.data;
};
