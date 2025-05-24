import React, { useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, StatusBar, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import HomeScreen from '../screens/HomeScreen';
import { useAuth } from '../context/AuthContext';

const BottomTabsNavigator = () => {
  const { logout } = useAuth();
  const [activeTab, setActiveTab] = useState("inicio");

  const handleLogout = () => {
    logout();
  };

  const handleTabPress = (tab: string) => {
    setActiveTab(tab);
    console.log(`Navigate to ${tab}`);
  };

  const renderContent = () => {
    switch (activeTab) {
      case "inicio":
        return <HomeScreen />;
      case "viajes":
        return (
          <View style={styles.contentContainer}>
            <View style={styles.welcomeCard}>
              <Icon name="search" size={48} color="#3B82F6" style={styles.welcomeIcon} />
              <Text style={styles.contentTitle}>Listado de Viajes</Text>
              <Text style={styles.contentText}>
                Aquí encontrarás todos los viajes disponibles y podrás buscar por destino y fecha.
              </Text>
            </View>
          </View>
        );
      case "compra":
        return (
          <View style={styles.contentContainer}>
            <View style={styles.welcomeCard}>
              <Icon name="shopping-cart" size={48} color="#3B82F6" style={styles.welcomeIcon} />
              <Text style={styles.contentTitle}>Compra de Pasajes</Text>
              <Text style={styles.contentText}>
                Selecciona tu viaje y completa la compra de tus pasajes de forma segura.
              </Text>
            </View>
          </View>
        );
      default:
        return <HomeScreen />;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#3B82F6" />

      {/* Barra Superior - Material 3 Top App Bar */}
      <View style={styles.topAppBar}>
        <View style={styles.titleContainer}>
          <Text style={styles.userEmail} numberOfLines={1}>
            Nombre de Usuario
          </Text>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.7}>
          <Icon name="logout" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Contenido Principal */}
      <View style={styles.mainContent}>{renderContent()}</View>

      {/* Barra Inferior de Navegación - Material 3 Navigation Bar */}
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
  logoutButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  titleContainer: {
    flex: 1,
    justifyContent: "center",
    paddingLeft: 16,
  },
  userEmail: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
    textAlign: "left",
  },
  mainContent: {
    flex: 1,
    backgroundColor: "#FFFBFE",
  },
  contentContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  welcomeCard: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 32,
    alignItems: "center",
    width: "100%",
    maxWidth: 400,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  welcomeIcon: {
    marginBottom: 16,
  },
  contentTitle: {
    fontSize: 24,
    fontWeight: "600",
    color: "#1C1B1F",
    marginBottom: 16,
    textAlign: "center",
  },
  contentText: {
    fontSize: 16,
    color: "#49454F",
    textAlign: "center",
    lineHeight: 24,
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
});

export default BottomTabsNavigator;