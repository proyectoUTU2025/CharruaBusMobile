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