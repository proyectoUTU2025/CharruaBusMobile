import React, { useState } from "react"
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ImageBackground,
  SafeAreaView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  Alert,
  ActivityIndicator,
  ScrollView,
} from "react-native"
import Icon from "react-native-vector-icons/MaterialIcons"
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { RootStackParamList } from '../types/navigationType'
import { PasswordRequirement } from '../types/resetPasswordType'
import { 
  validateEmail,
  validateCode,
  sanitizeCode,
  validatePassword,
  validateConfirmPassword,
  validatePasswordRequirements,
  getPasswordRequirements,
  forgotPassword,
  verifyResetCode,
  resetPassword
} from '../services/resetPasswordService'

type Props = NativeStackScreenProps<RootStackParamList, 'ResetPassword'>

const PasswordRequirements = ({ password }: { password: string }) => {
  const requirements = getPasswordRequirements(password);

  if (!password) return null;

  return (
    <View style={styles.passwordRequirements}>
      {requirements.map((req, index) => (
        <View key={index} style={styles.requirementRow}>
          <Icon 
            name={req.valid ? "check-circle" : "cancel"} 
            size={16} 
            color={req.valid ? "#10B981" : "#EF4444"} 
          />
          <Text style={[styles.requirementText, req.valid && styles.requirementValid]}>
            {req.text}
          </Text>
        </View>
      ))}
    </View>
  );
};

