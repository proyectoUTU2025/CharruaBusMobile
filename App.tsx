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
        const unsubscribe = setupNotifications((remoteMessage: FirebaseMessagingTypes.RemoteMessage) => {
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