import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useRef
} from 'react';
import * as Keychain from 'react-native-keychain';
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

const KEYCHAIN_SERVICE = 'com.charruabusmobile.auth';
const KEYCHAIN_OPTIONS: Keychain.Options = {
  service: KEYCHAIN_SERVICE,
  accessControl: Keychain.ACCESS_CONTROL.BIOMETRY_ANY_OR_DEVICE_PASSCODE,
  authenticationPrompt: 'Autentícate para acceder a tu sesión',
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const heartbeatInterval = useRef<NodeJS.Timeout | null>(null);

  const saveTokenSecurely = async (authToken: string) => {
    try {
      await Keychain.setInternetCredentials(
        KEYCHAIN_SERVICE,
        'authToken',
        authToken,
        KEYCHAIN_OPTIONS
      );
      
      await AsyncStorage.setItem('appHeartbeat', Date.now().toString());
      await AsyncStorage.setItem('sessionActive', 'true');
      await AsyncStorage.setItem('hasSecureToken', 'true');
      await AsyncStorage.setItem('keychainMethod', 'biometric');
      
    } catch (error) {
      console.error('Error guardando con biometría:', error);
      
      try {
        await Keychain.setInternetCredentials(
          KEYCHAIN_SERVICE,
          'authToken',
          authToken,
          {
            service: KEYCHAIN_SERVICE,
            accessControl: Keychain.ACCESS_CONTROL.DEVICE_PASSCODE,
          }
        );
        
        await AsyncStorage.setItem('appHeartbeat', Date.now().toString());
        await AsyncStorage.setItem('sessionActive', 'true');
        await AsyncStorage.setItem('hasSecureToken', 'true');
        await AsyncStorage.setItem('keychainMethod', 'passcode');
        
      } catch (fallbackError) {
        console.error('Error guardando con passcode:', fallbackError);
        
        await AsyncStorage.setItem('authToken', authToken);
        await AsyncStorage.setItem('appHeartbeat', Date.now().toString());
        await AsyncStorage.setItem('sessionActive', 'true');
        await AsyncStorage.setItem('keychainMethod', 'asyncstorage');
        console.warn('Token guardado en AsyncStorage como último fallback');
      }
    }
  };

  const getTokenSecurely = async (): Promise<string | null> => {
    try {
      const keychainMethod = await AsyncStorage.getItem('keychainMethod');
      
      if (keychainMethod === 'asyncstorage') {
        const fallbackToken = await AsyncStorage.getItem('authToken');
        if (fallbackToken) {
          console.warn('Token obtenido desde AsyncStorage');
          return fallbackToken;
        }
        return null;
      }
      
      const credentials = await Keychain.getInternetCredentials(KEYCHAIN_SERVICE);
      
      if (credentials && typeof credentials !== 'boolean' && credentials.password) {
        return credentials.password;
      }
      
      const fallbackToken = await AsyncStorage.getItem('authToken');
      if (fallbackToken) {
        console.warn('Token obtenido desde AsyncStorage como fallback');
        return fallbackToken;
      }
      
      return null;
    } catch (error) {
      console.error('Error obteniendo token de Keychain:', error);
      
      try {
        const fallbackToken = await AsyncStorage.getItem('authToken');
        if (fallbackToken) {
          console.warn('Token obtenido desde AsyncStorage tras error');
          return fallbackToken;
        }
      } catch (fallbackError) {
        console.error('Error en fallback:', fallbackError);
      }
      
      return null;
    }
  };

  const removeTokenSecurely = async () => {
    try {
      await Keychain.resetInternetCredentials(KEYCHAIN_SERVICE);
    } catch (error) {
      console.error('Error eliminando token de Keychain:', error);
    }
    
    try {
      await AsyncStorage.multiRemove([
        'authToken',
        'sessionActive', 
        'appHeartbeat', 
        'hasSecureToken',
        'keychainMethod'
      ]);
    } catch (error) {
      console.error('Error eliminando datos de AsyncStorage:', error);
    }
  };

  const login = async (email: string, password: string) => {
    setError(null);
    setLoading(true);
    
    try {
      const newToken = await loginService(email, password);
      
      await saveTokenSecurely(newToken);
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
      
      const currentToken = token || await getTokenSecurely();
      await logoutService(currentToken || undefined);
      
      await removeTokenSecurely();
      setToken(null);
      setError(null);
      
    } catch (error) {
      console.error('Error en logout:', error);
      try {
        await removeTokenSecurely();
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
      const hasSecureToken = await AsyncStorage.getItem('hasSecureToken');
      const sessionActive = await AsyncStorage.getItem('sessionActive');
      const lastHeartbeat = await AsyncStorage.getItem('appHeartbeat');
      
      const hasAnyToken = hasSecureToken === 'true' || await AsyncStorage.getItem('authToken');
      
      if (hasAnyToken && sessionActive === 'true') {
        if (lastHeartbeat) {
          const lastTime = parseInt(lastHeartbeat);
          const timeSinceHeartbeat = Date.now() - lastTime;
          
          if (timeSinceHeartbeat > 15000) {
            await removeTokenSecurely();
            setToken(null);
            setIsAuthLoading(false);
            return;
          }
        }
        
        const storedToken = await getTokenSecurely();
        if (storedToken) {
          setToken(storedToken);
          startHeartbeat();
        } else {
          await removeTokenSecurely();
          setToken(null);
        }
      } else {
        await removeTokenSecurely();
        setToken(null);
      }
    } catch (error) {
      console.error('Error verificando token almacenado:', error);
      try {
        await removeTokenSecurely();
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
        
        removeTokenSecurely().catch(error => {
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