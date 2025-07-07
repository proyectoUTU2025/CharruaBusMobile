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
  Linking,
  AppState,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAuth } from '../../context/AuthContext';
import { crearSesionStripe } from '../../services/paymentService';
import { getLimitePasajes, getDescuentoJubilado, getDescuentoEstudiante } from '../../services/configService';
import { useUser } from '../../hooks/useUser';
import { 
  getTripDetails,
  formatDateTime,
  calcularPrecioPorTramos
} from '../../services/tripService';
import { getUserById } from '../../services/userService';
import { RoundTripState } from '../../types/roundTripType';
import { EstadoAsiento, AsientoLocal, TripDetails } from '../../types/tripType';
import { SelectSeatScreenProps } from '../../types/screenPropsType';
import { UserApiResponse } from '../../types/userType';
import { styles } from './SelectSeatScreen.styles';

export function SelectSeatScreen({ route, navigation, onWentToPayment }: SelectSeatScreenProps & { onWentToPayment?: () => void }) {
  const { token } = useAuth();
  const { user, loading: userLoading } = useUser();
  const { tripId, origenSeleccionado, destinoSeleccionado, fecha, pasajeros, trip, tipoViaje, roundTripState } = route.params;

  const [tripDetails, setTripDetails] = useState<TripDetails | null>(null);
  const [asientos, setAsientos] = useState<AsientoLocal[]>([]);
  const [asientosSeleccionados, setAsientosSeleccionados] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [limitePasajes, setLimitePasajes] = useState<number>(4);
  const [descuentoJubilado, setDescuentoJubilado] = useState<number>(0);
  const [descuentoEstudiante, setDescuentoEstudiante] = useState<number>(0);
  const [configuracionesCargadas, setConfiguracionesCargadas] = useState(false);

  const [currentState, setCurrentState] = useState<RoundTripState | null>(roundTripState || null);

  const [wentToPayment, setWentToPayment] = useState(false);

  const [userApiData, setUserApiData] = useState<UserApiResponse | null>(null);
  const [loadingUserData, setLoadingUserData] = useState(false);

  const cantidadPasajeros = parseInt(pasajeros);

  const getCurrentStepInfo = () => {
    if (tipoViaje === 'ida-vuelta' && currentState) {
      if (currentState.currentStep === 'select-seat-ida') {
        return {
          title: 'Selección de Asientos - Ida',
          buttonText: 'Seleccionar viaje de vuelta',
          isLastStep: false
        };
      } else if (currentState.currentStep === 'select-seat-vuelta') {
        return {
          title: 'Selección de Asientos - Vuelta',
          buttonText: 'Finalizar Compra',
          isLastStep: true
        };
      }
    }
    
    return {
      title: 'Selección de Asientos',
      buttonText: 'Finalizar Compra',
      isLastStep: true
    };
  };

  const stepInfo = getCurrentStepInfo();

  const loadTripDetails = async (showLoadingIndicator = true) => {
    if (!token) return;

    try {
      if (showLoadingIndicator) {
        setLoading(true);
      }
      setError(null);

      const details = await getTripDetails(token, tripId);
      setTripDetails(details);

      const precioPorAsiento = calcularPrecioPorTramos(
        details.precioPorTramo,
        details.paradas,
        origenSeleccionado.id,
        destinoSeleccionado.id
      );

      const asientosLocales = details.asientos.map((seat) => {
        const estadoMapeado = mapearEstadoAsiento(seat.estado);
        const fila = Math.ceil(seat.numero / 4);
        const columnaIndex = (seat.numero - 1) % 4;
        const columnas = ['A', 'B', 'C', 'D'];
        
        return {
          ...seat,
          estado: estadoMapeado,
          fila,
          columna: columnas[columnaIndex],
          precio: precioPorAsiento,
        } as AsientoLocal;
      });

      setAsientos(asientosLocales);
      
      setAsientosSeleccionados([]);
      
    } catch (error) {
      console.error('Error loading trip details:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error al cargar detalles del viaje';
      setError(errorMessage);
      
      if (showLoadingIndicator) {
        Alert.alert(
          'Error',
          errorMessage,
          [
            { text: 'Reintentar', onPress: () => loadTripDetails(true) },
            { text: 'Volver', onPress: () => navigation?.goBack() }
          ]
        );
      }
    } finally {
      if (showLoadingIndicator) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    const handleAppStateChange = (nextAppState: string) => {
      if (nextAppState === 'active') {
        if (wentToPayment) {
          setWentToPayment(false);
          
          if (tipoViaje === 'ida-vuelta' && currentState && currentState.currentStep !== 'select-trip-ida') {
            const resetState: RoundTripState = {
              ...currentState,
              currentStep: 'select-trip-ida',
              viajeIda: {
                ...currentState.viajeIda!,
                tripId: undefined,
                trip: undefined,
                asientosSeleccionados: undefined
              },
              viajeVuelta: {
                ...currentState.viajeVuelta!,
                tripId: undefined,
                trip: undefined,
                asientosSeleccionados: undefined
              }
            };

            setTimeout(() => {
              if (navigation?.navigate) {
                navigation.navigate({
                  origenSeleccionado: resetState.viajeIda!.origenSeleccionado,
                  destinoSeleccionado: resetState.viajeIda!.destinoSeleccionado,
                  fecha: resetState.viajeIda!.fecha,
                  date: resetState.viajeIda!.date,
                  pasajeros: resetState.viajeIda!.pasajeros,
                  tipoViaje: 'ida-vuelta',
                  roundTripState: resetState,
                  wentToPayment: true,
                });
              }
            }, 500);
          } else {
            loadTripDetails(false);
          }
        } else {
          loadTripDetails(false);
        }
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  }, [tipoViaje, currentState, wentToPayment, navigation]);

  useEffect(() => {
    loadTripDetails();
  }, []);

  useEffect(() => {
    const loadUserData = async () => {
      if (!token || !user?.id) return;

      try {
        setLoadingUserData(true);
        const userData = await getUserById(token, user.id);
        setUserApiData(userData);
      } catch (error) {
        console.error('Error cargando datos del usuario:', error);
      } finally {
        setLoadingUserData(false);
      }
    };

    loadUserData();
  }, [token, user?.id]);

  useEffect(() => {
    const cargarConfiguraciones = async () => {
      if (!token) return;

      try {
        const [limite, descJubilado, descEstudiante] = await Promise.all([
          getLimitePasajes(token),
          getDescuentoJubilado(token),
          getDescuentoEstudiante(token)
        ]);

        setLimitePasajes(limite);
        setDescuentoJubilado(descJubilado);
        setDescuentoEstudiante(descEstudiante);
        setConfiguracionesCargadas(true);
        
      } catch (error) {
        console.error('Error cargando configuraciones:', error);
        setConfiguracionesCargadas(true);
      }
    };

    cargarConfiguraciones();
  }, [token, user]);

  const mapearEstadoAsiento = (estadoAPI: string): EstadoAsiento => {
    switch (estadoAPI.toUpperCase()) {
      case 'DISPONIBLE':
        return 'disponible';
      case 'RESERVADO':
        return 'reservado';
      case 'CONFIRMADO':
        return 'ocupado';
      default:
        console.warn(`Estado de asiento desconocido: ${estadoAPI}`);
        return 'ocupado';
    }
  };

  const calcularDescuentoPorUsuario = (precioTotal: number): { descuento: number, porcentaje: number } => {
    if (!configuracionesCargadas) {
      return { descuento: 0, porcentaje: 0 };
    }
    const situacionLaboral = userApiData?.situacionLaboral || user?.situacionLaboral;
    
    if (!situacionLaboral) {
      return { descuento: 0, porcentaje: 0 };
    }

    let porcentajeDescuento = 0;

    switch (situacionLaboral.toUpperCase()) {
      case 'JUBILADO':
        porcentajeDescuento = descuentoJubilado;
        break;
      case 'ESTUDIANTE':
        porcentajeDescuento = descuentoEstudiante;
        break;
      default:
        porcentajeDescuento = 0;
        break;
    }

    const descuento = (precioTotal * porcentajeDescuento) / 100;

    return { 
      descuento: Math.round(descuento * 100) / 100,
      porcentaje: porcentajeDescuento 
    };
  };

  const getInformacionPrecio = () => {
    const precioPorAsiento = getPrecioPorAsiento();
    const cantidadAsientos = asientosSeleccionados.length;
    const precioBase = precioPorAsiento * cantidadAsientos;
    
    const { descuento, porcentaje } = calcularDescuentoPorUsuario(precioBase);
    const precioFinal = precioBase - descuento;

    return {
      precioBase,
      descuentoTotal: descuento,
      precioFinal,
      porcentajeDescuento: porcentaje,
      precioPorAsiento,
      cantidadAsientos
    };
  };

  const handleSeleccionarAsiento = (numeroAsiento: number) => {
    const asiento = asientos.find(a => a.numero === numeroAsiento);
    if (!asiento) return;

    if (asiento.estado !== "disponible") {
      return;
    }

    const yaSeleccionado = asientosSeleccionados.includes(numeroAsiento);
    
    if (yaSeleccionado) {
      setAsientosSeleccionados(prev => prev.filter(num => num !== numeroAsiento));
    } else {
      if (asientosSeleccionados.length >= cantidadPasajeros) {
        Alert.alert("Límite alcanzado", `Solo puedes seleccionar ${cantidadPasajeros} asiento(s)`);
        return;
      }
      setAsientosSeleccionados(prev => [...prev, numeroAsiento]);
    }
  };

  const handleContinuar = async () => {
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

    if (tipoViaje === 'ida-vuelta' && currentState && !stepInfo.isLastStep) {
      const updatedState = { ...currentState };
      updatedState.viajeIda = {
        ...updatedState.viajeIda!,
        asientosSeleccionados: asientosSeleccionados
      };
      updatedState.currentStep = 'select-trip-vuelta';

      setCurrentState(updatedState);

      if (navigation?.navigate) {
        const viajeVueltaParams = {
          origenSeleccionado: updatedState.viajeVuelta!.origenSeleccionado,
          destinoSeleccionado: updatedState.viajeVuelta!.destinoSeleccionado,
          fecha: updatedState.viajeVuelta!.fecha,
          date: updatedState.viajeVuelta!.date,
          pasajeros,
          tipoViaje: 'ida-vuelta' as const,
          roundTripState: updatedState,
        };
        
        navigation.navigate(viajeVueltaParams);
      }
    } else {
      await handleFinalizarCompra();
    }
  };

  const handleFinalizarCompra = async () => {
    if (!user?.id) {
      Alert.alert("Error", "No se pudo identificar el usuario. Por favor, inicia sesión nuevamente.");
      return;
    }

    if (!origenSeleccionado?.id || !destinoSeleccionado?.id) {
      Alert.alert("Error", "Información de origen o destino incompleta.");
      return;
    }

    try {
      let payload;

      if (tipoViaje === 'ida-vuelta' && currentState) {
        if (!currentState.viajeIda?.asientosSeleccionados || currentState.viajeIda.asientosSeleccionados.length === 0) {
          Alert.alert("Error", "No hay asientos seleccionados para el viaje de ida.");
          return;
        }

        if (asientosSeleccionados.length === 0) {
          Alert.alert("Error", "No hay asientos seleccionados para el viaje de vuelta.");
          return;
        }

        if (!currentState.viajeVuelta?.tripId) {
          Alert.alert("Error", "No se ha seleccionado el viaje de vuelta.");
          return;
        }

        if (!currentState.viajeIda?.tripId) {
          Alert.alert("Error", "No se ha seleccionado el viaje de ida.");
          return;
        }

        payload = {
          viajeIdaId: currentState.viajeIda.tripId,
          viajeVueltaId: currentState.viajeVuelta.tripId,
          asientosIda: currentState.viajeIda.asientosSeleccionados,
          asientosVuelta: asientosSeleccionados,
          clienteId: parseInt(user.id),
          localidadOrigenId: currentState.viajeIda.origenSeleccionado.id,
          localidadDestinoId: currentState.viajeIda.destinoSeleccionado.id,
          paradaOrigenVueltaId: currentState.viajeVuelta.origenSeleccionado.id,
          paradaDestinoVueltaId: currentState.viajeVuelta.destinoSeleccionado.id,
        };
      } else {
        payload = {
          viajeIdaId: tripId,
          viajeVueltaId: null,
          asientosIda: asientosSeleccionados,
          asientosVuelta: [],
          clienteId: parseInt(user.id),
          localidadOrigenId: origenSeleccionado.id,
          localidadDestinoId: destinoSeleccionado.id,
          paradaOrigenVueltaId: null,
          paradaDestinoVueltaId: null,
        };
      }

      const { data } = await crearSesionStripe(token!, payload);
      const { sessionUrl } = data;

      if (!sessionUrl) {
        Alert.alert("Error", "No se pudo iniciar el pago.");
        return;
      }
      
      setWentToPayment(true);
      
      if (onWentToPayment) {
        onWentToPayment();
      }
      
      await Linking.openURL(sessionUrl);

    } catch (error) {
      
      let errorMessage = "Hubo un problema al procesar el pago. Intenta nuevamente.";
      let shouldReloadSeats = false;
      let isSeatsError = false;
      
      if (error instanceof Error) {
        const errorText = error.message;
        
        if (errorText.includes('no se pudieron reservar') || 
            errorText.includes('asientos solicitados') ||
            errorText.includes('asiento ya está ocupado') ||
            errorText.includes('asiento no disponible')) {

          isSeatsError = true;
          
          const reservedMatch = errorText.match(/reservar (\d+) de (\d+)/);
          if (reservedMatch) {
            const reserved = parseInt(reservedMatch[1]);
            const requested = parseInt(reservedMatch[2]);
            const notReserved = requested - reserved;
            
            if (reserved === 0) {
              if(cantidadPasajeros==1)
                errorMessage = `El asiento seleccionado ya está ocupado.`;
              else if (cantidadPasajeros>1)
                errorMessage = `Alguno de los asientos seleccionados ya fueron ocupados.`;
            } else {
              if (notReserved==1)
                errorMessage = `Solo se pudieron reservar ${reserved} de ${requested} asientos. ${notReserved} asiento ya fue ocupado.`;
              else if (notReserved>1)
                errorMessage = `Solo se pudieron reservar ${reserved} de ${requested} asientos. ${notReserved} asientos ya fueron ocupados.`;
            }
          } else {
            errorMessage = "Algunos de los asientos seleccionados ya están ocupados. La disponibilidad se actualizará automáticamente.";
          }
          
          shouldReloadSeats = true;
        } else {
          errorMessage = errorText;
        }
      }

      if (!isSeatsError) {
        console.error("Error al iniciar el pago:", error);
      }
      
      Alert.alert(
        "Error", 
        errorMessage,
        [
          {
            text: "Entendido",
            onPress: () => {
              if (shouldReloadSeats) {
                setAsientosSeleccionados([]);
                loadTripDetails(false);
              }
            }
          }
        ]
      );
    }
  };

const renderAsiento = (numeroAsiento: number) => {
  const asiento = asientos.find((a) => a.numero === numeroAsiento);
  
  if (!asiento) {
    return <View style={styles.asientoVacio} key={`vacio-${numeroAsiento}`} />;
  }

  const estaSeleccionado = asientosSeleccionados.includes(numeroAsiento);
  const estadoOriginal = asiento.estado;
  
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
      key={`asiento-${numeroAsiento}`}
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
        <View style={styles.filaNumber}>
          <Text style={styles.filaNumberText}>{fila}</Text>
        </View>
        <View style={styles.filaSeats}>
          {[1, 2, 3, 4].map(i => renderAsiento(asientosBase + i))}
        </View>
      </View>
    );
  };

  const getPrecioPorAsiento = (): number => {
    if (!tripDetails) return 0;
    
    return calcularPrecioPorTramos(
      tripDetails.precioPorTramo,
      tripDetails.paradas,
      origenSeleccionado.id,
      destinoSeleccionado.id
    );
  };

  const renderDesglosePrecio = () => {
    if (asientosSeleccionados.length === 0) return null;

    const info = getInformacionPrecio();
    const situacionLaboral = userApiData?.situacionLaboral || user?.situacionLaboral;

    if (tipoViaje === 'ida' || !currentState) {
      return (
        <View style={styles.desglosePrecio}>
          <View style={styles.lineaPrecio}>
            <Text style={styles.labelPrecio}>Precio pasaje</Text>
            <Text style={styles.valorPrecio}>${info.precioBase.toFixed(2)}</Text>
          </View>
          
          {info.descuentoTotal > 0 && (
            <View style={styles.lineaDescuento}>
              <Text style={styles.labelDescuento}>
                Descuento ({info.porcentajeDescuento}% - {situacionLaboral?.toLowerCase()})
              </Text>
              <Text style={styles.valorDescuento}>-${info.descuentoTotal.toFixed(2)}</Text>
            </View>
          )}
          
          <View style={styles.separador} />
          
          <View style={styles.lineaTotal}>
            <Text style={styles.labelTotal}>Total</Text>
            <Text style={styles.valorTotal}>${info.precioFinal.toFixed(2)}</Text>
          </View>
        </View>
      );
    }

    if (currentState.currentStep === 'select-seat-vuelta' && currentState.viajeIda) {
      const asientosIda = currentState.viajeIda.asientosSeleccionados?.length || 0;
      const precioPorAsientoIda = calcularPrecioPorTramos(
        tripDetails!.precioPorTramo,
        tripDetails!.paradas,
        currentState.viajeIda.origenSeleccionado.id,
        currentState.viajeIda.destinoSeleccionado.id
      );
      const precioBaseIda = precioPorAsientoIda * asientosIda;
      
      const precioBaseVuelta = info.precioBase;
      
      const precioBaseTotalConjunto = precioBaseIda + precioBaseVuelta;
      const { descuento: descuentoTotalConjunto, porcentaje } = calcularDescuentoPorUsuario(precioBaseTotalConjunto);
      const precioFinalTotalConjunto = precioBaseTotalConjunto - descuentoTotalConjunto;

      return (
        <View style={styles.desglosePrecio}>
          <View style={styles.lineaPrecio}>
            <Text style={styles.labelPrecio}>Precio pasaje ida</Text>
            <Text style={styles.valorPrecio}>${precioBaseIda.toFixed(2)}</Text>
          </View>
          
          <View style={styles.lineaPrecio}>
            <Text style={styles.labelPrecio}>Precio pasaje vuelta</Text>
            <Text style={styles.valorPrecio}>${precioBaseVuelta.toFixed(2)}</Text>
          </View>
          
          {descuentoTotalConjunto > 0 && (
            <View style={styles.lineaDescuento}>
              <Text style={styles.labelDescuento}>
                Descuento ({porcentaje}% - {situacionLaboral?.toLowerCase()})
              </Text>
              <Text style={styles.valorDescuento}>-${descuentoTotalConjunto.toFixed(2)}</Text>
            </View>
          )}
          
          <View style={styles.separador} />
          
          <View style={styles.lineaTotal}>
            <Text style={styles.labelTotal}>Total</Text>
            <Text style={styles.valorTotal}>${precioFinalTotalConjunto.toFixed(2)}</Text>
          </View>
        </View>
      );
    }

    if (currentState.currentStep === 'select-seat-ida') {
      return (
        <View style={styles.desglosePrecio}>
          <View style={styles.lineaPrecio}>
            <Text style={styles.labelPrecio}>Precio pasaje ida</Text>
            <Text style={styles.valorPrecio}>${info.precioBase.toFixed(2)}</Text>
          </View>
          
          <View style={styles.separador} />
          
          <View style={styles.lineaTotal}>
            <Text style={styles.labelTotal}>Subtotal ida</Text>
            <Text style={styles.valorTotal}>${info.precioBase.toFixed(2)}</Text>
          </View>
        </View>
      );
    }

    return null;
  };

  const renderRoundTripProgress = () => {
    if (tipoViaje !== 'ida-vuelta' || !currentState) return null;

    const idaCompleted = Boolean(
      currentState.viajeIda?.tripId && 
      currentState.viajeIda?.asientosSeleccionados &&
      currentState.currentStep !== 'select-trip-ida' &&
      currentState.currentStep !== 'select-seat-ida'
    );
    
    const vueltaCompleted = Boolean(
      currentState.viajeVuelta?.tripId && 
      currentState.viajeVuelta?.asientosSeleccionados
    );
    
    const idaActive = 
      currentState.currentStep === 'select-trip-ida' || 
      currentState.currentStep === 'select-seat-ida';
      
    const vueltaActive = 
      currentState.currentStep === 'select-trip-vuelta' || 
      currentState.currentStep === 'select-seat-vuelta';

    return (
      <View style={styles.progressContainer}>
        <View style={styles.progressSteps}>
          <View style={[
            styles.progressStep,
            idaCompleted && styles.progressStepCompleted,
            idaActive && !idaCompleted && styles.progressStepActive,
          ]}>
            <Text style={[
              styles.progressStepText,
              idaCompleted && styles.progressStepTextCompleted,
              idaActive && !idaCompleted && styles.progressStepTextActive,
            ]}>
              Ida
            </Text>
          </View>
          
          <View style={styles.progressLine} />
          
          <View style={[
            styles.progressStep,
            vueltaCompleted && styles.progressStepCompleted,
            vueltaActive && !vueltaCompleted && styles.progressStepActive,
          ]}>
            <Text style={[
              styles.progressStepText,
              vueltaCompleted && styles.progressStepTextCompleted,
              vueltaActive && !vueltaCompleted && styles.progressStepTextActive,
            ]}>
              Vuelta
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const totalFilas = asientos.length > 0 ? Math.ceil(Math.max(...asientos.map(a => a.numero)) / 4) : 1;

  if (loading || userLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar backgroundColor="#4285F4" barStyle="light-content" />
        <ImageBackground 
          source={require('../../assets/background.png')} 
          style={styles.backgroundImage}
        >
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#3B82F6" />
            <Text style={styles.loadingText}>Cargando información del viaje...</Text>
          </View>
        </ImageBackground>
      </SafeAreaView>
    );
  }

  if (error || !tripDetails) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar backgroundColor="#4285F4" barStyle="light-content" />
        <ImageBackground 
          source={require('../../assets/background.png')} 
          style={styles.backgroundImage}
        >
          <View style={styles.errorContainer}>
            <Icon name="error-outline" size={64} color="#EF4444" />
            <Text style={styles.errorTitle}>Error al cargar</Text>
            <Text style={styles.errorMessage}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={() => loadTripDetails(true)}>
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
        source={require('../../assets/background.png')} 
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
            <View style={styles.headerContainer}>
              <TouchableOpacity style={styles.backButton} onPress={() => navigation?.goBack()}>
                <Icon name="arrow-back" size={24} color="#374151" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>{stepInfo.title}</Text>
              <View style={styles.placeholder} />
            </View>

            {renderRoundTripProgress()}

            <View style={styles.tripInfoContainer}>
              <View style={styles.tripInfoRow}>
                <Icon name="directions-bus" size={20} color="#10B981" />
                <Text style={styles.tripInfoText}>
                  {origenSeleccionado.nombreConDepartamento} → {destinoSeleccionado.nombreConDepartamento}
                </Text>
              </View>
              <View style={styles.tripInfoRow}>
                <Icon name="event" size={20} color="#10B981" />
                <Text style={styles.tripInfoText}>Salida: {formatDateTime(tripDetails.fechaHoraSalida).split(' ')[0]}</Text>
                <Icon name="access-time" size={20} color="#10B981" />
                <Text style={styles.tripInfoText}>{formatDateTime(tripDetails.fechaHoraSalida).split(' ')[1]}</Text>
              </View>
              <View style={styles.tripInfoRow}>
                <Icon name="event" size={20} color="#10B981" />
                <Text style={styles.tripInfoText}>Llegada: {formatDateTime(tripDetails.fechaHoraLlegada).split(' ')[0]}</Text>
                <Icon name="access-time" size={20} color="#10B981" />
                <Text style={styles.tripInfoText}>{formatDateTime(tripDetails.fechaHoraLlegada).split(' ')[1]}</Text>
              </View>
              <View style={styles.tripInfoRow}>
                <Icon name="group" size={20} color="#10B981" />
                <Text style={styles.tripInfoText}>
                  {cantidadPasajeros - asientosSeleccionados.length === 0
                    ? 'Asientos seleccionados'
                    : `Selecciona ${cantidadPasajeros - asientosSeleccionados.length} asiento${(cantidadPasajeros - asientosSeleccionados.length) !== 1 ? 's' : ''} más`}
                </Text>
              </View>
            </View>

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

            <View style={styles.busSection}>
                <View style={styles.busShape}>
                  <View style={styles.conductorHeader}>
                    <View style={styles.volante}>
                      <Icon name="radio-button-unchecked" size={24} color="#F3B600" />
                      <Text style={styles.conductorText}>CONDUCTOR</Text>
                    </View>
                    <View style={styles.puertaIndicator}>
                      <Icon name="exit-to-app" size={12} color="#FFFFFF" />
                      <Text style={styles.puertaText}>Puerta</Text>
                    </View>
                  </View>

                  <View style={styles.asientosContainer}>
                    {Array.from({ length: totalFilas }, (_, index) => index + 1).map(renderFilaAsientos)}
                  </View>

                  <View style={styles.busFooter}>
                    <Icon name="warning" size={16} color="#EF4444" />
                    <Text style={styles.emergencyText}>Salida de Emergencia</Text>
                  </View>
              </View>

              <View style={styles.legendContainer}>
                <View style={styles.legendItem}>
                  <View style={[styles.legendSeat, styles.asientoDisponible]} />
                  <Text style={styles.legendText}>Disponible</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendSeat, styles.asientoSeleccionado]} />
                  <Text style={styles.legendText}>Seleccionado</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendSeat, styles.asientoOcupado]} />
                  <Text style={styles.legendText}>Ocupado</Text>
                </View>
              </View>
            </View>

            <View style={styles.footerSection}>
              {renderDesglosePrecio()}
              
              <TouchableOpacity 
                style={[
                  styles.finalizarButton,
                  asientosSeleccionados.length !== cantidadPasajeros && styles.finalizarButtonDisabled
                ]} 
                onPress={handleContinuar}
                disabled={asientosSeleccionados.length !== cantidadPasajeros}
              >
                <Text style={styles.finalizarButtonText}>
                  {stepInfo.buttonText}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </ImageBackground>
    </SafeAreaView>
  );
}