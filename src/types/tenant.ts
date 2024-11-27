// src/types/tenant.ts
export interface TenantSettings {
  theme: string;
  logo?: string;
  primaryColor?: string;
  secondaryColor?: string;
}

export interface TenantModule {
  name: string;
  isActive: boolean;
  settings?: Record<string, any>;
}

export interface TenantData {
  name: string;
  code: string;
  domain?: string;
  status: 'active' | 'inactive' | 'suspended';
  settings: TenantSettings;
  modules: TenantModule[];
}