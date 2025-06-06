import React, { useEffect } from 'react';
import { Provider as PaperProvider } from 'react-native-paper';
import { Alert } from 'react-native';
import { AuthProvider } from './src/context/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';
import { requestUserPermission, setupNotifications } from './src/services/notificationService';
import { FirebaseMessagingTypes } from '@react-native-firebase/messaging';
import { errorHandler } from './src/utils/errorHandler';

const App = () => {
  useEffect(() => {
    // Inicializar el error handler personalizado al arrancar la app
    errorHandler.init();

    const initializeNotifications = async () => {
      try {
        await requestUserPermission();
        
        const unsubscribe = setupNotifications((remoteMessage: FirebaseMessagingTypes.RemoteMessage) => {
          if (remoteMessage?.notification) {
            Alert.alert(
              remoteMessage.notification.title || 'Notificación',
              remoteMessage.notification.body || 'Mensaje recibido'
            );
          }
        });

        return unsubscribe;
      } catch (error) {
        console.error('Error configurando notificaciones:', error);
      }
    };

    initializeNotifications();

    // Limpiar al desmontar la app (opcional, raramente se ejecuta)
    return () => {
      errorHandler.restore();
    };
  }, []);

  return (
    <PaperProvider>
      <AuthProvider>
        <AppNavigator />
      </AuthProvider>
    </PaperProvider>
  );
};

export default App;