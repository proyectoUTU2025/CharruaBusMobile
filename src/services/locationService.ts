import { Localidad } from '../types/locationType';

const API_BASE_URL = 'http://192.168.1.170:8080';

export const getOrigenesPosibles = async (authToken: string): Promise<Localidad[]> => {
  try {

    const response = await fetch(`${API_BASE_URL}/localidades/origenes-posibles`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authToken}`,
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
      } else if (response.status >= 500) {
        throw new Error('Error del servidor. Inténtalo más tarde.');
      } else {
        throw new Error(`Error al obtener las localidades: ${response.status}`);
      }
    }

    const result = await response.json();
    
    return result || [];
  } catch (error) {
    console.error('Error en getOrigenesPosibles:', error);
    
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Error de conexión. Verifica tu internet y que el servidor esté funcionando.');
    }
    
    if (error instanceof Error) {
      throw error;
    }
    
    throw new Error('Error inesperado al obtener localidades.');
  }
};

export const getDestinosPosibles = async (authToken: string, idLocalidadOrigen: number): Promise<Localidad[]> => {
  try {
    
    const response = await fetch(`${API_BASE_URL}/localidades/destinos-posibles/${idLocalidadOrigen}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response (destinos):', errorText);
      
      if (response.status === 401) {
        throw new Error('Token de autenticación inválido');
      } else if (response.status === 403) {
        throw new Error('No tienes permisos para acceder a esta información');
      } else if (response.status >= 500) {
        throw new Error('Error del servidor. Inténtalo más tarde.');
      } else {
        throw new Error(`Error al obtener los destinos: ${response.status}`);
      }
    }

    const result = await response.json();
    
    return result || [];
  } catch (error) {
    console.error('Error en getDestinosPosibles:', error);
    
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Error de conexión. Verifica tu internet y que el servidor esté funcionando.');
    }
    
    if (error instanceof Error) {
      throw error;
    }
    
    throw new Error('Error inesperado al obtener destinos.');
  }
};