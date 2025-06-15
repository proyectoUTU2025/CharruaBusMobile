"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Provider as PaperProvider } from "react-native-paper"
import { Alert, StatusBar, Platform } from "react-native"
import AppNavigator from "./src/navigation/AppNavigator"
import { AuthProvider } from "./src/context/AuthContext"

// Importaciones condicionales para notificaciones y error handler
let requestUserPermission: (() => Promise<void>) | undefined
let setupNotifications: ((callback: (message: any) => void) => () => void) | undefined
let errorHandler: { init: () => void; restore: () => void } | undefined
let FirebaseMessagingTypes: any

try {
  // Intentar importar servicios de notificación
  const notificationService = require("./src/services/notificationService")
  requestUserPermission = notificationService.requestUserPermission
  setupNotifications = notificationService.setupNotifications
  console.log("Servicios de notificación cargados exitosamente")
} catch (error) {
  console.log("Servicios de notificación no disponibles:", error)
}

try {
  // Intentar importar error handler
  const errorHandlerModule = require("./src/utils/errorHandler")
  errorHandler = errorHandlerModule.errorHandler
  console.log("Error handler cargado exitosamente")
} catch (error) {
  console.log("Error handler no disponible:", error)
}

try {
  // Intentar importar tipos de Firebase
  const firebaseMessaging = require("@react-native-firebase/messaging")
  FirebaseMessagingTypes = firebaseMessaging.FirebaseMessagingTypes
  console.log("Tipos de Firebase Messaging cargados")
} catch (error) {
  console.log("Tipos de Firebase Messaging no disponibles:", error)
}

const App: React.FC = () => {
  const [appReady, setAppReady] = useState(false)
  const [notificationsInitialized, setNotificationsInitialized] = useState(false)

  useEffect(() => {
    console.log("Inicializando aplicación...")

    // Inicializar el error handler inmediatamente
    if (errorHandler?.init) {
      console.log("Inicializando error handler personalizado...")
      errorHandler.init()
    } else {
      console.log("Error handler no disponible - usando manejo de errores por defecto")
    }

    // Marcar la app como lista después de un breve retraso
    const readyTimer = setTimeout(() => {
      console.log("App marcada como lista para inicialización completa")
      setAppReady(true)
    }, 1000)

    return () => {
      clearTimeout(readyTimer)
      console.log("Limpiando timer de inicialización")
    }
  }, [])

  // Efecto separado para inicializar notificaciones cuando la app esté lista
  useEffect(() => {
    let unsubscribeNotifications: (() => void) | undefined

    const initializeNotifications = async () => {
      // Solo inicializar si la app está lista y las notificaciones no se han inicializado aún
      if (appReady && !notificationsInitialized && requestUserPermission && setupNotifications) {
        console.log("Inicializando notificaciones...")
        setNotificationsInitialized(true)

        try {
          // En Android, esperar un poco más para asegurar que la Activity esté lista
          if (Platform.OS === "android") {
            console.log("Esperando 2 segundos adicionales en Android para Activity...")
            await new Promise((resolve) => setTimeout(resolve, 2000))
          }

          console.log("Solicitando permisos de notificación...")
          await requestUserPermission()
          console.log("Permisos de notificación procesados")

          console.log("Configurando listeners de notificaciones...")
          unsubscribeNotifications = setupNotifications((remoteMessage: any) => {
            try {
              console.log("Notificación recibida:", remoteMessage)

              // Validar que el mensaje tenga la estructura esperada
              if (remoteMessage?.notification) {
                const title = remoteMessage.notification?.title || "Notificación"
                const body = remoteMessage.notification?.body || "Mensaje recibido"

                console.log("Mostrando alerta de notificación:", { title, body })

                // Mostrar alerta cuando se reciba una notificación
                Alert.alert(title, body, [
                  {
                    text: "OK",
                    onPress: () => console.log("Notificación cerrada por el usuario"),
                  },
                ])
              } else {
                console.log("Notificación recibida sin contenido de notification")
              }

              // Lógica adicional para manejar datos de la notificación
              if (remoteMessage?.data) {
                console.log("Datos de notificación recibidos:", remoteMessage.data)
                // Procesar datos específicos de la notificación
                handleNotificationData(remoteMessage.data)
              }
            } catch (error) {
              console.error("Error al procesar notificación:", error)
            }
          })

          console.log("Listeners de notificaciones configurados exitosamente")
        } catch (error) {
          console.error("Error al inicializar notificaciones:", error)
          // No marcar como inicializado para permitir reintentos
          setNotificationsInitialized(false)
        }
      }
    }

    initializeNotifications()

    return () => {
      if (unsubscribeNotifications) {
        console.log("Limpiando listeners de notificaciones...")
        unsubscribeNotifications()
      }
    }
  }, [appReady, notificationsInitialized])

  // Función para manejar datos de notificaciones
  const handleNotificationData = (data: any) => {
    try {
      console.log("Procesando datos de notificación:", data)

      // Ejemplos de manejo de diferentes tipos de notificaciones
      if (data.type) {
        switch (data.type) {
          case "trip_reminder":
            console.log("Recordatorio de viaje recibido")
            // Lógica específica para recordatorios de viaje
            break
          case "booking_confirmation":
            console.log("Confirmación de reserva recibida")
            // Lógica específica para confirmaciones
            break
          case "promotion":
            console.log("Promoción recibida")
            // Lógica específica para promociones
            break
          default:
            console.log("Tipo de notificación no reconocido:", data.type)
            break
        }
      }

      // Guardar datos de notificación si es necesario
      if (data.save) {
        console.log("Guardando datos de notificación para procesamiento posterior")
        // Aquí se podría guardar en AsyncStorage o base de datos local
      }
    } catch (error) {
      console.error("Error procesando datos de notificación:", error)
    }
  }

  // Cleanup cuando el componente se desmonte
  useEffect(() => {
    return () => {
      console.log("Limpiando recursos de la aplicación...")
      try {
        if (errorHandler?.restore) {
          console.log("Restaurando error handler original...")
          errorHandler.restore()
        }
        console.log("Cleanup completado")
      } catch (error) {
        console.error("Error durante cleanup:", error)
      }
    }
  }, [])

  console.log("Renderizando componente App")

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
