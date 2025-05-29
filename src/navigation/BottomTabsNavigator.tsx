import React, { useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, StatusBar, StyleSheet, Modal, Image } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import HomeScreen from '../screens/HomeScreen';
import TripSelectionScreen from '../screens/TripSelectionScreen';
import { useAuth } from '../context/AuthContext';
import { useUser } from '../hooks/useUser';

const BottomTabsNavigator = () => {
  const { logout } = useAuth();
  const { user, loading } = useUser(); //Usa el hook para obtener datos del usuario
  const [activeTab, setActiveTab] = useState("inicio");
  const [menuVisible, setMenuVisible] = useState(false);

  const handleLogout = () => {
    logout();
  };

  const handleTabPress = (tab: string) => {
    setActiveTab(tab);
  };

  const toggleMenu = () => {
    setMenuVisible(!menuVisible);
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

  //Función para obtener el nombre completo del usuario
  const getDisplayName = (user: any) => {
    if (!user) return 'Usuario';
    
    //Si tiene nombre y apellido, muestra ambos
    if (user.name && user.apellido) {
      return `${user.name} ${user.apellido}`;
    }
    
    //Si solo tiene nombre, muestra solo el nombre
    if (user.name) {
      return user.name;
    }
    
    return 'Usuario';
  };

  const renderContent = () => {
    switch (activeTab) {
      case "inicio":
        return <HomeScreen />;
      case "viajes":
        return <TripSelectionScreen activeTab={activeTab} onTabPress={handleTabPress} />;
      case "compra":
        return <TripSelectionScreen activeTab={activeTab} onTabPress={handleTabPress} />;
      default:
        return <HomeScreen />;
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
          {/* Header del menú con saludo y avatar */}
          <View style={styles.menuHeader}>
            <View style={styles.avatarContainer}>
              {/* Puedes reemplazar este View con una Image si tienes foto de perfil */}
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

          {/* Línea separadora */}
          <View style={styles.menuDivider} />

          {/* Opciones del menú */}
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
          style={[styles.navigationItem, activeTab === "compra" && styles.activeNavigationItem]}
          onPress={() => handleTabPress("compra")}
          activeOpacity={0.7}
        >
          <View style={[styles.navigationIndicator, activeTab === "compra" && styles.activeNavigationIndicator]}>
            <Icon name="shopping-cart" size={24} color={activeTab === "compra" ? "#3B82F6" : "#49454F"} />
          </View>
          <Text style={[styles.navigationLabel, activeTab === "compra" && styles.activeNavigationLabel]}>Compra</Text>
        </TouchableOpacity>
      </View>

      {/* Menú Desplegable */}
      <MenuDropdown />
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
  logoutButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
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
    marginTop: 64, //Altura de la barra superior
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
});

export default BottomTabsNavigator;