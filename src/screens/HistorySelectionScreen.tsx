"use client"

import type React from "react"
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, StatusBar } from "react-native"
import Icon from "react-native-vector-icons/MaterialIcons"

interface HistorySelectionScreenProps {
  onNavigateToHistory: (type: "purchases" | "tickets") => void
}

const HistorySelectionScreen: React.FC<HistorySelectionScreenProps> = ({ onNavigateToHistory }) => {
  const handlePurchaseHistoryPress = () => {
    console.log("🛒 Navegando a historial de compras")
    onNavigateToHistory("purchases")
  }

  const handleTicketHistoryPress = () => {
    console.log("🎫 Navegando a historial de pasajes")
    onNavigateToHistory("tickets")
  }

  const historyOptions = [
    {
      id: "purchases",
      title: "Historial de Compras",
      description:
        "Consulta todas tus compras realizadas, incluyendo fecha, monto total, cantidad de pasajes y estado de cada transacción.",
      icon: "shopping-cart",
      color: "#3B82F6",
      backgroundColor: "#E8F0FE",
      onPress: handlePurchaseHistoryPress,
    },
    {
      id: "tickets",
      title: "Historial de Pasajes",
      description:
        "Revisa todos tus pasajes individuales, incluyendo detalles del viaje, origen, destino, fecha, hora y descuentos aplicados.",
      icon: "confirmation-number",
      color: "#059669",
      backgroundColor: "#ECFDF5",
      onPress: handleTicketHistoryPress,
    },
  ]

  const renderHistoryOption = (option: (typeof historyOptions)[0]) => (
    <TouchableOpacity key={option.id} style={styles.optionCard} onPress={option.onPress} activeOpacity={0.7}>
      <View style={styles.cardContent}>
        <View style={[styles.iconContainer, { backgroundColor: option.backgroundColor }]}>
          <Icon name={option.icon} size={40} color={option.color} />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.cardTitle}>{option.title}</Text>
          <Text style={styles.cardDescription}>{option.description}</Text>
        </View>
        <View style={styles.arrowContainer}>
          <Icon name="chevron-right" size={24} color="#79747E" />
        </View>
      </View>
    </TouchableOpacity>
  )

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#3B82F6" />

      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Historial</Text>
          <Text style={styles.headerSubtitle}>Selecciona el tipo de historial que deseas consultar</Text>
        </View>

        {/* Opciones de historial */}
        <View style={styles.optionsContainer}>{historyOptions.map(renderHistoryOption)}</View>

        {/* Información adicional */}
        <View style={styles.infoContainer}>
          <View style={styles.infoItem}>
            <Icon name="info-outline" size={16} color="#3B82F6" />
            <Text style={styles.infoText}>
              Ambos historiales incluyen filtros avanzados para encontrar información específica por fechas, estados y
              montos.
            </Text>
          </View>

          <View style={[styles.infoItem, { marginTop: 12 }]}>
            <Icon name="picture-as-pdf" size={16} color="#DC2626" />
            <Text style={styles.infoText}>
              Puedes generar y descargar PDFs de tus compras confirmadas y pasajes válidos.
            </Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1C1B1F",
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#49454F",
    textAlign: "center",
    lineHeight: 24,
    paddingHorizontal: 16,
  },
  optionsContainer: {
    flex: 1,
    gap: 20,
  },
  optionCard: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
    marginRight: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1C1B1F",
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
    color: "#49454F",
    lineHeight: 20,
  },
  arrowContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  infoContainer: {
    paddingVertical: 24,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#F0F9FF",
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#3B82F6",
  },
  infoText: {
    fontSize: 14,
    color: "#49454F",
    marginLeft: 8,
    flex: 1,
    lineHeight: 20,
  },
})

export default HistorySelectionScreen
