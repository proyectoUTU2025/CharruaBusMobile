import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  TouchableWithoutFeedback,
  useWindowDimensions,
  StatusBar,
  ImageBackground,
  TextInput,
  FlatList,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAuth } from '../context/AuthContext';
import { useUser } from '../hooks/useUser';
import { 
  getClientPurchases,
  formatPurchaseDateTime,
  formatPrice
} from '../services/purchaseService';
import { FilterParams, PurchasesScreenProps, Purchase } from '../types/purchaseType';

const PurchasesScreen: React.FC<PurchasesScreenProps> = ({ 
  onNavigateToPurchaseDetail,
  onGoBack 
}) => {
  const { token, isAuthLoading } = useAuth();
  const { user, loading: userLoading } = useUser();
  const { width, height } = useWindowDimensions();
  
  const isCompact = width < 600;
  const horizontalPadding = isCompact ? 16 : 24;
  
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  const [selectedEstados, setSelectedEstados] = useState<string[]>([]);
  const [showFilterModal, setShowFilterModal] = useState(false);
  
  const [showDatePickerDesde, setShowDatePickerDesde] = useState(false);
  const [showDatePickerHasta, setShowDatePickerHasta] = useState(false);
  const [dateDesde, setDateDesde] = useState<Date | undefined>(undefined);
  const [dateHasta, setDateHasta] = useState<Date | undefined>(undefined);
  
  const [tempFilters, setTempFilters] = useState<FilterParams>({
    estados: [],
    montoMin: '',
    montoMax: '',
    fechaDesde: '',
    fechaHasta: ''
  });

  const [appliedFilters, setAppliedFilters] = useState<FilterParams>({
    estados: [],
    montoMin: '',
    montoMax: '',
    fechaDesde: '',
    fechaHasta: ''
  });

  const [validationErrors, setValidationErrors] = useState<{
    monto?: string;
    fecha?: string;
  }>({});

  const estadosDisponibles = [
    { value: 'COMPLETADA', label: 'Completadas' },
    { value: 'PENDIENTE', label: 'Pendientes' },
    { value: 'PARCIALMENTE_REEMBOLSADA', label: 'Parcialmente Reembolsadas' },
    { value: 'REEMBOLSADA', label: 'Reembolsadas' },
    { value: 'CANCELADA', label: 'Canceladas' },
  ];

  const getEstadoColor = (estado: string): string => {
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
      default:
        return '#9E9E9E';
    }
  };

  const getEstadoIcon = (estado: string): string => {
    switch (estado.toUpperCase()) {
      case 'COMPLETADA':
        return 'check-circle';
      case 'PENDIENTE':
        return 'schedule';
      case 'PARCIALMENTE_REEMBOLSADA':
        return 'partial-refund';
      case 'REEMBOLSADA':
        return 'refresh';
      case 'CANCELADA':
        return 'cancel';
      default:
        return 'info';
    }
  };

  const getEstadoSurfaceColor = (estado: string): string => {
    switch (estado.toUpperCase()) {
      case 'COMPLETADA':
        return '#E8F5E8';
      case 'PENDIENTE':
        return '#FFF3E0';
      case 'PARCIALMENTE_REEMBOLSADA':
        return '#E3F2FD';
      case 'REEMBOLSADA':
        return '#E0F2F1';
      case 'CANCELADA':
        return '#FFEBEE';
      default:
        return '#F5F5F5';
    }
  };

  const getEstadoDescription = (estado: string): string => {
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
      default:
        return 'Estado desconocido';
    }
  };

  const formatDate = (date: Date) => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const onChangeDateDesde = (event: any, selectedDate?: Date) => {
    setShowDatePickerDesde(false);
    if (selectedDate) {
      setDateDesde(selectedDate);
      const formattedDate = formatDate(selectedDate);
      setTempFilters(prev => ({ ...prev, fechaDesde: formattedDate }));
      
      if (dateHasta && selectedDate > dateHasta) {
        setDateHasta(undefined);
        setTempFilters(prev => ({ ...prev, fechaHasta: '' }));
      }
      
      if (validationErrors.fecha) {
        setValidationErrors(prev => ({ ...prev, fecha: undefined }));
      }
    }
  };

  const onChangeDateHasta = (event: any, selectedDate?: Date) => {
    setShowDatePickerHasta(false);
    if (selectedDate) {
      setDateHasta(selectedDate);
      const formattedDate = formatDate(selectedDate);
      setTempFilters(prev => ({ ...prev, fechaHasta: formattedDate }));
      
      if (validationErrors.fecha) {
        setValidationErrors(prev => ({ ...prev, fecha: undefined }));
      }
    }
  };

  const isValidDateFormat = (dateString: string): boolean => {
    const regex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
    const match = dateString.match(regex);
    
    if (!match) return false;
    
    const day = parseInt(match[1], 10);
    const month = parseInt(match[2], 10);
    const year = parseInt(match[3], 10);
    
    if (month < 1 || month > 12) return false;
    if (day < 1 || day > 31) return false;
    if (year < 1900 || year > 2100) return false;
    
    const date = new Date(year, month - 1, day);
    return date.getFullYear() === year && 
           date.getMonth() === month - 1 && 
           date.getDate() === day;
  };

  const parseDate = (dateString: string): Date => {
    const parts = dateString.split('/');
    return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
  };

  const formatDateForAPI = (dateString: string, isEndDate = false): string => {
    if (!dateString) return '';
    const date = parseDate(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const timeStr = isEndDate ? 'T23:59:59' : 'T00:00:00';
    return `${year}-${month}-${day}${timeStr}`;
  };

  const validateFilters = (filters: FilterParams): { isValid: boolean; errors: any } => {
    const errors: { monto?: string; fecha?: string } = {};

    if (filters.montoMin && filters.montoMax) {
      const min = parseFloat(filters.montoMin);
      const max = parseFloat(filters.montoMax);
      
      if (isNaN(min) || isNaN(max)) {
        errors.monto = 'Los montos deben ser números válidos';
      } else if (min >= max) {
        errors.monto = 'El monto mínimo debe ser menor al máximo';
      } else if (min < 0 || max < 0) {
        errors.monto = 'Los montos no pueden ser negativos';
      }
    } else if (filters.montoMin && isNaN(parseFloat(filters.montoMin))) {
      errors.monto = 'El monto mínimo debe ser un número válido';
    } else if (filters.montoMax && isNaN(parseFloat(filters.montoMax))) {
      errors.monto = 'El monto máximo debe ser un número válido';
    } else if (filters.montoMin && parseFloat(filters.montoMin) < 0) {
      errors.monto = 'El monto mínimo no puede ser negativo';
    } else if (filters.montoMax && parseFloat(filters.montoMax) < 0) {
      errors.monto = 'El monto máximo no puede ser negativo';
    }

    if (filters.fechaDesde && filters.fechaHasta) {
      const fechaDesdeValida = isValidDateFormat(filters.fechaDesde);
      const fechaHastaValida = isValidDateFormat(filters.fechaHasta);
      
      if (!fechaDesdeValida || !fechaHastaValida) {
        errors.fecha = 'Las fechas deben tener formato DD/MM/YYYY válido';
      } else {
        const dateDesde = parseDate(filters.fechaDesde);
        const dateHasta = parseDate(filters.fechaHasta);
        
        if (dateDesde > dateHasta) {
          errors.fecha = 'La fecha "desde" debe ser anterior o igual a la fecha "hasta"';
        }
        
        const today = new Date();
        today.setHours(23, 59, 59, 999);
        
        if (dateDesde > today || dateHasta > today) {
          errors.fecha = 'Las fechas no pueden ser futuras';
        }
      }
    } else if (filters.fechaDesde && !isValidDateFormat(filters.fechaDesde)) {
      errors.fecha = 'La fecha "desde" debe tener formato DD/MM/YYYY válido';
    } else if (filters.fechaHasta && !isValidDateFormat(filters.fechaHasta)) {
      errors.fecha = 'La fecha "hasta" debe tener formato DD/MM/YYYY válido';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  };

  const getActiveFiltersCount = (): number => {
    let count = 0;
    if (appliedFilters.estados.length > 0) count++;
    if (appliedFilters.montoMin || appliedFilters.montoMax) count++;
    if (appliedFilters.fechaDesde || appliedFilters.fechaHasta) count++;
    return count;
  };

  useEffect(() => {
    if (!isAuthLoading && token && !userLoading && user?.id) {
      loadPurchases();
    }
  }, [appliedFilters, token, user?.id, userLoading, isAuthLoading]);

  useEffect(() => {
    if (showFilterModal) {
      setTempFilters({...appliedFilters});
      setValidationErrors({});
      
      if (appliedFilters.fechaDesde) {
        setDateDesde(parseDate(appliedFilters.fechaDesde));
      } else {
        setDateDesde(undefined);
      }
      
      if (appliedFilters.fechaHasta) {
        setDateHasta(parseDate(appliedFilters.fechaHasta));
      } else {
        setDateHasta(undefined);
      }
    }
  }, [showFilterModal, appliedFilters]);

  const loadPurchases = async (page = 0, isRefresh = false, isLoadMore = false) => {
    if (isAuthLoading) {
      return;
    }

    if (!token) {
      console.error('No hay token disponible');
      setError('No hay token de autenticación');
      setLoading(false);
      return;
    }

    if (userLoading) {
      return;
    }

    if (!user?.id) {
      console.error('No hay user.id disponible');
      setError('No se pudo identificar el usuario');
      setLoading(false);
      return;
    }

    try {
      if (isRefresh) {
        setRefreshing(true);
      } else if (isLoadMore) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const apiParams: any = {
        page,
        size: 10,
        sort: ['fechaCompra,DESC'],
      };

      if (appliedFilters.estados.length > 0) {
        apiParams.estados = appliedFilters.estados;
      }

      if (appliedFilters.montoMin) {
        apiParams.montoMin = parseFloat(appliedFilters.montoMin);
      }

      if (appliedFilters.montoMax) {
        apiParams.montoMax = parseFloat(appliedFilters.montoMax);
      }

      if (appliedFilters.fechaDesde) {
        apiParams.fechaDesde = formatDateForAPI(appliedFilters.fechaDesde, false);
      }

      if (appliedFilters.fechaHasta) {
        apiParams.fechaHasta = formatDateForAPI(appliedFilters.fechaHasta, true);
      }

      const response = await getClientPurchases(token, parseInt(user.id), apiParams);

      if (isRefresh || page === 0) {
        setPurchases(response.content);
        setCurrentPage(0);
      } else {
        setPurchases(prev => [...prev, ...response.content]);
      }

      setTotalPages(response.page.totalPages);
      setTotalElements(response.page.totalElements);
      setCurrentPage(response.page.number);
      setHasMore(response.page.number < response.page.totalPages - 1);

    } catch (error) {
      console.error('Error cargando compras:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error al cargar compras';
      setError(errorMessage);
      
      if (!isLoadMore) {
        Alert.alert('Error', errorMessage);
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    if (!isAuthLoading && token && user?.id && !userLoading) {
      loadPurchases(0, true);
    }
  };

  const handleLoadMore = () => {
    if (hasMore && !loadingMore && !loading) {
      const nextPage = currentPage + 1;
      loadPurchases(nextPage, false, true);
    }
  };

  const handlePurchasePress = (purchase: Purchase) => {
    onNavigateToPurchaseDetail(purchase.id);
  };

  const toggleEstadoFilter = (estado: string) => {
    setTempFilters(prev => ({
      ...prev,
      estados: prev.estados.includes(estado)
        ? prev.estados.filter(e => e !== estado)
        : [...prev.estados, estado]
    }));
  };

  const clearFilters = () => {
    const emptyFilters: FilterParams = {
      estados: [],
      montoMin: '',
      montoMax: '',
      fechaDesde: '',
      fechaHasta: ''
    };
    setTempFilters(emptyFilters);
    setAppliedFilters(emptyFilters);
    setValidationErrors({});
    setDateDesde(undefined);
    setDateHasta(undefined);
    setShowFilterModal(false);
  };

  const applyFilters = () => {
    const validation = validateFilters(tempFilters);
    
    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      return;
    }

    setAppliedFilters({...tempFilters});
    setValidationErrors({});
    setShowFilterModal(false);
  };

  const renderPurchaseCard = (purchase: Purchase, index: number) => {
    const estadoColor = getEstadoColor(purchase.estado);
    const estadoIcon = getEstadoIcon(purchase.estado);
    const surfaceColor = getEstadoSurfaceColor(purchase.estado);
    const description = getEstadoDescription(purchase.estado);

    return (
      <TouchableOpacity
        key={purchase.id}
        style={[styles.purchaseCard, { marginBottom: 12 }]}
        onPress={() => handlePurchasePress(purchase)}
        activeOpacity={0.8}
      >
        <View style={[styles.statusIndicator, { backgroundColor: estadoColor }]} />
        
        <View style={styles.cardHeader}>
          <View style={styles.purchaseIdContainer}>
            <Text style={styles.purchaseIdLabel}>Compra</Text>
            <Text style={styles.purchaseId}>#{purchase.id}</Text>
          </View>
          <View style={[styles.statusChip, { backgroundColor: surfaceColor }]}>
            <Icon name={estadoIcon} size={16} color={estadoColor} />
            <Text style={[styles.statusText, { color: estadoColor }]}>
              {purchase.estado}
            </Text>
          </View>
        </View>

        <View style={styles.cardContent}>
          <View style={styles.infoSection}>
            <View style={styles.infoRow}>
              <Icon name="schedule" size={16} color="#6B7280" />
              <Text style={styles.infoText}>
                {formatPurchaseDateTime(purchase.fechaCompra)}
              </Text>
            </View>
            
            <View style={styles.infoRow}>
              <Icon name="confirmation-number" size={16} color="#6B7280" />
              <Text style={styles.infoText}>
                {purchase.cantidadPasajes} pasaje{purchase.cantidadPasajes !== 1 ? 's' : ''}
              </Text>
            </View>
          </View>

          <View style={styles.priceSection}>
            <Text style={styles.currentPrice}>
              {formatPrice(purchase.precioActual)}
            </Text>
            {purchase.precioOriginal !== purchase.precioActual && purchase.precioOriginal > 0 && (
              <Text style={styles.originalPrice}>
                {formatPrice(purchase.precioOriginal)}
              </Text>
            )}
          </View>
        </View>

        <View style={styles.cardActions}>
          <View style={styles.actionContent}>
            <Text style={styles.actionText}>Ver detalles</Text>
            <Icon name="arrow-forward" size={18} color="#3B82F6" />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderFilterModal = () => (
    <Modal
      visible={showFilterModal}
      transparent
      animationType="fade"
      presentationStyle="overFullScreen"
      onRequestClose={() => setShowFilterModal(false)}
    >
      <View style={styles.modalOverlay}>
        <TouchableWithoutFeedback onPress={() => setShowFilterModal(false)}>
          <View style={styles.modalBackdrop} />
        </TouchableWithoutFeedback>
        
        <View style={[
          styles.filterModal,
          {
            width: isCompact ? width * 0.95 : Math.min(600, width * 0.85),
            maxHeight: height * 0.85,
          }
        ]}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Filtrar compras</Text>
            <TouchableOpacity 
              onPress={() => setShowFilterModal(false)}
              style={styles.closeButton}
            >
              <Icon name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <ScrollView 
            style={styles.filterOptions} 
            showsVerticalScrollIndicator={true}
            nestedScrollEnabled={true}
            contentContainerStyle={styles.filterOptionsContent}
          >
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Estado de la compra</Text>
              
              {estadosDisponibles.map((estado) => (
                <TouchableOpacity
                  key={estado.value}
                  style={styles.filterOption}
                  onPress={() => toggleEstadoFilter(estado.value)}
                  activeOpacity={0.8}
                >
                  <View style={styles.filterOptionContent}>
                    <View style={[
                      styles.checkbox,
                      tempFilters.estados.includes(estado.value) && styles.checkboxSelected,
                    ]}>
                      {tempFilters.estados.includes(estado.value) && (
                        <Icon name="check" size={16} color="white" />
                      )}
                    </View>
                    <Text style={styles.filterOptionText}>
                      {estado.label}
                    </Text>
                  </View>
                  <View style={[
                    styles.estadoIndicator,
                    { backgroundColor: getEstadoColor(estado.value) }
                  ]} />
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Rango de monto</Text>
              
              <View style={styles.rangeInputContainer}>
                <View style={styles.inputWrapper}>
                  <Text style={styles.inputLabel}>Monto mínimo</Text>
                  <TextInput
                    style={[
                      styles.textInput,
                      validationErrors.monto && styles.textInputError
                    ]}
                    placeholder="0"
                    value={tempFilters.montoMin}
                    onChangeText={(text) => {
                      const numericText = text.replace(/[^0-9.]/g, '');
                      setTempFilters(prev => ({ ...prev, montoMin: numericText }));
                      if (validationErrors.monto) {
                        setValidationErrors(prev => ({ ...prev, monto: undefined }));
                      }
                    }}
                    keyboardType="decimal-pad"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
                
                <Text style={styles.rangeConnector}>-</Text>
                
                <View style={styles.inputWrapper}>
                  <Text style={styles.inputLabel}>Monto máximo</Text>
                  <TextInput
                    style={[
                      styles.textInput,
                      validationErrors.monto && styles.textInputError
                    ]}
                    placeholder="∞"
                    value={tempFilters.montoMax}
                    onChangeText={(text) => {
                      const numericText = text.replace(/[^0-9.]/g, '');
                      setTempFilters(prev => ({ ...prev, montoMax: numericText }));
                      if (validationErrors.monto) {
                        setValidationErrors(prev => ({ ...prev, monto: undefined }));
                      }
                    }}
                    keyboardType="decimal-pad"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
              </View>
              
              {validationErrors.monto && (
                <Text style={styles.errorText}>{validationErrors.monto}</Text>
              )}
            </View>

            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Rango de fechas</Text>
              
              <View style={styles.rangeInputContainer}>
                <View style={styles.inputWrapper}>
                  <Text style={styles.inputLabel}>Desde</Text>
                  <TouchableOpacity onPress={() => setShowDatePickerDesde(true)}>
                    <View style={[
                      styles.dateInput,
                      validationErrors.fecha && styles.textInputError
                    ]}>
                      <Text style={[
                        styles.dateInputText,
                        !tempFilters.fechaDesde && styles.placeholderText
                      ]}>
                        {tempFilters.fechaDesde || 'DD/MM/AAAA'}
                      </Text>
                      <Icon name="event" size={20} color="#9CA3AF" />
                    </View>
                  </TouchableOpacity>
                </View>
                
                <Text style={styles.rangeConnector}>-</Text>
                
                <View style={styles.inputWrapper}>
                  <Text style={styles.inputLabel}>Hasta</Text>
                  <TouchableOpacity onPress={() => setShowDatePickerHasta(true)}>
                    <View style={[
                      styles.dateInput,
                      validationErrors.fecha && styles.textInputError
                    ]}>
                      <Text style={[
                        styles.dateInputText,
                        !tempFilters.fechaHasta && styles.placeholderText
                      ]}>
                        {tempFilters.fechaHasta || 'DD/MM/AAAA'}
                      </Text>
                      <Icon name="event" size={20} color="#9CA3AF" />
                    </View>
                  </TouchableOpacity>
                </View>
              </View>
              
              {validationErrors.fecha && (
                <Text style={styles.errorText}>{validationErrors.fecha}</Text>
              )}
              
              <Text style={styles.helperText}>
                Formato: DD/MM/AAAA (ej: 25/12/2024)
              </Text>
            </View>
          </ScrollView>

          <View style={styles.filterActions}>
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={clearFilters}
              activeOpacity={0.8}
            >
              <Text style={styles.secondaryButtonText}>Limpiar filtros</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={applyFilters}
              activeOpacity={0.8}
            >
              <Text style={styles.primaryButtonText}>Aplicar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>Mis compras</Text>
      <View style={styles.headerActions}>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilterModal(true)}
          activeOpacity={0.8}
        >
          <Icon name="tune" size={20} color="#3B82F6" />
          {getActiveFiltersCount() > 0 && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>
                {getActiveFiltersCount()}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderStats = () => (
    <View style={styles.statsContainer}>
      <Text style={styles.statsText}>
        {totalElements} compra{totalElements !== 1 ? 's' : ''} encontrada{totalElements !== 1 ? 's' : ''}
        {getActiveFiltersCount() > 0 && ` (filtrada${totalElements !== 1 ? 's' : ''})`}
      </Text>
    </View>
  );

  const renderLoadMoreButton = () => {
    if (!hasMore || loading) return null;

    return (
      <TouchableOpacity
        style={styles.loadMoreButton}
        onPress={handleLoadMore}
        disabled={loadingMore}
        activeOpacity={0.8}
      >
        {loadingMore ? (
          <View style={styles.loadMoreContent}>
            <ActivityIndicator size="small" color="#3B82F6" />
            <Text style={styles.loadMoreText}>Cargando más...</Text>
          </View>
        ) : (
          <Text style={styles.loadMoreText}>Cargar más compras</Text>
        )}
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <Icon name="shopping-cart" size={48} color="#6B7280" />
      </View>
      <Text style={styles.emptyTitle}>
        {getActiveFiltersCount() > 0 ? 'Sin resultados' : 'No hay compras'}
      </Text>
      <Text style={styles.emptyMessage}>
        {getActiveFiltersCount() > 0
          ? 'No se encontraron compras con los filtros seleccionados. Intenta ajustar los criterios de búsqueda.'
          : 'Aún no has realizado ninguna compra. Te recomendamos que veas nuestros viajes disponibles.'}
      </Text>
      {getActiveFiltersCount() > 0 && (
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={clearFilters}
          activeOpacity={0.8}
        >
          <Text style={styles.primaryButtonText}>Limpiar filtros</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderError = () => (
    <View style={styles.errorContainer}>
      <View style={styles.errorIconContainer}>
        <Icon name="error-outline" size={48} color="#F44336" />
      </View>
      <Text style={styles.errorTitle}>Error al cargar</Text>
      <Text style={styles.errorMessage}>{error}</Text>
      <TouchableOpacity
        style={styles.primaryButton}
        onPress={() => {
          if (!isAuthLoading && token && user?.id && !userLoading) {
            loadPurchases();
          }
        }}
        activeOpacity={0.8}
      >
        <Icon name="refresh" size={18} color="white" style={{ marginRight: 8 }} />
        <Text style={styles.primaryButtonText}>Reintentar</Text>
      </TouchableOpacity>
    </View>
  );

  if (isAuthLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar backgroundColor="#4285F4" barStyle="light-content" />
        <ImageBackground 
          source={require('../assets/background.png')} 
          style={styles.backgroundImage}
          resizeMode="cover"
        >
          <View style={styles.cardContainer}>
            {renderHeader()}
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#3B82F6" />
              <Text style={styles.loadingText}>Verificando autenticación...</Text>
            </View>
          </View>
          {renderFilterModal()}
          {showDatePickerDesde && (
            <View style={styles.datePickerContainer}>
              <DateTimePicker
                value={dateDesde || new Date()}
                mode="date"
                display="default"
                onChange={onChangeDateDesde}
                maximumDate={(() => {
                  const today = new Date();
                  today.setHours(23, 59, 59, 999);
                  return today;
                })()}
              />
            </View>
          )}
          {showDatePickerHasta && (
            <View style={styles.datePickerContainer}>
              <DateTimePicker
                value={dateHasta || (dateDesde ? new Date(dateDesde.getTime()) : new Date())}
                mode="date"
                display="default"
                onChange={onChangeDateHasta}
                minimumDate={dateDesde ? new Date(dateDesde.getTime()) : undefined}
                maximumDate={(() => {
                  const today = new Date();
                  today.setHours(23, 59, 59, 999);
                  return today;
                })()}
              />
            </View>
          )}
        </ImageBackground>
      </SafeAreaView>
    );
  }

  if (loading && purchases.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar backgroundColor="#4285F4" barStyle="light-content" />
        <ImageBackground 
          source={require('../assets/background.png')} 
          style={styles.backgroundImage}
          resizeMode="cover"
        >
          <View style={styles.cardContainer}>
            {renderHeader()}
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#3B82F6" />
              <Text style={styles.loadingText}>
                {userLoading ? 'Cargando usuario...' : 'Cargando compras...'}
              </Text>
            </View>
          </View>
          {renderFilterModal()}
          {showDatePickerDesde && (
            <View style={styles.datePickerContainer}>
              <DateTimePicker
                value={dateDesde || new Date()}
                mode="date"
                display="default"
                onChange={onChangeDateDesde}
                maximumDate={new Date()}
              />
            </View>
          )}
          {showDatePickerHasta && (
            <View style={styles.datePickerContainer}>
              <DateTimePicker
                value={dateHasta || (dateDesde ? new Date(dateDesde.getTime()) : new Date())}
                mode="date"
                display="default"
                onChange={onChangeDateHasta}
                minimumDate={dateDesde ? new Date(dateDesde.getTime()) : undefined}
                maximumDate={new Date()}
              />
            </View>
          )}
        </ImageBackground>
      </SafeAreaView>
    );
  }

  if (userLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar backgroundColor="#4285F4" barStyle="light-content" />
        <ImageBackground 
          source={require('../assets/background.png')} 
          style={styles.backgroundImage}
          resizeMode="cover"
        >
          <View style={styles.cardContainer}>
            {renderHeader()}
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#3B82F6" />
              <Text style={styles.loadingText}>Cargando usuario...</Text>
            </View>
          </View>
          {renderFilterModal()}
          {showDatePickerDesde && (
            <View style={styles.datePickerContainer}>
              <DateTimePicker
                value={dateDesde || new Date()}
                mode="date"
                display="default"
                onChange={onChangeDateDesde}
                maximumDate={new Date()}
              />
            </View>
          )}
          {showDatePickerHasta && (
            <View style={styles.datePickerContainer}>
              <DateTimePicker
                value={dateHasta || (dateDesde ? new Date(dateDesde.getTime()) : new Date())}
                mode="date"
                display="default"
                onChange={onChangeDateHasta}
                minimumDate={dateDesde ? new Date(dateDesde.getTime()) : undefined}
                maximumDate={new Date()}
              />
            </View>
          )}
        </ImageBackground>
      </SafeAreaView>
    );
  }

  if (!token || !user?.id) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar backgroundColor="#4285F4" barStyle="light-content" />
        <ImageBackground 
          source={require('../assets/background.png')} 
          style={styles.backgroundImage}
          resizeMode="cover"
        >
          <View style={styles.cardContainer}>
            {renderHeader()}
            <View style={styles.errorContainer}>
              <View style={styles.errorIconContainer}>
                <Icon name="error-outline" size={48} color="#F44336" />
              </View>
              <Text style={styles.errorTitle}>Error de autenticación</Text>
              <Text style={styles.errorMessage}>
                No se pudo verificar tu identidad. Por favor, cierra sesión y vuelve a iniciar sesión.
              </Text>
            </View>
          </View>
          {renderFilterModal()}
          {showDatePickerDesde && (
            <View style={styles.datePickerContainer}>
              <DateTimePicker
                value={dateDesde || new Date()}
                mode="date"
                display="default"
                onChange={onChangeDateDesde}
                maximumDate={new Date()}
              />
            </View>
          )}
          {showDatePickerHasta && (
            <View style={styles.datePickerContainer}>
              <DateTimePicker
                value={dateHasta || (dateDesde ? new Date(dateDesde.getTime()) : new Date())}
                mode="date"
                display="default"
                onChange={onChangeDateHasta}
                minimumDate={dateDesde ? new Date(dateDesde.getTime()) : undefined}
                maximumDate={new Date()}
              />
            </View>
          )}
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
            {renderHeader()}
            
            {error && purchases.length === 0 ? (
              renderError()
            ) : purchases.length === 0 ? (
              renderEmptyState()
            ) : (
              <View style={styles.contentContainer}>
                {renderStats()}
                <View style={styles.purchasesContainer}>
                  {purchases.map((purchase, index) => renderPurchaseCard(purchase, index))}
                  {renderLoadMoreButton()}
                </View>
              </View>
            )}
          </View>
        </ScrollView>

        {renderFilterModal()}
        
        {showDatePickerDesde && (
          <View style={styles.datePickerContainer}>
            <DateTimePicker
              value={dateDesde || new Date()}
              mode="date"
              display="default"
              onChange={onChangeDateDesde}
              maximumDate={new Date()}
            />
          </View>
        )}
        
        {showDatePickerHasta && (
          <View style={styles.datePickerContainer}>
            <DateTimePicker
              value={dateHasta || (dateDesde ? new Date(dateDesde.getTime()) : new Date())}
              mode="date"
              display="default"
              onChange={onChangeDateHasta}
              minimumDate={dateDesde ? new Date(dateDesde.getTime()) : undefined}
              maximumDate={new Date()}
            />
          </View>
        )}
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
  },
  cardContainer: {
    width: "100%",
    maxWidth: 600,
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
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#374151',
    flex: 1,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterButton: {
    position: 'relative',
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#E0F2FE',
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#F44336',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  statsContainer: {
    marginBottom: 16,
  },
  statsText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  contentContainer: {
    flex: 1,
  },
  purchasesContainer: {
    flex: 1,
  },
  purchaseCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  statusIndicator: {
    height: 4,
    width: '100%',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 12,
  },
  purchaseIdContainer: {
    flex: 1,
  },
  purchaseIdLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  purchaseId: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  cardContent: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  infoSection: {
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#6B7280',
    flex: 1,
  },
  statusDescription: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
    marginLeft: 24,
  },
  priceSection: {
    alignItems: 'flex-end',
  },
  currentPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: '#059669',
  },
  originalPrice: {
    fontSize: 12,
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
    marginTop: 2,
  },
  cardActions: {
    padding: 16,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  actionContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#3B82F6',
  },
  loadMoreButton: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  loadMoreContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  loadMoreText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#3B82F6',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 32,
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  errorIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FEF2F2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 32,
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
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    paddingBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
  },
  filterSection: {
    marginBottom: 24,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 16,
  },
  filterOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderRadius: 12,
  },
  filterOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    marginRight: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  filterOptionText: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
  },
  estadoIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginLeft: 8,
  },
  rangeInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
  },
  inputWrapper: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
    marginBottom: 6,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#374151',
    backgroundColor: 'white',
  },
  textInputError: {
    borderColor: '#F44336',
  },
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: 'white',
    minHeight: 42,
  },
  dateInputText: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
  },
  placeholderText: {
    color: '#9CA3AF',
  },
  rangeConnector: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
    paddingBottom: 10,
  },
  errorText: {
    fontSize: 12,
    color: '#F44336',
    marginTop: 6,
  },
  helperText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 6,
    fontStyle: 'italic',
  },
  filterActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 24,
    paddingTop: 16,
    gap: 12,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: '#3B82F6',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: 'white',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  secondaryButtonText: {
    color: '#3B82F6',
    fontSize: 14,
    fontWeight: '500',
  },
  datePickerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
    elevation: 9999,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.32)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1001,
  },
  filterModal: {
    backgroundColor: 'white',
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    zIndex: 1002,
  },
  filterOptions: {
    maxHeight: 400,
  },
  filterOptionsContent: {
    paddingHorizontal: 24,
    paddingBottom: 8,
  },
});

export default PurchasesScreen;