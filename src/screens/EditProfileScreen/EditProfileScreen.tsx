import React, { useState, useEffect } from "react"
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ImageBackground,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Modal,
  Alert,
  ActivityIndicator,
} from "react-native"
import DateTimePicker from '@react-native-community/datetimepicker'
import Icon from "react-native-vector-icons/MaterialIcons"
import { 
  updateUserProfile, 
  getCurrentUserProfile, 
  getUserIdFromToken,
} from '../../services/updateUserService'
import { EditProfileScreenProps } from '../../types/userType';
import { styles } from './EditProfileScreen.styles';


export default function EditProfileScreen({ 
  onGoBack, 
  onSuccess, 
  token,
  handleUnauthorized 
}: EditProfileScreenProps) {
  
  const [nombre, setNombre] = useState("")
  const [nombreError, setNombreError] = useState("")
  const [apellido, setApellido] = useState("")
  const [apellidoError, setApellidoError] = useState("")
  const [documento, setDocumento] = useState("")
  const [documentoError, setDocumentoError] = useState("")
  const [tipoDocumento, setTipoDocumento] = useState("")
  const [tipoDocumentoError, setTipoDocumentoError] = useState("")
  const [fechaNacimiento, setFechaNacimiento] = useState("")
  const [fechaError, setFechaError] = useState("")
  const [situacionLaboral, setSituacionLaboral] = useState("")
  const [situacionLaboralError, setSituacionLaboralError] = useState("")
  
  const [showTipoDocumentoModal, setShowTipoDocumentoModal] = useState(false)
  const [showSituacionModal, setShowSituacionModal] = useState(false)
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [date, setDate] = useState<Date | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingUser, setIsLoadingUser] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const [showDocumentValidation, setShowDocumentValidation] = useState(false)

  const tiposDocumento = ["CEDULA", "PASAPORTE", "OTRO"]
  const situacionesLaborales = ["ESTUDIANTE", "JUBILADO", "OTRO"]

  useEffect(() => {
    initializeUserData()
  }, [])

  const isFormValid = () => {
    const hasRequiredFields = nombre.trim() !== "" && 
                            apellido.trim() !== "" && 
                            tipoDocumento !== "" && 
                            documento.trim() !== "" && 
                            date !== undefined && 
                            situacionLaboral !== ""
    
    const hasNoErrors = nombreError === "" && 
                      apellidoError === "" && 
                      tipoDocumentoError === "" && 
                      documentoError === "" && 
                      fechaError === "" && 
                      situacionLaboralError === ""
    
    return hasRequiredFields && hasNoErrors
  }

  const initializeUserData = async () => {
    if (!token) {
      Alert.alert("Error", "No hay sesión activa")
      onGoBack()
      return
    }

    const userIdFromToken = getUserIdFromToken(token);
    if (!userIdFromToken) {
      Alert.alert("Error", "No se pudo obtener la información del usuario")
      onGoBack()
      return
    }

    setUserId(userIdFromToken)
    loadUserData(userIdFromToken)
  }

  const loadUserData = async (userIdToLoad: string) => {
    setIsLoadingUser(true);
    try {
      const userData = await getCurrentUserProfile(token, userIdToLoad);
      
      setNombre(userData.nombre || "");
      setApellido(userData.apellido || "");
      setDocumento(userData.documento || "");
      setTipoDocumento(userData.tipoDocumento || "");
      setSituacionLaboral(userData.situacionLaboral || "");
      
      if (userData.fechaNacimiento) {
        try {
          const fecha = new Date(userData.fechaNacimiento);
          if (!isNaN(fecha.getTime())) {
            setDate(fecha);
            setFechaNacimiento(formatDate(fecha));
          }
        } catch (dateError) {
          console.warn('Error procesando fecha de nacimiento:', dateError);
        }
      }
      
    } catch (error) {
      if (error instanceof Error && error.message === 'Sesión expirada') {
        handleUnauthorized();
        return;
      }

      let errorMessage = "No se pudieron cargar los datos del usuario";
      
      if (error instanceof Error) {
        if (error.message.includes('Usuario no encontrado')) {
          errorMessage = "No se encontraron los datos de tu perfil.";
        } else if (error.message.includes('Error de conexión')) {
          errorMessage = "Error de conexión. Verifica tu internet y vuelve a intentar.";
        } else if (error.message.includes('Error del servidor')) {
          errorMessage = "El servidor no está disponible. Inténtalo más tarde.";
        } else {
          errorMessage = error.message;
        }
      }
      
      Alert.alert(
        "Error", 
        errorMessage,
        [
          {
            text: "Reintentar",
            onPress: () => loadUserData(userIdToLoad)
          },
          {
            text: "Volver",
            onPress: onGoBack,
            style: "cancel"
          }
        ]
      );
    } finally {
      setIsLoadingUser(false);
    }
  };

  const calcularDigitoVerificador = (cedula: string): number => {
    if (cedula.length < 7) return -1
    
    const numeros = cedula.substring(0, 7).split('').map(Number)
    const multiplicadores = [2, 9, 8, 7, 6, 3, 4]
    
    let suma = 0
    for (let i = 0; i < 7; i++) {
      suma += numeros[i] * multiplicadores[i]
    }
    
    const resto = suma % 10
    return resto === 0 ? 0 : 10 - resto
  }

  const validarCedulaUruguaya = (cedula: string): boolean => {
    if (cedula.length !== 8) return false
    
    const digitoCalculado = calcularDigitoVerificador(cedula)
    const digitoIngresado = parseInt(cedula[7])
    
    return digitoCalculado === digitoIngresado
  }

  const formatearCedula = (cedula: string): string => {
    if (cedula.length <= 1) return cedula
    if (cedula.length <= 4) return `${cedula.substring(0, 1)}.${cedula.substring(1)}`
    if (cedula.length <= 7) return `${cedula.substring(0, 1)}.${cedula.substring(1, 4)}.${cedula.substring(4)}`
    return `${cedula.substring(0, 1)}.${cedula.substring(1, 4)}.${cedula.substring(4, 7)}-${cedula.substring(7)}`
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

  const validateDocumento = (value: string) => {
    setShowDocumentValidation(true)
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

  const handleSaveChanges = async () => {
    if (!userId) {
      Alert.alert("Error", "No se pudo identificar el usuario")
      return
    }

    let hasErrors = false

    if (!nombre.trim()) {
      setNombreError("El nombre es obligatorio")
      hasErrors = true
    }

    if (!apellido.trim()) {
      setApellidoError("El apellido es obligatorio")
      hasErrors = true
    }

    if (!tipoDocumento) {
      setTipoDocumentoError("Debe seleccionar un tipo de documento")
      hasErrors = true
    }

    if (!documento.trim()) {
      setDocumentoError("El documento es obligatorio")
      hasErrors = true
    } else if (tipoDocumento === "CEDULA") {
      if (documento.length !== 8 || !validarCedulaUruguaya(documento)) {
        setDocumentoError("Por favor, ingrese una cédula válida")
        hasErrors = true
      }
    } else if (tipoDocumento === "PASAPORTE") {
      const pasaporteRegex = /^[A-Z][0-9]{7}$/
      if (!pasaporteRegex.test(documento)) {
        setDocumentoError("El pasaporte debe tener el formato: 1 letra + 7 dígitos (ej: A1234567)")
        hasErrors = true
      }
    }

    if (!date) {
      setFechaError("La fecha de nacimiento es obligatoria")
      hasErrors = true
    }

    if (!situacionLaboral) {
      setSituacionLaboralError("Debe seleccionar una situación laboral")
      hasErrors = true
    }

    if (hasErrors) return

    setIsLoading(true);
    try {
      const updateData = {
        nombre: nombre.trim(),
        apellido: apellido.trim(),
        documento: documento.trim(),
        tipoDocumento,
        fechaNacimiento: date?.toISOString().split('T')[0] || '',
        situacionLaboral,
      };

      const result = await updateUserProfile(token!, userId, updateData);

      if (result.success) {
        setShowDocumentValidation(false);
        Alert.alert(
          "Perfil actualizado",
          result.message,
          [{ text: "OK", onPress: onSuccess }]
        );
      } else {
        if (result.message === 'Sesión expirada') {
          handleUnauthorized();
          return;
        }

        if (result.message.includes('documento ya existe')) {
          setDocumentoError("Ya existe un usuario con este documento");
        } else {
          Alert.alert("Error", result.message);
        }
      }

    } catch (error) {
      if (error instanceof Error && error.message === 'Sesión expirada') {
        handleUnauthorized();
        return;
      }
      Alert.alert("Error", "No se pudieron guardar los cambios");
    } finally {
      setIsLoading(false);
    }
  };

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
          editable={!isLoading}
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
          editable={!isLoading}
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
          editable={!isLoading}
        />
      )
    }
  }

  const renderDocumentoValidation = () => {
    if (documentoError) {
      return <Text style={styles.errorText}>{documentoError}</Text>
    } else if (showDocumentValidation && tipoDocumento === "CEDULA" && documento.length === 8 && validarCedulaUruguaya(documento)) {
      return <Text style={styles.successText}>✓ Cédula válida</Text>
    } else if (showDocumentValidation && tipoDocumento === "PASAPORTE" && documento.length === 8 && /^[A-Z][0-9]{7}$/.test(documento)) {
      return <Text style={styles.successText}>✓ Pasaporte válido</Text>
    }
    return null
  }

  if (isLoadingUser) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#3B82F6" />
        <ImageBackground 
          source={require("../../assets/background.png")} 
          style={styles.backgroundImage} 
          resizeMode="cover"
        >
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#3B82F6" />
            <Text style={styles.loadingText}>Cargando datos del usuario...</Text>
          </View>
        </ImageBackground>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#3B82F6" />
      <ImageBackground 
        source={require("../../assets/background.png")} 
        style={styles.backgroundImage} 
        resizeMode="cover"
      >
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollViewContent}
          showsVerticalScrollIndicator={true}
          bounces={true}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.cardContainer}>
            <View style={styles.headerContainer}>
              <Text style={styles.headerTitle}>Editar Perfil</Text>
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
                  editable={!isLoading}
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
                  editable={!isLoading}
                />
                {apellidoError ? <Text style={styles.errorText}>{apellidoError}</Text> : null}
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Tipo de documento</Text>
                <TouchableOpacity 
                  style={[styles.selectButton, tipoDocumentoError ? styles.inputError : null]}
                  onPress={() => setShowTipoDocumentoModal(true)}
                  disabled={isLoading}
                >
                  <Text style={[styles.selectText, !tipoDocumento && styles.selectPlaceholder]}>
                    {tipoDocumento || "Seleccionar tipo de documento"}
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
                <Text style={styles.inputLabel}>Fecha de nacimiento</Text>
                <TouchableOpacity 
                  onPress={() => setShowDatePicker(true)}
                  disabled={isLoading}
                >
                  <View style={[styles.inputWithIcon, fechaError ? styles.inputError : null]}>
                    <Text style={[styles.inputText, !fechaNacimiento && styles.placeholderText]}>
                      {fechaNacimiento || 'DD/MM/AAAA'}
                    </Text>
                    <Icon name="calendar-today" size={20} color="#9CA3AF" />
                  </View>
                </TouchableOpacity>
                {fechaError ? <Text style={styles.errorText}>{fechaError}</Text> : null}
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Situación laboral</Text>
                <TouchableOpacity 
                  style={[styles.selectButton, situacionLaboralError ? styles.inputError : null]}
                  onPress={() => setShowSituacionModal(true)}
                  disabled={isLoading}
                >
                  <Text style={[styles.selectText, !situacionLaboral && styles.selectPlaceholder]}>
                    {situacionLaboral ? situacionLaboral.charAt(0) + situacionLaboral.slice(1).toLowerCase() : "Seleccionar situación laboral"}
                  </Text>
                  <Icon name="keyboard-arrow-down" size={24} color="#6B7280" />
                </TouchableOpacity>
                {situacionLaboralError ? <Text style={styles.errorText}>{situacionLaboralError}</Text> : null}
              </View>

              <TouchableOpacity 
                style={[
                  styles.saveButton, 
                  (isLoading || !isFormValid()) && styles.saveButtonDisabled
                ]} 
                activeOpacity={0.8} 
                onPress={handleSaveChanges}
                disabled={isLoading || !isFormValid()}
              >
                {isLoading ? (
                  <View style={styles.loadingButtonContainer}>
                    <ActivityIndicator size="small" color="white" />
                    <Text style={[styles.saveButtonText, styles.loadingButtonText]}>Guardando...</Text>
                  </View>
                ) : (
                  <Text style={styles.saveButtonText}>Guardar Cambios</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>

        {showDatePicker && (
          <DateTimePicker
            value={date || new Date(2000, 0, 1)}
            mode="date"
            display="default"
            onChange={onChangeDate}
            maximumDate={new Date()}
          />
        )}

        <Modal visible={showTipoDocumentoModal} transparent animationType="fade">
          <TouchableOpacity 
            style={styles.modalOverlay}
            activeOpacity={1} 
            onPress={() => setShowTipoDocumentoModal(false)}
          >
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
          </TouchableOpacity>
        </Modal>

        <Modal visible={showSituacionModal} transparent animationType="fade">
          <TouchableOpacity 
            style={styles.modalOverlay}
            activeOpacity={1} 
            onPress={() => setShowSituacionModal(false)}
          >
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Seleccionar situación laboral</Text>
              {situacionesLaborales.map((situacion) => (
                <TouchableOpacity 
                  key={situacion} 
                  style={styles.modalOption} 
                  onPress={() => selectSituacion(situacion)}
                >
                  <Text style={styles.modalOptionText}>
                    {situacion.charAt(0) + situacion.slice(1).toLowerCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </TouchableOpacity>
        </Modal>
      </ImageBackground>
    </SafeAreaView>
  )
}