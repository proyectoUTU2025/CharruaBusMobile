import React, { useState } from "react"
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ImageBackground,
  SafeAreaView,
  StatusBar,
  TouchableWithoutFeedback,
  ScrollView,
  Modal,
  Alert,
} from "react-native"
import DateTimePicker from '@react-native-community/datetimepicker';
import Icon from "react-native-vector-icons/MaterialIcons"
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigationType';
import { registerUser } from '../../services/authService';
import { styles } from './RegisterScreen.styles';

const PasswordRequirements = ({ password }: { password: string }) => {
  const requirements = [
    { text: "Mínimo 8 caracteres", valid: password.length >= 8 },
    { text: "Al menos una minúscula", valid: /[a-z]/.test(password) },
    { text: "Al menos una mayúscula", valid: /[A-Z]/.test(password) },
    { text: "Al menos un número", valid: /\d/.test(password) },
    { text: "Al menos un carácter especial", valid: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password) }
  ];

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

export default function RegisterScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [nombre, setNombre] = useState("")
  const [nombreError, setNombreError] = useState("")
  const [apellido, setApellido] = useState("")
  const [apellidoError, setApellidoError] = useState("")
  const [documento, setDocumento] = useState("")
  const [documentoError, setDocumentoError] = useState("")
  const [tipoDocumento, setTipoDocumento] = useState("")
  const [tipoDocumentoError, setTipoDocumentoError] = useState("")
  const [email, setEmail] = useState("")
  const [emailError, setEmailError] = useState("")
  const [fechaNacimiento, setFechaNacimiento] = useState("")
  const [fechaError, setFechaError] = useState("")
  const [situacionLaboral, setSituacionLaboral] = useState("")
  const [situacionLaboralError, setSituacionLaboralError] = useState("")
  const [showTipoDocumentoModal, setShowTipoDocumentoModal] = useState(false)
  const [showSituacionModal, setShowSituacionModal] = useState(false)
  const [showDatePicker, setShowDatePicker] = useState(false)
