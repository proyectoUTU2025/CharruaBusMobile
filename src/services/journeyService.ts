const API_BASE_URL = 'http://192.168.1.7:8080';

// Interfaces básicas necesarias para ViewTripsScreen
export interface Journey {
  idViaje: number;
  origen: string;
  destino: string;
  fechaHoraSalida: string;
  fechaHoraLlegada: string;
  asientosDisponibles: number;
  precioEstimado: number;
}

export interface SearchJourneysParams {
  idLocalidadOrigen: number;
  idLocalidadDestino: number;
  fechaViaje: string;
  cantidadPasajes: number;
  page?: number;
  size?: number;
  sort?: string[];
}

// Nueva interfaz para la respuesta paginada
export interface PaginatedResponse<T> {
  totalPages: number;
  totalElements: number;
  size: number;
  content: T[];
  number: number;
  sort: {
    empty: boolean;
    unsorted: boolean;
    sorted: boolean;
  };
  numberOfElements: number;
  first: boolean;
  last: boolean;
  pageable: {
    offset: number;
    sort: {
      empty: boolean;
      unsorted: boolean;
      sorted: boolean;
    };
    unpaged: boolean;
    pageNumber: number;
    pageSize: number;
    paged: boolean;
  };
  empty: boolean;
}

export interface SearchJourneysResponse {
  journeys: Journey[];
  totalResults: number;
  totalPages: number;
  currentPage: number;
  hasMore: boolean;
  message?: string;
}

// Función principal para buscar viajes (actualizada para paginación)
export const searchJourneys = async (
  token: string,
  params: SearchJourneysParams
): Promise<SearchJourneysResponse> => {
  try {
    const queryParams = new URLSearchParams({
      idLocalidadOrigen: params.idLocalidadOrigen.toString(),
      idLocalidadDestino: params.idLocalidadDestino.toString(),
      fechaViaje: params.fechaViaje,
      cantidadPasajes: params.cantidadPasajes.toString(),
      page: (params.page || 0).toString(),
      size: (params.size || 10).toString(),
    });

    // Agregar parámetros de ordenamiento si existen
    if (params.sort && params.sort.length > 0) {
      params.sort.forEach(sortParam => {
        queryParams.append('sort', sortParam);
      });
    } else {
      // Ordenamiento por defecto
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

    const data: PaginatedResponse<Journey> = await response.json();
   
    return {
      journeys: data.content || [],
      totalResults: data.totalElements,
      totalPages: data.totalPages,
      currentPage: data.number,
      hasMore: !data.last,
      message: data.empty ? 'No se encontraron viajes' : 'Viajes encontrados',
    };
  } catch (error) {
    console.error('Error searching journeys:', error);
    throw error instanceof Error
      ? error
      : new Error('Error desconocido al buscar viajes');
  }
};

// Funciones de utilidad para fechas (usadas en ViewTripsScreen)
export const formatDateForAPI = (date: Date | string): string => {
  // Si es string, convertir a Date
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
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

export const calculateJourneyDuration = (
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

export interface JourneyStop {
  localidadId: number;
  nombreLocalidad: string;
  horaProgramada: string;
  orden: number;
}

export interface Seat {
  id: number;
  numero: number;
  estado: string; // "disponible", "ocupado", "reservado"
}

export interface JourneyDetails {
  id: number;
  omnibusId: number;
  omnibusMatricula: string;
  fechaHoraSalida: string;
  fechaHoraLlegada: string;
  precio: number;
  cantidadPasajesVendibles: number;
  cantidadAsientosVendidos: number;
  cantidadAsientosDisponibles: number;
  cantidadAsientosReservados: number;
  ventaDisponible: boolean;
  precioPorTramo: number;
  paradas: JourneyStop[];
  asientos: Seat[];
}

export interface JourneyDetailsResponse {
  data: JourneyDetails;
  message: string;
}

// Función para obtener detalles del viaje
export const getJourneyDetails = async (
  token: string,
  journeyId: number
): Promise<JourneyDetails> => {
  try {
    console.log(`Fetching journey details for ID: ${journeyId}`);
    
    const response = await fetch(`${API_BASE_URL}/viajes/${journeyId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const responseText = await response.text();
    console.log(`Journey details response status: ${response.status}`);
    console.log(`Journey details response: ${responseText}`);

    if (!response.ok) {
      let errorMessage = `Error ${response.status}: ${response.statusText}`;
      
      try {
        const errorData = JSON.parse(responseText);
        errorMessage = errorData.message || errorMessage;
      } catch (e) {
        // Si no se puede parsear como JSON, usar el mensaje por defecto
      }
      
      throw new Error(errorMessage);
    }

    const data: JourneyDetailsResponse = JSON.parse(responseText);
    return data.data;
  } catch (error) {
    console.error('Error fetching journey details:', error);
    throw error instanceof Error
      ? error
      : new Error('Error desconocido al obtener detalles del viaje');
  }
};