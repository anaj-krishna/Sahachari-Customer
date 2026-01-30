import { User, Role } from './user';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  shopAddress: string;
  serviceablePincodes: string[];
  password: string;
  role: Role.USER;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}
