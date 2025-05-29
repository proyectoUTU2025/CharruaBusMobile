import messaging from '@react-native-firebase/messaging';

const API_BASE_URL = 'http://192.168.1.23:8080';

// Función para iniciar sesión
export const login = async (email: string, password: string): Promise<string> => {
  const deviceToken = await messaging().getToken();

  const response = await fetch(`${API_BASE_URL}/auth/login-mobile`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password, deviceToken }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Error al iniciar sesión: ${errorText}`);
  }

  const result = await response.json();
  return result.data.token;
};

// Función para cerrar sesión
export const logout = async (): Promise<void> => {
  // Por ahora no se comunica con el backend
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

// Función para registrar usuario
export const registerUser = async (data: RegisterData): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/auth/registrar`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Registro fallido: ${errorText}`);
  }
};

// Función para verificar el código de email
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

    if (!response.ok) {
      // Manejar diferentes tipos de errores HTTP
      if (response.status === 400) {
        throw new Error('Código de verificación inválido');
      } else if (response.status === 404) {
        throw new Error('Usuario no encontrado');
      } else if (response.status === 410) {
        throw new Error('El código ha expirado');
      } else {
        throw new Error('Error del servidor. Inténtalo más tarde.');
      }
    }

    const data = await response.json();
    return data;
  } catch (error) {
    // Re-lanzar el error para que el componente lo maneje
    if (error instanceof Error) {
      throw error;
    } else {
      throw new Error('Error de conexión. Verifica tu internet.');
    }
  }
};

// Función para reenviar el código de verificación
/*export const resendVerificationCode = async (email: string) => {
  try {
    const response = await fetch('/auth/resend-verification', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error('Demasiados intentos. Espera antes de solicitar otro código.');
      } else if (response.status === 404) {
        throw new Error('Usuario no encontrado');
      } else {
        throw new Error('Error del servidor. Inténtalo más tarde.');
      }
    }

    const data = await response.json();
    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    } else {
      throw new Error('Error de conexión. Verifica tu internet.');
    }
  }
};*/
