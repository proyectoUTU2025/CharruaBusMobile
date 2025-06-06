import React from 'react';
import {
  StyleSheet,
  View,
  ActivityIndicator,
  ImageBackground,
  SafeAreaView,
  StatusBar,
  Image,
} from 'react-native';

const LoadingScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <ImageBackground
        source={require("../assets/background.png")}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <View style={styles.content}>
          <View style={styles.logoContainer}>
            <Image
              source={require("../assets/CharruaBusLogo.png")}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>
          <ActivityIndicator size="large" color="#007AFF" style={styles.loader} />
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: 40,
  },
  logoImage: {
    width: 200,
    height: 100,
  },
  loader: {
    marginTop: 20,
  },
});

export default LoadingScreen;