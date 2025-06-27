import React from "react"
import { StyleSheet, View, Text, ImageBackground, Image } from "react-native"

export default function MainScreen() {
  return (
    <ImageBackground 
      source={require("../assets/background.png")} 
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <View style={styles.contentContainer}>
        <View style={styles.welcomeCard}>
          <Image 
            source={require("../assets/CharruaBusLogo-SinTexto.png")} 
            style={styles.welcomeIcon}
            resizeMode="contain"
          />
          <Text 
            style={styles.contentTitle}
            numberOfLines={1}
            adjustsFontSizeToFit={true}
            minimumFontScale={0.5}
            allowFontScaling={true}
          >
            Bienvenido a Charrua Bus
          </Text>
          <Text style={styles.contentText}>
            Desde aquí puedes buscar tus próximos viajes y comprar pasajes de manera fácil y rápida.
          </Text>
        </View>
      </View>
    </ImageBackground>
  )
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  contentContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  welcomeCard: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 16,
    padding: 32,
    alignItems: "center",
    marginHorizontal: 8,
    maxWidth: 600,
  },
  welcomeIcon: {
    width: 120,
    height: 120,
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
})