const ResetPasswordScreen = ({ navigation, route }: Props) => {
  const [currentStep, setCurrentStep] = useState<'email' | 'verify' | 'reset'>('email')
  const [email, setEmail] = useState("")
  const [emailError, setEmailError] = useState("")
  const [codigo, setCodigo] = useState("")
  const [codigoError, setCodigoError] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [passwordError, setPasswordError] = useState("")
  const [confirmPasswordError, setConfirmPasswordError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [canResend, setCanResend] = useState(true)
  const [resendTimer, setResendTimer] = useState(0)

  const handleEmailChange = (value: string) => {
    setEmail(value)
    const validation = validateEmail(value)
    setEmailError(validation.isValid ? "" : validation.error!)
  }

  const handleCodeChange = (value: string) => {
    const sanitizedCode = sanitizeCode(value)
    setCodigo(sanitizedCode)
    const validation = validateCode(sanitizedCode)
    setCodigoError(validation.isValid ? "" : validation.error!)
  }

  const handlePasswordChange = (pass: string) => {
    setPassword(pass)
    
    if (passwordError.includes("nueva contraseña debe ser diferente")) {
      setPasswordError("")
    }
    
    if (!pass.trim()) {
      setPasswordError("La contraseña es obligatoria")
      return
    }
    
    const passwordErrors = validatePasswordRequirements(pass)
    
    if (passwordErrors.errors.length > 0) {
      setPasswordError("")
    } else {
      setPasswordError("")
    }
    
    if (confirmPassword) {
      handleConfirmPasswordChange(confirmPassword, pass)
    }
  }

  const handleConfirmPasswordChange = (confirmPass: string, mainPassword?: string) => {
    setConfirmPassword(confirmPass)
    
    const currentPassword = mainPassword || password
    const validation = validateConfirmPassword(confirmPass, currentPassword)
    setConfirmPasswordError(validation.isValid ? "" : validation.error!)
  }

  const handleForgotPassword = async () => {
    setEmailError("")
    
    if (!email.trim()) {
      setEmailError("El correo electrónico es obligatorio")
      return
    }
    
    if (emailError !== "") return

    setIsLoading(true)
    
    try {
      const result = await forgotPassword(email)
      
      if (!result.success) {
        Alert.alert("Error", result.message)
        return
      }

      setCurrentStep('verify')
      startResendTimer()
      
    } catch (error: any) {
      Alert.alert("Error", error.message || "Error inesperado al enviar código")
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyCode = async () => {
    setCodigoError("")
    
    if (!codigo.trim()) {
      setCodigoError("El código es obligatorio")
      return
    }
    
    if (codigo.length !== 6) {
      setCodigoError("El código debe tener 6 dígitos")
      return
    }

    setIsLoading(true)
    
    try {
      const result = await verifyResetCode(email, codigo)
      
      if (!result.success) {
        Alert.alert("Error", result.message)
        return
      }

      setCurrentStep('reset')
      
    } catch (error: any) {
      Alert.alert("Error", error.message || "Error inesperado al verificar código")
    } finally {
      setIsLoading(false)
    }
  }

  const handleResetPassword = async () => {
    setPasswordError("")
    setConfirmPasswordError("")
    
    if (!password.trim()) {
      setPasswordError("La contraseña es obligatoria")
      return
    }
    
    if (!confirmPassword.trim()) {
      setConfirmPasswordError("Debe confirmar la contraseña")
      return
    }
    
    const passwordErrors = validatePasswordRequirements(password)
    if (!passwordErrors.isValid) {
      setPasswordError(`Requisitos faltantes: ${passwordErrors.errors.join(", ")}`)
      return
    }
    
    if (password !== confirmPassword) {
      setConfirmPasswordError("Las contraseñas no coinciden")
      return
    }

    setIsLoading(true)
    
    try {
      const result = await resetPassword(email, codigo, password, confirmPassword)
      
      if (!result.success) {
        Alert.alert("Error", result.message)
        return
      }

      Alert.alert(
        "Contraseña restablecida", 
        "Tu contraseña ha sido cambiada exitosamente",
        [
          {
            text: "Iniciar sesión",
            onPress: () => navigation.navigate("Login")
          }
        ]
      )
      
    } catch (error: any) {
      Alert.alert("Error", error.message || "Error inesperado al restablecer contraseña")
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendCode = async () => {
    if (!canResend) return

    setIsLoading(true)
    
    try {
      const result = await forgotPassword(email)
      
      if (result.success) {
        Alert.alert("Código reenviado", "Se ha enviado un nuevo código a tu correo")
        setCodigo("")
        setCodigoError("")
        startResendTimer()
      } else {
        Alert.alert("Error", result.message)
      }
      
    } catch (error: any) {
      Alert.alert("Error", error.message || "Error al reenviar código")
    } finally {
      setIsLoading(false)
    }
  }

  const startResendTimer = () => {
    setCanResend(false)
    setResendTimer(60)
    
    const timer = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          setCanResend(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  const handleBack = () => {
    if (currentStep === 'email') {
      navigation.goBack()
    } else if (currentStep === 'verify') {
      setCurrentStep('email')
      setCodigo("")
      setCodigoError("")
    } else if (currentStep === 'reset') {
      setCurrentStep('verify')
      setPassword("")
      setConfirmPassword("")
      setPasswordError("")
      setConfirmPasswordError("")
    }
  }

  const getTitle = () => {
    switch (currentStep) {
      case 'email': return 'Recuperar Contraseña'
      case 'verify': return 'Verificar Código'
      case 'reset': return 'Nueva Contraseña'
      default: return 'Recuperar Contraseña'
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 'email':
        return (
          <>
            <View style={styles.iconContainer}>
              <View style={styles.emailIconCircle}>
                <Icon name="lock-outline" size={48} color="#3B82F6" />
              </View>
              <Text style={styles.mainTitle}>¿Olvidaste tu contraseña?</Text>
              <Text style={styles.subtitle}>
                Ingresa tu correo electrónico y te enviaremos un código para restablecer tu contraseña
              </Text>
            </View>

            <View style={styles.formContainer}>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Correo electrónico</Text>
                <TextInput
                  style={[styles.input, emailError ? styles.inputError : null]}
                  placeholder="Ingresa tu correo electrónico"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="email"
                  textContentType="emailAddress"
                  value={email}
                  onChangeText={handleEmailChange}
                  editable={!isLoading}
                  selectTextOnFocus={false}
                  blurOnSubmit={true}
                />
                {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
              </View>

              <TouchableOpacity 
                style={[
                  styles.primaryButton, 
                  (emailError !== "" || !email.trim() || isLoading) && styles.primaryButtonDisabled
                ]} 
                activeOpacity={0.8} 
                onPress={handleForgotPassword}
                disabled={emailError !== "" || !email.trim() || isLoading}
              >
                {isLoading ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color="white" />
                    <Text style={[styles.primaryButtonText, styles.loadingText]}>Enviando...</Text>
                  </View>
                ) : (
                  <Text style={styles.primaryButtonText}>Enviar código</Text>
                )}
              </TouchableOpacity>
            </View>
          </>
        )

      case 'verify':
        return (
          <>
            <View style={styles.iconContainer}>
              <View style={styles.emailIconCircle}>
                <Icon name="mail-outline" size={48} color="#3B82F6" />
              </View>
              <Text style={styles.mainTitle}>Código enviado</Text>
              <Text style={styles.subtitle}>
                Hemos enviado un código de 6 dígitos a tu correo
              </Text>
              <Text style={styles.emailText}>{email}</Text>
            </View>

            <View style={styles.formContainer}>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Código de verificación</Text>
                <TextInput
                  style={[styles.codeInput, codigoError ? styles.inputError : null]}
                  placeholder="000000"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="numeric"
                  autoCorrect={false}
                  autoComplete="one-time-code"
                  textContentType="oneTimeCode"
                  value={codigo}
                  onChangeText={handleCodeChange}
                  maxLength={6}
                  textAlign="center"
                  editable={!isLoading}
                  selectTextOnFocus={true}
                  blurOnSubmit={true}
                />
                <Text style={styles.helperText}>
                  Ingresa el código de 6 dígitos que enviamos a tu correo
                </Text>
                {codigoError ? <Text style={styles.errorText}>{codigoError}</Text> : null}
              </View>

              <View style={styles.resendContainer}>
                <Text style={styles.resendText}>¿No recibiste el código?</Text>
                <TouchableOpacity 
                  onPress={handleResendCode}
                  disabled={!canResend || isLoading}
                >
                  <Text style={[
                    styles.resendLink, 
                    (!canResend || isLoading) && styles.resendLinkDisabled
                  ]}>
                    {canResend ? "Reenviar código" : `Reenviar en ${resendTimer}s`}
                  </Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity 
                style={[
                  styles.primaryButton, 
                  (codigo.length !== 6 || isLoading) && styles.primaryButtonDisabled
                ]} 
                activeOpacity={0.8} 
                onPress={handleVerifyCode}
                disabled={codigo.length !== 6 || isLoading}
              >
                {isLoading ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color="white" />
                    <Text style={[styles.primaryButtonText, styles.loadingText]}>Verificando...</Text>
                  </View>
                ) : (
                  <Text style={styles.primaryButtonText}>Verificar código</Text>
                )}
              </TouchableOpacity>

              <Text style={styles.expirationText}>El código expira en 10 minutos</Text>
            </View>
          </>
        )

      case 'reset':
        return (
          <>
            <View style={styles.iconContainer}>
              <View style={styles.emailIconCircle}>
                <Icon name="lock-reset" size={48} color="#3B82F6" />
              </View>
              <Text style={styles.mainTitle}>Nueva contraseña</Text>
              <Text style={styles.subtitle}>
                Crea una nueva contraseña segura para tu cuenta
              </Text>
            </View>

            <View style={styles.formContainer}>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Nueva contraseña</Text>
                <View style={[styles.passwordContainer, passwordError ? styles.inputError : null]}>
                  <TextInput
                    style={styles.passwordInput}
                    placeholder="Nueva contraseña"
                    placeholderTextColor="#9CA3AF"
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoComplete="new-password"
                    textContentType="newPassword"
                    value={password}
                    onChangeText={handlePasswordChange}
                    editable={!isLoading}
                    selectTextOnFocus={false}
                    blurOnSubmit={false}
                  />
                  <TouchableOpacity 
                    style={styles.eyeButton}
                    onPress={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                  >
                    <Icon 
                      name={showPassword ? "visibility" : "visibility-off"} 
                      size={20} 
                      color="#9CA3AF" 
                    />
                  </TouchableOpacity>
                </View>
                <PasswordRequirements password={password} />
                {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Confirmar contraseña</Text>
                <View style={[styles.passwordContainer, confirmPasswordError ? styles.inputError : null]}>
                  <TextInput
                    style={styles.passwordInput}
                    placeholder="Confirmar contraseña"
                    placeholderTextColor="#9CA3AF"
                    secureTextEntry={!showConfirmPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoComplete="new-password"
                    textContentType="newPassword"
                    value={confirmPassword}
                    onChangeText={handleConfirmPasswordChange}
                    editable={!isLoading}
                    selectTextOnFocus={false}
                    blurOnSubmit={true}
                  />
                  <TouchableOpacity 
                    style={styles.eyeButton}
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={isLoading}
                  >
                    <Icon 
                      name={showConfirmPassword ? "visibility" : "visibility-off"} 
                      size={20} 
                      color="#9CA3AF" 
                    />
                  </TouchableOpacity>
                </View>
                {confirmPasswordError ? (
                  <Text style={styles.errorText}>{confirmPasswordError}</Text>
                ) : confirmPassword && password === confirmPassword && validatePasswordRequirements(password).isValid ? (
                  <Text style={styles.successText}>✓ Las contraseñas coinciden y cumplen los requisitos</Text>
                ) : null}
              </View>

              <TouchableOpacity 
                style={[
                  styles.primaryButton, 
                  (passwordError !== "" || confirmPasswordError !== "" || !password.trim() || !confirmPassword.trim() || isLoading || !validatePasswordRequirements(password).isValid) && styles.primaryButtonDisabled
                ]} 
                activeOpacity={0.8} 
                onPress={handleResetPassword}
                disabled={passwordError !== "" || confirmPasswordError !== "" || !password.trim() || !confirmPassword.trim() || isLoading || !validatePasswordRequirements(password).isValid}
              >
                {isLoading ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color="white" />
                    <Text style={[styles.primaryButtonText, styles.loadingText]}>Cambiando...</Text>
                  </View>
                ) : (
                  <Text style={styles.primaryButtonText}>Cambiar contraseña</Text>
                )}
              </TouchableOpacity>
            </View>
          </>
        )

      default:
        return null
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#3B82F6" />
      <ImageBackground 
        source={require("../assets/background.png")} 
        style={styles.backgroundImage} 
        resizeMode="cover"
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <KeyboardAvoidingView 
            behavior={Platform.OS === "ios" ? "padding" : "height"} 
            style={styles.keyboardAvoidingView}
          >
            <ScrollView 
              style={styles.scrollView}
              contentContainerStyle={styles.scrollViewContent}
              showsVerticalScrollIndicator={true}
              bounces={true}
              keyboardShouldPersistTaps="handled"
            >
              <View style={styles.cardContainer}>
                {/* Header */}
                <View style={styles.headerContainer}>
                  <TouchableOpacity 
                    style={styles.backButton} 
                    onPress={handleBack}
                    disabled={isLoading}
                  >
                    <Icon name="arrow-back" size={24} color="#374151" />
                  </TouchableOpacity>
                  <Text style={styles.headerTitle}>{getTitle()}</Text>
                  <View style={styles.placeholder} />
                </View>

                {/* Contenido dinámico según el paso */}
                {renderStepContent()}
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
  },
  backgroundImage: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  keyboardAvoidingView: {
    flex: 1,
    width: "100%",
  },
  scrollView: {
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
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 32,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#374151",
    textAlign: "center",
  },
  placeholder: {
    width: 40,
  },
  iconContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
  emailIconCircle: {
    width: 80,
    height: 80,
    backgroundColor: "#EBF4FF",
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 8,
    lineHeight: 22,
  },
  emailText: {
    fontSize: 14,
    color: "#3B82F6",
    fontWeight: "500",
  },
  formContainer: {
    width: "100%",
  },
  inputContainer: {
    marginBottom: 24,
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
  codeInput: {
    backgroundColor: "white",
    height: 60,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    paddingHorizontal: 16,
    fontSize: 24,
    color: "#1F2937",
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    letterSpacing: 8,
    marginBottom: 8,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: "white",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#D1D5DB",
  },
  passwordInput: {
    flex: 1,
    height: 50,
    paddingHorizontal: 16,
    fontSize: 16,
    color: "#1F2937",
  },
  eyeButton: {
    padding: 15,
  },
  inputError: {
    borderColor: "#EF4444",
    borderWidth: 2,
  },
  helperText: {
    fontSize: 12,
    color: "#6B7280",
    textAlign: "left",
    lineHeight: 16,
    marginLeft: 4,
  },
  errorText: {
    color: "#EF4444",
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
    textAlign: "left",
  },
  successText: {
    color: "#10B981",
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
    fontWeight: "500",
    textAlign: "left",
  },
  passwordRequirements: {
    marginTop: 8,
    paddingHorizontal: 4,
  },
  requirementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  requirementText: {
    fontSize: 12,
    color: '#EF4444',
    marginLeft: 6,
  },
  requirementValid: {
    color: '#10B981',
  },
  resendContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  resendText: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 8,
  },
  resendLink: {
    fontSize: 14,
    color: "#3B82F6",
    fontWeight: "500",
  },
  resendLinkDisabled: {
    color: "#9CA3AF",
  },
  primaryButton: {
    backgroundColor: "#3B82F6",
    height: 50,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "#3B82F6",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  primaryButtonDisabled: {
    backgroundColor: "#9CA3AF",
    shadowOpacity: 0,
    elevation: 0,
  },
  primaryButtonText: {
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
  expirationText: {
    fontSize: 12,
    color: "#6B7280",
    textAlign: "left",
    marginLeft: 4,
  },
})

export default ResetPasswordScreen;