"use client"

import { useState, useEffect, useCallback } from "react"
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from "react-native"
import Icon from "react-native-vector-icons/MaterialIcons"
import { useAuth } from "../context/AuthContext"
import { useUser } from "../hooks/useUser"
import {
  pasajeService,
  type PasajeDto,
  type FiltroBusquedaPasajeDto,
  getTicketStatusColor,
  getTicketStatusText,
  getTicketStatusIcon,
  canGenerateTicketPdf,
  hasStudentOrRetiredDiscount,
  getDiscountType,
} from "../services/pasajeService"

interface TicketHistoryScreenProps {
  onGoBack: () => void
  filters: FiltroBusquedaPasajeDto
}

export default function TicketHistoryScreen({ onGoBack, filters }: TicketHistoryScreenProps) {
  const { token } = useAuth()
  const { user } = useUser()

  // Estados
  const [pasajes, setPasajes] = useState<PasajeDto[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [hasMore, setHasMore] = useState(true)

  // Cargar pasajes
  const loadTickets = useCallback(
    async (page = 0, isRefresh = false) => {
      if (!token || !user?.id) {
        setError("No hay información de usuario disponible")
        setLoading(false)
        return
      }

      try {
        if (isRefresh) {
          setRefreshing(true)
          setError(null)
        } else if (page === 0) {
          setLoading(true)
          setError(null)
        } else {
          setLoadingMore(true)
        }

        console.log("Cargando pasajes - Página:", page)
        console.log("Filtros aplicados:", filters)

        // ✅ CORREGIDO: Llamar directamente al servicio sin JSON.parse adicional
        const response = await pasajeService.obtenerHistorialPasajes(
          Number.parseInt(user.id),
          user.email,
          filters,
          {
            page,
            size: 10,
            sort: "viajeAsiento.viaje.fechaHoraSalida,desc",
          },
          token,
        )

        console.log("✅ Historial de pasajes obtenido:", {
          totalElements: response.totalElements || 0,
          contentLength: response.content?.length || 0,
          hasPageable: !!response.pageable,
          firstItem: response.content && response.content.length > 0 ? JSON.stringify(response.content[0]) : "No items",
        })

        console.log("Respuesta recibida:", {
          totalElements: response.totalElements,
          totalPages: response.totalPages,
          currentPage: response.pageable?.pageNumber || 0,
          contentLength: response.content?.length || 0,
        })

        // Verificar si la respuesta tiene la estructura esperada
        if (!response.content) {
          console.error("❌ Estructura de respuesta inesperada:", response)
          throw new Error("El servidor devolvió una estructura de datos inesperada")
        }

        if (isRefresh || page === 0) {
          setPasajes(response.content)
        } else {
          setPasajes((prev) => [...prev, ...response.content])
        }

        // Manejar la paginación con valores por defecto si no están presentes
        const currentPageNumber = response.pageable?.pageNumber ?? page
        const totalPagesCount = response.totalPages ?? 1
        const totalElementsCount = response.totalElements ?? response.content.length

        setCurrentPage(currentPageNumber)
        setTotalPages(totalPagesCount)
        setTotalElements(totalElementsCount)
        setHasMore(currentPageNumber < totalPagesCount - 1)
      } catch (error: any) {
        console.error("Error cargando pasajes:", error)

        // ✅ MEJORADO: Manejo de errores más específico
        let errorMessage = "Error al cargar el historial de pasajes"

        if (error.message) {
          if (error.message.includes("JSON")) {
            errorMessage = "Error de formato en la respuesta del servidor"
          } else if (error.message.includes("Network")) {
            errorMessage = "Error de conexión. Verifica tu internet."
          } else if (error.message.includes("401")) {
            errorMessage = "Sesión expirada. Inicia sesión nuevamente."
          } else if (error.message.includes("403")) {
            errorMessage = "No tienes permisos para acceder a esta información."
          } else if (error.message.includes("500")) {
            errorMessage = "Error del servidor. Intenta más tarde."
          } else {
            errorMessage = error.message
          }
        }

        setError(errorMessage)
      } finally {
        setLoading(false)
        setRefreshing(false)
        setLoadingMore(false)
      }
    },
    [token, user, filters],
  )

  // Cargar más pasajes
  const loadMoreTickets = () => {
    if (!loadingMore && hasMore) {
      loadTickets(currentPage + 1)
    }
  }

  // Refrescar
  const onRefresh = () => {
    loadTickets(0, true)
  }

  // Generar PDF
  const handleGeneratePdf = async (pasaje: PasajeDto) => {
    if (!token) {
      Alert.alert("Error", "No hay token de autenticación")
      return
    }

    if (!canGenerateTicketPdf(pasaje.estadoPasaje)) {
      Alert.alert("No disponible", "Solo se puede generar PDF de pasajes confirmados")
      return
    }

    try {
      console.log("Generando PDF para pasaje:", pasaje.id)
      const blob = await pasajeService.generarPdfPasaje(pasaje.id, token)
      console.log("PDF generado exitosamente")
      Alert.alert("Éxito", "PDF del pasaje generado correctamente")
    } catch (error: any) {
      console.error("Error generando PDF:", error)
      Alert.alert("Error", error.message || "Error al generar el PDF")
    }
  }

  // Agregar función para manejar el press del pasaje:
  const handleTicketPress = (ticket: PasajeDto) => {
    console.log("Navegando al detalle del pasaje:", ticket.id)
    // Aquí podrías navegar a una pantalla de detalle si la implementas
    Alert.alert(
      "Detalle del Pasaje",
      `Pasaje #${ticket.id}\nEstado: ${getTicketStatusText(ticket.estadoPasaje)}\nTotal: $${ticket.subtotal.toFixed(2)}`,
      [{ text: "OK" }],
    )
  }

  // Efectos
  useEffect(() => {
    loadTickets(0)
  }, [loadTickets])

  // Formatear fecha
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    } catch {
      return dateString
    }
  }

  // Formatear hora
  const formatTime = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleTimeString("es-ES", {
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch {
      return ""
    }
  }

  // Renderizar item de pasaje
  const renderTicketItem = ({ item }: { item: PasajeDto }) => {
    const statusColor = getTicketStatusColor(item.estadoPasaje)
    const statusText = getTicketStatusText(item.estadoPasaje)
    const statusIcon = getTicketStatusIcon(item.estadoPasaje)
    const hasDiscount = hasStudentOrRetiredDiscount(item.descuento)
    const discountType = getDiscountType(item.descuento)

    return (
      <TouchableOpacity style={styles.ticketCard} onPress={() => handleTicketPress(item)} activeOpacity={0.7}>
        {/* Header del pasaje */}
        <View style={styles.ticketHeader}>
          <View style={styles.ticketInfo}>
            <Text style={styles.ticketId}>Pasaje #{item.id}</Text>
            <Text style={styles.purchaseId}>Compra #{item.compra.id}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
            <Icon name={statusIcon} size={16} color="white" />
            <Text style={styles.statusText}>{statusText}</Text>
          </View>
        </View>

        {/* Información del viaje */}
        <View style={styles.tripInfo}>
          <View style={styles.routeContainer}>
            <View style={styles.locationContainer}>
              <Icon name="place" size={16} color="#6B7280" />
              <Text style={styles.locationText}>
                {item.paradaOrigen.localidad.nombre}, {item.paradaOrigen.localidad.departamento}
              </Text>
            </View>
            <Icon name="arrow-forward" size={20} color="#3B82F6" style={styles.arrowIcon} />
            <View style={styles.locationContainer}>
              <Icon name="place" size={16} color="#6B7280" />
              <Text style={styles.locationText}>
                {item.paradaDestino.localidad.nombre}, {item.paradaDestino.localidad.departamento}
              </Text>
            </View>
          </View>

          <View style={styles.tripDetails}>
            <View style={styles.detailItem}>
              <Icon name="event" size={16} color="#6B7280" />
              <Text style={styles.detailText}>
                {formatDate(item.viajeAsiento.viaje.fechaHoraSalida)} -{" "}
                {formatTime(item.viajeAsiento.viaje.fechaHoraSalida)}
              </Text>
            </View>
            <View style={styles.detailItem}>
              <Icon name="airline-seat-recline-normal" size={16} color="#6B7280" />
              <Text style={styles.detailText}>
                Asiento {item.viajeAsiento.asiento.numero} ({item.viajeAsiento.asiento.tipo})
              </Text>
            </View>
          </View>
        </View>

        {/* Información de precio */}
        <View style={styles.priceInfo}>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Precio:</Text>
            <Text style={styles.priceValue}>${item.precio.toFixed(2)}</Text>
          </View>
          {hasDiscount && (
            <View style={styles.priceRow}>
              <Text style={styles.discountLabel}>Descuento ({discountType}):</Text>
              <Text style={styles.discountValue}>-${item.descuento.toFixed(2)}</Text>
            </View>
          )}
          <View style={styles.priceRow}>
            <Text style={styles.totalLabel}>Total:</Text>
            <Text style={styles.totalValue}>${item.subtotal.toFixed(2)}</Text>
          </View>
        </View>

        {/* Información de devolución si existe */}
        {item.devolucion && (
          <View style={styles.refundInfo}>
            <Icon name="undo" size={16} color="#9C27B0" />
            <Text style={styles.refundText}>
              Reembolsado: ${item.devolucion.montoReintegrado.toFixed(2)} el{" "}
              {formatDate(item.devolucion.fechaDevolucion)}
            </Text>
          </View>
        )}

        {/* Acciones */}
        <View style={styles.actions}>
          {canGenerateTicketPdf(item.estadoPasaje) && (
            <TouchableOpacity style={styles.pdfButton} onPress={() => handleGeneratePdf(item)} activeOpacity={0.7}>
              <Icon name="picture-as-pdf" size={16} color="#DC2626" />
              <Text style={styles.pdfButtonText}>Descargar PDF</Text>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    )
  }

  // Renderizar estado vacío
  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Icon name="confirmation-number" size={64} color="#D1D5DB" />
      <Text style={styles.emptyTitle}>No hay pasajes</Text>
      <Text style={styles.emptySubtitle}>
        No se encontraron pasajes con los filtros aplicados. Intenta ajustar los criterios de búsqueda.
      </Text>
    </View>
  )

  // Renderizar error
  const renderError = () => (
    <View style={styles.errorState}>
      <Icon name="error-outline" size={64} color="#EF4444" />
      <Text style={styles.errorTitle}>Error al cargar</Text>
      <Text style={styles.errorSubtitle}>{error}</Text>
      <TouchableOpacity style={styles.retryButton} onPress={() => loadTickets(0)} activeOpacity={0.7}>
        <Text style={styles.retryButtonText}>Reintentar</Text>
      </TouchableOpacity>
    </View>
  )

  // Renderizar footer de carga
  const renderFooter = () => {
    if (!loadingMore) return null
    return (
      <View style={styles.loadingFooter}>
        <ActivityIndicator size="small" color="#3B82F6" />
        <Text style={styles.loadingFooterText}>Cargando más pasajes...</Text>
      </View>
    )
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Cargando historial de pasajes...</Text>
      </View>
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
        <Text style={styles.headerTitle}>Historial de Pasajes</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Información de resultados */}
      {!error && (
        <View style={styles.resultsInfo}>
          <Text style={styles.resultsText}>
            {totalElements} pasaje{totalElements !== 1 ? "s" : ""} encontrado{totalElements !== 1 ? "s" : ""}
          </Text>
        </View>
      )}

      {/* Contenido */}
      {error ? (
        renderError()
      ) : (
        <FlatList
          data={pasajes}
          renderItem={renderTicketItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={[styles.listContainer, pasajes.length === 0 && styles.emptyListContainer]}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#3B82F6"]} />}
          onEndReached={loadMoreTickets}
          onEndReachedThreshold={0.1}
          ListEmptyComponent={renderEmptyState}
          ListFooterComponent={renderFooter}
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
  resultsInfo: {
    backgroundColor: "white",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  resultsText: {
    fontSize: 14,
    color: "#6B7280",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
  },
  loadingText: {
    fontSize: 16,
    color: "#6B7280",
    marginTop: 16,
  },
  listContainer: {
    padding: 16,
  },
  emptyListContainer: {
    flex: 1,
  },
  ticketCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  ticketHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  ticketInfo: {
    flex: 1,
  },
  ticketId: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
  },
  purchaseId: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "500",
    color: "white",
    marginLeft: 4,
  },
  tripInfo: {
    marginBottom: 16,
  },
  routeContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  locationText: {
    fontSize: 14,
    color: "#374151",
    marginLeft: 4,
    flex: 1,
  },
  arrowIcon: {
    marginHorizontal: 8,
  },
  tripDetails: {
    gap: 8,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  detailText: {
    fontSize: 14,
    color: "#6B7280",
    marginLeft: 8,
  },
  priceInfo: {
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  priceLabel: {
    fontSize: 14,
    color: "#6B7280",
  },
  priceValue: {
    fontSize: 14,
    color: "#374151",
  },
  discountLabel: {
    fontSize: 14,
    color: "#059669",
  },
  discountValue: {
    fontSize: 14,
    color: "#059669",
    fontWeight: "500",
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
  },
  totalValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
  },
  refundInfo: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3E8FF",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  refundText: {
    fontSize: 14,
    color: "#7C3AED",
    marginLeft: 8,
    flex: 1,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  pdfButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF2F2",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  pdfButtonText: {
    fontSize: 14,
    color: "#DC2626",
    fontWeight: "500",
    marginLeft: 4,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#374151",
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 20,
  },
  errorState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#EF4444",
    marginTop: 16,
    marginBottom: 8,
  },
  errorSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: "#3B82F6",
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: "500",
    color: "white",
  },
  loadingFooter: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 16,
  },
  loadingFooterText: {
    fontSize: 14,
    color: "#6B7280",
    marginLeft: 8,
  },
})
