import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface HistorySelectionScreenProps {
  onNavigateToHistory?: (type: 'purchases' | 'tickets') => void;
}

const HistorySelectionScreen: React.FC<HistorySelectionScreenProps> = ({ 
  onNavigateToHistory 
}) => {

  const handlePurchaseHistoryPress = () => {
    console.log('Navegando a historial de compras');
    onNavigateToHistory?.('purchases');
  };

  const handleTicketHistoryPress = () => {
    console.log('Navegando a historial de pasajes');
    onNavigateToHistory?.('tickets');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#3B82F6" />
      
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Historial</Text>
          <Text style={styles.headerSubtitle}>
            Selecciona el tipo de historial que deseas consultar
          </Text>
        </View>

        {/* Opciones de historial */}
        <View style={styles.optionsContainer}>
          
          {/* Historial de Compras */}
          <TouchableOpacity
            style={styles.optionCard}
            onPress={handlePurchaseHistoryPress}
            activeOpacity={0.7}
          >
            <View style={styles.cardContent}>
              <View style={styles.iconContainer}>
                <Icon name="shopping-cart" size={40} color="#3B82F6" />
              </View>
              <View style={styles.textContainer}>
                <Text style={styles.cardTitle}>Historial de Compras</Text>
                <Text style={styles.cardDescription}>
                  Consulta todas tus compras realizadas, incluyendo fecha, monto total, 
                  cantidad de pasajes y estado de cada compra.
                </Text>
              </View>
              <View style={styles.arrowContainer}>
                <Icon name="chevron-right" size={24} color="#79747E" />
              </View>
            </View>
          </TouchableOpacity>

          {/* Historial de Pasajes */}
          <TouchableOpacity
            style={styles.optionCard}
            onPress={handleTicketHistoryPress}
            activeOpacity={0.7}
          >
            <View style={styles.cardContent}>
              <View style={styles.iconContainer}>
                <Icon name="confirmation-number" size={40} color="#3B82F6" />
              </View>
              <View style={styles.textContainer}>
                <Text style={styles.cardTitle}>Historial de Pasajes</Text>
                <Text style={styles.cardDescription}>
                  Revisa todos tus pasajes, incluyendo detalles del viaje, 
                  origen, destino, fecha y hora de cada trayecto.
                </Text>
              </View>
              <View style={styles.arrowContainer}>
                <Icon name="chevron-right" size={24} color="#79747E" />
              </View>
            </View>
          </TouchableOpacity>

        </View>

        {/* Información adicional */}
        <View style={styles.infoContainer}>
          <View style={styles.infoItem}>
            <Icon name="info-outline" size={16} color="#79747E" />
            <Text style={styles.infoText}>
              Puedes filtrar y buscar en ambos historiales para encontrar información específica
            </Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFBFE',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1C1B1F',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#49454F',
    textAlign: 'center',
    lineHeight: 24,
  },
  optionsContainer: {
    flex: 1,
    gap: 20,
  },
  optionCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: '#E7E0EC',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#E8F0FE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
    marginRight: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1B1F',
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
    color: '#49454F',
    lineHeight: 20,
  },
  arrowContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContainer: {
    paddingVertical: 24,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F8F9FF',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
  },
  infoText: {
    fontSize: 14,
    color: '#49454F',
    marginLeft: 8,
    flex: 1,
    lineHeight: 20,
  },
});

export default HistorySelectionScreen;