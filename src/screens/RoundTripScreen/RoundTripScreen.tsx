import React, { useState, useEffect } from "react"
import { 
  View, 
  Text, 
  TextInput,
  TouchableOpacity,
  StatusBar, 
  SafeAreaView, 
  ScrollView, 
  ImageBackground,
  Modal,
  ActivityIndicator
} from "react-native"
import Icon from "react-native-vector-icons/MaterialIcons"
import DateTimePicker from '@react-native-community/datetimepicker'
import { useAuth } from '../../context/AuthContext'
import { getLimitePasajes } from '../../services/configService'
import { getOrigenesPosibles, getDestinosPosibles } from '../../services/locationService';
import { Localidad } from '../../types/locationType';
import { RoundTripState } from '../../types/roundTripType';
import { RoundTripScreenProps } from '../../types/screenPropsType';
import { styles } from './RoundTripScreen.styles';

export function RoundTripScreen({ onVolver, onNavigateToViewTrips, initialData }: RoundTripScreenProps) {
  const { token, handleUnauthorized } = useAuth();
  
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
        if (error instanceof Error && error.message === 'Sesión expirada') {
          handleUnauthorized();
          return;
        }
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
      if (!token) return;

      try {
        setLoadingLocalidades(true);
        const localidadesData = await getOrigenesPosibles(token);
        setLocalidades(localidadesData);
        setFilteredLocalidades(localidadesData);
      } catch (error) {
        if (error instanceof Error && error.message === 'Sesión expirada') {
          handleUnauthorized();
          return;
        }
        console.error('Error cargando localidades:', error);
      } finally {
        setLoadingLocalidades(false);
      }
    };

    cargarLocalidades();
  }, [token]);

  useEffect(() => {
    const cargarDestinos = async () => {
      if (!token || !origenSeleccionado) return;

      try {
        setLoadingDestinos(true);
        const destinosData = await getDestinosPosibles(token, origenSeleccionado.id);
        setDestinos(destinosData);
        setFilteredDestinos(destinosData);
      } catch (error) {
        if (error instanceof Error && error.message === 'Sesión expirada') {
          handleUnauthorized();
          return;
        }
        console.error('Error cargando destinos:', error);
      } finally {
        setLoadingDestinos(false);
      }
    };

    cargarDestinos();
  }, [token, origenSeleccionado]);

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
      
      if (dateVuelta && selectedDate > dateVuelta) {
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

    if (dateIda && dateVuelta && dateVuelta < dateIda) {
      setFechaVueltaError("La fecha de vuelta no puede ser anterior a la fecha de ida")
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
        source={require('../../assets/background.png')} 
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

            <View style={styles.formContainer}>
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
                  value={dateVuelta || dateIda || new Date()}
                  mode="date"
                  display="default"
                  onChange={onChangeDateVuelta}
                  minimumDate={dateIda || new Date()}
                />
              )}

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

              <View style={styles.infoContainer}>
                <Text style={styles.infoTitle}>Resumen del viaje:</Text>
                <View style={styles.infoRow}>
                  <Icon name="info" size={16} color="#10B981" />
                  <Text style={styles.infoItem}>Tipo: Ida y vuelta</Text>
                </View>
                <View style={styles.infoRow}>
                  <Icon name="route" size={16} color="#10B981" />
                  <Text style={styles.infoItem}>
                    Ruta: {origen || "___"} → {destino || "___"}
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <Icon name="event" size={16} color="#10B981" />
                  <Text style={styles.infoItem}>
                    Fecha de ida: {fechaIda || "No seleccionada"}
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <Icon name="event" size={16} color="#10B981" />
                  <Text style={styles.infoItem}>
                    Fecha de vuelta: {fechaVuelta || "No seleccionada"}
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <Icon name="people" size={16} color="#10B981" />
                  <Text style={styles.infoItem}>
                    Pasajeros: {getPasajerosLabel()}
                  </Text>
                </View>
              </View>

              <TouchableOpacity 
                style={[
                  styles.searchButton,
                  (origenSeleccionado && destinoSeleccionado && fechaIda && fechaVuelta) && styles.searchButtonActive
                ]}
                onPress={handleBuscar}
                disabled={!(origenSeleccionado && destinoSeleccionado && fechaIda && fechaVuelta)}
                activeOpacity={0.8}
              >
                <Icon name="search" size={20} color="white" />
                <Text style={styles.searchButtonText}>Buscar Pasajes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>

        <Modal visible={showOrigenModal} transparent animationType="fade" presentationStyle="overFullScreen">
          <View style={styles.modalOverlay}>
            <TouchableOpacity 
              style={styles.modalBackdrop}
              activeOpacity={1}
              onPress={() => setShowOrigenModal(false)}
            />
            <View style={styles.selectorModal}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Seleccionar origen</Text>
                <TouchableOpacity 
                  onPress={() => setShowOrigenModal(false)}
                  style={styles.closeButton}
                >
                  <Icon name="close" size={24} color="#6B7280" />
                </TouchableOpacity>
              </View>
              
              <View style={styles.searchContainer}>
                <TextInput
                  style={styles.searchInput}
                  placeholder="Buscar localidad"
                  value={searchOrigen}
                  onChangeText={setSearchOrigen}
                  placeholderTextColor="#9CA3AF"
                />
                <Icon name="search" size={20} color="#9CA3AF" style={styles.searchIcon} />
              </View>

              <View style={styles.scrollContainer}>
                {loadingLocalidades ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color="#3B82F6" />
                    <Text style={styles.loadingText}>Cargando localidades...</Text>
                  </View>
                ) : (
                  <ScrollView 
                    style={styles.localidadesList} 
                    contentContainerStyle={styles.localidadesListContent}
                    showsVerticalScrollIndicator={true}
                    bounces={true}
                    keyboardShouldPersistTaps="handled"
                  >
                    {filteredLocalidades.length === 0 ? (
                      <Text style={styles.noResultsText}>
                        {searchOrigen ? 'No se encontraron localidades' : 'No hay localidades disponibles'}
                      </Text>
                    ) : (
                      filteredLocalidades.map((localidad) => (
                        <TouchableOpacity
                          key={localidad.id}
                          style={styles.localidadItem}
                          onPress={() => selectOrigen(localidad)}
                          activeOpacity={0.8}
                        >
                          <Text style={styles.localidadText} numberOfLines={2}>
                            {localidad.nombreConDepartamento}
                          </Text>
                          <Icon name="chevron-right" size={20} color="#9CA3AF" />
                        </TouchableOpacity>
                      ))
                    )}
                  </ScrollView>
                )}
              </View>

              <TouchableOpacity 
                style={styles.closeModalButton}
                onPress={() => setShowOrigenModal(false)}
              >
                <Text style={styles.closeModalButtonText}>Cerrar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        <Modal visible={showDestinoModal} transparent animationType="fade" presentationStyle="overFullScreen">
          <View style={styles.modalOverlay}>
            <TouchableOpacity 
              style={styles.modalBackdrop}
              activeOpacity={1}
              onPress={() => setShowDestinoModal(false)}
            />
            <View style={styles.selectorModal}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Seleccionar destino</Text>
                <TouchableOpacity 
                  onPress={() => setShowDestinoModal(false)}
                  style={styles.closeButton}
                >
                  <Icon name="close" size={24} color="#6B7280" />
                </TouchableOpacity>
              </View>
                            
              <View style={styles.searchContainer}>
                <TextInput
                  style={styles.searchInput}
                  placeholder="Buscar localidad"
                  value={searchOrigen}
                  onChangeText={setSearchOrigen}
                  placeholderTextColor="#9CA3AF"
                />
                <Icon name="search" size={20} color="#9CA3AF" style={styles.searchIcon} />
              </View>

              <View style={styles.scrollContainer}>
                {loadingDestinos ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color="#3B82F6" />
                    <Text style={styles.loadingText}>Cargando destinos...</Text>
                  </View>
                ) : (
                  <ScrollView 
                    style={styles.localidadesList} 
                    contentContainerStyle={styles.localidadesListContent}
                    showsVerticalScrollIndicator={true}
                    bounces={true}
                    keyboardShouldPersistTaps="handled"
                  >
                    {filteredDestinos.length === 0 ? (
                      <Text style={styles.noResultsText}>
                        {searchDestino ? 'No se encontraron destinos' : 'No hay destinos disponibles'}
                      </Text>
                    ) : (
                      filteredDestinos.map((destino) => (
                        <TouchableOpacity
                          key={destino.id}
                          style={styles.localidadItem}
                          onPress={() => selectDestino(destino)}
                          activeOpacity={0.8}
                        >
                          <Text style={styles.localidadText} numberOfLines={2}>
                            {destino.nombreConDepartamento}
                          </Text>
                          <Icon name="chevron-right" size={20} color="#9CA3AF" />
                        </TouchableOpacity>
                      ))
                    )}
                  </ScrollView>
                )}
              </View>

              <TouchableOpacity 
                style={styles.closeModalButton}
                onPress={() => setShowDestinoModal(false)}
              >
                <Text style={styles.closeModalButtonText}>Cerrar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        <Modal visible={showPasajerosModal} transparent animationType="fade" presentationStyle="overFullScreen">
          <View style={styles.modalOverlay}>
            <TouchableOpacity 
              style={styles.modalBackdrop}
              activeOpacity={1}
              onPress={() => setShowPasajerosModal(false)}
            />
            <View style={styles.pasajerosModal}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Seleccionar pasajeros</Text>
                <TouchableOpacity 
                  onPress={() => setShowPasajerosModal(false)}
                  style={styles.closeButton}
                >
                  <Icon name="close" size={24} color="#6B7280" />
                </TouchableOpacity>
              </View>

              <View style={styles.scrollContainer}>
                {loadingConfig ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color="#3B82F6" />
                    <Text style={styles.loadingText}>Cargando opciones...</Text>
                  </View>
                ) : (
                  <ScrollView 
                    style={styles.pasajerosList} 
                    contentContainerStyle={styles.localidadesListContent}
                    showsVerticalScrollIndicator={true}
                    bounces={true}
                  >
                    {opcionesPasajeros.map((opcion) => (
                      <TouchableOpacity
                        key={opcion.value}
                        style={styles.localidadItem}
                        onPress={() => selectPasajeros(opcion.value, opcion.label)}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.localidadText}>
                          {opcion.label}
                        </Text>
                        <Icon name="chevron-right" size={20} color="#9CA3AF" />
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                )}
              </View>

              <TouchableOpacity 
                style={styles.closeModalButton}
                onPress={() => setShowPasajerosModal(false)}
              >
                <Text style={styles.closeModalButtonText}>Cerrar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </ImageBackground>
    </SafeAreaView>
  )
}