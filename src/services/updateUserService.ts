import { API_BASE_URL } from '@env';
import { UpdateUserProfileData, UpdateUserProfileResponse, UserProfileData } from '../types/userType';

export const updateUserProfile = async (
  token: string, 
  userId: string,
  data: UpdateUserProfileData
): Promise<UpdateUserProfileResponse> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const response = await fetch(`${API_BASE_URL}/usuarios/${userId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (response.status === 401) {
      throw new Error('Sesión expirada');
    }

    let result;
    try {
      result = await response.json();
    } catch (parseError) {
      result = { message: 'Respuesta inválida del servidor' };
    }

    if (!response.ok) {
      let errorMessage = 'Error desconocido';

      if (response.status === 400) {
        if (result.message && result.message.includes('documento ya existe')) {
          errorMessage = 'Ya existe un usuario con este documento';
        } else if (result.message && result.message.includes('formato')) {
          errorMessage = 'Formato de datos inválido';
        } else {
          errorMessage = result.message || 'Datos inválidos para actualizar perfil';
        }
      } else if (response.status === 403) {
        errorMessage = 'No tienes permisos para editar este perfil';
      } else if (response.status === 404) {
        errorMessage = 'Usuario no encontrado';
      } else if (response.status >= 500) {
        errorMessage = 'Error del servidor. Inténtalo más tarde';
      } else {
        errorMessage = result.message || 'Error al actualizar perfil';
      }

      throw new Error(errorMessage);
    }

    return {
      success: true,
      message: result.message || 'Perfil actualizado exitosamente',
      data: result.data
    };

  } catch (error) {
    if (error instanceof Error && error.message === 'Sesión expirada') {
      throw error;
    }
    
    if (error instanceof Error) {
      return {
        success: false,
        message: error.message
      };
    }

    return {
      success: false,
      message: 'Error inesperado al actualizar perfil'
    };
  }
};

export const getCurrentUserProfile = async (token: string, userId: string): Promise<UserProfileData> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const response = await fetch(`${API_BASE_URL}/usuarios/${userId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (response.status === 401) {
      throw new Error('Sesión expirada');
    }

    if (!response.ok) {
      let errorMessage = 'Error al obtener perfil';
      
      if (response.status === 403) {
        errorMessage = 'No tienes permisos para acceder a esta información';
      } else if (response.status === 404) {
        errorMessage = 'Usuario no encontrado';
      } else if (response.status >= 500) {
        errorMessage = 'Error del servidor. Inténtalo más tarde';
      }
      
      throw new Error(errorMessage);
    }

    const result = await response.json();
    
    if (result.data) {
      return result.data as UserProfileData;
    } else if (result.id) {
      return result as UserProfileData;
    } else {
      throw new Error('Estructura de respuesta inválida');
    }
    
  } catch (error) {
    if (error instanceof Error && error.message === 'Sesión expirada') {
      throw error;
    }
    throw error;
  }
};

export const getUserIdFromToken = (token: string): string | null => {
  try {
    if (!token) return null;
    
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    const decoded = JSON.parse(jsonPayload);
    return String(decoded.id || decoded.sub || '');
  } catch (error) {
    console.error('Error decodificando token:', error);
    return null;
  }
};