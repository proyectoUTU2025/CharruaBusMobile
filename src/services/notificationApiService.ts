import { API_BASE_URL } from '@env';
import { NotificationItem, NotificationsPage, NotificationsCountResponse, MarkAsReadResponse } from '../types/notificationType';

export const getNotifications = async (
  token: string, 
  clienteId: number, 
  page: number = 0, 
  size: number = 10
): Promise<NotificationsPage> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/notificaciones/all?clienteId=${clienteId}&page=${page}&size=${size}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Sesión expirada');
      }
      
      if (response.status === 403) {
        throw new Error('No tienes permisos para acceder a las notificaciones');
      } else if (response.status === 404) {
        throw new Error('Cliente no encontrado');
      } else if (response.status >= 500) {
        throw new Error('Error del servidor. Inténtalo más tarde.');
      }
      
      throw new Error(`Error al obtener notificaciones: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    if (error instanceof Error && error.message === 'Sesión expirada') {
      throw error;
    }
    
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Error de conexión. Verifica tu internet y que el servidor esté funcionando.');
    }
    
    throw error;
  }
};

export const getUnreadNotificationsCount = async (
  token: string, 
  clienteId: number
): Promise<number> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/notificaciones/pendientes/count?clienteId=${clienteId}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Sesión expirada');
      }
      
      if (response.status === 403) {
        throw new Error('No tienes permisos para acceder a las notificaciones');
      } else if (response.status === 404) {
        throw new Error('Cliente no encontrado');
      } else if (response.status >= 500) {
        throw new Error('Error del servidor. Inténtalo más tarde.');
      }
      
      throw new Error(`Error al obtener conteo de notificaciones: ${response.status}`);
    }

    const result: NotificationsCountResponse = await response.json();
    return result.data;
  } catch (error) {
    if (error instanceof Error && error.message === 'Sesión expirada') {
      throw error;
    }
    
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Error de conexión. Verifica tu internet y que el servidor esté funcionando.');
    }
    
    throw error;
  }
};

export const markAllNotificationsAsRead = async (
  token: string, 
  clienteId: number
): Promise<void> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/notificaciones/marcar-leidas?clienteId=${clienteId}`,
      {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Sesión expirada');
      }
      
      if (response.status === 403) {
        throw new Error('No tienes permisos para marcar notificaciones como leídas');
      } else if (response.status === 404) {
        throw new Error('Cliente no encontrado');
      } else if (response.status >= 500) {
        throw new Error('Error del servidor. Inténtalo más tarde.');
      }
      
      throw new Error(`Error al marcar notificaciones como leídas: ${response.status}`);
    }
  } catch (error) {
    if (error instanceof Error && error.message === 'Sesión expirada') {
      throw error;
    }
    
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Error de conexión. Verifica tu internet y que el servidor esté funcionando.');
    }
    
    throw error;
  }
};

export const formatNotificationDate = (fecha: string): string => {
  try {
    const notificationDate = new Date(fecha);
    const now = new Date();
    const diffInMs = now.getTime() - notificationDate.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMinutes < 1) {
      return 'Ahora';
    } else if (diffInMinutes < 60) {
      return `Hace ${diffInMinutes} min`;
    } else if (diffInHours < 24) {
      return `Hace ${diffInHours} hora${diffInHours !== 1 ? 's' : ''}`;
    } else if (diffInDays === 1) {
      return 'Ayer';
    } else if (diffInDays < 7) {
      return `Hace ${diffInDays} días`;
    } else {
      return notificationDate.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    }
  } catch (error) {
    console.error('Error formateando fecha de notificación:', error);
    return 'Fecha no disponible';
  }
};

export const getNotificationIcon = (tipo: NotificationItem['tipo']): string => {
  switch (tipo) {
    case 'COMPRA':
      return 'shopping-cart';
    case 'PROMOCION':
      return 'local-offer';
    case 'GENERAL':
    default:
      return 'notifications';
  }
};