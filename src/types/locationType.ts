export interface Localidad {
  id: number;
  nombreConDepartamento: string;
}

export interface LocalidadesResponse {
  content: Localidad[];
  page: {
    size: number;
    number: number;
    totalElements: number;
    totalPages: number;
  };
}

export interface GetLocalidadesParams {
  nombre?: string;
  departamentos?: string[];
  page?: number;
  size?: number;
  sort?: string[];
}