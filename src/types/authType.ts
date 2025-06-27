export type AuthContextType = {
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  token: string | null;
  loading: boolean;
  error: string | null;
  clearError: () => void;
  isAuthLoading: boolean;
};

export type RegisterData = {
  email: string;
  password: string;
  nombre: string;
  apellido: string;
  fechaNacimiento: string;
  documento: string;
  tipoDocumento: string;
  situacionLaboral: string;
};