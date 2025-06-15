"use client"

import { useState, useEffect } from "react"
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Modal,
  FlatList,
  TextInput,
  ActivityIndicator,
} from "react-native"
import Icon from "react-native-vector-icons/MaterialIcons"
import DateTimePicker from "@react-native-community/datetimepicker"
import { ESTADOS_PASAJE } from "../services/constants"
import { useAuth } from "../context/AuthContext"
import { getOrigenesPosibles, getDestinosPosibles, type Localidad } from "../services/locationService"

interface TicketHistoryFiltersScreenProps {
  onGoBack: () => void
  onApplyFilters: (filters: any) => void
}

export default function TicketHistoryFiltersScreen({ onGoBack, onApplyFilters }: TicketHistoryFiltersScreenProps) {
  const { token } = useAuth()

  // Estados para filtros
  const [selectedStates, setSelectedStates] = useState<string[]>([])
  const [fechaSalida, setFechaSalida] = useState<Date | undefined>(undefined)
  const [showDatePickerSalida, setShowDatePickerSalida] = useState(false)
  const [showStatesModal, setShowStatesModal] = useState(false)
  const [showOrigenModal, setShowOrigenModal] = useState(false)
  const [showDestinoModal, setShowDestinoModal] = useState(false)

  // Estados para origen
  const [origenes, setOrigenes] = useState<Localidad[]>([])
  const [filteredOrigenes, setFilteredOrigenes] = useState<Localidad[]>([])
  const [loadingOrigenes, setLoadingOrigenes] = useState(false)
  const [origenSeleccionado, setOrigenSeleccionado] = useState<Localidad | null>(null)
  const [searchOrigen, setSearchOrigen] = useState("")

  // Estados para destino
  const [destinos, setDestinos] = useState<Localidad[]>([])
  const [filteredDestinos, setFilteredDestinos] = useState<Localidad[]>([])
  const [loadingDestinos, setLoadingDestinos] = useState(false)
  const [destinoSeleccionado, setDestinoSeleccionado] = useState<Localidad | null>(null)
  const [searchDestino, setSearchDestino] = useState("")

  // ✅ ACTUALIZADO: Cargar orígenes usando el endpoint correcto
  useEffect(() => {
    const cargarOrigenes = async () => {
      if (!token) return

      try {
        setLoadingOrigenes(true)
        console.log("Cargando orígenes desde /localidades/origenes-posibles")
        const origenesData = await getOrigenesPosibles(token)
        console.log("Orígenes cargados:", origenesData.length)
        setOrigenes(origenesData)
        setFilteredOrigenes(origenesData)
      } catch (error) {
        console.error("Error cargando orígenes:", error)
      } finally {
        setLoadingOrigenes(false)
      }
    }

    cargarOrigenes()
  }, [token])

  // ✅ ACTUALIZADO: Cargar destinos usando el endpoint correcto
  useEffect(() => {
    const cargarDestinos = async () => {
      if (!token || !origenSeleccionado) return

      try {
        setLoadingDestinos(true)
        console.log("Cargando destinos desde /localidades/destinos-posibles/" + origenSeleccionado.id)
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
  }, [token, origenSeleccionado])

  // Filtrar orígenes por búsqueda
  useEffect(() => {
    if (searchOrigen.trim() === "") {
      setFilteredOrigenes(origenes)
    } else {
      const filtered = origenes.filter((origen) =>
        origen.nombreConDepartamento.toLowerCase().includes(searchOrigen.toLowerCase()),
      )
      setFilteredOrigenes(filtered)
    }
  }, [searchOrigen, origenes])

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

  const formatDate = (date: Date): string => {
    const day = String(date.getDate()).padStart(2, "0")
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const year = date.getFullYear()
    return `${day}/${month}/${year}`
  }

  const formatDateForApi = (date: Date): string => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")
    return `${year}-${month}-${day}`
  }

  const handleStateToggle = (stateValue: string) => {
    if (stateValue === "TODOS") {
      setSelectedStates([])
      return
    }

    setSelectedStates((prev) => {
      if (prev.includes(stateValue)) {
        return prev.filter((s) => s !== stateValue)
      } else {
        return [...prev, stateValue]
      }
    })
  }

  const getSelectedStatesText = () => {
    if (selectedStates.length === 0) {
      return "Todos los estados"
    }
    if (selectedStates.length === 1) {
      const estado = ESTADOS_PASAJE.find((e) => e.value === selectedStates[0])
      return estado?.label || selectedStates[0]
    }
    return `${selectedStates.length} estados seleccionados`
  }

  const selectOrigen = (localidad: Localidad) => {
    console.log("Origen seleccionado:", localidad.nombreConDepartamento)
    setOrigenSeleccionado(localidad)
    setShowOrigenModal(false)
    setSearchOrigen("")

    // Limpiar destino cuando se cambia el origen
    setDestinoSeleccionado(null)
    setDestinos([])
    setFilteredDestinos([])
  }

  const selectDestino = (localidad: Localidad) => {
    console.log("Destino seleccionado:", localidad.nombreConDepartamento)
    setDestinoSeleccionado(localidad)
    setShowDestinoModal(false)
    setSearchDestino("")
  }

  const onChangeDateSalida = (event: any, selectedDate?: Date) => {
    setShowDatePickerSalida(false)
    if (selectedDate) {
      setFechaSalida(selectedDate)
    }
  }

  const handleApplyFilters = () => {
    const filters = {
      estados: selectedStates,
      fechaSalida: fechaSalida ? formatDateForApi(fechaSalida) : undefined,
      origenId: origenSeleccionado?.id,
      destinoId: destinoSeleccionado?.id,
    }

    console.log("Aplicando filtros de pasajes:", filters)
    onApplyFilters(filters)
  }

  const handleClearFilters = () => {
    setSelectedStates([])
    setFechaSalida(undefined)
    setOrigenSeleccionado(null)
    setDestinoSeleccionado(null)
    setDestinos([])
    setFilteredDestinos([])
  }

  const handleConfirmStatesSelection = () => {
    setShowStatesModal(false)
  }

  const handleConfirmOrigenSelection = () => {
    setShowOrigenModal(false)
    setSearchOrigen("")
  }

  const handleConfirmDestinoSelection = () => {
    setShowDestinoModal(false)
    setSearchDestino("")
  }

  const renderStateItem = ({ item }: { item: { label: string; value: string } }) => {
    const isSelected = item.value === "TODOS" ? selectedStates.length === 0 : selectedStates.includes(item.value)

    return (
      <TouchableOpacity
        style={[styles.stateItem, isSelected && styles.stateItemSelected]}
        onPress={() => handleStateToggle(item.value)}
        activeOpacity={0.7}
      >
        <Text style={[styles.stateItemText, isSelected && styles.stateItemTextSelected]}>{item.label}</Text>
        {isSelected && <Icon name="check" size={20} color="#3B82F6" />}
      </TouchableOpacity>
    )
  }

  const renderOrigenItem = ({ item }: { item: Localidad }) => (
    <TouchableOpacity style={styles.locationItem} onPress={() => selectOrigen(item)} activeOpacity={0.7}>
      <Text style={styles.locationItemText}>{item.nombreConDepartamento}</Text>
    </TouchableOpacity>
  )

  const renderDestinoItem = ({ item }: { item: Localidad }) => (
    <TouchableOpacity style={styles.locationItem} onPress={() => selectDestino(item)} activeOpacity={0.7}>
      <Text style={styles.locationItemText}>{item.nombreConDepartamento}</Text>
    </TouchableOpacity>
  )

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#3B82F6" barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onGoBack} activeOpacity={0.7}>
          <Icon name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Filtros de Pasajes</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Estados */}
        <View style={styles.filterSection}>
          <Text style={styles.filterLabel}>Estado del Pasaje</Text>
          <TouchableOpacity style={styles.filterButton} onPress={() => setShowStatesModal(true)} activeOpacity={0.7}>
            <Text style={styles.filterButtonText}>{getSelectedStatesText()}</Text>
            <Icon name="keyboard-arrow-down" size={24} color="#6B7280" />
          </TouchableOpacity>
        </View>

        {/* Fecha de Salida */}
        <View style={styles.filterSection}>
          <Text style={styles.filterLabel}>Fecha de Salida</Text>
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setShowDatePickerSalida(true)}
            activeOpacity={0.7}
          >
            <Text style={styles.filterButtonText}>
              {fechaSalida ? formatDate(fechaSalida) : "Seleccionar fecha de salida"}
            </Text>
            <Icon name="event" size={20} color="#6B7280" />
          </TouchableOpacity>
        </View>

        {/* Origen */}
        <View style={styles.filterSection}>
          <Text style={styles.filterLabel}>Origen</Text>
          <TouchableOpacity style={styles.filterButton} onPress={() => setShowOrigenModal(true)} activeOpacity={0.7}>
            <Text style={styles.filterButtonText}>
              {origenSeleccionado ? origenSeleccionado.nombreConDepartamento : "Seleccionar origen"}
            </Text>
            <Icon name="place" size={20} color="#6B7280" />
          </TouchableOpacity>
        </View>

        {/* Destino */}
        <View style={styles.filterSection}>
          <Text style={styles.filterLabel}>Destino</Text>
          <TouchableOpacity
            style={[styles.filterButton, !origenSeleccionado && styles.filterButtonDisabled]}
            onPress={() => origenSeleccionado && setShowDestinoModal(true)}
            activeOpacity={origenSeleccionado ? 0.7 : 1}
          >
            <Text style={[styles.filterButtonText, !origenSeleccionado && styles.filterButtonTextDisabled]}>
              {origenSeleccionado
                ? destinoSeleccionado
                  ? destinoSeleccionado.nombreConDepartamento
                  : "Seleccionar destino"
                : "Primero selecciona un origen"}
            </Text>
            <Icon name="place" size={20} color={origenSeleccionado ? "#6B7280" : "#D1D5DB"} />
          </TouchableOpacity>
        </View>

        {/* Información */}
        <View style={styles.infoContainer}>
          <Icon name="info" size={20} color="#3B82F6" />
          <Text style={styles.infoText}>
            Usa estos filtros para encontrar pasajes específicos en tu historial. Puedes combinar múltiples filtros para
            una búsqueda más precisa.
          </Text>
        </View>
      </ScrollView>

      {/* Botones de acción */}
      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.clearButton} onPress={handleClearFilters} activeOpacity={0.7}>
          <Text style={styles.clearButtonText}>Limpiar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.applyButton} onPress={handleApplyFilters} activeOpacity={0.7}>
          <Text style={styles.applyButtonText}>Aplicar Filtros</Text>
        </TouchableOpacity>
      </View>

      {/* Modal de Estados */}
      <Modal
        visible={showStatesModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowStatesModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Seleccionar Estados</Text>
              <TouchableOpacity onPress={() => setShowStatesModal(false)}>
                <Icon name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <FlatList
              data={ESTADOS_PASAJE}
              renderItem={renderStateItem}
              keyExtractor={(item) => item.value}
              style={styles.statesList}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.confirmButton} onPress={handleConfirmStatesSelection} activeOpacity={0.7}>
                <Icon name="check" size={20} color="white" />
                <Text style={styles.confirmButtonText}>Listo</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal de Origen */}
      <Modal
        visible={showOrigenModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowOrigenModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContentLarge}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Seleccionar Origen</Text>
              <TouchableOpacity onPress={() => setShowOrigenModal(false)}>
                <Icon name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

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

            {loadingOrigenes ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#3B82F6" />
                <Text style={styles.loadingText}>Cargando orígenes...</Text>
              </View>
            ) : (
              <FlatList
                data={filteredOrigenes}
                renderItem={renderOrigenItem}
                keyExtractor={(item) => item.id.toString()}
                style={styles.locationsList}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={<Text style={styles.emptyText}>No se encontraron orígenes</Text>}
              />
            )}

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.confirmButton} onPress={handleConfirmOrigenSelection} activeOpacity={0.7}>
                <Icon name="check" size={20} color="white" />
                <Text style={styles.confirmButtonText}>Listo</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal de Destino */}
      <Modal
        visible={showDestinoModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDestinoModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContentLarge}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Seleccionar Destino</Text>
              <TouchableOpacity onPress={() => setShowDestinoModal(false)}>
                <Icon name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

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
                <ActivityIndicator size="large" color="#3B82F6" />
                <Text style={styles.loadingText}>Cargando destinos...</Text>
              </View>
            ) : (
              <FlatList
                data={filteredDestinos}
                renderItem={renderDestinoItem}
                keyExtractor={(item) => item.id.toString()}
                style={styles.locationsList}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={<Text style={styles.emptyText}>No se encontraron destinos disponibles</Text>}
              />
            )}

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={handleConfirmDestinoSelection}
                activeOpacity={0.7}
              >
                <Icon name="check" size={20} color="white" />
                <Text style={styles.confirmButtonText}>Listo</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Date Picker */}
      {showDatePickerSalida && (
        <DateTimePicker
          value={fechaSalida || new Date()}
          mode="date"
          display="default"
          onChange={onChangeDateSalida}
          maximumDate={new Date()}
        />
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#3B82F6",
    paddingHorizontal: 16,
    paddingVertical: 16,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "white",
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  filterSection: {
    marginBottom: 24,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 8,
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 48,
  },
  filterButtonDisabled: {
    backgroundColor: "#F3F4F6",
    borderColor: "#E5E7EB",
  },
  filterButtonText: {
    fontSize: 16,
    color: "#374151",
    flex: 1,
  },
  filterButtonTextDisabled: {
    color: "#9CA3AF",
  },
  infoContainer: {
    flexDirection: "row",
    backgroundColor: "#EBF8FF",
    borderRadius: 8,
    padding: 16,
    marginTop: 16,
  },
  infoText: {
    fontSize: 14,
    color: "#1E40AF",
    marginLeft: 12,
    flex: 1,
    lineHeight: 20,
  },
  actionButtons: {
    flexDirection: "row",
    padding: 16,
    gap: 12,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  clearButton: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  clearButtonText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#374151",
  },
  applyButton: {
    flex: 2,
    backgroundColor: "#3B82F6",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  applyButtonText: {
    fontSize: 16,
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
    width: "90%",
    maxHeight: "70%",
  },
  modalContentLarge: {
    backgroundColor: "white",
    borderRadius: 12,
    width: "90%",
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#374151",
  },
  statesList: {
    maxHeight: 300,
  },
  stateItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  stateItemSelected: {
    backgroundColor: "#EBF8FF",
  },
  stateItemText: {
    fontSize: 16,
    color: "#374151",
  },
  stateItemTextSelected: {
    color: "#3B82F6",
    fontWeight: "500",
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
    margin: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#374151",
    marginLeft: 8,
  },
  locationsList: {
    maxHeight: 300,
  },
  locationItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  locationItemText: {
    fontSize: 16,
    color: "#374151",
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
  modalActions: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  confirmButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#10B981",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
    marginLeft: 8,
  },
})
