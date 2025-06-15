"use client"

import { useState, useEffect } from "react"
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Modal,
  ScrollView,
  Platform,
} from "react-native"
import Icon from "react-native-vector-icons/MaterialIcons"

// ✅ CORREGIDO: Importaciones actualizadas - cambiar a importaciones por defecto
import MainScreen from "../screens/MainScreen"
import ProfileScreen from "../screens/ProfileScreen"
import NewPasswordScreen from "../screens/NewPasswordScreen"
import TripSelectionScreen from "../screens/TripSelectionScreen"
import OneWayTripScreen from "../screens/OneWayTripScreen"
import ViewTripsScreen from "../screens/ViewTripsScreen"
import SelectSeatScreen from "../screens/SelectSeatScreen"
import HistorySelectionScreen from "../screens/HistorySelectionScreen"
import PurchaseHistoryScreen from "../screens/PurchaseHistoryScreen"
import PurchaseHistoryFiltersScreen from "../screens/PurchaseHistoryFiltersScreen"
// ✅ NUEVO: Importaciones para historial de pasajes
import TicketHistoryScreen from "../screens/TicketHistoryScreen"
import TicketHistoryFiltersScreen from "../screens/TicketHistoryFiltersScreen"

// Importaciones de contextos y hooks
import { useAuth } from "../context/AuthContext"
import { useUser } from "../hooks/useUser"
import { useNavigation } from "@react-navigation/native"
import type { NativeStackNavigationProp } from "@react-navigation/native-stack"
import type { RootStackParamList } from "../navigation/AppNavigator"

// Tipos combinados para los diferentes estados de navegación
type NavigationState =
  | { type: "tab"; activeTab: string }
  | { type: "oneWayTrip" }
  | { type: "viewTrips"; params: ViewTripsParams }
  | { type: "selectSeat"; params: any }

interface ViewTripsParams {
  origenSeleccionado: any
  destinoSeleccionado: any
  fecha: string
  date: string
  pasajeros: string
}

const APP_BAR_COLOR = "#3B82F6" // Color azul de la barra de la app

