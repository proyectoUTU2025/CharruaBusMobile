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
} from "react-native"
import Icon from "react-native-vector-icons/MaterialIcons"
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { RootStackParamList } from '../types/navigationType';
import { verifyEmailCode } from '../services/authService'

type Props = NativeStackScreenProps<RootStackParamList, 'VerifyEmail'>

export default function VerificarCorreoScreen({ navigation, route }: Props) {
  const email = route.params?.email || (() => {
    console.error('Email parameter missing in VerifyEmail screen')
    navigation.goBack()
    return ''
  })()
  
  const [codigo, setCodigo] = useState("")
  const [codigoError, setCodigoError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleBackToRegister = () => {
    navigation.goBack()
  }

  const validateCodigo = (value: string) => {
    const onlyNumbers = value.replace(/\D/g, '').slice(0, 6)
    setCodigo(onlyNumbers)
    
    if (onlyNumbers.length === 0) {
      setCodigoError("El código es obligatorio")
    } else if (onlyNumbers.length < 6) {
      setCodigoError("El código debe tener 6 dígitos")
    } else {
      setCodigoError("")
    }
  }

  const handleVerificar = async () => {
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
      try {
        const response = await verifyEmailCode(email, codigo)
        
        Alert.alert(
          "Verificación exitosa", 
          "Tu correo ha sido verificado correctamente",
          [
            {
              text: "Continuar",
              onPress: () => navigation.navigate("Login")
            }
          ]
        )
      } catch (verifyError: any) {
        
        if (verifyError.message && verifyError.message.includes('inválido')) {
          setCodigoError("Código de verificación inválido")
          setCodigo("")
        } else if (verifyError.message && verifyError.message.includes('expirado')) {
          setCodigoError("El código ha expirado. Solicita uno nuevo")
          setCodigo("")
        } else if (verifyError.message && verifyError.message.includes('Usuario no encontrado')) {
          Alert.alert("Error", "Usuario no encontrado o email no registrado")
        } else if (verifyError.message && verifyError.message.includes('Demasiados intentos')) {
          Alert.alert("Error", "Demasiados intentos. Espera antes de intentar nuevamente")
        } else if (verifyError.message && verifyError.message.includes('Error de conexión')) {
          Alert.alert("Error de conexión", "No se pudo conectar al servidor. Verifica tu internet")
        } else {
          if (verifyError.message) {
            setCodigoError(verifyError.message)
          } else {
            Alert.alert("Error", "Error inesperado al verificar el código")
          }
        }
        
        return;
      }

    } catch (outerError: any) {
      Alert.alert("Error", "Error inesperado")
    } finally {
      setIsLoading(false)
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
            <View style={styles.contentContainer}>
              <View style={styles.cardContainer}>
                {/* Header */}
                <View style={styles.headerContainer}>
                  <TouchableOpacity style={styles.backButton} onPress={handleBackToRegister}>
                    <Icon name="arrow-back" size={24} color="#374151" />
                  </TouchableOpacity>
                  <Text style={styles.headerTitle}>Verificar Correo</Text>
                  <View style={styles.placeholder} />
                </View>

                {/* Icon and messages */}
                <View style={styles.iconContainer}>
                  <View style={styles.emailIconCircle}>
                    <Icon name="mail-outline" size={48} color="#3B82F6" />
                  </View>
                  <Text style={styles.mainTitle}>Verificación</Text>
                  <Text style={styles.subtitle}>
                    Se ha enviado un código de verificación a tu correo
                  </Text>
                  <Text style={styles.emailText}>{email}</Text>
                </View>

                {/* Form */}
                <View style={styles.formContainer}>
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Código de verificación</Text>
                    <TextInput
                      style={[styles.codeInput, codigoError ? styles.inputError : null]}
                      placeholder="000000"
                      placeholderTextColor="#9CA3AF"
                      keyboardType="numeric"
                      autoCorrect={false}
                      value={codigo}
                      onChangeText={validateCodigo}
                      maxLength={6}
                      textAlign="center"
                    />
                    <Text style={styles.helperText}>
                      Ingresa el código de 6 dígitos que enviamos a tu correo
                    </Text>
                    {codigoError ? <Text style={styles.errorText}>{codigoError}</Text> : null}
                  </View>

                  {/* Resend section }
                  <View style={styles.resendContainer}>
                    <Text style={styles.resendText}>¿No recibiste el código?</Text>
                    <TouchableOpacity onPress={handleReenviarCodigo}>
                      <Text style={styles.resendLink}>Reenviar código</Text>
                    </TouchableOpacity>
                  </View>
                  {*/}
                  {/* Verify button */}
                  <TouchableOpacity 
                    style={[
                      styles.verifyButton, 
                      (codigo.length !== 6 || isLoading) && styles.verifyButtonDisabled
                    ]} 
                    activeOpacity={0.8} 
                    onPress={handleVerificar}
                    disabled={codigo.length !== 6 || isLoading}
                  >
                    <Text style={styles.verifyButtonText}>
                      {isLoading ? "Verificando..." : "Verificar"}
                    </Text>
                  </TouchableOpacity>

                  <Text style={styles.expirationText}>El código expira en 10 minutos</Text>
                </View>
              </View>
            </View>
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
  contentContainer: {
    flex: 1,
    justifyContent: "center",
    padding: 16,
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
    textAlign: "center",
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
  inputError: {
    borderColor: "#EF4444",
    borderWidth: 2,
  },
  helperText: {
    fontSize: 12,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 16,
  },
  errorText: {
    color: "#EF4444",
    fontSize: 12,
    marginTop: 4,
    textAlign: "center",
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
  verifyButton: {
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
  verifyButtonDisabled: {
    backgroundColor: "#9CA3AF",
    shadowOpacity: 0,
    elevation: 0,
  },
  verifyButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  expirationText: {
    fontSize: 12,
    color: "#6B7280",
    textAlign: "center",
  },
})