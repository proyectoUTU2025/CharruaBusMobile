import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useRef
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState, AppStateStatus } from 'react-native';
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
  const heartbeatInterval = useRef<NodeJS.Timeout | null>(null);

  const login = async (email: string, password: string) => {
    setError(null);
    setLoading(true);
    
    try {
      const newToken = await loginService(email, password);
      await AsyncStorage.setItem('authToken', newToken);
      await AsyncStorage.setItem('appHeartbeat', Date.now().toString());
      await AsyncStorage.setItem('sessionActive', 'true');
      setToken(newToken);
      
      startHeartbeat();
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
      
      stopHeartbeat();
      
      await logoutService(token || undefined);
      
      await AsyncStorage.multiRemove(['authToken', 'sessionActive', 'appHeartbeat']);
      
      setToken(null);
      setError(null);
      
    } catch (error) {
      console.error('Error en logout:', error);
      try {
        await AsyncStorage.multiRemove(['authToken', 'sessionActive', 'appHeartbeat']);
      } catch (removeError) {
        console.error('Error removiendo datos después de fallo:', removeError);
      }
      setToken(null);
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  const startHeartbeat = () => {
    stopHeartbeat();
    
    heartbeatInterval.current = setInterval(async () => {
      try {
        if (AppState.currentState === 'active') {
          await AsyncStorage.setItem('appHeartbeat', Date.now().toString());
        }
      } catch (error) {
        console.error('Error en heartbeat:', error);
      }
    }, 5000);
  };

  const stopHeartbeat = () => {
    if (heartbeatInterval.current) {
      clearInterval(heartbeatInterval.current);
      heartbeatInterval.current = null;
    }
  };

  const checkToken = async () => {
    try {
      
      const storedToken = await AsyncStorage.getItem('authToken');
      const sessionActive = await AsyncStorage.getItem('sessionActive');
      const lastHeartbeat = await AsyncStorage.getItem('appHeartbeat');
      
      if (storedToken && sessionActive === 'true') {
        if (lastHeartbeat) {
          const lastTime = parseInt(lastHeartbeat);
          const timeSinceHeartbeat = Date.now() - lastTime;
          
          if (timeSinceHeartbeat > 15000) {
            await AsyncStorage.multiRemove(['authToken', 'sessionActive', 'appHeartbeat']);
            setToken(null);
            setIsAuthLoading(false);
            return;
          }
        }
        
        setToken(storedToken);
        startHeartbeat();
      } else {
        await AsyncStorage.multiRemove(['authToken', 'sessionActive', 'appHeartbeat']);
        setToken(null);
      }
    } catch (error) {
      console.error('Error verificando token almacenado:', error);
      try {
        await AsyncStorage.multiRemove(['authToken', 'sessionActive', 'appHeartbeat']);
      } catch (removeError) {
        console.error('Error removiendo token corrupto:', removeError);
      }
      setToken(null);
    } finally {
      setIsAuthLoading(false);
    }
  };

  useEffect(() => {
    const handleAppStateChange = async (nextAppState: AppStateStatus) => {
      if (nextAppState === 'background') {
        stopHeartbeat();
      } else if (nextAppState === 'active') {
        if (token) {
          startHeartbeat();
        }
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription?.remove();
      stopHeartbeat();
      
      if (token) {
        logoutService(token).catch(error => {
          console.error('Error en logout durante cierre:', error);
        });
        
        AsyncStorage.multiRemove(['authToken', 'sessionActive', 'appHeartbeat']).catch(error => {
          console.error('Error limpiando storage durante cierre:', error);
        });
      }
    };
  }, [token]);

  useEffect(() => {
    return () => {
      stopHeartbeat();
    };
  }, []);

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