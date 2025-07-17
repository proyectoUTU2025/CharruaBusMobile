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
  clearNotifications: () => void;
  isRefreshing: boolean;
  isLoadingMore: boolean;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const { token, handleUnauthorized } = useAuth();
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

  const handleError = useCallback((error: unknown) => {
    if (error instanceof Error && error.message === 'Sesión expirada') {
      handleUnauthorized();
      return true;
    }
    return false;
  }, [handleUnauthorized]);

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
    } catch (error) {
      if (!handleError(error)) {
        setError('Error al obtener conteo de notificaciones');
      }
    }
  }, [token, clienteId, handleError]);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
    currentPageRef.current = 0;
    totalPagesRef.current = 0;
    setHasMoreNotifications(true);
    setError(null);
  }, []);

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
    } catch (error) {
      if (!handleError(error)) {
        setError('Error al cargar notificaciones');
      }
    } finally {
      setLoading(false);
      setIsRefreshing(false);
      isLoadingRef.current = false;
    }
  }, [token, clienteId, handleError]);

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
    } catch (error) {
      if (!handleError(error)) {
        setError('Error al cargar más notificaciones');
      }
    } finally {
      setIsLoadingMore(false);
      isLoadingRef.current = false;
    }
  }, [token, clienteId, hasMoreNotifications, handleError]);

  const markAsRead = useCallback(async () => {
    if (!token || !clienteId) return;

    try {
      await markAllNotificationsAsRead(token, clienteId);
      setNotifications(prev => prev.map(notification => ({ ...notification, leido: true })));
      setUnreadCount(0);
      setError(null);
    } catch (error) {
      if (!handleError(error)) {
        setError('Error al marcar notificaciones como leídas');
      }
    }
  }, [token, clienteId, handleError]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  useEffect(() => {
    if (token && clienteId) {
      refreshUnreadCount();
    }
  }, [token, clienteId, refreshUnreadCount]);

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

  const value = {
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
    clearNotifications,
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