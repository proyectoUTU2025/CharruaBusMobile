import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode
} from 'react';
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
  isAuthLoading: boolean;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const login = async (email: string, password: string) => {
    setError(null);
    setLoading(true);
    
    try {
      const newToken = await loginService(email, password);
      await AsyncStorage.setItem('authToken', newToken);
      setToken(newToken);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error en login';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await logoutService(token || undefined);
      await AsyncStorage.removeItem('authToken');
      setToken(null);
      setError(null);
    } catch (error) {
      console.error('Error en logout real:', error);
      // En caso de error, limpiamos el token de todos modos
      try {
        await AsyncStorage.removeItem('authToken');
      } catch (removeError) {
        console.error('Error removiendo token después de fallo:', removeError);
      }
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
      const storedToken = await AsyncStorage.getItem('authToken');
      if (storedToken) {
        setToken(storedToken);
      }
    } catch (error) {
      console.error('Error checking stored token:', error);
      // En caso de error, limpiamos cualquier token corrupto
      try {
        await AsyncStorage.removeItem('authToken');
      } catch (removeError) {
        console.error('Error removing corrupted token:', removeError);
      }
    } finally {
      setIsAuthLoading(false);
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
        clearError,
        isAuthLoading
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
};