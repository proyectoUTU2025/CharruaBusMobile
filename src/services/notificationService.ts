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

export function setupNotifications(onNotification: NotificationCallback): (() => void) {
  try {
    const messaging = getMessaging(getApp());

    const unsubscribeForeground = onMessage(messaging, async (remoteMessage: FirebaseMessagingTypes.RemoteMessage) => {
      if (onNotification) {
        onNotification(remoteMessage);
      }
    });

    const unsubscribeOpenedApp = onNotificationOpenedApp(messaging, (remoteMessage: FirebaseMessagingTypes.RemoteMessage) => {
      if (onNotification) {
        onNotification(remoteMessage);
      }
    });

    getInitialNotification(messaging)
      .then((remoteMessage: FirebaseMessagingTypes.RemoteMessage | null) => {
        if (remoteMessage) {
          if (onNotification) {
            onNotification(remoteMessage);
          }
        }
      })
      .catch((error: any) => {
        console.error('Error al obtener notificación inicial:', error);
      });

    const unsubscribeTokenRefresh = onTokenRefresh(messaging, (token: string) => {
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