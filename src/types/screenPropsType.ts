import { Localidad } from './locationType';
import { RoundTripState } from './roundTripType';

export interface ViewTripsScreenProps {
  route: {
    params: {
      origenSeleccionado: Localidad;
      destinoSeleccionado: Localidad;
      fecha: string;
      date: string;
      pasajeros: string;
      tipoViaje: 'ida' | 'ida-vuelta';
      fechaIda?: string;
      fechaVuelta?: string;
      dateIda?: string;
      dateVuelta?: string;
      roundTripState?: RoundTripState;
      wentToPayment?: boolean;
    };
  };
  navigation?: {
    navigate: (params: any) => void;
    goBack: () => void;
  };
  onGoBack?: (roundTripState?: RoundTripState) => void;
}

export interface SelectSeatScreenProps {
  route: {
    params: {
      tripId: number;
      origenSeleccionado: any;
      destinoSeleccionado: any;
      fecha: string;
      pasajeros: string;
      trip: any;
      tipoViaje: 'ida' | 'ida-vuelta';
      roundTripState?: RoundTripState;
      onWentToPayment?: () => void;
    };
  };
  navigation?: {
    navigate: (params: any) => void;
    goBack: () => void;
  };
}

export interface TripSelectionScreenProps {
  activeTab?: string;
  onTabPress?: (tab: string) => void;
  onNavigateToOneWay?: () => void;
  onNavigateToRoundTrip?: () => void;
}

export interface OneWayTripScreenProps {
  onGoBack?: () => void;
  onNavigateToViewTrips?: (params: {
    origenSeleccionado: Localidad;
    destinoSeleccionado: Localidad;
    fecha: string;
    date: string;
    pasajeros: string;
    tipoViaje: 'ida' | 'ida-vuelta';
  }) => void;
}

export interface RoundTripInitialData {
  origenSeleccionado?: Localidad;
  destinoSeleccionado?: Localidad;
  fechaIda?: string;
  dateIda?: string;
  fechaVuelta?: string;
  dateVuelta?: string;
  pasajeros?: string;
}

export interface RoundTripScreenProps {
  onVolver?: () => void;
  onNavigateToViewTrips?: (params: {
    origenSeleccionado: Localidad;
    destinoSeleccionado: Localidad;
    fecha: string;
    date: string;
    pasajeros: string;
    tipoViaje: 'ida' | 'ida-vuelta';
    roundTripState?: RoundTripState;
  }) => void;
  initialData?: RoundTripInitialData;
}

export interface ChangePasswordScreenProps {
  onGoBack: () => void;
  onSuccess: () => void;
  token: string;
}