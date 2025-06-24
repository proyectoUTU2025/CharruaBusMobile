import { API_BASE_URL } from '@env';
import { UserApiResponse } from '../types/userType';


export const getUserById = async (token: string, userId: string): Promise<UserApiResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/usuarios/${userId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response:', errorText);
      
      if (response.status === 401) {
        throw new Error('Token de autenticación inválido');
      } else if (response.status === 403) {
        throw new Error('No tienes permisos para acceder a esta información');
      } else if (response.status === 404) {
        throw new Error('Usuario no encontrado');
      } else if (response.status >= 500) {
        throw new Error('Error del servidor. Inténtalo más tarde.');
      } else {
        throw new Error(`Error al obtener datos del usuario: ${response.status}`);
      }
    }

    const result = await response.json();
    return result.data || result;
  } catch (error) {
    console.error('Error en getUserById:', error);
    
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Error de conexión. Verifica tu internet y que el servidor esté funcionando.');
    }
    
    if (error instanceof Error) {
      throw error;
    }
    
    throw new Error('Error inesperado al obtener datos del usuario.');
  }
};