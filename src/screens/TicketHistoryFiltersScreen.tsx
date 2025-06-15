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
} from "react-native"
import Icon from "react-native-vector-icons/MaterialIcons"
import DateTimePicker from "@react-native-community/datetimepicker"
import { ESTADOS_PASAJE } from "../services/constants"

interface TicketHistoryFiltersScreenProps {
  onGoBack: () => void
  onApplyFilters: (filters: any) => void
}

export default function TicketHistoryFiltersScreen({ onGoBack, onApplyFilters }: TicketHistoryFiltersScreenProps) {
  // Estados para filtros
  const [selectedStates, setSelectedStates] = useState<string[]>([])
  const [fechaDesde, setFechaDesde] = useState<Date | undefined>(undefined)
  const [fechaHasta, setFechaHasta] = useState<Date | undefined>(undefined)
  const [showDatePickerDesde, setShowDatePickerDesde] = useState(false)
  const [showDatePickerHasta, setShowDatePickerHasta] = useState(false)
  const [showStatesModal, setShowStatesModal] = useState(false)

  // Configurar fechas por defecto (últimos 6 meses)
  useEffect(() => {
    const hoy = new Date()
    const seiseMesesAtras = new Date()
    seiseMesesAtras.setMonth(hoy.getMonth() - 6)
    
    setFechaDesde(seiseMesesAtras)
    setFechaHasta(hoy)
  }, [])

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

  const onChangeDateDesde = (event: any, selectedDate?: Date) => {
    setShowDatePickerDesde(false)
    if (selectedDate) {
      setFechaDesde(selectedDate)
      // Si la fecha desde es posterior a la fecha hasta, ajustar fecha hasta
      if (fechaHasta && selectedDate > fechaHasta) {
        setFechaHasta(selectedDate)
      }
    }
  }

  const onChangeDateHasta = (event: any, selectedDate?: Date) => {
    setShowDatePickerHasta(false)
    if (selectedDate) {
      setFechaHasta(selectedDate)
    }
  }

  const handleApplyFilters = () => {
    const filters = {
      estados: selectedStates,
      fechaDesde: fechaDesde ? formatDateForApi(fechaDesde) : undefined,
      fechaHasta: fechaHasta ? formatDateForApi(fechaHasta) : undefined,
    }

    console.log("Aplicando filtros de pasajes:", filters)
    onApplyFilters(filters)
  }

  const handleClearFilters = () => {
    setSelectedStates([])
    const hoy = new Date()
    const seiseMesesAtras = new Date()
    seiseMesesAtras.setMonth(hoy.getMonth() - 6)
    setFechaDesde(seiseMesesAtras)
    setFechaHasta(hoy)
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

        {/* Fecha Desde */}
        <View style={styles.filterSection}>
          <Text style={styles.filterLabel}>Fecha Desde</Text>
          <TouchableOpacity style={styles.filterButton} onPress={() => setShowDatePickerDesde(true)} activeOpacity={0.7}>
            <Text style={styles.filterButtonText}>{fechaDesde ? formatDate(fechaDesde) : "Seleccionar fecha"}</Text>
            <Icon name="event" size={20} color="#6B7280" />
          </TouchableOpacity>
        </View>

        {/* Fecha Hasta */}
        <View style={styles.filterSection}>
          <Text style={styles.filterLabel}>Fecha Hasta</Text>
          <TouchableOpacity style={styles.filterButton} onPress={() => setShowDatePickerHasta(true)} activeOpacity={0.7}>
            <Text style={styles.filterButtonText}>{fechaHasta ? formatDate(fechaHasta) : "Seleccionar fecha"}</Text>
            <Icon name="event" size={20} color="#6B7280" />
          </TouchableOpacity>
        </View>

        {/* Información */}
        <View style={styles.infoContainer}>
          <Icon name="info" size={20} color="#3B82F6" />
          <Text style={styles.infoText}>
            Los filtros te ayudan a encontrar pasajes específicos en tu historial. Los descuentos mostrados corresponden a estudiantes y jubilados.
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
      <Modal visible={showStatesModal} transparent animationType="fade" onRequestClose={() => setShowStatesModal(false)}>
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
          </View>
        </View>
      </Modal>

      {/* Date Pickers */}
      {showDatePickerDesde && (
        <DateTimePicker
          value={fechaDesde || new Date()}
          mode="date"
          display="default"
          onChange={onChangeDateDesde}
          maximumDate={fechaHasta || new Date()}
        />
      )}

      {showDatePickerHasta && (
        <DateTimePicker
          value={fechaHasta || new Date()}
          mode="date"
          display="default"
          onChange={onChangeDateHasta}
          minimumDate={fechaDesde}
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
  filterButtonText: {
    fontSize: 16,
    color: "#374151",
    flex: 1,
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
})
