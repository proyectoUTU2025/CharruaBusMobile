import {
  Trip,
  SearchTripsParams,
  SearchTripsResponse,
  TripStop,
  TripDetails,
  PaginatedResponse,
  TripDetailsResponse
} from '../types/tripType';
import { API_BASE_URL } from '@env';

export const searchTrips = async (
  token: string,
  params: SearchTripsParams
): Promise<SearchTripsResponse> => {
  try {
    const queryParams = new URLSearchParams({
      idLocalidadOrigen: params.idLocalidadOrigen.toString(),
      idLocalidadDestino: params.idLocalidadDestino.toString(),
      fechaViaje: params.fechaViaje,
      cantidadPasajes: params.cantidadPasajes.toString(),
      page: (params.page || 0).toString(),
      size: (params.size || 10).toString(),
    });

    if (params.sort && params.sort.length > 0) {
      params.sort.forEach(sortParam => {
        queryParams.append('sort', sortParam);
      });
    } else {
      queryParams.append('sort', 'fechaHoraSalida,ASC');
    }

    const response = await fetch(`${API_BASE_URL}/viajes/disponibles?${queryParams}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Error HTTP: ${response.status}`);
    }

    const data: any = await response.json();
    
    const pageInfo = data.page || {};
    const content = data.content || [];
    
    const totalPages = pageInfo.totalPages || 1;
    const currentPage = pageInfo.number || 0;
    const hasMorePages = currentPage < (totalPages - 1);
    
    const result = {
      trips: content,
      totalResults: pageInfo.totalElements || 0,
      totalPages: totalPages,
      currentPage: currentPage,
      hasMore: hasMorePages,
      message: content.length === 0 ? 'No se encontraron viajes' : 'Viajes encontrados',
    };
    
    return result;
  } catch (error) {
    console.error('Error completo:', error);
    throw error instanceof Error
      ? error
      : new Error('Error desconocido al buscar viajes');
  }
};

export const getTripDetails = async (
  token: string,
  tripId: number
): Promise<TripDetails> => {
  try {
    const response = await fetch(`${API_BASE_URL}/viajes/${tripId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const responseText = await response.text();
    if (!response.ok) {
      let errorMessage = `Error ${response.status}: ${response.statusText}`;
      
      try {
        const errorData = JSON.parse(responseText);
        errorMessage = errorData.message || errorMessage;
      } catch (e) {
      }
      
      throw new Error(errorMessage);
    }

    const data: TripDetailsResponse = JSON.parse(responseText);
    return data.data;
  } catch (error) {
    throw error instanceof Error
      ? error
      : new Error('Error desconocido al obtener detalles del viaje');
  }
};

export const formatDateForAPI = (date: Date | string): string => {
  if (!date) {
    console.error('formatDateForAPI: Fecha es null, undefined o vacía:', date);
    throw new Error(`Fecha inválida: ${date}`);
  }

  let dateObj: Date;
  
  try {
    if (typeof date === 'string') {
      if (date.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
        const [day, month, year] = date.split('/');
        dateObj = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      } else if (date.match(/^\d{4}-\d{2}-\d{2}$/)) {
        dateObj = new Date(date);
      } else if (date.match(/^\d{4}-\d{2}-\d{2}T/)) {
        dateObj = new Date(date);
      } else {
        dateObj = new Date(date);
      }
    } else if (date instanceof Date) {
      dateObj = date;
    } else {
      console.error('formatDateForAPI: Tipo de fecha no soportado:', typeof date, date);
      throw new Error(`Tipo de fecha no soportado: ${typeof date}`);
    }
    
    if (isNaN(dateObj.getTime())) {
      console.error('formatDateForAPI: Fecha inválida después del parsing:', date, '→', dateObj);
      throw new Error(`Formato de fecha inválido: ${date}`);
    }
    
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    
    const result = `${year}-${month}-${day}`;
    
    return result;
    
  } catch (error) {
    console.error('formatDateForAPI: Error procesando fecha:', error);
    console.error('Fecha original:', date);
    console.error('Tipo:', typeof date);
    
    throw new Error(`Error al formatear fecha "${date}": ${error instanceof Error ? error.message : 'Error desconocido'}`);
  }
};

export const formatDateTime = (dateTimeString: string): string => {
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

export const calculateTripDuration = (
  departureTime: string,
  arrivalTime: string
): string => {
  try {
    const departure = new Date(departureTime);
    const arrival = new Date(arrivalTime);
    const durationMs = arrival.getTime() - departure.getTime();
   
    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
   
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  } catch (error) {
    return 'N/A';
  }
};

export const calcularPrecioPorTramos = (
  precioPorTramo: number,
  paradas: TripStop[],
  localidadOrigenId: number,
  localidadDestinoId: number
): number => {
  try {
    const paradaOrigen = paradas.find(p => p.localidadId === localidadOrigenId);
    const paradaDestino = paradas.find(p => p.localidadId === localidadDestinoId);
    
    if (!paradaOrigen || !paradaDestino) {
      console.warn('No se encontraron las paradas de origen o destino, usando precio base');
      console.warn('Paradas disponibles:', paradas.map(p => `${p.nombreLocalidad} (ID: ${p.localidadId}, orden: ${p.orden})`));
      console.warn('Buscando origen ID:', localidadOrigenId, 'destino ID:', localidadDestinoId);
      return precioPorTramo;
    }

    const cantidadTramos = Math.abs(paradaDestino.orden - paradaOrigen.orden);
    
    const tramosFinales = cantidadTramos === 0 ? 1 : cantidadTramos;
    
    const precioTotal = precioPorTramo * tramosFinales;
    
    return precioTotal;
    
  } catch (error) {
    console.error('Error calculando precio por tramos:', error);
    return precioPorTramo;
  }
};