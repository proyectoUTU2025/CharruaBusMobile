import { AppRegistry } from 'react-native';
import { getApp } from '@react-native-firebase/app';
import { getMessaging, setBackgroundMessageHandler } from '@react-native-firebase/messaging';
import App from './App';
import { name as appName } from './app.json';
import { handleBackgroundNotification } from './src/services/notificationService';

const app = getApp();
const messaging = getMessaging(app);

setBackgroundMessageHandler(messaging, async remoteMessage => {
  try {
    console.log('Notificación en segundo plano recibida:', remoteMessage);
    
    await handleBackgroundNotification(remoteMessage);
    
    console.log('Notificación en segundo plano procesada exitosamente');
    
  } catch (error) {
    console.error('Error en el manejador de segundo plano:', error);
    
    if (remoteMessage) {
      console.log('Datos de la notificación que falló:', {
        messageId: remoteMessage.messageId,
        from: remoteMessage.from,
        data: remoteMessage.data,
        notification: remoteMessage.notification
      });
    }
  }
});

AppRegistry.registerComponent(appName, () => App);