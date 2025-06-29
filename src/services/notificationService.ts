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

    const app = getApp();
    const messaging = getMessaging(app);
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
    const app = getApp();
    const messaging = getMessaging(app);
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

export function setUnreadCountUpdateCallback(callback: UnreadCountUpdateCallback): void {
  unreadCountUpdateCallback = callback;
}

export function removeUnreadCountUpdateCallback(): void {
  unreadCountUpdateCallback = null;
}

export async function handleBackgroundNotification(remoteMessage: FirebaseMessagingTypes.RemoteMessage): Promise<void> {
  try {
    console.log('Procesando notificación en segundo plano:', remoteMessage);
    
    if (unreadCountUpdateCallback) {
      unreadCountUpdateCallback();
    }
    
    return Promise.resolve();
  } catch (error) {
    console.error('Error procesando notificación en segundo plano:', error);
    return Promise.reject(error);
  }
}

export function setupNotifications(onNotification: NotificationCallback): (() => void) {
  try {
    const app = getApp();
    const messaging = getMessaging(app);

    const unsubscribeForeground = onMessage(messaging, async (remoteMessage: FirebaseMessagingTypes.RemoteMessage) => {
      
      if (unreadCountUpdateCallback) {
        unreadCountUpdateCallback();
      }
      
      if (onNotification) {
        onNotification(remoteMessage);
      }
    });

    const unsubscribeOpenedApp = onNotificationOpenedApp(messaging, (remoteMessage: FirebaseMessagingTypes.RemoteMessage) => {
      
      if (unreadCountUpdateCallback) {
        unreadCountUpdateCallback();
      }
      
      if (onNotification) {
        onNotification(remoteMessage);
      }
    });

    getInitialNotification(messaging)
      .then((remoteMessage: FirebaseMessagingTypes.RemoteMessage | null) => {
        if (remoteMessage) {
          
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

    const unsubscribeTokenRefresh = onTokenRefresh(messaging, (token: string) => {});

    return (): void => {
      unsubscribeForeground();
      unsubscribeTokenRefresh();
    };
  } catch (error) {
    console.error('Error al configurar listeners de notificaciones:', error);
    return (): void => {};
  }
}