const BottomTabsNavigator = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>()
  const { logout } = useAuth()
  const { user, loading } = useUser()

  // Configurar la barra de estado al montar el componente
  useEffect(() => {
    StatusBar.setBackgroundColor(APP_BAR_COLOR)
    StatusBar.setBarStyle("light-content")
  }, [])

  // Estados de navegación combinados
  const [navigationState, setNavigationState] = useState<NavigationState>({
    type: "tab",
    activeTab: "inicio",
  })

  const [menuVisible, setMenuVisible] = useState(false)
  const [notificationsVisible, setNotificationsVisible] = useState(false)

  // ✅ ACTUALIZADO: Estados para el historial con soporte para pasajes
  const [historyView, setHistoryView] = useState<
    "selection" | "purchaseFilters" | "purchases" | "ticketFilters" | "tickets"
  >("selection")
  const [purchaseFilters, setPurchaseFilters] = useState({
    estados: [],
    fechaDesde: undefined,
    fechaHasta: undefined,
    montoMin: undefined,
    montoMax: undefined,
  })
  // ✅ NUEVO: Estados para filtros de pasajes
  const [ticketFilters, setTicketFilters] = useState({
    estados: [],
    fechaDesde: undefined,
    fechaHasta: undefined,
    origenId: undefined,
    destinoId: undefined,
  })

  // Datos de ejemplo para las notificaciones
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: "Nuevo viaje disponible",
      message: "Hay un nuevo viaje a Montevideo disponible",
      time: "Hace 5 min",
      read: false,
      icon: "directions-bus",
    },
    {
      id: 2,
      title: "Confirmación de compra",
      message: "Tu boleto ha sido confirmado exitosamente",
      time: "Hace 1 hora",
      read: false,
      icon: "check-circle",
    },
    {
      id: 3,
      title: "Recordatorio de viaje",
      message: "Tu viaje sale en 2 horas",
      time: "Hace 2 horas",
      read: true,
      icon: "schedule",
    },
    {
      id: 4,
      title: "Oferta especial",
      message: "25% de descuento en viajes nocturnos",
      time: "Ayer",
      read: true,
      icon: "local-offer",
    },
  ])

  // Funciones de navegación para viajes
  const navigateToTab = (tab: string) => {
    console.log("Navegando a tab:", tab)
    setNavigationState({ type: "tab", activeTab: tab })
  }

  const navigateToOneWayTrip = () => {
    console.log("Navegando a OneWayTrip")
    setNavigationState({ type: "oneWayTrip" })
  }

  const navigateToViewTrips = (params: ViewTripsParams) => {
    console.log("Navegando a ViewTrips con params:", params)
    setNavigationState({ type: "viewTrips", params })
  }

  const navigateToSelectSeat = (params: any) => {
    console.log("=== navigateToSelectSeat called ===")
    console.log("Params received:", params)
    setNavigationState({ type: "selectSeat", params })
    console.log("Navigation state updated to selectSeat")
  }

  // Función para volver desde cualquier pantalla
  const goBack = () => {
    console.log("goBack llamado desde:", navigationState.type)
    if (navigationState.type === "selectSeat") {
      setNavigationState({ type: "oneWayTrip" })
    } else if (navigationState.type === "viewTrips") {
      setNavigationState({ type: "oneWayTrip" })
    } else if (navigationState.type === "oneWayTrip") {
      setNavigationState({ type: "tab", activeTab: "viajes" })
    }
  }

  // ✅ ACTUALIZADO: Funciones para el historial con soporte para pasajes
  const handleHistoryNavigation = (type: "purchases" | "tickets") => {
    console.log("Navegación de historial:", type)
    if (type === "purchases") {
      setHistoryView("purchaseFilters")
    } else if (type === "tickets") {
      setHistoryView("ticketFilters")
    }
  }

  const handlePurchaseFiltersApplied = (filters: any) => {
    console.log("Filtros de compras aplicados:", filters)
    setPurchaseFilters(filters)
    setHistoryView("purchases")
  }

  // ✅ NUEVO: Función para aplicar filtros de pasajes
  const handleTicketFiltersApplied = (filters: any) => {
    console.log("Filtros de pasajes aplicados:", filters)
    setTicketFilters(filters)
    setHistoryView("tickets")
  }

  const handleHistoryGoBack = () => {
    console.log("Historial goBack desde:", historyView)
    switch (historyView) {
      case "purchases":
        setHistoryView("purchaseFilters")
        break
      case "purchaseFilters":
        setHistoryView("selection")
        setPurchaseFilters({
          estados: [],
          fechaDesde: undefined,
          fechaHasta: undefined,
          montoMin: undefined,
          montoMax: undefined,
        })
        break
      case "tickets":
        setHistoryView("ticketFilters")
        break
      case "ticketFilters":
        setHistoryView("selection")
        setTicketFilters({
          estados: [],
          fechaDesde: undefined,
          fechaHasta: undefined,
          origenId: undefined,
          destinoId: undefined,
        })
        break
      default:
        setHistoryView("selection")
        break
    }
  }

  const handleLogout = () => {
    console.log("Cerrando sesión")
    logout()
  }

  const handleTabPress = (tab: string) => {
    console.log("Tab presionado:", tab)
    navigateToTab(tab)

    // Resetear vista de historial cuando se cambia de pestaña
    if (tab !== "historial") {
      setHistoryView("selection")
      setPurchaseFilters({
        estados: [],
        fechaDesde: undefined,
        fechaHasta: undefined,
        montoMin: undefined,
        montoMax: undefined,
      })
      setTicketFilters({
        estados: [],
        fechaDesde: undefined,
        fechaHasta: undefined,
        origenId: undefined,
        destinoId: undefined,
      })
    }

    if (tab === "historial") {
      console.log("Navegando a historial")
    }
  }

  const toggleMenu = () => {
    setMenuVisible(!menuVisible)
  }

  const toggleNotifications = () => {
    setNotificationsVisible(!notificationsVisible)
  }

  const handleMenuItemPress = (action: string) => {
    setMenuVisible(false)

    switch (action) {
      case "editProfile":
        console.log("Ir a editar perfil")
        navigateToTab("profile")
        break
      case "changePassword":
        console.log("Ir a cambiar contraseña")
        navigateToTab("changePassword")
        break
      case "logout":
        handleLogout()
        break
      default:
        break
    }
  }

  const handleNotificationPress = (notificationId: number) => {
    setNotifications((prev) =>
      prev.map((notification) => (notification.id === notificationId ? { ...notification, read: true } : notification)),
    )
    console.log("Notificación presionada:", notificationId)
  }

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((notification) => ({ ...notification, read: true })))
    setNotificationsVisible(false)
  }

  const getUnreadNotificationsCount = () => {
    return notifications.filter((notification) => !notification.read).length
  }

  const getDisplayName = (user: any) => {
    if (!user) return "Usuario"

    if (user.name && user.apellido) {
      return `${user.name} ${user.apellido}`
    }

    if (user.name) {
      return user.name
    }

    return "Usuario"
  }

  // Función para obtener el tab activo actual
  const getCurrentActiveTab = () => {
    if (navigationState.type === "tab") {
      return navigationState.activeTab
    }
    // Si estamos en OneWayTrip, ViewTrips o SelectSeat, consideramos que estamos en viajes
    return "viajes"
  }

  // Función para determinar si mostrar la barra de navegación inferior
  const shouldShowBottomNavigation = () => {
    return true
  }

  // ✅ ACTUALIZADO: Función de renderizado con soporte para historial de pasajes
  const renderContent = () => {
    console.log("=== renderContent called ===")
    console.log("Current navigation state:", navigationState)

    switch (navigationState.type) {
      case "viewTrips":
        return (
          <ViewTripsScreen
            route={{ params: navigationState.params }}
            navigation={{
              goBack,
              navigate: navigateToSelectSeat,
            }}
            onGoBack={goBack}
          />
        )
      case "oneWayTrip":
        return <OneWayTripScreen onGoBack={goBack} onNavigateToViewTrips={navigateToViewTrips} />
      case "selectSeat":
        console.log("Rendering SelectSeatScreen")
        return <SelectSeatScreen route={{ params: navigationState.params }} navigation={{ goBack }} />
      case "tab":
        switch (navigationState.activeTab) {
          case "inicio":
            return <MainScreen />
          case "profile":
            return <ProfileScreen />
          case "changePassword":
            return <NewPasswordScreen />
          case "viajes":
            return (
              <TripSelectionScreen
                activeTab={navigationState.activeTab}
                onTabPress={handleTabPress}
                onNavigateToOneWay={navigateToOneWayTrip}
                onNavigateToRoundTrip={() => console.log("RoundTrip pendiente")}
              />
            )
          case "historial":
            switch (historyView) {
              case "selection":
                return <HistorySelectionScreen onNavigateToHistory={handleHistoryNavigation} />
              case "purchaseFilters":
                return (
                  <PurchaseHistoryFiltersScreen
                    onGoBack={handleHistoryGoBack}
                    onApplyFilters={handlePurchaseFiltersApplied}
                  />
                )
              case "purchases":
                return <PurchaseHistoryScreen onGoBack={handleHistoryGoBack} filters={purchaseFilters} />
              case "ticketFilters":
                return (
                  <TicketHistoryFiltersScreen
                    onGoBack={handleHistoryGoBack}
                    onApplyFilters={handleTicketFiltersApplied}
                  />
                )
              case "tickets":
                return <TicketHistoryScreen onGoBack={handleHistoryGoBack} filters={ticketFilters} />
              default:
                return <HistorySelectionScreen onNavigateToHistory={handleHistoryNavigation} />
            }
          default:
            return <MainScreen />
        }
      default:
        return <MainScreen />
    }
  }

  const MenuDropdown = () => (
    <Modal visible={menuVisible} transparent={true} animationType="fade" onRequestClose={() => setMenuVisible(false)}>
      <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setMenuVisible(false)}>
        <View style={styles.menuContainer}>
          <View style={styles.menuHeader}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatarPlaceholder}>
                <Icon name="person" size={24} color="#3B82F6" />
              </View>
            </View>
            <View style={styles.userInfoContainer}>
              <Text style={styles.greetingText}>¡Hola, {loading ? "Cargando..." : getDisplayName(user)}!</Text>
              <Text style={styles.userEmailText}>{loading ? "" : user?.email || ""}</Text>
            </View>
          </View>

          <View style={styles.menuDivider} />

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => handleMenuItemPress("editProfile")}
            activeOpacity={0.7}
          >
            <Icon name="edit" size={20} color="#49454F" style={styles.menuIcon} />
            <Text style={styles.menuText}>Editar Perfil</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => handleMenuItemPress("changePassword")}
            activeOpacity={0.7}
          >
            <Icon name="lock" size={20} color="#49454F" style={styles.menuIcon} />
            <Text style={styles.menuText}>Cambiar Contraseña</Text>
          </TouchableOpacity>

          <View style={styles.menuDivider} />

          <TouchableOpacity style={styles.menuItem} onPress={() => handleMenuItemPress("logout")} activeOpacity={0.7}>
            <Icon name="logout" size={20} color="#F44336" style={styles.menuIcon} />
            <Text style={[styles.menuText, { color: "#F44336" }]}>Cerrar Sesión</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  )

  const NotificationsDropdown = () => (
    <Modal
      visible={notificationsVisible}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setNotificationsVisible(false)}
    >
      <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setNotificationsVisible(false)}>
        <View style={styles.notificationsContainer}>
          <View style={styles.notificationsHeader}>
            <Text style={styles.notificationsTitle}>Notificaciones</Text>
            {getUnreadNotificationsCount() > 0 && (
              <TouchableOpacity onPress={markAllNotificationsAsRead} style={styles.markAllReadButton}>
                <Text style={styles.markAllReadText}>Marcar todas como leídas</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.menuDivider} />

          <ScrollView style={styles.notificationsList} showsVerticalScrollIndicator={false}>
            {notifications.length === 0 ? (
              <View style={styles.emptyNotifications}>
                <Icon name="notifications-none" size={48} color="#CAC4D0" />
                <Text style={styles.emptyNotificationsText}>No tienes notificaciones</Text>
              </View>
            ) : (
              notifications.map((notification) => (
                <TouchableOpacity
                  key={notification.id}
                  style={[styles.notificationItem, !notification.read && styles.unreadNotificationItem]}
                  onPress={() => handleNotificationPress(notification.id)}
                  activeOpacity={0.7}
                >
                  <View style={styles.notificationIconContainer}>
                    <Icon name={notification.icon} size={24} color={!notification.read ? "#3B82F6" : "#49454F"} />
                    {!notification.read && <View style={styles.unreadDot} />}
                  </View>
                  <View style={styles.notificationContent}>
                    <Text style={[styles.notificationTitle, !notification.read && styles.unreadNotificationTitle]}>
                      {notification.title}
                    </Text>
                    <Text style={styles.notificationMessage}>{notification.message}</Text>
                    <Text style={styles.notificationTime}>{notification.time}</Text>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        </View>
      </TouchableOpacity>
    </Modal>
  )

  const currentActiveTab = getCurrentActiveTab()

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={APP_BAR_COLOR} translucent={false} />

      {/* Barra Superior */}
      <View style={styles.topAppBar}>
        <TouchableOpacity style={styles.menuButton} onPress={toggleMenu} activeOpacity={0.7}>
          <Icon name="menu" size={24} color="white" />
        </TouchableOpacity>

        <View style={styles.titleContainer} />

        <TouchableOpacity style={styles.notificationButton} onPress={toggleNotifications} activeOpacity={0.7}>
          <Icon name="notifications" size={24} color="white" />
          {getUnreadNotificationsCount() > 0 && (
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationBadgeText}>
                {getUnreadNotificationsCount() > 9 ? "9+" : getUnreadNotificationsCount()}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Contenido Principal */}
      <SafeAreaView style={styles.mainContent}>{renderContent()}</SafeAreaView>

      {/* Barra Inferior de Navegación */}
      {shouldShowBottomNavigation() && (
        <View style={styles.navigationBar}>
          <TouchableOpacity
            style={[styles.navigationItem, currentActiveTab === "inicio" && styles.activeNavigationItem]}
            onPress={() => handleTabPress("inicio")}
            activeOpacity={0.7}
          >
            <View
              style={[styles.navigationIndicator, currentActiveTab === "inicio" && styles.activeNavigationIndicator]}
            >
              <Icon name="home" size={24} color={currentActiveTab === "inicio" ? "#3B82F6" : "#49454F"} />
            </View>
            <Text style={[styles.navigationLabel, currentActiveTab === "inicio" && styles.activeNavigationLabel]}>
              Inicio
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.navigationItem, currentActiveTab === "viajes" && styles.activeNavigationItem]}
            onPress={() => handleTabPress("viajes")}
            activeOpacity={0.7}
          >
            <View
              style={[styles.navigationIndicator, currentActiveTab === "viajes" && styles.activeNavigationIndicator]}
            >
              <Icon name="search" size={24} color={currentActiveTab === "viajes" ? "#3B82F6" : "#49454F"} />
            </View>
            <Text style={[styles.navigationLabel, currentActiveTab === "viajes" && styles.activeNavigationLabel]}>
              Viajes
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.navigationItem, currentActiveTab === "historial" && styles.activeNavigationItem]}
            onPress={() => handleTabPress("historial")}
            activeOpacity={0.7}
          >
            <View
              style={[styles.navigationIndicator, currentActiveTab === "historial" && styles.activeNavigationIndicator]}
            >
              <Icon name="history" size={24} color={currentActiveTab === "historial" ? "#3B82F6" : "#49454F"} />
            </View>
            <Text style={[styles.navigationLabel, currentActiveTab === "historial" && styles.activeNavigationLabel]}>
              Historial
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Menús Desplegables */}
      <MenuDropdown />
      <NotificationsDropdown />
    </View>
  )
}

