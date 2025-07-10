import React, { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { User } from '../types/auth';
import { UserRole } from '../types/auth';
import { authService } from '../services/authService';

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: UserRole;
  }) => Promise<User>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => Promise<void>;
  hasRole: (role: UserRole) => boolean;
  hasAnyRole: (roles: UserRole[]) => boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = authService.getToken();
        const savedUser = authService.getCurrentUser();

        if (token && savedUser) {
          // Verify the token is still valid by fetching current user profile
          try {
            const currentUser = await authService.getProfile();
            setUser(currentUser);
          } catch (error) {
            // Token is invalid, clear storage
            await authService.logout();
            setUser(null);
          }
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Failed to initialize auth:', error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    setIsLoading(true);
    try {
      const response = await authService.login({ email, password });
      setUser(response.user);
      return response.user;
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: UserRole;
  }): Promise<User> => {
    setIsLoading(true);
    try {
      const response = await authService.register(userData);
      setUser(response.user);
      return response.user;
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    console.log('AuthContext: Starting logout...');
    setIsLoading(true);
    try {
      await authService.logout();
      console.log('AuthContext: authService.logout() completed');
      setUser(null);
      console.log('AuthContext: User state cleared');
    } catch (error) {
      console.error('AuthContext: Logout error:', error);
    } finally {
      setIsLoading(false);
      console.log('AuthContext: Logout process finished');
    }
  };

  const updateUser = async (userData: Partial<User>) => {
    try {
      const updatedUser = await authService.updateProfile(userData);
      setUser(updatedUser);
    } catch (error) {
      throw error;
    }
  };

  const hasRole = (role: UserRole): boolean => {
    return user?.role === role;
  };

  const hasAnyRole = (roles: UserRole[]): boolean => {
    return user ? roles.includes(user.role) : false;
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    updateUser,
    hasRole,
    hasAnyRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

