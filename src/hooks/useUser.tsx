import { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { useAuth } from '../context/AuthContext';

interface User {
  id: string;
  name: string;
  email: string;
  apellido?: string;
  rol?: string;
}

interface DecodedToken {
  id?: number | string;
  email?: string;
  name?: string;
  role?: string;
  exp?: number;
  iat?: number;
  sub?: string;
}

interface UseUserReturn {
  user: User | null;
  loading: boolean;
  refreshUser: () => void;
}

export const useUser = (): UseUserReturn => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const { token } = useAuth();

  useEffect(() => {
    loadUserFromToken();
  }, [token]);

  const loadUserFromToken = async (): Promise<void> => {
    try {
      if (token) {
        const decodedToken: DecodedToken = jwtDecode(token);
        
        const userData: User = {
          id: String(decodedToken.id || decodedToken.sub || ''),
          name: decodedToken.name || 'Usuario',
          email: decodedToken.sub || '',
          rol: decodedToken.role,
        };
        setUser(userData);
      } else {
        setUser(null);
      }
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const refreshUser = (): void => {
    setLoading(true);
    loadUserFromToken();
  };

  return {
    user,
    loading,
    refreshUser
  };
};