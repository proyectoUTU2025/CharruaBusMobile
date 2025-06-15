import { useState, useEffect } from "react"
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
  FlatList,
  ActivityIndicator
} from "react-native"
import Icon from "react-native-vector-icons/MaterialIcons"
import DateTimePicker from '@react-native-community/datetimepicker'
import { useAuth } from '../context/AuthContext'
import { getOrigenesPosibles, getDestinosPosibles, Localidad } from '../services/locationService'
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';

// CAMBIO 1: Agregar tipos para las rutas
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface OneWayTripScreenProps {
  onGoBack?: () => void;
  onNavigateToViewTrips?: (params: any) => void;
}

export const OneWayTripScreen = ({ onGoBack, onNavigateToViewTrips }: OneWayTripScreenProps) => {
  const { token } = useAuth()
  const navigation = useNavigation<NavigationProp>();
  

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


  const [localidades, setLocalidades] = useState<Localidad[]>([])
  const [filteredLocalidades, setFilteredLocalidades] = useState<Localidad[]>([])
  const [showOrigenModal, setShowOrigenModal] = useState(false)
  const [loadingLocalidades, setLoadingLocalidades] = useState(false)
  const [origenSeleccionado, setOrigenSeleccionado] = useState<Localidad | null>(null)
  const [searchOrigen, setSearchOrigen] = useState("")

  const [destinos, setDestinos] = useState<Localidad[]>([])
  const [filteredDestinos, setFilteredDestinos] = useState<Localidad[]>([])
  const [showDestinoModal, setShowDestinoModal] = useState(false)
  const [loadingDestinos, setLoadingDestinos] = useState(false)
  const [destinoSeleccionado, setDestinoSeleccionado] = useState<Localidad | null>(null)
  const [searchDestino, setSearchDestino] = useState("")

  const handleVolver = () => {
    if (onGoBack) {
      onGoBack();
    } else {
      navigation.goBack();
    }
  };
  const opcionesPasajeros = [
    { label: "1 pasajero", value: "1" },
    { label: "2 pasajeros", value: "2" },
    { label: "3 pasajeros", value: "3" },
    { label: "4 pasajeros", value: "4" },
  ]


  useEffect(() => {
    const cargarLocalidades = async () => {
      if (!token) return

      try {
        setLoadingLocalidades(true)
        const localidadesData = await getOrigenesPosibles(token)
        setLocalidades(localidadesData)
        setFilteredLocalidades(localidadesData)
      } catch (error) {
        console.error('Error cargando localidades:', error)
      } finally {
        setLoadingLocalidades(false)
      }
    }

    cargarLocalidades()
  }, [token])

  useEffect(() => {
    const cargarDestinos = async () => {
      if (!token || !origenSeleccionado) return

      try {
        setLoadingDestinos(true)
        const destinosData = await getDestinosPosibles(token, origenSeleccionado.id)
        setDestinos(destinosData)
        setFilteredDestinos(destinosData)
      } catch (error) {
        console.error('Error cargando destinos:', error)
      } finally {
        setLoadingDestinos(false)
      }
    }

    cargarDestinos()
  }, [token, origenSeleccionado])

  useEffect(() => {
    if (searchOrigen.trim() === "") {
      setFilteredLocalidades(localidades)
    } else {
      const filtered = localidades.filter(localidad =>
        localidad.nombreConDepartamento.toLowerCase().includes(searchOrigen.toLowerCase())
      )
      setFilteredLocalidades(filtered)
    }
  }, [searchOrigen, localidades])

  useEffect(() => {
    if (searchDestino.trim() === "") {
      setFilteredDestinos(destinos)
    } else {
      const filtered = destinos.filter(destino =>
        destino.nombreConDepartamento.toLowerCase().includes(searchDestino.toLowerCase())
      )
      setFilteredDestinos(filtered)
    }
  }, [searchDestino, destinos])

  const validateOrigen = (value: string) => {
    setOrigen(value)
    setOrigenError(value.trim() === "" ? "El origen es obligatorio" : "")
    
    if (origenSeleccionado && value !== origenSeleccionado.nombreConDepartamento) {
      setOrigenSeleccionado(null)
      setDestino("")
      setDestinoSeleccionado(null)
      setDestinoError("")
      setDestinos([])
      setFilteredDestinos([])
    }
  }

  const validateDestino = (value: string) => {
    if (!origenSeleccionado) {
      setDestinoError("Primero debes seleccionar un origen")
      return
    }
    setDestino(value)
    setDestinoError(value.trim() === "" ? "El destino es obligatorio" : "")
  }


  const selectOrigen = (localidad: Localidad) => {
    setOrigenSeleccionado(localidad)
    setOrigen(localidad.nombreConDepartamento)
    setOrigenError("")
    setShowOrigenModal(false)
    setSearchOrigen("")
  
    setDestino("")
    setDestinoSeleccionado(null)
    setDestinoError("")
  }

  const selectDestino = (localidad: Localidad) => {
    setDestinoSeleccionado(localidad)
    setDestino(localidad.nombreConDepartamento)
    setDestinoError("")
    setShowDestinoModal(false)
    setSearchDestino("")
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


    if (!origenSeleccionado) {

      setOrigenError("El origen es obligatorio")
      hasErrors = true
    }

    if (!destinoSeleccionado) {
      setDestinoError("El destino es obligatorio")
      hasErrors = true
    }

    if (!date) {
      setFechaError("La fecha es obligatoria")
      hasErrors = true
    }

    if (hasErrors) return


    if (origenSeleccionado && destinoSeleccionado && date) {
      // CORRECCIÓN: Usar la función de callback en lugar de navigation.navigate
      if (onNavigateToViewTrips) {
        onNavigateToViewTrips({
          origenSeleccionado,
          destinoSeleccionado,
          fecha,
          date: date.toISOString(),
          pasajeros,
        });
      } else {
        // Fallback para navegación directa (si se usa fuera del BottomTabsNavigator)
        navigation.navigate('ViewTrips', {
          origenSeleccionado,
          destinoSeleccionado,
          fecha,
          date: date.toISOString(),
          pasajeros,
        });
      }
    }
  }

  const getPasajerosLabel = () => {
    const opcion = opcionesPasajeros.find(op => op.value === pasajeros)
    return opcion ? opcion.label : "Seleccionar pasajeros"
  }


  const renderLocalidadItem = ({ item }: { item: Localidad }) => (
    <TouchableOpacity 
      style={styles.modalOption} 
      onPress={() => selectOrigen(item)}
    >
      <Text style={styles.modalOptionText}>{item.nombreConDepartamento}</Text>
    </TouchableOpacity>
  )

  const renderDestinoItem = ({ item }: { item: Localidad }) => (
    <TouchableOpacity 
      style={styles.modalOption} 
      onPress={() => selectDestino(item)}
    >
      <Text style={styles.modalOptionText}>{item.nombreConDepartamento}</Text>
    </TouchableOpacity>
  )

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#4285F4" barStyle="light-content" />
      <ImageBackground 
        source={require('../assets/background.png')} 
        style={styles.backgroundImage}
        resizeMode="cover"
      >

        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollViewContent}
          showsVerticalScrollIndicator={true}
          bounces={true}
        >
          <View style={styles.cardContainer}>
            {/* Header */}
            <View style={styles.headerContainer}>
              <TouchableOpacity style={styles.backButton} onPress={handleVolver}>
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
                <TouchableOpacity onPress={() => setShowOrigenModal(true)}>
                  <View style={[styles.inputWithIcon, origenError ? styles.inputError : null]}>
                    <Text style={[styles.inputText, !origen && styles.placeholderText]}>
                      {origen || 'Seleccionar localidad de origen'}
                    </Text>
                    <Icon name="place" size={20} color="#9CA3AF" />
                  </View>
                </TouchableOpacity>
                {origenError ? <Text style={styles.errorText}>{origenError}</Text> : null}
              </View>

              {/* Destino */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Destino</Text>
                <TouchableOpacity 
                  onPress={() => origenSeleccionado && setShowDestinoModal(true)}
                  disabled={!origenSeleccionado}
                >
                  <View style={[
                    styles.inputWithIcon, 
                    destinoError ? styles.inputError : null,
                    !origenSeleccionado ? styles.inputDisabled : null
                  ]}>
                    <Text style={[
                      styles.inputText, 
                      (!destino || !origenSeleccionado) && styles.placeholderText
                    ]}>
                      {origenSeleccionado 
                        ? (destino || 'Seleccionar ciudad de destino')
                        : 'Primero selecciona un origen'
                      }
                    </Text>
                    <Icon name="place" size={20} color={origenSeleccionado ? "#9CA3AF" : "#D1D5DB"} />
                  </View>
                </TouchableOpacity>
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
                  (origenSeleccionado && destinoSeleccionado && fecha) && styles.searchButtonActive
                ]}
                onPress={handleBuscar}
                disabled={!(origenSeleccionado && destinoSeleccionado && fecha)}
                activeOpacity={0.8}
              >
                <Icon name="search" size={20} color="white" style={styles.searchIcon} />
                <Text style={styles.searchButtonText}>Buscar Viajes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>

        {/* Modal para seleccionar origen */}
        <Modal visible={showOrigenModal} transparent animationType="fade">
          <TouchableWithoutFeedback onPress={() => setShowOrigenModal(false)}>
            <View style={styles.modalOverlay}>
              <TouchableWithoutFeedback onPress={() => {}}>
                <View style={styles.modalContentLarge}>
                  <Text style={styles.modalTitle}>Seleccionar origen</Text>
                  
                  {/* Buscador */}
                  <View style={styles.searchContainer}>
                    <Icon name="search" size={20} color="#9CA3AF" />
                    <TextInput
                      style={styles.searchInput}
                      placeholder="Buscar ciudad..."
                      placeholderTextColor="#9CA3AF"
                      value={searchOrigen}
                      onChangeText={setSearchOrigen}
                    />
                  </View>

                  {loadingLocalidades ? (
                    <View style={styles.loadingContainer}>
                      <ActivityIndicator size="large" color="#10B981" />
                      <Text style={styles.loadingText}>Cargando localidades...</Text>
                    </View>
                  ) : (
                    <FlatList
                      data={filteredLocalidades}
                      renderItem={renderLocalidadItem}
                      keyExtractor={(item) => item.id.toString()}
                      style={styles.localidadesList}
                      showsVerticalScrollIndicator={false}
                      ListEmptyComponent={
                        <Text style={styles.emptyText}>
                          No se encontraron localidades
                        </Text>
                      }
                    />
                  )}

                  <TouchableOpacity 
                    style={styles.closeButton}
                    onPress={() => setShowOrigenModal(false)}
                  >
                    <Text style={styles.closeButtonText}>Cerrar</Text>
                  </TouchableOpacity>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>

        {/* Modal para seleccionar destino */}
        <Modal visible={showDestinoModal} transparent animationType="fade">
          <TouchableWithoutFeedback onPress={() => setShowDestinoModal(false)}>
            <View style={styles.modalOverlay}>
              <TouchableWithoutFeedback onPress={() => {}}>
                <View style={styles.modalContentLarge}>
                  <Text style={styles.modalTitle}>Seleccionar destino</Text>
                  
                  {/* Buscador */}
                  <View style={styles.searchContainer}>
                    <Icon name="search" size={20} color="#9CA3AF" />
                    <TextInput
                      style={styles.searchInput}
                      placeholder="Buscar ciudad..."
                      placeholderTextColor="#9CA3AF"
                      value={searchDestino}
                      onChangeText={setSearchDestino}
                    />
                  </View>

                  {loadingDestinos ? (
                    <View style={styles.loadingContainer}>
                      <ActivityIndicator size="large" color="#10B981" />
                      <Text style={styles.loadingText}>Cargando destinos...</Text>
                    </View>
                  ) : (
                    <FlatList
                      data={filteredDestinos}
                      renderItem={renderDestinoItem}
                      keyExtractor={(item) => item.id.toString()}
                      style={styles.localidadesList}
                      showsVerticalScrollIndicator={false}
                      ListEmptyComponent={
                        <Text style={styles.emptyText}>
                          No se encontraron destinos disponibles
                        </Text>
                      }
                    />
                  )}

                  <TouchableOpacity 
                    style={styles.closeButton}
                    onPress={() => setShowDestinoModal(false)}
                  >
                    <Text style={styles.closeButtonText}>Cerrar</Text>
                  </TouchableOpacity>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>


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

  scrollView: {

    flex: 1,
    width: "100%",
  },
  scrollViewContent: {
    flexGrow: 1,

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

    alignSelf: 'center',
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
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 14,
    minHeight: 48,
  },
  inputText: {
    flex: 1,
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
  inputDisabled: {
    backgroundColor: "#F3F4F6",
    borderColor: "#E5E7EB",
  },
  errorText: {
    fontSize: 12,
    color: "#EF4444",

    marginTop: 4,
    marginLeft: 4,
  },
  selectButton: {

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 14,
    minHeight: 48,
  },
  selectText: {
    fontSize: 16,
    color: "#374151",
  },
  infoContainer: {
    backgroundColor: "#ECFDF5",
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: "#10B981",
    marginTop: 8,

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

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",

    backgroundColor: "#9CA3AF",
    borderRadius: 8,
    paddingVertical: 16,
    paddingHorizontal: 24,

    marginTop: 16,

  },
  searchButtonActive: {
    backgroundColor: "#10B981",
  },
  searchIcon: {
    marginRight: 8,
  },
  searchButtonText: {

    fontSize: 18,
    fontWeight: "600",
    color: "white",
  },
  // Modal styles
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

    maxHeight: "60%",
  },
  modalContentLarge: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    width: "90%",
    maxHeight: "80%",

  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",

    color: "#374151",

    marginBottom: 16,
    textAlign: "center",
  },
  modalOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,

    borderBottomColor: "#E5E7EB",

  },
  modalOptionText: {
    fontSize: 16,
    color: "#374151",

  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#374151",
    marginLeft: 8,
  },
  localidadesList: {
    maxHeight: 300,
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    color: "#6B7280",
    marginTop: 12,
  },
  emptyText: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    paddingVertical: 20,
  },
  closeButton: {
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: "center",
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#374151",
  },
});

