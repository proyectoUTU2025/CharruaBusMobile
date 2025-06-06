
"use client"

// AuthContext.tsx - Versión combinada con todas las funcionalidades
import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { login as loginService, logout as logoutService } from "../services/authService"

// Función para decodificar JWT (sin verificar la firma, solo para obtener el payload)
const decodeJWT = (token: string) => {
  try {
    const base64Url = token.split(".")[1]
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/")
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join(""),
    )
    return JSON.parse(jsonPayload)
  } catch (error) {
    console.error("Error decoding JWT:", error)
    return null
  }
}

// Tipo para la información del usuario
type UserInfo = {
  id: number
  email: string
  name?: string
  apellido?: string
  rol?: string
  exp?: number // Timestamp de expiración
  iat?: number // Timestamp de emisión
}

type AuthContextType = {
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  token: string | null
  user: UserInfo | null
  loading: boolean
  error: string | null
  clearError: () => void
  isAuthLoading: boolean
  refreshUserInfo: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  console.log("AuthProvider con AsyncStorage y JWT renderizado")

  const [token, setToken] = useState<string | null>(null)
  const [user, setUser] = useState<UserInfo | null>(null)
  const [loading, setLoading] = useState(false)
  const [isAuthLoading, setIsAuthLoading] = useState(true) // De la versión 1
  const [error, setError] = useState<string | null>(null)

  // Función para extraer información del usuario del token
  const extractUserFromToken = (authToken: string): UserInfo | null => {
    console.log("Extrayendo información del usuario del token...")
    const decoded = decodeJWT(authToken)
    if (!decoded) {
      console.log("No se pudo decodificar el token")
      return null
    }

    // Adapta estos campos según la estructura de tu JWT
    const userInfo = {
      id: decoded.userId || decoded.id || decoded.sub,
      email: decoded.email || decoded.username,
      name: decoded.name || decoded.firstName,
      apellido: decoded.apellido || decoded.lastName,
      rol: decoded.rol || decoded.role,
      exp: decoded.exp,
      iat: decoded.iat,
    }

    console.log("Información del usuario extraída:", {
      id: userInfo.id,
      email: userInfo.email,
      rol: userInfo.rol,
      exp: userInfo.exp ? new Date(userInfo.exp * 1000).toISOString() : "No definido",
    })

    return userInfo
  }

  // Función para verificar si el token ha expirado
  const isTokenExpired = (userInfo: UserInfo | null): boolean => {
    if (!userInfo?.exp) {
      console.log("Token sin fecha de expiración")
      return false
    }
    const isExpired = Date.now() >= userInfo.exp * 1000
    console.log("Verificación de expiración:", {
      now: new Date().toISOString(),
      exp: new Date(userInfo.exp * 1000).toISOString(),
      isExpired,
    })
    return isExpired
  }

  const login = async (email: string, password: string) => {
    console.log("Login con servicio real y JWT llamado")
    setError(null)
    setLoading(true)

    try {
      console.log("Llamando a loginService...")
      const newToken = await loginService(email, password)
      console.log("LoginService exitoso, procesando token...")

      const userInfo = extractUserFromToken(newToken)

      if (!userInfo) {
        console.error("Token inválido recibido del servidor")
        throw new Error("Token inválido recibido del servidor")
      }

      // Verificar si el token ya está expirado
      if (isTokenExpired(userInfo)) {
        console.error("El token recibido ya está expirado")
        throw new Error("El token recibido ya está expirado")
      }

      console.log("Guardando token en AsyncStorage...")
      await AsyncStorage.setItem("authToken", newToken)
      setToken(newToken)
      setUser(userInfo)
      console.log("Token guardado y usuario establecido exitosamente")
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Error en login"
      console.error("Error en login:", errorMessage)
      setError(errorMessage)
      throw error // Re-lanzar para mantener compatibilidad con versión 2

    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {

    console.log("Logout con servicio real y limpieza completa llamado")
    try {
      setLoading(true)
      console.log("Llamando a logoutService...")
      await logoutService(token || undefined)
      console.log("LogoutService exitoso, removiendo token...")
      await AsyncStorage.removeItem("authToken")
      setToken(null)
      setUser(null)
      setError(null)
      console.log("Logout completado exitosamente")
    } catch (error) {
      console.error("Error en logout real:", error)
      // En caso de error, limpiamos el token de todos modos
      console.log("Limpiando token y usuario a pesar del error...")
      try {
        await AsyncStorage.removeItem("authToken")
      } catch (removeError) {
        console.error("Error removiendo token después de fallo:", removeError)
      }
      setToken(null)
      setUser(null)

    } finally {
      setLoading(false)
    }
  }

  const clearError = () => {
    console.log("Limpiando error")
    setError(null)
  }

  // Función para refrescar la información del usuario desde el token actual
  const refreshUserInfo = async () => {
    console.log("Refrescando información del usuario...")
    if (!token) {
      console.log("No hay token para refrescar")
      return
    }

    try {
      const userInfo = extractUserFromToken(token)
      if (userInfo && !isTokenExpired(userInfo)) {
        console.log("Información del usuario refrescada exitosamente")
        setUser(userInfo)
      } else {
        console.log("Token expirado durante refresh, haciendo logout...")
        await logout()
      }
    } catch (error) {
      console.error("Error refreshing user info:", error)
      await logout()
    }
  }

  const checkToken = async () => {

    console.log("checkToken iniciado con verificación JWT")
    try {
      const storedToken = await AsyncStorage.getItem("authToken")
      console.log("Token almacenado encontrado:", storedToken ? "Sí" : "No")

      if (storedToken) {
        console.log("Procesando token almacenado...")
        const userInfo = extractUserFromToken(storedToken)

        if (userInfo && !isTokenExpired(userInfo)) {
          console.log("Token válido, estableciendo usuario y token")
          setToken(storedToken)
          setUser(userInfo)
        } else {
          console.log("Token expirado o inválido, limpiando...")
          await AsyncStorage.removeItem("authToken")
          setToken(null)
          setUser(null)
        }
      }
    } catch (error) {
      console.error("Error checking stored token:", error)
      // En caso de error, limpiamos cualquier token corrupto
      try {
        await AsyncStorage.removeItem("authToken")
      } catch (removeError) {
        console.error("Error removing corrupted token:", removeError)
      }
      setToken(null)
      setUser(null)
    } finally {
      console.log("checkToken finalizando, estableciendo isAuthLoading = false")
      setIsAuthLoading(false)

    }
  }

  // Efecto para verificar la expiración del token periódicamente
  useEffect(() => {

    if (!user || !token) return

    console.log("Configurando verificación periódica de expiración de token")
    const checkTokenExpiration = () => {
      console.log("Verificación periódica de expiración ejecutándose...")
      if (isTokenExpired(user)) {
        console.log("Token expirado en verificación periódica, cerrando sesión...")
        logout()
      }
    }

    // Verificar cada 5 minutos
    const interval = setInterval(checkTokenExpiration, 5 * 60 * 1000)

    return () => {
      console.log("Limpiando intervalo de verificación de expiración")
      clearInterval(interval)
    }
  }, [user, token])

  useEffect(() => {
    console.log("useEffect de checkToken ejecutándose")
    checkToken()
  }, [])

  console.log("AuthProvider valores actuales:", {
    token: token ? "existe" : "null",
    user: user ? `${user.email} (${user.rol})` : "null",
    isAuthenticated: !!token && !!user,
    isAuthLoading,
    loading,
    error,
  })


  console.log('AuthProvider valores actuales:', {
    token: token ? 'existe' : 'null',
    isAuthenticated: !!token,
    isAuthLoading,
    loading,
    error
  });

  return (
    <AuthContext.Provider
      value={{

        isAuthenticated: !!token && !!user,
        login,
        logout,
        token,
        user,
        loading,
        error,
        clearError,
        isAuthLoading,
        refreshUserInfo,

      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = (): AuthContextType => {

  const context = useContext(AuthContext)
  if (context === null) {
    throw new Error("useAuth debe usarse dentro de un AuthProvider")

  }
  return context
}
