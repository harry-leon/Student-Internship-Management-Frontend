import React from 'react';
import { useAuth } from '../context/AuthContext';
import { PermissionCodeType } from '../config/permissions.config';

export interface CanProps {
  permission?: PermissionCodeType | string;
  any?: (PermissionCodeType | string)[];
  all?: (PermissionCodeType | string)[];
  feature?: string;
  role?: string;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export const Can: React.FC<CanProps> = ({
  permission,
  any,
  all,
  feature,
  role,
  fallback = null,
  children,
}) => {
  const { can, hasAnyPermission, hasAllPermissions, isFeatureEnabled, user } = useAuth();

  // If role is specified and does not match, hide
  if (role && user?.role?.toUpperCase() !== role.toUpperCase()) {
    return <>{fallback}</>;
  }

  // If feature flag is specified and not enabled, hide
  if (feature && !isFeatureEnabled(feature)) {
    return <>{fallback}</>;
  }

  // Single permission check
  if (permission && !can(permission)) {
    return <>{fallback}</>;
  }

  // Any permission check
  if (any && any.length > 0 && !hasAnyPermission(any as string[])) {
    return <>{fallback}</>;
  }

  // All permissions check
  if (all && all.length > 0 && !hasAllPermissions(all as string[])) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};
