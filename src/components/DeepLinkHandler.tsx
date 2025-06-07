import React, { useEffect } from 'react';
import { Linking } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';

type NavigationProp = StackNavigationProp<RootStackParamList>;

interface DeepLinkHandlerProps {
  children: React.ReactNode;
}

export const DeepLinkHandler: React.FC<DeepLinkHandlerProps> = ({ children }) => {
  const navigation = useNavigation<NavigationProp>();

  useEffect(() => {
    // Maneja deep link cuando la app se abre desde cerrada
    const handleInitialURL = async () => {
      try {
        const initialUrl = await Linking.getInitialURL();
        if (initialUrl) {
          handleDeepLink(initialUrl);
        }
      } catch (error) {
        console.error('Error al obtener URL inicial:', error);
      }
    };

    // Maneja deep links cuando la app ya está abierta
    const handleDeepLink = (url: string) => {
      
      try {
        const urlObj = new URL(url);
        const scheme = urlObj.protocol.replace(':', '');
        const host = urlObj.hostname;
        const pathname = urlObj.pathname;
        const searchParams = urlObj.searchParams;

        // Verifica que sea nuestro esquema
        if (scheme !== 'charruabus') {
          return;
        }

        // Extrae session_id
        const sessionId = searchParams.get('session_id');
        if (!sessionId) {
          return;
        }

        // Navega según la ruta
        if (host === 'pago') {
          if (pathname === '/exito') {
            navigation.navigate('PaymentSuccess', { session_id: sessionId });
          } else if (pathname === '/cancelado') {
            navigation.navigate('PaymentCancelled', { session_id: sessionId });
          }
        }
        
      } catch (error) {
        console.error('Error al procesar deep link:', error);
        
        // Fallback: usa regex para extraer session_id
        const match = url.match(/session_id=([^&]+)/);
        if (match) {
          const sessionId = decodeURIComponent(match[1]);
          
          if (url.includes('/exito')) {
            navigation.navigate('PaymentSuccess', { session_id: sessionId });
          } else if (url.includes('/cancelado')) {
            navigation.navigate('PaymentCancelled', { session_id: sessionId });
          }
        }
      }
    };

    const subscription = Linking.addEventListener('url', (event) => {
      handleDeepLink(event.url);
    });

    // Procesar URL inicial
    handleInitialURL();

    // Cleanup
    return () => {
      subscription?.remove();
    };
  }, [navigation]);

  return <>{children}</>;
};