"use client"

import type React from "react"
import { useEffect, useRef, useState } from "react"
import { View, Image, StyleSheet, Text, Animated, Dimensions, StatusBar } from "react-native"

const { width } = Dimensions.get("window")

interface LoadingScreenProps {
  onLoadingComplete?: () => void
  onError?: (error: string) => void
}

type LoadingState = "loading" | "success" | "error"

const LoadingScreen: React.FC<LoadingScreenProps> = ({ onLoadingComplete, onError }) => {
  // Estados
  const [loadingState, setLoadingState] = useState<LoadingState>("loading")
  const [errorMessage, setErrorMessage] = useState("")

  // Referencias para las animaciones
  const logoScale = useRef(new Animated.Value(0.8)).current
  const logoOpacity = useRef(new Animated.Value(0)).current
  const progressWidth = useRef(new Animated.Value(0)).current
  const textOpacity = useRef(new Animated.Value(0)).current

  // Simular carga de datos
  useEffect(() => {
    if (loadingState === "loading") {
      startLoadingAnimation()
      simulateDataLoading()
    }
  }, [loadingState])

  const startLoadingAnimation = () => {
    // Secuencia de animaciones
    const animationSequence = Animated.sequence([
      Animated.parallel([
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.spring(logoScale, {
          toValue: 1,
          friction: 4,
          tension: 40,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(textOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ])

    const progressAnimation = Animated.timing(progressWidth, {
      toValue: 1,
      duration: 3000,
      useNativeDriver: false,
    })

    animationSequence.start()
    progressAnimation.start()
  }

  const simulateDataLoading = async () => {
    try {
      // Simular múltiples operaciones de carga
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Simular verificación de autenticación
      await checkAuthentication()

      // Simular carga de configuración
      await loadConfiguration()

      // Simular carga de datos iniciales
      await loadInitialData()

      setLoadingState("success")
      setTimeout(() => {
        onLoadingComplete?.()
      }, 500)
    } catch (error) {
      setLoadingState("error")
      const errorMsg = error instanceof Error ? error.message : "Error desconocido"
      setErrorMessage(errorMsg)
      onError?.(errorMsg)
    }
  }

  const checkAuthentication = async () => {
    // Simular verificación de autenticación
    await new Promise((resolve) => {
      setTimeout(() => {
        resolve(true)
      }, 800)
    })
  }

  const loadConfiguration = async () => {
    // Simular carga de configuración
    await new Promise((resolve) => setTimeout(resolve, 600))
  }

  const loadInitialData = async () => {
    // Simular carga de datos iniciales
    await new Promise((resolve) => setTimeout(resolve, 1000))
  }

  const renderLoadingContent = () => {
    switch (loadingState) {
      case "loading":
        return (
          <>
            <Text style={styles.loadingText}>Cargando aplicación...</Text>
            <View style={styles.progressBarContainer}>
              <Animated.View
                style={[
                  styles.progressBar,
                  {
                    width: progressWidth.interpolate({
                      inputRange: [0, 1],
                      outputRange: ["0%", "100%"],
                    }),
                  },
                ]}
              />
            </View>
          </>
        )

      case "error":
        return (
          <View style={styles.errorContainer}>
            <Text style={styles.errorIcon}>⚠️</Text>
            <Text style={styles.errorTitle}>Error de carga</Text>
            <Text style={styles.errorMessage}>{errorMessage}</Text>
          </View>
        )

      case "success":
        return (
          <View style={styles.successContainer}>
            <Text style={styles.successText}>✓ Carga completada</Text>
          </View>
        )

      default:
        return null
    }
  }

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#4a6572" barStyle="light-content" />

      <View style={styles.backgroundTop} />

      <View style={styles.card}>
        <Animated.View
          style={[
            styles.logoContainer,
            {
              opacity: logoOpacity,
              transform: [{ scale: logoScale }],
            },
          ]}
        >
          <Image source={require("../assets/CharruaBusLogo.png")} style={styles.logo} resizeMode="contain" />
        </Animated.View>

        <Animated.View style={[styles.textContainer, { opacity: textOpacity }]}>
          <Text style={styles.title}>CHARRUA BUS</Text>
          <Text style={styles.subtitle}>URUGUAY</Text>
          <Text style={styles.welcomeText}>Bienvenido</Text>
        </Animated.View>

        <Animated.View style={[styles.loadingContainer, { opacity: textOpacity }]}>
          {renderLoadingContent()}
        </Animated.View>
      </View>

      <View style={styles.backgroundBottom} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#4a6572",
    justifyContent: "center",
    alignItems: "center",
  },
  backgroundTop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "40%",
    backgroundColor: "#a4c2d8",
    opacity: 0.3,
  },
  backgroundBottom: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "35%",
    backgroundColor: "#a4c2d8",
    borderTopLeftRadius: 100,
    borderTopRightRadius: 100,
    opacity: 0.4,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 30,
    marginHorizontal: 30,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 10,
    minHeight: 400,
    justifyContent: "space-between",
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  logo: {
    width: width * 0.35,
    height: width * 0.35,
    maxWidth: 140,
    maxHeight: 140,
  },
  textContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
    marginBottom: 15,
    letterSpacing: 0.5,
  },
  welcomeText: {
    fontSize: 18,
    color: "#333",
    fontWeight: "500",
  },
  loadingContainer: {
    width: "100%",
    alignItems: "center",
    minHeight: 80,
  },
  loadingText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 15,
  },
  progressBarContainer: {
    width: "100%",
    height: 4,
    backgroundColor: "#e8e8e8",
    borderRadius: 2,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#4285f4",
    borderRadius: 2,
  },
  errorContainer: {
    alignItems: "center",
    width: "100%",
  },
  errorIcon: {
    fontSize: 32,
    marginBottom: 10,
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#e74c3c",
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
  },
  successContainer: {
    alignItems: "center",
  },
  successText: {
    fontSize: 16,
    color: "#27ae60",
    fontWeight: "500",
  },
})

export default LoadingScreen
