"use client"

import { useEffect, useState } from "react"
import { NavigationContainer } from "@react-navigation/native"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import LoginScreen from "../screens/LoginScreen"
import RegisterScreen from "../screens/RegisterScreen"
import VerifyEmailScreen from "../screens/VerifyEmailScreen"
import LoadingScreen from "../screens/LoadingScreen"
import BottomTabsNavigator from "./BottomTabsNavigator"
import { useAuth } from "../context/AuthContext"

export type RootStackParamList = {
  Loading: undefined
  Login: undefined
  Register: undefined
  VerifyEmail: { email: string }
  Main: undefined
}

const Stack = createNativeStackNavigator<RootStackParamList>()

const AppNavigator = () => {
  const { isAuthenticated, isLoading: authLoading, checkAuthStatus } = useAuth()
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  const [showLoadingScreen, setShowLoadingScreen] = useState(true)

  useEffect(() => {
    initializeApp()
  }, [])

  const initializeApp = async () => {
    try {
      // Simular verificación de autenticación y carga inicial
      await Promise.all([
        checkAuthStatus?.(), // Verificar estado de autenticación si existe
        new Promise((resolve) => setTimeout(resolve, 2000)), // Tiempo mínimo de pantalla de carga
      ])
    } catch (error) {
      console.error("Error durante la inicialización:", error)
    } finally {
      setIsInitialLoading(false)
    }
  }

  const handleLoadingComplete = () => {
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
  if (authLoading) {
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
          // Usuario autenticado - mostrar navegación principal
          <Stack.Screen name="Main" component={BottomTabsNavigator} />
        ) : (
          // Usuario no autenticado - mostrar pantallas de auth
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen name="VerifyEmail" component={VerifyEmailScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  )
}

export default AppNavigator
