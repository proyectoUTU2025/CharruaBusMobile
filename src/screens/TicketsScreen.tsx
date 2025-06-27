import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Modal,
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
  getClientTickets,
  formatTicketDateTime,
  formatPrice,
  Ticket,
  getEstadoPasajeColor,
  getEstadoPasajeIcon,
  getEstadoPasajeSurfaceColor
} from '../services/ticketService';
import { getAllLocalidadesSimple } from '../services/locationService';
import { Localidad } from '../types/locationType';
import { TicketsScreenProps, FilterParams } from '../types/ticketType';

const TicketsScreen: React.FC<TicketsScreenProps> = ({ 
  onNavigateToTicketDetail,
}) => {
  const { token, isAuthLoading } = useAuth();
  const { user, loading: userLoading } = useUser();
  const { width, height } = useWindowDimensions();
  
  const isCompact = width < 600;
  
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showDatePickerDesde, setShowDatePickerDesde] = useState(false);
  const [showDatePickerHasta, setShowDatePickerHasta] = useState(false);
  
  const [showOrigenDropdown, setShowOrigenDropdown] = useState(false);
  const [showDestinoDropdown, setShowDestinoDropdown] = useState(false);
  
  const [dateDesde, setDateDesde] = useState<Date | undefined>(undefined);
  const [dateHasta, setDateHasta] = useState<Date | undefined>(undefined);
  
  const [localidades, setLocalidades] = useState<Localidad[]>([]);
  const [loadingLocalidades, setLoadingLocalidades] = useState(false);
  
  const [tempFilters, setTempFilters] = useState<FilterParams>({
    estados: [],
    fechaDesde: '',
    fechaHasta: '',
    origenId: undefined,
    destinoId: undefined
  });

  const [appliedFilters, setAppliedFilters] = useState<FilterParams>({
    estados: [],
    fechaDesde: '',
    fechaHasta: '',
    origenId: undefined,
    destinoId: undefined
  });

  const [validationErrors, setValidationErrors] = useState<{
    fecha?: string;
  }>({});

  const estadosDisponibles = [
    { value: 'CONFIRMADO', label: 'Confirmados' },
    { value: 'PENDIENTE', label: 'Pendientes' },
    { value: 'DEVUELTO', label: 'Devueltos' },
    { value: 'CANCELADO', label: 'Cancelados' },
  ];

  const openFilterModal = () => {
    setShowFilterModal(true);
  };

  const closeFilterModal = () => {
    setShowFilterModal(false);
    setShowOrigenDropdown(false);
    setShowDestinoDropdown(false);
  };

  useEffect(() => {
    return () => {
      setShowFilterModal(false);
      setShowDatePickerDesde(false);
      setShowDatePickerHasta(false);
      setShowOrigenDropdown(false);
      setShowDestinoDropdown(false);
    };
  }, []);

  const formatDate = (date: Date) => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const loadLocalidades = async () => {
    if (!token || loadingLocalidades || localidades.length > 0) return;
    
    try {
      setLoadingLocalidades(true);
      const result = await getAllLocalidadesSimple(token);
      setLocalidades(result);
    } catch (error) {
      console.error('Error cargando localidades:', error);
      Alert.alert('Error', 'No se pudieron cargar las localidades');
    } finally {
      setLoadingLocalidades(false);
    }
  };

  const getLocalidadNombre = (id: number): string => {
    const localidad = localidades.find(loc => loc.id === id);
    return localidad ? localidad.nombreConDepartamento : `ID: ${id}`;
  };

  const getAvailableOrigenLocalidades = (): Localidad[] => {
    return localidades.filter(loc => loc.id !== tempFilters.destinoId);
  };

  const getAvailableDestinoLocalidades = (): Localidad[] => {
    return localidades.filter(loc => loc.id !== tempFilters.origenId);
  };

  const handleOrigenSelect = (localidad: Localidad | null) => {
    const newOrigenId = localidad?.id;
    setTempFilters(prev => ({
      ...prev,
      origenId: newOrigenId,
      destinoId: prev.destinoId === newOrigenId ? undefined : prev.destinoId
    }));
    setShowOrigenDropdown(false);
  };

  const handleDestinoSelect = (localidad: Localidad | null) => {
    const newDestinoId = localidad?.id;
    setTempFilters(prev => ({ ...prev, destinoId: newDestinoId }));
    setShowDestinoDropdown(false);
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
    const errors: { fecha?: string } = {};

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
    if (appliedFilters.fechaDesde || appliedFilters.fechaHasta) count++;
    if (appliedFilters.origenId || appliedFilters.destinoId) count++;
    return count;
  };

  useEffect(() => {
    if (!isAuthLoading && token && !userLoading && user?.id) {
      loadTickets();
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

      loadLocalidades();
    }
  }, [showFilterModal]);

  const loadTickets = async (page = 0, isRefresh = false, isLoadMore = false) => {
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
        sort: ['viajeAsiento.viaje.fechaHoraSalida,DESC'],
      };

      if (appliedFilters.estados.length > 0) {
        apiParams.estados = appliedFilters.estados;
      }

      if (appliedFilters.fechaDesde) {
        apiParams.fechaDesde = formatDateForAPI(appliedFilters.fechaDesde, false);
      }

      if (appliedFilters.fechaHasta) {
        apiParams.fechaHasta = formatDateForAPI(appliedFilters.fechaHasta, true);
      }

      if (appliedFilters.origenId) {
        apiParams.origenId = appliedFilters.origenId;
      }

      if (appliedFilters.destinoId) {
        apiParams.destinoId = appliedFilters.destinoId;
      }

      const response = await getClientTickets(token, parseInt(user.id), apiParams);

      if (isRefresh || page === 0) {
        setTickets(response.content);
        setCurrentPage(0);
      } else {
        setTickets(prev => [...prev, ...response.content]);
      }

      setTotalPages(response.page.totalPages);
      setTotalElements(response.page.totalElements);
      setCurrentPage(response.page.number);
      setHasMore(response.page.number < response.page.totalPages - 1);

    } catch (error) {
      console.error('Error cargando pasajes:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error al cargar pasajes';
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
      loadTickets(0, true);
    }
  };

  const handleLoadMore = () => {
    if (hasMore && !loadingMore && !loading) {
      const nextPage = currentPage + 1;
      loadTickets(nextPage, false, true);
    }
  };

  const handleTicketPress = (ticket: Ticket) => {
    onNavigateToTicketDetail(ticket.id);
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
      fechaDesde: '',
      fechaHasta: '',
      origenId: undefined,
      destinoId: undefined
    };
    setTempFilters(emptyFilters);
    setAppliedFilters(emptyFilters);
    setValidationErrors({});
    setDateDesde(undefined);
    setDateHasta(undefined);
    closeFilterModal();
  };

  const applyFilters = () => {
    const validation = validateFilters(tempFilters);
    
    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      return;
    }

    setAppliedFilters({...tempFilters});
    setValidationErrors({});
    closeFilterModal();
  };

  const renderCustomDropdown = (
    isVisible: boolean,
    localidadesList: Localidad[],
    onSelect: (localidad: Localidad | null) => void,
    onClose: () => void,
    placeholder: string,
    isDisabled: boolean = false
  ) => {
    if (!isVisible) return null;

    return (
      <Modal visible={isVisible} transparent animationType="fade">
        <TouchableOpacity 
          style={styles.dropdownOverlay} 
          onPress={onClose} 
          activeOpacity={1} 
        >
          <TouchableOpacity 
            style={styles.dropdownContainer}
            activeOpacity={1}
            onPress={() => {}}
          >
            <View style={styles.dropdownHeader}>
              <Text style={styles.dropdownTitle}>Seleccionar localidad</Text>
              <TouchableOpacity onPress={onClose} style={styles.dropdownCloseButton}>
                <Icon name="close" size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={[{ id: -1, nombreConDepartamento: placeholder }, ...localidadesList]}
              keyExtractor={(item) => item.id.toString()}
              style={styles.dropdownList}
              showsVerticalScrollIndicator={true}
              nestedScrollEnabled={true}
              keyboardShouldPersistTaps="handled"
              removeClippedSubviews={false}
              renderItem={({ item, index }) => (
                <TouchableOpacity
                  style={[
                    styles.dropdownItem,
                    index === 0 && styles.dropdownItemPlaceholder
                  ]}
                  onPress={() => onSelect(item.id === -1 ? null : item)}
                  activeOpacity={0.7}
                >
                  <Text style={[
                    styles.dropdownItemText,
                    index === 0 && styles.dropdownItemTextPlaceholder
                  ]}>
                    {item.nombreConDepartamento}
                  </Text>
                  {index === 0 && (
                    <Icon name="clear" size={16} color="#9CA3AF" />
                  )}
                </TouchableOpacity>
              )}
              ItemSeparatorComponent={() => <View style={styles.dropdownSeparator} />}
            />
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    );
  };

  const renderTicketCard = (ticket: Ticket, index: number) => {
    const estadoColor = getEstadoPasajeColor(ticket.estadoPasaje);
    const estadoIcon = getEstadoPasajeIcon(ticket.estadoPasaje);
    const surfaceColor = getEstadoPasajeSurfaceColor(ticket.estadoPasaje);

    const uniqueKey = `ticket-${ticket.id}-${ticket.compraId}-${index}-${ticket.fecha}`;

    return (
      <TouchableOpacity
        key={uniqueKey}
        style={[styles.ticketCard, { marginBottom: 12 }]}
        onPress={() => handleTicketPress(ticket)}
        activeOpacity={0.8}
      >
        <View style={[styles.statusIndicator, { backgroundColor: estadoColor }]} />
        
        <View style={styles.cardHeader}>
          <View style={styles.ticketIdContainer}>
            <Text style={styles.ticketIdLabel}>Pasaje</Text>
            <Text style={styles.ticketId}>#{ticket.id}</Text>
          </View>
          <View style={[styles.statusChip, { backgroundColor: surfaceColor }]}>
            <Icon name={estadoIcon} size={16} color={estadoColor} />
            <Text style={[styles.statusText, { color: estadoColor }]}>
              {ticket.estadoPasaje}
            </Text>
          </View>
        </View>

        <View style={styles.cardContent}>
          <View style={styles.infoSection}>
            <View style={styles.infoRow}>
              <Icon name="route" size={16} color="#6B7280" />
              <Text style={styles.infoText} numberOfLines={1} ellipsizeMode="middle">
                {ticket.paradaOrigen} → {ticket.paradaDestino}
              </Text>
            </View>
            
            <View style={styles.infoRow}>
              <Icon name="event-seat" size={16} color="#6B7280" />
              <Text style={styles.infoText}>
                Asiento {ticket.numeroAsiento}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Icon name="schedule" size={16} color="#6B7280" />
              <Text style={styles.infoText}>
                {formatTicketDateTime(ticket.fecha)}
              </Text>
            </View>
          </View>

          <View style={styles.priceSection}>
            <Text style={styles.currentPrice}>
              {formatPrice(ticket.subtotal)}
            </Text>
            {ticket.descuento > 0 && (
              <Text style={styles.originalPrice}>
                Original: {formatPrice(ticket.precio)}
              </Text>
            )}
            {ticket.fueReembolsado && (
              <Text style={styles.refundText}>
                Reembolsado: {formatPrice(ticket.montoReintegrado)}
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
      onRequestClose={closeFilterModal}
    >
      <View style={styles.modalOverlay}>
        <TouchableOpacity 
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={closeFilterModal}
        />
        <View style={[
          styles.filterModal,
          {
            width: isCompact ? width * 0.95 : Math.min(600, width * 0.85),
            maxHeight: height * 0.85,
          }
        ]}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Filtrar pasajes</Text>
            <TouchableOpacity 
              onPress={closeFilterModal}
              style={styles.closeButton}
            >
              <Icon name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <ScrollView 
            style={styles.filterOptions} 
            contentContainerStyle={styles.filterOptionsContent}
            showsVerticalScrollIndicator={true}
            bounces={true}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Estado del pasaje</Text>
              
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
                    { backgroundColor: getEstadoPasajeColor(estado.value) }
                  ]} />
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Rango de fechas de viaje</Text>
              
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

            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Filtrar por localidades</Text>
              
              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>Localidad de Origen</Text>
                {loadingLocalidades ? (
                  <View style={styles.loadingPickerContainer}>
                    <ActivityIndicator size="small" color="#3B82F6" />
                    <Text style={styles.loadingPickerText}>Cargando localidades...</Text>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.customDropdownTrigger}
                    onPress={() => {
                      setShowDestinoDropdown(false);
                      setShowOrigenDropdown(!showOrigenDropdown);
                    }}
                    activeOpacity={0.8}
                  >
                    <Text style={[
                      styles.customDropdownText,
                      !tempFilters.origenId && styles.customDropdownPlaceholder
                    ]}>
                      {tempFilters.origenId 
                        ? getLocalidadNombre(tempFilters.origenId)
                        : 'Seleccionar origen'
                      }
                    </Text>
                    <Icon 
                      name={showOrigenDropdown ? "keyboard-arrow-up" : "keyboard-arrow-down"} 
                      size={24} 
                      color="#6B7280" 
                    />
                  </TouchableOpacity>
                )}
                
                {renderCustomDropdown(
                  showOrigenDropdown,
                  getAvailableOrigenLocalidades(),
                  handleOrigenSelect,
                  () => setShowOrigenDropdown(false),
                  "Sin selección",
                  false
                )}
              </View>
              
              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>Localidad de Destino</Text>
                {loadingLocalidades ? (
                  <View style={styles.loadingPickerContainer}>
                    <ActivityIndicator size="small" color="#3B82F6" />
                    <Text style={styles.loadingPickerText}>Cargando localidades...</Text>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={[
                      styles.customDropdownTrigger,
                      !tempFilters.origenId && styles.customDropdownTriggerDisabled
                    ]}
                    onPress={() => {
                      if (tempFilters.origenId) {
                        setShowOrigenDropdown(false);
                        setShowDestinoDropdown(!showDestinoDropdown);
                      }
                    }}
                    activeOpacity={tempFilters.origenId ? 0.8 : 1}
                    disabled={!tempFilters.origenId}
                  >
                    <Text style={[
                      styles.customDropdownText,
                      (!tempFilters.destinoId || !tempFilters.origenId) && styles.customDropdownPlaceholder,
                      !tempFilters.origenId && styles.customDropdownDisabled
                    ]}>
                      {!tempFilters.origenId 
                        ? "Primero selecciona origen"
                        : tempFilters.destinoId 
                          ? getLocalidadNombre(tempFilters.destinoId)
                          : 'Seleccionar destino'
                      }
                    </Text>
                    <Icon 
                      name={showDestinoDropdown ? "keyboard-arrow-up" : "keyboard-arrow-down"} 
                      size={24} 
                      color={tempFilters.origenId ? "#6B7280" : "#D1D5DB"} 
                    />
                  </TouchableOpacity>
                )}
                
                {renderCustomDropdown(
                  showDestinoDropdown && !!tempFilters.origenId,
                  getAvailableDestinoLocalidades(),
                  handleDestinoSelect,
                  () => setShowDestinoDropdown(false),
                  "Sin selección",
                  !tempFilters.origenId
                )}
              </View>
              
              <Text style={styles.helperText}>
                Selecciona primero el origen para habilitar la selección de destino
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
      <Text style={styles.headerTitle}>Mis pasajes</Text>
      <View style={styles.headerActions}>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={openFilterModal}
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
        {totalElements} pasaje{totalElements !== 1 ? 's' : ''} encontrado{totalElements !== 1 ? 's' : ''}
        {getActiveFiltersCount() > 0 && ` (filtrado${totalElements !== 1 ? 's' : ''})`}
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
          <Text style={styles.loadMoreText}>Cargar más pasajes</Text>
        )}
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <Icon name="confirmation-number" size={48} color="#6B7280" />
      </View>
      <Text style={styles.emptyTitle}>
        {getActiveFiltersCount() > 0 ? 'Sin resultados' : 'No hay pasajes'}
      </Text>
      <Text style={styles.emptyMessage}>
        {getActiveFiltersCount() > 0
          ? 'No se encontraron pasajes con los filtros seleccionados. Intenta ajustar los criterios de búsqueda.'
          : 'Aún no has adquirido ningún pasaje. Te recomendamos que busques viajes disponibles.'}
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
            loadTickets();
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
              <Text style={styles.loadingText}>
                {userLoading ? 'Cargando usuario...' : 'Cargando pasajes...'}
              </Text>
            </View>
          </View>
        </ImageBackground>
        {renderFilterModal()}
        {showDatePickerDesde && (
          <View style={styles.datePickerContainer}>
            <DateTimePicker
              value={dateDesde || new Date()}
              mode="date"
              display="default"
              onChange={onChangeDateDesde}
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
            />
          </View>
        )}
      </SafeAreaView>
    );
  }

  if (loading && tickets.length === 0) {
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
                {userLoading ? 'Cargando usuario...' : 'Cargando pasajes...'}
              </Text>
            </View>
          </View>
        </ImageBackground>
        {renderFilterModal()}
        {showDatePickerDesde && (
          <View style={styles.datePickerContainer}>
            <DateTimePicker
              value={dateDesde || new Date()}
              mode="date"
              display="default"
              onChange={onChangeDateDesde}
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
            />
          </View>
        )}
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
        </ImageBackground>
        {renderFilterModal()}
        {showDatePickerDesde && (
          <View style={styles.datePickerContainer}>
            <DateTimePicker
              value={dateDesde || new Date()}
              mode="date"
              display="default"
              onChange={onChangeDateDesde}
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
            />
          </View>
        )}
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
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={['#3B82F6']}
              tintColor="#3B82F6"
            />
          }
        >
          <View style={styles.cardContainer}>
            {renderHeader()}
            
            {error && tickets.length === 0 ? (
              renderError()
            ) : tickets.length === 0 ? (
              renderEmptyState()
            ) : (
              <View style={styles.contentContainer}>
                {renderStats()}
                <View style={styles.ticketsContainer}>
                  {tickets.map((ticket, index) => renderTicketCard(ticket, index))}
                  {renderLoadMoreButton()}
                </View>
              </View>
            )}
          </View>
        </ScrollView>
      </ImageBackground>

      {renderFilterModal()}
      
      {showDatePickerDesde && (
        <View style={styles.datePickerContainer}>
          <DateTimePicker
            value={dateDesde || new Date()}
            mode="date"
            display="default"
            onChange={onChangeDateDesde}
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
          />
        </View>
      )}
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
    marginBottom: 16,
    flexWrap: 'wrap',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#374151',
    flex: 1,
    minWidth: 120,
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
    minWidth: 44,
    minHeight: 44,
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
  ticketsContainer: {
    flex: 1,
  },
  ticketCard: {
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
    marginHorizontal: 2,
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
    flexWrap: 'wrap',
    gap: 8,
  },
  ticketIdContainer: {
    flex: 1,
    minWidth: 80,
  },
  ticketIdLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  ticketId: {
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
    flexShrink: 0,
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
    flexWrap: 'wrap',
  },
  infoText: {
    fontSize: 14,
    color: '#6B7280',
    flex: 1,
  },
  priceSection: {
    alignItems: 'flex-end',
    flexShrink: 0,
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
  refundText: {
    fontSize: 12,
    color: '#2196F3',
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
    borderRadius: 8,
    padding: 16,
    marginTop: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginHorizontal: 2,
  },
  loadMoreContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  loadMoreText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#3B82F6',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.32)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
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
    zIndex: 1001,
    position: 'absolute',
    top: '7.5%',
    alignSelf: 'center',
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
  filterOptions: {
    flex: 1,
    paddingHorizontal: 24,
  },
  filterOptionsContent: {
    paddingBottom: 20,
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
  textInputError: {
    borderColor: '#F44336',
  },
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#F9FAFB',
    minHeight: 48,
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
  customDropdownTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 14,
    minHeight: 48,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  customDropdownTriggerDisabled: {
    backgroundColor: '#F9FAFB',
    borderColor: '#E5E7EB',
  },
  customDropdownText: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
  },
  customDropdownPlaceholder: {
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
  customDropdownDisabled: {
    color: '#9CA3AF',
  },
  dropdownOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdownContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    maxHeight: 300,
    width: '85%',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    overflow: 'hidden',
  },
  dropdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: 'white',
  },
  dropdownTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
  },
  dropdownCloseButton: {
    padding: 4,
    borderRadius: 4,
  },
  dropdownList: {
    maxHeight: 240,
    backgroundColor: 'white',
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    minHeight: 50,
    backgroundColor: 'white',
  },
  dropdownItemPlaceholder: {
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  dropdownItemText: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
    lineHeight: 18,
  },
  dropdownItemTextPlaceholder: {
    color: '#374151',
    fontWeight: '500',
  },
  dropdownSeparator: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginHorizontal: 16,
  },
  loadingPickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    marginBottom: 16,
    minHeight: 48,
  },
  loadingPickerText: {
    fontSize: 14,
    color: '#6B7280',
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
});

export default TicketsScreen;