// Los estilos permanecen iguales...
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  topAppBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: APP_BAR_COLOR,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    paddingTop: Platform.OS === "android" ? (StatusBar.currentHeight || 0) + 12 : 12,
  },
  menuButton: {
    padding: 8,
  },
  titleContainer: {
    flex: 1,
  },
  notificationButton: {
    padding: 8,
    position: "relative",
  },
  notificationBadge: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: "#F44336",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  notificationBadgeText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  mainContent: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  navigationBar: {
    flexDirection: "row",
    backgroundColor: "white",
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  navigationItem: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 8,
  },
  activeNavigationItem: {},
  navigationIndicator: {
    padding: 8,
    borderRadius: 16,
  },
  activeNavigationIndicator: {
    backgroundColor: "#E0F2FE",
  },
  navigationLabel: {
    fontSize: 12,
    color: "#49454F",
    marginTop: 4,
  },
  activeNavigationLabel: {
    color: "#3B82F6",
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-start",
    paddingTop: Platform.OS === "android" ? (StatusBar.currentHeight || 0) + 60 : 60,
  },
  menuContainer: {
    backgroundColor: "white",
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 12,
    padding: 16,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  menuHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#E0F2FE",
    justifyContent: "center",
    alignItems: "center",
  },
  userInfoContainer: {
    flex: 1,
  },
  greetingText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1F2937",
  },
  userEmailText: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 2,
  },
  menuDivider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: 8,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  menuIcon: {
    marginRight: 16,
  },
  menuText: {
    fontSize: 16,
    color: "#49454F",
  },
  notificationsContainer: {
    backgroundColor: "white",
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 12,
    maxHeight: 400,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  notificationsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  notificationsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
  },
  markAllReadButton: {
    padding: 8,
  },
  markAllReadText: {
    fontSize: 14,
    color: "#3B82F6",
  },
  notificationsList: {
    maxHeight: 300,
  },
  notificationItem: {
    flexDirection: "row",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  unreadNotificationItem: {
    backgroundColor: "#F0F9FF",
  },
  notificationIconContainer: {
    position: "relative",
    marginRight: 12,
    padding: 8,
  },
  unreadDot: {
    position: "absolute",
    top: 4,
    right: 4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#3B82F6",
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    color: "#1F2937",
    marginBottom: 4,
  },
  unreadNotificationTitle: {
    fontWeight: "bold",
  },
  notificationMessage: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 4,
  },
  notificationTime: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  emptyNotifications: {
    alignItems: "center",
    padding: 32,
  },
  emptyNotificationsText: {
    fontSize: 16,
    color: "#6B7280",
    marginTop: 16,
  },
})

export default BottomTabsNavigator
