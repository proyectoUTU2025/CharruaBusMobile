import React, { useState, useEffect } from "react"
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
import { getLimitePasajes } from '../services/configService'
import { getOrigenesPosibles, getDestinosPosibles } from '../services/locationService';
import { Localidad } from '../types/locationType';
import { RoundTripState } from '../types/roundTripType';
import { RoundTripScreenProps } from '../types/screenPropsType';

export function RoundTripScreen({ onVolver, onNavigateToViewTrips, initialData }: RoundTripScreenProps) {
  const { token } = useAuth()
  
  const [origenError, setOrigenError] = useState("")
  const [destinoError, setDestinoError] = useState("")
  const [fechaIdaError, setFechaIdaError] = useState("")
  const [fechaVueltaError, setFechaVueltaError] = useState("")
  const [showDatePickerIda, setShowDatePickerIda] = useState(false)
  const [showDatePickerVuelta, setShowDatePickerVuelta] = useState(false)
  const [showPasajerosModal, setShowPasajerosModal] = useState(false)

  const [localidades, setLocalidades] = useState<Localidad[]>([])
  const [filteredLocalidades, setFilteredLocalidades] = useState<Localidad[]>([])
  const [showOrigenModal, setShowOrigenModal] = useState(false)
  const [loadingLocalidades, setLoadingLocalidades] = useState(false)
  const [searchOrigen, setSearchOrigen] = useState("")

  const [destinos, setDestinos] = useState<Localidad[]>([])
  const [filteredDestinos, setFilteredDestinos] = useState<Localidad[]>([])
  const [showDestinoModal, setShowDestinoModal] = useState(false)
  const [loadingDestinos, setLoadingDestinos] = useState(false)
  const [searchDestino, setSearchDestino] = useState("")

  const [limitePasajes, setLimitePasajes] = useState<number>(4)
  const [loadingConfig, setLoadingConfig] = useState(true)
  const [opcionesPasajeros, setOpcionesPasajeros] = useState<Array<{label: string, value: string}>>([])

  const [origen, setOrigen] = useState(initialData?.origenSeleccionado?.nombreConDepartamento || "")
  const [destino, setDestino] = useState(initialData?.destinoSeleccionado?.nombreConDepartamento || "")
  const [fechaIda, setFechaIda] = useState(initialData?.fechaIda || "")
  const [fechaVuelta, setFechaVuelta] = useState(initialData?.fechaVuelta || "")
  const [pasajeros, setPasajeros] = useState(initialData?.pasajeros || "1")

  const [dateIda, setDateIda] = useState<Date | undefined>(() => {
    if (initialData?.dateIda) {
      return new Date(initialData.dateIda);
    }
    return undefined;
  })
  const [dateVuelta, setDateVuelta] = useState<Date | undefined>(() => {
    if (initialData?.dateVuelta) {
      return new Date(initialData.dateVuelta);
    }
    return undefined;
  })

  const [origenSeleccionado, setOrigenSeleccionado] = useState<Localidad | null>(
    initialData?.origenSeleccionado || null
  )
  const [destinoSeleccionado, setDestinoSeleccionado] = useState<Localidad | null>(
    initialData?.destinoSeleccionado || null
  )

  useEffect(() => {
    const cargarLimitePasajes = async () => {
      if (!token) return;

      try {
        setLoadingConfig(true);
        const limite = await getLimitePasajes(token);
        setLimitePasajes(limite);
        
        const opciones = [];
        for (let i = 1; i <= limite; i++) {
          opciones.push({
            label: `${i} pasajero${i !== 1 ? 's' : ''}`,
            value: i.toString(),
          });
        }
        setOpcionesPasajeros(opciones);
        
      } catch (error) {
        console.error('Error cargando límite de pasajes:', error);
        const opcionesDefault = [
          { label: "1 pasajero", value: "1" },
          { label: "2 pasajeros", value: "2" },
          { label: "3 pasajeros", value: "3" },
          { label: "4 pasajeros", value: "4" },
          { label: "5 pasajeros", value: "5" },
        ];
        setOpcionesPasajeros(opcionesDefault);
      } finally {
        setLoadingConfig(false);
      }
    };

    cargarLimitePasajes();
  }, [token]);

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

  const onChangeDateIda = (event: any, selectedDate?: Date) => {
    setShowDatePickerIda(false)
    if (selectedDate) {
      setDateIda(selectedDate)
      setFechaIda(formatDate(selectedDate))
      setFechaIdaError("")
      
      if (dateVuelta && selectedDate >= dateVuelta) {
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

    if (!dateIda) {
      setFechaIdaError("La fecha de ida es obligatoria")
      hasErrors = true
    }

    if (!dateVuelta) {
      setFechaVueltaError("La fecha de vuelta es obligatoria")
      hasErrors = true
    }

    if (dateIda && dateVuelta && dateVuelta <= dateIda) {
      setFechaVueltaError("La fecha de vuelta debe ser posterior a la fecha de ida")
      hasErrors = true
    }

    if (hasErrors) return

    if (origenSeleccionado && destinoSeleccionado && dateIda && dateVuelta) {
      const roundTripState: RoundTripState = {
        tipoViaje: 'ida-vuelta',
        currentStep: 'select-trip-ida',
        viajeIda: {
          origenSeleccionado,
          destinoSeleccionado,
          fecha: fechaIda,
          date: dateIda.toISOString(),
          pasajeros,
        },
        viajeVuelta: {
          origenSeleccionado: destinoSeleccionado, 
          destinoSeleccionado: origenSeleccionado,
          fecha: fechaVuelta,
          date: dateVuelta.toISOString(),
          pasajeros,
        }
      };

      if (onNavigateToViewTrips) {
        onNavigateToViewTrips({
          origenSeleccionado,
          destinoSeleccionado,
          fecha: fechaIda,
          date: dateIda.toISOString(),
          pasajeros,
          tipoViaje: 'ida-vuelta',
          roundTripState,
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
              <TouchableOpacity style={styles.backButton} onPress={onVolver}>
                <Icon name="arrow-back" size={24} color="#374151" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>
                Buscar Viaje{" "}
                <Text style={styles.headerSubtitle}>(Ida y vuelta)</Text>
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

              {/* Fecha de ida */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Fecha de ida</Text>
                <TouchableOpacity onPress={() => setShowDatePickerIda(true)}>
                  <View style={[styles.inputWithIcon, fechaIdaError ? styles.inputError : null]}>
                    <Text style={[styles.inputText, !fechaIda && styles.placeholderText]}>
                      {fechaIda || 'DD/MM/AAAA'}
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
                      {fechaVuelta || 'DD/MM/AAAA'}
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
                <Text style={styles.inputLabel}>
                  Número de pasajeros
                  {limitePasajes > 4 && (
                    <Text style={styles.limiteInfo}> (máximo {limitePasajes})</Text>
                  )}
                </Text>
                <TouchableOpacity 
                  style={styles.selectButton} 
                  onPress={() => setShowPasajerosModal(true)}
                  disabled={loadingConfig}
                >
                  {loadingConfig ? (
                    <View style={styles.loadingContainer}>
                      <ActivityIndicator size="small" color="#6B7280" />
                      <Text style={styles.loadingText}>Cargando...</Text>
                    </View>
                  ) : (
                    <>
                      <Text style={styles.selectText}>
                        {getPasajerosLabel()}
                      </Text>
                      <Icon name="keyboard-arrow-down" size={24} color="#6B7280" />
                    </>
                  )}
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
                  <Text style={styles.infoItem}>
                    Fecha de ida: {fechaIda || "No seleccionada"}
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <Icon name="event" size={16} color="#059669" />
                  <Text style={styles.infoItem}>
                    Fecha de vuelta: {fechaVuelta || "No seleccionada"}
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
                  (origenSeleccionado && destinoSeleccionado && fechaIda && fechaVuelta) && styles.searchButtonActive
                ]}
                onPress={handleBuscar}
                disabled={!(origenSeleccionado && destinoSeleccionado && fechaIda && fechaVuelta)}
                activeOpacity={0.8}
              >
                <Icon name="search" size={20} color="white" style={styles.searchIcon} />
                <Text style={styles.searchButtonText}>Buscar Pasajes</Text>
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
                      showsVerticalScrollIndicator={true}
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
                      showsVerticalScrollIndicator={true}
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
                {loadingConfig ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#10B981" />
                    <Text style={styles.loadingText}>Cargando opciones...</Text>
                  </View>
                ) : (
                  <ScrollView 
                    style={styles.pasajerosList}
                    showsVerticalScrollIndicator={true}
                  >
                    {opcionesPasajeros.map((opcion) => (
                      <TouchableOpacity 
                        key={opcion.value} 
                        style={styles.modalOption} 
                        onPress={() => selectPasajeros(opcion.value, opcion.label)}
                      >
                        <Text style={styles.modalOptionText}>{opcion.label}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                )}
                
                <TouchableOpacity 
                  style={styles.closeButton}
                  onPress={() => setShowPasajerosModal(false)}
                >
                  <Text style={styles.closeButtonText}>Cerrar</Text>
                </TouchableOpacity>
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
  limiteInfo: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "normal",
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
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 8,
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
    maxHeight: 250,
    minHeight: 100, 
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
    marginTop: 16,
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#374151",
  },
  pasajerosList: {
    maxHeight: 250,
    minHeight: 100,
  },
});
