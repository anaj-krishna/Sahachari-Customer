import { User, Role } from './user';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  address: string;
  address2?: string;
  mobileNumber?: string;
  serviceablePincodes: string[];
  password: string;
  role: Role.USER;
}

export interface AuthResponse {
  accessToken: string;
  user?: User;
}
