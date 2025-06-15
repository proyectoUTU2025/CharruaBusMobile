"use client"

import { getFCMToken } from "./notificationService"

// Configuración de la API - puede ser modificada según el entorno
const API_BASE_URL = "http://192.168.1.2:8080"

// Función robusta para obtener el token de dispositivo usando el servicio de notificaciones
const getDeviceToken = async (): Promise<string> => {
  try {
    console.log("Obteniendo token FCM...")
    const token = await getFCMToken()
    console.log("FCM Token obtenido:", token ? "Sí" : "No")

    if (!token) {
      console.warn("No se pudo obtener FCM token, usando token por defecto")
      // Generar un token temporal si no se puede obtener el FCM
      const tempToken = `temp_token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      console.log("Token temporal generado:", tempToken)
      return tempToken
    }

    return token
  } catch (error) {
    console.error("Error obteniendo token de dispositivo:", error)
    // Generar un token temporal en caso de error
    const tempToken = `temp_token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    console.log("Token temporal generado por error:", tempToken)
    return tempToken
  }
}

export const login = async (email: string, password: string): Promise<string> => {
  try {
    console.log("Iniciando login con URL:", API_BASE_URL)
    const deviceToken = await getDeviceToken()

    console.log("Device token obtenido:", deviceToken ? "Sí" : "No")

    // Agregar timeout para evitar esperas indefinidas
    const controller = new AbortController()
    const timeoutId = setTimeout(() => {
      console.log("Timeout de login alcanzado")
      controller.abort()
    }, 15000) // 15 segundos

    console.log("Enviando petición de login...")
    const response = await fetch(`${API_BASE_URL}/auth/login-mobile`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: email.trim(),
        password,
        deviceToken,
      }),
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    // Intentar parsear la respuesta
    let result
    try {
      result = await response.json()
    } catch (parseError) {
      console.error(
        "Error parseando respuesta JSON:",
        parseError instanceof Error ? parseError.message : String(parseError),
      )
      throw new Error("El servidor envió una respuesta inválida.")
    }

    console.log("Response status:", response.status)
    console.log("Response result:", result)

    if (!response.ok) {
      // Manejar los errores específicos de la API backend
      const errorMessage = result.message || result.error || "Error desconocido"

      if (response.status === 400) {
        // BadCredentialsException, IllegalArgumentException
        if (errorMessage.includes("Credenciales erróneas")) {
          throw new Error("Email o contraseña incorrectos. Verifica tus datos.")
        } else if (errorMessage.includes("deviceToken es obligatorio")) {
          throw new Error("Error de configuración. Reinicia la app e intenta nuevamente.")
        } else if (errorMessage.includes("app móvil es de uso exclusivo")) {
          throw new Error("Esta cuenta no tiene permisos para usar la app móvil.")
        } else {
          throw new Error(errorMessage)
        }
      } else if (response.status === 401) {
        // Unauthorized - credenciales incorrectas
        throw new Error("Email o contraseña incorrectos. Verifica tus datos.")
      } else if (response.status === 403) {
        // EmailNotVerifiedException o cuenta desactivada
        if (errorMessage.includes("verificar tu correo") || errorMessage.includes("desactivada")) {
          throw new Error("Debes verificar tu correo electrónico o tu cuenta está desactivada.")
        } else {
          throw new Error("Acceso denegado. Contacta al soporte.")
        }
      } else if (response.status === 404) {
        // UsernameNotFoundException
        throw new Error("Usuario no encontrado. Verifica tu email.")
      } else if (response.status >= 500) {
        throw new Error("Error del servidor. Inténtalo más tarde.")
      } else {
        throw new Error(errorMessage)
      }
    }

    // Verificar que la respuesta tenga el token
    if (!result || !result.data || !result.data.token) {
      console.error("Respuesta del servidor sin token:", result)
      throw new Error("El servidor no envió un token válido. Inténtalo más tarde.")
    }

    console.log("Login exitoso, token recibido")
    return result.data.token
  } catch (error: unknown) {
    // Manejo robusto de errores
    if (error instanceof Error) {
      if (error.name === "AbortError") {
        console.log("Login cancelado por timeout")
        throw new Error("La petición tardó demasiado. Verifica tu conexión a internet.")
      }

      if (error.message.includes("fetch") || error.message.includes("Network request failed")) {
        console.log("Error de red en login")
        throw new Error("Error de conexión. Verifica tu internet y que el servidor esté disponible.")
      }

      console.log("Error de login:", error.message)
      throw error
    }

    console.log("Error inesperado en login:", error)
    throw new Error("Error inesperado. Inténtalo más tarde.")
  }
}

