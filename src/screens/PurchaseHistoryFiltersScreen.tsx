"use client"

import type React from "react"
import { useState } from "react"
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TextInput,
  Alert,
} from "react-native"
import Icon from "react-native-vector-icons/MaterialIcons"
import DateTimePicker from "@react-native-community/datetimepicker"
import { ESTADOS_COMPRA } from "../services/constants" // Usar desde constants

interface PurchaseHistoryFiltersScreenProps {
  onGoBack?: () => void
  onApplyFilters?: (filters: any) => void
  initialFilters?: {
    estados: string[]
    fechaDesde?: Date
    fechaHasta?: Date
    montoMin?: number
    montoMax?: number
  }
}

const PurchaseHistoryFiltersScreen: React.FC<PurchaseHistoryFiltersScreenProps> = ({
  onGoBack,
  onApplyFilters,
  initialFilters,
}) => {
  // Estados para los filtros
  const [selectedEstados, setSelectedEstados] = useState<string[]>(initialFilters?.estados || [])
  const [fechaDesde, setFechaDesde] = useState<Date | undefined>(initialFilters?.fechaDesde)
  const [fechaHasta, setFechaHasta] = useState<Date | undefined>(initialFilters?.fechaHasta)
  const [montoMin, setMontoMin] = useState<string>(initialFilters?.montoMin?.toString() || "")
  const [montoMax, setMontoMax] = useState<string>(initialFilters?.montoMax?.toString() || "")

  // Estados para los date pickers
  const [showDatePickerDesde, setShowDatePickerDesde] = useState(false)
  const [showDatePickerHasta, setShowDatePickerHasta] = useState(false)

  // Función para alternar estados
  const toggleEstado = (estado: string) => {
    setSelectedEstados((prev) => (prev.includes(estado) ? prev.filter((e) => e !== estado) : [...prev, estado]))
  }

  // Función para manejar cambio de fecha desde
  const handleFechaDesdeChange = (event: any, selectedDate?: Date) => {
    setShowDatePickerDesde(false)
    if (selectedDate) {
      setFechaDesde(selectedDate)
    }
  }

  // Función para manejar cambio de fecha hasta
  const handleFechaHastaChange = (event: any, selectedDate?: Date) => {
    setShowDatePickerHasta(false)
    if (selectedDate) {
      setFechaHasta(selectedDate)
    }
  }

  // Función para formatear fecha
  const formatDate = (date: Date) => {
    return date.toLocaleDateString("es-UY", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  // Función para validar filtros
  const validateFilters = () => {
    if (fechaDesde && fechaHasta && fechaDesde > fechaHasta) {
      Alert.alert("Error", "La fecha desde no puede ser mayor que la fecha hasta")
      return false
    }

    const minAmount = montoMin ? Number.parseFloat(montoMin) : undefined
    const maxAmount = montoMax ? Number.parseFloat(montoMax) : undefined

    if (minAmount && minAmount < 0) {
      Alert.alert("Error", "El monto mínimo no puede ser negativo")
      return false
    }

    if (maxAmount && maxAmount < 0) {
      Alert.alert("Error", "El monto máximo no puede ser negativo")
      return false
    }

    if (minAmount && maxAmount && minAmount > maxAmount) {
      Alert.alert("Error", "El monto mínimo no puede ser mayor que el monto máximo")
      return false
    }

    return true
  }

  // Función para aplicar filtros
  const handleApplyFilters = () => {
    if (!validateFilters()) {
      return
    }

    const filters = {
      estados: selectedEstados,
      fechaDesde,
      fechaHasta,
      montoMin: montoMin ? Number.parseFloat(montoMin) : undefined,
      montoMax: montoMax ? Number.parseFloat(montoMax) : undefined,
    }

    console.log("Aplicando filtros:", filters)
    onApplyFilters?.(filters)
  }

  // Función para limpiar filtros
  const handleClearFilters = () => {
    setSelectedEstados([])
    setFechaDesde(undefined)
    setFechaHasta(undefined)
    setMontoMin("")
    setMontoMax("")
  }

  // Función para verificar si hay filtros aplicados
  const hasFiltersApplied = () => {
    return selectedEstados.length > 0 || fechaDesde || fechaHasta || montoMin.trim() !== "" || montoMax.trim() !== ""
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#3B82F6" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onGoBack}>
          <Icon name="arrow-back" size={24} color="#3B82F6" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Filtros de Búsqueda</Text>
        <TouchableOpacity style={styles.clearButton} onPress={handleClearFilters} disabled={!hasFiltersApplied()}>
          <Text style={[styles.clearButtonText, !hasFiltersApplied() && styles.clearButtonTextDisabled]}>Limpiar</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Sección de Estados */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Estados</Text>
          <Text style={styles.sectionSubtitle}>Selecciona los estados de compra que deseas incluir</Text>

          <View style={styles.checkboxContainer}>
            {ESTADOS_COMPRA.map((estado) => (
              <TouchableOpacity
                key={estado.value}
                style={styles.checkboxItem}
                onPress={() => toggleEstado(estado.value)}
                activeOpacity={0.7}
              >
                <View style={[styles.checkbox, selectedEstados.includes(estado.value) && styles.checkboxSelected]}>
                  {selectedEstados.includes(estado.value) && <Icon name="check" size={16} color="white" />}
                </View>
                <Text style={styles.checkboxLabel}>{estado.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Resto del componente permanece igual... */}
        {/* Sección de Fechas */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Rango de Fechas</Text>
          <Text style={styles.sectionSubtitle}>Filtra las compras por fecha de realización</Text>

          <View style={styles.dateContainer}>
            <View style={styles.dateInputContainer}>
              <Text style={styles.dateLabel}>Desde</Text>
              <TouchableOpacity style={styles.dateInput} onPress={() => setShowDatePickerDesde(true)}>
                <Icon name="calendar-today" size={20} color="#79747E" />
                <Text style={[styles.dateText, !fechaDesde && styles.datePlaceholder]}>
                  {fechaDesde ? formatDate(fechaDesde) : "Seleccionar fecha"}
                </Text>
              </TouchableOpacity>
              {fechaDesde && (
                <TouchableOpacity style={styles.clearDateButton} onPress={() => setFechaDesde(undefined)}>
                  <Icon name="clear" size={20} color="#79747E" />
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.dateInputContainer}>
              <Text style={styles.dateLabel}>Hasta</Text>
              <TouchableOpacity style={styles.dateInput} onPress={() => setShowDatePickerHasta(true)}>
                <Icon name="calendar-today" size={20} color="#79747E" />
                <Text style={[styles.dateText, !fechaHasta && styles.datePlaceholder]}>
                  {fechaHasta ? formatDate(fechaHasta) : "Seleccionar fecha"}
                </Text>
              </TouchableOpacity>
              {fechaHasta && (
                <TouchableOpacity style={styles.clearDateButton} onPress={() => setFechaHasta(undefined)}>
                  <Icon name="clear" size={20} color="#79747E" />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>

        {/* Sección de Montos */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Rango de Montos</Text>
          <Text style={styles.sectionSubtitle}>Filtra las compras por monto total</Text>

          <View style={styles.amountContainer}>
            <View style={styles.amountInputContainer}>
              <Text style={styles.amountLabel}>Monto mínimo</Text>
              <View style={styles.amountInput}>
                <Text style={styles.currencySymbol}>$</Text>
                <TextInput
                  style={styles.amountTextInput}
                  placeholder="0"
                  placeholderTextColor="#79747E"
                  keyboardType="numeric"
                  value={montoMin}
                  onChangeText={setMontoMin}
                />
              </View>
            </View>

            <View style={styles.amountInputContainer}>
              <Text style={styles.amountLabel}>Monto máximo</Text>
              <View style={styles.amountInput}>
                <Text style={styles.currencySymbol}>$</Text>
                <TextInput
                  style={styles.amountTextInput}
                  placeholder="Sin límite"
                  placeholderTextColor="#79747E"
                  keyboardType="numeric"
                  value={montoMax}
                  onChangeText={setMontoMax}
                />
              </View>
            </View>
          </View>
        </View>

        {/* Resumen de filtros */}
        {hasFiltersApplied() && (
          <View style={styles.summarySection}>
            <Text style={styles.summaryTitle}>Resumen de filtros</Text>
            <View style={styles.summaryContent}>
              {selectedEstados.length > 0 && (
                <Text style={styles.summaryText}>
                  Estados:{" "}
                  {selectedEstados.map((estado) => ESTADOS_COMPRA.find((e) => e.value === estado)?.label).join(", ")}
                </Text>
              )}
              {fechaDesde && <Text style={styles.summaryText}>Desde: {formatDate(fechaDesde)}</Text>}
              {fechaHasta && <Text style={styles.summaryText}>Hasta: {formatDate(fechaHasta)}</Text>}
              {montoMin && <Text style={styles.summaryText}>Monto mín: ${montoMin}</Text>}
              {montoMax && <Text style={styles.summaryText}>Monto máx: ${montoMax}</Text>}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Botones de acción */}
      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.cancelButton} onPress={onGoBack}>
          <Text style={styles.cancelButtonText}>Cancelar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.applyButton} onPress={handleApplyFilters}>
          <Text style={styles.applyButtonText}>Aplicar Filtros</Text>
        </TouchableOpacity>
      </View>

      {/* Date Pickers */}
      {showDatePickerDesde && (
        <DateTimePicker
          value={fechaDesde || new Date()}
          mode="date"
          display="default"
          onChange={handleFechaDesdeChange}
          maximumDate={new Date()}
        />
      )}

      {showDatePickerHasta && (
        <DateTimePicker
          value={fechaHasta || new Date()}
          mode="date"
          display="default"
          onChange={handleFechaHastaChange}
          maximumDate={new Date()}
          minimumDate={fechaDesde}
        />
      )}
    </SafeAreaView>
  )
}

// Estilos permanecen iguales...
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFBFE",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#E7E0EC",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: "600",
    color: "#1C1B1F",
    textAlign: "center",
  },
  clearButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  clearButtonText: {
    color: "#3B82F6",
    fontSize: 14,
    fontWeight: "500",
  },
  clearButtonTextDisabled: {
    color: "#CAC4D0",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1C1B1F",
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: "#79747E",
    marginBottom: 16,
  },
  checkboxContainer: {
    gap: 12,
  },
  checkboxItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: "#79747E",
    marginRight: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxSelected: {
    backgroundColor: "#3B82F6",
    borderColor: "#3B82F6",
  },
  checkboxLabel: {
    fontSize: 16,
    color: "#1C1B1F",
  },
  dateContainer: {
    gap: 16,
  },
  dateInputContainer: {
    position: "relative",
  },
  dateLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#49454F",
    marginBottom: 8,
  },
  dateInput: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#79747E",
    borderRadius: 8,
    backgroundColor: "white",
  },
  dateText: {
    flex: 1,
    fontSize: 16,
    color: "#1C1B1F",
    marginLeft: 12,
  },
  datePlaceholder: {
    color: "#79747E",
  },
  clearDateButton: {
    position: "absolute",
    right: 12,
    top: 36,
    padding: 4,
  },
  amountContainer: {
    gap: 16,
  },
  amountInputContainer: {
    flex: 1,
  },
  amountLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#49454F",
    marginBottom: 8,
  },
  amountInput: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#79747E",
    borderRadius: 8,
    backgroundColor: "white",
    paddingHorizontal: 16,
  },
  currencySymbol: {
    fontSize: 16,
    color: "#49454F",
    marginRight: 8,
  },
  amountTextInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: "#1C1B1F",
  },
  summarySection: {
    backgroundColor: "#F8F9FF",
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1C1B1F",
    marginBottom: 8,
  },
  summaryContent: {
    gap: 4,
  },
  summaryText: {
    fontSize: 14,
    color: "#49454F",
  },
  actionButtons: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#E7E0EC",
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#79747E",
    justifyContent: "center",
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#49454F",
  },
  applyButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: "#3B82F6",
    justifyContent: "center",
    alignItems: "center",
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
  },
})

export default PurchaseHistoryFiltersScreen