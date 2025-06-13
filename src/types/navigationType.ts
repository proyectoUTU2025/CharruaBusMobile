import { Localidad } from './locationType';
import { RoundTripState } from './roundTripType';

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  VerifyEmail: { email: string };
  Auth: undefined;
  Main: undefined;
  TripSelection: undefined;
  OneWayTrip: undefined;
  RoundTrip: undefined;
  ViewTrips: {
    origenSeleccionado: Localidad;
    destinoSeleccionado: Localidad;
    fecha: string;
    date: string;
    pasajeros: string;
    tipoViaje: 'ida' | 'ida-vuelta';
  };
  SelectSeat: {
    tripId: number;
    origenSeleccionado: any;
    destinoSeleccionado: any;
    fecha: string;
    pasajeros: string;
    trip: any;
    tipoViaje: 'ida' | 'ida-vuelta';
  };
  PaymentSuccess: { session_id: string };
  PaymentCancelled: { session_id: string };
};

export type NavigationState = 
  | { type: 'tab' }
  | { type: 'oneWayTrip' }
  | { type: 'roundTrip' }
  | { type: 'viewTrips'; params: any }
  | { type: 'selectSeat'; params: any }
  | { type: 'changePassword' };

export interface ViewTripsParams {
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
}