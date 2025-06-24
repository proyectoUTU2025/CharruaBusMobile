import { Localidad, LocalidadesResponse, GetLocalidadesParams } from '../types/locationType';
import { API_BASE_URL } from '@env';

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

export const getAllLocalidades = async (
  authToken: string,
  params?: GetLocalidadesParams
): Promise<LocalidadesResponse> => {
  try {
    const queryParams = new URLSearchParams({
      page: (params?.page || 0).toString(),
      size: (params?.size || 100).toString(),
    });

    if (params?.nombre) {
      queryParams.append('nombre', params.nombre);
    }

    if (params?.departamentos && params.departamentos.length > 0) {
      params.departamentos.forEach(dept => {
        queryParams.append('departamentos', dept);
      });
    }

    if (params?.sort && params.sort.length > 0) {
      params.sort.forEach(sortParam => {
        queryParams.append('sort', sortParam);
      });
    } else {
      queryParams.append('sort', 'nombre,ASC');
    }

    const url = `${API_BASE_URL}/localidades?${queryParams}`;

    const response = await fetch(url, {
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

    const result: LocalidadesResponse = await response.json();
    
    if (!result.content || !Array.isArray(result.content)) {
      console.error('Estructura de respuesta inesperada:', result);
      throw new Error('Respuesta del servidor con formato incorrecto');
    }
    
    return result;
  } catch (error) {
    console.error('Error en getAllLocalidades:', error);
    
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Error de conexión. Verifica tu internet y que el servidor esté funcionando.');
    }
    
    if (error instanceof Error) {
      throw error;
    }
    
    throw new Error('Error inesperado al obtener localidades.');
  }
};

export const getAllLocalidadesSimple = async (authToken: string): Promise<Localidad[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/localidades/all`, {
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

    const result: Localidad[] = await response.json();
    
    if (!Array.isArray(result)) {
      console.error('Estructura de respuesta inesperada:', result);
      throw new Error('Respuesta del servidor con formato incorrecto');
    }
    
    return result;
  } catch (error) {
    console.error('Error en getAllLocalidadesSimple:', error);
    
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Error de conexión. Verifica tu internet y que el servidor esté funcionando.');
    }
    
    if (error instanceof Error) {
      throw error;
    }
    
    throw new Error('Error inesperado al obtener localidades.');
  }
};