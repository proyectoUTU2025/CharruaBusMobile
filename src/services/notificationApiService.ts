const API_BASE_URL = 'http://192.168.1.170:8080';

export interface NotificationItem {
  id: number;
  compraId: number;
  titulo: string;
  mensaje: string;
  fecha: string;
  timestamp: number;
  leido: boolean;
  tipo: 'COMPRA' | 'GENERAL' | 'PROMOCION';
}

export interface NotificationsPage {
  content: NotificationItem[];
  page: {
    size: number;
    number: number;
    totalElements: number;
    totalPages: number;
  };
}

export interface NotificationsCountResponse {
  data: number;
  message: string;
}

export interface MarkAsReadResponse {
  data: string;
  message: string;
}

/**
 * Obtiene las notificaciones paginadas del cliente
 */
export const getNotifications = async (
  token: string, 
  clienteId: number, 
  page: number = 0, 
  size: number = 10
): Promise<NotificationsPage> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/notificaciones?clienteId=${clienteId}&page=${page}&size=${size}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response:', errorText);
      
      if (response.status === 401) {
        throw new Error('Token de autenticación inválido');
      } else if (response.status === 403) {
        throw new Error('No tienes permisos para acceder a las notificaciones');
      } else if (response.status === 404) {
        throw new Error('Cliente no encontrado');
      } else if (response.status >= 500) {
        throw new Error('Error del servidor. Inténtalo más tarde.');
      } else {
        throw new Error(`Error al obtener notificaciones: ${response.status}`);
      }
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error en getNotifications:', error);
    
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Error de conexión. Verifica tu internet y que el servidor esté funcionando.');
    }
    
    if (error instanceof Error) {
      throw error;
    }
    
    throw new Error('Error inesperado al obtener notificaciones.');
  }
};

/**
 * Obtiene el conteo de notificaciones no leídas
 */
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
      const errorText = await response.text();
      console.error('Error response:', errorText);
      
      if (response.status === 401) {
        throw new Error('Token de autenticación inválido');
      } else if (response.status === 403) {
        throw new Error('No tienes permisos para acceder a las notificaciones');
      } else if (response.status === 404) {
        throw new Error('Cliente no encontrado');
      } else if (response.status >= 500) {
        throw new Error('Error del servidor. Inténtalo más tarde.');
      } else {
        throw new Error(`Error al obtener conteo de notificaciones: ${response.status}`);
      }
    }

    const result: NotificationsCountResponse = await response.json();
    return result.data;
  } catch (error) {
    console.error('Error en getUnreadNotificationsCount:', error);
    
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Error de conexión. Verifica tu internet y que el servidor esté funcionando.');
    }
    
    if (error instanceof Error) {
      throw error;
    }
    
    throw new Error('Error inesperado al obtener conteo de notificaciones.');
  }
};

/**
 * Marca todas las notificaciones como leídas
 */
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
      const errorText = await response.text();
      console.error('Error response:', errorText);
      
      if (response.status === 401) {
        throw new Error('Token de autenticación inválido');
      } else if (response.status === 403) {
        throw new Error('No tienes permisos para marcar notificaciones como leídas');
      } else if (response.status === 404) {
        throw new Error('Cliente no encontrado');
      } else if (response.status >= 500) {
        throw new Error('Error del servidor. Inténtalo más tarde.');
      } else {
        throw new Error(`Error al marcar notificaciones como leídas: ${response.status}`);
      }
    }

    // No necesitamos procesar la respuesta para esta operación
    return;
  } catch (error) {
    console.error('Error en markAllNotificationsAsRead:', error);
    
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Error de conexión. Verifica tu internet y que el servidor esté funcionando.');
    }
    
    if (error instanceof Error) {
      throw error;
    }
    
    throw new Error('Error inesperado al marcar notificaciones como leídas.');
  }
};

/**
 * Formatea la fecha de una notificación para mostrar de forma amigable
 */
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

/**
 * Obtiene el icono apropiado basado en el tipo de notificación
 */
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