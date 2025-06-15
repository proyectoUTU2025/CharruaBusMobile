"use client"

import { useState } from "react"
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native"
import Icon from "react-native-vector-icons/MaterialIcons"
import { requestPasswordReset, verifyResetCode, resetPassword } from "../services/authService"
import PasswordRequirements from "../components/passwordRequirements"
import { validatePassword, passwordsMatch } from "../utils/passwordValidator"

// Tipos para los estados del flujo de recuperación
type RecoveryStep = "email" | "token" | "newPassword"

const RecoverPasswordScreen = ({ navigation }: any) => {
  // Estados para manejar el flujo
  const [currentStep, setCurrentStep] = useState<RecoveryStep>("email")
  const [email, setEmail] = useState("")
  const [code, setCode] = useState("") // Este es el código que ingresa el usuario
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // ⚠️ CORREGIDO: Estados separados para cada campo de contraseña
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Función para solicitar el código de recuperación
  const handleRequestToken = async () => {
    if (!email || !validateEmail(email)) {
      setError("Por favor, ingresa un correo electrónico válido")
      return
    }

    setError(null)
    setLoading(true)

    try {
      await requestPasswordReset(email)
      setCurrentStep("token")
    } catch (err: any) {
      setError(err.message || "Ocurrió un error al procesar tu solicitud. Intenta nuevamente.")
    } finally {
      setLoading(false)
    }
  }

  // Función para validar el código
  const handleValidateToken = async () => {
    if (!code || code.length < 6) {
      setError("Por favor, ingresa el código de verificación completo")
      return
    }

    setError(null)
    setLoading(true)

    try {
      await verifyResetCode({
        email,
        verificationCode: code,
      })
      setCurrentStep("newPassword")
    } catch (err: any) {
      setError(err.message || "Código inválido o expirado. Intenta nuevamente.")
    } finally {
      setLoading(false)
    }
  }

  // Función para establecer nueva contraseña (MANEJO DE ERRORES MEJORADO)
  const handleSetNewPassword = async () => {
    const passwordValidation = validatePassword(newPassword)

    if (!passwordValidation.isValid) {
      setError("La contraseña no cumple con los requisitos de seguridad")
      return
    }

    if (!passwordsMatch(newPassword, confirmPassword)) {
      setError("Las contraseñas ingresadas no coinciden")
      return
    }

    setError(null)
    setLoading(true)

    try {
      await resetPassword({
        email,
        verificationCode: code, // ⚠️ CORREGIDO: usar verificationCode en lugar de token
        newPassword,
        confirmPassword,
      })

      setLoading(false)

      // Mostrar mensaje de éxito
      Alert.alert("¡Contraseña actualizada!", "Tu contraseña ha sido actualizada exitosamente.", [
        {
          text: "Iniciar sesión",
          onPress: () => navigation.navigate("Login"),
        },
      ])
    } catch (err: any) {
      console.log("🚨 Error capturado en handleSetNewPassword:", err.message)

      // ⚠️ MEJORADO: Mostrar el mensaje exacto del error
      let errorMessage = "Ocurrió un error al actualizar tu contraseña. Intenta nuevamente."

      if (err.message) {
        // Si hay un mensaje específico, usarlo
        errorMessage = err.message
      }

      console.log("🚨 Mensaje de error a mostrar:", errorMessage)
      setError(errorMessage)
      setLoading(false)
    }
  }

  // Función para validar formato de email
  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return re.test(email)
  }

  // ⚠️ FUNCIÓN MEJORADA: Manejo correcto de navegación hacia atrás
  const handleGoBack = () => {
    console.log("🔙 Botón volver presionado, paso actual:", currentStep)

    if (currentStep === "token") {
      console.log("🔙 Volviendo a paso email")
      setCurrentStep("email")
      setError(null) // Limpiar errores al navegar
    } else if (currentStep === "newPassword") {
      console.log("🔙 Volviendo a paso token")
      setCurrentStep("token")
      setError(null) // Limpiar errores al navegar
    } else {
      console.log("🔙 Volviendo a pantalla anterior")
      navigation.goBack()
    }
  }

  // Función para reenviar el código
  const handleResendToken = async () => {
    setError(null)
    setLoading(true)

    try {
      await requestPasswordReset(email)
      setLoading(false)
      Alert.alert("Código reenviado", "Se ha enviado un nuevo código de verificación a tu correo electrónico.")
    } catch (err: any) {
      console.log("🚨 Error en reenvío:", err.message)

      // Manejar errores específicos
      if (err.message.includes("demasiadas solicitudes") || err.message.includes("429")) {
        setError("Has realizado demasiados intentos. Espera unos minutos antes de solicitar otro código.")
      } else if (err.message.includes("no existe") || err.message.includes("inactiva")) {
        setError("El correo ingresado no existe o la cuenta está inactiva.")
      } else {
        setError(err.message || "No se pudo reenviar el código. Intenta nuevamente.")
      }
      setLoading(false)
    }
  }

  // Renderizado condicional según el paso actual
  const renderStep = () => {
    switch (currentStep) {
      case "email":
        return (
          <>
            <Text style={styles.stepTitle}>Recuperación de contraseña</Text>
            <Text style={styles.stepDescription}>
              Ingresa tu correo electrónico y te enviaremos un código de verificación para restablecer tu contraseña.
            </Text>

            <View style={styles.inputContainer}>
              <Icon name="email" size={20} color="#79747E" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Correo electrónico"
                placeholderTextColor="#79747E"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View>

            <TouchableOpacity style={styles.primaryButton} onPress={handleRequestToken} disabled={loading}>
              {loading ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <Text style={styles.buttonText}>Enviar código</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.secondaryButton} onPress={() => navigation.goBack()} disabled={loading}>
              <Text style={styles.secondaryButtonText}>Cancelar</Text>
            </TouchableOpacity>
          </>
        )

      case "token":
        return (
          <>
            <Text style={styles.stepTitle}>Verificación</Text>
            <Text style={styles.stepDescription}>
              Hemos enviado un código de verificación a <Text style={styles.emailHighlight}>{email}</Text>. Por favor,
              ingresa el código para continuar.
            </Text>

            <View style={styles.inputContainer}>
              <Icon name="vpn-key" size={20} color="#79747E" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Código de verificación"
                placeholderTextColor="#79747E"
                keyboardType="number-pad"
                value={code}
                onChangeText={setCode}
                maxLength={6}
              />
            </View>

            <TouchableOpacity style={styles.primaryButton} onPress={handleValidateToken} disabled={loading}>
              {loading ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <Text style={styles.buttonText}>Verificar código</Text>
              )}
            </TouchableOpacity>

            <View style={styles.actionRow}>
              <TouchableOpacity onPress={handleGoBack}>
                <Text style={styles.linkText}>Cambiar correo</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={handleResendToken}>
                <Text style={styles.linkText}>Reenviar código</Text>
              </TouchableOpacity>
            </View>
          </>
        )

      case "newPassword":
        return (
          <>
            <Text style={styles.stepTitle}>Nueva contraseña</Text>
            <Text style={styles.stepDescription}>Crea una nueva contraseña segura para tu cuenta.</Text>

            {/* ⚠️ SOLUCIONADO: Campo de nueva contraseña con key para forzar re-render */}
            <View style={styles.inputContainer}>
              <Icon name="lock" size={20} color="#79747E" style={styles.inputIcon} />
              <TextInput
                key="newPassword"
                style={styles.input}
                placeholder="Nueva contraseña"
                placeholderTextColor="#79747E"
                secureTextEntry={!showNewPassword}
                value={newPassword}
                onChangeText={setNewPassword}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity onPress={() => setShowNewPassword(!showNewPassword)} style={styles.visibilityIcon}>
                <Icon name={showNewPassword ? "visibility-off" : "visibility"} size={20} color="#79747E" />
              </TouchableOpacity>
            </View>

            {/* ⚠️ SOLUCIONADO: Campo de confirmar contraseña con key para forzar re-render */}
            <View style={styles.inputContainer}>
              <Icon name="lock-outline" size={20} color="#79747E" style={styles.inputIcon} />
              <TextInput
                key="confirmPassword"
                style={styles.input}
                placeholder="Confirmar contraseña"
                placeholderTextColor="#79747E"
                secureTextEntry={!showConfirmPassword}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                style={styles.visibilityIcon}
              >
                <Icon name={showConfirmPassword ? "visibility-off" : "visibility"} size={20} color="#79747E" />
              </TouchableOpacity>
            </View>

            {/* Resto del código permanece igual */}
            <PasswordRequirements password={newPassword} confirmPassword={confirmPassword} showMatchValidation={true} />

            <TouchableOpacity
              style={[
                styles.primaryButton,
                (!validatePassword(newPassword).isValid || !passwordsMatch(newPassword, confirmPassword)) &&
                  styles.disabledButton,
              ]}
              onPress={handleSetNewPassword}
              disabled={
                loading || !validatePassword(newPassword).isValid || !passwordsMatch(newPassword, confirmPassword)
              }
            >
              {loading ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <Text style={styles.buttonText}>Aceptar</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.secondaryButton} onPress={handleGoBack} disabled={loading}>
              <Text style={styles.secondaryButtonText}>Volver</Text>
            </TouchableOpacity>
          </>
        )
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent={true} />

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.keyboardAvoidingView}>
        <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
          {/* ⚠️ CORREGIDO: Header con botón de regreso mejorado */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={handleGoBack}
              activeOpacity={0.7}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Icon name="arrow-back" size={24} color="#3B82F6" />
            </TouchableOpacity>
          </View>

          {/* Logo de la app */}
          <View style={styles.logoContainer}>
            <View style={styles.logoCircle}>
              <Icon name="lock-open" size={40} color="#3B82F6" />
            </View>
          </View>

          {/* Contenido principal */}
          <View style={styles.contentContainer}>
            {/* Mensaje de error si existe */}
            {error && (
              <View style={styles.errorContainer}>
                <Icon name="error-outline" size={20} color="#F44336" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {/* Paso actual del flujo */}
            {renderStep()}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFBFE",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 0,
    paddingBottom: 40,
  },
  // ⚠️ CORREGIDO: Header con mejor posicionamiento
  header: {
    height: 60,
    justifyContent: "center",
    alignItems: "flex-start",
    paddingTop: Platform.OS === "ios" ? 10 : 20,
    marginBottom: 10,
    paddingHorizontal: 24,
  },
  // ⚠️ CORREGIDO: Botón de volver con mejor diseño y área táctil
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(59, 130, 246, 0.1)",
  },
  logoContainer: {
    alignItems: "center",
    marginVertical: 24,
  },
  logoCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "#E8F0FE",
    justifyContent: "center",
    alignItems: "center",
  },
  contentContainer: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 24,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: "600",
    color: "#1C1B1F",
    marginBottom: 16,
    textAlign: "center",
  },
  stepDescription: {
    fontSize: 16,
    color: "#49454F",
    marginBottom: 32,
    textAlign: "center",
    lineHeight: 24,
  },
  emailHighlight: {
    fontWeight: "600",
    color: "#3B82F6",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    height: 56,
    borderWidth: 1,
    borderColor: "#79747E",
    borderRadius: 8,
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  visibilityIcon: {
    padding: 4,
  },
  input: {
    flex: 1,
    height: "100%",
    color: "#1C1B1F",
    fontSize: 16,
  },
  primaryButton: {
    width: "100%",
    height: 56,
    backgroundColor: "#3B82F6",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  disabledButton: {
    backgroundColor: "#A0C2F9",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  secondaryButton: {
    width: "100%",
    height: 56,
    backgroundColor: "transparent",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  secondaryButtonText: {
    color: "#3B82F6",
    fontSize: 16,
    fontWeight: "600",
  },
  actionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 16,
  },
  linkText: {
    color: "#3B82F6",
    fontSize: 14,
    fontWeight: "500",
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFEBEE",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    width: "100%",
  },
  errorText: {
    color: "#F44336",
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
})

export default RecoverPasswordScreen
