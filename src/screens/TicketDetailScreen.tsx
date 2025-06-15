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
  ActivityIndicator,
  Alert,
} from "react-native"
import Icon from "react-native-vector-icons/MaterialIcons"
import { useAuth } from "../context/AuthContext"
import {
  pasajeService,
  type PasajeDto,
  getTicketStatusColor,
  getTicketStatusText,
  getTicketStatusIcon,
  canGenerateTicketPdf,
  hasStudentOrRetiredDiscount,
  getDiscountType,
} from "../services/pasajeService"

interface TicketDetailScreenProps {
  onGoBack: () => void
  ticketId: number
}

export default function TicketDetailScreen({ onGoBack, ticketId }: TicketDetailScreenProps) {
  const { token } = useAuth()

  // Estados
  const [ticket, setTicket] = useState<PasajeDto | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [generatingPdf, setGeneratingPdf] = useState(false)

  // Cargar detalle del pasaje
  useEffect(() => {
    loadTicketDetail()
  }, [ticketId])

  const loadTicketDetail = async () => {
    if (!token) {
      setError("No hay token de autenticación")
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      // Nota: Aquí asumo que necesitarías un endpoint específico para obtener un pasaje por ID
      // Si no existe, podrías obtenerlo del historial filtrado por ID
      console.log("Cargando detalle del pasaje:", ticketId)

      // Por ahora, simularemos que obtenemos el detalle
      // En una implementación real, necesitarías un endpoint como /pasajes/{id}
    } catch (error: any) {
      console.error("Error cargando detalle del pasaje:", error)
      setError(error.message || "Error al cargar el detalle del pasaje")
    } finally {
      setLoading(false)
    }
  }

  // Generar PDF
  const handleGeneratePdf = async () => {
    if (!token || !ticket) {
      Alert.alert("Error", "No hay información disponible")
      return
    }

    if (!canGenerateTicketPdf(ticket.estadoPasaje)) {
      Alert.alert("No disponible", "Solo se puede generar PDF de pasajes confirmados")
      return
    }

    try {
      setGeneratingPdf(true)
      console.log("Generando PDF para pasaje:", ticket.id)
      const blob = await pasajeService.generarPdfPasaje(ticket.id, token)
      console.log("PDF generado exitosamente")
      Alert.alert("Éxito", "PDF del pasaje generado correctamente")
    } catch (error: any) {
      console.error("Error generando PDF:", error)
      Alert.alert("Error", error.message || "Error al generar el PDF")
    } finally {
      setGeneratingPdf(false)
    }
  }

  // Formatear fecha
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString("es-ES", {
        weekday: "long",
        day: "2-digit",
        month: "long",
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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Cargando detalle del pasaje...</Text>
      </View>
    )
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar backgroundColor="#3B82F6" barStyle="light-content" />

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={onGoBack} activeOpacity={0.7}>
            <Icon name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Detalle del Pasaje</Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.errorContainer}>
          <Icon name="error-outline" size={64} color="#EF4444" />
          <Text style={styles.errorTitle}>Error al cargar</Text>
          <Text style={styles.errorSubtitle}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadTicketDetail} activeOpacity={0.7}>
            <Text style={styles.retryButtonText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }

  if (!ticket) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar backgroundColor="#3B82F6" barStyle="light-content" />

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={onGoBack} activeOpacity={0.7}>
            <Icon name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Detalle del Pasaje</Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.emptyContainer}>
          <Icon name="confirmation-number" size={64} color="#D1D5DB" />
          <Text style={styles.emptyTitle}>Pasaje no encontrado</Text>
          <Text style={styles.emptySubtitle}>No se pudo encontrar la información del pasaje solicitado.</Text>
        </View>
      </SafeAreaView>
    )
  }

  const statusColor = getTicketStatusColor(ticket.estadoPasaje)
  const statusText = getTicketStatusText(ticket.estadoPasaje)
  const statusIcon = getTicketStatusIcon(ticket.estadoPasaje)
  const hasDiscount = hasStudentOrRetiredDiscount(ticket.descuento)
  const discountType = getDiscountType(ticket.descuento)

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#3B82F6" barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onGoBack} activeOpacity={0.7}>
          <Icon name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pasaje #{ticket.id}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Estado del pasaje */}
        <View style={styles.statusCard}>
          <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
            <Icon name={statusIcon} size={20} color="white" />
            <Text style={styles.statusText}>{statusText}</Text>
          </View>
        </View>

        {/* Información del viaje */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Información del Viaje</Text>

          <View style={styles.routeContainer}>
            <View style={styles.locationContainer}>
              <Icon name="place" size={20} color="#059669" />
              <View style={styles.locationInfo}>
                <Text style={styles.locationName}>{ticket.paradaOrigen.localidad.nombre}</Text>
                <Text style={styles.locationDepartment}>{ticket.paradaOrigen.localidad.departamento}</Text>
              </View>
            </View>

            <View style={styles.arrowContainer}>
              <Icon name="arrow-forward" size={24} color="#3B82F6" />
            </View>

            <View style={styles.locationContainer}>
              <Icon name="place" size={20} color="#DC2626" />
              <View style={styles.locationInfo}>
                <Text style={styles.locationName}>{ticket.paradaDestino.localidad.nombre}</Text>
                <Text style={styles.locationDepartment}>{ticket.paradaDestino.localidad.departamento}</Text>
              </View>
            </View>
          </View>

          <View style={styles.tripDetails}>
            <View style={styles.detailRow}>
              <Icon name="event" size={20} color="#6B7280" />
              <View style={styles.detailInfo}>
                <Text style={styles.detailLabel}>Fecha de salida</Text>
                <Text style={styles.detailValue}>{formatDate(ticket.viajeAsiento.viaje.fechaHoraSalida)}</Text>
              </View>
            </View>

            <View style={styles.detailRow}>
              <Icon name="schedule" size={20} color="#6B7280" />
              <View style={styles.detailInfo}>
                <Text style={styles.detailLabel}>Hora de salida</Text>
                <Text style={styles.detailValue}>{formatTime(ticket.viajeAsiento.viaje.fechaHoraSalida)}</Text>
              </View>
            </View>

            <View style={styles.detailRow}>
              <Icon name="airline-seat-recline-normal" size={20} color="#6B7280" />
              <View style={styles.detailInfo}>
                <Text style={styles.detailLabel}>Asiento</Text>
                <Text style={styles.detailValue}>
                  Número {ticket.viajeAsiento.asiento.numero} ({ticket.viajeAsiento.asiento.tipo})
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Información de precios */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Información de Precios</Text>

          <View style={styles.priceDetails}>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Precio base:</Text>
              <Text style={styles.priceValue}>${ticket.precio.toFixed(2)}</Text>
            </View>

            {hasDiscount && (
              <View style={styles.priceRow}>
                <Text style={styles.discountLabel}>Descuento ({discountType}):</Text>
                <Text style={styles.discountValue}>-${ticket.descuento.toFixed(2)}</Text>
              </View>
            )}

            <View style={styles.divider} />

            <View style={styles.priceRow}>
              <Text style={styles.totalLabel}>Total pagado:</Text>
              <Text style={styles.totalValue}>${ticket.subtotal.toFixed(2)}</Text>
            </View>
          </View>
        </View>

        {/* Información de la compra */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Información de la Compra</Text>

          <View style={styles.purchaseInfo}>
            <View style={styles.detailRow}>
              <Icon name="receipt" size={20} color="#6B7280" />
              <View style={styles.detailInfo}>
                <Text style={styles.detailLabel}>ID de compra</Text>
                <Text style={styles.detailValue}>#{ticket.compra.id}</Text>
              </View>
            </View>

            <View style={styles.detailRow}>
              <Icon name="event" size={20} color="#6B7280" />
              <View style={styles.detailInfo}>
                <Text style={styles.detailLabel}>Fecha de compra</Text>
                <Text style={styles.detailValue}>{formatDate(ticket.compra.fechaCompra)}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Información de devolución si existe */}
        {ticket.devolucion && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Información de Devolución</Text>

            <View style={styles.refundInfo}>
              <View style={styles.refundHeader}>
                <Icon name="undo" size={20} color="#9C27B0" />
                <Text style={styles.refundTitle}>Pasaje Reembolsado</Text>
              </View>

              <View style={styles.refundDetails}>
                <View style={styles.priceRow}>
                  <Text style={styles.priceLabel}>Monto reintegrado:</Text>
                  <Text style={styles.refundAmount}>${ticket.devolucion.montoReintegrado.toFixed(2)}</Text>
                </View>

                <View style={styles.priceRow}>
                  <Text style={styles.priceLabel}>Fecha de devolución:</Text>
                  <Text style={styles.priceValue}>{formatDate(ticket.devolucion.fechaDevolucion)}</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Acciones */}
        {canGenerateTicketPdf(ticket.estadoPasaje) && (
          <View style={styles.actionsCard}>
            <TouchableOpacity
              style={[styles.pdfButton, generatingPdf && styles.pdfButtonDisabled]}
              onPress={handleGeneratePdf}
              disabled={generatingPdf}
              activeOpacity={0.7}
            >
              {generatingPdf ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Icon name="picture-as-pdf" size={20} color="white" />
              )}
              <Text style={styles.pdfButtonText}>{generatingPdf ? "Generando..." : "Descargar PDF"}</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
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
  errorContainer: {
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
  emptyContainer: {
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
  statusCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
    marginLeft: 8,
  },
  card: {
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
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 16,
  },
  routeContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  locationInfo: {
    marginLeft: 8,
    flex: 1,
  },
  locationName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#374151",
  },
  locationDepartment: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 2,
  },
  arrowContainer: {
    marginHorizontal: 16,
  },
  tripDetails: {
    gap: 16,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  detailInfo: {
    marginLeft: 12,
    flex: 1,
  },
  detailLabel: {
    fontSize: 14,
    color: "#6B7280",
  },
  detailValue: {
    fontSize: 16,
    fontWeight: "500",
    color: "#374151",
    marginTop: 2,
  },
  priceDetails: {
    gap: 12,
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  priceLabel: {
    fontSize: 16,
    color: "#6B7280",
  },
  priceValue: {
    fontSize: 16,
    color: "#374151",
  },
  discountLabel: {
    fontSize: 16,
    color: "#059669",
  },
  discountValue: {
    fontSize: 16,
    color: "#059669",
    fontWeight: "500",
  },
  divider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: 8,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: "600",
    color: "#374151",
  },
  totalValue: {
    fontSize: 18,
    fontWeight: "600",
    color: "#374151",
  },
  purchaseInfo: {
    gap: 16,
  },
  refundInfo: {
    backgroundColor: "#F3E8FF",
    borderRadius: 8,
    padding: 16,
  },
  refundHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  refundTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#7C3AED",
    marginLeft: 8,
  },
  refundDetails: {
    gap: 8,
  },
  refundAmount: {
    fontSize: 16,
    fontWeight: "600",
    color: "#7C3AED",
  },
  actionsCard: {
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
  pdfButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#DC2626",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  pdfButtonDisabled: {
    backgroundColor: "#9CA3AF",
  },
  pdfButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
    marginLeft: 8,
  },
})