export const logout = async (authToken?: string): Promise<void> => {
  try {
    console.log("Iniciando logout...")
    if (authToken) {
      const deviceToken = await getDeviceToken()

      console.log("Enviando petición de logout al servidor...")
      const response = await fetch(`${API_BASE_URL}/auth/logout`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ deviceToken }),
      })

      if (response.ok) {
        console.log("Logout exitoso en servidor")
      } else {
        console.warn("Error en logout del servidor, pero continuando con logout local")
      }
    } else {
      console.log("No hay token, solo logout local")
    }
  } catch (error) {
    console.error("Error al cerrar sesión:", error)
    // No lanzar error para permitir logout local incluso
  }
}

// Tipo combinado para datos de registro
export type RegisterData = {
  email: string
  password: string
  nombre: string
  apellido: string
  fechaNacimiento: string
  documento: string
  tipoDocumento: string
  situacionLaboral: string
  genero: string
}

export const registerUser = async (data: RegisterData): Promise<void> => {
  try {
    console.log("Iniciando registro de usuario...")
    const deviceToken = await getDeviceToken()

    // Agregar timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => {
      console.log("Timeout de registro alcanzado")
      controller.abort()
    }, 20000) // 20 segundos para registro

    console.log("Enviando petición de registro...")
    const response = await fetch(`${API_BASE_URL}/auth/registrar`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ...data, deviceToken }),
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    let result
    try {
      result = await response.json()
    } catch (parseError) {
      console.error("Error parseando respuesta de registro:", parseError)
      throw new Error("El servidor envió una respuesta inválida.")
    }

    console.log("Response status registro:", response.status)
    console.log("Response result registro:", result)

    if (!response.ok) {
      if (response.status === 400) {
        const errorMessage = result.message || "Datos de registro inválidos"
        console.log("Error 400 en registro:", errorMessage)
        throw new Error(errorMessage)
      } else if (response.status === 409) {
        console.log("Error 409 en registro: Email duplicado")
        throw new Error("El email ya está registrado. Usa otro email o inicia sesión.")
      } else if (response.status >= 500) {
        console.log("Error 500+ en registro")
        throw new Error("Error del servidor. Inténtalo más tarde.")
      } else {
        const errorMessage = result.message || "Error en el registro"
        console.log("Error genérico en registro:", errorMessage)
        throw new Error(errorMessage)
      }
    }

    console.log("Registro exitoso")
  } catch (error: unknown) {
    if (error instanceof Error) {
      if (error.name === "AbortError") {
        console.log("Registro cancelado por timeout")
        throw new Error("La petición tardó demasiado. Verifica tu conexión a internet.")
      }

      if (error.message.includes("fetch") || error.message.includes("Network request failed")) {
        console.log("Error de red en registro")
        throw new Error("Error de conexión. Verifica tu internet.")
      }

      console.log("Error en registro:", error.message)
      throw error
    }

    console.log("Error inesperado en registro:", error)
    throw new Error("Error inesperado en el registro.")
  }
}

