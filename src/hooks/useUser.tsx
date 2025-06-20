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

// En useUser.tsx - agregar este debug para ver qué contiene el token

const loadUserFromToken = async (): Promise<void> => {
  try {
    if (token) {
      console.log('Debug User: Token exists, decoding...');
      const decodedToken: DecodedToken = jwtDecode(token);
      
      console.log('Debug User: Decoded token completo:', decodedToken);
      console.log('Debug User: Token fields:', {
        id: decodedToken.id,
        sub: decodedToken.sub,
        email: decodedToken.email,
        name: decodedToken.name,
        apellido: decodedToken.apellido,
        role: decodedToken.role,
        situacionLaboral: decodedToken.situacionLaboral
      });
      
      const userData: User = {
        id: String(decodedToken.id || decodedToken.sub || ''),
        name: decodedToken.name || 'Usuario',
        email: decodedToken.sub || decodedToken.email || '',
        apellido: decodedToken.apellido,
        rol: decodedToken.role,
        situacionLaboral: decodedToken.situacionLaboral,
      };
      
      console.log('Debug User: Final userData:', userData);
      console.log('Debug User: User ID for notifications:', userData.id);
      
      setUser(userData);
    } else {
      console.log('Debug User: No token available');
      setUser(null);
    }
  } catch (error) {
    console.error('Debug User: Error decodificando token:', error);
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