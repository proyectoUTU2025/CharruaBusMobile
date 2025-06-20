// BottomTabsNavigator.tsx - Actualizado con llamada automática al endpoint
import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  SafeAreaView, 
  StatusBar, 
  StyleSheet, 
  Modal, 
  ScrollView, 
  ActivityIndicator,
  RefreshControl,
  Dimensions,
  AppState,
  AppStateStatus
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import MainScreen from '../screens/MainScreen';
import { TripSelectionScreen } from '../screens/TripSelectionScreen';
import ChangePasswordScreen from '../screens/ChangePasswordScreen';
import PurchasesScreen from '../screens/PurchasesScreen';
import { useAuth } from '../context/AuthContext';
import { useUser } from '../hooks/useUser';
import { useNotifications } from '../context/NotificationContext';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { OneWayTripScreen } from '../screens/OneWayTripScreen';
import { RoundTripScreen } from '../screens/RoundTripScreen';
import { ViewTripsScreen } from '../screens/ViewTripsScreen';
import { SelectSeatScreen } from '../screens/SelectSeatScreen';
import { RoundTripState } from '../types/roundTripType';
import { NavigationState, ViewTripsParams, RootStackParamList } from '../types/navigationType';
import { 
  formatNotificationDate, 
  getNotificationIcon 
} from '../services/notificationApiService';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface BottomTabsNavigatorProps {
  route?: any;
}

// 🔥 Componente optimizado para el menú desplegable
const MenuDropdown = React.memo<{
  visible: boolean;
  onClose: () => void;
  user: any;
  userLoading: boolean;
  onMenuItemPress: (action: string) => void;
}>(({ visible, onClose, user, userLoading, onMenuItemPress }) => {
  const getDisplayName = useCallback((user: any) => {
    if (!user) return 'Usuario';
    if (user.name && user.apellido) return `${user.name} ${user.apellido}`;
    if (user.name) return user.name;
    return 'Usuario';
  }, []);

  const handleMenuItemPress = useCallback((action: string) => {
    onMenuItemPress(action);
  }, [onMenuItemPress]);

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity 
        style={styles.modalOverlay} 
        activeOpacity={1} 
        onPress={onClose}
      >
        <View style={styles.menuContainer}>
          <View style={styles.menuHeader}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatarPlaceholder}>
                <Icon name="person" size={24} color="#3B82F6" />
              </View>
            </View>
            <View style={styles.userInfoContainer}>
              <Text style={styles.greetingText}>
                ¡Hola, {userLoading ? 'Cargando...' : getDisplayName(user)}!
              </Text>
              <Text style={styles.userEmailText}>
                {userLoading ? '' : (user?.email || '')}
              </Text>
            </View>
          </View>

          <View style={styles.menuDivider} />

          <TouchableOpacity 
            style={styles.menuItem} 
            onPress={() => handleMenuItemPress('editProfile')}
            activeOpacity={0.7}
          >
            <Icon name="edit" size={20} color="#49454F" style={styles.menuIcon} />
            <Text style={styles.menuText}>Editar Perfil</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem} 
            onPress={() => handleMenuItemPress('changePassword')}
            activeOpacity={0.7}
          >
            <Icon name="lock" size={20} color="#49454F" style={styles.menuIcon} />
            <Text style={styles.menuText}>Cambiar Contraseña</Text>
          </TouchableOpacity>

          <View style={styles.menuDivider} />

          <TouchableOpacity 
            style={styles.menuItem} 
            onPress={() => handleMenuItemPress('logout')}
            activeOpacity={0.7}
          >
            <Icon name="logout" size={20} color="#F44336" style={styles.menuIcon} />
            <Text style={[styles.menuText, { color: '#F44336' }]}>Cerrar Sesión</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
});