const [date, setDate] = useState<Date | undefined>(new Date())
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [passwordError, setPasswordError] = useState("")
  const [confirmPasswordError, setConfirmPasswordError] = useState("") 
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const tiposDocumento = ["CEDULA", "PASAPORTE", "OTRO"]
  const situacionesLaborales = ["Jubilado", "Estudiante", "Otro"]

  const validatePasswordRequirements = (password: string): string[] => {
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push("Mínimo 8 caracteres");
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push("Al menos una letra minúscula");
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push("Al menos una letra mayúscula");
    }
    
    if (!/\d/.test(password)) {
      errors.push("Al menos un número");
    }
    
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push("Al menos un carácter especial");
    }
    
    return errors;
  };

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

  const validarCedulaUruguaya = (cedula: string): boolean => {
    if (cedula.length !== 8) return false;
    
    const digitoCalculado = calcularDigitoVerificador(cedula);
    const digitoIngresado = parseInt(cedula[7]);
    
    return digitoCalculado === digitoIngresado;
  };

  const formatearCedula = (cedula: string): string => {
    if (cedula.length <= 1) return cedula;
    if (cedula.length <= 4) return `${cedula.substring(0, 1)}.${cedula.substring(1)}`;
    if (cedula.length <= 7) return `${cedula.substring(0, 1)}.${cedula.substring(1, 4)}.${cedula.substring(4)}`;
    return `${cedula.substring(0, 1)}.${cedula.substring(1, 4)}.${cedula.substring(4, 7)}-${cedula.substring(7)}`;
  };

  const handleBackToLogin = () => {
    navigation.navigate("Login")
  }

  const selectTipoDocumento = (tipo: string) => {
    setTipoDocumento(tipo)
    setTipoDocumentoError("")
    setShowTipoDocumentoModal(false)
    
    setDocumento("")
    setDocumentoError("")
  }

  const selectSituacion = (situacion: string) => {
    setSituacionLaboral(situacion)
    setSituacionLaboralError("")
    setShowSituacionModal(false)
  }

  const validateNombre = (value: string) => {
    const onlyLetters = value.replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñ\s]/g, '')
    setNombre(onlyLetters)
    setNombreError(onlyLetters.trim() === "" ? "El nombre es obligatorio" : "")
  }

  const validateApellido = (value: string) => {
    const onlyLetters = value.replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñ\s]/g, '')
    setApellido(onlyLetters)
    setApellidoError(onlyLetters.trim() === "" ? "El apellido es obligatorio" : "")
  }

  const validateEmail = (value: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    setEmail(value);
    if (!value.trim()) {
      setEmailError("El correo electrónico es obligatorio");
    } else if (!emailRegex.test(value)) {
      setEmailError("Formato de correo no válido");
    } else {
      setEmailError("");
    }
  };

  const validateDocumento = (value: string) => {
    if (tipoDocumento === "CEDULA") {
      const onlyNumbers = value.replace(/\D/g, '')
      
      if (onlyNumbers.length <= 8) {
        setDocumento(onlyNumbers)
        
        if (onlyNumbers.length === 0) {
          setDocumentoError("La cédula es obligatoria")
        } else if (onlyNumbers.length < 8) {
          setDocumentoError("La cédula debe tener 8 dígitos")
        } else if (onlyNumbers.length === 8) {
          if (validarCedulaUruguaya(onlyNumbers)) {
            setDocumentoError("")
          } else {
            const digitoCalculado = calcularDigitoVerificador(onlyNumbers)
            setDocumentoError(`Dígito verificador incorrecto. Debería ser: ${digitoCalculado}`)
          }
        }
      }
    } else if (tipoDocumento === "PASAPORTE") {
      const cleaned = value.replace(/[^A-Za-z0-9]/g, '')
      
      if (cleaned.length <= 8) {
        let formatted = ""
        if (cleaned.length > 0) {
          formatted = cleaned.charAt(0).toUpperCase() + cleaned.slice(1).replace(/\D/g, '')
        }
        
        setDocumento(formatted)
        
        if (formatted.length === 0) {
          setDocumentoError("El pasaporte es obligatorio")
        } else if (formatted.length < 8) {
          const lettersCount = formatted.replace(/[0-9]/g, '').length
          const numbersCount = formatted.replace(/[A-Z]/g, '').length
          
          if (lettersCount === 0) {
            setDocumentoError("El pasaporte debe empezar con una letra")
          } else if (lettersCount > 1) {
            setDocumentoError("El pasaporte debe tener solo una letra al inicio")
          } else {
            const remainingDigits = 7 - numbersCount
            setDocumentoError(`Faltan ${remainingDigits} dígitos (formato: A1234567)`)
          }
        } else {
          const pasaporteRegex = /^[A-Z][0-9]{7}$/
          if (pasaporteRegex.test(formatted)) {
            setDocumentoError("")
          } else {
            setDocumentoError("Formato inválido. Debe ser: 1 letra + 7 dígitos (ej: A1234567)")
          }
        }
      }
    } else {
      setDocumento(value)
      if (!value.trim()) {
        setDocumentoError("El documento es obligatorio")
      } else if (value.length < 3) {
        setDocumentoError("El documento debe tener al menos 3 caracteres")
      } else {
        setDocumentoError("")
      }
    }
  }

  const validatePassword = (pass: string) => {
    setPassword(pass);
    
    if (!pass.trim()) {
      setPasswordError("La contraseña es obligatoria");
      return;
    }
    
    const passwordErrors = validatePasswordRequirements(pass);
    
    if (passwordErrors.length > 0) {
      setPasswordError(``);
    } else {
      setPasswordError("");
    }
    
    if (confirmPassword) {
      if (confirmPassword !== pass) {
        setConfirmPasswordError("Las contraseñas no coinciden");
      } else if (passwordErrors.length > 0) {
        setConfirmPasswordError("Primero complete los requisitos de la contraseña");
      } else {
        setConfirmPasswordError("");
      }
    }
  };

  const validateConfirmPassword = (confirmPass: string) => {
    setConfirmPassword(confirmPass);
    
    if (!confirmPass.trim()) {
      setConfirmPasswordError("Debe confirmar la contraseña");
      return;
    }
    
    const passwordErrors = validatePasswordRequirements(password);
    
    if (passwordErrors.length > 0) {
      setConfirmPasswordError("Primero complete los requisitos de la contraseña");
      return;
    }
    
    if (password !== confirmPass) {
      setConfirmPasswordError("Las contraseñas no coinciden");
    } else {
      setConfirmPasswordError("");
    }
  };

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
      setFechaError("")
    }
  }

  const renderDocumentoInput = () => {
    if (tipoDocumento === "CEDULA") {
      return (
        <TextInput 
          style={[styles.input, documentoError ? styles.inputError : null]} 
          placeholder="1.234.567-8" 
          placeholderTextColor="#9CA3AF" 
          keyboardType="numeric" 
          autoCorrect={false} 
          value={formatearCedula(documento)} 
          onChangeText={validateDocumento}
          maxLength={11}
        />
      )
    } else if (tipoDocumento === "PASAPORTE") {
      return (
        <TextInput 
          style={[styles.input, documentoError ? styles.inputError : null]} 
          placeholder="A1234567" 
          placeholderTextColor="#9CA3AF" 
          autoCorrect={false} 
          autoCapitalize="characters"
          value={documento} 
          onChangeText={validateDocumento}
          maxLength={8}
        />
      )
    } else {
      return (
        <TextInput 
          style={[styles.input, documentoError ? styles.inputError : null]} 
          placeholder="Número de documento"
          placeholderTextColor="#9CA3AF" 
          autoCorrect={false} 
          value={documento} 
          onChangeText={validateDocumento}
        />
      )
    }
  }

  const renderDocumentoValidation = () => {
    if (documentoError) {
      return <Text style={styles.errorText}>{documentoError}</Text>
    } else if (tipoDocumento === "CEDULA" && documento.length === 8 && validarCedulaUruguaya(documento)) {
      return <Text style={styles.successText}>✓ Cédula válida</Text>
    } else if (tipoDocumento === "PASAPORTE" && documento.length === 8 && /^[A-Z][0-9]{7}$/.test(documento)) {
      return <Text style={styles.successText}>✓ Pasaporte válido</Text>
    }
    return null
  }

  const handleRegister = async () => {
    setEmailError("");
    
    let hasErrors = false;

    if (!nombre.trim()) {
      setNombreError("El nombre es obligatorio");
      hasErrors = true;
    }

    if (!apellido.trim()) {
      setApellidoError("El apellido es obligatorio");
      hasErrors = true;
    }

    if (!tipoDocumento) {
      setTipoDocumentoError("Debe seleccionar un tipo de documento");
      hasErrors = true;
    }

    if (!documento.trim()) {
      setDocumentoError("El documento es obligatorio");
      hasErrors = true;
    } else if (tipoDocumento === "CEDULA") {
      if (documento.length !== 8 || !validarCedulaUruguaya(documento)) {
        setDocumentoError("Por favor, ingrese una cédula válida");
        hasErrors = true;
      }
    } else if (tipoDocumento === "PASAPORTE") {
      const pasaporteRegex = /^[A-Z][0-9]{7}$/;
      if (!pasaporteRegex.test(documento)) {
        setDocumentoError("El pasaporte debe tener el formato: 1 letra + 7 dígitos (ej: A1234567)");
        hasErrors = true;
      }
    }

    if (!email.trim()) {
      setEmailError("El correo electrónico es obligatorio");
      hasErrors = true;
    } else if (emailError) {
      hasErrors = true;
    }

    if (!password.trim()) {
      setPasswordError("La contraseña es obligatoria");
      hasErrors = true;
    } else {
      const passwordErrors = validatePasswordRequirements(password);
      if (passwordErrors.length > 0) {
        setPasswordError(`Requisitos faltantes: ${passwordErrors.join(", ")}`);
        hasErrors = true;
      }
    }

    if (!confirmPassword.trim()) {
      setConfirmPasswordError("Debe confirmar la contraseña");
      hasErrors = true;
    } else if (password !== confirmPassword) {
      setConfirmPasswordError("Las contraseñas no coinciden");
      hasErrors = true;
    }

    if (!date) {
      setFechaError("La fecha de nacimiento es obligatoria");
      hasErrors = true;
    } else {
      setFechaError("");
    }

    if (!situacionLaboral) {
      setSituacionLaboralError("Debe seleccionar una situación laboral");
      hasErrors = true;
    } else {
      setSituacionLaboralError("");
    }

    if (hasErrors) return;

    try {
      if (!date) {
        setFechaError("Error con la fecha de nacimiento");
        return;
      }

      const fechaFormateada = date.toISOString().split('T')[0];

      const data = {
        email,
        password,
        nombre,
        apellido,
        fechaNacimiento: fechaFormateada,
        documento: documento,
        tipoDocumento: tipoDocumento,
        situacionLaboral: situacionLaboral.toUpperCase(),
      };

      try {
        console.log("Registrando usuario:", data);
        await registerUser(data);
        
        Alert.alert("Éxito", "Usuario registrado!");
        navigation.navigate("VerifyEmail", { email: email });
        
      } catch (registerError: any) {
        
        if (registerError.message && registerError.message.includes('email ya está registrado')) {
          setEmailError("El email ya está registrado");
        } else if (registerError.message && registerError.message.includes('Datos de registro inválidos')) {
          Alert.alert("Error", "Los datos ingresados no son válidos. Revisa la información.");
        } else if (registerError.message && registerError.message.includes('Error de conexión')) {
          Alert.alert("Error de conexión", "No se pudo conectar al servidor. Verifica tu internet.");
        } else {
          Alert.alert("Error", registerError.message || "Error inesperado al registrarse");
        }
        
        return;
      }

    } catch (outerError: any) {
      Alert.alert("Error", "Error inesperado");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#3B82F6" />
      <ImageBackground source={require("../../assets/background.png")} style={styles.backgroundImage} resizeMode="cover">
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollViewContent}
          showsVerticalScrollIndicator={true}
          bounces={true}
        >
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
                    <TextInput 
                      style={[styles.input, nombreError ? styles.inputError : null]} 
                      placeholder="Nombre" 
                      placeholderTextColor="#9CA3AF" 
                      autoCapitalize="words" 
                      autoCorrect={false} 
                      value={nombre} 
                      onChangeText={validateNombre} 
                    />
                    {nombreError ? <Text style={styles.errorText}>{nombreError}</Text> : null}
                  </View>

                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Apellido</Text>
                    <TextInput 
                      style={[styles.input, apellidoError ? styles.inputError : null]} 
                      placeholder="Apellido" 
                      placeholderTextColor="#9CA3AF" 
                      autoCapitalize="words" 
                      autoCorrect={false} 
                      value={apellido} 
                      onChangeText={validateApellido} 
                    />
                    {apellidoError ? <Text style={styles.errorText}>{apellidoError}</Text> : null}
                  </View>

                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Tipo de documento</Text>
                    <TouchableOpacity 
                      style={[styles.selectButton, tipoDocumentoError ? styles.inputError : null]}
                      onPress={() => setShowTipoDocumentoModal(true)}
                    >
                      <Text style={[styles.selectText, !tipoDocumento && styles.selectPlaceholder]}>
                        {tipoDocumento === "CEDULA" ? "Cédula" : 
                         tipoDocumento === "PASAPORTE" ? "Pasaporte" : 
                         tipoDocumento === "OTRO" ? "Otro" : "Seleccionar tipo de documento"}
                      </Text>
                      <Icon name="keyboard-arrow-down" size={24} color="#6B7280" />
                    </TouchableOpacity>
                    {tipoDocumentoError ? <Text style={styles.errorText}>{tipoDocumentoError}</Text> : null}
                  </View>

                  {tipoDocumento && (
                    <View style={styles.inputContainer}>
                      <Text style={styles.inputLabel}>
                        {tipoDocumento === "CEDULA" ? "Cédula" : 
                         tipoDocumento === "PASAPORTE" ? "Pasaporte" : "Documento"}
                      </Text>
                      {renderDocumentoInput()}
                      {renderDocumentoValidation()}
                    </View>
                  )}

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
                    <Text style={styles.inputLabel}>Contraseña</Text>
                   <View style={[styles.passwordContainer, passwordError ? styles.inputError : null]}>
                     <TextInput
                       style={styles.passwordInput}
                       placeholder="Contraseña"
                       placeholderTextColor="#9CA3AF"
                       secureTextEntry={!showPassword}
                       autoCapitalize="none"
                       value={password}
                       onChangeText={validatePassword}
                     />
                     <TouchableOpacity 
                       style={styles.eyeButton}
                       onPress={() => setShowPassword(!showPassword)}
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
                       value={confirmPassword}
                       onChangeText={validateConfirmPassword}
                     />
                     <TouchableOpacity 
                       style={styles.eyeButton}
                       onPress={() => setShowConfirmPassword(!showConfirmPassword)}
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
                   ) : confirmPassword && password === confirmPassword && validatePasswordRequirements(password).length === 0 ? (
                     <Text style={styles.successText}>✓ Las contraseñas coinciden y cumplen los requisitos</Text>
                   ) : null}
                 </View>

                 <View style={styles.inputContainer}>
                   <Text style={styles.inputLabel}>Fecha de nacimiento</Text>
                   <TouchableOpacity onPress={() => setShowDatePicker(true)}>
                     <View style={[styles.inputWithIcon, fechaError ? styles.inputError : null]}>
                       <Text style={[styles.inputText, !fechaNacimiento && styles.placeholderText]}>
                         {fechaNacimiento || 'DD/MM/AAAA'}
                       </Text>
                       <Icon name="calendar-today" size={20} color="#9CA3AF" />
                     </View>
                   </TouchableOpacity>
                   {fechaError ? <Text style={styles.errorText}>{fechaError}</Text> : null}
                 </View>

                 {showDatePicker && (
                   <DateTimePicker
                     value={date || new Date(2000, 0, 1)}
                     mode="date"
                     display="default"
                     onChange={onChangeDate}
                     maximumDate={new Date(Date.now() - 24 * 60 * 60 * 1000)}
                   />
                 )}

                 <View style={styles.inputContainer}>
                   <Text style={styles.inputLabel}>Situación laboral</Text>
                   <TouchableOpacity style={styles.selectButton} onPress={() => setShowSituacionModal(true)}>
                     <Text style={[styles.selectText, !situacionLaboral && styles.selectPlaceholder]}>
                       {situacionLaboral || "Seleccionar situación laboral"}
                     </Text>
                     <Icon name="keyboard-arrow-down" size={24} color="#6B7280" />
                   </TouchableOpacity>
                   {situacionLaboralError ? <Text style={styles.errorText}>{situacionLaboralError}</Text> : null}
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

       <Modal visible={showTipoDocumentoModal} transparent animationType="fade">
         <TouchableWithoutFeedback onPress={() => setShowTipoDocumentoModal(false)}>
           <View style={styles.modalOverlay}>
             <View style={styles.modalContent}>
               <Text style={styles.modalTitle}>Seleccionar tipo de documento</Text>
               {tiposDocumento.map((tipo) => (
                 <TouchableOpacity 
                   key={tipo} 
                   style={styles.modalOption} 
                   onPress={() => selectTipoDocumento(tipo)}
                 >
                   <Text style={styles.modalOptionText}>
                     {tipo === "CEDULA" ? "Cédula" : 
                      tipo === "PASAPORTE" ? "Pasaporte" : "Otro"}
                   </Text>
                 </TouchableOpacity>
               ))}
             </View>
           </View>
         </TouchableWithoutFeedback>
       </Modal>

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