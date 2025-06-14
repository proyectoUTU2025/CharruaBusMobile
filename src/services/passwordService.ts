import { ChangePasswordData, ChangePasswordResponse, PasswordErrorType } from '../types/passwordType';

const API_BASE_URL = 'http://192.168.43.101:8080';

export const changePassword = async (
  token: string, 
  data: ChangePasswordData
): Promise<ChangePasswordResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/usuarios/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    const responseText = await response.text();
    let result;
    
    if (responseText) {
      try {
        result = JSON.parse(responseText);
      } catch (parseError) {
        result = { message: responseText };
      }
    } else {
      result = {};
    }

    if (!response.ok) {
      const errorType = parseErrorType(response.status, result);
      const errorMessage = extractErrorMessage(result);
      
      const error = new Error(errorMessage);
      error.name = errorType;
      throw error;
    }

    return {
      success: true,
      message: result.message || 'Contraseña cambiada exitosamente'
    };
    
  } catch (error: unknown) {
    if (error instanceof Error) {
      return {
        success: false,
        message: error.message
      };
    }
    
    return {
      success: false,
      message: 'Error desconocido al cambiar contraseña'
    };
  }
};

const parseErrorType = (status: number, result: any): PasswordErrorType => {
  if (status !== 400) {
    return 'UNKNOWN_ERROR';
  }

  const errorMessage = extractErrorMessage(result);
  
  if (errorMessage.includes('contraseña actual es incorrecta') || 
      errorMessage.includes('current password') ||
      errorMessage.includes('contraseña actual') ||
      errorMessage.includes('incorrecta')) {
    return 'CURRENT_PASSWORD_INCORRECT';
  }
  
  if (errorMessage.includes('misma contraseña') || 
      errorMessage.includes('distinta') ||
      errorMessage.includes('diferente') ||
      errorMessage.includes('debe ser diferente')) {
    return 'SAME_PASSWORD';
  }
  
  if (errorMessage.includes('no coinciden') ||
      errorMessage.includes('do not match')) {
    return 'PASSWORDS_DONT_MATCH';
  }
  
  if (errorMessage.includes('al menos 8 caracteres') ||
      errorMessage.includes('debe tener al menos') ||
      errorMessage.includes('formato')) {
    return 'VALIDATION_ERROR';
  }

  return 'UNKNOWN_ERROR';
};

const extractErrorMessage = (result: any): string => {
  if (result.errores) {
    if (result.errores.currentPassword && Array.isArray(result.errores.currentPassword)) {
      return result.errores.currentPassword[0] || 'Error en contraseña actual';
    }
    
    if (result.errores.newPassword && Array.isArray(result.errores.newPassword)) {
      return result.errores.newPassword[0] || 'Error en nueva contraseña';
    }
    
    if (result.errores.confirmPassword && Array.isArray(result.errores.confirmPassword)) {
      return result.errores.confirmPassword[0] || 'Error en confirmación';
    }
    
    const firstErrorKey = Object.keys(result.errores)[0];
    const firstErrorValue = result.errores[firstErrorKey];
    return Array.isArray(firstErrorValue) ? firstErrorValue[0] : firstErrorValue;
  }

  if (result.message) {
    return result.message;
  }
  
  if (result.error) {
    return result.error;
  }

  return 'Error desconocido';
};