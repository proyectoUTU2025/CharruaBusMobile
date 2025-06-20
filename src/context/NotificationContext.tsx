// NotificationContext.tsx
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useCallback,
  useRef
} from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { useAuth } from './AuthContext';
import { useUser } from '../hooks/useUser';
import {
  NotificationItem,
  getNotifications,
  getUnreadNotificationsCount,
  markAllNotificationsAsRead,
} from '../services/notificationApiService';
import { 
  setUnreadCountUpdateCallback, 
  removeUnreadCountUpdateCallback 
} from '../services/notificationService';

interface NotificationContextType {
  // Estado de las notificaciones
  notifications: NotificationItem[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  hasMoreNotifications: boolean;
  
  // Acciones
  refreshNotifications: () => Promise<void>;
  loadMoreNotifications: () => Promise<void>;
  markAsRead: () => Promise<void>;
  refreshUnreadCount: () => Promise<void>;
  clearError: () => void;
  
  // Estados de UI
  isRefreshing: boolean;
  isLoadingMore: boolean;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const { token } = useAuth();
  const { user } = useUser();
  
  // Estados principales
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMoreNotifications, setHasMoreNotifications] = useState(true);
  
  // Estados de UI
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  
  // Referencias para paginación
  const currentPageRef = useRef(0);
  const totalPagesRef = useRef(0);
  const isLoadingRef = useRef(false);
  
  // Intervalos y timeouts
  const unreadCountIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const backgroundUpdateTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const clienteId = user?.id ? parseInt(user.id.toString()) : null;

  /**
   * Limpia todos los intervalos y timeouts activos
   */
  const clearIntervals = useCallback(() => {
    if (unreadCountIntervalRef.current) {
      clearInterval(unreadCountIntervalRef.current);
      unreadCountIntervalRef.current = null;
    }
    if (backgroundUpdateTimeoutRef.current) {
      clearTimeout(backgroundUpdateTimeoutRef.current);
      backgroundUpdateTimeoutRef.current = null;
    }
  }, []);

  /**
   * Refresca el conteo de notificaciones no leídas
   */
  const refreshUnreadCount = useCallback(async () => {
    if (!token || !clienteId || isLoadingRef.current) return;

    try {
      const count = await getUnreadNotificationsCount(token, clienteId);
      setUnreadCount(count);
      setError(null);
    } catch (err) {
      console.error('Error obteniendo conteo de notificaciones:', err);
      // No mostramos error para el conteo ya que es una operación secundaria
    }
  }, [token, clienteId]);

  /**
   * Refresca la lista completa de notificaciones (reinicia la paginación)
   */
  const refreshNotifications = useCallback(async () => {
    if (!token || !clienteId || isLoadingRef.current) return;

    try {
      setLoading(true);
      setIsRefreshing(true);
      setError(null);
      isLoadingRef.current = true;

      const result = await getNotifications(token, clienteId, 0, 10);
      
      setNotifications(result.content);
      currentPageRef.current = 0;
      totalPagesRef.current = result.page.totalPages;
      setHasMoreNotifications(result.page.totalPages > 1);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar notificaciones';
      setError(errorMessage);
      console.error('Error en refreshNotifications:', err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
      isLoadingRef.current = false;
    }
  }, [token, clienteId]);

  /**
   * Carga más notificaciones (siguiente página)
   */
  const loadMoreNotifications = useCallback(async () => {
    if (!token || !clienteId || isLoadingRef.current || !hasMoreNotifications) return;

    try {
      setIsLoadingMore(true);
      setError(null);
      isLoadingRef.current = true;

      const nextPage = currentPageRef.current + 1;
      const result = await getNotifications(token, clienteId, nextPage, 10);
      
      setNotifications(prev => [...prev, ...result.content]);
      currentPageRef.current = nextPage;
      
      // Verificar si hay más páginas
      setHasMoreNotifications(nextPage < result.page.totalPages - 1);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar más notificaciones';
      setError(errorMessage);
      console.error('Error en loadMoreNotifications:', err);
    } finally {
      setIsLoadingMore(false);
      isLoadingRef.current = false;
    }
  }, [token, clienteId, hasMoreNotifications]);

  /**
   * Marca todas las notificaciones como leídas
   */
  const markAsRead = useCallback(async () => {
    if (!token || !clienteId) return;

    try {
      await markAllNotificationsAsRead(token, clienteId);
      
      // Actualizar el estado local
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, leido: true }))
      );
      setUnreadCount(0);
      setError(null);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al marcar notificaciones como leídas';
      setError(errorMessage);
      console.error('Error en markAsRead:', err);
    }
  }, [token, clienteId]);

  /**
   * Limpia el error actual
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Inicializa las notificaciones cuando el usuario esté disponible
   */
  useEffect(() => {
    if (token && clienteId) {
      refreshNotifications();
      refreshUnreadCount();
    }
  }, [token, clienteId, refreshNotifications, refreshUnreadCount]);

  /**
   * Configura el callback para actualizaciones automáticas cuando llegan notificaciones
   */
  useEffect(() => {
    if (token && clienteId) {
      // Configurar callback para actualizaciones en tiempo real
      setUnreadCountUpdateCallback(() => {
        refreshUnreadCount();
        
        // También actualizar la lista si no hay muchas notificaciones cargadas
        if (notifications.length <= 10) {
          backgroundUpdateTimeoutRef.current = setTimeout(() => {
            refreshNotifications();
          }, 1000); // Delay para evitar múltiples llamadas
        }
      });
    }
    
    return () => {
      removeUnreadCountUpdateCallback();
      clearIntervals();
    };
  }, [token, clienteId, refreshUnreadCount, refreshNotifications, notifications.length, clearIntervals]);

  /**
   * Configura actualizaciones periódicas del conteo
   */
  useEffect(() => {
    if (!token || !clienteId) return;

    // Actualizar conteo cada 30 segundos cuando la app está activa
    unreadCountIntervalRef.current = setInterval(() => {
      if (AppState.currentState === 'active') {
        refreshUnreadCount();
      }
    }, 30000);

    return () => {
      clearIntervals();
    };
  }, [token, clienteId, refreshUnreadCount, clearIntervals]);

  /**
   * Maneja cambios de estado de la aplicación
   */
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active' && token && clienteId) {
        // Cuando la app vuelve al primer plano, actualizar conteo
        refreshUnreadCount();
      } else if (nextAppState === 'background') {
        // Limpiar timeouts cuando la app va al fondo
        clearIntervals();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription?.remove();
      clearIntervals();
    };
  }, [token, clienteId, refreshUnreadCount, clearIntervals]);

  /**
   * Limpieza al desmontar el componente
   */
  useEffect(() => {
    return () => {
      removeUnreadCountUpdateCallback();
      clearIntervals();
    };
  }, [clearIntervals]);

  const value: NotificationContextType = {
    // Estado
    notifications,
    unreadCount,
    loading,
    error,
    hasMoreNotifications,
    
    // Acciones
    refreshNotifications,
    loadMoreNotifications,
    markAsRead,
    refreshUnreadCount,
    clearError,
    
    // Estados de UI
    isRefreshing,
    isLoadingMore,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

/**
 * Hook para usar el contexto de notificaciones
 */
export const useNotifications = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (context === null) {
    throw new Error('useNotifications debe usarse dentro de un NotificationProvider');
  }
  return context;
};