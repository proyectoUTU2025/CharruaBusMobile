const API_BASE_URL = 'http://192.168.1.170:8080';

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
      } else if (response.status === 401) {
        errorMessage = 'No tienes autorización para realizar esta acción';
      } else if (response.status === 403) {
        errorMessage = 'No tienes permisos para editar este perfil';
      } else if (response.status === 404) {
        errorMessage = 'Usuario no encontrado';
      } else if (response.status >= 500) {
        errorMessage = 'Error del servidor. Inténtalo más tarde';
      } else {
        errorMessage = result.message || 'Error al actualizar perfil';
      }

      console.error('Error al actualizar perfil:', errorMessage);
      return {
        success: false,
        message: errorMessage
      };
    }

    return {
      success: true,
      message: result.message || 'Perfil actualizado exitosamente',
      data: result.data
    };

  } catch (error: unknown) {
    console.error('Error completo al actualizar perfil:', error);
    
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        return {
          success: false,
          message: 'La petición tardó demasiado. Verifica tu conexión a internet'
        };
      }

      if (error.message.includes('fetch') || error.message.includes('Network request failed')) {
        return {
          success: false,
          message: 'Error de conexión. Verifica tu internet y que el servidor esté disponible'
        };
      }

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

    if (!response.ok) {
      let errorMessage = 'Error al obtener perfil';
      
      if (response.status === 401) {
        errorMessage = 'Token de autenticación inválido';
      } else if (response.status === 403) {
        errorMessage = 'No tienes permisos para acceder a esta información';
      } else if (response.status === 404) {
        errorMessage = 'Usuario no encontrado';
      } else if (response.status >= 500) {
        errorMessage = 'Error del servidor. Inténtalo más tarde';
      }
      
      console.error('Error en la respuesta:', errorMessage);
      throw new Error(errorMessage);
    }

    const result = await response.json();
    
    if (result.data) {
      return result.data as UserProfileData;
    } else if (result.id) {
      return result as UserProfileData;
    } else {
      console.error('Estructura de respuesta inesperada:', result);
      throw new Error('Estructura de respuesta inválida');
    }
    
  } catch (error) {
    console.error('Error completo al obtener perfil:', error);
    
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error('La petición tardó demasiado. Verifica tu conexión');
      }
      
      if (error.message.includes('fetch') || error.message.includes('Network request failed')) {
        throw new Error('Error de conexión. Verifica tu internet');
      }
      
      throw error;
    }
    
    throw new Error('Error inesperado al obtener perfil');
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