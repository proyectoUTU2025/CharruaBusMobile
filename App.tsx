// App.tsx - Actualizado con NotificationProvider
import React, { useEffect } from 'react';
import { Provider as PaperProvider } from 'react-native-paper';
import { AuthProvider } from './src/context/AuthContext';
import { NotificationProvider } from './src/context/NotificationContext';
import AppNavigator from './src/navigation/AppNavigator';
import { requestUserPermission, setupNotifications } from './src/services/notificationService';
import { FirebaseMessagingTypes } from '@react-native-firebase/messaging';
import { errorHandler } from './src/utils/errorHandler';

const App = () => {
  useEffect(() => {
    errorHandler.init();

    const initializeNotifications = async () => {
      try {
        await requestUserPermission();
        
        // El setupNotifications ahora maneja automáticamente 
        // la actualización del conteo cuando llegan notificaciones en primer plano
        const unsubscribe = setupNotifications((remoteMessage: FirebaseMessagingTypes.RemoteMessage) => {
          console.log('Notificación procesada:', remoteMessage);
          
          // Ya no mostramos alertas aquí, solo logeamos para debug
          // El conteo se actualiza automáticamente via el NotificationContext
        });

        return unsubscribe;
      } catch (error) {
        console.error('Error configurando notificaciones:', error);
      }
    };

    initializeNotifications();

    return () => {
      errorHandler.restore();
    };
  }, []);

  return (
    <PaperProvider>
      <AuthProvider>
        <NotificationProvider>
          <AppNavigator />
        </NotificationProvider>
      </AuthProvider>
    </PaperProvider>
  );
};

export default App;