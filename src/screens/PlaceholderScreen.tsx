import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';

const PlaceholderScreen = () => (
  <View style={styles.container}>
    <Text>Compra de Pasaje</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});

export default PlaceholderScreen;