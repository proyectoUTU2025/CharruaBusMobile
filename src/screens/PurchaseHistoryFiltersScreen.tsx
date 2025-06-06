import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TextInput,
  Modal,
  Platform,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import DateTimePicker from '@react-native-community/datetimepicker';

interface PurchaseHistoryFiltersScreenProps {
  onGoBack?: () => void;
  onApplyFilters: (filters: FilterData) => void;
}

interface FilterData {
  estados: string[];
  fechaDesde?: Date;
  fechaHasta?: Date;
  montoMin?: number;
  montoMax?: number;
}

const PurchaseHistoryFiltersScreen: React.FC<PurchaseHistoryFiltersScreenProps> = ({ 
  onGoBack,
  onApplyFilters
}) => {
  // Estados para filtros
  const [selectedStatus, setSelectedStatus] = useState<string[]>([]);
  const [dateFrom, setDateFrom] = useState<Date | null>(null);
  const [dateTo, setDateTo] = useState<Date | null>(null);
  const [minAmount, setMinAmount] = useState<string>('');
  const [maxAmount, setMaxAmount] = useState<string>('');
  
  // Estados para selección de fecha
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [datePickerMode, setDatePickerMode] = useState<'from' | 'to'>('from');
  
  // Función para manejar selección de estado
  const toggleStatusFilter = (status: string) => {
    if (selectedStatus.includes(status)) {
      setSelectedStatus(selectedStatus.filter(s => s !== status));
    } else {
      setSelectedStatus([...selectedStatus, status]);
    }
  };
  
  // Función para mostrar selector de fecha
  const showDatePickerModal = (mode: 'from' | 'to') => {
    setDatePickerMode(mode);
    setShowDatePicker(true);
  };
  
  // Función para manejar cambio de fecha
  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    
    if (selectedDate) {
      if (datePickerMode === 'from') {
        setDateFrom(selectedDate);
      } else {
        setDateTo(selectedDate);
      }
    }
  };
  
  // Función para formatear fecha
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-UY', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  // Función para obtener texto según estado
  const getStatusText = (status: string) => {
    switch (status) {
      case 'COMPLETADA': return 'Completada';
      case 'PENDIENTE': return 'Pendiente';
      case 'CANCELADA': return 'Cancelada';
      default: return status;
    }
  };
  
  // Función para aplicar filtros
  const handleApplyFilters = () => {
    const filters: FilterData = {
      estados: selectedStatus,
      fechaDesde: dateFrom || undefined,
      fechaHasta: dateTo || undefined,
      montoMin: minAmount ? parseFloat(minAmount) : undefined,
      montoMax: maxAmount ? parseFloat(maxAmount) : undefined,
    };
    
    onApplyFilters(filters);
  };
  
  // Función para resetear filtros
  const resetFilters = () => {
    setSelectedStatus([]);
    setDateFrom(null);
    setDateTo(null);
    setMinAmount('');
    setMaxAmount('');
  };
  
  // Función para buscar sin filtros
  const searchWithoutFilters = () => {
    onApplyFilters({
      estados: [],
    });
  };
  
  // Verificar si hay filtros aplicados
  const hasFilters = selectedStatus.length > 0 || dateFrom || dateTo || minAmount || maxAmount;
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#3B82F6" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onGoBack}>
          <Icon name="arrow-back" size={24} color="#3B82F6" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Filtros de Búsqueda</Text>
        <View style={styles.headerSpacer} />
      </View>
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Información */}
        <View style={styles.infoCard}>
          <Icon name="info" size={24} color="#3B82F6" style={styles.infoIcon} />
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Buscar Compras</Text>
            <Text style={styles.infoText}>
              Aplica filtros para encontrar compras específicas o busca todas las compras sin filtros.
            </Text>
          </View>
        </View>
        
        {/* Filtro por estado */}
        <View style={styles.filterSection}>
          <Text style={styles.filterSectionTitle}>Estado de la Compra</Text>
          <Text style={styles.filterSectionSubtitle}>Selecciona uno o más estados</Text>
          
          <View style={styles.statusCheckboxes}>
            {['COMPLETADA', 'PENDIENTE', 'CANCELADA'].map((status) => (
              <TouchableOpacity
                key={status}
                style={styles.checkboxContainer}
                onPress={() => toggleStatusFilter(status)}
              >
                <View style={[
                  styles.checkbox,
                  selectedStatus.includes(status) && styles.checkboxSelected
                ]}>
                  {selectedStatus.includes(status) && (
                    <Icon name="check" size={16} color="white" />
                  )}
                </View>
                <Text style={styles.checkboxLabel}>{getStatusText(status)}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        
        {/* Filtro por fecha */}
        <View style={styles.filterSection}>
          <Text style={styles.filterSectionTitle}>Rango de Fechas</Text>
          <Text style={styles.filterSectionSubtitle}>Filtra por fecha de compra</Text>
          
          <View style={styles.dateFilters}>
            <TouchableOpacity
              style={styles.datePickerButton}
              onPress={() => showDatePickerModal('from')}
            >
              <Icon name="calendar-today" size={20} color="#49454F" style={styles.dateIcon} />
              <Text style={styles.dateButtonText}>
                {dateFrom ? formatDate(dateFrom) : 'Fecha desde'}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.datePickerButton}
              onPress={() => showDatePickerModal('to')}
            >
              <Icon name="calendar-today" size={20} color="#49454F" style={styles.dateIcon} />
              <Text style={styles.dateButtonText}>
                {dateTo ? formatDate(dateTo) : 'Fecha hasta'}
              </Text>
            </TouchableOpacity>
          </View>
          
          {(dateFrom || dateTo) && (
            <TouchableOpacity 
              style={styles.clearDatesButton}
              onPress={() => {
                setDateFrom(null);
                setDateTo(null);
              }}
            >
              <Icon name="clear" size={16} color="#F44336" />
              <Text style={styles.clearDatesText}>Limpiar fechas</Text>
            </TouchableOpacity>
          )}
        </View>
        
        {/* Filtro por monto */}
        <View style={styles.filterSection}>
          <Text style={styles.filterSectionTitle}>Rango de Montos</Text>
          <Text style={styles.filterSectionSubtitle}>Filtra por monto total de la compra</Text>
          
          <View style={styles.amountFilters}>
            <View style={styles.amountInputContainer}>
              <Text style={styles.amountPrefix}>$</Text>
              <TextInput
                style={styles.amountInput}
                placeholder="Mínimo"
                keyboardType="numeric"
                value={minAmount}
                onChangeText={setMinAmount}
              />
            </View>
            
            <View style={styles.amountInputContainer}>
              <Text style={styles.amountPrefix}>$</Text>
              <TextInput
                style={styles.amountInput}
                placeholder="Máximo"
                keyboardType="numeric"
                value={maxAmount}
                onChangeText={setMaxAmount}
              />
            </View>
          </View>
        </View>
        
        {/* Resumen de filtros */}
        {hasFilters && (
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Filtros Aplicados</Text>
            {selectedStatus.length > 0 && (
              <Text style={styles.summaryItem}>
                • Estados: {selectedStatus.map(getStatusText).join(', ')}
              </Text>
            )}
            {dateFrom && (
              <Text style={styles.summaryItem}>
                • Desde: {formatDate(dateFrom)}
              </Text>
            )}
            {dateTo && (
              <Text style={styles.summaryItem}>
                • Hasta: {formatDate(dateTo)}
              </Text>
            )}
            {minAmount && (
              <Text style={styles.summaryItem}>
                • Monto mínimo: ${minAmount}
              </Text>
            )}
            {maxAmount && (
              <Text style={styles.summaryItem}>
                • Monto máximo: ${maxAmount}
              </Text>
            )}
          </View>
        )}
      </ScrollView>
      
      {/* Botones de acción */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={styles.searchAllButton}
          onPress={searchWithoutFilters}
        >
          <Icon name="search" size={20} color="#3B82F6" style={styles.buttonIcon} />
          <Text style={styles.searchAllButtonText}>Ver Todas</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.applyFiltersButton, !hasFilters && styles.disabledButton]}
          onPress={handleApplyFilters}
          disabled={!hasFilters}
        >
          <Icon name="filter-list" size={20} color="white" style={styles.buttonIcon} />
          <Text style={styles.applyFiltersButtonText}>
            Aplicar Filtros
          </Text>
        </TouchableOpacity>
      </View>
      
      {hasFilters && (
        <TouchableOpacity
          style={styles.resetButton}
          onPress={resetFilters}
        >
          <Text style={styles.resetButtonText}>Limpiar todos los filtros</Text>
        </TouchableOpacity>
      )}
      
      {/* Selector de fecha */}
      {Platform.OS === 'ios' ? (
        <Modal
          visible={showDatePicker}
          transparent={true}
          animationType="slide"
        >
          <View style={styles.datePickerModal}>
            <View style={styles.datePickerContainer}>
              <View style={styles.datePickerHeader}>
                <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                  <Text style={styles.datePickerCancel}>Cancelar</Text>
                </TouchableOpacity>
                <Text style={styles.datePickerTitle}>
                  {datePickerMode === 'from' ? 'Fecha desde' : 'Fecha hasta'}
                </Text>
                <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                  <Text style={styles.datePickerDone}>Listo</Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={datePickerMode === 'from' ? (dateFrom || new Date()) : (dateTo || new Date())}
                mode="date"
                display="spinner"
                onChange={handleDateChange}
                style={styles.iosDatePicker}
              />
            </View>
          </View>
        </Modal>
      ) : (
        showDatePicker && (
          <DateTimePicker
            value={datePickerMode === 'from' ? (dateFrom || new Date()) : (dateTo || new Date())}
            mode="date"
            display="default"
            onChange={handleDateChange}
          />
        )
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFBFE',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E7E0EC',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1B1F',
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#E8F0FE',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  infoIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1B1F',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 14,
    color: '#49454F',
    lineHeight: 20,
  },
  filterSection: {
    marginBottom: 24,
  },
  filterSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1B1F',
    marginBottom: 4,
  },
  filterSectionSubtitle: {
    fontSize: 14,
    color: '#79747E',
    marginBottom: 16,
  },
  statusCheckboxes: {
    gap: 12,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#79747E',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  checkboxLabel: {
    fontSize: 16,
    color: '#49454F',
  },
  dateFilters: {
    gap: 12,
  },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E7E0EC',
  },
  dateIcon: {
    marginRight: 12,
  },
  dateButtonText: {
    fontSize: 16,
    color: '#49454F',
  },
  clearDatesButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginTop: 8,
    paddingVertical: 4,
  },
  clearDatesText: {
    fontSize: 14,
    color: '#F44336',
    marginLeft: 4,
  },
  amountFilters: {
    flexDirection: 'row',
    gap: 12,
  },
  amountInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E7E0EC',
    paddingHorizontal: 16,
  },
  amountPrefix: {
    fontSize: 16,
    color: '#49454F',
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    height: 48,
    fontSize: 16,
    color: '#1C1B1F',
  },
  summaryCard: {
    backgroundColor: '#F0F9FF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1B1F',
    marginBottom: 8,
  },
  summaryItem: {
    fontSize: 14,
    color: '#49454F',
    marginBottom: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E7E0EC',
  },
  searchAllButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E8F0FE',
    borderRadius: 12,
    paddingVertical: 16,
  },
  searchAllButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3B82F6',
  },
  applyFiltersButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    paddingVertical: 16,
  },
  disabledButton: {
    backgroundColor: '#CAC4D0',
  },
  applyFiltersButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  buttonIcon: {
    marginRight: 8,
  },
  resetButton: {
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E7E0EC',
  },
  resetButtonText: {
    fontSize: 14,
    color: '#F44336',
    fontWeight: '500',
  },
  datePickerModal: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  datePickerContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  datePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E7E0EC',
  },
  datePickerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1B1F',
  },
  datePickerCancel: {
    color: '#49454F',
    fontSize: 14,
  },
  datePickerDone: {
    color: '#3B82F6',
    fontSize: 14,
    fontWeight: '600',
  },
  iosDatePicker: {
    height: 200,
  },
});

export default PurchaseHistoryFiltersScreen;