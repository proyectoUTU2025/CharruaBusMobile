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
import { useUser } from "../hooks/useUser"
import {
  purchaseService,
  type CompraDto,
  type FiltroBusquedaCompraDto,
  getStatusColor,
  getStatusText,
  getStatusIcon,
} from "../services/purchaseService"
import PurchaseDetailScreen from "./PurchaseDetailScreen"

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
  const { token } = useAuth()
  const { user, loading: userLoading } = useUser()
  
  const [purchases, setPurchases] = useState<CompraDto[]>([])
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCompraId, setSelectedCompraId] = useState<number | null>(null)

  // Verificar si tenemos los datos necesarios del usuario
  const hasRequiredData = Boolean(user?.id && user?.email && token && !userLoading)

  useEffect(() => {
    console.log("🔍 Estado de autenticación:")
    console.log("👤 Usuario:", user ? `ID: ${user.id}, Email: ${user.email}` : "No disponible")
    console.log("🔑 Token:", token ? "Disponible" : "No disponible")
    console.log("⏳ Cargando usuario:", userLoading)
    console.log("✅ Datos requeridos:", hasRequiredData ? "Completos" : "Incompletos")
  }, [user, token, userLoading])

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

  // Función para cargar el historial usando los datos de useUser
  const loadPurchaseHistory = async (page = 0, refresh = false) => {
    if (!hasRequiredData) {
      console.error("❌ Faltan datos requeridos para cargar el historial")
      setError("No se pudo cargar el historial. Faltan datos de autenticación.")
      setLoading(false)
      return
    }

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
      console.log("👤 Usuario:", user!.id, user!.email)

      // Convertir user.id a number si es string (según useUser.tsx)
      const clienteId = typeof user!.id === 'string' ? parseInt(user!.id) : user!.id

      const result = await purchaseService.obtenerHistorialCompras(
        clienteId, 
        user!.email, 
        filtro, 
        pageable, 
        token!
      )

      console.log("✅ Resultado obtenido:", {
        totalElements: result.totalElements,
        contentLength: result.content?.length,
      })

      // Actualizar estado con los datos
      if (page === 0 || refresh) {
        setPurchases(result.content || [])
      } else {
        setPurchases((prev) => [...prev, ...(result.content || [])])
      }

      setCurrentPage(result.pageable?.pageNumber || 0)
      setTotalPages(result.totalPages || 0)
      setTotalElements(result.totalElements || 0)
      setHasMore(!(result.last || false))
    } catch (error: any) {
      console.error("❌ Error cargando historial:", error)
      setError(error.message || "Error cargando historial")

      if (page === 0 && !refresh) {
        Alert.alert("Error", error.message || "No se pudo cargar el historial de compras")
      }
    } finally {
      setLoading(false)
      setRefreshing(false)
      setLoadingMore(false)
    }
  }

  // Cargar datos cuando tenemos los datos necesarios
  useEffect(() => {
    if (hasRequiredData) {
      console.log("🚀 Iniciando carga de historial...")
      loadPurchaseHistory()
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

  const handlePurchasePress = (purchase: CompraDto) => {
    setSelectedCompraId(purchase.id)
  }

  const handleBackFromDetail = () => {
    setSelectedCompraId(null)
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
          <Icon name={getStatusIcon(item.estado)} size={12} color="white" style={styles.statusIcon} />
          <Text style={styles.statusText}>{getStatusText(item.estado)}</Text>
        </View>
      </View>

      <View style={styles.cardBody}>
        <View style={styles.detailRow}>
          <Icon name="attach-money" size={16} color="#79747E" />
          <Text style={styles.amountText}>{formatCurrency(item.precioActual)}</Text>
        </View>

        <View style={styles.detailRow}>
          <Icon name="confirmation-number" size={16} color="#79747E" />
          <Text style={styles.detailText}>Pasajes: {item.cantidadPasajes}</Text>
        </View>

        {item.precioOriginal !== item.precioActual && (
          <View style={styles.detailRow}>
            <Icon name="local-offer" size={16} color="#4CAF50" />
            <Text style={styles.detailText}>Precio original: {formatCurrency(item.precioOriginal)}</Text>
          </View>
        )}
      </View>

      <View style={styles.cardFooter}>
        <Text style={styles.viewDetailsText}>Ver detalles</Text>
        <Icon name="chevron-right" size={20} color="#3B82F6" />
      </View>
    </TouchableOpacity>
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
          <Text style={styles.headerTitle}>Historial de Compras</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>Cargando datos del usuario...</Text>
        </View>
      </SafeAreaView>
    )
  }

  if (!user || !token) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#3B82F6" />
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={onGoBack}>
            <Icon name="arrow-back" size={24} color="#3B82F6" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Historial de Compras</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.errorContainer}>
          <Icon name="account-circle" size={64} color="#F44336" />
          <Text style={styles.errorTitle}>Sesión requerida</Text>
          <Text style={styles.errorText}>Debes iniciar sesión para ver tu historial de compras</Text>
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
          <Text style={styles.headerTitle}>Historial de Compras</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>Cargando historial...</Text>
        </View>
      </SafeAreaView>
    )
  }

  if (selectedCompraId) {
    return <PurchaseDetailScreen compraId={selectedCompraId} onGoBack={handleBackFromDetail} />
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#3B82F6" />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onGoBack}>
          <Icon name="arrow-back" size={24} color="#3B82F6" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Historial de Compras</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.resultsInfo}>
        <Text style={styles.resultsText}>
          {totalElements} compra{totalElements !== 1 ? "s" : ""} encontrada{totalElements !== 1 ? "s" : ""}
        </Text>
      </View>

      <FlatList
        data={purchases}
        renderItem={renderPurchaseItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          error ? (
            <View style={styles.emptyContainer}>
              <Icon name="error-outline" size={64} color="#F44336" />
              <Text style={styles.emptyTitle}>Error al cargar</Text>
              <Text style={styles.emptySubtitle}>{error}</Text>
              <TouchableOpacity style={styles.retryButton} onPress={() => loadPurchaseHistory()}>
                <Text style={styles.retryButtonText}>Reintentar</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <Icon name="shopping-cart" size={64} color="#CAC4D0" />
              <Text style={styles.emptyTitle}>No hay compras</Text>
              <Text style={styles.emptySubtitle}>No se encontraron compras con los criterios seleccionados</Text>
            </View>
          )
        }
        ListFooterComponent={
          loadingMore ? (
            <View style={styles.footerLoader}>
              <ActivityIndicator size="small" color="#3B82F6" />
              <Text style={styles.footerText}>Cargando más compras...</Text>
            </View>
          ) : null
        }
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
    shadowOffset: { width: 0, height: 1 },
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
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    paddingTop: 12,
  },
  viewDetailsText: {
    fontSize: 14,
    color: "#3B82F6",
    marginRight: 4,
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
  },
  retryButtonText: {
    color: "#3B82F6",
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
  statusIcon: {
    marginRight: 4,
  },
})

export default PurchaseHistoryScreen