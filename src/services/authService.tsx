import { getFCMToken } from './notificationService';

const API_BASE_URL = 'http://192.168.1.23:8080';

//Función para obtener el token de dispositivo usando el servicio de notificaciones
const getDeviceToken = async (): Promise<string> => {
  try {
    const token = await getFCMToken();
    return token || '';
  } catch (error) {
    console.log('Error obteniendo token de dispositivo:', error);
    return '';
  }
};

export const login = async (email: string, password: string): Promise<string> => {
  try {
    const deviceToken = await getDeviceToken();

    const response = await fetch(`${API_BASE_URL}/auth/login-mobile`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password, deviceToken }),
    });

    const result = await response.json();

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Credenciales incorrectas. Verifica tu email y contraseña.');
      } else if (response.status === 403) {
        throw new Error('Tu cuenta está inactiva o bloqueada. Contacta al soporte.');
      } else if (response.status === 404) {
        throw new Error('Usuario no encontrado. Verifica tu email.');
      } else if (response.status >= 500) {
        throw new Error('Error del servidor. Inténtalo más tarde.');
      } else {
        const errorMessage = result.message || 'Error desconocido al iniciar sesión';
        throw new Error(errorMessage);
      }
    }

    if (!result.data || !result.data.token) {
      throw new Error('Respuesta del servidor inválida. Inténtalo más tarde.');
    }

    return result.data.token;
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Error de conexión. Verifica tu internet.');
    }
    
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Error inesperado. Inténtalo más tarde.');
  }
};

export const logout = async (authToken?: string): Promise<void> => {
  try {
    if (authToken) {
      const deviceToken = await getDeviceToken();
      
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ deviceToken }),
      });
    }
  } catch (error) {
    console.error('Error al cerrar sesión:', error);
  }
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

export const registerUser = async (data: RegisterData): Promise<void> => {
  try {
    const deviceToken = await getDeviceToken();

    const response = await fetch(`${API_BASE_URL}/auth/registrar`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ...data, deviceToken }),
    });

    const result = await response.json();

    if (!response.ok) {
      if (response.status === 400) {
        const errorMessage = result.message || 'Datos de registro inválidos';
        throw new Error(errorMessage);
      } else if (response.status === 409) {
        throw new Error('El email ya está registrado. Usa otro email o inicia sesión.');
      } else if (response.status >= 500) {
        throw new Error('Error del servidor. Inténtalo más tarde.');
      } else {
        const errorMessage = result.message || 'Error en el registro';
        throw new Error(errorMessage);
      }
    }
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Error de conexión. Verifica tu internet.');
    }
    
    if (error instanceof Error) {
      throw error;
    }
    
    throw new Error('Error inesperado en el registro.');
  }
};

export const verifyEmailCode = async (email: string, verificationCode: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/verify-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email,
        verificationCode: verificationCode
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      if (response.status === 400) {
        throw new Error('Código de verificación inválido o formato incorrecto');
      } else if (response.status === 404) {
        throw new Error('Usuario no encontrado o email no registrado');
      } else if (response.status === 410) {
        throw new Error('El código ha expirado. Solicita uno nuevo.');
      } else if (response.status === 429) {
        throw new Error('Demasiados intentos. Espera antes de intentar nuevamente.');
      } else if (response.status >= 500) {
        throw new Error('Error del servidor. Inténtalo más tarde.');
      } else {
        const errorMessage = result.message || 'Error en la verificación';
        throw new Error(errorMessage);
      }
    }

    return result;
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Error de conexión. Verifica tu internet.');
    }
    if (error instanceof Error) {
      throw error;
    } else {
      throw new Error('Error inesperado en la verificación.');
    }
  }
};

export const resendVerificationCode = async (email: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/resend-verification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error('Demasiados intentos. Espera antes de solicitar otro código.');
      } else if (response.status === 404) {
        throw new Error('Usuario no encontrado');
      } else if (response.status >= 500) {
        throw new Error('Error del servidor. Inténtalo más tarde.');
      } else {
        const errorMessage = result.message || 'Error al reenviar código';
        throw new Error(errorMessage);
      }
    }

    return result;
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Error de conexión. Verifica tu internet.');
    }
    
    if (error instanceof Error) {
      throw error;
    } else {
      throw new Error('Error inesperado al reenviar código.');
    }
  }
};