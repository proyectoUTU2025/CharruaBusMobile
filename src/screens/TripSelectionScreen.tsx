import { useState } from "react"
import { View, Text, TouchableOpacity, StyleSheet, StatusBar, ImageBackground } from "react-native"
import { RoundTrip } from "./RoundTripScreen"
import { OneWayTripScreen } from "./OneWayTripScreen"
import Icon from "react-native-vector-icons/MaterialIcons"

type TipoViaje = "ida" | "ida-vuelta" | null

interface TripSelectionScreenProps {
  activeTab?: string;
  onTabPress?: (tab: string) => void;
  onNavigateToOneWay?: () => void;
  onNavigateToRoundTrip?: () => void;
}

export function TripSelectionScreen({ activeTab, onTabPress, onNavigateToOneWay, onNavigateToRoundTrip }: TripSelectionScreenProps) {
  const [tipoViaje, setTipoViaje] = useState<TipoViaje>(null)
  const [mostrarFormulario, setMostrarFormulario] = useState(false)

const handleContinuar = () => {
  if (tipoViaje === "ida" && onNavigateToOneWay) {
    onNavigateToOneWay();
  } else if (tipoViaje === "ida-vuelta" && onNavigateToRoundTrip) {
    onNavigateToRoundTrip();
  } else if (tipoViaje) {
    setMostrarFormulario(true);
  }
}

  const handleVolver = () => {
    setMostrarFormulario(false)
  }

  if (mostrarFormulario && tipoViaje === "ida-vuelta") {
    return <RoundTrip onVolver={handleVolver} />
  }

    if (mostrarFormulario && tipoViaje === "ida") {
      return <OneWayTripScreen onGoBack={handleVolver} />
    }

  return (
    <ImageBackground 
      source={require('../assets/background.png')} 
      style={styles.container}
      resizeMode="cover"
    >
      <StatusBar backgroundColor="#4285F4" barStyle="light-content" />

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.title}>Seleccionar tipo de viaje</Text>

          {/* Opción Ida */}
          <TouchableOpacity
            style={[styles.optionButton, tipoViaje === "ida" ? styles.optionSelected : styles.optionUnselected]}
            onPress={() => setTipoViaje("ida")}
          >
            <Icon
              name="arrow-forward"
              size={32}
              color={tipoViaje === "ida" ? "white" : "#4285F4"}
              style={styles.optionIcon}
            />
            <Text
              style={[
                styles.optionTitle,
                tipoViaje === "ida" ? styles.optionTitleSelected : styles.optionTitleUnselected,
              ]}
            >
              Ida
            </Text>
            <Text
              style={[
                styles.optionSubtitle,
                tipoViaje === "ida" ? styles.optionSubtitleSelected : styles.optionSubtitleUnselected,
              ]}
            >
              Viaje de solo ida
            </Text>
          </TouchableOpacity>

          {/* Opción Ida y Vuelta */}
          <TouchableOpacity
            style={[styles.optionButton, tipoViaje === "ida-vuelta" ? styles.optionSelected : styles.optionUnselected]}
            onPress={() => setTipoViaje("ida-vuelta")}
          >
            <Icon
              name="swap-horiz"
              size={32}
              color={tipoViaje === "ida-vuelta" ? "white" : "#4285F4"}
              style={styles.optionIcon}
            />
            <Text
              style={[
                styles.optionTitle,
                tipoViaje === "ida-vuelta" ? styles.optionTitleSelected : styles.optionTitleUnselected,
              ]}
            >
              Ida y Vuelta
            </Text>
            <Text
              style={[
                styles.optionSubtitle,
                tipoViaje === "ida-vuelta" ? styles.optionSubtitleSelected : styles.optionSubtitleUnselected,
              ]}
            >
              Viaje de ida y regreso
            </Text>
          </TouchableOpacity>

          {/* Botón Continuar */}
          <TouchableOpacity
            style={[styles.continueButton, !tipoViaje && styles.continueButtonDisabled]}
            onPress={handleContinuar}
            disabled={!tipoViaje}
          >
            <Text style={styles.continueButtonText}>Continuar</Text>
            <Icon name="arrow-forward" size={20} color="white" style={styles.continueIcon} />
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 32,
  },
  card: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 24,
    padding: 24,
    marginHorizontal: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: "500",
    color: "#333",
    textAlign: "center",
    marginBottom: 32,
  },
  optionButton: {
    padding: 24,
    borderRadius: 16,
    borderWidth: 2,
    marginBottom: 16,
    alignItems: "center",
  },
  optionSelected: {
    backgroundColor: "#4285F4",
    borderColor: "#4285F4",
  },
  optionUnselected: {
    backgroundColor: "white",
    borderColor: "#4285F4",
  },
  optionIcon: {
    marginBottom: 12,
  },
  optionTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 4,
  },
  optionTitleSelected: {
    color: "white",
  },
  optionTitleUnselected: {
    color: "#4285F4",
  },
  optionSubtitle: {
    fontSize: 14,
  },
  optionSubtitleSelected: {
    color: "rgba(255, 255, 255, 0.8)",
  },
  optionSubtitleUnselected: {
    color: "#666",
  },
  continueButton: {
    backgroundColor: "#4CAF50",
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 32,
  },
  continueButtonDisabled: {
    backgroundColor: "#CCCCCC",
  },
  continueButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "500",
    marginRight: 8,
  },
  continueIcon: {
    marginLeft: 4,
  },
})