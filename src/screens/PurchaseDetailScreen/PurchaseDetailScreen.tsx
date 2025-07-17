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
  getPurchaseDetail,
  formatPurchaseDateTime,
  formatPurchaseDate,
  formatPrice,
  downloadPurchasePdf,
  downloadTicketPdf
} from '../../services/purchaseService';
import { PurchaseDetail, PurchaseScreenProps } from '../../types/purchaseType';
import { styles } from './PurchaseDetailScreen.styles';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const isStateProhibited = (estado: string) => {
  const estadoUpper = estado.toUpperCase();
  return estadoUpper === 'CANCELADA' || estadoUpper === 'PENDIENTE' || estadoUpper === 'REEMBOLSADA';
};

const PurchaseDetailScreen: React.FC<PurchaseScreenProps> = ({ route, navigation }) => {
  const { purchaseId } = route.params;
  const { token } = useAuth();
  
  const [purchase, setPurchase] = useState<PurchaseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloadingPurchase, setDownloadingPurchase] = useState(false);
  const [downloadingTickets, setDownloadingTickets] = useState<{ [key: number]: boolean }>({});

  const getEstadoColor = (estado: string) => {
    switch (estado.toUpperCase()) {
      case 'COMPLETADA':
        return '#4CAF50';
      case 'PENDIENTE':
        return '#FF9800';
      case 'PARCIALMENTE_REEMBOLSADA':
        return '#2196F3';
      case 'REEMBOLSADA':
        return '#00BCD4';
      case 'CANCELADA':
        return '#F44336';
      
      case 'CONFIRMADO':
        return '#4CAF50';
      case 'DISPONIBLE':
        return '#8BC34A';
      case 'RESERVADO':
        return '#FF9800';
      
      case 'REINTEGRADO':
        return '#2196F3';
      case 'CANCELADO':
        return '#F44336';
        
      default:
        return '#9E9E9E';
    }
  };

  const getEstadoIcon = (estado: string) => {
    switch (estado.toUpperCase()) {
      case 'COMPLETADA':
        return 'check-circle';
      case 'PENDIENTE':
        return 'schedule';
      case 'PARCIALMENTE_REEMBOLSADA':
        return 'rule';
      case 'REEMBOLSADA':
        return 'refresh';
      case 'CANCELADA':
        return 'cancel';
      
      case 'CONFIRMADO':
        return 'check-circle';
      case 'DISPONIBLE':
        return 'check';
      case 'RESERVADO':
        return 'book-online';
      
      case 'REINTEGRADO':
        return 'refresh';
      case 'CANCELADO':
        return 'cancel';
        
      default:
        return 'info';
    }
  };

  const getEstadoDescription = (estado: string) => {
    switch (estado.toUpperCase()) {
      case 'COMPLETADA':
        return 'Compra completada exitosamente';
      case 'PENDIENTE':
        return 'Esperando confirmación de pago';
      case 'PARCIALMENTE_REEMBOLSADA':
        return 'Reembolso parcial procesado';
      case 'REEMBOLSADA':
        return 'Monto reembolsado completamente';
      case 'CANCELADA':
        return 'Compra cancelada';
      
      case 'CONFIRMADO':
        return 'Compra confirmada y procesada';
      case 'DISPONIBLE':
        return 'Disponible para procesamiento';
      case 'RESERVADO':
        return 'Reservado temporalmente';
      
      case 'REINTEGRADO':
        return 'Monto reintegrado al cliente';
      case 'CANCELADO':
        return 'Compra cancelada';
        
      default:
        return 'Estado desconocido';
    }
  };

  useEffect(() => {
    loadPurchaseDetail();
  }, [purchaseId]);

  const loadPurchaseDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      const purchaseData = await getPurchaseDetail(token, purchaseId);
        setPurchase(purchaseData);
    } catch (err) {
      setPurchase(null);
      if (err instanceof Error && err.message === 'Sesión expirada') {
      } else {
        const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
        setError(errorMessage);
        console.error('Error cargando detalle de compra:', err);
      }
    } finally {
      setLoading(false);
    }
  };


  const handleDownloadPurchasePdf = async () => {
    if (!token) {
      Alert.alert('Error', 'No hay token de autenticación');
      return;
    }

    if (isStateProhibited(purchase?.estado || '')) {
      Alert.alert('Error', 'No se puede descargar el PDF en el estado actual');
      return;
    }

    try {
      setDownloadingPurchase(true);
      const success = await downloadPurchasePdf(token, purchaseId);
      
      if (!success) {
        Alert.alert('Error', 'No se pudo descargar el PDF de la compra');
      }
    } catch (error) {
      if (error instanceof Error && error.message === 'Sesión expirada') {
      } else {
        console.error('Error descargando PDF de compra:', error);
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        Alert.alert('Error', `No se pudo descargar el PDF: ${errorMessage}`);
      }
    } finally {
      setDownloadingPurchase(false);
    }
  };

  const handleDownloadTicketPdf = async (ticketId: number) => {
    if (!token) {
      Alert.alert('Error', 'No hay token de autenticación');
      return;
    }

    try {
      setDownloadingTickets(prev => ({ ...prev, [ticketId]: true }));
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
      setDownloadingTickets(prev => ({ ...prev, [ticketId]: false }));
    }
  };

  const handleGoBack = () => {
    if (navigation?.reset) {
      navigation.reset({
        index: 0,
        routes: [
          { name: 'Main', params: { initialTab: 'compras' } }
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

  const isTicketConfirmed = (estadoPasaje: string) => {
    if (!estadoPasaje) return false;
    
    const estado = estadoPasaje.toLowerCase().trim();
    return estado === 'confirmado';
  };

  const renderError = () => (
    <View style={styles.centerContainer}>
      <View style={styles.errorContainer}>
        <Icon name="error-outline" size={screenWidth * 0.16} color="#F44336" />
        <Text style={styles.errorTitle}>Error al cargar</Text>
        <Text style={styles.errorMessage}>{error}</Text>
        <View style={styles.errorButtonsContainer}>
          <TouchableOpacity style={styles.retryButton} onPress={loadPurchaseDetail}>
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
      <Text style={styles.loadingText}>Cargando detalle...</Text>
    </View>
  );

  const renderPurchaseHeader = () => {
    if (!purchase) return null;

    const estadoColor = getEstadoColor(purchase.estado);
    const estadoIcon = getEstadoIcon(purchase.estado);
    const estadoDescription = getEstadoDescription(purchase.estado);

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
              {purchase.estado === 'PARCIALMENTE_REEMBOLSADA' ? 'PARCIALMENTE REEMBOLSADA' : purchase.estado}
            </Text>
          </View>
          <Text style={styles.purchaseId}>#{purchase.id}</Text>
        </View>
        
        <View style={styles.statusDescriptionContainer}>
          <Text style={[styles.statusDescription, { color: estadoColor }]}>
            {estadoDescription}
          </Text>
        </View>
        
        <View style={styles.priceSection}>
          <Text style={styles.totalLabel}>Total Pagado</Text>
          <Text style={styles.totalPrice}>{formatPrice(purchase.precioActual)}</Text>
          {purchase.precioOriginal !== purchase.precioActual && (
            <Text style={styles.originalPrice}>
              Original: {formatPrice(purchase.precioOriginal)}
            </Text>
          )}
        </View>
        
        <View style={styles.dateSection}>
          <Icon name="event" size={16} color="#6B7280" />
          <Text style={styles.dateText}>
            {formatPurchaseDateTime(purchase.fechaCompra)}
          </Text>
        </View>
      </View>
    );
  };

  const renderPurchaseInfo = () => {
    if (!purchase) return null;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Información de la Compra</Text>
        
        <View style={styles.infoCard}>
          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Cantidad de Pasajes</Text>
              <Text style={styles.infoValue}>{purchase.cantidadPasajes}</Text>
            </View>
            
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Cliente ID</Text>
              <Text style={styles.infoValue}>{purchase.clienteId}</Text>
            </View>
            
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Vendedor ID</Text>
              <Text style={styles.infoValue}>{purchase.vendedorId}</Text>
            </View>
            
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Fecha de Compra</Text>
              <Text style={styles.infoValue}>
                {formatPurchaseDate(purchase.fechaCompra)}
              </Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  const renderTicketsSection = () => {
    if (!purchase?.pasajes || purchase.pasajes.length === 0) return null;

    const pasajesOrdenados = [...purchase.pasajes].sort((a, b) => {
      const fechaA = new Date(a.fecha);
      const fechaB = new Date(b.fecha);
      return fechaA.getTime() - fechaB.getTime();
    });

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Pasajes ({purchase.pasajes.length})</Text>
        
        {pasajesOrdenados.map((pasaje, index) => {
          const estadoColor = getEstadoColor(pasaje.estadoPasaje);
          const isDownloading = downloadingTickets[pasaje.id] || false;
          const canDownload = isTicketConfirmed(pasaje.estadoPasaje);
          
          return (
            <View key={pasaje.id} style={styles.ticketCard}>
              <View style={styles.ticketHeader}>
                <View style={styles.ticketTitleContainer}>
                  <Text style={styles.ticketTitle}>Pasaje #{index + 1}</Text>
                  <View style={[styles.ticketStatusBadge, { backgroundColor: estadoColor }]}>
                    <Text style={styles.ticketStatusText}>{pasaje.estadoPasaje}</Text>
                  </View>
                </View>
                <View style={styles.seatContainer}>
                  <Icon name="airline-seat-recline-normal" size={20} color="#3B82F6" />
                  <Text style={styles.seatNumber}>{pasaje.numeroAsiento}</Text>
                </View>
              </View>
              
              <View style={styles.routeContainer}>
                <View style={styles.routeItem}>
                  <Icon name="trip-origin" size={16} color="#4CAF50" />
                  <Text style={styles.routeText}>{pasaje.paradaOrigen}</Text>
                </View>
                <View style={styles.routeArrow}>
                  <Icon name="arrow-forward" size={16} color="#9E9E9E" />
                </View>
                <View style={styles.routeItem}>
                  <Icon name="place" size={16} color="#F44336" />
                  <Text style={styles.routeText}>{pasaje.paradaDestino}</Text>
                </View>
              </View>
              
              <View style={styles.ticketPricing}>
                <View style={styles.pricingGrid}>
                  <View style={styles.pricingItem}>
                    <Text style={styles.pricingLabel}>Precio Base</Text>
                    <Text style={styles.pricingValue}>{formatPrice(pasaje.precio)}</Text>
                  </View>
                  
                  {pasaje.descuento > 0 && (
                    <View style={styles.pricingItem}>
                      <Text style={styles.pricingLabel}>Descuento</Text>
                      <Text style={[styles.pricingValue, styles.discountText]}>
                        -{formatPrice(pasaje.descuento)}
                      </Text>
                    </View>
                  )}
                  
                  <View style={styles.pricingItem}>
                    <Text style={styles.pricingLabel}>Subtotal</Text>
                    <Text style={[styles.pricingValue, styles.subtotalText]}>
                      {formatPrice(pasaje.subtotal)}
                    </Text>
                  </View>
                  
                  {pasaje.montoReintegrado > 0 && (
                    <View style={styles.pricingItem}>
                      <Text style={styles.pricingLabel}>Reintegrado</Text>
                      <Text style={[styles.pricingValue, styles.refundText]}>
                        {formatPrice(pasaje.montoReintegrado)}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
              
              <View style={styles.ticketFooter}>
                <View style={styles.ticketDate}>
                  <Icon name="schedule" size={14} color="#9E9E9E" />
                  <Text style={styles.ticketDateText}>
                    {formatPurchaseDateTime(pasaje.fecha)}
                  </Text>
                </View>
  
                <TouchableOpacity
                  style={[
                    styles.downloadTicketButton, 
                    (isDownloading || !canDownload) && styles.downloadButtonDisabled
                  ]}
                  onPress={canDownload ? () => handleDownloadTicketPdf(pasaje.id) : undefined}
                  disabled={isDownloading || !canDownload}
                >
                  {isDownloading ? (
                    <ActivityIndicator size="small" color="#3B82F6" />
                  ) : (
                    <Icon 
                      name="file-download" 
                      size={16} 
                      color={canDownload ? "#3B82F6" : "#9E9E9E"} 
                    />
                  )}
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
      </View>
    );
  };

  if (loading) return renderLoading();
  if (error) return renderError();
  if (!purchase) return renderError();

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
              <Text style={styles.headerTitle}>Detalle de Compra</Text>
              <View style={styles.headerRightButtons}>
                <TouchableOpacity
                  style={[
                    styles.downloadButton, 
                    (downloadingPurchase || isStateProhibited(purchase?.estado || '')) && styles.downloadButtonDisabled,
                    isStateProhibited(purchase?.estado || '') && styles.downloadButtonCanceled
                  ]}
                  onPress={isStateProhibited(purchase?.estado || '') ? undefined : handleDownloadPurchasePdf}
                  disabled={downloadingPurchase || isStateProhibited(purchase?.estado || '')}
                >
                  {downloadingPurchase ? (
                    <ActivityIndicator size="small" color="#374151" />
                  ) : (
                    <Icon 
                      name="file-download" 
                      size={24} 
                      color={isStateProhibited(purchase?.estado || '') ? "#9E9E9E" : "#374151"} 
                    />
                  )}
                </TouchableOpacity>
                <TouchableOpacity style={styles.homeButton} onPress={handleGoHome}>
                  <Icon name="home" size={24} color="#374151" />
                </TouchableOpacity>
              </View>
            </View>

            {renderPurchaseHeader()}
            {renderPurchaseInfo()}
            {renderTicketsSection()}
          </View>
        </ScrollView>
      </ImageBackground>
    </SafeAreaView>
  );
};

export default PurchaseDetailScreen;