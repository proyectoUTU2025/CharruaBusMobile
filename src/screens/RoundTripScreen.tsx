"use client"

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
  Keyboard,
} from "react-native"
import Icon from "react-native-vector-icons/MaterialIcons"
import DateTimePicker from "@react-native-community/datetimepicker"

interface RoundTripProps {
  onVolver?: () => void
  onGoBack?: () => void // Compatibilidad adicional
  onNavigateToViewTrips?: (params: any) => void // Para futuras integraciones
}

export function RoundTripScreen({ onVolver, onGoBack, onNavigateToViewTrips }: RoundTripProps) {
  // Estados del formulario
  const [origen, setOrigen] = useState("")
  const [origenError, setOrigenError] = useState("")
  const [destino, setDestino] = useState("")
  const [destinoError, setDestinoError] = useState("")
  const [fechaIda, setFechaIda] = useState("")
  const [fechaIdaError, setFechaIdaError] = useState("")
  const [fechaVuelta, setFechaVuelta] = useState("")
  const [fechaVueltaError, setFechaVueltaError] = useState("")
  const [pasajeros, setPasajeros] = useState("1")

  // Estados para los date pickers
  const [showDatePickerIda, setShowDatePickerIda] = useState(false)
  const [showDatePickerVuelta, setShowDatePickerVuelta] = useState(false)
  const [dateIda, setDateIda] = useState<Date | undefined>(undefined)
  const [dateVuelta, setDateVuelta] = useState<Date | undefined>(undefined)

  // Estados para modales
  const [showPasajerosModal, setShowPasajerosModal] = useState(false)

  const opcionesPasajeros = [
    { label: "1 pasajero", value: "1" },
    { label: "2 pasajeros", value: "2" },
    { label: "3 pasajeros", value: "3" },
    { label: "4 pasajeros", value: "4" },
  ]

  const handleVolver = () => {
    console.log("RoundTripScreen - handleVolver llamado")
    if (onVolver) {
      onVolver()
    } else if (onGoBack) {
      onGoBack()
    }
  }

  const validateOrigen = (value: string) => {
    setOrigen(value)
    setOrigenError(value.trim() === "" ? "El origen es obligatorio" : "")
  }

  const validateDestino = (value: string) => {
    setDestino(value)
    setDestinoError(value.trim() === "" ? "El destino es obligatorio" : "")
  }

  const formatDate = (date: Date) => {
    const day = String(date.getDate()).padStart(2, "0")
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const year = date.getFullYear()
    return `${day}/${month}/${year}`
  }

  const onChangeDateIda = (event: any, selectedDate?: Date) => {
    setShowDatePickerIda(false)
    if (selectedDate) {
      setDateIda(selectedDate)
      setFechaIda(formatDate(selectedDate))
      setFechaIdaError("")

      // Si ya hay fecha de vuelta seleccionada y es anterior a la nueva fecha de ida,
      // limpiar la fecha de vuelta para evitar inconsistencias
      if (dateVuelta && selectedDate > dateVuelta) {
        console.log("Fecha de ida posterior a fecha de vuelta, limpiando fecha de vuelta")
        setDateVuelta(undefined)
        setFechaVuelta("")
        setFechaVueltaError("")
      }
    }
  }

  const onChangeDateVuelta = (event: any, selectedDate?: Date) => {
    setShowDatePickerVuelta(false)
    if (selectedDate) {
      setDateVuelta(selectedDate)
      setFechaVuelta(formatDate(selectedDate))
      setFechaVueltaError("")
    }
  }

  const selectPasajeros = (value: string, label: string) => {
    console.log("Pasajeros seleccionados:", value, label)
    setPasajeros(value)
    setShowPasajerosModal(false)
  }

  const handleBuscar = () => {
    console.log("Iniciando búsqueda de viajes de ida y vuelta")
    let hasErrors = false

    // Validaciones
    if (!origen.trim()) {
      setOrigenError("El origen es obligatorio")
      hasErrors = true
    }

    if (!destino.trim()) {
      setDestinoError("El destino es obligatorio")
      hasErrors = true
    }

    if (!dateIda) {
      setFechaIdaError("La fecha de ida es obligatoria")
      hasErrors = true
    }

    if (!dateVuelta) {
      setFechaVueltaError("La fecha de vuelta es obligatoria")
      hasErrors = true
    }

    // Validación de fechas: la fecha de vuelta debe ser posterior a la fecha de ida
    if (dateIda && dateVuelta && dateVuelta <= dateIda) {
      setFechaVueltaError("La fecha de vuelta debe ser posterior a la fecha de ida")
      hasErrors = true
    }

    if (hasErrors) {
      console.log("Errores de validación encontrados")
      return
    }

    const searchParams = {
      origen,
      destino,
      fechaIda,
      fechaVuelta,
      dateIda: dateIda!.toISOString(),
      dateVuelta: dateVuelta!.toISOString(),
      pasajeros,
      tipoViaje: "ida-vuelta",
    }

    console.log("Buscando viajes de ida y vuelta:", searchParams)

    // Si hay función de navegación disponible, usarla
    if (onNavigateToViewTrips) {
      onNavigateToViewTrips(searchParams)
    } else {
      // Placeholder para futuras implementaciones
      console.log("Función de navegación no disponible, implementar navegación a resultados")
    }
  }

  const getPasajerosLabel = () => {
    const opcion = opcionesPasajeros.find((op) => op.value === pasajeros)
    return opcion ? opcion.label : "Seleccionar pasajeros"
  }

  const isFormValid = () => {
    return origen.trim() && destino.trim() && fechaIda && fechaVuelta && dateIda && dateVuelta && dateVuelta > dateIda
  }

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
              showsVerticalScrollIndicator={true}
              bounces={true}
              keyboardShouldPersistTaps="handled"
            >
              <View style={styles.cardContainer}>
                {/* Header */}
                <View style={styles.headerContainer}>
                  <TouchableOpacity style={styles.backButton} onPress={handleVolver}>
                    <Icon name="arrow-back" size={24} color="#374151" />
                  </TouchableOpacity>
                  <Text style={styles.headerTitle}>
                    Buscar Viaje <Text style={styles.headerSubtitle}>(Ida y vuelta)</Text>
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

                  {/* Fecha de ida */}
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Fecha de ida</Text>
                    <TouchableOpacity onPress={() => setShowDatePickerIda(true)}>
                      <View style={[styles.inputWithIcon, fechaIdaError ? styles.inputError : null]}>
                        <Text style={[styles.inputText, !fechaIda && styles.placeholderText]}>
                          {fechaIda || "DD/MM/AAAA"}
                        </Text>
                        <Icon name="event" size={20} color="#9CA3AF" />
                      </View>
                    </TouchableOpacity>
                    {fechaIdaError ? <Text style={styles.errorText}>{fechaIdaError}</Text> : null}
                  </View>

                  {showDatePickerIda && (
                    <DateTimePicker
                      value={dateIda || new Date()}
                      mode="date"
                      display="default"
                      onChange={onChangeDateIda}
                      minimumDate={new Date()}
                    />
                  )}

                  {/* Fecha de vuelta */}
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Fecha de vuelta</Text>
                    <TouchableOpacity onPress={() => setShowDatePickerVuelta(true)}>
                      <View style={[styles.inputWithIcon, fechaVueltaError ? styles.inputError : null]}>
                        <Text style={[styles.inputText, !fechaVuelta && styles.placeholderText]}>
                          {fechaVuelta || "DD/MM/AAAA"}
                        </Text>
                        <Icon name="event" size={20} color="#9CA3AF" />
                      </View>
                    </TouchableOpacity>
                    {fechaVueltaError ? <Text style={styles.errorText}>{fechaVueltaError}</Text> : null}
                  </View>

                  {showDatePickerVuelta && (
                    <DateTimePicker
                      value={dateVuelta || (dateIda ? new Date(dateIda.getTime() + 24 * 60 * 60 * 1000) : new Date())}
                      mode="date"
                      display="default"
                      onChange={onChangeDateVuelta}
                      minimumDate={dateIda ? new Date(dateIda.getTime() + 24 * 60 * 60 * 1000) : new Date()}
                    />
                  )}

                  {/* Número de pasajeros */}
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Número de pasajeros</Text>
                    <TouchableOpacity style={styles.selectButton} onPress={() => setShowPasajerosModal(true)}>
                      <Text style={styles.selectText}>{getPasajerosLabel()}</Text>
                      <Icon name="keyboard-arrow-down" size={24} color="#6B7280" />
                    </TouchableOpacity>
                  </View>

                  {/* Información del viaje */}
                  <View style={styles.infoContainer}>
                    <Text style={styles.infoTitle}>Resumen del viaje:</Text>
                    <View style={styles.infoRow}>
                      <Icon name="info" size={16} color="#059669" />
                      <Text style={styles.infoItem}>Tipo: Ida y vuelta</Text>
                    </View>
                    <View style={styles.infoRow}>
                      <Icon name="route" size={16} color="#059669" />
                      <Text style={styles.infoItem}>
                        Ruta: {origen || "___"} → {destino || "___"}
                      </Text>
                    </View>
                    <View style={styles.infoRow}>
                      <Icon name="event" size={16} color="#059669" />
                      <Text style={styles.infoItem}>Fecha de ida: {fechaIda || "No seleccionada"}</Text>
                    </View>
                    <View style={styles.infoRow}>
                      <Icon name="event" size={16} color="#059669" />
                      <Text style={styles.infoItem}>Fecha de vuelta: {fechaVuelta || "No seleccionada"}</Text>
                    </View>
                    <View style={styles.infoRow}>
                      <Icon name="people" size={16} color="#059669" />
                      <Text style={styles.infoItem}>Pasajeros: {getPasajerosLabel()}</Text>
                    </View>
                  </View>

                  {/* Botón buscar */}
                  <TouchableOpacity
                    style={[styles.searchButton, isFormValid() && styles.searchButtonActive]}
                    onPress={handleBuscar}
                    disabled={!isFormValid()}
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

// Exportación adicional para compatibilidad
export const RoundTrip = RoundTripScreen

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
    paddingBottom: 40,
  },
  cardContainer: {
    width: "100%",
    maxWidth: 500,
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
    alignSelf: "center",
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
    gap: 20,
  },
  inputContainer: {
    marginBottom: 4,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 8,
  },
  inputWithIcon: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F9FAFB",
    height: 50,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    paddingHorizontal: 16,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: "#374151",
  },
  inputText: {
    fontSize: 16,
    color: "#374151",
  },
  placeholderText: {
    color: "#9CA3AF",
  },
  inputError: {
    borderColor: "#EF4444",
    backgroundColor: "#FEF2F2",
  },
  errorText: {
    color: "#EF4444",
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  selectButton: {
    backgroundColor: "#F9FAFB",
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
    color: "#374151",
  },
  infoContainer: {
    backgroundColor: "#ECFDF5",
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#10B981",
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#065F46",
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  infoItem: {
    fontSize: 14,
    color: "#059669",
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
    marginTop: 16,
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
    fontSize: 18,
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
