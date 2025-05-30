import { useState } from "react"
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  StatusBar, 
  SafeAreaView, 
  ScrollView, 
  ImageBackground,
  Modal,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
  Keyboard
} from "react-native"
import Icon from "react-native-vector-icons/MaterialIcons"
import DateTimePicker from '@react-native-community/datetimepicker';

interface OneWayTripProps {
  onVolver: () => void
}

export function OneWayTrip({ onVolver }: OneWayTripProps) {
  const [origen, setOrigen] = useState("")
  const [origenError, setOrigenError] = useState("")
  const [destino, setDestino] = useState("")
  const [destinoError, setDestinoError] = useState("")
  const [fecha, setFecha] = useState("")
  const [fechaError, setFechaError] = useState("")
  const [pasajeros, setPasajeros] = useState("1")
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [date, setDate] = useState<Date | undefined>(undefined)
  const [showPasajerosModal, setShowPasajerosModal] = useState(false)

  const opcionesPasajeros = [
    { label: "1 pasajero", value: "1" },
    { label: "2 pasajeros", value: "2" },
    { label: "3 pasajeros", value: "3" },
    { label: "4 pasajeros", value: "4" },
  ]

  const validateOrigen = (value: string) => {
    setOrigen(value)
    setOrigenError(value.trim() === "" ? "El origen es obligatorio" : "")
  }

  const validateDestino = (value: string) => {
    setDestino(value)
    setDestinoError(value.trim() === "" ? "El destino es obligatorio" : "")
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
      setFecha(formatDate(selectedDate))
      setFechaError("")
    }
  }

  const selectPasajeros = (value: string, label: string) => {
    setPasajeros(value)
    setShowPasajerosModal(false)
  }

  const handleBuscar = () => {
    let hasErrors = false

    if (!origen.trim()) {
      setOrigenError("El origen es obligatorio")
      hasErrors = true
    }

    if (!destino.trim()) {
      setDestinoError("El destino es obligatorio")
      hasErrors = true
    }

    if (!date) {
      setFechaError("La fecha es obligatoria")
      hasErrors = true
    }

    if (hasErrors) return

    console.log("Buscando viajes de ida:", {
      origen,
      destino,
      fecha,
      pasajeros,
    })
  }

  const getPasajerosLabel = () => {
    const opcion = opcionesPasajeros.find(op => op.value === pasajeros)
    return opcion ? opcion.label : "Seleccionar pasajeros"
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <ImageBackground 
        source={require('../assets/background.png')} 
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <KeyboardAvoidingView 
            behavior={Platform.OS === "ios" ? "padding" : "height"} 
            style={styles.keyboardAvoidingView}
          >
            <ScrollView contentContainerStyle={styles.scrollViewContent}>
              <View style={styles.cardContainer}>
                {/* Header */}
                <View style={styles.headerContainer}>
                  <TouchableOpacity style={styles.backButton} onPress={onVolver}>
                    <Icon name="arrow-back" size={24} color="#374151" />
                  </TouchableOpacity>
                  <Text style={styles.headerTitle}>
                    Buscar Viaje{" "}
                    <Text style={styles.headerSubtitle}>(Solo ida)</Text>
                  </Text>
                  <View style={styles.placeholder} />
                </View>

                {/* Form Container */}
                <View style={styles.formContainer}>
                  {/* Origen */}
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Origen</Text>
                    <View style={[styles.inputWithIcon, origenError ? styles.inputError : null]}>
                      <TextInput
                        style={styles.textInput}
                        placeholder="Ciudad de origen"
                        placeholderTextColor="#9CA3AF"
                        value={origen}
                        onChangeText={validateOrigen}
                        autoCapitalize="words"
                      />
                      <Icon name="place" size={20} color="#9CA3AF" />
                    </View>
                    {origenError ? <Text style={styles.errorText}>{origenError}</Text> : null}
                  </View>

                  {/* Destino */}
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Destino</Text>
                    <View style={[styles.inputWithIcon, destinoError ? styles.inputError : null]}>
                      <TextInput
                        style={styles.textInput}
                        placeholder="Ciudad de destino"
                        placeholderTextColor="#9CA3AF"
                        value={destino}
                        onChangeText={validateDestino}
                        autoCapitalize="words"
                      />
                      <Icon name="place" size={20} color="#9CA3AF" />
                    </View>
                    {destinoError ? <Text style={styles.errorText}>{destinoError}</Text> : null}
                  </View>

                  {/* Fecha */}
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Fecha de viaje</Text>
                    <TouchableOpacity onPress={() => setShowDatePicker(true)}>
                      <View style={[styles.inputWithIcon, fechaError ? styles.inputError : null]}>
                        <Text style={[styles.inputText, !fecha && styles.placeholderText]}>
                          {fecha || 'DD/MM/AAAA'}
                        </Text>
                        <Icon name="event" size={20} color="#9CA3AF" />
                      </View>
                    </TouchableOpacity>
                    {fechaError ? <Text style={styles.errorText}>{fechaError}</Text> : null}
                  </View>

                  {showDatePicker && (
                    <DateTimePicker
                      value={date || new Date()}
                      mode="date"
                      display="default"
                      onChange={onChangeDate}
                      minimumDate={new Date()}
                    />
                  )}

                  {/* Número de pasajeros */}
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Número de pasajeros</Text>
                    <TouchableOpacity 
                      style={styles.selectButton} 
                      onPress={() => setShowPasajerosModal(true)}
                    >
                      <Text style={styles.selectText}>
                        {getPasajerosLabel()}
                      </Text>
                      <Icon name="keyboard-arrow-down" size={24} color="#6B7280" />
                    </TouchableOpacity>
                  </View>

                  {/* Información del viaje */}
                  <View style={styles.infoContainer}>
                    <Text style={styles.infoTitle}>Resumen del viaje:</Text>
                    <View style={styles.infoRow}>
                      <Icon name="info" size={16} color="#059669" />
                      <Text style={styles.infoItem}>Tipo: Solo ida</Text>
                    </View>
                    <View style={styles.infoRow}>
                      <Icon name="route" size={16} color="#059669" />
                      <Text style={styles.infoItem}>
                        Ruta: {origen || "___"} → {destino || "___"}
                      </Text>
                    </View>
                    <View style={styles.infoRow}>
                      <Icon name="event" size={16} color="#059669" />
                      <Text style={styles.infoItem}>
                        Fecha: {fecha || "No seleccionada"}
                      </Text>
                    </View>
                    <View style={styles.infoRow}>
                      <Icon name="people" size={16} color="#059669" />
                      <Text style={styles.infoItem}>
                        Pasajeros: {getPasajerosLabel()}
                      </Text>
                    </View>
                  </View>

                  {/* Botón buscar */}
                  <TouchableOpacity 
                    style={[
                      styles.searchButton,
                      (origen && destino && fecha) && styles.searchButtonActive
                    ]}
                    onPress={handleBuscar}
                    disabled={!(origen && destino && fecha)}
                    activeOpacity={0.8}
                  >
                    <Icon name="search" size={20} color="white" style={styles.searchIcon} />
                    <Text style={styles.searchButtonText}>Buscar Pasajes</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </TouchableWithoutFeedback>

        {/* Modal para seleccionar pasajeros */}
        <Modal visible={showPasajerosModal} transparent animationType="fade">
          <TouchableWithoutFeedback onPress={() => setShowPasajerosModal(false)}>
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Seleccionar pasajeros</Text>
                {opcionesPasajeros.map((opcion) => (
                  <TouchableOpacity 
                    key={opcion.value} 
                    style={styles.modalOption} 
                    onPress={() => selectPasajeros(opcion.value, opcion.label)}
                  >
                    <Text style={styles.modalOptionText}>{opcion.label}</Text>
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
  headerSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "normal",
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
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: "#1F2937",
  },
  inputText: {
    fontSize: 16,
    color: '#1F2937',
  },
  placeholderText: {
    color: '#9CA3AF',
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
  infoContainer: {
    backgroundColor: "#ECFDF5",
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#A7F3D0",
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#059669",
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  infoItem: {
    fontSize: 14,
    color: "#047857",
    marginLeft: 8,
    flex: 1,
  },
  searchButton: {
    backgroundColor: "#9CA3AF",
    borderRadius: 8,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  searchButtonActive: {
    backgroundColor: "#10B981",
  },
  searchIcon: {
    marginRight: 8,
  },
  searchButtonText: {
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
})