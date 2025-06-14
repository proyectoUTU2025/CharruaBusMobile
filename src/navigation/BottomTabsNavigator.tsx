import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, StatusBar, StyleSheet, Modal, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import MainScreen from '../screens/MainScreen';
import { TripSelectionScreen } from '../screens/TripSelectionScreen';
import ChangePasswordScreen from '../screens/ChangePasswordScreen';
import PurchasesScreen from '../screens/PurchasesScreen';
import { useAuth } from '../context/AuthContext';
import { useUser } from '../hooks/useUser';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { OneWayTripScreen } from '../screens/OneWayTripScreen';
import { RoundTripScreen } from '../screens/RoundTripScreen';
import { ViewTripsScreen } from '../screens/ViewTripsScreen';
import { SelectSeatScreen } from '../screens/SelectSeatScreen';
import { RoundTripState } from '../types/roundTripType';
import { NavigationState, ViewTripsParams, RootStackParamList } from '../types/navigationType';

const BottomTabsNavigator = ({ route }: any) => {
  const initialTab = route?.params?.initialTab || 'inicio';
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { logout, token } = useAuth();
  const { user, loading } = useUser();
  
  const [activeTab, setActiveTab] = useState(initialTab);
  const activeTabRef = useRef(activeTab);
  
  const [navigationState, setNavigationState] = useState<NavigationState>({ type: 'tab' });
  
  const [menuVisible, setMenuVisible] = useState(false);
  const [notificationsVisible, setNotificationsVisible] = useState(false);

  useEffect(() => {
    activeTabRef.current = activeTab;
  }, [activeTab]);

  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: "Nuevo viaje disponible",
      message: "Hay un nuevo viaje a Montevideo disponible",
      time: "Hace 5 min",
      read: false,
      icon: "directions-bus"
    },
    {
      id: 2,
      title: "Confirmación de compra",
      message: "Tu boleto ha sido confirmado exitosamente",
      time: "Hace 1 hora",
      read: false,
      icon: "check-circle"
    },
    {
      id: 3,
      title: "Recordatorio de viaje",
      message: "Tu viaje sale en 2 horas",
      time: "Hace 2 horas",
      read: true,
      icon: "schedule"
    },
    {
      id: 4,
      title: "Oferta especial",
      message: "25% de descuento en viajes nocturnos",
      time: "Ayer",
      read: true,
      icon: "local-offer"
    }
  ]);

  const navigateToChangePassword = () => {
    setNavigationState({ type: 'changePassword' });
    setMenuVisible(false);
  };

  const navigateToTab = (tab: string) => {
    setActiveTab(tab);
    activeTabRef.current = tab;
    setNavigationState({ type: 'tab' });
  };

  const navigateToOneWayTrip = () => {
    setNavigationState({ type: 'oneWayTrip' });
  };

  const navigateToRoundTrip = () => {
    setNavigationState({ type: 'roundTrip' });
  };

  const navigateToViewTrips = (params: ViewTripsParams) => {
    setNavigationState({ type: 'viewTrips', params });
  };

  const navigateToSelectSeat = (params: any) => {
    setNavigationState({ type: 'selectSeat', params });
  };

  const navigateToPurchaseDetail = (purchaseId: number) => {
    navigation.navigate('PurchaseDetail', { purchaseId });
  };

  const goBack = (roundTripState?: RoundTripState) => {
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
  };

  const handleLogout = () => {
    logout();
  };

  const handleTabPress = (tab: string) => {
    navigateToTab(tab);
  };

  const toggleMenu = () => {
    setMenuVisible(!menuVisible);
  };

  const toggleNotifications = () => {
    setNotificationsVisible(!notificationsVisible);
  };

  const handleMenuItemPress = (action: string) => {
    setMenuVisible(false);
    
    if (action === 'logout') {
      handleLogout();
    } else if (action === 'changePassword') {
      navigateToChangePassword();
    }
  };

  const handleNotificationPress = (notificationId: number) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
    setNotificationsVisible(false);
  };

  const getUnreadNotificationsCount = () => {
    return notifications.filter(notification => !notification.read).length;
  };

  const getDisplayName = (user: any) => {
    if (!user) return 'Usuario';
    
    if (user.name && user.apellido) {
      return `${user.name} ${user.apellido}`;
    }
    
    if (user.name) {
      return user.name;
    }
    
    return 'Usuario';
  };

  const getCurrentActiveTab = () => {
    if (navigationState.type === 'tab') {
      return activeTabRef.current;
    }
    return 'viajes';
  };

  const shouldShowBottomNavigation = () => {
    return true;
  };

  const renderContent = () => {
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
  };

  const MenuDropdown = () => (
    <Modal
      visible={menuVisible}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setMenuVisible(false)}
    >
      <TouchableOpacity 
        style={styles.modalOverlay} 
        activeOpacity={1} 
        onPress={() => setMenuVisible(false)}
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
                ¡Hola, {loading ? 'Cargando...' : getDisplayName(user)}!
              </Text>
              <Text style={styles.userEmailText}>
                {loading ? '' : (user?.email || '')}
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

  const NotificationsDropdown = () => (
    <Modal
      visible={notificationsVisible}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setNotificationsVisible(false)}
    >
      <TouchableOpacity 
        style={styles.modalOverlay} 
        activeOpacity={1} 
        onPress={() => setNotificationsVisible(false)}
      >
        <View style={styles.notificationsContainer}>
          <View style={styles.notificationsHeader}>
            <Text style={styles.notificationsTitle}>Notificaciones</Text>
            {getUnreadNotificationsCount() > 0 && (
              <TouchableOpacity 
                onPress={markAllNotificationsAsRead}
                style={styles.markAllReadButton}
              >
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
                  style={[
                    styles.notificationItem,
                    !notification.read && styles.unreadNotificationItem
                  ]}
                  onPress={() => handleNotificationPress(notification.id)}
                  activeOpacity={0.7}
                >
                  <View style={styles.notificationIconContainer}>
                    <Icon 
                      name={notification.icon} 
                      size={24} 
                      color={!notification.read ? "#3B82F6" : "#49454F"} 
                    />
                    {!notification.read && <View style={styles.unreadDot} />}
                  </View>
                  <View style={styles.notificationContent}>
                    <Text style={[
                      styles.notificationTitle,
                      !notification.read && styles.unreadNotificationTitle
                    ]}>
                      {notification.title}
                    </Text>
                    <Text style={styles.notificationMessage}>
                      {notification.message}
                    </Text>
                    <Text style={styles.notificationTime}>
                      {notification.time}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        </View>
      </TouchableOpacity>
    </Modal>
  );

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
          {getUnreadNotificationsCount() > 0 && (
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationBadgeText}>
                {getUnreadNotificationsCount() > 9 ? '9+' : getUnreadNotificationsCount()}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Contenido Principal */}
      <View style={styles.mainContent}>{renderContent()}</View>

      {/* Barra Inferior de Navegación - Siempre visible */}
      {shouldShowBottomNavigation() && (
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

          {/* ✅ CAMBIO: Cambiar historial por compras */}
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
              Compras
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Menús Desplegables */}
      <MenuDropdown />
      <NotificationsDropdown />
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
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  placeholderTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
    marginTop: 16,
  },
  placeholderSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 8,
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
  markAllReadButton: {
    padding: 8,
  },
  markAllReadText: {
    fontSize: 14,
    color: '#3B82F6',
  },
  notificationsList: {
    maxHeight: 300,
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
});

export default BottomTabsNavigator;