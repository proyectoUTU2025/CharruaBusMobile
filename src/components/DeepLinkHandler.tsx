import React, { useEffect } from 'react';
import { Linking, Alert } from 'react-native';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { confirmarCompra, cancelarCompra } from '../services/paymentService';

interface DeepLinkHandlerProps {
  children: React.ReactNode;
}

export const DeepLinkHandler: React.FC<DeepLinkHandlerProps> = ({ children }) => {
  const navigation = useNavigation<any>();
  const { token } = useAuth();

  useEffect(() => {
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

    const handleDeepLink = async (url: string) => {
      
      try {
        const urlObj = new URL(url);
        const scheme = urlObj.protocol.replace(':', '');
        const host = urlObj.hostname;
        const pathname = urlObj.pathname;
        const searchParams = urlObj.searchParams;

        if (scheme !== 'charruabus') {
          return;
        }

        const sessionId = searchParams.get('session_id');
        if (!sessionId) {
          return;
        }

        if (host === 'pago') {
          if (pathname === '/exitoso') {
            await handlePagoExitoso(sessionId);
          } else if (pathname === '/cancelado') {
            handlePagoCancelado(sessionId);
          }
        }
        
      } catch (error) {
        console.error('Error al procesar deep link:', error);
        
        const match = url.match(/session_id=([^&]+)/);
        if (match) {
          const sessionId = decodeURIComponent(match[1]);
          
          if (url.includes('/exitoso')) {
            await handlePagoExitoso(sessionId);
          } else if (url.includes('/cancelado')) {
            handlePagoCancelado(sessionId);
          }
        }
      }
    };

    const handlePagoExitoso = async (sessionId: string) => {
      try {
        
        if (token) {
          await confirmarCompra(token, sessionId);
        }
        
        Alert.alert(
          '¡Pago exitoso!',
          'Tu compra se procesó correctamente. Te llevamos al inicio.',
          [
            {
              text: 'OK',
              onPress: () => navigateToHome()
            }
          ]
        );
        
      } catch (error) {
        console.error('Error al confirmar compra:', error);
        Alert.alert(
          '¡Pago exitoso!',
          'Tu compra se procesó correctamente. Te llevamos al inicio.',
          [
            {
              text: 'OK',
              onPress: () => navigateToHome()
            }
          ]
        );
      }
    };

    const handlePagoCancelado = async (sessionId: string) => {
      try {
        
        if (token) {
          await cancelarCompra(token, sessionId);
        }
        
        navigateToTripSelection();
        
      } catch (error) {
        console.error('Error al cancelar compra:', error);
        navigateToTripSelection();
      }
    };

    const navigateToHome = () => {
      try {

        navigation.reset({
          index: 0,
          routes: [{ name: 'Main' }],
        });
        
      } catch (error) {
        console.error('Error navegando al inicio:', error);
        
        try {
          navigation.navigate('Main');
        } catch (fallbackError) {
          console.error('Fallback también falló:', fallbackError);
        }
      }
    };

    const navigateToTripSelection = () => {
      try {
        navigation.setParams({ resetToTripSelection: true });
        
      } catch (error) {
        console.error('Error navegando a viajes:', error);
        
        try {
          navigation.reset({
            index: 0,
            routes: [{ 
              name: 'Main', 
              params: { initialTab: 'viajes' } 
            }],
          });
        } catch (fallbackError) {
          console.error('Fallback también falló:', fallbackError);
        }
      }
    };

    const subscription = Linking.addEventListener('url', (event) => {
      handleDeepLink(event.url);
    });

    handleInitialURL();

    return () => {
      subscription?.remove();
    };
  }, [navigation, token]);

  return <>{children}</>;
};