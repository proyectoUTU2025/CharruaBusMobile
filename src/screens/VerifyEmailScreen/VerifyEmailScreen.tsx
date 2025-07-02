import React, { useState } from "react"
import {
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
import { RootStackParamList } from '../../types/navigationType';
import { verifyEmailCode } from '../../services/authService'
import { styles } from './VerifyEmailScreen.styles';

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
        source={require("../../assets/background.png")} 
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
                <View style={styles.headerContainer}>
                  <TouchableOpacity style={styles.backButton} onPress={handleBackToRegister}>
                    <Icon name="arrow-back" size={24} color="#374151" />
                  </TouchableOpacity>
                  <Text style={styles.headerTitle}>Verificar Correo</Text>
                  <View style={styles.placeholder} />
                </View>

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

                  <Text style={styles.expirationText}>El código expira en 2 horas</Text>
                </View>
              </View>
            </View>
          </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
      </ImageBackground>
    </SafeAreaView>
  )
}