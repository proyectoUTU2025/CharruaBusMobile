// AuthContext.tsx - agregando AsyncStorage gradualmente
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
// Vamos a probar importar los servicios
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
  console.log('AuthProvider con AsyncStorage renderizado');
  
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true); // Cambiado a true
  const [error, setError] = useState<string | null>(null);

  const login = async (email: string, password: string) => {
    console.log('Login con servicio real llamado');
    setError(null);
    setLoading(true);
    
    try {
      console.log('Llamando a loginService...');
      const newToken = await loginService(email, password);
      console.log('LoginService exitoso, guardando token...');
      await AsyncStorage.setItem('authToken', newToken);
      setToken(newToken);
      console.log('Token guardado y establecido exitosamente');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error en login';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    console.log('Logout con servicio real llamado');
    try {
      setLoading(true);
      console.log('Llamando a logoutService...');
      await logoutService(token || undefined);
      console.log('LogoutService exitoso, removiendo token...');
      await AsyncStorage.removeItem('authToken');
      setToken(null);
      setError(null);
      console.log('Logout completado exitosamente');
    } catch (error) {
      console.error('Error en logout real:', error);
      // En caso de error, limpiamos el token de todos modos
      console.log('Limpiando token a pesar del error...');
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
    console.log('checkToken iniciado');
    try {
      const storedToken = await AsyncStorage.getItem('authToken');
      console.log('Token almacenado encontrado:', storedToken ? 'Sí' : 'No');
      if (storedToken) {
        setToken(storedToken);
        console.log('Token establecido:', storedToken);
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
      console.log('checkToken finalizando, estableciendo isAuthLoading = false');
      setIsAuthLoading(false);
    }
  };

  useEffect(() => {
    console.log('useEffect de checkToken ejecutándose');
    checkToken();
  }, []);

  console.log('AuthProvider valores actuales:', {
    token: token ? 'existe' : 'null',
    isAuthenticated: !!token,
    isAuthLoading,
    loading,
    error
  });

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