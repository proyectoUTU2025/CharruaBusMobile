import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { login as loginService, logout as logoutService } from '../services/authService';

type AuthContextType = {
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  token: string | null;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);

  const login = async (email: string, password: string) => {
    const newToken = await loginService(email, password);
    await AsyncStorage.setItem('authToken', newToken);
    setToken(newToken);
  };

  const logout = async () => {
    await logoutService();
    await AsyncStorage.removeItem('authToken');
    setToken(null);
  };

  const checkToken = async () => {
    const storedToken = await AsyncStorage.getItem('authToken');
    if (storedToken) {
      setToken(storedToken);
    }
  };

  useEffect(() => {
    checkToken();
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated: !!token, login, logout, token }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
};