// 🔥 Componente optimizado para el panel de notificaciones
const NotificationsDropdown = React.memo<{
  visible: boolean;
  onClose: () => void;
  notifications: any[];
  notificationsError: string | null;
  notificationsLoading: boolean;
  hasMoreNotifications: boolean;
  contextIsRefreshing: boolean;
  contextIsLoadingMore: boolean;
  onRefresh: () => Promise<void>;
  onLoadMore: () => Promise<void>;
  onNotificationPress: (id: number) => void;
  onMarkAllAsRead: () => void;
  unreadCount: number;
}>(({ 
  visible, 
  onClose, 
  notifications, 
  notificationsError, 
  notificationsLoading,
  hasMoreNotifications,
  contextIsRefreshing,
  contextIsLoadingMore,
  onRefresh,
  onLoadMore,
  onNotificationPress,
  onMarkAllAsRead,
  unreadCount
}) => {
  const handleRefresh = useCallback(async () => {
    try {
      await onRefresh();
    } catch (error) {
      console.error('Error refrescando notificaciones:', error);
    }
  }, [onRefresh]);

  const handleLoadMore = useCallback(async () => {
    try {
      await onLoadMore();
    } catch (error) {
      console.error('Error cargando más notificaciones:', error);
    }
  }, [onLoadMore]);

  const refreshControl = useMemo(() => (
    <RefreshControl
      refreshing={contextIsRefreshing}
      onRefresh={handleRefresh}
      colors={['#3B82F6']}
      tintColor="#3B82F6"
    />
  ), [contextIsRefreshing, handleRefresh]);

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity 
        style={styles.modalOverlay} 
        activeOpacity={1} 
        onPress={onClose}
      >
        <View style={styles.notificationsContainer}>
          <View style={styles.notificationsHeader}>
            <Text style={styles.notificationsTitle}>Notificaciones</Text>
          </View>

          <View style={styles.menuDivider} />

          {notificationsLoading && notifications.length === 0 ? (
            <View style={styles.centerLoadingContainer}>
              <ActivityIndicator size="large" color="#3B82F6" />
              <Text style={styles.loadingText}>Cargando notificaciones...</Text>
            </View>
          ) : notificationsError ? (
            <View style={styles.errorContainer}>
              <Icon name="error-outline" size={48} color="#F44336" />
              <Text style={styles.errorText}>{notificationsError}</Text>
              <TouchableOpacity 
                style={styles.retryButton}
                onPress={handleRefresh}
              >
                <Text style={styles.retryButtonText}>Reintentar</Text>
              </TouchableOpacity>
            </View>
          ) : notifications.length === 0 ? (
            <View style={styles.emptyNotifications}>
              <Icon name="notifications-none" size={48} color="#CAC4D0" />
              <Text style={styles.emptyNotificationsText}>No tienes notificaciones</Text>
            </View>
          ) : (
            <ScrollView 
              style={styles.notificationsList} 
              showsVerticalScrollIndicator={false}
              refreshControl={refreshControl}
              onScrollEndDrag={({ nativeEvent }) => {
                const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
                const paddingToBottom = 50;
                
                if (layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom) {
                  if (hasMoreNotifications && !contextIsLoadingMore) {
                    handleLoadMore();
                  }
                }
              }}
              onMomentumScrollEnd={({ nativeEvent }) => {
                const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
                const paddingToBottom = 50;
                
                if (layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom) {
                  if (hasMoreNotifications && !contextIsLoadingMore) {
                    handleLoadMore();
                  }
                }
              }}
            >
              {notifications.map((notification, index) => (
                <TouchableOpacity
                  key={notification.id}
                  style={[
                    styles.notificationItem,
                    !notification.leido && styles.unreadNotificationItem,
                    index === notifications.length - 1 && styles.lastNotificationItem
                  ]}
                  onPress={() => onNotificationPress(notification.id)}
                  activeOpacity={0.7}
                >
                  <View style={styles.notificationIconContainer}>
                    <Icon 
                      name={getNotificationIcon(notification.tipo)} 
                      size={24} 
                      color={!notification.leido ? "#3B82F6" : "#49454F"} 
                    />
                    {!notification.leido && <View style={styles.unreadDot} />}
                  </View>
                  <View style={styles.notificationContent}>
                    <Text style={[
                      styles.notificationTitle,
                      !notification.leido && styles.unreadNotificationTitle
                    ]}>
                      {notification.titulo}
                    </Text>
                    <Text style={styles.notificationMessage}>
                      {notification.mensaje}
                    </Text>
                    <Text style={styles.notificationTime}>
                      {formatNotificationDate(notification.fecha)}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
              {contextIsLoadingMore && (
                <View style={styles.loadingMoreContainer}>
                  <ActivityIndicator size="large" color="#3B82F6" />
                  <Text style={styles.loadingMoreText}>Cargando más notificaciones...</Text>
                </View>
              )}

              {!hasMoreNotifications && notifications.length > 0 && (
                <View style={styles.noMoreNotificationsContainer}>
                  <Text style={styles.noMoreNotificationsText}>No hay más notificaciones</Text>
                </View>
              )}
            </ScrollView>
          )}
        </View>
      </TouchableOpacity>
    </Modal>
  );
});

const BottomTabsNavigator: React.FC<BottomTabsNavigatorProps> = ({ route }) => {
  const initialTab = route?.params?.initialTab || 'inicio';
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { logout, token } = useAuth();
  const { user, loading: userLoading } = useUser();
  
  const [activeTab, setActiveTab] = useState(initialTab);
  const activeTabRef = useRef(activeTab);
  
  const [navigationState, setNavigationState] = useState<NavigationState>({ type: 'tab' });
  
  const [menuVisible, setMenuVisible] = useState(false);
  const [notificationsVisible, setNotificationsVisible] = useState(false);

  // Hook de notificaciones desde el contexto
  const {
    notifications,
    unreadCount,
    loading: notificationsLoading,
    error: notificationsError,
    hasMoreNotifications,
    refreshNotifications,
    loadMoreNotifications,
    markAsRead,
    refreshUnreadCount,
    isRefreshing: contextIsRefreshing,
    isLoadingMore: contextIsLoadingMore,
  } = useNotifications();

  // 🔥 NUEVO: Llamar al endpoint cuando se monta el componente y cuando vuelve del background
  useEffect(() => {
    console.log('BottomTabsNavigator montado - Actualizando conteo de notificaciones');
    refreshUnreadCount();
  }, []); // Solo al montar

  // 🔥 NUEVO: useFocusEffect para cuando la pantalla obtiene el foco
  useFocusEffect(
    useCallback(() => {
      console.log('BottomTabsNavigator obtuvo el foco - Actualizando conteo de notificaciones');
      refreshUnreadCount();
    }, [refreshUnreadCount])
  );

  // 🔥 NUEVO: Manejar cambios de AppState para detectar cuando vuelve del background
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        console.log('App volvió al primer plano - Actualizando conteo de notificaciones');
        refreshUnreadCount();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription?.remove();
    };
  }, [refreshUnreadCount]);

  useEffect(() => {
    activeTabRef.current = activeTab;
  }, [activeTab]);

  // 🔥 Funciones memoizadas para evitar re-renderizados
  const navigateToChangePassword = useCallback(() => {
    setNavigationState({ type: 'changePassword' });
    setMenuVisible(false);
  }, []);

  const navigateToTab = useCallback((tab: string) => {
    setActiveTab(tab);
    activeTabRef.current = tab;
    setNavigationState({ type: 'tab' });
  }, []);

  const navigateToOneWayTrip = useCallback(() => {
    setNavigationState({ type: 'oneWayTrip' });
  }, []);

  const navigateToRoundTrip = useCallback(() => {
    setNavigationState({ type: 'roundTrip' });
  }, []);

  const navigateToViewTrips = useCallback((params: ViewTripsParams) => {
    setNavigationState({ type: 'viewTrips', params });
  }, []);

  const navigateToSelectSeat = useCallback((params: any) => {
    setNavigationState({ type: 'selectSeat', params });
  }, []);

  const navigateToPurchaseDetail = useCallback((purchaseId: number) => {
    navigation.navigate('PurchaseDetail', { purchaseId });
  }, [navigation]);

  const handleLogout = useCallback(() => {
    logout();
  }, [logout]);

  const handleTabPress = useCallback((tab: string) => {
    navigateToTab(tab);
  }, [navigateToTab]);

  const toggleMenu = useCallback(() => {
    setMenuVisible(prev => !prev);
  }, []);

  // Manejar apertura del panel de notificaciones
  const toggleNotifications = useCallback(async () => {
    if (!notificationsVisible) {
      // Al abrir el panel, marcar todas como leídas automáticamente
      setNotificationsVisible(true);
      try {
        await markAsRead();
      } catch (error) {
        console.error('Error marcando notificaciones como leídas:', error);
      }
    } else {
      setNotificationsVisible(false);
    }
  }, [notificationsVisible, markAsRead]);

  const handleMenuItemPress = useCallback((action: string) => {
    setMenuVisible(false);
    
    if (action === 'logout') {
      handleLogout();
    } else if (action === 'changePassword') {
      navigateToChangePassword();
    }
  }, [handleLogout, navigateToChangePassword]);

  // Manejar clic en notificación
  const handleNotificationPress = useCallback((notificationId: number) => {
    const notification = notifications.find(n => n.id === notificationId);
    
    if (notification && notification.compraId) {
      // Si la notificación tiene compraId, navegar al detalle de compra
      setNotificationsVisible(false);
      navigateToPurchaseDetail(notification.compraId);
    }
  }, [notifications, navigateToPurchaseDetail]);

  const handleMarkAllAsRead = useCallback(async () => {
    try {
      // Marcar todas las notificaciones como leídas usando la función del contexto
      await markAsRead();
      setNotificationsVisible(false);
    } catch (error) {
      console.error('Error marcando todas las notificaciones como leídas:', error);
    }
  }, [markAsRead]);

  // 🔥 Función de navegación hacia atrás optimizada
  const goBack = useCallback((roundTripState?: RoundTripState) => {
    if (navigationState.type === 'changePassword') {
      setActiveTab('inicio');
      activeTabRef.current = 'inicio';
      setNavigationState({ type: 'tab' });
    } else if (navigationState.type === 'selectSeat') {
      const params = navigationState.params;
      
      if (params.tipoViaje === 'ida-vuelta' && params.roundTripState) {
        const currentRoundTripState = params.roundTripState as RoundTripState;
        
        if (currentRoundTripState.currentStep === 'select-seat-ida') {
          const resetState = {
            ...currentRoundTripState,
            currentStep: 'select-trip-ida' as const,
            viajeIda: {
              ...currentRoundTripState.viajeIda!,
              tripId: undefined,
              trip: undefined,
              asientosSeleccionados: undefined
            },
          };
          
          setNavigationState({ 
            type: 'viewTrips', 
            params: {
              origenSeleccionado: resetState.viajeIda!.origenSeleccionado,
              destinoSeleccionado: resetState.viajeIda!.destinoSeleccionado,
              fecha: resetState.viajeIda!.fecha,
              date: resetState.viajeIda!.date,
              pasajeros: resetState.viajeIda!.pasajeros,
              tipoViaje: 'ida-vuelta' as const,
              roundTripState: resetState,
            }
          });
        } else if (currentRoundTripState.currentStep === 'select-seat-vuelta') {
          const resetState = {
            ...currentRoundTripState,
            currentStep: 'select-trip-vuelta' as const,
            viajeVuelta: {
              ...currentRoundTripState.viajeVuelta!,
              tripId: undefined,
              trip: undefined,
              asientosSeleccionados: undefined
            },
          };
          
          setNavigationState({ 
            type: 'viewTrips', 
            params: {
              origenSeleccionado: resetState.viajeVuelta!.origenSeleccionado,
              destinoSeleccionado: resetState.viajeVuelta!.destinoSeleccionado,
              fecha: resetState.viajeVuelta!.fecha,
              date: resetState.viajeVuelta!.date,
              pasajeros: resetState.viajeVuelta!.pasajeros,
              tipoViaje: 'ida-vuelta' as const,
              roundTripState: resetState,
            }
          });
        }
      } else {
        setNavigationState({ 
          type: 'viewTrips', 
          params: {
            origenSeleccionado: params.origenSeleccionado,
            destinoSeleccionado: params.destinoSeleccionado,
            fecha: params.fecha,
            date: params.date || params.fecha,
            pasajeros: params.pasajeros,
            tipoViaje: 'ida' as const,
          }
        });
      }
      
    } else if (navigationState.type === 'viewTrips') {
      const params = navigationState.params;
      
      if (!roundTripState && params.tipoViaje === 'ida-vuelta') {
        setNavigationState({ type: 'roundTrip' });
        return;
      }
      
      if (roundTripState) {
        if (roundTripState.currentStep === 'select-seat-ida') {
          setNavigationState({ 
            type: 'selectSeat', 
            params: {
              tripId: roundTripState.viajeIda!.tripId!,
              origenSeleccionado: roundTripState.viajeIda!.origenSeleccionado,
              destinoSeleccionado: roundTripState.viajeIda!.destinoSeleccionado,
              fecha: roundTripState.viajeIda!.fecha,
              pasajeros: roundTripState.viajeIda!.pasajeros,
              trip: roundTripState.viajeIda!.trip,
              tipoViaje: 'ida-vuelta' as const,
              roundTripState: roundTripState,
            }
          });
          return;
        }
        
        if (roundTripState.currentStep === 'select-trip-ida') {
          setNavigationState({ type: 'roundTrip' });
          return;
        }
      }
      
      if (params.tipoViaje === 'ida-vuelta' && params.roundTripState) {
        const currentRoundTripState = params.roundTripState as RoundTripState;
        
        if (currentRoundTripState.currentStep === 'select-trip-ida') {
          setNavigationState({ type: 'roundTrip' });
        } else if (currentRoundTripState.currentStep === 'select-trip-vuelta') {
          const resetState = {
            ...currentRoundTripState,
            currentStep: 'select-seat-ida' as const,
            viajeVuelta: {
              ...currentRoundTripState.viajeVuelta!,
              tripId: undefined,
              trip: undefined,
              asientosSeleccionados: undefined
            }
          };
          
          setNavigationState({ 
            type: 'selectSeat', 
            params: {
              tripId: resetState.viajeIda!.tripId!,
              origenSeleccionado: resetState.viajeIda!.origenSeleccionado,
              destinoSeleccionado: resetState.viajeIda!.destinoSeleccionado,
              fecha: resetState.viajeIda!.fecha,
              pasajeros: resetState.viajeIda!.pasajeros,
              trip: resetState.viajeIda!.trip,
              tipoViaje: 'ida-vuelta' as const,
              roundTripState: resetState,
            }
          });
        }
      } else {
        setNavigationState({ type: 'oneWayTrip' });
      }
      
    } else if (navigationState.type === 'oneWayTrip' || navigationState.type === 'roundTrip') {
      setActiveTab('viajes');
      activeTabRef.current = 'viajes';
      setNavigationState({ type: 'tab' });
    }
  }, [navigationState]);

  // 🔥 Contenido renderizado con memoización
  const renderContent = useMemo(() => {
    switch (navigationState.type) {
      case 'changePassword':
        return (
          <ChangePasswordScreen 
            onGoBack={goBack}
            onSuccess={() => {
              setActiveTab('inicio');
              activeTabRef.current = 'inicio';
              setNavigationState({ type: 'tab' });
            }}
            token={token || ''}
          />
        );
      case 'viewTrips':
        return (
          <ViewTripsScreen 
            route={{ params: navigationState.params }}
            navigation={{ 
              goBack, 
              navigate: navigateToSelectSeat
            }}
            onGoBack={goBack}
          />
        );
      case 'oneWayTrip':
        return (
          <OneWayTripScreen 
            onGoBack={goBack}
            onNavigateToViewTrips={navigateToViewTrips}
          />
        );
      case 'roundTrip':
        return (
          <RoundTripScreen 
            onVolver={goBack}
            onNavigateToViewTrips={navigateToViewTrips}
          />
        );
      case 'selectSeat':
        return (
          <SelectSeatScreen 
            route={{ 
              params: {
                ...navigationState.params,
                onWentToPayment: () => {
                  if (navigationState.type === 'selectSeat') {
                    const updatedParams = {
                      ...navigationState.params,
                      wentToPayment: true
                    };
                    
                    setNavigationState({
                      ...navigationState,
                      params: updatedParams
                    });
                  }
                }
              }
            }}
            navigation={{ 
              goBack,
              navigate: navigateToViewTrips
            }}
          />
        );
      case 'tab':
        switch (activeTab) {
          case "inicio":
            return <MainScreen />;
          case "viajes":
            return (
              <TripSelectionScreen 
                activeTab={activeTab}
                onTabPress={handleTabPress}
                onNavigateToOneWay={navigateToOneWayTrip}
                onNavigateToRoundTrip={navigateToRoundTrip}
              />
            );
          case "compras":
            return (
              <PurchasesScreen 
                onNavigateToPurchaseDetail={navigateToPurchaseDetail}
              />
            );
          default:
            return <MainScreen />;
        }
      default:
        return <MainScreen />;
    }
  }, [
    navigationState, 
    activeTab, 
    token, 
    goBack, 
    navigateToSelectSeat, 
    navigateToViewTrips, 
    handleTabPress, 
    navigateToOneWayTrip, 
    navigateToRoundTrip, 
    navigateToPurchaseDetail
  ]);

  // 🔥 Determinar el tab activo CORREGIDO
  const getCurrentActiveTab = useCallback(() => {
    if (navigationState.type === 'tab') {
      return activeTab; // Usar directamente activeTab en lugar de activeTabRef.current
    }
    return 'viajes';
  }, [navigationState.type, activeTab]);

  const currentActiveTab = getCurrentActiveTab();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#3B82F6" />

      {/* Barra Superior */}
      <View style={styles.topAppBar}>
        <TouchableOpacity 
          style={styles.menuButton} 
          onPress={toggleMenu} 
          activeOpacity={0.7}
        >
          <Icon name="menu" size={24} color="white" />
        </TouchableOpacity>

        <View style={styles.titleContainer} />

        <TouchableOpacity 
          style={styles.notificationButton} 
          onPress={toggleNotifications} 
          activeOpacity={0.7}
        >
          <Icon name="notifications" size={24} color="white" />
          {unreadCount > 0 && (
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationBadgeText}>
                {unreadCount > 9 ? '9+' : unreadCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Contenido Principal */}
      <View style={styles.mainContent}>{renderContent}</View>

      {/* Barra Inferior de Navegación */}
      <View style={styles.navigationBar}>
        <TouchableOpacity
          key={`inicio-${currentActiveTab === "inicio"}`}
          style={styles.navigationItem}
          onPress={() => handleTabPress("inicio")}
          activeOpacity={0.7}
        >
          <View style={[
            styles.navigationIndicator, 
            currentActiveTab === "inicio" && styles.activeNavigationIndicator
          ]}>
            <Icon name="home" size={24} color={currentActiveTab === "inicio" ? "#3B82F6" : "#49454F"} />
          </View>
          <Text style={[
            styles.navigationLabel, 
            currentActiveTab === "inicio" && styles.activeNavigationLabel
          ]}>
            Inicio
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          key={`viajes-${currentActiveTab === "viajes"}`}
          style={styles.navigationItem}
          onPress={() => handleTabPress("viajes")}
          activeOpacity={0.7}
        >
          <View style={[
            styles.navigationIndicator, 
            currentActiveTab === "viajes" && styles.activeNavigationIndicator
          ]}>
            <Icon name="search" size={24} color={currentActiveTab === "viajes" ? "#3B82F6" : "#49454F"} />
          </View>
          <Text style={[
            styles.navigationLabel, 
            currentActiveTab === "viajes" && styles.activeNavigationLabel
          ]}>
            Viajes
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          key={`compras-${currentActiveTab === "compras"}`}
          style={styles.navigationItem}
          onPress={() => handleTabPress("compras")}
          activeOpacity={0.7}
        >
          <View style={[
            styles.navigationIndicator, 
            currentActiveTab === "compras" && styles.activeNavigationIndicator
          ]}>
            <Icon name="shopping-cart" size={24} color={currentActiveTab === "compras" ? "#3B82F6" : "#49454F"} />
          </View>
          <Text style={[
            styles.navigationLabel, 
            currentActiveTab === "compras" && styles.activeNavigationLabel
          ]}>
            Mis Compras
          </Text>
        </TouchableOpacity>
      </View>

      {/* Menús Desplegables Optimizados */}
      <MenuDropdown 
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
        user={user}
        userLoading={userLoading}
        onMenuItemPress={handleMenuItemPress}
      />
      
      <NotificationsDropdown 
        visible={notificationsVisible}
        onClose={() => setNotificationsVisible(false)}
        notifications={notifications}
        notificationsError={notificationsError}
        notificationsLoading={notificationsLoading}
        hasMoreNotifications={hasMoreNotifications}
        contextIsRefreshing={contextIsRefreshing}
        contextIsLoadingMore={contextIsLoadingMore}
        onRefresh={refreshNotifications}
        onLoadMore={loadMoreNotifications}
        onNotificationPress={handleNotificationPress}
        onMarkAllAsRead={handleMarkAllAsRead}
        unreadCount={unreadCount}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  topAppBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#3B82F6',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  menuButton: {
    padding: 8,
  },
  titleContainer: {
    flex: 1,
  },
  notificationButton: {
    padding: 8,
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#F44336',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  mainContent: {
    flex: 1,
  },
  navigationBar: {
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  navigationItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  navigationIndicator: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 16,
    minHeight: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  activeNavigationIndicator: {
    backgroundColor: '#E0F2FE',
    borderRadius: 16,
  },
  navigationLabel: {
    fontSize: 12,
    color: '#49454F',
    marginTop: 4,
  },
  activeNavigationLabel: {
    color: '#3B82F6',
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-start',
    paddingTop: 60,
  },
  menuContainer: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 12,
    padding: 16,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  menuHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E0F2FE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInfoContainer: {
    flex: 1,
  },
  greetingText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  userEmailText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  menuDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  menuIcon: {
    marginRight: 16,
  },
  menuText: {
    fontSize: 16,
    color: '#49454F',
  },
  notificationsContainer: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 12,
    maxHeight: 400,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  notificationsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  notificationsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  centerLoadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
    minHeight: 200,
  },
  loadingText: {
    fontSize: 14,
    color: '#49454F',
    marginTop: 16,
    fontWeight: '400',
  },
  notificationsList: {
    maxHeight: 300,
    paddingBottom: 0, // Asegurar que no hay padding al final
  },
  notificationItem: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  unreadNotificationItem: {
    backgroundColor: '#F0F9FF',
  },
  notificationIconContainer: {
    position: 'relative',
    marginRight: 12,
    padding: 8,
  },
  unreadDot: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3B82F6',
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    color: '#1F2937',
    marginBottom: 4,
  },
  unreadNotificationTitle: {
    fontWeight: 'bold',
  },
  notificationMessage: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  notificationTime: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  emptyNotifications: {
    alignItems: 'center',
    padding: 32,
  },
  emptyNotificationsText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 16,
  },
  errorContainer: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
    minHeight: 240,
    justifyContent: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#F44336',
    marginTop: 16,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
    fontWeight: '400',
  },
  retryButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 1,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.1,
  },
  loadMoreContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  loadMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3B82F6', // Azul sólido como en la segunda imagen
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 8, // Bordes menos redondeados
    minHeight: 48,
    borderWidth: 1,
    borderColor: '#3B82F6',
  },
  loadMoreButtonDisabled: {
    backgroundColor: '#93C5FD', // Azul más claro cuando está deshabilitado
    borderColor: '#93C5FD',
  },
  loadMoreText: {
    color: 'white', // Texto blanco sobre fondo azul
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
    letterSpacing: 0.1,
  },
  loadMoreLoadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadMoreLoadingText: {
    color: 'white', // Texto blanco para el loading también
    fontSize: 14,
    fontWeight: '400',
    marginLeft: 12,
  },
  noMoreNotificationsContainer: {
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: 'center',
    backgroundColor: 'white',
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  noMoreNotificationsText: {
    fontSize: 14,
    color: '#6B7280',
    fontStyle: 'italic',
  },
  lastNotificationItem: {
    borderBottomWidth: 0,
  },
  loadingMoreContainer: {
    paddingVertical: 20,
    alignItems: 'center',
    backgroundColor: 'white',
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  loadingMoreText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
    fontStyle: 'italic',
  },
});

export default BottomTabsNavigator;