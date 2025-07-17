import { Linking, Alert  } from 'react-native';
import { API_BASE_URL } from '@env';
import { fetchWithInterceptor } from '../utils/httpInterceptor';

export interface Ticket {
  id: number;
  compraId: number;
  fecha: string;
  numeroAsiento: number;
  paradaOrigen: string;
  paradaDestino: string;
  precio: number;
  descuento: number;
  subtotal: number;
  estadoPasaje: 'CONFIRMADO' | 'CANCELADO' | 'DEVUELTO' | 'PENDIENTE';
  fechaDevolucion?: string;
  montoReintegrado: number;
  fueReembolsado: boolean;
}

export interface TicketDetail {
  id: number;
  compraId: number;
  fecha: string;
  numeroAsiento: number;
  paradaOrigen: string;
  paradaDestino: string;
  precio: number;
  descuento: number;
  subtotal: number;
  estadoPasaje: 'CONFIRMADO' | 'CANCELADO' | 'DEVUELTO' | 'PENDIENTE';
  fechaDevolucion?: string;
  montoReintegrado: number;
  fueReembolsado: boolean;
}

export interface TicketsResponse {
  content: Ticket[];
  page: {
    size: number;
    number: number;
    totalElements: number;
    totalPages: number;
  };
}

export interface TicketDetailResponse {
  data: TicketDetail;
  message: string;
}

export interface GetTicketsParams {
  clienteId: number;
  estados?: string[];
  fechaDesde?: string;
  fechaHasta?: string;
  origenId?: number;
  destinoId?: number;
  page?: number;
  size?: number;
  sort?: string[];
}

export const getClientTickets = async (
  token: string,
  clienteId: number,
  params?: Omit<GetTicketsParams, 'clienteId'>
): Promise<TicketsResponse> => {
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

    if (params?.origenId !== undefined) {
      queryParams.append('origenId', params.origenId.toString());
    }

    if (params?.destinoId !== undefined) {
      queryParams.append('destinoId', params.destinoId.toString());
    }

    if (params?.sort && params.sort.length > 0) {
      params.sort.forEach(sortParam => {
        queryParams.append('sort', sortParam);
      });
    } else {
      queryParams.append('sort', 'viajeAsiento.viaje.fechaHoraSalida,DESC');
    }

    const url = `${API_BASE_URL}/pasajes/cliente/${clienteId}?${queryParams}`;

    const response = await fetchWithInterceptor(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 403) {
        throw new Error('No tienes permisos para acceder a esta información');
      } else if (response.status === 404) {
        throw new Error('No se encontraron pasajes para este cliente');
      } else if (response.status >= 500) {
        throw new Error('Error del servidor. Inténtalo más tarde.');
      } else {
        throw new Error(`Error al obtener pasajes: ${response.status}`);
      }
    }

    const result: TicketsResponse = await response.json();
    
    if (!result.content || !Array.isArray(result.content)) {
      throw new Error('Respuesta del servidor con formato incorrecto');
    }
    
    return result;
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
    
    throw new Error('Error inesperado al obtener pasajes.');
  }
};

export const getTicketDetail = async (
  token: string,
  ticketId: number
): Promise<TicketDetail> => {
  try {
    const response = await fetchWithInterceptor(`${API_BASE_URL}/pasajes/${ticketId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 403) {
        throw new Error('No tienes permisos para acceder a esta información');
      } else if (response.status === 404) {
        throw new Error('Pasaje no encontrado');
      } else if (response.status >= 500) {
        throw new Error('Error del servidor. Inténtalo más tarde.');
      } else {
        throw new Error(`Error al obtener detalle de pasaje: ${response.status}`);
      }
    }

    const result: TicketDetailResponse = await response.json();
    
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
    
    throw new Error('Error inesperado al obtener detalle de pasaje.');
  }
};

export const downloadTicketPdf = async (
  token: string,
  ticketId: number
): Promise<boolean> => {
  try {
    const pdfUrl = `${API_BASE_URL}/pasajes/${ticketId}/pdf?token=${encodeURIComponent(token)}`;
    await Linking.openURL(pdfUrl);
    
    Alert.alert(
      'PDF Abierto',
      'El PDF del pasaje se está abriendo en tu navegador. Desde allí podrás verlo y descargarlo si deseas.',
      [{ text: 'Entendido', style: 'default' }]
    );
    
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

export const formatTicketDateTime = (dateTimeString: string): string => {
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
    return dateTimeString;
  }
};

export const formatTicketDate = (dateTimeString: string): string => {
  try {
    const date = new Date(dateTimeString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  } catch (error) {
    return dateTimeString;
  }
};

export const formatTicketTime = (dateTimeString: string): string => {
  try {
    const date = new Date(dateTimeString);
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch (error) {
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

export const getEstadoPasajeColor = (estado: string): string => {
  switch (estado.toUpperCase()) {
    case 'CONFIRMADO':
      return '#4CAF50';
    case 'PENDIENTE':
      return '#FF9800';
    case 'DEVUELTO':
      return '#2196F3';
    case 'CANCELADO':
      return '#F44336';
    default:
      return '#9E9E9E';
  }
};

export const getEstadoPasajeIcon = (estado: string): string => {
  switch (estado.toUpperCase()) {
    case 'CONFIRMADO':
      return 'check-circle';
    case 'PENDIENTE':
      return 'schedule';
    case 'DEVUELTO':
      return 'undo';
    case 'CANCELADO':
      return 'cancel';
    default:
      return 'info';
  }
};

export const getEstadoPasajeSurfaceColor = (estado: string): string => {
  switch (estado.toUpperCase()) {
    case 'CONFIRMADO':
      return '#E8F5E8';
    case 'PENDIENTE':
      return '#FFF3E0';
    case 'DEVUELTO':
      return '#E3F2FD';
    case 'CANCELADO':
      return '#FFEBEE';
    default:
      return '#F5F5F5';
  }
};

export const getEstadoPasajeDescription = (estado: string): string => {
  switch (estado.toUpperCase()) {
    case 'CONFIRMADO':
      return 'Pasaje confirmado y válido';
    case 'PENDIENTE':
      return 'Pasaje pendiente de confirmación';
    case 'DEVUELTO':
      return 'Pasaje devuelto';
    case 'CANCELADO':
      return 'Pasaje cancelado';
    default:
      return 'Estado desconocido';
  }
};