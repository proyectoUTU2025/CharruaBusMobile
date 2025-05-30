import React, { useEffect } from 'react';
import { Provider as PaperProvider } from 'react-native-paper';
import { Alert } from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';
import { AuthProvider } from './src/context/AuthContext';
import {
  requestUserPermission,
  setupNotifications,
} from './src/services/notificationService';
import { FirebaseMessagingTypes } from '@react-native-firebase/messaging';

const App = () => {
  useEffect(() => {
    const setupNotificationsAsync = async () => {
      try {
        // ELIMINAR la solicitud duplicada de permisos POST_NOTIFICATIONS
        // Solo llamar a requestUserPermission que ya maneja todo
        await requestUserPermission();

        // Configurar listeners de notificaciones
        const unsubscribe = setupNotifications((remoteMessage: FirebaseMessagingTypes.RemoteMessage) => {
          try {
            // Mostrar alerta cuando se reciba una notificación
            if (remoteMessage?.notification) {
              Alert.alert(
                remoteMessage.notification?.title || 'Notificación',
                remoteMessage.notification?.body || 'Mensaje recibido',
                [
                  {
                    text: 'OK',
                  },
                ]
              );
            }

            // Lógica adicional para manejar datos de la notificación
            if (remoteMessage?.data) {
              // Por ejemplo, navegar a una pantalla específica
              // navigation.navigate('Screen', { data: remoteMessage.data });
            }
          } catch (error) {
            console.error('Error al procesar notificación:', error);
          }
        });

        // Cleanup function para cuando el componente se desmonte
        return unsubscribe;
      } catch (error) {
        console.error('Error al configurar notificaciones:', error);
      }
    };

    setupNotificationsAsync();
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