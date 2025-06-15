import { getApp } from "@react-native-firebase/app"
import {
  getMessaging,
  requestPermission,
  getToken,
  onMessage,
  onNotificationOpenedApp,
  getInitialNotification,
  onTokenRefresh,
  AuthorizationStatus,
  type FirebaseMessagingTypes,
} from "@react-native-firebase/messaging"
import { PermissionsAndroid, Platform, AppState } from "react-native"

type NotificationCallback = (remoteMessage: FirebaseMessagingTypes.RemoteMessage) => void

// Variable para controlar si ya se solicitaron permisos
let permissionsRequested = false

// Función para verificar si la app está en primer plano
const isAppInForeground = (): boolean => {
  return AppState.currentState === "active"
}

// Función para esperar a que la app esté en primer plano
const waitForAppToBeActive = (): Promise<void> => {
  return new Promise((resolve) => {
    if (isAppInForeground()) {
      resolve()
      return
    }

    const handleAppStateChange = (nextAppState: string) => {
      if (nextAppState === "active") {
        AppState.removeEventListener("change", handleAppStateChange)
        // Esperar un poco más para asegurar que la Activity esté completamente lista
        setTimeout(resolve, 500)
      }
    }

    AppState.addEventListener("change", handleAppStateChange)
  })
}

// Solicita permisos y configurar notificaciones
export async function requestUserPermission(): Promise<void> {
  try {
    // Evitar solicitar permisos múltiples veces
    if (permissionsRequested) {
      console.log("Permisos ya solicitados anteriormente")
      return
    }

    // Esperar a que la app esté activa antes de solicitar permisos
    await waitForAppToBeActive()

    console.log("Iniciando solicitud de permisos de notificación...")

    // Paso 1: Solicita permisos de notificación en Android 13+ (si es necesario)
    if (Platform.OS === "android" && Platform.Version >= 33) {
      console.log("Solicitando permiso POST_NOTIFICATIONS para Android 13+")

      try {
        const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS, {
          title: "Permiso de notificaciones",
          message: "Esta app necesita permiso para enviarte notificaciones.",
          buttonPositive: "Aceptar",
          buttonNegative: "Cancelar",
        })

        console.log("Resultado del permiso POST_NOTIFICATIONS:", granted)

        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          console.log("Permiso POST_NOTIFICATIONS denegado")
          permissionsRequested = true // Marcar como solicitado para evitar bucles
          return
        }
      } catch (androidPermissionError) {
        console.error("Error al solicitar permiso POST_NOTIFICATIONS:", androidPermissionError)
        permissionsRequested = true
        return
      }
    }

    // Paso 2: Solicita permiso de Firebase
    console.log("Solicitando permisos de Firebase...")

    try {
      const messaging = getMessaging(getApp())
      const authStatus = await requestPermission(messaging)

      console.log("Estado de autorización Firebase:", authStatus)

      const enabled = authStatus === AuthorizationStatus.AUTHORIZED || authStatus === AuthorizationStatus.PROVISIONAL

      if (enabled) {
        console.log("Permisos de notificación otorgados")
        const token = await getFCMToken()
        console.log("Token FCM obtenido:", token ? "Sí" : "No")
      } else {
        console.log("Permisos de notificación denegados")
      }
    } catch (firebasePermissionError) {
      console.error("Error al solicitar permisos de Firebase:", firebasePermissionError)
    }

    permissionsRequested = true
  } catch (error) {
    console.error("Error al solicitar permisos:", error)
    permissionsRequested = true // Marcar como solicitado incluso en caso de error
  }
}

// Función para reiniciar el estado de permisos (útil para testing o reintentos)
export function resetPermissionState(): void {
  permissionsRequested = false
}

// Obtención del token FCM
export async function getFCMToken(): Promise<string | null> {
  try {
    // Verificar que la app esté activa antes de obtener el token
    if (!isAppInForeground()) {
      console.log("App no está en primer plano, esperando...")
      await waitForAppToBeActive()
    }

    const messaging = getMessaging(getApp())
    const fcmToken = await getToken(messaging)

    if (fcmToken) {
      console.log("Token FCM obtenido exitosamente")
      return fcmToken
    } else {
      console.log("No se pudo obtener el token FCM")
      return null
    }
  } catch (error) {
    console.error("Error al obtener token FCM:", error)
    return null
  }
}

// Configura listeners de notificaciones
export function setupNotifications(onNotification: NotificationCallback): () => void {
  try {
    const messaging = getMessaging(getApp())

    // Maneja notificaciones en primer plano
    const unsubscribeForeground = onMessage(messaging, async (remoteMessage: FirebaseMessagingTypes.RemoteMessage) => {
      console.log("Notificación recibida en primer plano:", remoteMessage)
      if (onNotification) {
        onNotification(remoteMessage)
      }
    })

    // Maneja notificaciones cuando la app está en segundo plano y se abre
    const unsubscribeOpenedApp = onNotificationOpenedApp(
      messaging,
      (remoteMessage: FirebaseMessagingTypes.RemoteMessage) => {
        console.log("App abierta desde notificación:", remoteMessage)
        if (onNotification) {
          onNotification(remoteMessage)
        }
      },
    )

    // Maneja notificación inicial (cuando la app está cerrada)
    getInitialNotification(messaging)
      .then((remoteMessage: FirebaseMessagingTypes.RemoteMessage | null) => {
        if (remoteMessage) {
          console.log("Notificación inicial:", remoteMessage)
          if (onNotification) {
            onNotification(remoteMessage)
          }
        }
      })
      .catch((error: any) => {
        console.error("Error al obtener notificación inicial:", error)
      })

    const unsubscribeTokenRefresh = onTokenRefresh(messaging, (token: string) => {
      console.log("Token FCM actualizado:", token)
    })

    // Limpia listeners cuando se desmonte el componente
    return (): void => {
      unsubscribeForeground()
      unsubscribeTokenRefresh()
    }
  } catch (error) {
    console.error("Error al configurar listeners de notificaciones:", error)
    return (): void => {} // Función vacía para limpiar
  }
}

// Función para verificar el estado de los permisos sin solicitarlos
export async function checkPermissionStatus(): Promise<boolean> {
  try {
    const messaging = getMessaging(getApp())
    const authStatus = await messaging.hasPermission()

    const enabled = authStatus === AuthorizationStatus.AUTHORIZED || authStatus === AuthorizationStatus.PROVISIONAL

    console.log("Estado actual de permisos:", enabled)
    return enabled
  } catch (error) {
    console.error("Error al verificar estado de permisos:", error)
    return false
  }
}
