import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  SafeAreaView, 
  StatusBar,
  Modal, 
  ScrollView, 
  ActivityIndicator,
  RefreshControl,
  Dimensions,
  AppState,
  AppStateStatus
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import MainScreen from '../screens/MainScreen/MainScreen';
import { TripSelectionScreen } from '../screens/TripSelectionScreen/TripSelectionScreen';
import ChangePasswordScreen from '../screens/ChangePasswordScreen/ChangePasswordScreen';
import PurchasesScreen from '../screens/PurchasesScreen/PurchasesScreen';
import TicketsScreen from '../screens/TicketsScreen/TicketsScreen';
import { useAuth } from '../context/AuthContext';
import { useUser } from '../hooks/useUser';
import { useNotifications } from '../context/NotificationContext';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { OneWayTripScreen } from '../screens/OneWayTripScreen/OneWayTripScreen';
import { RoundTripScreen } from '../screens/RoundTripScreen/RoundTripScreen';
import { ViewTripsScreen } from '../screens/ViewTripsScreen/ViewTripsScreen';
import { SelectSeatScreen } from '../screens/SelectSeatScreen/SelectSeatScreen';
import { RoundTripState } from '../types/roundTripType';
import EditProfileScreen from '../screens/EditProfileScreen/EditProfileScreen';
import { NavigationState, ViewTripsParams, RootStackParamList } from '../types/navigationType';
import { 
  formatNotificationDate, 
  getNotificationIcon 
} from '../services/notificationApiService';
import { styles } from './BottomTabsNavigator.styles';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface BottomTabsNavigatorProps {
  route?: any;
}

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
            {notifications.filter((notification, index, self) => 
              index === self.findIndex(n => n.id === notification.id)
            ).map((notification) => (
              <TouchableOpacity
                key={`notification-${notification.id}`}
                style={[
                  styles.notificationItem,
                  !notification.leido && styles.unreadNotificationItem,
                  notification === notifications[notifications.length - 1] && styles.lastNotificationItem
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
              <View style={styles.loadingMoreContainer} key="loading-more">
                <ActivityIndicator size="large" color="#3B82F6" />
                <Text style={styles.loadingMoreText}>Cargando más notificaciones...</Text>
              </View>
            )}

            {!hasMoreNotifications && notifications.length > 0 && (
              <View style={styles.noMoreNotificationsContainer} key="no-more">
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
    clearNotifications,
    isRefreshing: contextIsRefreshing,
    isLoadingMore: contextIsLoadingMore,
  } = useNotifications();

  useEffect(() => {
    if (route?.params?.resetToTripSelection) {
      setActiveTab('viajes');
      activeTabRef.current = 'viajes';
      setNavigationState({ type: 'tab' });
      
      if (navigation?.setParams) {
        navigation.setParams({ resetToTripSelection: undefined });
      }
    }
  }, [route?.params?.resetToTripSelection, navigation]);

  useEffect(() => {
    refreshUnreadCount();
  }, []);

  useFocusEffect(
    useCallback(() => {
      refreshUnreadCount();
    }, [refreshUnreadCount])
  );

  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
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
    const { onWentToPayment, ...serializableParams } = params;
    setNavigationState({ type: 'selectSeat', params: serializableParams });
  }, []);

  const navigateToPurchaseDetail = useCallback((purchaseId: number) => {
    navigation.navigate('PurchaseDetail', { purchaseId });
  }, [navigation]);

  const navigateToTicketDetail = useCallback((ticketId: number) => {
    navigation.navigate('TicketDetail', { ticketId });
  }, [navigation]);

  const handleLogout = useCallback(() => {
    logout();
  }, [logout]);

  const navigateToEditProfile = useCallback(() => {
    setNavigationState({ type: 'editProfile' });
    setMenuVisible(false);
  }, []);

  const handleTabPress = useCallback((tab: string) => {
    navigateToTab(tab);
  }, [navigateToTab]);

  const toggleMenu = useCallback(() => {
    setMenuVisible(prev => !prev);
  }, []);

  const toggleNotifications = useCallback(async () => {
    if (!notificationsVisible) {
      setNotificationsVisible(true);
      try {
        clearNotifications();
        await refreshNotifications();
        await markAsRead();
      } catch (error) {
        console.error('Error cargando notificaciones:', error);
      }
    } else {
      setNotificationsVisible(false);
    }
  }, [notificationsVisible, clearNotifications, refreshNotifications, markAsRead]);

  const handleMenuItemPress = useCallback((action: string) => {
    setMenuVisible(false);
    
    if (action === 'logout') {
      handleLogout();
    } else if (action === 'changePassword') {
      navigateToChangePassword();
    } else if (action === 'editProfile') {
      navigateToEditProfile();
    }
  }, [handleLogout, navigateToChangePassword, navigateToEditProfile]);

  const handleNotificationPress = useCallback((notificationId: number) => {
    const notification = notifications.find(n => n.id === notificationId);
    
    if (notification && notification.compraId) {
      setNotificationsVisible(false);
      navigateToPurchaseDetail(notification.compraId);
    }
  }, [notifications, navigateToPurchaseDetail]);

  const handleMarkAllAsRead = useCallback(async () => {
    try {
      await markAsRead();
      setNotificationsVisible(false);
    } catch (error) {
      console.error('Error marcando todas las notificaciones como leídas:', error);
    }
  }, [markAsRead]);

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
        const initialData = {
          origenSeleccionado: params.origenSeleccionado,
          destinoSeleccionado: params.destinoSeleccionado,
          fechaIda: params.fecha,
          dateIda: params.date,
          fechaVuelta: params.fechaVuelta || params.roundTripState?.viajeVuelta?.fecha,
          dateVuelta: params.dateVuelta || params.roundTripState?.viajeVuelta?.date,
          pasajeros: params.pasajeros,
        };
        
        setNavigationState({ type: 'roundTrip', initialData });
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
    } else if (navigationState.type === 'editProfile') {
      setActiveTab('inicio');
      activeTabRef.current = 'inicio';
      setNavigationState({ type: 'tab' });
    }
  }, [navigationState]);

  const renderContent = useMemo(() => {
    switch (navigationState.type) {
      case 'changePassword':
        return (
          <ChangePasswordScreen 
            onSuccess={() => {
              setActiveTab('inicio');
              activeTabRef.current = 'inicio';
              setNavigationState({ type: 'tab' });
            }}
            token={token || ''}
          />
        );
      case 'editProfile':
        return (
          <EditProfileScreen 
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
            initialData={navigationState.type === 'roundTrip' ? navigationState.initialData : undefined}
          />
        );
      case 'selectSeat':
        return (
          <SelectSeatScreen 
            route={{ 
              params: {
                ...navigationState.params
              }
            }}
            navigation={{ 
              goBack,
              navigate: navigateToViewTrips
            }}
            onWentToPayment={() => {
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
                onNavigateToRoundTrip={navigateToRoundTrip}
              />
            );
          case "compras":
            return (
              <PurchasesScreen 
                onNavigateToPurchaseDetail={navigateToPurchaseDetail}
              />
            );
          case "pasajes":
            return (
              <TicketsScreen 
                onNavigateToTicketDetail={navigateToTicketDetail}
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
    navigateToPurchaseDetail,
    navigateToTicketDetail
  ]);

  const getCurrentActiveTab = useCallback(() => {
    if (navigationState.type === 'tab') {
      return activeTab;
    }
    return 'viajes';
  }, [navigationState.type, activeTab]);

  const currentActiveTab = getCurrentActiveTab();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#3B82F6" />

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

      <View style={styles.mainContent}>{renderContent}</View>

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
            <Icon name="home" size={20} color={currentActiveTab === "inicio" ? "#3B82F6" : "#49454F"} />
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
            <Icon name="search" size={20} color={currentActiveTab === "viajes" ? "#3B82F6" : "#49454F"} />
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
            <Icon name="shopping-cart" size={20} color={currentActiveTab === "compras" ? "#3B82F6" : "#49454F"} />
          </View>
          <Text style={[
            styles.navigationLabel, 
            currentActiveTab === "compras" && styles.activeNavigationLabel
          ]}>
            Mis Compras
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          key={`pasajes-${currentActiveTab === "pasajes"}`}
          style={styles.navigationItem}
          onPress={() => handleTabPress("pasajes")}
          activeOpacity={0.7}
        >
          <View style={[
            styles.navigationIndicator, 
            currentActiveTab === "pasajes" && styles.activeNavigationIndicator
          ]}>
            <Icon name="confirmation-number" size={20} color={currentActiveTab === "pasajes" ? "#3B82F6" : "#49454F"} />
          </View>
          <Text style={[
            styles.navigationLabel, 
            currentActiveTab === "pasajes" && styles.activeNavigationLabel
          ]}>
            Mis Pasajes
          </Text>
        </TouchableOpacity>
      </View>

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

export default BottomTabsNavigator;