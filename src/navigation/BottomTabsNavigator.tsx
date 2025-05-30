import React, { useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, StatusBar, StyleSheet, Modal, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import MainScreen from '../screens/MainScreen';
import { TripSelectionScreen } from '../screens/TripSelectionScreen';
import { useAuth } from '../context/AuthContext';
import { useUser } from '../hooks/useUser';

const BottomTabsNavigator = () => {
  const { logout } = useAuth();
  const { user, loading } = useUser();
  const [activeTab, setActiveTab] = useState("inicio");
  const [menuVisible, setMenuVisible] = useState(false);
  const [notificationsVisible, setNotificationsVisible] = useState(false);

  //Datos de ejemplo para las notificaciones (Quitar es solo muestra hasta que se implemente el mostrado)
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

  const handleLogout = () => {
    logout();
  };

  const handleTabPress = (tab: string) => {
    setActiveTab(tab);
    
    // Manejar el caso especial del historial
    if (tab === "historial") {
      console.log('Navegando a historial de compras (funcionalidad pendiente)');
      // Aquí puedes agregar lógica adicional cuando implementes la funcionalidad
      return;
    }
  };

  const toggleMenu = () => {
    setMenuVisible(!menuVisible);
  };

  const toggleNotifications = () => {
    setNotificationsVisible(!notificationsVisible);
  };

  const handleMenuItemPress = (action: string) => {
    setMenuVisible(false);
    
    switch (action) {
      case 'editProfile':
        console.log('Ir a editar perfil');
        break;
      case 'changePassword':
        console.log('Ir a cambiar contraseña');
        break;
      case 'logout':
        handleLogout();
        break;
      default:
        break;
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
    console.log('Notificación presionada:', notificationId);
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

  const renderContent = () => {
    switch (activeTab) {
      case "inicio":
        return <MainScreen />;
      case "viajes":
        return <TripSelectionScreen />;
      case "historial":
        // Pantalla temporal para historial
        return (
          <View style={styles.placeholderContainer}>
            <Icon name="history" size={64} color="#CAC4D0" />
            <Text style={styles.placeholderTitle}>Historial de Compras</Text>
            <Text style={styles.placeholderSubtitle}>
              Aquí podrás ver todas tus compras anteriores
            </Text>
          </View>
        );
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
          {/* Header de notificaciones */}
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

          {/* Lista de notificaciones */}
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

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#3B82F6" />

      {/* Barra Superior*/}
      <View style={styles.topAppBar}>
        {/* Botón de Menú Hamburguesa */}
        <TouchableOpacity 
          style={styles.menuButton} 
          onPress={toggleMenu} 
          activeOpacity={0.7}
        >
          <Icon name="menu" size={24} color="white" />
        </TouchableOpacity>

        {/* Espaciador para centrar el título si lo necesitas */}
        <View style={styles.titleContainer} />

        {/* Botón de Notificaciones */}
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

      {/* Barra Inferior de Navegación*/}
      <View style={styles.navigationBar}>
        <TouchableOpacity
          style={[styles.navigationItem, activeTab === "inicio" && styles.activeNavigationItem]}
          onPress={() => handleTabPress("inicio")}
          activeOpacity={0.7}
        >
          <View style={[styles.navigationIndicator, activeTab === "inicio" && styles.activeNavigationIndicator]}>
            <Icon name="home" size={24} color={activeTab === "inicio" ? "#3B82F6" : "#49454F"} />
          </View>
          <Text style={[styles.navigationLabel, activeTab === "inicio" && styles.activeNavigationLabel]}>Inicio</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navigationItem, activeTab === "viajes" && styles.activeNavigationItem]}
          onPress={() => handleTabPress("viajes")}
          activeOpacity={0.7}
        >
          <View style={[styles.navigationIndicator, activeTab === "viajes" && styles.activeNavigationIndicator]}>
            <Icon name="search" size={24} color={activeTab === "viajes" ? "#3B82F6" : "#49454F"} />
          </View>
          <Text style={[styles.navigationLabel, activeTab === "viajes" && styles.activeNavigationLabel]}>Viajes</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navigationItem, activeTab === "historial" && styles.activeNavigationItem]}
          onPress={() => handleTabPress("historial")}
          activeOpacity={0.7}
        >
          <View style={[styles.navigationIndicator, activeTab === "historial" && styles.activeNavigationIndicator]}>
            <Icon name="history" size={24} color={activeTab === "historial" ? "#3B82F6" : "#49454F"} />
          </View>
          <Text style={[styles.navigationLabel, activeTab === "historial" && styles.activeNavigationLabel]}>Historial</Text>
        </TouchableOpacity>
      </View>

      {/* Menú Desplegable */}
      <MenuDropdown />

      {/* Menú de Notificaciones */}
      <NotificationsDropdown />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFBFE",
  },
  topAppBar: {
    backgroundColor: "#3B82F6",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    height: 64,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  menuButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: '#F44336',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  notificationBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  titleContainer: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  userEmail: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
    textAlign: "center",
  },
  mainContent: {
    flex: 1,
    backgroundColor: "#FFFBFE",
  },
  navigationBar: {
    backgroundColor: "#FEF7FF",
    flexDirection: "row",
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderTopWidth: 1,
    borderTopColor: "#E7E0EC",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  navigationItem: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  activeNavigationItem: {
  },
  navigationIndicator: {
    width: 64,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
  },
  activeNavigationIndicator: {
    backgroundColor: "#E8F0FE",
  },
  navigationLabel: {
    fontSize: 12,
    color: "#49454F",
    fontWeight: "500",
    textAlign: "center",
  },
  activeNavigationLabel: {
    color: "#3B82F6",
    fontWeight: "600",
  },
  //Estilos para el menú desplegable
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-start',
  },
  menuContainer: {
    backgroundColor: 'white',
    marginTop: 64,
    marginLeft: 16,
    marginRight: 80,
    borderRadius: 12,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    paddingVertical: 8,
  },
  //Estilos para el header del menú
  menuHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E8F0FE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInfoContainer: {
    flex: 1,
  },
  greetingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1B1F',
    marginBottom: 2,
  },
  userEmailText: {
    fontSize: 14,
    color: '#49454F',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  menuIcon: {
    marginRight: 16,
    width: 20,
  },
  menuText: {
    fontSize: 16,
    color: '#49454F',
    fontWeight: '400',
  },
  menuDivider: {
    height: 1,
    backgroundColor: '#E7E0EC',
    marginVertical: 8,
    marginHorizontal: 16,
  },
  //Estilos para el menú de notificaciones
  notificationsContainer: {
    backgroundColor: 'white',
    marginTop: 64,
    marginLeft: 80,
    marginRight: 16,
    borderRadius: 12,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    maxHeight: '70%',
  },
  notificationsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  notificationsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1B1F',
    flex: 1,
    marginRight: 8,
  },
  markAllReadButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#E8F0FE',
    borderRadius: 16,
    minWidth: 60,
    alignItems: 'center',
    flexShrink: 0,
  },
  markAllReadText: {
    fontSize: 12,
    color: '#3B82F6',
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 16,
  },
  notificationsList: {
    maxHeight: 400,
  },
  emptyNotifications: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 16,
  },
  emptyNotificationsText: {
    fontSize: 16,
    color: '#CAC4D0',
    marginTop: 12,
    textAlign: 'center',
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F4F1F4',
  },
  unreadNotificationItem: {
    backgroundColor: '#F8F9FF',
  },
  notificationIconContainer: {
    marginRight: 12,
    position: 'relative',
    paddingTop: 2,
  },
  unreadDot: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3B82F6',
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#49454F',
    marginBottom: 4,
  },
  unreadNotificationTitle: {
    color: '#1C1B1F',
    fontWeight: '600',
  },
  notificationMessage: {
    fontSize: 14,
    color: '#79747E',
    marginBottom: 4,
    lineHeight: 20,
  },
  notificationTime: {
    fontSize: 12,
    color: '#CAC4D0',
  },
  // Estilos para la pantalla placeholder del historial
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  placeholderTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1C1B1F',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  placeholderSubtitle: {
    fontSize: 16,
    color: '#79747E',
    textAlign: 'center',
    lineHeight: 24,
  },
});

export default BottomTabsNavigator;