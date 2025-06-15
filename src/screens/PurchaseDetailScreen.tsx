"use client"

import type React from "react"
import { useState, useEffect } from "react"
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  ActivityIndicator,
  Alert,
  Linking,
} from "react-native"
import Icon from "react-native-vector-icons/MaterialIcons"
import { useAuth } from "../context/AuthContext"
import { useUser } from "../hooks/useUser"
import {
  purchaseService,
  type DetalleCompraDto,
  type PasajeDto,
  getStatusColor,
  getStatusText,
  getStatusIcon,
  canGeneratePdf,
} from "../services/purchaseService"
import { API_BASE_URL, API_ROUTES } from "../services/constants"

interface PurchaseDetailScreenProps {
  compraId: number
  onGoBack?: () => void
}

const PurchaseDetailScreen: React.FC<PurchaseDetailScreenProps> = ({ compraId, onGoBack }) => {
  const { token } = useAuth()
  const { user, loading: userLoading } = useUser()
  const [compra, setCompra] = useState<DetalleCompraDto | null>(null)
  const [loading, setLoading] = useState(true)
  const [generatingPdf, setGeneratingPdf] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const hasRequiredData = Boolean(token && !userLoading)

  useEffect(() => {
    console.log("🔍 Estado de autenticación en detalle:")
    console.log("👤 Usuario:", user ? `ID: ${user.id}, Email: ${user.email}` : "No disponible")
    console.log("🔑 Token:", token ? "Disponible" : "No disponible")
    console.log("⏳ Cargando usuario:", userLoading)
    console.log("✅ Datos requeridos:", hasRequiredData ? "Completos" : "Incompletos")
  }, [user, token, userLoading])

  useEffect(() => {
    if (hasRequiredData) {
      loadPurchaseDetail()
    }
  }, [compraId, hasRequiredData])

  const loadPurchaseDetail = async () => {
    if (!token) {
      setError("No hay token de autenticación")
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      console.log("🔄 Cargando detalle de compra:", compraId)

      const detail = await purchaseService.obtenerDetalleCompra(compraId, token)
      setCompra(detail)
      console.log("✅ Detalle cargado:", detail)
    } catch (error: any) {
      console.error("❌ Error cargando detalle:", error)
      setError(error.message || "Error cargando detalles de la compra")
    } finally {
      setLoading(false)
    }
  }

  // Función para generar PDF usando los endpoints de constants
  const handleGeneratePdf = async () => {
    if (!token || !compra) return

    try {
      setGeneratingPdf(true)
      console.log("📄 Generando PDF para compra:", compra.id)

      // Crear URL del PDF usando las constantes
      const pdfUrl = `${API_BASE_URL}${API_ROUTES.COMPRAS_PDF}/${compra.id}/pdf`
      console.log("🌐 PDF URL:", pdfUrl)
      
      // Abrir PDF en el navegador del dispositivo
      const supported = await Linking.canOpenURL(pdfUrl)
      
      if (supported) {
        await Linking.openURL(pdfUrl)
        Alert.alert("PDF generado", "El PDF se abrirá en tu navegador")
      } else {
        Alert.alert("Error", "No se puede abrir el PDF en este dispositivo")
      }

    } catch (error: any) {
      console.error("❌ Error generando PDF:", error)
      Alert.alert("Error", error.message || "No se pudo generar el PDF")
    } finally {
      setGeneratingPdf(false)
    }
  }

  // Funciones de formato
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("es-UY", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatCurrency = (amount: number) => {
    return `$${amount.toLocaleString("es-UY")}`
  }

  const getPasajeStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case "CONFIRMADO":
        return "#4CAF50"
      case "PENDIENTE":
        return "#FF9800"
      case "CANCELADO":
        return "#F44336"
      case "DEVUELTO":
        return "#9C27B0"
      case "USADO":
        return "#2196F3"
      default:
        return "#79747E"
    }
  }

  const getPasajeStatusText = (status: string) => {
    switch (status.toUpperCase()) {
      case "CONFIRMADO":
        return "Confirmado"
      case "PENDIENTE":
        return "Pendiente"
      case "CANCELADO":
        return "Cancelado"
      case "DEVUELTO":
        return "Devuelto"
      case "USADO":
        return "Usado"
      default:
        return status
    }
  }

  // Renderizar pasaje individual
  const renderPasaje = (pasaje: PasajeDto, index: number) => (
    <View key={pasaje.id} style={styles.pasajeCard}>
      <View style={styles.pasajeHeader}>
        <Text style={styles.pasajeTitle}>Pasaje #{index + 1}</Text>
        <View style={[styles.pasajeStatusBadge, { backgroundColor: getPasajeStatusColor(pasaje.estadoPasaje) }]}>
          <Text style={styles.pasajeStatusText}>{getPasajeStatusText(pasaje.estadoPasaje)}</Text>
        </View>
      </View>

      <View style={styles.pasajeDetails}>
        <View style={styles.routeInfo}>
          <View style={styles.routePoint}>
            <Icon name="radio-button-checked" size={12} color="#4CAF50" />
            <Text style={styles.routeText}>
              {pasaje.paradaOrigen.localidad.nombre}, {pasaje.paradaOrigen.localidad.departamento}
            </Text>
          </View>
          <View style={styles.routeLine} />
          <View style={styles.routePoint}>
            <Icon name="location-on" size={12} color="#F44336" />
            <Text style={styles.routeText}>
              {pasaje.paradaDestino.localidad.nombre}, {pasaje.paradaDestino.localidad.departamento}
            </Text>
          </View>
        </View>

        <View style={styles.pasajeInfoGrid}>
          <View style={styles.pasajeInfoItem}>
            <Icon name="event-seat" size={16} color="#79747E" />
            <Text style={styles.pasajeInfoText}>Asiento {pasaje.viajeAsiento.asiento.numero}</Text>
          </View>
          <View style={styles.pasajeInfoItem}>
            <Icon name="schedule" size={16} color="#79747E" />
            <Text style={styles.pasajeInfoText}>{formatDate(pasaje.viajeAsiento.viaje.fechaHoraSalida)}</Text>
          </View>
          <View style={styles.pasajeInfoItem}>
            <Icon name="attach-money" size={16} color="#79747E" />
            <Text style={styles.pasajeInfoText}>Precio: {formatCurrency(pasaje.precio)}</Text>
          </View>
          {pasaje.descuento > 0 && (
            <View style={styles.pasajeInfoItem}>
              <Icon name="local-offer" size={16} color="#4CAF50" />
              <Text style={styles.pasajeInfoText}>Descuento: {formatCurrency(pasaje.descuento)}</Text>
            </View>
          )}
          <View style={styles.pasajeInfoItem}>
            <Icon name="payment" size={16} color="#3B82F6" />
            <Text style={[styles.pasajeInfoText, styles.subtotalText]}>
              Subtotal: {formatCurrency(pasaje.subtotal)}
            </Text>
          </View>
        </View>
      </View>
    </View>
  )

  // Estados de carga y error
  if (userLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#3B82F6" />
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={onGoBack}>
            <Icon name="arrow-back" size={24} color="#3B82F6" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Detalle de Compra</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>Cargando datos del usuario...</Text>
        </View>
      </SafeAreaView>
    )
  }

  if (!token) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#3B82F6" />
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={onGoBack}>
            <Icon name="arrow-back" size={24} color="#3B82F6" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Detalle de Compra</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.errorContainer}>
          <Icon name="vpn-key" size={64} color="#F44336" />
          <Text style={styles.errorTitle}>Sesión expirada</Text>
          <Text style={styles.errorText}>Tu sesión ha expirado. Por favor, vuelve a iniciar sesión.</Text>
          <TouchableOpacity style={styles.retryButton} onPress={onGoBack}>
            <Text style={styles.retryButtonText}>Volver</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#3B82F6" />
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={onGoBack}>
            <Icon name="arrow-back" size={24} color="#3B82F6" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Detalle de Compra</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>Cargando detalles...</Text>
        </View>
      </SafeAreaView>
    )
  }

  if (error || !compra) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#3B82F6" />
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={onGoBack}>
            <Icon name="arrow-back" size={24} color="#3B82F6" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Detalle de Compra</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.errorContainer}>
          <Icon name="error-outline" size={64} color="#F44336" />
          <Text style={styles.errorTitle}>Error al cargar</Text>
          <Text style={styles.errorText}>{error || "No se encontraron detalles"}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadPurchaseDetail}>
            <Text style={styles.retryButtonText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#3B82F6" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onGoBack}>
          <Icon name="arrow-back" size={24} color="#3B82F6" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Compra #{compra.id}</Text>
        <TouchableOpacity
          style={styles.pdfButton}
          onPress={handleGeneratePdf}
          disabled={generatingPdf || !canGeneratePdf(compra.estado)}
        >
          {generatingPdf ? (
            <ActivityIndicator size="small" color="#3B82F6" />
          ) : (
            <Icon name="picture-as-pdf" size={24} color={!canGeneratePdf(compra.estado) ? "#CAC4D0" : "#3B82F6"} />
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Información general de la compra */}
        <View style={styles.compraCard}>
          <View style={styles.compraHeader}>
            <View style={styles.compraInfo}>
              <Text style={styles.compraIdText}>Compra #{compra.id}</Text>
              <Text style={styles.compraDateText}>{formatDate(compra.fechaCompra)}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(compra.estado) }]}>
              <Icon name={getStatusIcon(compra.estado)} size={12} color="white" style={styles.statusIcon} />
              <Text style={styles.statusText}>{getStatusText(compra.estado)}</Text>
            </View>
          </View>

          <View style={styles.compraDetails}>
            <View style={styles.detailRow}>
              <Icon name="confirmation-number" size={20} color="#79747E" />
              <Text style={styles.detailLabel}>Cantidad de pasajes:</Text>
              <Text style={styles.detailValue}>{compra.cantidadPasajes}</Text>
            </View>

            <View style={styles.detailRow}>
              <Icon name="person" size={20} color="#79747E" />
              <Text style={styles.detailLabel}>Cliente ID:</Text>
              <Text style={styles.detailValue}>{compra.clienteId}</Text>
            </View>

            {compra.vendedorId && (
              <View style={styles.detailRow}>
                <Icon name="store" size={20} color="#79747E" />
                <Text style={styles.detailLabel}>Vendedor ID:</Text>
                <Text style={styles.detailValue}>{compra.vendedorId}</Text>
              </View>
            )}

            {compra.precioOriginal !== compra.precioActual && (
              <View style={styles.detailRow}>
                <Icon name="local-offer" size={20} color="#79747E" />
                <Text style={styles.detailLabel}>Precio original:</Text>
                <Text style={[styles.detailValue, styles.originalPrice]}>{formatCurrency(compra.precioOriginal)}</Text>
              </View>
            )}

            <View style={styles.detailRow}>
              <Icon name="attach-money" size={20} color="#4CAF50" />
              <Text style={styles.detailLabel}>Total pagado:</Text>
              <Text style={[styles.detailValue, styles.totalPrice]}>{formatCurrency(compra.precioActual)}</Text>
            </View>
          </View>
        </View>

        {/* Lista de pasajes */}
        <View style={styles.pasajesSection}>
          <Text style={styles.sectionTitle}>Pasajes ({compra.pasajes.length})</Text>
          {compra.pasajes.map((pasaje, index) => renderPasaje(pasaje, index))}
        </View>

        {/* Información adicional */}
        <View style={styles.infoCard}>
          <Icon name="info" size={24} color="#3B82F6" style={styles.infoIcon} />
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Información importante</Text>
            <Text style={styles.infoText}>
              • Presenta este comprobante al momento de abordar{"\n"}• Llega 15 minutos antes de la salida{"\n"}• En
              caso de dudas, contacta a nuestro servicio al cliente
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Botón flotante para generar PDF */}
      {canGeneratePdf(compra.estado) && (
        <TouchableOpacity
          style={[styles.floatingPdfButton, generatingPdf && styles.disabledFloatingButton]}
          onPress={handleGeneratePdf}
          disabled={generatingPdf}
        >
          {generatingPdf ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Icon name="picture-as-pdf" size={24} color="white" />
          )}
          <Text style={styles.floatingButtonText}>{generatingPdf ? "Generando..." : "Ver PDF"}</Text>
        </TouchableOpacity>
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
  headerSpacer: {
    width: 40,
  },
  pdfButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#49454F",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1C1B1F",
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    color: "#79747E",
    textAlign: "center",
    marginBottom: 16,
  },
  retryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#E8F0FE",
    borderRadius: 20,
  },
  retryButtonText: {
    color: "#3B82F6",
    fontWeight: "500",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  compraCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    borderWidth: 1,
    borderColor: "#E7E0EC",
  },
  compraHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  compraInfo: {
    flex: 1,
  },
  compraIdText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1C1B1F",
    marginBottom: 4,
  },
  compraDateText: {
    fontSize: 14,
    color: "#79747E",
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 12,
    color: "white",
    fontWeight: "600",
  },
  compraDetails: {
    gap: 12,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  detailLabel: {
    flex: 1,
    fontSize: 14,
    color: "#49454F",
  },
  detailValue: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1C1B1F",
  },
  originalPrice: {
    textDecorationLine: "line-through",
    color: "#79747E",
  },
  totalPrice: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4CAF50",
  },
  pasajesSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1C1B1F",
    marginBottom: 12,
  },
  pasajeCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    borderWidth: 1,
    borderColor: "#E7E0EC",
  },
  pasajeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  pasajeTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1C1B1F",
  },
  pasajeStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  pasajeStatusText: {
    fontSize: 11,
    color: "white",
    fontWeight: "600",
  },
  pasajeDetails: {
    gap: 12,
  },
  routeInfo: {
    backgroundColor: "#F8F9FF",
    borderRadius: 8,
    padding: 12,
  },
  routePoint: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  routeLine: {
    width: 2,
    height: 16,
    backgroundColor: "#E7E0EC",
    marginLeft: 5,
    marginVertical: 4,
  },
  routeText: {
    fontSize: 14,
    color: "#1C1B1F",
    fontWeight: "500",
  },
  pasajeInfoGrid: {
    gap: 8,
  },
  pasajeInfoItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  pasajeInfoText: {
    fontSize: 14,
    color: "#49454F",
  },
  subtotalText: {
    fontWeight: "600",
    color: "#3B82F6",
  },
  infoCard: {
    flexDirection: "row",
    backgroundColor: "#E8F0FE",
    borderRadius: 12,
    padding: 16,
    marginBottom: 80,
  },
  infoIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1C1B1F",
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: "#49454F",
    lineHeight: 20,
  },
  floatingPdfButton: {
    position: "absolute",
    bottom: 16,
    right: 16,
    left: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#3B82F6",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    gap: 8,
  },
  disabledFloatingButton: {
    backgroundColor: "#CAC4D0",
  },
  floatingButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  statusIcon: {
    marginRight: 4,
  },
})

export default PurchaseDetailScreen