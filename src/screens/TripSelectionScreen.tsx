import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ImageBackground,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface TripSelectionScreenProps {
  activeTab: string;
  onTabPress: (tab: string) => void;
}

const TripSelectionScreen: React.FC<TripSelectionScreenProps> = ({ activeTab, onTabPress }) => {
  const [selectedTripType, setSelectedTripType] = useState<string | null>(null);

  const handleTripTypeSelection = (tripType: string) => {
    setSelectedTripType(tripType);
  };

  return (
    <ImageBackground 
      source={require("../assets/background.png")} 
      style={styles.backgroundImage} 
      resizeMode="cover"
    >
      <View style={styles.mainContent}>
        <View style={styles.cardContainer}>
          <View style={styles.headerContainer}>
            <Text style={styles.headerTitle}>Seleccionar tipo de viaje</Text>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={[
                styles.tripButton, 
                selectedTripType === 'ida' && styles.tripButtonSelected
              ]} 
              activeOpacity={0.8} 
              onPress={() => handleTripTypeSelection('ida')}
            >
              <View style={styles.buttonContent}>
                <Icon 
                  name="trending-flat" 
                  size={32} 
                  color={selectedTripType === 'ida' ? "white" : "#3B82F6"} 
                  style={styles.buttonIcon}
                />
                <Text style={[
                  styles.tripButtonText,
                  selectedTripType === 'ida' && styles.tripButtonTextSelected
                ]}>
                  Ida
                </Text>
                <Text style={[
                  styles.tripButtonSubtext,
                  selectedTripType === 'ida' && styles.tripButtonSubtextSelected
                ]}>
                  Viaje de solo ida
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[
                styles.tripButton, 
                selectedTripType === 'ida_vuelta' && styles.tripButtonSelected
              ]} 
              activeOpacity={0.8} 
              onPress={() => handleTripTypeSelection('ida_vuelta')}
            >
              <View style={styles.buttonContent}>
                <Icon 
                  name="sync-alt" 
                  size={32} 
                  color={selectedTripType === 'ida_vuelta' ? "white" : "#3B82F6"} 
                  style={styles.buttonIcon}
                />
                <Text style={[
                  styles.tripButtonText,
                  selectedTripType === 'ida_vuelta' && styles.tripButtonTextSelected
                ]}>
                  Ida y Vuelta
                </Text>
                <Text style={[
                  styles.tripButtonSubtext,
                  selectedTripType === 'ida_vuelta' && styles.tripButtonSubtextSelected
                ]}>
                  Viaje de ida y regreso
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          {selectedTripType && (
            <TouchableOpacity 
              style={styles.continueButton} 
              activeOpacity={0.8}
              onPress={() => console.log('Continuar con:', selectedTripType)}
            >
              <Text style={styles.continueButtonText}>Continuar</Text>
              <Icon name="arrow-forward" size={20} color="white" style={styles.continueButtonIcon} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  //Estilos del contenido principal (del RegisterScreen)
  backgroundImage: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  mainContent: {
    flex: 1,
    width: "100%",
    justifyContent: "center",
    padding: 16,
  },
  cardContainer: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 16,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    alignSelf: "center",
  },
  headerContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "600",
    color: "#374151",
    textAlign: "center",
  },
  //Estilos específicos para los botones de tipo de viaje
  buttonContainer: {
    gap: 16,
  },
  tripButton: {
    backgroundColor: "white",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#3B82F6",
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tripButtonSelected: {
    backgroundColor: "#3B82F6",
    borderColor: "#3B82F6",
  },
  buttonContent: {
    alignItems: "center",
  },
  buttonIcon: {
    marginBottom: 12,
  },
  tripButtonText: {
    fontSize: 20,
    fontWeight: "600",
    color: "#3B82F6",
    marginBottom: 4,
  },
  tripButtonTextSelected: {
    color: "white",
  },
  tripButtonSubtext: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
  },
  tripButtonSubtextSelected: {
    color: "rgba(255, 255, 255, 0.8)",
  },
  continueButton: {
    backgroundColor: "#10B981",
    height: 50,
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
    shadowColor: "#10B981",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  continueButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    marginRight: 8,
  },
  continueButtonIcon: {
    marginLeft: 4,
  },
});

export default TripSelectionScreen;