export const verifyEmailCode = async (email: string, verificationCode: string) => {
  try {
    console.log("Iniciando verificación de email...")

    // Agregar timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => {
      console.log("Timeout de verificación alcanzado")
      controller.abort()
    }, 10000) // 10 segundos

    console.log("Enviando petición de verificación...")
    const response = await fetch(`${API_BASE_URL}/auth/verify-email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: email,
        verificationCode: verificationCode,
      }),
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    let result
    try {
      result = await response.json()
    } catch (parseError) {
      console.error("Error parseando respuesta de verificación:", parseError)
      throw new Error("El servidor envió una respuesta inválida.")
    }

    console.log("Response status verificación:", response.status)
    console.log("Response result verificación:", result)

    if (!response.ok) {
      if (response.status === 400) {
        console.log("Error 400 en verificación: Código inválido")
        throw new Error("Código de verificación inválido o formato incorrecto")
      } else if (response.status === 404) {
        console.log("Error 404 en verificación: Usuario no encontrado")
        throw new Error("Usuario no encontrado o email no registrado")
      } else if (response.status === 410) {
        console.log("Error 410 en verificación: Código expirado")
        throw new Error("El código ha expirado. Solicita uno nuevo.")
      } else if (response.status === 429) {
        console.log("Error 429 en verificación: Demasiados intentos")
        throw new Error("Demasiados intentos. Espera antes de intentar nuevamente.")
      } else if (response.status >= 500) {
        console.log("Error 500+ en verificación")
        throw new Error("Error del servidor. Inténtalo más tarde.")
      } else {
        const errorMessage = result.message || "Error en la verificación"
        console.log("Error genérico en verificación:", errorMessage)
        throw new Error(errorMessage)
      }
    }

    console.log("Verificación exitosa")
    return result
  } catch (error: unknown) {
    if (error instanceof Error) {
      if (error.name === "AbortError") {
        throw new Error("La petición tardó demasiado. Verifica tu conexión a internet.")
      }
      if (error.message.includes("fetch") || error.message.includes("Network request failed")) {
        console.log("Error de red en verificación")
        throw new Error("Error de conexión. Verifica tu internet.")
      }
      // ⚠️ IMPORTANTE: Re-lanzar el error original sin modificar
      throw error
    }
    throw new Error("Error inesperado en verificación.")
  }
}

export const resendVerificationCode = async (email: string) => {
  try {
    console.log("Iniciando reenvío de código...")

    // Agregar timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => {
      console.log("Timeout de reenvío alcanzado")
      controller.abort()
    }, 10000) // 10 segundos

    console.log("Enviando petición de reenvío...")
    const response = await fetch(`${API_BASE_URL}/auth/resend-verification`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: email,
      }),
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    let result
    try {
      result = await response.json()
    } catch (parseError) {
      console.error("Error parseando respuesta de reenvío:", parseError)
      throw new Error("El servidor envió una respuesta inválida.")
    }

    console.log("Response status reenvío:", response.status)
    console.log("Response result reenvío:", result)

    if (!response.ok) {
      if (response.status === 429) {
        console.log("Error 429 en reenvío: Demasiados intentos")
        throw new Error("Demasiados intentos. Espera antes de solicitar otro código.")
      } else if (response.status === 404) {
        console.log("Error 404 en reenvío: Usuario no encontrado")
        throw new Error("Usuario no encontrado")
      } else if (response.status >= 500) {
        console.log("Error 500+ en reenvío")
        throw new Error("Error del servidor. Inténtalo más tarde.")
      } else {
        const errorMessage = result.message || result.error || "Error al reenviar código"
        console.log("Error genérico en reenvío:", errorMessage)
        throw new Error(errorMessage)
      }
    }

    console.log("Reenvío exitoso")
    return result
  } catch (error: unknown) {
    if (error instanceof Error) {
      if (error.name === "AbortError") {
        console.log("Reenvío cancelado por timeout")
        throw new Error("La petición tardó demasiado. Verifica tu conexión a internet.")
      }

      if (error.message.includes("fetch") || error.message.includes("Network request failed")) {
        console.log("Error de red en reenvío")
        throw new Error("Error de conexión. Verifica tu internet.")
      }

      console.log("Error en reenvío:", error.message)
      throw error
    }

    console.log("Error inesperado en reenvío:", error)
    throw new Error("Error inesperado al reenviar código.")
  }
}

// ========================================
// FUNCIONES DE RECUPERACIÓN DE CONTRASEÑA MEJORADAS
// Correspondientes exactamente a los métodos del backend Java:
// - solicitarResetPassword() -> requestPasswordReset()
// - verifyResetCode() -> verifyResetCode()
// - resetearPassword() -> resetPassword()
// ========================================

// Interfaces para los DTOs de recuperación de contraseña (CORREGIDAS SEGÚN BACKEND)
interface ResetPasswordRequestDto {
  email: string
  verificationCode: string // ⚠️ CORREGIDO: El backend espera 'verificationCode', no 'token'
  newPassword: string
  confirmPassword: string
}

interface VerifyResetCodeRequestDto {
  email: string
  verificationCode: string // El backend espera 'verificationCode'
}

interface ChangePasswordRequestDto {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

// Solicitar código de recuperación de contraseña
// Corresponde al método: solicitarResetPassword(String email)
export const requestPasswordReset = async (email: string): Promise<void> => {
  try {
    console.log("🔍 === SOLICITUD DE RECUPERACIÓN ===")
    console.log("📧 Email:", email.trim())
    console.log("🌐 URL:", `${API_BASE_URL}/auth/forgot-password`)

    const controller = new AbortController()
    const timeoutId = setTimeout(() => {
      console.log("⏰ Timeout de recuperación alcanzado")
      controller.abort()
    }, 15000)

    const requestBody = { email: email.trim() }
    console.log("📤 Body:", JSON.stringify(requestBody))

    console.log("🚀 Enviando petición...")
    const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    console.log("📊 Status:", response.status)

    let result
    try {
      const responseText = await response.text()
      console.log("📄 Respuesta texto:", responseText)

      if (responseText) {
        result = JSON.parse(responseText)
        console.log("📦 Respuesta parseada:", result)
      } else {
        result = {}
      }
    } catch (parseError) {
      console.error("❌ Error parseando respuesta:", parseError)
      throw new Error("El servidor envió una respuesta inválida.")
    }

    if (!response.ok) {
      const errorMessage = result.message || result.error || "Error desconocido"
      console.log("🚨 Error del servidor:", errorMessage)

      // Manejo específico según las excepciones del backend Java
      if (response.status === 404) {
        // UsernameNotFoundException: "El correo ingresado no existe o la cuenta está inactiva."
        throw new Error("El correo ingresado no existe o la cuenta está inactiva.")
      } else if (response.status === 400) {
        // Otros errores de validación
        throw new Error(errorMessage)
      } else if (response.status >= 500) {
        throw new Error("Error del servidor. Inténtalo más tarde.")
      } else {
        throw new Error(errorMessage)
      }
    }

    console.log("✅ Solicitud de recuperación exitosa")
  } catch (error: unknown) {
    console.error("💥 Error en requestPasswordReset:", error)
    if (error instanceof Error) {
      if (error.name === "AbortError") {
        throw new Error("La petición tardó demasiado. Verifica tu conexión a internet.")
      }
      if (
        error.message.includes("fetch") ||
        error.message.includes("Network request failed") ||
        error.message.includes("TypeError")
      ) {
        throw new Error("Error de conexión. Verifica tu internet.")
      }
      throw error
    }
    throw new Error("Error inesperado al solicitar recuperación.")
  }
}

// ⚠️ FUNCIÓN COMPLETAMENTE REESCRITA PARA MANEJAR ERRORES CORRECTAMENTE
export const verifyResetCode = async (data: VerifyResetCodeRequestDto): Promise<void> => {
  console.log("🔍 === VERIFICACIÓN DE CÓDIGO ===")
  console.log("📧 Email:", data.email)
  console.log("🔑 Código:", data.verificationCode)
  console.log("🌐 URL:", `${API_BASE_URL}/auth/verify-reset-code`)

  const controller = new AbortController()
  const timeoutId = setTimeout(() => {
    console.log("⏰ Timeout de verificación alcanzado")
    controller.abort()
  }, 10000)

  try {
    const response = await fetch(`${API_BASE_URL}/auth/verify-reset-code`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
      signal: controller.signal,
    })

    clearTimeout(timeoutId)
    console.log("📊 Status:", response.status)

    // Intentar obtener la respuesta como texto primero
    const responseText = await response.text()
    console.log("📄 Respuesta completa:", responseText)

    let result = {}
    if (responseText) {
      try {
        result = JSON.parse(responseText)
        console.log("📦 JSON parseado:", result)
      } catch (parseError) {
        console.log("⚠️ No se pudo parsear JSON, usando texto plano")
        result = { message: responseText }
      }
    }

    // Si hay error HTTP, lanzar excepción con mensaje del backend
    if (!response.ok) {
      const backendMessage = result.message || result.error || responseText || "Error desconocido"
      console.log("🚨 Error del backend:", backendMessage)

      // Lanzar directamente el mensaje del backend sin modificar
      throw new Error(backendMessage)
    }

    console.log("✅ Verificación exitosa")
  } catch (error) {
    clearTimeout(timeoutId)
    console.error("💥 Error capturado:", error)

    if (error instanceof Error) {
      // Solo manejar timeouts como errores de conexión
      if (error.name === "AbortError") {
        throw new Error("La petición tardó demasiado. Verifica tu conexión a internet.")
      }

      // Para errores de fetch reales (sin conexión)
      if (
        error.message.includes("Failed to fetch") ||
        error.message.includes("ERR_NETWORK") ||
        error.message.includes("ERR_INTERNET_DISCONNECTED")
      ) {
        throw new Error("Error de conexión. Verifica tu internet.")
      }

      // Todos los demás errores son del backend, re-lanzar tal como vienen
      throw error
    }

    throw new Error("Error inesperado al verificar código.")
  }
}

// Resetear contraseña con código de verificación
// Corresponde al método: resetearPassword(ResetPasswordRequestDto request)
export const resetPassword = async (data: ResetPasswordRequestDto): Promise<void> => {
  try {
    console.log("🔍 === RESETEO DE CONTRASEÑA ===")
    console.log("📧 Email:", data.email)
    console.log("🔑 Código:", data.verificationCode)
    console.log("🌐 URL:", `${API_BASE_URL}/auth/reset-password`)

    const controller = new AbortController()
    const timeoutId = setTimeout(() => {
      console.log("⏰ Timeout de reseteo alcanzado")
      controller.abort()
    }, 15000)

    console.log(
      "📤 Body:",
      JSON.stringify({
        email: data.email,
        verificationCode: data.verificationCode,
        newPassword: "***",
        confirmPassword: "***",
      }),
    )

    const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    console.log("📊 Status:", response.status)

    let result
    try {
      const responseText = await response.text()
      console.log("📄 Respuesta texto:", responseText)

      if (responseText) {
        result = JSON.parse(responseText)
        console.log("📦 Respuesta parseada:", result)
      } else {
        result = {}
      }
    } catch (parseError) {
      console.error("❌ Error parseando respuesta:", parseError)
      // Si no se puede parsear la respuesta pero el status es de error, es un error del servidor
      if (!response.ok) {
        throw new Error("El servidor envió una respuesta inválida.")
      }
      result = {}
    }

    if (!response.ok) {
      const errorMessage = result.message || result.error || "Error al resetear contraseña"
      console.log("🚨 Error del servidor:", errorMessage)

      // Manejo específico según las excepciones del backend Java
      if (response.status === 400) {
        // IllegalArgumentException con diferentes casos específicos
        if (errorMessage.includes("Código inválido") || errorMessage.includes("expirado")) {
          throw new Error("Código inválido o expirado.")
        } else if (errorMessage.includes("contraseñas no coinciden")) {
          throw new Error("Las contraseñas no coinciden.")
        } else if (
          errorMessage.includes("nueva contraseña debe ser distinta") ||
          errorMessage.includes("distinta a la anterior")
        ) {
          throw new Error("La nueva contraseña debe ser distinta a la anterior.")
        } else if (errorMessage.includes("no debe estar vacío") || errorMessage.includes("NotBlank")) {
          throw new Error("Todos los campos son obligatorios.")
        } else {
          // Cualquier otro error 400, mostrar mensaje exacto del backend
          throw new Error(errorMessage)
        }
      } else if (response.status === 404) {
        // UsernameNotFoundException: "El correo ingresado no existe o la cuenta está inactiva."
        throw new Error("El correo ingresado no existe o la cuenta está inactiva.")
      } else if (response.status >= 500) {
        throw new Error("Error del servidor. Inténtalo más tarde.")
      } else {
        // Para otros códigos de estado, mostrar el mensaje exacto del backend
        throw new Error(errorMessage)
      }
    }

    console.log("✅ Reseteo de contraseña exitoso")
  } catch (error: unknown) {
    console.error("💥 Error en resetPassword:", error)
    if (error instanceof Error) {
      if (error.name === "AbortError") {
        throw new Error("La petición tardó demasiado. Verifica tu conexión a internet.")
      }
      if (
        error.message.includes("fetch") ||
        error.message.includes("Network request failed") ||
        error.message.includes("ERR_NETWORK")
      ) {
        console.log("Error de red en reseteo")
        throw new Error("Error de conexión. Verifica tu internet.")
      }
      // ⚠️ IMPORTANTE: Re-lanzar el error original sin modificar
      throw error
    }
    throw new Error("Error inesperado al resetear contraseña.")
  }
}

// Cambiar contraseña (usuario autenticado)
export const changePassword = async (data: ChangePasswordRequestDto, authToken: string): Promise<void> => {
  try {
    console.log("Iniciando cambio de contraseña...")

    const controller = new AbortController()
    const timeoutId = setTimeout(() => {
      console.log("Timeout de cambio de contraseña alcanzado")
      controller.abort()
    }, 15000)

    const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify(data),
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    let result
    try {
      result = await response.json()
    } catch (parseError) {
      console.error("Error parseando respuesta de cambio:", parseError)
      throw new Error("El servidor envió una respuesta inválida.")
    }

    if (!response.ok) {
      const errorMessage = result.message || result.error || "Error al cambiar contraseña"

      if (response.status === 400) {
        if (errorMessage.includes("contraseña actual es incorrecta")) {
          throw new Error("La contraseña actual es incorrecta.")
        } else if (errorMessage.includes("contraseñas no coinciden")) {
          throw new Error("La nueva contraseña y la confirmación no coinciden.")
        } else if (errorMessage.includes("nueva contraseña debe ser distinta")) {
          throw new Error("La nueva contraseña debe ser distinta a la anterior.")
        } else {
          throw new Error(errorMessage)
        }
      } else if (response.status === 401) {
        throw new Error("Sesión expirada. Inicia sesión nuevamente.")
      } else if (response.status === 404) {
        throw new Error("Usuario no encontrado.")
      } else {
        throw new Error(errorMessage)
      }
    }

    console.log("Cambio de contraseña exitoso")
  } catch (error: unknown) {
    if (error instanceof Error) {
      if (error.name === "AbortError") {
        throw new Error("La petición tardó demasiado. Verifica tu conexión a internet.")
      }
      if (error.message.includes("fetch") || error.message.includes("Network request failed")) {
        console.log("Error de red en cambio de contraseña")
        throw new Error("Error de conexión. Verifica tu internet.")
      }
      throw error
    }
    throw new Error("Error inesperado al cambiar contraseña.")
  }
}

// Función auxiliar para configurar la URL base (útil para diferentes entornos)
export const setApiBaseUrl = (url: string) => {
  console.log("Cambiando API_BASE_URL de", API_BASE_URL, "a", url)
  // En una implementación real, esto podría modificar una variable de configuración
}

// Función auxiliar para obtener la URL actual
export const getApiBaseUrl = () => {
  return API_BASE_URL
}
