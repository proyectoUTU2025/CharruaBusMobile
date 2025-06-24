export interface ConfiguracionSistema {
  id: number;
  nombre: string;
  valorInt: number;
  valor: string;
}

export interface ConfiguracionIndividualResponse {
  data: ConfiguracionSistema;
  message: string;
}

export interface ConfiguracionResponse {
  totalElements: number;
  totalPages: number;
  pageable: {
    pageNumber: number;
    pageSize: number;
    paged: boolean;
    unpaged: boolean;
    offset: number;
    sort: {
      sorted: boolean;
      unsorted: boolean;
      empty: boolean;
    };
  };
  first: boolean;
  last: boolean;
  size: number;
  content: ConfiguracionSistema[];
  number: number;
  sort: {
    sorted: boolean;
    unsorted: boolean;
    empty: boolean;
  };
  numberOfElements: number;
  empty: boolean;
}

export interface ConfiguracionIndividualResponse {
  data: ConfiguracionSistema;
  message: string;
}