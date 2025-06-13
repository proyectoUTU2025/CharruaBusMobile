import { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { useAuth } from '../context/AuthContext';
import { User, DecodedToken, UseUserReturn } from '../types/userType';

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
          email: decodedToken.sub || decodedToken.email || '',
          apellido: decodedToken.apellido,
          rol: decodedToken.role,
          situacionLaboral: decodedToken.situacionLaboral,
        };
        
        setUser(userData);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Error decodificando token:', error);
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