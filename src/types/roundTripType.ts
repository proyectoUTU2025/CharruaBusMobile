import { Localidad } from './locationType';

export interface ViajeIda {
  origenSeleccionado: Localidad;
  destinoSeleccionado: Localidad;
  fecha: string;
  date: string;
  pasajeros: string;
  tripId?: number;
  trip?: any;
  asientosSeleccionados?: number[];
}

export interface ViajeVuelta {
  origenSeleccionado: Localidad;
  destinoSeleccionado: Localidad;
  fecha: string;
  date: string;
  pasajeros: string;
  tripId?: number;
  trip?: any;
  asientosSeleccionados?: number[];
}

export interface RoundTripState {
  tipoViaje: 'ida' | 'ida-vuelta';
  currentStep: 'form' | 'select-trip-ida' | 'select-seat-ida' | 'select-trip-vuelta' | 'select-seat-vuelta' | 'payment';
  viajeIda: ViajeIda | null;
  viajeVuelta: ViajeVuelta | null;
}