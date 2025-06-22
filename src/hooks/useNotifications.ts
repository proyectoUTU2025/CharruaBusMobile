import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useUser } from './useUser';
import {
  NotificationItem,
  getNotifications,
  getUnreadNotificationsCount,
  markAllNotificationsAsRead,
} from '../services/notificationApiService';

interface UseNotificationsReturn {
  notifications: NotificationItem[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  hasMoreNotifications: boolean;
  refreshNotifications: () => Promise<void>;
  loadMoreNotifications: () => Promise<void>;
  markAsRead: () => Promise<void>;
  refreshUnreadCount: () => Promise<void>;
}

export const useNotifications = (): UseNotificationsReturn => {
  const { token } = useAuth();
  const { user } = useUser();
  
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMoreNotifications, setHasMoreNotifications] = useState(true);
  
  const currentPageRef = useRef(0);
  const totalPagesRef = useRef(0);
  const isLoadingRef = useRef(false);

  const clienteId = user?.id ? parseInt(user.id.toString()) : null;

  const refreshUnreadCount = useCallback(async () => {
    if (!token || !clienteId) return;

    try {
      const count = await getUnreadNotificationsCount(token, clienteId);
      setUnreadCount(count);
    } catch (err) {
      console.error('Error obteniendo conteo de notificaciones:', err);
    }
  }, [token, clienteId]);

  const refreshNotifications = useCallback(async () => {
    if (!token || !clienteId || isLoadingRef.current) return;

    try {
      setLoading(true);
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
      isLoadingRef.current = false;
    }
  }, [token, clienteId]);

  const loadMoreNotifications = useCallback(async () => {
    if (!token || !clienteId || isLoadingRef.current || !hasMoreNotifications) return;

    try {
      setLoading(true);
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
      setLoading(false);
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
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al marcar notificaciones como leídas';
      setError(errorMessage);
      console.error('Error en markAsRead:', err);
    }
  }, [token, clienteId]);

  useEffect(() => {
    if (token && clienteId) {
      refreshNotifications();
      refreshUnreadCount();
    }
  }, [token, clienteId, refreshNotifications, refreshUnreadCount]);

  useEffect(() => {
    if (!token || !clienteId) return;

    const interval = setInterval(() => {
      refreshUnreadCount();
    }, 30000);

    return () => clearInterval(interval);
  }, [token, clienteId, refreshUnreadCount]);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    hasMoreNotifications,
    refreshNotifications,
    loadMoreNotifications,
    markAsRead,
    refreshUnreadCount,
  };
};