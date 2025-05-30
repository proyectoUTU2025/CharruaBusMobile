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

//Solicita permisos y configurar notificaciones
export async function requestUserPermission(): Promise<void> {
  try {
    //Paso 1: Solicita permisos de notificación en Android 13+ (si es necesario)
    if (Platform.OS === 'android' && Platform.Version >= 33) {
      console.log('Solicitando permiso POST_NOTIFICATIONS para Android 13+');
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
        {
          title: 'Permiso de notificaciones',
          message: 'Esta app necesita permiso para enviarte notificaciones.',
          buttonPositive: 'Aceptar',
          buttonNegative: 'Cancelar',
        }
      );

      console.log('Resultado del permiso POST_NOTIFICATIONS:', granted);
      
      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        console.log('Permiso POST_NOTIFICATIONS denegado');
        return;
      }
    }

    //Paso 2: Solicita permiso de Firebase
    console.log('Solicitando permisos de Firebase...');
    const messaging = getMessaging(getApp());
    const authStatus = await requestPermission(messaging);
    
    console.log('Estado de autorización Firebase:', authStatus);
    
    const enabled =
      authStatus === AuthorizationStatus.AUTHORIZED ||
      authStatus === AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      console.log('Permisos de notificación otorgados');
      const token = await getFCMToken();
      console.log('Token FCM obtenido:', token ? 'Sí' : 'No');
    } else {
      console.log('Permisos de notificación denegados');
    }
  } catch (error) {
    console.error('Error al solicitar permisos:', error);
  }
}

//Obtencion del token FCM
export async function getFCMToken(): Promise<string | null> {
  try {
    const messaging = getMessaging(getApp());
    const fcmToken = await getToken(messaging);

    if (fcmToken) {
      console.log('Token FCM:', fcmToken);
      return fcmToken;
    } else {
      console.log('No se pudo obtener el token FCM');
      return null;
    }
  } catch (error) {
    console.error('Error al obtener token FCM:', error);
    return null;
  }
}

//Configura listeners de notificaciones
export function setupNotifications(onNotification: NotificationCallback): (() => void) {
  try {
    const messaging = getMessaging(getApp());

    //Maneja notificaciones en primer plano
    const unsubscribeForeground = onMessage(messaging, async (remoteMessage: FirebaseMessagingTypes.RemoteMessage) => {
      console.log('Notificación recibida en primer plano:', remoteMessage);
      if (onNotification) {
        onNotification(remoteMessage);
      }
    });

    //Maneja notificaciones cuando la app está en segundo plano y se abre
    const unsubscribeOpenedApp = onNotificationOpenedApp(messaging, (remoteMessage: FirebaseMessagingTypes.RemoteMessage) => {
      console.log('App abierta desde notificación:', remoteMessage);
      if (onNotification) {
        onNotification(remoteMessage);
      }
    });

    //Maneja notificación inicial (cuando la app está cerrada)
    getInitialNotification(messaging)
      .then((remoteMessage: FirebaseMessagingTypes.RemoteMessage | null) => {
        if (remoteMessage) {
          console.log('Notificación inicial:', remoteMessage);
          if (onNotification) {
            onNotification(remoteMessage);
          }
        }
      })
      .catch((error: any) => {
        console.error('Error al obtener notificación inicial:', error);
      });

    const unsubscribeTokenRefresh = onTokenRefresh(messaging, (token: string) => {
      console.log('Token FCM actualizado:', token);
    });

    //Limpia listeners cuando se desmonte el componente
    return (): void => {
      unsubscribeForeground();
      unsubscribeTokenRefresh();
    };
  } catch (error) {
    console.error('Error al configurar listeners de notificaciones:', error);
    return (): void => {}; //Función vacía para limpiar
  }
}