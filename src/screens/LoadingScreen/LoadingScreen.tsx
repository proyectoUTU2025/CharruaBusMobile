import React from 'react';
import {
  View,
  ActivityIndicator,
  ImageBackground,
  SafeAreaView,
  StatusBar,
  Image,
} from 'react-native';
import { styles } from './LoadingScreen.styles';

const LoadingScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <ImageBackground
        source={require("../../assets/backgroundLoading.png")}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <View style={styles.content}>
          <View style={styles.logoContainer}>
            <Image
              source={require("../../assets/CharruaBusLogoSinFondo.png")}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>
          <ActivityIndicator size="large" color="#F3B600" style={styles.loader} />
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
};

export default LoadingScreen;