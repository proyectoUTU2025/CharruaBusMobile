import { getFCMToken } from './notificationService';
import { RegisterData } from '../types/authType';

const API_BASE_URL = 'http://192.168.1.170:8080';

const getDeviceToken = async (): Promise<string> => {
  try {
    const token = await getFCMToken();
    
    if (!token) {
      console.warn('No se pudo obtener FCM token, usando token por defecto');
      return `temp_token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    
    return token;
  } catch (error) {
    console.error('Error obteniendo token de dispositivo:', error);
    return `temp_token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
};

export const login = async (email: string, password: string): Promise<string> => {
  try {
    const deviceToken = await getDeviceToken();

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const response = await fetch(`${API_BASE_URL}/auth/login-mobile`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        email: email.trim(), 
        password, 
        deviceToken 
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    
    let result;
    try {
      result = await response.json();
    } catch (parseError) {
      console.error('Error parseando respuesta JSON:', parseError instanceof Error ? parseError.message : String(parseError));
      throw new Error('El servidor envió una respuesta inválida.');
    }

    if (!response.ok) {
      const errorMessage = result.message || result.error || 'Error desconocido';
      
      if (response.status === 400) {
        if (errorMessage.includes('Credenciales erróneas')) {
          throw new Error('Email o contraseña incorrectos. Verifica tus datos.');
        } else if (errorMessage.includes('deviceToken es obligatorio')) {
          throw new Error('Error de configuración. Reinicia la app e intenta nuevamente.');
        } else if (errorMessage.includes('app móvil es de uso exclusivo')) {
          throw new Error('Esta cuenta no tiene permisos para usar la app móvil.');
        } else {
          throw new Error(errorMessage);
        }
      } else if (response.status === 401) {
        throw new Error('Email o contraseña incorrectos. Verifica tus datos.');
      } else if (response.status === 403) {
        if (errorMessage.includes('verificar tu correo') || errorMessage.includes('desactivada')) {
          throw new Error('Debes verificar tu correo electrónico o tu cuenta está desactivada.');
        } else {
          throw new Error('Acceso denegado. Contacta al soporte.');
        }
      } else if (response.status === 404) {
        throw new Error('Usuario no encontrado. Verifica tu email.');
      } else if (response.status >= 500) {
        throw new Error('Error del servidor. Inténtalo más tarde.');
      } else {
        throw new Error(errorMessage);
      }
    }

    if (!result || !result.data || !result.data.token) {
      console.error('Respuesta del servidor sin token:', result);
      throw new Error('El servidor no envió un token válido. Inténtalo más tarde.');
    }

    return result.data.token;
    
  } catch (error: unknown) {
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error('La petición tardó demasiado. Verifica tu conexión a internet.');
      }
      
      if (error.message.includes('fetch') || error.message.includes('Network request failed')) {
        throw new Error('Error de conexión. Verifica tu internet y que el servidor esté disponible.');
      }
      
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

export const registerUser = async (data: RegisterData): Promise<void> => {
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
};

export const verifyEmailCode = async (email: string, verificationCode: string) => {
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