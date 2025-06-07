import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Linking } from 'react-native';
import { useAuth } from '../context/AuthContext';
import BottomTabsNavigator from '../navigation/BottomTabsNavigator';
import { OneWayTripScreen } from '../screens/OneWayTripScreen';
import { ViewTripsScreen } from '../screens/ViewTripsScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import VerifyEmailScreen from '../screens/VerifyEmailScreen';
import LoadingScreen from '../screens/LoadingScreen';
import { Localidad } from '../services/locationService';

// Tipos para navegación
export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  VerifyEmail: { email: string };
  Auth: undefined;
  Main: undefined;
  TripSelection: undefined;
  OneWayTrip: undefined;
  RoundTrip: undefined;
  ViewTrips: {
    origenSeleccionado: Localidad;
    destinoSeleccionado: Localidad;
    fecha: string;
    date: string;
    pasajeros: string;
    tipoViaje: 'ida' | 'ida-vuelta';
  };
  SelectSeat: {
    journeyId: number;
    pasajeros: string;
    origenSeleccionado: Localidad;
    destinoSeleccionado: Localidad;
    fecha: string;
    tipoViaje: 'ida' | 'ida-vuelta';
  };
  PaymentSuccess: { session_id: string };
  PaymentCancelled: { session_id: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  const { isAuthenticated, isAuthLoading } = useAuth();

  // Debugging del deep linking
  useEffect(() => {
    const handleInitialURL = async () => {
      try {
        const url = await Linking.getInitialURL();
        if (url) {
          handleDeepLink(url);
        }
      } catch (error) {
        console.error('Error al obtener URL inicial:', error);
      }
    };

    const handleURL = (event: { url: string }) => {
      handleDeepLink(event.url);
    };

    const handleDeepLink = (url: string) => {
      const sessionIdMatch = url.match(/session_id=([^&]+)/);
      const sessionId = sessionIdMatch ? sessionIdMatch[1] : null;
    };

    handleInitialURL();
    
    const subscription = Linking.addEventListener('url', handleURL);
    
    return () => {
      subscription?.remove();
    };
  }, []);

  if (isAuthLoading) {
    return <LoadingScreen />;
  }

  const linking = {
    prefixes: ['charruabus://'],
    config: {
      screens: {
        PaymentSuccess: {
          path: 'pago/exito',
          parse: {
            session_id: (session_id: string) => {
              return session_id;
            },
          },
        },
        PaymentCancelled: {
          path: 'pago/cancelado', 
          parse: {
            session_id: (session_id: string) => {
              return session_id;
            },
          },
        },
      },
    },
  };

  return (
    <NavigationContainer linking={linking} >
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
          </>
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen name="VerifyEmail" component={VerifyEmailScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;