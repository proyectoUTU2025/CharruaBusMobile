import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { login as loginService, logout as logoutService } from '../services/authService';

type AuthContextType = {
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  token: string | null;
  loading: boolean;
  error: string | null;
  clearError: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const login = async (email: string, password: string) => {
    try {
      setError(null);
      setLoading(true);
      
      const newToken = await loginService(email, password);
      await AsyncStorage.setItem('authToken', newToken);
      setToken(newToken);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido al iniciar sesión';
      setError(errorMessage);
      throw error; //Vuelve a lanzarlo para que el componente pueda manejarlo también
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      //Pasa el token actual al servicio de logout
      await logoutService(token || undefined);
      await AsyncStorage.removeItem('authToken');
      setToken(null);
      setError(null);
    } catch (error) {
      console.error('Error during logout:', error);
      await AsyncStorage.removeItem('authToken');
      setToken(null);
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  const checkToken = async () => {
    try {
      setLoading(true);
      const storedToken = await AsyncStorage.getItem('authToken');
      if (storedToken) {
        setToken(storedToken);
      }
    } catch (error) {
      console.error('Error checking stored token:', error);
      await AsyncStorage.removeItem('authToken');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkToken();
  }, []);

  return (
    <AuthContext.Provider 
      value={{ 
        isAuthenticated: !!token, 
        login, 
        logout, 
        token, 
        loading, 
        error, 
        clearError 
      }}
    >
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