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

export interface TicketDetailResponse {
  data: TicketDetail;
  message: string;
}

export interface TicketScreenProps {
  route: {
    params: {
      ticketId: number;
    };
  };
  navigation?: {
    navigate: (screen: string, params?: any) => void;
    goBack: () => void;
    reset: (resetState: any) => void;
  };
}

export interface PdfDownloadResponse {
  success: boolean;
  message: string;
  fileName?: string;
}

export interface DownloadTicketPdfParams {
  ticketId: number;
}

export interface TicketsScreenProps {
  onNavigateToTicketDetail: (ticketId: number) => void;
  handleUnauthorized: () => void;
}

export interface FilterParams {
  estados: string[];
  fechaDesde: string;
  fechaHasta: string;
  origenId?: number;
  destinoId?: number;
}