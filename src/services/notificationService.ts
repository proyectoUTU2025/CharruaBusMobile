// notificationService.ts - Actualizado
import { getApp } from '@react-native-firebase/app'; 
import { 
  getMessaging, 
  requestPermission, 
  getToken, 
  onMessage, 
  onNotificationOpenedApp, 
  getInitialNotification, 
  onTokenRefresh, 
  AuthorizationStatus,
  FirebaseMessagingTypes
} from '@react-native-firebase/messaging';
import { PermissionsAndroid, Platform } from 'react-native';

type NotificationCallback = (remoteMessage: FirebaseMessagingTypes.RemoteMessage) => void;
type UnreadCountUpdateCallback = () => void;

// Variable global para callback de actualización de conteo
let unreadCountUpdateCallback: UnreadCountUpdateCallback | null = null;

export async function requestUserPermission(): Promise<void> {
  try {
    if (Platform.OS === 'android' && Platform.Version >= 33) {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
        {
          title: 'Permiso de notificaciones',
          message: 'Esta app necesita permiso para enviarte notificaciones.',
          buttonPositive: 'Aceptar',
          buttonNegative: 'Cancelar',
        }
      );
      
      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        return;
      }
    }

    const messaging = getMessaging(getApp());
    const authStatus = await requestPermission(messaging);
    
    const enabled =
      authStatus === AuthorizationStatus.AUTHORIZED ||
      authStatus === AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      const token = await getFCMToken();
    }
  } catch (error) {
    console.error('Error al solicitar permisos:', error);
  }
}

export async function getFCMToken(): Promise<string | null> {
  try {
    const messaging = getMessaging(getApp());
    const fcmToken = await getToken(messaging);

    if (fcmToken) {
      return fcmToken;
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error al obtener token FCM:', error);
    return null;
  }
}

/**
 * Establece el callback para actualizar el conteo de notificaciones no leídas
 */
export function setUnreadCountUpdateCallback(callback: UnreadCountUpdateCallback): void {
  unreadCountUpdateCallback = callback;
}

/**
 * Remueve el callback de actualización de conteo
 */
export function removeUnreadCountUpdateCallback(): void {
  unreadCountUpdateCallback = null;
}

export function setupNotifications(onNotification: NotificationCallback): (() => void) {
  try {
    const messaging = getMessaging(getApp());

    // 🔥 CAMBIO PRINCIPAL: Manejo de notificaciones en primer plano
    const unsubscribeForeground = onMessage(messaging, async (remoteMessage: FirebaseMessagingTypes.RemoteMessage) => {
      console.log('Notificación recibida en primer plano:', remoteMessage);
      
      // En lugar de mostrar la notificación, actualizamos el conteo
      if (unreadCountUpdateCallback) {
        unreadCountUpdateCallback();
      }
      
      // Opcional: También llamar al callback original por si se necesita para otros propósitos
      if (onNotification) {
        onNotification(remoteMessage);
      }
    });

    // Manejo cuando la app se abre desde una notificación
    const unsubscribeOpenedApp = onNotificationOpenedApp(messaging, (remoteMessage: FirebaseMessagingTypes.RemoteMessage) => {
      console.log('App abierta desde notificación:', remoteMessage);
      
      // Actualizar conteo cuando se abre la app desde notificación
      if (unreadCountUpdateCallback) {
        unreadCountUpdateCallback();
      }
      
      if (onNotification) {
        onNotification(remoteMessage);
      }
    });

    // Verificar si la app se abrió desde una notificación (app cerrada)
    getInitialNotification(messaging)
      .then((remoteMessage: FirebaseMessagingTypes.RemoteMessage | null) => {
        if (remoteMessage) {
          console.log('App abierta desde notificación (app cerrada):', remoteMessage);
          
          // Actualizar conteo
          if (unreadCountUpdateCallback) {
            unreadCountUpdateCallback();
          }
          
          if (onNotification) {
            onNotification(remoteMessage);
          }
        }
      })
      .catch((error: any) => {
        console.error('Error al obtener notificación inicial:', error);
      });

    // Manejo de refresco del token
    const unsubscribeTokenRefresh = onTokenRefresh(messaging, (token: string) => {
      console.log('Token FCM actualizado:', token);
      // Aquí podrías enviar el nuevo token al servidor si es necesario
    });

    return (): void => {
      unsubscribeForeground();
      unsubscribeTokenRefresh();
    };
  } catch (error) {
    console.error('Error al configurar listeners de notificaciones:', error);
    return (): void => {};
  }
}