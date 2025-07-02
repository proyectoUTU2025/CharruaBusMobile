import React from "react"
import { View, Text, ImageBackground, Image } from "react-native"
import { styles } from './MainScreen.styles';

export default function MainScreen() {
  return (
    <ImageBackground 
      source={require("../../assets/background.png")} 
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <View style={styles.contentContainer}>
        <View style={styles.welcomeCard}>
          <Image 
            source={require("../../assets/CharruaBusLogo-SinTexto.png")} 
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