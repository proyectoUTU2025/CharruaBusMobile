export interface User {
  id: string;
  name: string;
  email: string;
  apellido?: string;
  rol?: string;
  situacionLaboral?: string;
}

export interface DecodedToken {
  id?: number | string;
  email?: string;
  name?: string;
  apellido?: string;
  role?: string;
  situacionLaboral?: string;
  exp?: number;
  iat?: number;
  sub?: string;
}

export interface UseUserReturn {
  user: User | null;
  loading: boolean;
  refreshUser: () => void;
}

export interface EditProfileScreenProps {
  onGoBack: () => void;
  onSuccess: () => void;
  token: string;
}

export interface UpdateUserProfileData {
  nombre: string;
  apellido: string;
  documento: string;
  tipoDocumento: string;
  fechaNacimiento: string;
  situacionLaboral: string;
}

export interface UpdateUserProfileResponse {
  success: boolean;
  message: string;
  data?: any;
}

export interface UserProfileData {
  id: number;
  email: string;
  nombre: string;
  apellido: string;
  documento: string;
  tipoDocumento: string;
  fechaNacimiento: string;
  genero: string;
  situacionLaboral: string;
  rol: string;
  activo: boolean;
  emailVerificado: boolean;
  fechaCreacion: string;
  fechaActualizacion: string;
}

export interface UserApiResponse {
  id: number;
  email: string;
  nombre: string;
  apellido: string;
  documento: string;
  tipoDocumento: string;
  fechaNacimiento: string;
  genero: string;
  situacionLaboral: string;
  rol: string;
  activo: boolean;
  emailVerificado: boolean;
  fechaCreacion: string;
  fechaActualizacion: string;
}