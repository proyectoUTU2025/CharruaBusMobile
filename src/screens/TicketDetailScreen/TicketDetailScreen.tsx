import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
  ActivityIndicator,
  Dimensions,
  ImageBackground,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAuth } from '../../context/AuthContext';
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
} from '../../services/ticketService';
import { TicketDetail, TicketScreenProps } from '../../types/ticketType';
import { styles } from './TicketDetailScreen.styles';

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
      setTicket(null);
      if (err instanceof Error && err.message === 'Sesión expirada') {
      } else {
        const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
        setError(errorMessage);
        console.error('Error cargando detalle de pasaje:', err);
      }
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
      if (error instanceof Error && error.message === 'Sesión expirada') {
        } else {
          console.error('Error descargando PDF de pasaje:', error);
          const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
          Alert.alert('Error', `No se pudo descargar el PDF: ${errorMessage}`);
        }
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

  const isTicketConfirmed = () => {
    if (!ticket?.estadoPasaje) return false;
    
    const estado = ticket.estadoPasaje.toLowerCase().trim();
    const estadosConfirmados = ['confirmado'];
    
    return estadosConfirmados.includes(estado);
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

          <View style={styles.seatContainer}>
            <View style={styles.seatHeader}>
              <Icon name="airline-seat-recline-normal" size={20} color="#3B82F6" />
              <Text style={styles.seatTitle}>Asiento Asignado</Text>
            </View>
            <View style={styles.seatBadge}>
              <Text style={styles.seatNumber}>{ticket.numeroAsiento}</Text>
            </View>
          </View>

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
            <View style={styles.header}>
              <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
                <Icon name="arrow-back" size={24} color="#374151" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Detalle de Pasaje</Text>
              <View style={styles.headerRightButtons}>
                <TouchableOpacity
                  style={[
                    styles.downloadButton, 
                    (downloadingPdf || !isTicketConfirmed()) && styles.downloadButtonDisabled
                  ]}
                  onPress={isTicketConfirmed() ? handleDownloadTicketPdf : undefined}
                  disabled={downloadingPdf || !isTicketConfirmed()}
                >
                  {downloadingPdf ? (
                    <ActivityIndicator size="small" color="#374151" />
                  ) : (
                    <Icon 
                      name="file-download" 
                      size={24} 
                      color={isTicketConfirmed() ? "#374151" : "#9E9E9E"} 
                    />
                  )}
                </TouchableOpacity>
                <TouchableOpacity style={styles.homeButton} onPress={handleGoHome}>
                  <Icon name="home" size={24} color="#374151" />
                </TouchableOpacity>
              </View>
            </View>

            {renderTicketHeader()}
            {renderTicketInfo()}
            {renderPricingDetails()}
          </View>
        </ScrollView>
      </ImageBackground>
    </SafeAreaView>
  );
};

export default TicketDetailScreen;