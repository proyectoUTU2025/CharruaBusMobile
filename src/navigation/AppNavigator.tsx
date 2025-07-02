import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Linking, Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { confirmarCompra, cancelarCompra } from '../services/paymentService';
import BottomTabsNavigator from '../navigation/BottomTabsNavigator';
import { OneWayTripScreen } from '../screens/OneWayTripScreen/OneWayTripScreen';
import { ViewTripsScreen } from '../screens/ViewTripsScreen/ViewTripsScreen';
import { SelectSeatScreen } from '../screens/SelectSeatScreen/SelectSeatScreen';
import LoginScreen from '../screens/LoginScreen/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen/RegisterScreen';
import VerifyEmailScreen from '../screens/VerifyEmailScreen/VerifyEmailScreen';
import ResetPasswordScreen from '../screens/ResetPasswordScreen/ResetPasswordScreen';
import LoadingScreen from '../screens/LoadingScreen/LoadingScreen';
import PurchaseDetailScreen from '../screens/PurchaseDetailScreen/PurchaseDetailScreen';
import TicketDetailScreen from '../screens/TicketDetailScreen/TicketDetailScreen';
import { RootStackParamList } from '../types/navigationType';

const Stack = createNativeStackNavigator<RootStackParamList>();

const PaymentSuccessScreen = ({ route, navigation }: any) => {
  const { session_id } = route.params;
  const { token } = useAuth();

  useEffect(() => {
    const handlePaymentSuccess = async () => {
      try {
        if (!session_id) {
          console.error('No se recibió session_id');
          throw new Error('No se recibió el ID de sesión');
        }

        if (!token) {
          console.error('No hay token de autenticación');
          throw new Error('No hay token de autenticación');
        }
        
        const result = await confirmarCompra(token, session_id);
        
        const compraId = result.data?.compraId;
        
        if (!compraId) {
          console.error('No se recibió compraId en la respuesta:', result);
          throw new Error('No se recibió el ID de la compra');
        }
        
        Alert.alert(
          '¡Pago exitoso!',
          'Tu compra se procesó y confirmó correctamente.',
          [
            {
              text: 'Cerrar',
              onPress: () => {
                navigation.reset({
                  index: 0,
                  routes: [
                    { name: 'Main' },
                    { 
                      name: 'PurchaseDetail', 
                      params: { purchaseId: compraId }
                    }
                  ],
                });
              }
            }
          ],
          { cancelable: false }
        );
        
      } catch (error) {
        console.error('Error completo al confirmar compra:', error);
        console.error('Error message:', error instanceof Error ? error.message : 'Error desconocido');
        console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
        
        Alert.alert(
          'Error en confirmación',
          `Hubo un problema al confirmar tu compra: ${error instanceof Error ? error.message : 'Error desconocido'}. Por favor contacta soporte.`,
          [
            {
              text: 'Ir al inicio',
              onPress: () => {
                navigation.reset({
                  index: 0,
                  routes: [{ name: 'Main' }],
                });
              }
            },
            {
              text: 'Reintentar',
              onPress: () => {
                handlePaymentSuccess();
              }
            }
          ]
        );
      }
    };

    handlePaymentSuccess();
  }, [session_id, token, navigation]);

  return <LoadingScreen />;
};

const PaymentCancelledScreen = ({ route, navigation }: any) => {
  const { session_id } = route.params;
  const { token } = useAuth();

  useEffect(() => {
    const handlePaymentCancelled = async () => {
      try {
        if (!session_id) {
          throw new Error('No se recibió el ID de sesión');
        }

        if (!token) {
          throw new Error('No hay token de autenticación');
        }
        
        const result = await cancelarCompra(token, session_id);
        
        navigation.reset({
          index: 0,
          routes: [{ 
            name: 'TripSelection',
            params: { initialTab: 'viajes' }
          }],
        });
        
      } catch (error) {
        console.error('Error completo al cancelar compra:', error);
        console.error('Error message:', error instanceof Error ? error.message : 'Error desconocido');
        
        navigation.reset({
          index: 0,
          routes: [{ 
            name: 'TripSelection',
            params: { initialTab: 'viajes' }
          }],
        });
      }
    };

    const timer = setTimeout(handlePaymentCancelled, 1000);
    return () => clearTimeout(timer);
  }, [session_id, token, navigation]);

  return <LoadingScreen />;
};

const AppNavigator = () => {
  const { isAuthenticated, isAuthLoading, token } = useAuth();

  const linking = {
    prefixes: ['charruabus://'],
    config: {
      screens: {
        PaymentSuccess: {
          path: 'pago/exitoso',
          parse: {
            session_id: (session_id: string) => {
              return decodeURIComponent(session_id);
            },
          },
        },
        PaymentCancelled: {
          path: 'pago/cancelado',
          parse: {
            session_id: (session_id: string) => {
              return decodeURIComponent(session_id);
            },
          },
        },
      },
    },
  };

  useEffect(() => {
    const handleInitialURL = async () => {
      try {
        const url = await Linking.getInitialURL();
      } catch (error) {
        console.error('Error al obtener URL inicial:', error);
      }
    };

    const handleURL = (event: { url: string }) => {};

    handleInitialURL();
    
    const subscription = Linking.addEventListener('url', handleURL);
    
    return () => {
      subscription?.remove();
    };
  }, []);

  if (isAuthLoading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer linking={linking}>
      <Stack.Navigator 
        screenOptions={{ 
          headerShown: false,
          gestureEnabled: false,
        }}
      >
        {isAuthenticated ? (
          <>
            <Stack.Screen name="Main" component={BottomTabsNavigator} />
            <Stack.Screen name="TripSelection" component={BottomTabsNavigator} />
            <Stack.Screen name="OneWayTrip" component={OneWayTripScreen} />
            <Stack.Screen name="ViewTrips" component={ViewTripsScreen} />
            <Stack.Screen name="SelectSeat" component={SelectSeatScreen} />
            
            <Stack.Screen 
              name="PurchaseDetail" 
              component={PurchaseDetailScreen}
              options={{
                gestureEnabled: false,
              }}
            />
            
            <Stack.Screen 
              name="TicketDetail" 
              component={TicketDetailScreen}
              options={{
                gestureEnabled: false,
              }}
            />
            
            <Stack.Screen 
              name="PaymentSuccess" 
              component={PaymentSuccessScreen}
              options={{
                gestureEnabled: false,
              }}
            />
            <Stack.Screen 
              name="PaymentCancelled" 
              component={PaymentCancelledScreen}
              options={{
                gestureEnabled: false,
              }}
            />
          </>
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen name="VerifyEmail" component={VerifyEmailScreen} />
            <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;