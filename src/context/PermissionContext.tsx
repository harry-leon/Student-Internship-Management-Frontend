import React from 'react';
import { useAuth } from './AuthContext';

export interface PermissionsContextState {
  userId?: number;
  username?: string;
  roles: string[];
  permissions: string[];
  featureFlags: string[];
  hasPermission: (permissionCode: string) => boolean;
  hasAnyPermission: (permissionCodes: string[]) => boolean;
  hasAllPermissions: (permissionCodes: string[]) => boolean;
  reloadPermissions: () => Promise<void>;
  isFeatureEnabled: (featureCode: string) => boolean;
  can: (permissionCode: string) => boolean;
}

export const usePermissions = (): PermissionsContextState => {
  const {
    user,
    roles,
    permissions,
    featureFlags,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    reloadPermissions,
    isFeatureEnabled,
    can,
  } = useAuth();

  return {
    userId: user?.userId,
    username: user?.username,
    roles,
    permissions,
    featureFlags,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    reloadPermissions,
    isFeatureEnabled,
    can,
  };
};

export const PermissionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <>{children}</>;
};
