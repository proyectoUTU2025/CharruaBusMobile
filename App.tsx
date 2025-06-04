"use client"

import type React from "react"
import { useEffect } from "react"
import { Provider as PaperProvider } from "react-native-paper"
import { Alert, StatusBar } from "react-native"
import AppNavigator from "./src/navigation/AppNavigator"
import { AuthProvider } from "./src/context/AuthContext"

// Importaciones condicionales para notificaciones (si están disponibles)
let requestUserPermission: (() => Promise<void>) | undefined
let setupNotifications: ((callback: (message: any) => void) => () => void) | undefined

try {
  const notificationService = require("./src/services/notificationService")
  requestUserPermission = notificationService.requestUserPermission
  setupNotifications = notificationService.setupNotifications
} catch (error) {
  console.log("Servicios de notificación no disponibles:", error)
}

const App: React.FC = () => {
  useEffect(() => {
    const setupNotificationsAsync = async () => {
      try {
        // Solo configurar notificaciones si el servicio está disponible
        if (requestUserPermission && setupNotifications) {
          // Solicitar permisos de notificación
          await requestUserPermission()

          // Configurar listeners de notificaciones
          const unsubscribe = setupNotifications((remoteMessage: any) => {
            try {
              // Mostrar alerta cuando se reciba una notificación
              if (remoteMessage?.notification) {
                Alert.alert(
                  remoteMessage.notification?.title || "Notificación",
                  remoteMessage.notification?.body || "Mensaje recibido",
                  [
                    {
                      text: "OK",
                    },
                  ],
                )
              }

              // Lógica adicional para manejar datos de la notificación
              if (remoteMessage?.data) {
                // Por ejemplo, navegar a una pantalla específica
                // navigation.navigate('Screen', { data: remoteMessage.data });
                console.log("Datos de notificación:", remoteMessage.data)
              }
            } catch (error) {
              console.error("Error al procesar notificación:", error)
            }
          })

          // Cleanup function para cuando el componente se desmonte
          return unsubscribe
        } else {
          console.log("Notificaciones no configuradas - ejecutando en modo de desarrollo")
        }
      } catch (error) {
        console.error("Error al configurar notificaciones:", error)
      }
    }

    setupNotificationsAsync()
  }, [])

  return (
    <PaperProvider>
      <AuthProvider>
        <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
        <AppNavigator />
      </AuthProvider>
    </PaperProvider>
  )
}

export default App
