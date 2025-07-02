import React, { useState } from "react"
import { View, Text, TouchableOpacity, StatusBar, ImageBackground } from "react-native"
import { RoundTripScreen } from "../RoundTripScreen/RoundTripScreen"
import { OneWayTripScreen } from "../OneWayTripScreen/OneWayTripScreen"
import Icon from "react-native-vector-icons/MaterialIcons"
import { TripSelectionScreenProps } from '../../types/screenPropsType';
import { styles } from './TripSelectionScreen.styles';

type TipoViaje = "ida" | "ida-vuelta" | null

export function TripSelectionScreen({ onNavigateToOneWay, onNavigateToRoundTrip }: TripSelectionScreenProps) {
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
    return <RoundTripScreen onVolver={handleVolver} />
  }

    if (mostrarFormulario && tipoViaje === "ida") {
      return <OneWayTripScreen onGoBack={handleVolver} />
    }

  return (
    <ImageBackground 
      source={require('../../assets/background.png')} 
      style={styles.container}
      resizeMode="cover"
    >
      <StatusBar backgroundColor="#4285F4" barStyle="light-content" />

      <View style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.title}>Seleccionar tipo de viaje</Text>

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