"use client"

import { useState, useEffect } from "react"
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
  FlatList,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from "react-native"
import Icon from "react-native-vector-icons/MaterialIcons"
import DateTimePicker from "@react-native-community/datetimepicker"
import { useAuth } from "../context/AuthContext"
import { getOrigenesPosibles, getDestinosPosibles, type Localidad } from "../services/locationService"
import { useNavigation } from "@react-navigation/native"
import type { NativeStackNavigationProp } from "@react-navigation/native-stack"
import type { RootStackParamList } from "../navigation/AppNavigator"

// Tipos para navegación
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

type NavigationProp = NativeStackNavigationProp<RootStackParamList>

interface OneWayTripScreenProps {
  onGoBack?: () => void
  onNavigateToViewTrips?: (params: any) => void
  onVolver?: () => void // Compatibilidad con versión 2
}

// ✅ CAMBIADO: export default function en lugar de export const
export default function OneWayTripScreen({ onGoBack, onNavigateToViewTrips, onVolver }: OneWayTripScreenProps) {
  const { token } = useAuth()
  const navigation = useNavigation<NavigationProp>()

  // Estados del formulario
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

  // Estados para localidades (versión avanzada)
  const [localidades, setLocalidades] = useState<Localidad[]>([])
  const [filteredLocalidades, setFilteredLocalidades] = useState<Localidad[]>([])
  const [showOrigenModal, setShowOrigenModal] = useState(false)
  const [loadingLocalidades, setLoadingLocalidades] = useState(false)
  const [origenSeleccionado, setOrigenSeleccionado] = useState<Localidad | null>(null)
  const [searchOrigen, setSearchOrigen] = useState("")

  // Estados para destinos (versión avanzada)
  const [destinos, setDestinos] = useState<Localidad[]>([])
  const [filteredDestinos, setFilteredDestinos] = useState<Localidad[]>([])
  const [showDestinoModal, setShowDestinoModal] = useState(false)
  const [loadingDestinos, setLoadingDestinos] = useState(false)
  const [destinoSeleccionado, setDestinoSeleccionado] = useState<Localidad | null>(null)
  const [searchDestino, setSearchDestino] = useState("")

  // Estado para modo simple (fallback si no hay token)
  const [modoSimple, setModoSimple] = useState(false)

  const handleVolver = () => {
    console.log("OneWayTripScreen - handleVolver llamado")
    if (onGoBack) {
      onGoBack()
    } else if (onVolver) {
      onVolver()
    } else {
      navigation.goBack()
    }
  }

  const opcionesPasajeros = [
    { label: "1 pasajero", value: "1" },
    { label: "2 pasajeros", value: "2" },
    { label: "3 pasajeros", value: "3" },
    { label: "4 pasajeros", value: "4" },
  ]

  // Cargar localidades si hay token
  useEffect(() => {
    const cargarLocalidades = async () => {
      if (!token) {
        console.log("No hay token, usando modo simple")
        setModoSimple(true)
        return
      }

      try {
        console.log("Cargando localidades...")
        setLoadingLocalidades(true)
        const localidadesData = await getOrigenesPosibles(token)
        console.log("Localidades cargadas:", localidadesData.length)
        setLocalidades(localidadesData)
        setFilteredLocalidades(localidadesData)
        setModoSimple(false)
      } catch (error) {
        console.error("Error cargando localidades:", error)
        setModoSimple(true) // Fallback a modo simple
      } finally {
        setLoadingLocalidades(false)
      }
    }

    cargarLocalidades()
  }, [token])

  // Cargar destinos cuando se selecciona origen
  useEffect(() => {
    const cargarDestinos = async () => {
      if (!token || !origenSeleccionado || modoSimple) return

      try {
        console.log("Cargando destinos para origen:", origenSeleccionado.nombreConDepartamento)
        setLoadingDestinos(true)
        const destinosData = await getDestinosPosibles(token, origenSeleccionado.id)
        console.log("Destinos cargados:", destinosData.length)
        setDestinos(destinosData)
        setFilteredDestinos(destinosData)
      } catch (error) {
        console.error("Error cargando destinos:", error)
      } finally {
        setLoadingDestinos(false)
      }
    }

    cargarDestinos()
  }, [token, origenSeleccionado, modoSimple])

  // Filtrar localidades por búsqueda
  useEffect(() => {
    if (searchOrigen.trim() === "") {
      setFilteredLocalidades(localidades)
    } else {
      const filtered = localidades.filter((localidad) =>
        localidad.nombreConDepartamento.toLowerCase().includes(searchOrigen.toLowerCase()),
      )
      setFilteredLocalidades(filtered)
    }
  }, [searchOrigen, localidades])

  // Filtrar destinos por búsqueda
  useEffect(() => {
    if (searchDestino.trim() === "") {
      setFilteredDestinos(destinos)
    } else {
      const filtered = destinos.filter((destino) =>
        destino.nombreConDepartamento.toLowerCase().includes(searchDestino.toLowerCase()),
      )
      setFilteredDestinos(filtered)
    }
  }, [searchDestino, destinos])

  // Validaciones para modo simple
  const validateOrigenSimple = (value: string) => {
    setOrigen(value)
    setOrigenError(value.trim() === "" ? "El origen es obligatorio" : "")
  }

  const validateDestinoSimple = (value: string) => {
    setDestino(value)
    setDestinoError(value.trim() === "" ? "El destino es obligatorio" : "")
  }

  // Validaciones para modo avanzado
  const validateOrigen = (value: string) => {
    setOrigen(value)
    setOrigenError(value.trim() === "" ? "El origen es obligatorio" : "")

    if (origenSeleccionado && value !== origenSeleccionado.nombreConDepartamento) {
      setOrigenSeleccionado(null)
      setDestino("")
      setDestinoSeleccionado(null)
      setDestinoError("")
      setDestinos([])
      setFilteredDestinos([])
    }
  }

  const validateDestino = (value: string) => {
    if (!modoSimple && !origenSeleccionado) {
      setDestinoError("Primero debes seleccionar un origen")
      return
    }
    setDestino(value)
    setDestinoError(value.trim() === "" ? "El destino es obligatorio" : "")
  }

  const selectOrigen = (localidad: Localidad) => {
    console.log("Origen seleccionado:", localidad.nombreConDepartamento)
    setOrigenSeleccionado(localidad)
    setOrigen(localidad.nombreConDepartamento)
    setOrigenError("")
    setShowOrigenModal(false)
    setSearchOrigen("")

    // Limpiar destino
    setDestino("")
    setDestinoSeleccionado(null)
    setDestinoError("")
  }

  const selectDestino = (localidad: Localidad) => {
    console.log("Destino seleccionado:", localidad.nombreConDepartamento)
    setDestinoSeleccionado(localidad)
    setDestino(localidad.nombreConDepartamento)
    setDestinoError("")
    setShowDestinoModal(false)
    setSearchDestino("")
  }

  const formatDate = (date: Date) => {
    const day = String(date.getDate()).padStart(2, "0")
    const month = String(date.getMonth() + 1).padStart(2, "0")
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
    console.log("Iniciando búsqueda de viajes...")
    let hasErrors = false

    // Validaciones según el modo
    if (modoSimple) {
      if (!origen.trim()) {
        setOrigenError("El origen es obligatorio")
        hasErrors = true
      }

      if (!destino.trim()) {
        setDestinoError("El destino es obligatorio")
        hasErrors = true
      }
    } else {
      if (!origenSeleccionado) {
        setOrigenError("El origen es obligatorio")
        hasErrors = true
      }

      if (!destinoSeleccionado) {
        setDestinoError("El destino es obligatorio")
        hasErrors = true
      }
    }

    if (!date) {
      setFechaError("La fecha es obligatoria")
      hasErrors = true
    }

    if (hasErrors) {
      console.log("Errores de validación encontrados")
      return
    }

    // Preparar parámetros para navegación
    const params = {
      origenSeleccionado: modoSimple ? { nombreConDepartamento: origen } : origenSeleccionado,
      destinoSeleccionado: modoSimple ? { nombreConDepartamento: destino } : destinoSeleccionado,
      fecha,
      date: date!.toISOString(),
      pasajeros,
    }

    console.log("Navegando a ViewTrips con params:", params)

    if (onNavigateToViewTrips) {
      onNavigateToViewTrips(params)
    } else {
      // Fallback para navegación directa
      navigation.navigate("ViewTrips", params)
    }
  }

  const getPasajerosLabel = () => {
    const opcion = opcionesPasajeros.find((op) => op.value === pasajeros)
    return opcion ? opcion.label : "Seleccionar pasajeros"
  }

  const renderLocalidadItem = ({ item }: { item: Localidad }) => (
    <TouchableOpacity style={styles.modalOption} onPress={() => selectOrigen(item)}>
      <Text style={styles.modalOptionText}>{item.nombreConDepartamento}</Text>
    </TouchableOpacity>
  )

  const renderDestinoItem = ({ item }: { item: Localidad }) => (
    <TouchableOpacity style={styles.modalOption} onPress={() => selectDestino(item)}>
      <Text style={styles.modalOptionText}>{item.nombreConDepartamento}</Text>
    </TouchableOpacity>
  )

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#4285F4" barStyle="light-content" />
      <ImageBackground source={require("../assets/background.png")} style={styles.backgroundImage} resizeMode="cover">
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
                  <TouchableOpacity style={styles.backButton} onPress={handleVolver}>
                    <Icon name="arrow-back" size={24} color="#374151" />
                  </TouchableOpacity>
                  <Text style={styles.headerTitle}>
                    Buscar Viaje <Text style={styles.headerSubtitle}>(Solo ida)</Text>
                  </Text>
                  <View style={styles.placeholder} />
                </View>

                {/* Form Container */}
                <View style={styles.formContainer}>
                  {/* Origen */}
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Origen</Text>
                    {modoSimple ? (
                      <View style={[styles.inputWithIcon, origenError ? styles.inputError : null]}>
                        <TextInput
                          style={styles.textInput}
                          placeholder="Ciudad de origen"
                          placeholderTextColor="#9CA3AF"
                          value={origen}
                          onChangeText={validateOrigenSimple}
                          autoCapitalize="words"
                        />
                        <Icon name="place" size={20} color="#9CA3AF" />
                      </View>
                    ) : (
                      <TouchableOpacity onPress={() => setShowOrigenModal(true)}>
                        <View style={[styles.inputWithIcon, origenError ? styles.inputError : null]}>
                          <Text style={[styles.inputText, !origen && styles.placeholderText]}>
                            {origen || "Seleccionar localidad de origen"}
                          </Text>
                          <Icon name="place" size={20} color="#9CA3AF" />
                        </View>
                      </TouchableOpacity>
                    )}
                    {origenError ? <Text style={styles.errorText}>{origenError}</Text> : null}
                  </View>

                  {/* Destino */}
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Destino</Text>
                    {modoSimple ? (
                      <View style={[styles.inputWithIcon, destinoError ? styles.inputError : null]}>
                        <TextInput
                          style={styles.textInput}
                          placeholder="Ciudad de destino"
                          placeholderTextColor="#9CA3AF"
                          value={destino}
                          onChangeText={validateDestinoSimple}
                          autoCapitalize="words"
                        />
                        <Icon name="place" size={20} color="#9CA3AF" />
                      </View>
                    ) : (
                      <TouchableOpacity
                        onPress={() => origenSeleccionado && setShowDestinoModal(true)}
                        disabled={!origenSeleccionado}
                      >
                        <View
                          style={[
                            styles.inputWithIcon,
                            destinoError ? styles.inputError : null,
                            !origenSeleccionado ? styles.inputDisabled : null,
                          ]}
                        >
                          <Text style={[styles.inputText, (!destino || !origenSeleccionado) && styles.placeholderText]}>
                            {origenSeleccionado
                              ? destino || "Seleccionar ciudad de destino"
                              : "Primero selecciona un origen"}
                          </Text>
                          <Icon name="place" size={20} color={origenSeleccionado ? "#9CA3AF" : "#D1D5DB"} />
                        </View>
                      </TouchableOpacity>
                    )}
                    {destinoError ? <Text style={styles.errorText}>{destinoError}</Text> : null}
                  </View>

                  {/* Fecha */}
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Fecha de viaje</Text>
                    <TouchableOpacity onPress={() => setShowDatePicker(true)}>
                      <View style={[styles.inputWithIcon, fechaError ? styles.inputError : null]}>
                        <Text style={[styles.inputText, !fecha && styles.placeholderText]}>
                          {fecha || "DD/MM/AAAA"}
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
                      <Text style={styles.infoItem}>Fecha: {fecha || "No seleccionada"}</Text>
                    </View>
                    <View style={styles.infoRow}>
                      <Icon name="people" size={16} color="#059669" />
                      <Text style={styles.infoItem}>Pasajeros: {getPasajerosLabel()}</Text>
                    </View>
                  </View>

                  {/* Botón buscar */}
                  <TouchableOpacity
                    style={[
                      styles.searchButton,
                      ((modoSimple && origen && destino && fecha) ||
                        (!modoSimple && origenSeleccionado && destinoSeleccionado && fecha)) &&
                        styles.searchButtonActive,
                    ]}
                    onPress={handleBuscar}
                    disabled={
                      !(
                        (modoSimple && origen && destino && fecha) ||
                        (!modoSimple && origenSeleccionado && destinoSeleccionado && fecha)
                      )
                    }
                    activeOpacity={0.8}
                  >
                    <Icon name="search" size={20} color="white" style={styles.searchIcon} />
                    <Text style={styles.searchButtonText}>Buscar Viajes</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </TouchableWithoutFeedback>

        {/* Modal para seleccionar origen */}
        {!modoSimple && (
          <Modal visible={showOrigenModal} transparent animationType="fade">
            <TouchableWithoutFeedback onPress={() => setShowOrigenModal(false)}>
              <View style={styles.modalOverlay}>
                <TouchableWithoutFeedback onPress={() => {}}>
                  <View style={styles.modalContentLarge}>
                    <Text style={styles.modalTitle}>Seleccionar origen</Text>

                    {/* Buscador */}
                    <View style={styles.searchContainer}>
                      <Icon name="search" size={20} color="#9CA3AF" />
                      <TextInput
                        style={styles.searchInput}
                        placeholder="Buscar ciudad..."
                        placeholderTextColor="#9CA3AF"
                        value={searchOrigen}
                        onChangeText={setSearchOrigen}
                      />
                    </View>

                    {loadingLocalidades ? (
                      <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#10B981" />
                        <Text style={styles.loadingText}>Cargando localidades...</Text>
                      </View>
                    ) : (
                      <FlatList
                        data={filteredLocalidades}
                        renderItem={renderLocalidadItem}
                        keyExtractor={(item) => item.id.toString()}
                        style={styles.localidadesList}
                        showsVerticalScrollIndicator={false}
                        ListEmptyComponent={<Text style={styles.emptyText}>No se encontraron localidades</Text>}
                      />
                    )}

                    <TouchableOpacity style={styles.closeButton} onPress={() => setShowOrigenModal(false)}>
                      <Text style={styles.closeButtonText}>Cerrar</Text>
                    </TouchableOpacity>
                  </View>
                </TouchableWithoutFeedback>
              </View>
            </TouchableWithoutFeedback>
          </Modal>
        )}

        {/* Modal para seleccionar destino */}
        {!modoSimple && (
          <Modal visible={showDestinoModal} transparent animationType="fade">
            <TouchableWithoutFeedback onPress={() => setShowDestinoModal(false)}>
              <View style={styles.modalOverlay}>
                <TouchableWithoutFeedback onPress={() => {}}>
                  <View style={styles.modalContentLarge}>
                    <Text style={styles.modalTitle}>Seleccionar destino</Text>

                    {/* Buscador */}
                    <View style={styles.searchContainer}>
                      <Icon name="search" size={20} color="#9CA3AF" />
                      <TextInput
                        style={styles.searchInput}
                        placeholder="Buscar ciudad..."
                        placeholderTextColor="#9CA3AF"
                        value={searchDestino}
                        onChangeText={setSearchDestino}
                      />
                    </View>

                    {loadingDestinos ? (
                      <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#10B981" />
                        <Text style={styles.loadingText}>Cargando destinos...</Text>
                      </View>
                    ) : (
                      <FlatList
                        data={filteredDestinos}
                        renderItem={renderDestinoItem}
                        keyExtractor={(item) => item.id.toString()}
                        style={styles.localidadesList}
                        showsVerticalScrollIndicator={false}
                        ListEmptyComponent={
                          <Text style={styles.emptyText}>No se encontraron destinos disponibles</Text>
                        }
                      />
                    )}

                    <TouchableOpacity style={styles.closeButton} onPress={() => setShowDestinoModal(false)}>
                      <Text style={styles.closeButtonText}>Cerrar</Text>
                    </TouchableOpacity>
                  </View>
                </TouchableWithoutFeedback>
              </View>
            </TouchableWithoutFeedback>
          </Modal>
        )}

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

// Resto de los estilos permanecen iguales...
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
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 14,
    minHeight: 48,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: "#374151",
  },
  inputText: {
    flex: 1,
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
  inputDisabled: {
    backgroundColor: "#F3F4F6",
    borderColor: "#E5E7EB",
  },
  errorText: {
    fontSize: 12,
    color: "#EF4444",
    marginTop: 4,
    marginLeft: 4,
  },
  selectButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 14,
    minHeight: 48,
  },
  selectText: {
    fontSize: 16,
    color: "#374151",
  },
  infoContainer: {
    backgroundColor: "#ECFDF5",
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: "#10B981",
    marginTop: 8,
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#9CA3AF",
    borderRadius: 8,
    paddingVertical: 16,
    paddingHorizontal: 24,
    marginTop: 16,
  },
  searchButtonActive: {
    backgroundColor: "#10B981",
  },
  searchIcon: {
    marginRight: 8,
  },
  searchButtonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "white",
  },
  // Modal styles
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
    maxHeight: "60%",
  },
  modalContentLarge: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    width: "90%",
    maxHeight: "80%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 16,
    textAlign: "center",
  },
  modalOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  modalOptionText: {
    fontSize: 16,
    color: "#374151",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#374151",
    marginLeft: 8,
  },
  localidadesList: {
    maxHeight: 300,
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    color: "#6B7280",
    marginTop: 12,
  },
  emptyText: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    paddingVertical: 20,
  },
  closeButton: {
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: "center",
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#374151",
  },
})