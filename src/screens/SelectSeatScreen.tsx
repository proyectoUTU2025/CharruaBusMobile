import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  SafeAreaView,
  ScrollView,
  Alert,
  ActivityIndicator,
  ImageBackground,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAuth } from '../context/AuthContext';
import { 
  getJourneyDetails, 
  JourneyDetails, 
  Seat,
  formatDateTime 
} from '../services/journeyService';

interface SelectSeatScreenProps {
  route: {
    params: {
      journeyId: number;
      origenSeleccionado: any;
      destinoSeleccionado: any;
      fecha: string;
      pasajeros: string;
      journey: any;
    };
  };
  navigation?: {
    goBack: () => void;
    navigate?: any;
  };
}

type EstadoAsiento = "disponible" | "ocupado" | "reservado" | "seleccionado";

interface AsientoLocal extends Seat {
  estado: EstadoAsiento;
  fila: number;
  columna: string;
  precio: number;
}

export function SelectSeatScreen({ route, navigation }: SelectSeatScreenProps) {
  const { token } = useAuth();
  const { journeyId, origenSeleccionado, destinoSeleccionado, fecha, pasajeros, journey } = route.params;

  const [journeyDetails, setJourneyDetails] = useState<JourneyDetails | null>(null);
  const [asientos, setAsientos] = useState<AsientoLocal[]>([]);
  const [asientosSeleccionados, setAsientosSeleccionados] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cantidadPasajeros = parseInt(pasajeros);

  // Cargar detalles del viaje
  useEffect(() => {
    loadJourneyDetails();
  }, []);

  const loadJourneyDetails = async () => {
    if (!token) return;

    try {
      setLoading(true);
      setError(null);

      const details = await getJourneyDetails(token, journeyId);
      setJourneyDetails(details);

      // Convertir asientos manteniendo su estado original
      const asientosLocales = details.asientos.map((seat) => {
        const fila = Math.ceil(seat.numero / 4);
        const columnaIndex = (seat.numero - 1) % 4;
        const columnas = ['A', 'B', 'C', 'D'];
        
        return {
          ...seat,
          estado: mapearEstadoAsiento(seat.estado), // Estado original del servidor
          fila,
          columna: columnas[columnaIndex],
          precio: details.precioPorTramo,
        } as AsientoLocal;
      });

      setAsientos(asientosLocales);
      console.log('Estados iniciales:', asientosLocales.map(a => ({numero: a.numero, estado: a.estado})));
      
    } catch (error) {
      console.error('Error loading journey details:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error al cargar detalles del viaje';
      setError(errorMessage);
      
      Alert.alert(
        'Error',
        errorMessage,
        [
          { text: 'Reintentar', onPress: loadJourneyDetails },
          { text: 'Volver', onPress: () => navigation?.goBack() }
        ]
      );
    } finally {
      setLoading(false);
    }
  };

  const mapearEstadoAsiento = (estadoAPI: string): EstadoAsiento => {
    switch (estadoAPI.toLowerCase()) {
      case 'disponible':
        return 'disponible';
      case 'ocupado':
      case 'vendido':
        return 'ocupado';
      case 'reservado':
        return 'reservado';
      default:
        return 'disponible';
    }
  };

  const handleSeleccionarAsiento = (numeroAsiento: number) => {
    console.log('=== CLICK EN ASIENTO ===');
    console.log('Número de asiento:', numeroAsiento);
    console.log('Seleccionados antes:', asientosSeleccionados);
    
    const asiento = asientos.find(a => a.numero === numeroAsiento);
    if (!asiento) return;

    // Solo permitir selección de asientos disponibles
    if (asiento.estado !== "disponible") {
      console.log('Asiento no disponible, estado:', asiento.estado);
      return;
    }

    const yaSeleccionado = asientosSeleccionados.includes(numeroAsiento);
    
    if (yaSeleccionado) {
      // Deseleccionar
      console.log('Deseleccionando asiento número:', numeroAsiento);
      setAsientosSeleccionados(prev => {
        const nuevos = prev.filter(num => num !== numeroAsiento);
        console.log('Nuevos seleccionados:', nuevos);
        return nuevos;
      });
    } else {
      // Seleccionar
      if (asientosSeleccionados.length >= cantidadPasajeros) {
        Alert.alert("Límite alcanzado", `Solo puedes seleccionar ${cantidadPasajeros} asiento(s)`);
        return;
      }
      console.log('Seleccionando asiento número:', numeroAsiento);
      setAsientosSeleccionados(prev => {
        const nuevos = [...prev, numeroAsiento];
        console.log('Nuevos seleccionados:', nuevos);
        return nuevos;
      });
    }
  };

  const renderAsiento = (numeroAsiento: number) => {
    const asiento = asientos.find((a) => a.numero === numeroAsiento);
    
    if (!asiento) {
      return <View style={styles.asientoVacio} key={`vacio-${numeroAsiento}`} />;
    }

    // Verificar si este NÚMERO de asiento está seleccionado
    const estaSeleccionado = asientosSeleccionados.includes(numeroAsiento);
    const estadoOriginal = asiento.estado;
    
    // Determinar estilos usando el número del asiento
    const estilosAsiento = [
      styles.asiento,
      estadoOriginal === "ocupado" && styles.asientoOcupado,
      estadoOriginal === "reservado" && styles.asientoReservado,
      estadoOriginal === "disponible" && estaSeleccionado && styles.asientoSeleccionado,
      estadoOriginal === "disponible" && !estaSeleccionado && styles.asientoDisponible,
    ].filter(Boolean);

    const estilosTexto = [
      styles.numeroAsiento,
      estadoOriginal === "disponible" && estaSeleccionado && styles.numeroAsientoSeleccionado,
      (estadoOriginal === "ocupado" || estadoOriginal === "reservado") && styles.numeroAsientoGris,
    ].filter(Boolean);

    const puedeClicar = estadoOriginal === "disponible";

    return (
      <TouchableOpacity
        key={`asiento-${asiento.id}-${numeroAsiento}`}
        style={estilosAsiento}
        onPress={() => {
          if (puedeClicar) {
            handleSeleccionarAsiento(numeroAsiento);
          }
        }}
        disabled={!puedeClicar}
      >
        <Text style={estilosTexto}>
          {numeroAsiento}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderFilaAsientos = (fila: number) => {
    const asientosBase = (fila - 1) * 4;
    
    return (
      <View key={`fila-${fila}`} style={styles.fila}>
        {[1, 2, 3, 4].map(i => renderAsiento(asientosBase + i))}
      </View>
    );
  };

  const handleFinalizarCompra = () => {
    if (asientosSeleccionados.length === 0) {
      Alert.alert("Error", "Debes seleccionar al menos un asiento");
      return;
    }
    
    if (asientosSeleccionados.length !== cantidadPasajeros) {
      Alert.alert(
        "Error", 
        `Debes seleccionar exactamente ${cantidadPasajeros} asiento(s). Has seleccionado ${asientosSeleccionados.length}.`
      );
      return;
    }

    const totalPrecio = asientosSeleccionados.length * (journeyDetails?.precioPorTramo || 0);
    const asientosSeleccionadosInfo = asientosSeleccionados
      .sort((a, b) => a - b)
      .join(', ');

    Alert.alert(
      "Confirmar Compra",
      `¿Proceder con la compra de ${asientosSeleccionados.length} asiento(s) (${asientosSeleccionadosInfo}) por $${totalPrecio.toFixed(2)}?`,
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Confirmar", 
          onPress: () => {
            Alert.alert("Éxito", "Redirigiendo al procesamiento de pago...");
          }
        }
      ]
    );
  };

  const totalFilas = asientos.length > 0 ? Math.ceil(Math.max(...asientos.map(a => a.numero)) / 4) : 1;

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar backgroundColor="#4285F4" barStyle="light-content" />
        <ImageBackground 
          source={require('../assets/background.png')} 
          style={styles.backgroundImage}
        >
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#10B981" />
            <Text style={styles.loadingText}>Cargando información del viaje...</Text>
          </View>
        </ImageBackground>
      </SafeAreaView>
    );
  }

  if (error || !journeyDetails) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar backgroundColor="#4285F4" barStyle="light-content" />
        <ImageBackground 
          source={require('../assets/background.png')} 
          style={styles.backgroundImage}
        >
          <View style={styles.errorContainer}>
            <Icon name="error-outline" size={64} color="#EF4444" />
            <Text style={styles.errorTitle}>Error al cargar</Text>
            <Text style={styles.errorMessage}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={loadJourneyDetails}>
              <Text style={styles.retryButtonText}>Reintentar</Text>
            </TouchableOpacity>
          </View>
        </ImageBackground>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#4285F4" barStyle="light-content" />
      <ImageBackground 
        source={require('../assets/background.png')} 
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollViewContent}
          showsVerticalScrollIndicator={true}
          bounces={true}
        >
              <View style={styles.cardContainer}>
                {/* Header */}
                <View style={styles.headerContainer}>
                  <TouchableOpacity style={styles.backButton} onPress={() => navigation?.goBack()}>
                    <Icon name="arrow-back" size={24} color="#374151" />
                  </TouchableOpacity>
                  <Text style={styles.headerTitle}>Selección de Asientos</Text>
                  <View style={styles.placeholder} />
                </View>

                {/* Información del viaje */}
                <View style={styles.journeyInfoContainer}>
                  <View style={styles.journeyInfoRow}>
                    <Icon name="directions-bus" size={20} color="#10B981" />
                    <Text style={styles.journeyInfoText}>
                      {origenSeleccionado.nombreConDepartamento} → {destinoSeleccionado.nombreConDepartamento}
                    </Text>
                  </View>
                  <View style={styles.journeyInfoRow}>
                    <Icon name="event" size={20} color="#6B7280" />
                    <Text style={styles.journeyInfoText}>Salida: {formatDateTime(journeyDetails.fechaHoraSalida).split(' ')[0]}</Text>
                    <Icon name="access-time" size={20} color="#6B7280" />
                    <Text style={styles.journeyInfoText}>{formatDateTime(journeyDetails.fechaHoraSalida).split(' ')[1]}</Text>
                  </View>
                  <View style={styles.journeyInfoRow}>
                    <Icon name="event" size={20} color="#6B7280" />
                    <Text style={styles.journeyInfoText}>Llegada: {formatDateTime(journeyDetails.fechaHoraLlegada).split(' ')[0]}</Text>
                    <Icon name="access-time" size={20} color="#6B7280" />
                    <Text style={styles.journeyInfoText}>{formatDateTime(journeyDetails.fechaHoraLlegada).split(' ')[1]}</Text>
                  </View>
                  <View style={styles.journeyInfoRow}>
                    <Icon name="group" size={20} color="#4285F4" />
                    <Text style={styles.journeyInfoText}>
                      {cantidadPasajeros - asientosSeleccionados.length === 0
                        ? 'Asientos seleccionados'
                        : `Selecciona ${cantidadPasajeros - asientosSeleccionados.length} asiento${(cantidadPasajeros - asientosSeleccionados.length) !== 1 ? 's' : ''} más`}
                    </Text>
                  </View>
                </View>

                {/* Panel de asientos seleccionados */}
                {asientosSeleccionados.length > 0 && (
                  <View style={styles.selectedSeatsContainer}>
                    <Text style={styles.selectedSeatsTitle}>Asientos Seleccionados</Text>
                    <View style={styles.selectedSeatsGrid}>
                      {asientosSeleccionados
                        .sort((a, b) => a - b)
                        .map(numeroAsiento => (
                          <View key={numeroAsiento} style={styles.selectedSeatBadge}>
                            <Icon name="event-seat" size={12} color="#4285F4" />
                            <Text style={styles.selectedSeatNumber}>{numeroAsiento}</Text>
                          </View>
                        ))}
                    </View>
                  </View>
                )}

                {/* Vista del bus */}
                <View style={styles.busSection}>
                  <Text style={styles.busSectionTitle}>Ómnibus</Text>
                  <View style={styles.busContainer}>
                    <View style={styles.busShape}>
                      {/* Volante del conductor */}
                      <View style={styles.volante}>
                        <Image 
                          source={require('../assets/Volante.png')} 
                          style={styles.volanteImage}
                        />
                        <Text style={styles.conductorText}>Conductor</Text>
                      </View>

                      {/* Asientos */}
                      <View style={styles.asientosContainer}>
                        {Array.from({ length: totalFilas }, (_, index) => index + 1).map(renderFilaAsientos)}
                      </View>
                    </View>
                  </View>
                </View>

                {/* Resumen y botón */}
                <View style={styles.footerSection}>
                  <View style={styles.resumen}>
                    <Text style={styles.resumenTexto}>Total a pagar</Text>
                    <Text style={styles.precio}>
                      ${(asientosSeleccionados.length * (journeyDetails?.precioPorTramo || 0)).toFixed(2)}
                    </Text>
                  </View>
                  <TouchableOpacity 
                    style={[
                      styles.finalizarButton,
                      asientosSeleccionados.length !== cantidadPasajeros && styles.finalizarButtonDisabled
                    ]} 
                    onPress={handleFinalizarCompra}
                    disabled={asientosSeleccionados.length !== cantidadPasajeros}
                  >
                    <Text style={styles.finalizarButtonText}>Finalizar Compra</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
    padding: 16,
    paddingBottom: 40,
  },
  cardContainer: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 16,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    alignSelf: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 16,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#374151",
    textAlign: "center",
  },
  placeholder: {
    width: 40,
  },
  journeyInfoContainer: {
    backgroundColor: "#ECFDF5",
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: "#10B981",
    marginBottom: 20,
  },
  journeyInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  journeyInfoText: {
    fontSize: 14,
    color: '#059669',
    marginLeft: 8,
    flex: 1,
  },
  selectedSeatsContainer: {
    backgroundColor: "#EBF4FF",
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: "#4285F4",
    marginBottom: 20,
  },
  selectedSeatsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1E40AF",
    marginBottom: 12,
  },
  selectedSeatsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  selectedSeatBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DBEAFE',
    borderColor: '#4285F4',
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  selectedSeatNumber: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4285F4',
    marginLeft: 4,
  },
  busSection: {
    marginBottom: 20,
  },
  busSectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#374151",
    textAlign: "center",
    marginBottom: 16,
  },
  busContainer: {
    alignItems: 'center',
  },
  busShape: {
    borderWidth: 2,
    borderColor: '#374151',
    borderRadius: 20,
    padding: 14,
    backgroundColor: '#F9FAFB',
    alignSelf: 'center',
    minWidth: 'auto',
  },
  volante: {
    alignItems: 'flex-start',
    marginBottom: 12,
    paddingLeft: 20,
  },
  volanteImage: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
  },
  conductorText: {
    fontSize: 10,
    color: '#6B7280',
    marginTop: 4,
    textAlign: 'center',
  },
  asientosContainer: {
    gap: 8,
  },
  fila: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 8,
  },
  asiento: {
    width: 36,
    height: 36,
    borderWidth: 2,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  asientoDisponible: {
    borderColor: '#4285F4',
    backgroundColor: 'white',
  },
  asientoSeleccionado: {
    borderColor: '#4285F4',
    backgroundColor: '#4285F4',
  },
  asientoOcupado: {
    borderColor: '#9CA3AF',
    backgroundColor: '#F3F4F6',
  },
  asientoReservado: {
    borderColor: '#9CA3AF',
    backgroundColor: '#F3F4F6',
  },
  asientoVacio: {
    width: 36,
    height: 36,
  },
  numeroAsiento: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
  numeroAsientoSeleccionado: {
    color: 'white',
  },
  numeroAsientoGris: {
    color: '#6B7280',
  },
  footerSection: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 16,
  },
  resumen: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  resumenTexto: {
    fontSize: 16,
    color: '#374151',
    flex: 1,
    fontWeight: 'bold',
  },
  precio: {
    fontSize: 18,
    fontWeight: '700',
    color: '#10B981',
  },
  finalizarButton: {
    backgroundColor: '#10B981',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
  },
  finalizarButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  finalizarButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
});