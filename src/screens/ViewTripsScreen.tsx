import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  SafeAreaView,
  ScrollView,
  ImageBackground,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
  AppState,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAuth } from '../context/AuthContext';
import { 
  searchTrips,
  formatDateTime,
  calculateTripDuration,
  formatDateForAPI 
} from '../services/tripService';
import { RoundTripState } from '../types/roundTripType';
import { ViewTripsScreenProps } from '../types/screenPropsType';
import { Trip, SearchTripsParams } from '../types/tripType';

export function ViewTripsScreen({ route, navigation, onGoBack }: ViewTripsScreenProps) {
  const { token } = useAuth();
  const { 
    origenSeleccionado, 
    destinoSeleccionado, 
    fecha, 
    date, 
    pasajeros, 
    tipoViaje,
    fechaIda,
    fechaVuelta,
    dateIda,
    dateVuelta,
    roundTripState 
  } = route.params;

  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [totalResults, setTotalResults] = useState(0);

  const [currentState, setCurrentState] = useState<RoundTripState | null>(roundTripState || null);

  const [wentToPayment, setWentToPayment] = useState(false);
  
  const [returnedFromPayment, setReturnedFromPayment] = useState(false);

  const formatPrice = (price: number): string => {
    return price.toFixed(2);
  };

  const getCurrentSearchData = () => {
    if (tipoViaje === 'ida-vuelta' && currentState) {
      if (currentState.currentStep === 'select-trip-ida') {
        return {
          origen: currentState.viajeIda!.origenSeleccionado,
          destino: currentState.viajeIda!.destinoSeleccionado,
          fecha: currentState.viajeIda!.date,
          fechaDisplay: currentState.viajeIda!.fecha,
          stepTitle: 'Seleccionar viaje de ida'
        };
      } else if (currentState.currentStep === 'select-trip-vuelta') {
        return {
          origen: currentState.viajeVuelta!.origenSeleccionado,
          destino: currentState.viajeVuelta!.destinoSeleccionado,
          fecha: currentState.viajeVuelta!.date,
          fechaDisplay: currentState.viajeVuelta!.fecha,
          stepTitle: 'Seleccionar viaje de vuelta'
        };
      }
    }
    
    return {
      origen: origenSeleccionado,
      destino: destinoSeleccionado,
      fecha: date,
      fechaDisplay: fecha,
      stepTitle: 'Viajes Disponibles'
    };
  };

  const searchData = getCurrentSearchData();

  const extraerFechaParaAPI = (fecha: string | Date | undefined, date: string | Date | undefined, fechaDisplay: string | undefined): string => {

    if (fecha) {
      return formatDateForAPI(fecha);
    }
    
    if (date) {
      return formatDateForAPI(date);
    }
    
    if (fechaDisplay) {
      try {
        return formatDateForAPI(fechaDisplay);
      } catch (error) {
        console.error('Error parseando fechaDisplay:', error);
        throw new Error(`Error al parsear fecha: ${fechaDisplay}`);
      }
    }
    
    throw new Error('No hay fecha disponible para la búsqueda');
  };

  useEffect(() => {
    const handleAppStateChange = (nextAppState: string) => {
      if (nextAppState === 'active' && wentToPayment) {
        
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

          setCurrentState(resetState);
          
          setReturnedFromPayment(true);

          setTimeout(() => {
            searchAvailableTrips(0, true);
          }, 500);
        } else {
          searchAvailableTrips(0, true);
        }
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  }, [tipoViaje, currentState, wentToPayment]);

  useEffect(() => {
    if (route.params?.wentToPayment) {
      setWentToPayment(true);
    }
  }, [route.params?.wentToPayment]);

  useEffect(() => {
    searchAvailableTrips();
  }, [currentState?.currentStep]);

  const searchAvailableTrips = async (page = 0, isRefresh = false, isLoadMore = false) => {
    if (!token) return;

    try {
      if (isRefresh) {
        setRefreshing(true);
      } else if (isLoadMore) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }
      setError(null);

      let fechaParaAPI: string;
      
      if (tipoViaje === 'ida-vuelta' && currentState) {
        if (currentState.currentStep === 'select-trip-ida') {
          const fechaIda = currentState.viajeIda?.date;
          if (!fechaIda) {
            console.error('Fecha de ida no disponible en currentState:', currentState.viajeIda);
            throw new Error('Fecha de ida no disponible');
          }
          fechaParaAPI = formatDateForAPI(fechaIda);
        } else if (currentState.currentStep === 'select-trip-vuelta') {
          const fechaVuelta = currentState.viajeVuelta?.date;
          if (!fechaVuelta) {
            console.error('Fecha de vuelta no disponible en currentState:', currentState.viajeVuelta);
            throw new Error('Fecha de vuelta no disponible');
          }
          fechaParaAPI = formatDateForAPI(fechaVuelta);
        } else {
          fechaParaAPI = extraerFechaParaAPI(searchData.fecha, date, searchData.fechaDisplay);
        }
      } else {
        fechaParaAPI = extraerFechaParaAPI(searchData.fecha, date, searchData.fechaDisplay);
      }

      if (!fechaParaAPI || fechaParaAPI === 'Invalid Date') {
        console.error('Fecha formateada inválida:', fechaParaAPI);
        throw new Error('Error al formatear la fecha para la búsqueda');
      }

      if (!searchData.origen?.id || !searchData.destino?.id) {
        console.error('IDs inválidos. origen:', searchData.origen, 'destino:', searchData.destino);
        throw new Error('IDs de origen o destino inválidos');
      }

      if (isNaN(parseInt(pasajeros)) || parseInt(pasajeros) <= 0) {
        console.error('Pasajeros inválido:', pasajeros);
        throw new Error('Número de pasajeros inválido');
      }

      const searchParams: SearchTripsParams = {
        idLocalidadOrigen: Number(searchData.origen.id),
        idLocalidadDestino: Number(searchData.destino.id),
        fechaViaje: fechaParaAPI,
        cantidadPasajes: parseInt(pasajeros),
        page,
        size: 10,
        sort: ['fechaHoraSalida,ASC'],
      };

      const response = await searchTrips(token, searchParams);
      
      if (isRefresh || page === 0) {
        setTrips(response.trips);
        setCurrentPage(0);
      } else {
        setTrips(prev => [...prev, ...response.trips]);
      }
      
      setHasMore(response.hasMore);
      setTotalResults(response.totalResults);
      setCurrentPage(response.currentPage);
      
      if (response.trips.length === 0 && page === 0) {
        setError('No se encontraron viajes disponibles para los criterios seleccionados.');
      }

    } catch (error) {
      console.error('Error completo al buscar viajes:', error);
      
      if (error instanceof Error) {
        console.error('Message:', error.message);
        console.error('Stack:', error.stack);
      }
      
      const errorMessage = error instanceof Error ? error.message : 'Error al buscar viajes';
      setError(errorMessage);
      
      if (!isLoadMore) {
        Alert.alert(
          'Error',
          errorMessage,
          [{ text: 'OK' }]
        );
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setRefreshing(false);
    }
  };

  const handleGoBack = () => {
    if (tipoViaje === 'ida-vuelta' && returnedFromPayment) {
      setReturnedFromPayment(false);
      if (onGoBack) {
        onGoBack();
      }
      return;
    }
    
    if (tipoViaje === 'ida-vuelta' && currentState && onGoBack) {
      if (currentState.currentStep === 'select-trip-ida') {
        onGoBack();
        return;
      }
      
      if (currentState.currentStep === 'select-trip-vuelta') {
        const resetState = {
          ...currentState,
          currentStep: 'select-seat-ida' as const,
          viajeVuelta: {
            ...currentState.viajeVuelta!,
            tripId: undefined,
            trip: undefined,
            asientosSeleccionados: undefined
          }
        };
        onGoBack(resetState);
        return;
      }
      
      onGoBack(currentState);
    } else if (onGoBack) {
      onGoBack();
    } else if (navigation) {
      navigation.goBack();
    }
  };

  const onRefresh = () => {
    searchAvailableTrips(0, true);
  };

  const handleLoadMore = () => {
    if (hasMore && !loadingMore && !loading) {
      const nextPage = currentPage + 1;
      searchAvailableTrips(nextPage, false, true);
    }
  };

  const handleSelectSeat = (trip: Trip) => {
    if (tipoViaje === 'ida-vuelta' && currentState) {
      const updatedState = { ...currentState };
      
      if (currentState.currentStep === 'select-trip-ida') {
        updatedState.viajeIda = {
          ...updatedState.viajeIda!,
          tripId: trip.idViaje,
          trip: trip
        };
        updatedState.currentStep = 'select-seat-ida';
      } else if (currentState.currentStep === 'select-trip-vuelta') {
        updatedState.viajeVuelta = {
          ...updatedState.viajeVuelta!,
          tripId: trip.idViaje,
          trip: trip
        };
        updatedState.currentStep = 'select-seat-vuelta';
      }

      setCurrentState(updatedState);

      if (navigation?.navigate) {
        const params = {
          tripId: trip.idViaje,
          origenSeleccionado: searchData.origen,
          destinoSeleccionado: searchData.destino,
          fecha: searchData.fechaDisplay,
          pasajeros,
          trip,
          tipoViaje: 'ida-vuelta',
          roundTripState: updatedState,
          onWentToPayment: () => setWentToPayment(true),
        };
        navigation.navigate(params);
      }
    } else {
      if (navigation?.navigate) {
        const params = {
          tripId: trip.idViaje,
          origenSeleccionado,
          destinoSeleccionado,
          fecha,
          pasajeros,
          trip,
          tipoViaje,
          onWentToPayment: () => setWentToPayment(true),
        };
        navigation.navigate(params);
      }
    }
  };

  const renderTripCard = (trip: Trip) => {
    const duration = calculateTripDuration(trip.fechaHoraSalida, trip.fechaHoraLlegada);
    
    return (
      <View
        key={trip.idViaje}
        style={styles.tripCard}
      >
        <View style={styles.tripHeader}>
          <View style={styles.routeContainer}>
            <Text style={styles.cityText} numberOfLines={1}>
              {trip.origen || ''}
            </Text>
            <Icon name="arrow-forward" size={18} color="#10B981" style={styles.arrowIcon} />
            <Text style={styles.cityText} numberOfLines={1}>
              {trip.destino || ''}
            </Text>
          </View>
          <Text style={styles.priceText}>
            ${formatPrice(trip.precioEstimado || 0)}
          </Text>
        </View>

        <View style={styles.tripDetails}>
          <View style={styles.timeContainer}>
            <View style={styles.timeInfo}>
              <Text style={styles.timeLabel}>Salida</Text>
              <Text style={styles.timeText} numberOfLines={2}>
                {formatDateTime(trip.fechaHoraSalida || '')}
              </Text>
            </View>
            
            <View style={styles.durationContainer}>
              <Icon name="schedule" size={14} color="#6B7280" />
              <Text style={styles.durationText}>{duration || ''}</Text>
            </View>
            
            <View style={styles.timeInfo}>
              <Text style={styles.timeLabel}>Llegada</Text>
              <Text style={styles.timeText} numberOfLines={2}>
                {formatDateTime(trip.fechaHoraLlegada || '')}
              </Text>
            </View>
          </View>

          <View style={styles.bottomRow}>
            <View style={styles.availabilityContainer}>
              <Icon 
                name="event-seat" 
                size={16} 
                color={trip.asientosDisponibles > 5 ? "#10B981" : "#F59E0B"} 
              />
              <Text style={[
                styles.availabilityText,
                { color: trip.asientosDisponibles > 5 ? "#10B981" : "#F59E0B" }
              ]} numberOfLines={1}>
                {trip.asientosDisponibles} asientos disponibles
              </Text>
            </View>
            
            <TouchableOpacity 
              style={styles.selectButton}
              activeOpacity={0.7}
              onPress={() => handleSelectSeat(trip)}
            >
              <Text style={styles.selectButtonText}>Seleccionar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  const renderLoadMoreButton = () => {
    if (!hasMore || loading) return null;

    return (
      <TouchableOpacity 
        style={styles.loadMoreButton}
        onPress={handleLoadMore}
        disabled={loadingMore}
      >
        {loadingMore ? (
          <View style={styles.loadMoreContent}>
            <ActivityIndicator size="small" color="#10B981" />
            <Text style={styles.loadMoreText}>Cargando más...</Text>
          </View>
        ) : (
          <Text style={styles.loadMoreText}>Cargar más viajes</Text>
        )}
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyStateContainer}>
      <Icon name="search-off" size={64} color="#9CA3AF" />
      <Text style={styles.emptyStateTitle}>No hay viajes disponibles</Text>
      <Text style={styles.emptyStateMessage}>
        No se encontraron viajes para los criterios seleccionados. 
        Intenta con otra fecha o destino.
      </Text>
      <TouchableOpacity 
        style={styles.retryButton}
        onPress={() => searchAvailableTrips()}
      >
        <Text style={styles.retryButtonText}>Buscar nuevamente</Text>
      </TouchableOpacity>
    </View>
  );

  const renderError = () => (
    <View style={styles.errorContainer}>
      <Icon name="error-outline" size={64} color="#EF4444" />
      <Text style={styles.errorTitle}>Viajes no disponibles</Text>
      <Text style={styles.errorMessage}>{error}</Text>
      <TouchableOpacity 
        style={styles.retryButton}
        onPress={() => searchAvailableTrips()}
      >
        <Text style={styles.retryButtonText}>Reintentar</Text>
      </TouchableOpacity>
    </View>
  );

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

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#4285F4" barStyle="light-content" />
      <ImageBackground 
        source={require('../assets/background.png')} 
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
            <Icon name="arrow-back" size={24} color="#374151" />
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {searchData.stepTitle || 'Viajes Disponibles'}
          </Text>
          <View style={styles.placeholder} />
        </View>

        {/* Progress indicator for round trip */}
        {renderRoundTripProgress()}

        {/* Search Summary */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Ruta:</Text>
            <Text style={styles.summaryValue} numberOfLines={2}>
              {searchData.origen?.nombreConDepartamento || ''} → {searchData.destino?.nombreConDepartamento || ''}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Fecha:</Text>
            <Text style={styles.summaryValue}>{searchData.fechaDisplay || ''}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Pasajeros:</Text>
            <Text style={styles.summaryValue}>{pasajeros || ''}</Text>
          </View>
        </View>

        {/* Content */}
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollViewContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#10B981" />
              <Text style={styles.loadingText}>Buscando viajes disponibles...</Text>
            </View>
          ) : error && trips.length === 0 ? (
            renderError()
          ) : trips.length === 0 ? (
            renderEmptyState()
          ) : (
            <View style={styles.tripsContainer}>
              <Text style={styles.resultsTitle}>
                {totalResults} viaje{totalResults !== 1 ? 's' : ''} encontrado{totalResults !== 1 ? 's' : ''}
                {hasMore ? ` (mostrando ${trips.length})` : ''}
              </Text>
              {trips.map(renderTripCard)}
              {renderLoadMoreButton()}
            </View>
          )}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    minHeight: 56,
  },
  backButton: {
    padding: 8,
    minWidth: 40,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 8,
  },
  placeholder: {
    width: 40,
  },
  progressContainer: {
    backgroundColor: '#F0F9FF',
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#3B82F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  progressSteps: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressStep: {
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  progressStepActive: {
    backgroundColor: '#3B82F6',
  },
  progressStepCompleted: {
    backgroundColor: '#10B981',
  },
  progressStepText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  progressStepTextActive: {
    color: 'white',
  },
  progressStepTextCompleted: {
    color: 'white',
  },
  progressLine: {
    width: 40,
    height: 2,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 8,
  },
  summaryCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
    minHeight: 20,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
    minWidth: 80,
  },
  summaryValue: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
    marginLeft: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 16,
    textAlign: 'center',
  },
  tripsContainer: {
    paddingVertical: 8,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 16,
    textAlign: 'center',
  },
  tripCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    minHeight: 120,
  },
  tripHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  routeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  cityText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    flex: 1,
    textAlign: 'center',
  },
  arrowIcon: {
    marginHorizontal: 4,
  },
  priceText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#10B981',
    minWidth: 80,
    textAlign: 'right',
  },
  tripDetails: {
    gap: 12,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeInfo: {
    alignItems: 'center',
    flex: 1,
  },
  timeLabel: {
    fontSize: 11,
    color: '#6B7280',
    marginBottom: 4,
  },
  timeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
  },
  durationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    flex: 0.8,
  },
  durationText: {
    fontSize: 11,
    color: '#6B7280',
    marginLeft: 4,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  availabilityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  availabilityText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 6,
  },
  selectButton: {
    backgroundColor: '#10B981',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginLeft: 8,
  },
  selectButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
    marginLeft: 6,
  },
  loadMoreButton: {
    backgroundColor: '#ffffff',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginTop: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#a6a6a6',
  },
  loadMoreContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadMoreText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#a6a6a6',
    marginLeft: 8,
  },
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateMessage: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
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
});