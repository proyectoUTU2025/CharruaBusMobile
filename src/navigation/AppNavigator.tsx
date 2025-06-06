import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
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
  };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  const { isAuthenticated, isAuthLoading } = useAuth();

  // Mientras se verifica el token, mostrar pantalla de carga
  if (isAuthLoading) {
    return <LoadingScreen />;
  }

  // Una vez que terminó la verificación, mostrar las rutas correspondientes
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
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