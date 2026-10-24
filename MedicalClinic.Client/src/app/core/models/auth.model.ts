export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  gender?: number;
  dateOfBirth?: string;
  address?: string;
}

export interface AuthResponse {
  id: string;
  email: string | null;
  firstName: string;
  lastName: string;
  token: string;
  expiresIn: number;
  refreshToken: string;
  refreshTokenExpiration: string;
}

export interface CurrentUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
}
