// src/types/user.ts
export interface UserData {
  tenantId: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  status: 'active' | 'inactive' | 'suspended';
  lastLogin?: Date;
}

export interface UserCredentials {
  username: string;
  password: string;
  tenantCode: string;
}