import { Linking, Alert } from 'react-native';
import { API_BASE_URL } from '@env';
import { fetchWithInterceptor } from '../utils/httpInterceptor';
import { 
  PurchaseDetail, 
  PurchaseDetailResponse, 
  PurchasesResponse, 
  GetPurchasesParams,
  Purchase,
  PurchaseTicket 
} from '../types/purchaseType';

export const getClientPurchases = async (
  token: string,
  clienteId: number,
  params?: Omit<GetPurchasesParams, 'clienteId'>
): Promise<PurchasesResponse> => {
  try {
    const queryParams = new URLSearchParams({
      page: (params?.page || 0).toString(),
      size: (params?.size || 10).toString(),
    });

    if (params?.estados && params.estados.length > 0) {
      params.estados.forEach(estado => {
        queryParams.append('estados', estado);
      });
    }

    if (params?.fechaDesde) {
      queryParams.append('fechaDesde', params.fechaDesde);
    }

    if (params?.fechaHasta) {
      queryParams.append('fechaHasta', params.fechaHasta);
    }

    if (params?.montoMin !== undefined) {
      queryParams.append('montoMin', params.montoMin.toString());
    }

    if (params?.montoMax !== undefined) {
      queryParams.append('montoMax', params.montoMax.toString());
    }

    if (params?.sort && params.sort.length > 0) {
      params.sort.forEach(sortParam => {
        queryParams.append('sort', sortParam);
      });
    } else {
      queryParams.append('sort', 'fechaCompra,DESC');
    }

    const url = `${API_BASE_URL}/compras/cliente/${clienteId}?${queryParams}`;

    const response = await fetchWithInterceptor(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Error al obtener compras: ${response.status}`);
    }

    const result: PurchasesResponse = await response.json();
    return result;
    
  } catch (error) {
    throw error;
  }
};

export const getPurchaseDetail = async (
  token: string,
  purchaseId: number
): Promise<PurchaseDetail> => {
  try {
    const response = await fetchWithInterceptor(`${API_BASE_URL}/compras/${purchaseId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response:', errorText);
      
      if (response.status === 403) {
        throw new Error('No tienes permisos para acceder a esta información');
      } else if (response.status === 404) {
        throw new Error('Compra no encontrada');
      } else if (response.status >= 500) {
        throw new Error('Error del servidor. Inténtalo más tarde.');
      } else {
        throw new Error(`Error al obtener detalle de compra: ${response.status}`);
      }
    }

    const result: PurchaseDetailResponse = await response.json();
    
    if (!result.data || !result.data.id) {
      throw new Error('Respuesta del servidor con formato incorrecto');
    }
    
    return result.data;
  } catch (error) {
    if (error instanceof Error && error.message === 'Sesión expirada') {
      throw error;
    }
    
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Error de conexión. Verifica tu internet y que el servidor esté funcionando.');
    }
    
    if (error instanceof Error) {
      throw error;
    }
    
    throw new Error('Error inesperado al obtener detalle de compra.');
  }
};

const validateServerResponse = async (url: string, token: string): Promise<boolean> => {
  try {
    const response = await fetchWithInterceptor(url, {
      method: 'HEAD',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    
    return response.ok;
  } catch (error) {
    console.error('Error validando servidor:', error);
    return false;
  }
};

export const downloadPurchasePdf = async (
  token: string,
  purchaseId: number
): Promise<boolean> => {
  try {
    const pdfUrl = `${API_BASE_URL}/compras/${purchaseId}/pdf?token=${encodeURIComponent(token)}`;
    await Linking.openURL(pdfUrl);
    
    Alert.alert(
      'PDF Abierto',
      'El PDF de la compra se está abriendo en tu navegador. Desde allí podrás verlo y descargarlo si deseas.',
      [{ text: 'Entendido', style: 'default' }]
    );
    
    return true;

  } catch (error) {

    if (error instanceof Error && error.message === 'Sesión expirada') {
      throw error;
    }
    
    console.error('Error abriendo PDF de compra:', error);
    
    let errorMessage = 'Error desconocido';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    
    Alert.alert(
      'Error',
      `No se pudo abrir el PDF: ${errorMessage}`,
      [
        {
          text: 'Reintentar',
          onPress: () => downloadPurchasePdf(token, purchaseId),
        },
        { text: 'Cancelar', style: 'cancel' },
      ]
    );
    
    return false;
  }
};

export const downloadTicketPdf = async (
  token: string,
  ticketId: number
): Promise<boolean> => {
  try {
    const pdfUrl = `${API_BASE_URL}/pasajes/${ticketId}/pdf?token=${encodeURIComponent(token)}`;
    await Linking.openURL(pdfUrl);
    
    return true;

  } catch (error) {
    
    if (error instanceof Error && error.message === 'Sesión expirada') {
      throw error;
    }
    
    let errorMessage = 'Error desconocido';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    
    Alert.alert(
      'Error',
      `No se pudo abrir el PDF: ${errorMessage}`,
      [
        {
          text: 'Reintentar',
          onPress: () => downloadTicketPdf(token, ticketId),
        },
        { text: 'Cancelar', style: 'cancel' },
      ]
    );
    
    return false;
  }
};

export const formatPurchaseDateTime = (dateTimeString: string): string => {
  try {
    const date = new Date(dateTimeString);
    return date.toLocaleString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch (error) {
    console.error('Error formateando fecha:', error);
    return dateTimeString;
  }
};

export const formatPurchaseDate = (dateTimeString: string): string => {
  try {
    const date = new Date(dateTimeString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  } catch (error) {
    console.error('Error formateando fecha:', error);
    return dateTimeString;
  }
};

export const formatPurchaseTime = (dateTimeString: string): string => {
  try {
    const date = new Date(dateTimeString);
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch (error) {
    console.error('Error formateando hora:', error);
    return dateTimeString;
  }
};

export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('es-UY', {
    style: 'currency',
    currency: 'UYU',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(price);
};

export const getEstadoColor = (estado: string): string => {
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

export const getEstadoIcon = (estado: string): string => {
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

export const getEstadoSurfaceColor = (estado: string): string => {
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

export const getEstadoDescription = (estado: string): string => {
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