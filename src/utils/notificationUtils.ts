import { NotificacionUsuario } from '../types/notificationType';

export const getNotificationIcon = (tipo: string): string => {
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

export const formatNotificationTime = (fecha: string): string => {
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
      return `Hace ${diffInHours} hora${diffInHours > 1 ? 's' : ''}`;
    } else if (diffInDays === 1) {
      return 'Ayer';
    } else if (diffInDays < 7) {
      return `Hace ${diffInDays} días`;
    } else {
      return notificationDate.toLocaleDateString();
    }
  } catch (error) {
    return 'Fecha inválida';
  }
};

export const sortNotificationsByDate = (notifications: NotificacionUsuario[]): NotificacionUsuario[] => {
  return [...notifications].sort((a, b) => {
    const dateA = new Date(a.fecha).getTime();
    const dateB = new Date(b.fecha).getTime();
    return dateB - dateA;
  });
};

export const filterUnreadNotifications = (notifications: NotificacionUsuario[]): NotificacionUsuario[] => {
  return notifications.filter(notification => !notification.leido);
};

export const groupNotificationsByDate = (notifications: NotificacionUsuario[]): { [key: string]: NotificacionUsuario[] } => {
  const groups: { [key: string]: NotificacionUsuario[] } = {};
  
  notifications.forEach(notification => {
    try {
      const date = new Date(notification.fecha);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      let groupKey: string;
      
      if (date.toDateString() === today.toDateString()) {
        groupKey = 'Hoy';
      } else if (date.toDateString() === yesterday.toDateString()) {
        groupKey = 'Ayer';
      } else {
        groupKey = date.toLocaleDateString();
      }
      
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      
      groups[groupKey].push(notification);
    } catch (error) {
      if (!groups['Fecha inválida']) {
        groups['Fecha inválida'] = [];
      }
      groups['Fecha inválida'].push(notification);
    }
  });
  
  return groups;
};