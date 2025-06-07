const API_BASE_URL = 'http://192.168.1.7:8080';

export interface Trip {
  idViaje: number;
  origen: string;
  destino: string;
  fechaHoraSalida: string;
  fechaHoraLlegada: string;
  asientosDisponibles: number;
  precioEstimado: number;
}

export interface SearchTripsParams {
  idLocalidadOrigen: number;
  idLocalidadDestino: number;
  fechaViaje: string;
  cantidadPasajes: number;
  page?: number;
  size?: number;
  sort?: string[];
}

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

export interface SearchTripsResponse {
  trips: Trip[];
  totalResults: number;
  totalPages: number;
  currentPage: number;
  hasMore: boolean;
  message?: string;
}

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

    const data: PaginatedResponse<Trip> = await response.json();
   
    return {
      trips: data.content || [],
      totalResults: data.totalElements,
      totalPages: data.totalPages,
      currentPage: data.number,
      hasMore: !data.last,
      message: data.empty ? 'No se encontraron viajes' : 'Viajes encontrados',
    };
  } catch (error) {
    console.error('Error searching trips:', error);
    throw error instanceof Error
      ? error
      : new Error('Error desconocido al buscar viajes');
  }
};

export const formatDateForAPI = (date: Date | string): string => {
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

export interface TripStop {
  localidadId: number;
  nombreLocalidad: string;
  horaProgramada: string;
  orden: number;
}

export interface Seat {
  id: number;
  numero: number;
  estado: string;
}

export interface TripDetails {
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
  paradas: TripStop[];
  asientos: Seat[];
}

export interface TripDetailsResponse {
  data: TripDetails;
  message: string;
}

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
    console.error('Error fetching trip details:', error);
    throw error instanceof Error
      ? error
      : new Error('Error desconocido al obtener detalles del viaje');
  }
};