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
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAuth } from '../context/AuthContext';
import { 
  searchJourneys, 
  Journey, 
  SearchJourneysParams,
  formatDateTime,
  calculateJourneyDuration,
  formatDateForAPI 
} from '../services/journeyService';

interface ViewTripsScreenProps {
  route: {
    params: {
      origenSeleccionado: any;
      destinoSeleccionado: any;
      fecha: string;
      date: string;
      pasajeros: string;
    };
  };
  navigation?: {
    goBack: () => void;
    navigate?: (params: any) => void;
  };
  onGoBack?: () => void;
}

export function ViewTripsScreen({ route, navigation, onGoBack }: ViewTripsScreenProps) {
  const { token } = useAuth();
  const { origenSeleccionado, destinoSeleccionado, fecha, date, pasajeros } = route.params;

  const [journeys, setJourneys] = useState<Journey[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [totalResults, setTotalResults] = useState(0);

  const formatPrice = (price: number): string => {
    return price.toFixed(2);
  };

  // Buscar viajes con paginación
  const searchAvailableJourneys = async (page = 0, isRefresh = false, isLoadMore = false) => {
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

      const searchParams: SearchJourneysParams = {
        idLocalidadOrigen: origenSeleccionado.id,
        idLocalidadDestino: destinoSeleccionado.id,
        fechaViaje: formatDateForAPI(date),
        cantidadPasajes: parseInt(pasajeros),
        page,
        size: 10,
        sort: ['fechaHoraSalida,ASC'],
      };

      const response = await searchJourneys(token, searchParams);
      
      if (isRefresh || page === 0) {
        // Nueva búsqueda o refresh
        setJourneys(response.journeys);
        setCurrentPage(0);
      } else {
        // Cargar más resultados
        setJourneys(prev => [...prev, ...response.journeys]);
      }
      
      setHasMore(response.hasMore);
      setTotalResults(response.totalResults);
      setCurrentPage(response.currentPage);
      
      if (response.journeys.length === 0 && page === 0) {
        setError('No se encontraron viajes disponibles para los criterios seleccionados.');
      }
    } catch (error) {
      console.error('Error searching journeys:', error);
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

  useEffect(() => {
    searchAvailableJourneys();
  }, []);

  const handleGoBack = () => {
    if (onGoBack) {
      onGoBack();
    } else if (navigation) {
      navigation.goBack();
    }
  };

  const onRefresh = () => {
    searchAvailableJourneys(0, true);
  };

  const handleLoadMore = () => {
    if (hasMore && !loadingMore && !loading) {
      const nextPage = currentPage + 1;
      searchAvailableJourneys(nextPage, false, true);
    }
  };

  const handleSelectSeat = (journey: Journey) => {
    console.log('=== handleSelectSeat called ===');
    console.log('Journey:', journey);
    console.log('Navigation object:', navigation);
    console.log('Navigation.navigate exists:', !!navigation?.navigate);
    
    if (navigation?.navigate) {
      const params = {
        journeyId: journey.idViaje,
        origenSeleccionado,
        destinoSeleccionado,
        fecha,
        pasajeros,
        journey
      };
      console.log('Calling navigate with params:', params);
      navigation.navigate(params);
    } else {
      console.log('Navigation.navigate not available');
    }
  };

  const renderJourneyCard = (journey: Journey) => {
    const duration = calculateJourneyDuration(journey.fechaHoraSalida, journey.fechaHoraLlegada);
    
    return (
      <View
        key={journey.idViaje}
        style={styles.journeyCard}
      >
        <View style={styles.journeyHeader}>
          <View style={styles.routeContainer}>
            <Text style={styles.cityText} numberOfLines={1}>{journey.origen}</Text>
            <Icon name="arrow-forward" size={18} color="#10B981" style={styles.arrowIcon} />
            <Text style={styles.cityText} numberOfLines={1}>{journey.destino}</Text>
          </View>
          <Text style={styles.priceText}>${formatPrice(journey.precioEstimado)}</Text>
        </View>

        <View style={styles.journeyDetails}>
          <View style={styles.timeContainer}>
            <View style={styles.timeInfo}>
              <Text style={styles.timeLabel}>Salida</Text>
              <Text style={styles.timeText} numberOfLines={2}>
                {formatDateTime(journey.fechaHoraSalida)}
              </Text>
            </View>
            
            <View style={styles.durationContainer}>
              <Icon name="schedule" size={14} color="#6B7280" />
              <Text style={styles.durationText}>{duration}</Text>
            </View>
            
            <View style={styles.timeInfo}>
              <Text style={styles.timeLabel}>Llegada</Text>
              <Text style={styles.timeText} numberOfLines={2}>
                {formatDateTime(journey.fechaHoraLlegada)}
              </Text>
            </View>
          </View>

          <View style={styles.bottomRow}>
            <View style={styles.availabilityContainer}>
              <Icon 
                name="event-seat" 
                size={16} 
                color={journey.asientosDisponibles > 5 ? "#10B981" : "#F59E0B"} 
              />
              <Text style={[
                styles.availabilityText,
                { color: journey.asientosDisponibles > 5 ? "#10B981" : "#F59E0B" }
              ]} numberOfLines={1}>
                {journey.asientosDisponibles} asientos disponibles
              </Text>
            </View>
            
            <TouchableOpacity 
              style={styles.selectButton}
              activeOpacity={0.7}
              onPress={() => handleSelectSeat(journey)}
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
        onPress={() => searchAvailableJourneys()}
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
        onPress={() => searchAvailableJourneys()}
      >
        <Text style={styles.retryButtonText}>Reintentar</Text>
      </TouchableOpacity>
    </View>
  );

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
          <Text style={styles.headerTitle} numberOfLines={1}>Viajes Disponibles</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Search Summary */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Ruta:</Text>
            <Text style={styles.summaryValue} numberOfLines={2}>
              {origenSeleccionado.nombreConDepartamento} → {destinoSeleccionado.nombreConDepartamento}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Fecha:</Text>
            <Text style={styles.summaryValue}>{fecha}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Pasajeros:</Text>
            <Text style={styles.summaryValue}>{pasajeros}</Text>
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
          ) : error && journeys.length === 0 ? (
            renderError()
          ) : journeys.length === 0 ? (
            renderEmptyState()
          ) : (
            <View style={styles.journeysContainer}>
              <Text style={styles.resultsTitle}>
                {totalResults} viaje{totalResults !== 1 ? 's' : ''} encontrado{totalResults !== 1 ? 's' : ''}
                {hasMore && ` (mostrando ${journeys.length})`}
              </Text>
              {journeys.map(renderJourneyCard)}
              {renderLoadMoreButton()}
            </View>
          )}
        </ScrollView>
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // ... todos los estilos existentes ...
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
  journeysContainer: {
    gap: 12,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 16,
    textAlign: 'center',
  },
  journeyCard: {
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
  journeyHeader: {
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
  journeyDetails: {
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
  // Nuevos estilos para paginación
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