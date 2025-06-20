export interface NotificacionUsuario {
  id: number;
  compraId: number | null;
  titulo: string;
  mensaje: string;
  fecha: string;
  timestamp: number;
  leido: boolean;
  tipo: 'COMPRA' | 'GENERAL' | 'PROMOCION';
}

export interface NotificacionesResponse {
  content: NotificacionUsuario[];
  page: {
    size: number;
    number: number;
    totalElements: number;
    totalPages: number;
  };
}

export interface NotificacionesCountResponse {
  data: number;
  message: string;
}

export interface MarkAsReadResponse {
  data: string;
  message: string;
}