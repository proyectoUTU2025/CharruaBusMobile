
"use client"

import type React from "react"
import { useEffect } from "react"
import { Provider as PaperProvider } from "react-native-paper"
import { Alert, StatusBar } from "react-native"
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
  useEffect(() => {
    console.log("Inicializando aplicación...")

    const initializeApp = async () => {
      try {
        // Inicializar el error handler personalizado si está disponible
        if (errorHandler?.init) {
          console.log("Inicializando error handler personalizado...")
          errorHandler.init()
        } else {
          console.log("Error handler no disponible - usando manejo de errores por defecto")
        }

        // Configurar notificaciones si están disponibles
        if (requestUserPermission && setupNotifications) {
          console.log("Configurando notificaciones...")
          await initializeNotifications()
        } else {
          console.log("Notificaciones no configuradas - ejecutando en modo de desarrollo")
        }

        console.log("Inicialización de la aplicación completada")
      } catch (error) {
        console.error("Error durante la inicialización de la aplicación:", error)
      }
    }

    const initializeNotifications = async () => {
      try {
        console.log("Solicitando permisos de notificación...")
        // Solicitar permisos de notificación
        await requestUserPermission!()
        console.log("Permisos de notificación obtenidos")

        // Configurar listeners de notificaciones
        console.log("Configurando listeners de notificaciones...")
        const unsubscribe = setupNotifications!((remoteMessage: any) => {
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
              // Aquí se puede agregar lógica para navegar a pantallas específicas
              // Por ejemplo: navigation.navigate('Screen', { data: remoteMessage.data });

              // Procesar datos específicos de la notificación
              handleNotificationData(remoteMessage.data)
            }
          } catch (error) {
            console.error("Error al procesar notificación:", error)

          }
        })

        console.log("Listeners de notificaciones configurados exitosamente")

        // Retornar función de cleanup
        return unsubscribe
      } catch (error) {
        console.error("Error al configurar notificaciones:", error)
        throw error
      }
    }

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

    // Ejecutar inicialización
    initializeApp()

    // Función de cleanup cuando el componente se desmonte
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
