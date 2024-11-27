// src/types/auth.ts

export interface IAuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface IRefreshTokenPayload {
  id: string;
  tokenVersion: number;
}

export interface IAuthResponse {
  success: boolean;
  tokens?: IAuthTokens;
  user?: {
    id: string;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    tenantId: string;
  };
  message?: string;
}