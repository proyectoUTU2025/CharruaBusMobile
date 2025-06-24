export interface PurchasesScreenProps {
  onNavigateToPurchaseDetail: (purchaseId: number) => void;
  onGoBack?: () => void;
}

export interface FilterParams {
  estados: string[];
  montoMin: string;
  montoMax: string;
  fechaDesde: string;
  fechaHasta: string;
}

export interface PurchaseDetail {
  id: number;
  fechaCompra: string;
  precioActual: number;
  precioOriginal: number;
  vendedorId: number;
  clienteId: number;
  cantidadPasajes: number;
  estado: 'PENDIENTE' | 'COMPLETADA' | 'CANCELADA' | 'REEMBOLSADA' | 'PARCIALMENTE_REEMBOLSADA';
  pasajes: PurchaseTicket[];
}

export interface PurchaseTicket {
  id: number;
  compraId: number;
  fecha: string;
  numeroAsiento: number;
  paradaOrigen: string;
  paradaDestino: string;
  precio: number;
  descuento: number;
  subtotal: number;
  montoReintegrado: number;
  estadoPasaje: 'COMPLETADA' | 'PENDIENTE' | 'CANCELADA' | 'REEMBOLSADA' | 'PARCIALMENTE_REEMBOLSADA';
}

export interface PurchaseDetailResponse {
  data: PurchaseDetail;
  message: string;
}

export interface PurchaseScreenProps {
  route: {
    params: {
      purchaseId: number;
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

export interface DownloadPurchasePdfParams {
  purchaseId: number;
}

export interface DownloadTicketPdfParams {
  ticketId: number;
}

export interface Purchase {
  id: number;
  fechaCompra: string;
  precioActual: number;
  precioOriginal: number;
  vendedorId: number;
  clienteId: number;
  cantidadPasajes: number;
  estado: 'PENDIENTE' | 'COMPLETADA' | 'CANCELADA' | 'REEMBOLSADA' | 'PARCIALMENTE_REEMBOLSADA';
}

export interface PurchasesResponse {
  content: Purchase[];
  page: {
    size: number;
    number: number;
    totalElements: number;
    totalPages: number;
  };
}

export interface GetPurchasesParams {
  clienteId: number;
  estados?: string[];
  fechaDesde?: string;
  fechaHasta?: string;
  montoMin?: number;
  montoMax?: number;
  page?: number;
  size?: number;
  sort?: string[];
}