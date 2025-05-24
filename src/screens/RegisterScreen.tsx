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
  ScrollView,
  Modal,
} from "react-native"
import DateTimePicker from '@react-native-community/datetimepicker';
import Icon from "react-native-vector-icons/MaterialIcons"
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';

export default function RegisterScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [nombre, setNombre] = useState("")
  const [apellido, setApellido] = useState("")
  const [cedula, setCedula] = useState("")
  const [cedulaError, setCedulaError] = useState("")
  const [email, setEmail] = useState("")
  const [emailError, setEmailError] = useState("")
  const [fechaNacimiento, setFechaNacimiento] = useState("")
  const [genero, setGenero] = useState("")
  const [situacionLaboral, setSituacionLaboral] = useState("")
  const [showSituacionModal, setShowSituacionModal] = useState(false)
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [date, setDate] = useState<Date | undefined>(undefined)

  const situacionesLaborales = ["Jubilado", "Estudiante", "Otro"]

  // Función para calcular el dígito verificador de la cédula uruguaya
  const calcularDigitoVerificador = (cedula: string): number => {
    if (cedula.length < 7) return -1;
    
    const numeros = cedula.substring(0, 7).split('').map(Number);
    const multiplicadores = [2, 9, 8, 7, 6, 3, 4];
    
    let suma = 0;
    for (let i = 0; i < 7; i++) {
      suma += numeros[i] * multiplicadores[i];
    }
    
    const resto = suma % 10;
    return resto === 0 ? 0 : 10 - resto;
  };

  // Función para validar cédula uruguaya completa
  const validarCedulaUruguaya = (cedula: string): boolean => {
    if (cedula.length !== 8) return false;
    
    const digitoCalculado = calcularDigitoVerificador(cedula);
    const digitoIngresado = parseInt(cedula[7]);
    
    return digitoCalculado === digitoIngresado;
  };

  // Función para formatear cédula con puntos (formato uruguayo: X.XXX.XXX-X)
  const formatearCedula = (cedula: string): string => {
    if (cedula.length <= 1) return cedula;
    if (cedula.length <= 4) return `${cedula.substring(0, 1)}.${cedula.substring(1)}`;
    if (cedula.length <= 7) return `${cedula.substring(0, 1)}.${cedula.substring(1, 4)}.${cedula.substring(4)}`;
    return `${cedula.substring(0, 1)}.${cedula.substring(1, 4)}.${cedula.substring(4, 7)}-${cedula.substring(7)}`;
  };

  const handleBackToLogin = () => {
    navigation.navigate("Login")
  }

  const selectSituacion = (situacion: string) => {
    setSituacionLaboral(situacion)
    setShowSituacionModal(false)
  }

  const validateNombreApellido = (setter: (value: string) => void, value: string) => {
    const onlyLetters = value.replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñ\s]/g, '')
    setter(onlyLetters)
  }

  const validateEmail = (value: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    setEmailError(emailRegex.test(value) ? "" : "Formato de correo no válido");
    setEmail(value);
  };

  const validateCedula = (value: string) => {
    // Remover todo lo que no sean números
    const onlyNumbers = value.replace(/\D/g, '');
    
    // Limitar a 8 dígitos máximo
    if (onlyNumbers.length <= 8) {
      setCedula(onlyNumbers);
      
      // Validar en tiempo real
      if (onlyNumbers.length === 0) {
        setCedulaError("");
      } else if (onlyNumbers.length < 8) {
        setCedulaError("La cédula debe tener 8 dígitos");
      } else if (onlyNumbers.length === 8) {
        if (validarCedulaUruguaya(onlyNumbers)) {
          setCedulaError("");
        } else {
          const digitoCalculado = calcularDigitoVerificador(onlyNumbers);
          setCedulaError(`Dígito verificador incorrecto. Debería ser: ${digitoCalculado}`);
        }
      }
    }
  }

  const formatDate = (date: Date) => {
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = date.getFullYear()
    return `${day}/${month}/${year}`
  }

  const onChangeDate = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false)
    if (selectedDate) {
      setDate(selectedDate)
      setFechaNacimiento(formatDate(selectedDate))
    }
  }

  const handleRegister = () => {
    // Validar que la cédula sea válida antes de proceder
    if (cedula.length !== 8 || !validarCedulaUruguaya(cedula)) {
      setCedulaError("Por favor, ingrese una cédula válida");
      return;
    }

    // Validar que el email sea válido antes de proceder
    if (emailError || !email) {
      if (!email) setEmailError("El correo electrónico es obligatorio");
      return;
    }

    console.log("Register attempt", {
      nombre,
      apellido,
      cedula,
      email,
      fechaNacimiento,
      genero,
      situacionLaboral,
    })
    navigation.navigate("Login")
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <ImageBackground source={require("../assets/background.png")} style={styles.backgroundImage} resizeMode="cover">
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.keyboardAvoidingView}>
            <ScrollView contentContainerStyle={styles.scrollViewContent}>
              <View style={styles.cardContainer}>
                <View style={styles.headerContainer}>
                  <TouchableOpacity style={styles.backButton} onPress={handleBackToLogin}>
                    <Icon name="arrow-back" size={24} color="#374151" />
                  </TouchableOpacity>
                  <Text style={styles.headerTitle}>Crear cuenta</Text>
                  <View style={styles.placeholder} />
                </View>

                <View style={styles.formContainer}>
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Nombre</Text>
                    <TextInput style={styles.input} placeholder="Nombre" placeholderTextColor="#9CA3AF" autoCapitalize="words" autoCorrect={false} value={nombre} onChangeText={(text) => validateNombreApellido(setNombre, text)} />
                  </View>

                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Apellido</Text>
                    <TextInput style={styles.input} placeholder="Apellido" placeholderTextColor="#9CA3AF" autoCapitalize="words" autoCorrect={false} value={apellido} onChangeText={(text) => validateNombreApellido(setApellido, text)} />
                  </View>

                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Cédula</Text>
                    <TextInput 
                      style={[styles.input, cedulaError ? styles.inputError : null]} 
                      placeholder="1.234.567-8" 
                      placeholderTextColor="#9CA3AF" 
                      keyboardType="numeric" 
                      autoCorrect={false} 
                      value={formatearCedula(cedula)} 
                      onChangeText={validateCedula}
                      maxLength={11} // Para permitir los puntos y guión en el formato X.XXX.XXX-X
                    />
                    {cedulaError ? (
                      <Text style={styles.errorText}>{cedulaError}</Text>
                    ) : cedula.length === 8 && validarCedulaUruguaya(cedula) ? (
                      <Text style={styles.successText}>✓ Cédula válida</Text>
                    ) : null}
                  </View>

                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Correo electrónico</Text>
                    <TextInput 
                      style={[styles.input, emailError && styles.inputError]} 
                      placeholder="Correo electrónico" 
                      placeholderTextColor="#9CA3AF" 
                      keyboardType="email-address" 
                      autoCapitalize="none" 
                      autoCorrect={false} 
                      value={email} 
                      onChangeText={validateEmail} 
                    />
                    {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
                  </View>

                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Fecha de nacimiento</Text>
                    <TouchableOpacity onPress={() => setShowDatePicker(true)}>
                      <View style={styles.inputWithIcon}>
                        <Text style={styles.inputText}>{fechaNacimiento || 'DD/MM/AAAA'}</Text>
                        <Icon name="calendar-today" size={20} color="#9CA3AF" />
                      </View>
                    </TouchableOpacity>
                  </View>

                  {showDatePicker && (
                    <DateTimePicker
                      value={date || new Date(2000, 0, 1)}
                      mode="date"
                      display="default"
                      onChange={onChangeDate}
                      maximumDate={new Date()}
                    />
                  )}

                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Género</Text>
                    <View style={styles.column}>
                      {['masculino', 'femenino', 'otro'].map((item) => (
                        <TouchableOpacity key={item} style={[styles.checkboxRow, styles.checkboxSpacing]} onPress={() => setGenero(item)}>
                          <View style={[styles.checkbox, genero === item && styles.checkboxSelected]}>
                            {genero === item && <Icon name="check" size={16} color="white" />}
                          </View>
                          <Text style={styles.checkboxLabel}>{item.charAt(0).toUpperCase() + item.slice(1)}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Situación laboral</Text>
                    <TouchableOpacity style={styles.selectButton} onPress={() => setShowSituacionModal(true)}>
                      <Text style={[styles.selectText, !situacionLaboral && styles.selectPlaceholder]}>
                        {situacionLaboral || "Seleccionar situación laboral"}
                      </Text>
                      <Icon name="keyboard-arrow-down" size={24} color="#6B7280" />
                    </TouchableOpacity>
                  </View>

                  <TouchableOpacity style={styles.registerButton} activeOpacity={0.8} onPress={handleRegister}>
                    <Text style={styles.registerButtonText}>Registrarse</Text>
                  </TouchableOpacity>

                  <View style={styles.footerContainer}>
                    <Text style={styles.footerText}>¿Ya tienes una cuenta?</Text>
                    <TouchableOpacity onPress={handleBackToLogin}>
                      <Text style={styles.footerLink}>Iniciar sesión</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </TouchableWithoutFeedback>

        <Modal visible={showSituacionModal} transparent animationType="fade">
          <TouchableWithoutFeedback onPress={() => setShowSituacionModal(false)}>
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Seleccionar situación laboral</Text>
                {situacionesLaborales.map((situacion) => (
                  <TouchableOpacity key={situacion} style={styles.modalOption} onPress={() => selectSituacion(situacion)}>
                    <Text style={styles.modalOptionText}>{situacion}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
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
  scrollViewContent: {
    flexGrow: 1,
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
    marginBottom: 24,
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
  inputError: {
    borderColor: "#EF4444",
    borderWidth: 2,
  },
  errorText: {
    color: "#EF4444",
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  successText: {
    color: "#10B981",
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
    fontWeight: "500",
  },
  checkboxContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: "#D1D5DB",
    marginRight: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxSelected: {
    backgroundColor: "#3B82F6",
    borderColor: "#3B82F6",
  },
  checkboxLabel: {
    fontSize: 14,
    color: "#374151",
    flex: 1,
  },
  selectButton: {
    backgroundColor: "white",
    height: 50,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  selectText: {
    fontSize: 16,
    color: "#1F2937",
  },
  selectPlaceholder: {
    color: "#9CA3AF",
  },
  registerButton: {
    backgroundColor: "#3B82F6",
    height: 50,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
    shadowColor: "#3B82F6",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  registerButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    width: "80%",
    maxWidth: 300,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 16,
    textAlign: "center",
  },
  modalOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  modalOptionText: {
    fontSize: 16,
    color: "#374151",
    textAlign: "center",
  },
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    height: 50,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  inputText: {
    fontSize: 16,
    color: '#1F2937',
  },
  column: {
    flexDirection: 'column',
    marginBottom: 12,
  },  
  checkboxSpacing: {
    marginBottom: 12,
  },
  footerContainer: {
    flexDirection: "row", 
    justifyContent: "center", 
    alignItems: "center", 
    marginTop: 16,
  },
  footerText: { 
    fontSize: 14, 
    color: "#6B7280", 
    marginRight: 8 
  },
  footerLink: { 
    fontSize: 14, 
    color: "#3B82F6", 
    fontWeight: "500" 
  },
})