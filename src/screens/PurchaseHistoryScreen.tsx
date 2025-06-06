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
  FlatList,
  ActivityIndicator,
  Alert,
} from "react-native"
import Icon from "react-native-vector-icons/MaterialIcons"
import { useAuth } from "../context/AuthContext"
import { purchaseService, type CompraDto, type FiltroBusquedaCompraDto } from "../services/purchaseService"

interface PurchaseHistoryScreenProps {
  onGoBack?: () => void
  filters: {
    estados: string[]
    fechaDesde?: Date
    fechaHasta?: Date
    montoMin?: number
    montoMax?: number
  }
}

const PurchaseHistoryScreen: React.FC<PurchaseHistoryScreenProps> = ({ onGoBack, filters }) => {
  const { user, token } = useAuth()
  const [purchases, setPurchases] = useState<CompraDto[]>([])
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [loadAttempts, setLoadAttempts] = useState(0)

  // Verificar si tenemos los datos necesarios
  const hasRequiredData = user?.id && user?.email && token

  // Función para construir filtros para la API
  const buildApiFilters = (): FiltroBusquedaCompraDto => {
    const filtro: FiltroBusquedaCompraDto = {}

    if (filters.estados && filters.estados.length > 0) {
      filtro.estados = filters.estados
    }

    if (filters.fechaDesde && filters.fechaHasta) {
      filtro.fechaDesde = filters.fechaDesde.toISOString().split("T")[0]
      filtro.fechaHasta = filters.fechaHasta.toISOString().split("T")[0]
    }

    if (filters.montoMin) {
      filtro.montoMin = filters.montoMin
    }

    if (filters.montoMax) {
      filtro.montoMax = filters.montoMax
    }

    return filtro
  }

  // Función para cargar el historial de compras
  const loadPurchaseHistory = async (page = 0, refresh = false) => {
    try {
      if (refresh) {
        setRefreshing(true)
        setCurrentPage(0)
        setHasMore(true)
        setError(null)
      } else if (page === 0) {
        setLoading(true)
        setError(null)
      } else {
        setLoadingMore(true)
      }

      const filtro = buildApiFilters()
      const pageable = {
        page,
        size: 10,
        sort: "fechaCompra,desc",
      }

      console.log("🔄 Cargando historial con filtros:", filtro)
      console.log("📄 Página:", page)
      console.log("👤 Usuario:", user?.id, user?.email)
      console.log("🔢 Intento #", loadAttempts + 1)

      const result = await purchaseService.obtenerHistorialCompras(user!.id, user!.email, filtro, pageable, token)

      console.log("✅ Resultado obtenido:", {
        totalElements: result.totalElements,
        contentLength: result.content.length,
      })

      // Actualizar estado con los datos
      if (page === 0 || refresh) {
        setPurchases(result.content)
      } else {
        setPurchases((prev) => [...prev, ...result.content])
      }

      setCurrentPage(result.pageable.pageNumber)
      setTotalPages(result.totalPages)
      setTotalElements(result.totalElements)
      setHasMore(!result.last)
      setLoadAttempts(0) // Resetear contador de intentos si es exitoso
    } catch (error: any) {
      console.error("❌ Error cargando historial:", error)
      setError(error.message || "Error cargando historial")
      setLoadAttempts((prev) => prev + 1)

      // Solo mostrar alert si es el primer intento de carga
      if (page === 0 && !refresh) {
        Alert.alert("Error", error.message || "No se pudo cargar el historial de compras")
      }
    } finally {
      setLoading(false)
      setRefreshing(false)
      setLoadingMore(false)
    }
  }

  // Cargar datos cuando el componente se monta y tenemos los datos necesarios
  useEffect(() => {
    if (hasRequiredData) {
      console.log("🚀 Iniciando carga de historial...")
      loadPurchaseHistory()
    } else {
      console.log("⏳ Esperando datos del usuario...")
    }
  }, [hasRequiredData])

  // Función para refrescar datos
  const handleRefresh = () => {
    if (hasRequiredData) {
      loadPurchaseHistory(0, true)
    }
  }

  // Función para cargar más datos
  const handleLoadMore = () => {
    if (!loadingMore && hasMore && currentPage < totalPages - 1 && hasRequiredData) {
      loadPurchaseHistory(currentPage + 1)
    }
  }

  // Función para formatear fecha
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

  // Función para formatear moneda
  const formatCurrency = (amount: number) => {
    return `$${amount.toLocaleString("es-UY")}`
  }

  // Función para obtener color según estado
  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case "COMPLETADA":
      case "COMPLETED":
      case "PAGADO":
        return "#4CAF50"
      case "PENDIENTE":
      case "PENDING":
        return "#FF9800"
      case "CANCELADA":
      case "CANCELLED":
      case "CANCELADO":
        return "#F44336"
      default:
        return "#79747E"
    }
  }

  // Función para obtener texto según estado
  const getStatusText = (status: string) => {
    switch (status.toUpperCase()) {
      case "COMPLETADA":
      case "COMPLETED":
      case "PAGADO":
        return "Completada"
      case "PENDIENTE":
      case "PENDING":
        return "Pendiente"
      case "CANCELADA":
      case "CANCELLED":
      case "CANCELADO":
        return "Cancelada"
      default:
        return status
    }
  }

  // Función para manejar tap en una compra
  const handlePurchasePress = (purchase: CompraDto) => {
    Alert.alert(
      "Detalles de Compra",
      `ID: ${purchase.id}\nFecha: ${formatDate(purchase.fechaCompra)}\nTotal: ${formatCurrency(purchase.precioTotal)}\nEstado: ${getStatusText(purchase.estado)}\nPayment ID: ${purchase.paymentId}\nOrder ID: ${purchase.orderId}`,
      [{ text: "OK" }],
    )
  }

  // Renderizar item de compra
  const renderPurchaseItem = ({ item }: { item: CompraDto }) => (
    <TouchableOpacity style={styles.purchaseCard} onPress={() => handlePurchasePress(item)} activeOpacity={0.7}>
      <View style={styles.cardHeader}>
        <View style={styles.purchaseInfo}>
          <Text style={styles.purchaseIdText}>Compra #{item.id}</Text>
          <Text style={styles.dateText}>{formatDate(item.fechaCompra)}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.estado) }]}>
          <Text style={styles.statusText}>{getStatusText(item.estado)}</Text>
        </View>
      </View>

      <View style={styles.cardBody}>
        <View style={styles.detailRow}>
          <Icon name="attach-money" size={16} color="#79747E" />
          <Text style={styles.amountText}>{formatCurrency(item.precioTotal)}</Text>
        </View>
        <View style={styles.detailRow}>
          <Icon name="receipt" size={16} color="#79747E" />
          <Text style={styles.detailText}>Order: {item.orderId}</Text>
        </View>
        {item.paymentId && (
          <View style={styles.detailRow}>
            <Icon name="payment" size={16} color="#79747E" />
            <Text style={styles.detailText}>Payment: {item.paymentId}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  )

  // Renderizar estado vacío
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Icon name="shopping-cart" size={64} color="#CAC4D0" />
      <Text style={styles.emptyTitle}>No hay compras</Text>
      <Text style={styles.emptySubtitle}>No se encontraron compras con los criterios seleccionados</Text>
      <TouchableOpacity style={styles.retryButton} onPress={onGoBack}>
        <Text style={styles.retryButtonText}>Cambiar filtros</Text>
      </TouchableOpacity>
    </View>
  )

  // Renderizar estado de error
  const renderErrorState = () => (
    <View style={styles.emptyContainer}>
      <Icon name="error-outline" size={64} color="#F44336" />
      <Text style={styles.emptyTitle}>Error al cargar</Text>
      <Text style={styles.emptySubtitle}>{error}</Text>
      <TouchableOpacity style={styles.retryButton} onPress={() => loadPurchaseHistory()}>
        <Text style={styles.retryButtonText}>Reintentar</Text>
      </TouchableOpacity>
    </View>
  )

  // Renderizar footer de lista
  const renderFooter = () => {
    if (!loadingMore) return null

    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#3B82F6" />
        <Text style={styles.footerText}>Cargando más compras...</Text>
      </View>
    )
  }

  // Si no tenemos los datos necesarios, mostrar pantalla de carga
  if (!hasRequiredData) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#3B82F6" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>Cargando datos del usuario...</Text>
        </View>
      </SafeAreaView>
    )
  }

  // Renderizar pantalla de carga inicial
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#3B82F6" />

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={onGoBack}>
            <Icon name="arrow-back" size={24} color="#3B82F6" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Historial de Compras</Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>Cargando historial...</Text>

          {/* Mostrar botón de cancelar después de varios intentos */}
          {loadAttempts > 0 && (
            <TouchableOpacity style={styles.cancelButton} onPress={onGoBack}>
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
          )}
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
        <Text style={styles.headerTitle}>Historial de Compras</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Información de resultados */}
      <View style={styles.resultsInfo}>
        <Text style={styles.resultsText}>
          {totalElements} compra{totalElements !== 1 ? "s" : ""} encontrada{totalElements !== 1 ? "s" : ""}
        </Text>
      </View>

      {/* Lista de compras */}
      <FlatList
        data={purchases}
        renderItem={renderPurchaseItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={error ? renderErrorState : renderEmptyState}
        ListFooterComponent={renderFooter}
        onRefresh={handleRefresh}
        refreshing={refreshing}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFBFE",
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
    marginBottom: 20,
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
  resultsInfo: {
    backgroundColor: "#F8F9FF",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#E7E0EC",
  },
  resultsText: {
    fontSize: 14,
    color: "#49454F",
    fontStyle: "italic",
  },
  listContainer: {
    padding: 16,
    paddingBottom: 80,
    minHeight: 300,
  },
  purchaseCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    borderWidth: 1,
    borderColor: "#E7E0EC",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  purchaseInfo: {
    flex: 1,
  },
  purchaseIdText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1C1B1F",
    marginBottom: 4,
  },
  dateText: {
    fontSize: 14,
    color: "#79747E",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    color: "white",
    fontWeight: "600",
  },
  cardBody: {
    gap: 8,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  detailText: {
    fontSize: 14,
    color: "#49454F",
    marginLeft: 8,
  },
  amountText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1C1B1F",
    marginLeft: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1C1B1F",
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: "#79747E",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  retryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#E8F0FE",
    borderRadius: 20,
    marginHorizontal: 8,
  },
  retryButtonText: {
    color: "#3B82F6",
    fontWeight: "500",
  },
  cancelButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#F5F5F5",
    borderRadius: 20,
    marginTop: 16,
  },
  cancelButtonText: {
    color: "#F44336",
    fontWeight: "500",
  },
  footerLoader: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 16,
  },
  footerText: {
    marginLeft: 8,
    color: "#49454F",
  },
})

export default PurchaseHistoryScreen
