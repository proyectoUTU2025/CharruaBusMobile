import React from "react"
import { StyleSheet, View, Text } from "react-native"
import Icon from "react-native-vector-icons/MaterialIcons"

interface MainScreenProps {
  userEmail?: string
}

export default function MainScreen({ userEmail = "usuario@ejemplo.com" }: MainScreenProps) {
  return (
    <View style={styles.contentContainer}>
      <View style={styles.welcomeCard}>
        <Icon name="directions-bus" size={48} color="#3B82F6" style={styles.welcomeIcon} />
        <Text style={styles.contentTitle}>Bienvenido a Charrúa Bus</Text>
        <Text style={styles.contentText}>
          Desde aquí puedes gestionar tus viajes y comprar pasajes de manera fácil y rápida.
        </Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    backgroundColor: "#FFFBFE",
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
    color: "#1C1B1F", // Material 3 on-surface
    marginBottom: 16,
    textAlign: "center",
  },
  contentText: {
    fontSize: 16,
    color: "#49454F", // Material 3 on-surface-variant
    textAlign: "center",
    lineHeight: 24,
  },
})