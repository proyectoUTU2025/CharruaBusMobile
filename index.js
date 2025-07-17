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
    await handleBackgroundNotification(remoteMessage);
    
  } catch (error) {
    console.error('Error en el manejador de segundo plano:', error);
    
  }
});

AppRegistry.registerComponent(appName, () => App);