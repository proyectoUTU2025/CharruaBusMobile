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
  getNotifications,
  getUnreadNotificationsCount,
  markAllNotificationsAsRead,
} from '../services/notificationApiService';
import { 
  setUnreadCountUpdateCallback, 
  removeUnreadCountUpdateCallback 
} from '../services/notificationService';
import { NotificationItem } from '../types/notificationType';

interface NotificationContextType {
  notifications: NotificationItem[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  hasMoreNotifications: boolean;
  
  refreshNotifications: () => Promise<void>;
  loadMoreNotifications: () => Promise<void>;
  markAsRead: () => Promise<void>;
  refreshUnreadCount: () => Promise<void>;
  clearError: () => void;
  
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
  
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMoreNotifications, setHasMoreNotifications] = useState(true);
  
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  
  const currentPageRef = useRef(0);
  const totalPagesRef = useRef(0);
  const isLoadingRef = useRef(false);
  
  const unreadCountIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const backgroundUpdateTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const clienteId = user?.id ? parseInt(user.id.toString()) : null;

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

  const refreshUnreadCount = useCallback(async () => {
    if (!token || !clienteId || isLoadingRef.current) return;

    try {
      const count = await getUnreadNotificationsCount(token, clienteId);
      setUnreadCount(count);
      setError(null);
    } catch (err) {
      console.error('Error obteniendo conteo de notificaciones:', err);
    }
  }, [token, clienteId]);

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

  const markAsRead = useCallback(async () => {
    if (!token || !clienteId) return;

    try {
      await markAllNotificationsAsRead(token, clienteId);
      
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

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  useEffect(() => {
    if (token && clienteId) {
      refreshNotifications();
      refreshUnreadCount();
    }
  }, [token, clienteId, refreshNotifications, refreshUnreadCount]);

  useEffect(() => {
    if (token && clienteId) {
      setUnreadCountUpdateCallback(() => {
        refreshUnreadCount();
        
        if (notifications.length <= 10) {
          backgroundUpdateTimeoutRef.current = setTimeout(() => {
            refreshNotifications();
          }, 1000);
        }
      });
    }
    
    return () => {
      removeUnreadCountUpdateCallback();
      clearIntervals();
    };
  }, [token, clienteId, refreshUnreadCount, refreshNotifications, notifications.length, clearIntervals]);

  useEffect(() => {
    if (!token || !clienteId) return;

    unreadCountIntervalRef.current = setInterval(() => {
      if (AppState.currentState === 'active') {
        refreshUnreadCount();
      }
    }, 30000);

    return () => {
      clearIntervals();
    };
  }, [token, clienteId, refreshUnreadCount, clearIntervals]);

  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active' && token && clienteId) {
        refreshUnreadCount();
      } else if (nextAppState === 'background') {
        clearIntervals();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription?.remove();
      clearIntervals();
    };
  }, [token, clienteId, refreshUnreadCount, clearIntervals]);

  useEffect(() => {
    return () => {
      removeUnreadCountUpdateCallback();
      clearIntervals();
    };
  }, [clearIntervals]);

  const value: NotificationContextType = {

    notifications,
    unreadCount,
    loading,
    error,
    hasMoreNotifications,
    
    refreshNotifications,
    loadMoreNotifications,
    markAsRead,
    refreshUnreadCount,
    clearError,

    isRefreshing,
    isLoadingMore,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (context === null) {
    throw new Error('useNotifications debe usarse dentro de un NotificationProvider');
  }
  return context;
};