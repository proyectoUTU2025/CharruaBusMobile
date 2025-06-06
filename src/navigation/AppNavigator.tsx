"use client"

import { useEffect, useState } from "react"
import { NavigationContainer } from "@react-navigation/native"
import { createNativeStackNavigator } from "@react-navigation/native-stack"

// Importaciones de pantallas de ambas versiones
import LoginScreen from "../screens/LoginScreen"
import RegisterScreen from "../screens/RegisterScreen"
import VerifyEmailScreen from "../screens/VerifyEmailScreen"
import LoadingScreen from "../screens/LoadingScreen"
import RecoverPasswordScreen from "../screens/RecoverPasswordScreen"
import BottomTabsNavigator from "./BottomTabsNavigator"
import { OneWayTripScreen } from "../screens/OneWayTripScreen"
import { ViewTripsScreen } from "../screens/ViewTripsScreen"

// Importaciones de servicios y contextos
import { useAuth } from "../context/AuthContext"
import type { Localidad } from "../services/locationService"

// Tipos combinados para navegación
export type RootStackParamList = {
  // Rutas de autenticación
  Loading: undefined
  Login: undefined
  Register: undefined
  VerifyEmail: { email: string }
  RecoverPassword: undefined
  Auth: undefined

  // Rutas principales
  Main: undefined

  // Rutas de viajes
  TripSelection: undefined
  OneWayTrip: undefined
  RoundTrip: undefined
  ViewTrips: {
    origenSeleccionado: Localidad
    destinoSeleccionado: Localidad
    fecha: string
    date: string
    pasajeros: string
  }
}

const Stack = createNativeStackNavigator<RootStackParamList>()

const AppNavigator = () => {
  // Combinando estados de autenticación de ambas versiones
  const { isAuthenticated, isAuthLoading, checkAuthStatus } = useAuth()
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  const [showLoadingScreen, setShowLoadingScreen] = useState(true)

  useEffect(() => {
    initializeApp()
  }, [])

  const initializeApp = async () => {
    try {
      console.log("Inicializando aplicación...")
      // Simular verificación de autenticación y carga inicial
      await Promise.all([
        checkAuthStatus?.(), // Verificar estado de autenticación si existe
        new Promise((resolve) => setTimeout(resolve, 2000)), // Tiempo mínimo de pantalla de carga
      ])
      console.log("Inicialización completada")
    } catch (error) {
      console.error("Error durante la inicialización:", error)
    } finally {
      setIsInitialLoading(false)
    }
  }

  const handleLoadingComplete = () => {
    console.log("Carga completada")
    setShowLoadingScreen(false)
  }

  const handleLoadingError = (error: string) => {
    console.error("Error en pantalla de carga:", error)
    // Continuar con la app incluso si hay error en la carga
    setShowLoadingScreen(false)
  }

  // Mostrar pantalla de carga inicial
  if (isInitialLoading || showLoadingScreen) {
    return (
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Loading">
            {() => <LoadingScreen onLoadingComplete={handleLoadingComplete} onError={handleLoadingError} />}
          </Stack.Screen>
        </Stack.Navigator>
      </NavigationContainer>
    )
  }

  // Mostrar indicador de carga durante verificación de autenticación
  if (isAuthLoading) {
    return (
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Loading">{() => <LoadingScreen onLoadingComplete={() => {}} />}</Stack.Screen>
        </Stack.Navigator>
      </NavigationContainer>
    )
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          // Usuario autenticado - mostrar navegación principal y rutas de viajes
          <>
            <Stack.Screen name="Main" component={BottomTabsNavigator} />
            <Stack.Screen name="TripSelection" component={BottomTabsNavigator} />
            <Stack.Screen name="OneWayTrip" component={OneWayTripScreen} />
            <Stack.Screen name="ViewTrips" component={ViewTripsScreen} />
          </>
        ) : (
          // Usuario no autenticado - mostrar pantallas de auth
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen name="VerifyEmail" component={VerifyEmailScreen} />
            <Stack.Screen name="RecoverPassword" component={RecoverPasswordScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  )
}

export default AppNavigator
