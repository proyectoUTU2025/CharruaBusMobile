import { AppRegistry } from 'react-native';
import App from './App.tsx';
import { name as appName } from './app.json';
import { getApp, getApps, initializeApp } from '@react-native-firebase/app';
import { getMessaging, setBackgroundMessageHandler } from '@react-native-firebase/messaging';

try {
  const app = getApps().length ? getApp() : null;

  if (app) {
    const messaging = getMessaging(app);

    setBackgroundMessageHandler(messaging, async remoteMessage => {
      try {
        return Promise.resolve();
      } catch (error) {
        console.error('Error en el manejador de segundo plano:', error);
        return Promise.resolve();
      }
    });

  } else {
    console.warn('Firebase no se inicializó correctamente');
  }
} catch (error) {
  console.error('Error al inicializar Firebase:', error);
}

AppRegistry.registerComponent(appName, () => App);