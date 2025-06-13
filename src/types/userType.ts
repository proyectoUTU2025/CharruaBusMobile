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