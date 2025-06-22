import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
  ActivityIndicator,
  Dimensions,
  ImageBackground,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAuth } from '../context/AuthContext';
import { 
  getTicketDetail,
  formatTicketDateTime,
  formatTicketDate,
  formatTicketTime,
  formatPrice,
  getEstadoPasajeColor,
  getEstadoPasajeIcon,
  getEstadoPasajeDescription,
  downloadTicketPdf
} from '../services/ticketService';
import { TicketDetail, TicketScreenProps } from '../types/ticketType';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const TicketDetailScreen: React.FC<TicketScreenProps> = ({ route, navigation }) => {
  const { ticketId } = route.params;
  const { token } = useAuth();
  
  const [ticket, setTicket] = useState<TicketDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  useEffect(() => {
    loadTicketDetail();
  }, [ticketId]);

  const loadTicketDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      const ticketData = await getTicketDetail(token, ticketId);
      setTicket(ticketData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      console.error('Error cargando detalle de pasaje:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadTicketPdf = async () => {
    if (!token) {
      Alert.alert('Error', 'No hay token de autenticación');
      return;
    }

    try {
      setDownloadingPdf(true);
      const success = await downloadTicketPdf(token, ticketId);
      
      if (!success) {
        Alert.alert('Error', 'No se pudo descargar el PDF del pasaje');
      }
    } catch (error) {
      console.error('Error descargando PDF de pasaje:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      Alert.alert('Error', `No se pudo descargar el PDF: ${errorMessage}`);
    } finally {
      setDownloadingPdf(false);
    }
  };

  const handleGoBack = () => {
    if (navigation?.reset) {
      navigation.reset({
        index: 0,
        routes: [
          { name: 'Main', params: { initialTab: 'pasajes' } }
        ],
      });
    }
  };

  const handleGoHome = () => {
    if (navigation?.reset) {
      navigation.reset({
        index: 0,
        routes: [{ name: 'Main' }],
      });
    }
  };

  const renderError = () => (
    <View style={styles.centerContainer}>
      <View style={styles.errorContainer}>
        <Icon name="error-outline" size={screenWidth * 0.16} color="#F44336" />
        <Text style={styles.errorTitle}>Error al cargar</Text>
        <Text style={styles.errorMessage}>{error}</Text>
        <View style={styles.errorButtonsContainer}>
          <TouchableOpacity style={styles.retryButton} onPress={loadTicketDetail}>
            <Icon name="refresh" size={20} color="white" />
            <Text style={styles.retryButtonText}>Reintentar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.goBackButton} onPress={handleGoBack}>
            <Icon name="home" size={20} color="white" />
            <Text style={styles.goBackButtonText}>Ir al Inicio</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderLoading = () => (
    <View style={styles.centerContainer}>
      <ActivityIndicator size="large" color="#3B82F6" />
      <Text style={styles.loadingText}>Cargando detalle del pasaje...</Text>
    </View>
  );

  const renderTicketHeader = () => {
    if (!ticket) return null;

    const estadoColor = getEstadoPasajeColor(ticket.estadoPasaje);
    const estadoIcon = getEstadoPasajeIcon(ticket.estadoPasaje);
    const estadoDescription = getEstadoPasajeDescription(ticket.estadoPasaje);

    return (
      <View style={styles.headerCard}>
        <View style={styles.statusContainer}>
          <View style={[styles.statusBadge, { backgroundColor: estadoColor }]}>
            <Icon 
              name={estadoIcon} 
              size={20} 
              color="white" 
            />
            <Text style={styles.statusText}>
              {ticket.estadoPasaje}
            </Text>
          </View>
          <Text style={styles.ticketId}>#{ticket.id}</Text>
        </View>
        
        <View style={styles.statusDescriptionContainer}>
          <Text style={[styles.statusDescription, { color: estadoColor }]}>
            {estadoDescription}
          </Text>
        </View>
        
        <View style={styles.priceSection}>
          <Text style={styles.totalLabel}>Precio Final</Text>
          <Text style={styles.totalPrice}>{formatPrice(ticket.subtotal)}</Text>
          {ticket.descuento > 0 && (
            <Text style={styles.originalPrice}>
              Original: {formatPrice(ticket.precio)}
            </Text>
          )}
        </View>
        
        <View style={styles.dateSection}>
          <Icon name="event" size={16} color="#6B7280" />
          <Text style={styles.dateText}>
            {formatTicketDateTime(ticket.fecha)}
          </Text>
        </View>
      </View>
    );
  };

  const renderTicketInfo = () => {
    if (!ticket) return null;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Información del Pasaje</Text>
        
        <View style={styles.infoCard}>
          {/* Ruta del viaje */}
          <View style={styles.routeContainer}>
            <View style={styles.routeHeader}>
              <Icon name="route" size={20} color="#3B82F6" />
              <Text style={styles.routeTitle}>Ruta del Viaje</Text>
            </View>
            <View style={styles.routeDetails}>
              <View style={styles.routePoint}>
                <Icon name="trip-origin" size={16} color="#4CAF50" />
                <Text style={styles.routeText}>{ticket.paradaOrigen}</Text>
              </View>
              <View style={styles.routeArrow}>
                <Icon name="arrow-forward" size={16} color="#9E9E9E" />
              </View>
              <View style={styles.routePoint}>
                <Icon name="place" size={16} color="#F44336" />
                <Text style={styles.routeText}>{ticket.paradaDestino}</Text>
              </View>
            </View>
          </View>

          {/* Información del asiento */}
          <View style={styles.seatContainer}>
            <View style={styles.seatHeader}>
              <Icon name="airline-seat-recline-normal" size={20} color="#3B82F6" />
              <Text style={styles.seatTitle}>Asiento Asignado</Text>
            </View>
            <View style={styles.seatBadge}>
              <Text style={styles.seatNumber}>{ticket.numeroAsiento}</Text>
            </View>
          </View>

          {/* Información adicional */}
          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>ID Compra</Text>
              <Text style={styles.infoValue}>#{ticket.compraId}</Text>
            </View>
            
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Fecha de Viaje</Text>
              <Text style={styles.infoValue}>
                {formatTicketDate(ticket.fecha)}
              </Text>
            </View>
            
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Hora de Viaje</Text>
              <Text style={styles.infoValue}>
                {formatTicketTime(ticket.fecha)}
              </Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  const renderPricingDetails = () => {
    if (!ticket) return null;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Detalles de Precio</Text>
        
        <View style={styles.pricingCard}>
          <View style={styles.pricingRow}>
            <Text style={styles.pricingLabel}>Precio Base</Text>
            <Text style={styles.pricingValue}>{formatPrice(ticket.precio)}</Text>
          </View>
          
          {ticket.descuento > 0 && (
            <View style={styles.pricingRow}>
              <Text style={styles.pricingLabel}>Descuento Aplicado</Text>
              <Text style={[styles.pricingValue, styles.discountText]}>
                -{formatPrice(ticket.descuento)}
              </Text>
            </View>
          )}
          
          <View style={styles.pricingDivider} />
          
          <View style={styles.pricingRow}>
            <Text style={[styles.pricingLabel, styles.totalLabel]}>Total Pagado</Text>
            <Text style={[styles.pricingValue, styles.totalText]}>
              {formatPrice(ticket.subtotal)}
            </Text>
          </View>
          
          {ticket.fueReembolsado && ticket.montoReintegrado > 0 && (
            <>
              <View style={styles.pricingDivider} />
              <View style={styles.pricingRow}>
                <Text style={styles.pricingLabel}>Monto Reintegrado</Text>
                <Text style={[styles.pricingValue, styles.refundText]}>
                  {formatPrice(ticket.montoReintegrado)}
                </Text>
              </View>
              {ticket.fechaDevolucion && (
                <View style={styles.refundDateContainer}>
                  <Icon name="schedule" size={14} color="#2196F3" />
                  <Text style={styles.refundDateText}>
                    Devuelto el {formatTicketDateTime(ticket.fechaDevolucion)}
                  </Text>
                </View>
              )}
            </>
          )}
        </View>
      </View>
    );
  };

  if (loading) return renderLoading();
  if (error) return renderError();
  if (!ticket) return renderError();

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
            <View style={styles.header}>
              <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
                <Icon name="arrow-back" size={24} color="#374151" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Detalle de Pasaje</Text>
              <View style={styles.headerRightButtons}>
                <TouchableOpacity
                  style={[styles.downloadButton, downloadingPdf && styles.downloadButtonDisabled]}
                  onPress={handleDownloadTicketPdf}
                  disabled={downloadingPdf}
                >
                  {downloadingPdf ? (
                    <ActivityIndicator size="small" color="#374151" />
                  ) : (
                    <Icon name="file-download" size={24} color="#374151" />
                  )}
                </TouchableOpacity>
                <TouchableOpacity style={styles.homeButton} onPress={handleGoHome}>
                  <Icon name="home" size={24} color="#374151" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Content */}
            {renderTicketHeader()}
            {renderTicketInfo()}
            {renderPricingDetails()}
          </View>
        </ScrollView>
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
    justifyContent: "center",
    alignItems: "center",
  },
  scrollView: {
    flex: 1,
    width: "100%",
  },
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
    paddingTop: StatusBar.currentHeight || 42,
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
  },
  headerTitle: {
    fontSize: Math.min(screenWidth * 0.05, 20),
    fontWeight: '600',
    color: '#374151',
    flex: 1,
    textAlign: 'center',
  },
  headerRightButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  downloadButton: {
    padding: 8,
    borderRadius: 20,
  },
  downloadButtonDisabled: {
    opacity: 0.5,
  },
  homeButton: {
    padding: 8,
    borderRadius: 20,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    minHeight: screenHeight * 0.6,
  },
  errorContainer: {
    alignItems: 'center',
    maxWidth: screenWidth * 0.8,
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 16,
    textAlign: 'center',
  },
  errorTitle: {
    fontSize: Math.min(screenWidth * 0.05, 20),
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
    lineHeight: 20,
  },
  errorButtonsContainer: {
    flexDirection: screenWidth > 400 ? 'row' : 'column',
    gap: 12,
    width: '100%',
  },
  retryButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    flex: screenWidth > 400 ? 1 : 0,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  goBackButton: {
    backgroundColor: '#6B7280',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    flex: screenWidth > 400 ? 1 : 0,
  },
  goBackButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: Math.min(screenWidth * 0.045, 18),
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  headerCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  statusText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  ticketId: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  statusDescriptionContainer: {
    marginBottom: 16,
  },
  statusDescription: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  priceSection: {
    alignItems: 'center',
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  totalPrice: {
    fontSize: Math.min(screenWidth * 0.08, 32),
    fontWeight: 'bold',
    color: '#374151',
  },
  originalPrice: {
    fontSize: 14,
    color: '#9E9E9E',
    textDecorationLine: 'line-through',
    marginTop: 4,
  },
  dateSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  dateText: {
    fontSize: 14,
    color: '#6B7280',
  },
  infoCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  routeContainer: {
    marginBottom: 20,
  },
  routeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  routeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  routeDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  routePoint: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 8,
  },
  routeText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    flex: 1,
  },
  routeArrow: {
    paddingHorizontal: 8,
  },
  seatContainer: {
    marginBottom: 20,
  },
  seatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  seatTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  seatBadge: {
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignSelf: 'flex-start',
  },
  seatNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: '#3B82F6',
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  infoItem: {
    flex: screenWidth > 400 ? 1 : 0,
    minWidth: screenWidth > 400 ? 0 : '45%',
  },
  infoLabel: {
    fontSize: 12,
    color: '#9E9E9E',
    marginBottom: 4,
    textTransform: 'uppercase',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '600',
  },
  pricingCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  pricingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  pricingLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  pricingValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  discountText: {
    color: '#4CAF50',
  },
  totalText: {
    color: '#3B82F6',
    fontSize: 18,
  },
  refundText: {
    color: '#FF9800',
  },
  pricingDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 8,
  },
  refundDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  refundDateText: {
    fontSize: 12,
    color: '#2196F3',
    fontStyle: 'italic',
  },
});

export default TicketDetailScreen;