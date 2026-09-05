import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService, UserResponse, LoginRequest } from '../api/authService';
import { capabilityService, UserCapabilityResponse } from '../api/capabilityService';
import { getStoredToken } from '../api/apiClient';
import { canAccessPage as checkPageAccess } from '../auth/roleAccess';
import { NavPage, Role } from '../types';

interface AuthContextType {
  user: UserResponse | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isBackendConnected: boolean;
  capabilities: UserCapabilityResponse | null;
  can: (permissionCode: string) => boolean;
  isFeatureEnabled: (featureCode: string) => boolean;
  hasFeature: (featureCode: string) => boolean;
  canAccessPage: (pageId: any) => boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  reloadCapabilities: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [token, setToken] = useState<string | null>(getStoredToken());
  const [capabilities, setCapabilities] = useState<UserCapabilityResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isBackendConnected, setIsBackendConnected] = useState<boolean>(false);

  const fetchCapabilitiesSafely = async (): Promise<UserCapabilityResponse | null> => {
    try {
      const caps = await capabilityService.fetchMyCapabilities();
      setCapabilities(caps);
      return caps;
    } catch {
      return null;
    }
  };

  const checkAuth = async () => {
    const currentToken = getStoredToken();
    if (!currentToken) {
      setUser(null);
      setToken(null);
      setCapabilities(null);
      setIsLoading(false);
      return;
    }

    try {
      const userData = await authService.getCurrentUser();
      setUser(userData);
      setToken(currentToken);
      setIsBackendConnected(true);
      await fetchCapabilitiesSafely();
    } catch (err) {
      console.warn('Auth check failed or token invalid:', err);
      // If token is invalid or expired, clear it cleanly
      await authService.logout();
      setUser(null);
      setToken(null);
      setCapabilities(null);
      setIsBackendConnected(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();

    const handleUnauthorized = () => {
      setUser(null);
      setToken(null);
      setCapabilities(null);
      setIsBackendConnected(false);
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, []);

  const login = async (credentials: LoginRequest) => {
    setIsLoading(true);
    try {
      const response = await authService.login(credentials);
      setToken(response.token);
      setIsBackendConnected(true);
      
      // Fetch full user details and capabilities
      try {
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);
      } catch {
        setUser({
          userId: 1,
          username: response.username,
          fullName: response.fullName,
          email: `${response.username}@fpt.edu.vn`,
          role: response.role,
          isActive: true,
        });
      }
      await fetchCapabilitiesSafely();
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } finally {
      setUser(null);
      setToken(null);
      setCapabilities(null);
      setIsBackendConnected(false);
    }
  };

  const reloadCapabilities = async () => {
    await fetchCapabilitiesSafely();
  };

  const can = useCallback((permissionCode: string): boolean => {
    if (!user) return false;
    // Admin has all permissions as fallback
    if (user.role === 'Admin') {
      if (capabilities && capabilities.permissions.length > 0) {
        return capabilities.permissions.includes(permissionCode);
      }
      return true;
    }
    if (!capabilities || !capabilities.permissions) {
      return false;
    }
    return capabilities.permissions.includes(permissionCode);
  }, [user, capabilities]);

  const isFeatureEnabled = useCallback((featureCode: string): boolean => {
    if (!capabilities || !capabilities.features) {
      return true; // Default enabled
    }
    return capabilities.features.includes(featureCode);
  }, [capabilities]);

  const hasFeature = isFeatureEnabled;

  const canAccessPageHelper = useCallback((pageId: NavPage): boolean => {
    if (!user?.role) return false;
    return checkPageAccess(user.role as Role, pageId, can, isFeatureEnabled);
  }, [user, can, isFeatureEnabled]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        isLoading,
        isBackendConnected,
        capabilities,
        can,
        isFeatureEnabled,
        hasFeature,
        canAccessPage: canAccessPageHelper,
        login,
        logout,
        checkAuth,
        reloadCapabilities,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
