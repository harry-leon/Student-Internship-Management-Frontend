import { api } from './apiClient';

export interface UserCapabilityResponse {
  role: string;
  permissions: string[];
  features: string[];
}

export interface RoleDTO {
  roleId: number;
  roleCode: string;
  roleName: string;
  description?: string;
  isSystem: boolean;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface PermissionDTO {
  permissionId: number;
  permissionCode: string;
  moduleCode: string;
  actionCode: string;
  description?: string;
  isActive: boolean;
}

export interface SystemFeatureDTO {
  featureId: number;
  featureCode: string;
  moduleCode: string;
  featureName: string;
  description?: string;
  enabled: boolean;
  isRuntimeConfigurable: boolean;
}

export interface RoleFeatureDTO {
  featureCode: string;
  featureName: string;
  moduleCode: string;
  description?: string;
  enabled: boolean;
  defaultEnabled: boolean;
}

export const capabilityService = {
  fetchMyCapabilities: async (): Promise<UserCapabilityResponse> => {
    return api.get<UserCapabilityResponse>('/api/auth/me/capabilities');
  },

  fetchRoles: async (): Promise<RoleDTO[]> => {
    return api.get<RoleDTO[]>('/api/admin/roles');
  },

  fetchPermissions: async (): Promise<PermissionDTO[]> => {
    return api.get<PermissionDTO[]>('/api/admin/permissions');
  },

  fetchRolePermissions: async (roleCode: string): Promise<string[]> => {
    return api.get<string[]>(`/api/admin/roles/${roleCode}/permissions`);
  },

  updateRolePermissions: async (roleCode: string, permissions: string[]): Promise<void> => {
    return api.put<void>(`/api/admin/roles/${roleCode}/permissions`, { permissions });
  },

  fetchFeatures: async (): Promise<SystemFeatureDTO[]> => {
    return api.get<SystemFeatureDTO[]>('/api/admin/features');
  },

  fetchRoleFeatures: async (roleCode: string): Promise<RoleFeatureDTO[]> => {
    return api.get<RoleFeatureDTO[]>(`/api/admin/roles/${roleCode}/features`);
  },

  updateRoleFeatures: async (
    roleCode: string,
    features: { featureCode: string; enabled: boolean }[]
  ): Promise<void> => {
    return api.put<void>(`/api/admin/roles/${roleCode}/features`, { features });
  },
};
