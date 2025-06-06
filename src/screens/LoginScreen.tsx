"use client"

import { useState, useEffect } from "react"
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ImageBackground,
  SafeAreaView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,

  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native"
import Icon from "react-native-vector-icons/MaterialIcons"
import type { NativeStackScreenProps } from "@react-navigation/native-stack"
import type { RootStackParamList } from "../navigation/AppNavigator"
import { useAuth } from "../context/AuthContext"

type Props = NativeStackScreenProps<RootStackParamList, "Login">

export default function LoginScreen({ navigation }: Props) {

  const [email, setEmail] = useState("")
  const [emailError, setEmailError] = useState("")
  const [password, setPassword] = useState("")
  const [passwordError, setPasswordError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [networkError, setNetworkError] = useState("")

  const { login, loading, error, clearError, isAuthenticated } = useAuth()

  // Redirige si ya está autenticado
  useEffect(() => {
    console.log("LoginScreen - Estado de autenticación:", isAuthenticated)
    if (isAuthenticated) {

      console.log("Usuario autenticado, navegando a Main")
      navigation.replace("Main")
    }
  }, [isAuthenticated, navigation])


  // Limpia errores cuando el componente se monta o cuando cambian los inputs
  useEffect(() => {
    if (error) {
      console.log("Limpiando error del contexto")
      clearError()
    }
    if (networkError) {
      console.log("Limpiando error de red")
      setNetworkError("")
    }
  }, [email, password])

  const validateEmail = (value: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const isValid = emailRegex.test(value)
    console.log("Validando email:", value, "válido:", isValid)
    setEmailError(isValid ? "" : "Formato de correo no válido")
    setEmail(value)
  }

  const validatePassword = (value: string) => {
    const isValid = value.length >= 1
    console.log("Validando contraseña, longitud:", value.length, "válida:", isValid)
    setPasswordError(isValid ? "" : "La contraseña es obligatoria")
    setPassword(value)
  }

  const handleNetworkError = (error: any): string => {
    console.error("Error de red en login:", error)

    if (error.message?.includes("Network request failed")) {
      return "Error de conexión. Verifica tu internet y vuelve a intentar."
    }

    if (error.message?.includes("timeout")) {
      return "La conexión tardó demasiado. Intenta nuevamente."
    }

    if (error.message?.includes("401")) {
      return "Credenciales incorrectas. Verifica tu email y contraseña."
    }

    if (error.message?.includes("403")) {
      return "Cuenta bloqueada o sin permisos. Contacta al soporte."
    }

    if (error.message?.includes("404")) {
      return "Usuario no encontrado. Verifica tu email o regístrate."
    }

    if (error.message?.includes("500")) {
      return "Error del servidor. Intenta más tarde."
    }

    if (error.message?.includes("Too many requests")) {
      return "Demasiados intentos. Espera unos minutos antes de intentar nuevamente."
    }

    return error.message || "Error desconocido. Intenta nuevamente."
  }

  const handleLogin = async () => {
    console.log("Iniciando proceso de login")
    clearError()
    setNetworkError("")


    // Validaciones locales
    let hasErrors = false


    if (!email.trim()) {
      console.log("Error: Email vacío")
      setEmailError("El correo electrónico es obligatorio")
      hasErrors = true
    } else if (emailError) {
      console.log("Error: Email con formato inválido")
      hasErrors = true
    }

    if (!password.trim()) {
      console.log("Error: Contraseña vacía")
      setPasswordError("La contraseña es obligatoria")
      hasErrors = true
    }

    if (hasErrors) {
      console.log("Errores de validación encontrados, cancelando login")
      return
    }

    setIsLoading(true)
    console.log("Llamando al servicio de login...")

    try {
      await login(email.trim(), password)
      console.log("Login exitoso")
      // Si llegamos aquí, el login fue exitoso
      // La navegación se manejará automáticamente por el useEffect que escucha isAuthenticated
    } catch (error: any) {
      console.log("Login failed:", error instanceof Error ? error.message : "Unknown error")

      const errorMessage = handleNetworkError(error)
      setNetworkError(errorMessage)

      // Mostrar alerta con opción de reintentar para errores de red
      if (error.message?.includes("Network request failed") || error.message?.includes("timeout")) {
        Alert.alert("Error de conexión", errorMessage, [
          {
            text: "Reintentar",
            onPress: () => handleLogin(),
          },
          {
            text: "Cancelar",
            style: "cancel",
          },
        ])
      } else {
        // Para otros errores, solo mostrar el mensaje
        Alert.alert("Error de inicio de sesión", errorMessage, [{ text: "OK" }])
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegister = () => {
    if (!isFormDisabled) {
      console.log("Navegando a Register")
      navigation.navigate("Register")
    }
  }

  const handleForgotPassword = () => {
    if (!isFormDisabled) {
      console.log("Navegando a RecoverPassword")
      navigation.navigate("RecoverPassword")
    }
  }

  const isFormDisabled = isLoading || loading

  return (
    <SafeAreaView style={styles.container}>

      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <ImageBackground source={require("../assets/background.png")} style={styles.backgroundImage} resizeMode="cover">
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.keyboardAvoidingView}
          >
            <ScrollView
              contentContainerStyle={styles.scrollViewContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.cardContainer}>
                <View style={styles.logoContainer}>
                  <Image
                    source={require("../assets/CharruaBusLogo.png")}
                    style={styles.logoImage}
                    resizeMode="contain"
                  />
                </View>
                {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
              </View>

                <Text style={styles.welcomeText}>Bienvenido</Text>

                {/* Mostrar error general si existe */}
                {(error || networkError) && (
                  <View style={styles.errorContainer}>
                    <Icon name="error-outline" size={20} color="#EF4444" />
                    <Text style={styles.generalErrorText}>{error || networkError}</Text>
                  </View>
                )}

                <View style={styles.formContainer}>
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Correo electrónico</Text>
                    <TextInput
                      style={[styles.input, emailError && styles.inputInvalid, isFormDisabled && styles.inputDisabled]}
                      placeholder="Correo electrónico"
                      placeholderTextColor="#9CA3AF"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                      value={email}
                      onChangeText={validateEmail}
                      editable={!isFormDisabled}
                    />
                    {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
                  </View>

                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Contraseña</Text>
                    <View
                      style={[
                        styles.passwordContainer,
                        passwordError && styles.inputInvalid,
                        isFormDisabled && styles.inputDisabled,
                      ]}
                    >
                      <TextInput
                        style={styles.passwordInput}
                        placeholder="Contraseña"
                        placeholderTextColor="#9CA3AF"
                        secureTextEntry={!showPassword}
                        autoCorrect={false}
                        value={password}
                        onChangeText={validatePassword}
                        editable={!isFormDisabled}
                      />
                      <TouchableOpacity
                        style={styles.eyeIcon}
                        onPress={() => setShowPassword(!showPassword)}
                        disabled={isFormDisabled}
                      >
                        <Icon
                          name={showPassword ? "visibility-off" : "visibility"}
                          size={24}
                          color={isFormDisabled ? "#D1D5DB" : "#6B7280"}
                        />
                      </TouchableOpacity>
                    </View>
                    {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
                  </View>

                  <TouchableOpacity
                    style={[styles.loginButton, isFormDisabled && styles.loginButtonDisabled]}
                    activeOpacity={0.8}
                    onPress={handleLogin}
                    disabled={isFormDisabled}
                  >
                    {isFormDisabled ? (
                      <View style={styles.loadingContainer}>
                        <ActivityIndicator size="small" color="white" />
                        <Text style={[styles.loginButtonText, styles.loadingText]}>
                          {isLoading ? "Iniciando sesión..." : "Cargando..."}
                        </Text>
                      </View>
                    ) : (
                      <Text style={styles.loginButtonText}>Iniciar sesión</Text>
                    )}
                  </TouchableOpacity>

                  <View style={styles.footerContainer}>
                    <TouchableOpacity onPress={handleRegister} disabled={isFormDisabled}>
                      <Text style={[styles.footerLink, isFormDisabled && styles.disabledLink]}>Registrarse</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleForgotPassword} disabled={isFormDisabled}>
                      <Text style={[styles.footerLink, isFormDisabled && styles.disabledLink]}>
                        ¿Olvidaste tu contraseña?
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </TouchableWithoutFeedback>

      </ImageBackground>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  backgroundImage: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
    width: "100%",
  },

  scrollViewContent: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
    paddingTop: StatusBar.currentHeight || 42,
  },
  cardContainer: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  logoContainer: {
    marginVertical: 4,
    alignItems: "center",
  },
  logoImage: {
    width: 180,
    height: 180,
  },
  welcomeText: {
    fontSize: 18,
    color: "#374151",
    marginBottom: 24,
    textAlign: "center",
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF2F2",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    width: "100%",
    borderLeftWidth: 4,
    borderLeftColor: "#EF4444",
  },
  generalErrorText: {
    color: "#EF4444",
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
  formContainer: {
    width: "100%",
  },
  inputContainer: {
    marginBottom: 16,
    width: "100%",
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#4B5563",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "white",
    height: 50,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    paddingHorizontal: 16,
    fontSize: 16,
    color: "#1F2937",
  },
  inputInvalid: {
    borderColor: "#EF4444",
  },
  inputDisabled: {
    backgroundColor: "#F9FAFB",
    opacity: 0.6,
  },
  errorText: {
    color: "#EF4444",
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    height: 50,
  },
  passwordInput: {
    flex: 1,
    height: 50,
    paddingHorizontal: 16,
    fontSize: 16,
    color: "#1F2937",
  },
  eyeIcon: {
    paddingHorizontal: 12,
  },
  loginButton: {
    backgroundColor: "#3B82F6",
    height: 50,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
    marginBottom: 24,
    shadowColor: "#3B82F6",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  loginButtonDisabled: {
    backgroundColor: "#9CA3AF",
    shadowOpacity: 0,
    elevation: 0,
  },
  loginButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  loadingText: {
    marginLeft: 8,
  },
  footerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  footerLink: {
    color: "#3B82F6",
    fontSize: 14,
    fontWeight: "500",
  },
  disabledLink: {
    color: "#9CA3AF",
  },
})
