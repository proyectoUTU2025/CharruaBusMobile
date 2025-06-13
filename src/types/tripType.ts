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

export interface SearchTripsResponse {
  trips: Trip[];
  totalResults: number;
  totalPages: number;
  currentPage: number;
  hasMore: boolean;
  message?: string;
}

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

export type EstadoAsiento = "disponible" | "ocupado" | "reservado" | "seleccionado";

export interface AsientoLocal extends Seat {
  estado: EstadoAsiento;
  fila: number;
  columna: string;
  precio: number;
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

export interface TripDetailsResponse {
  data: TripDetails;
  message: string;
}