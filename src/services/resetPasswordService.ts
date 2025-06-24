import {
  ResetPasswordResponse,
  PasswordValidationResult,
  ValidationResult,
  PasswordRequirement
} from '../types/resetPasswordType';
import { API_BASE_URL } from '@env';

export const validateEmailFormat = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validateEmail = (email: string): ValidationResult => {
  if (!email.trim()) {
    return {
      isValid: false,
      error: "El correo electrónico es obligatorio"
    };
  }
  
  if (!validateEmailFormat(email)) {
    return {
      isValid: false,
      error: "Formato de correo no válido"
    };
  }
  
  return { isValid: true };
};

export const sanitizeCode = (code: string): string => {
  return code.replace(/\D/g, '').slice(0, 6);
};

export const validateCode = (code: string): ValidationResult => {
  const onlyNumbers = sanitizeCode(code);
  
  if (onlyNumbers.length === 0) {
    return {
      isValid: false,
      error: "El código es obligatorio"
    };
  }
  
  if (onlyNumbers.length < 6) {
    return {
      isValid: false,
      error: "El código debe tener 6 dígitos"
    };
  }
  
  return { isValid: true };
};

export const validatePasswordRequirements = (password: string): PasswordValidationResult => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push("Mínimo 8 caracteres");
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push("Al menos una letra minúscula");
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push("Al menos una letra mayúscula");
  }
  
  if (!/\d/.test(password)) {
    errors.push("Al menos un número");
  }
  
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push("Al menos un carácter especial");
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const getPasswordRequirements = (password: string): PasswordRequirement[] => {
  return [
    { text: "Mínimo 8 caracteres", valid: password.length >= 8 },
    { text: "Al menos una minúscula", valid: /[a-z]/.test(password) },
    { text: "Al menos una mayúscula", valid: /[A-Z]/.test(password) },
    { text: "Al menos un número", valid: /\d/.test(password) },
    { text: "Al menos un carácter especial", valid: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password) }
  ];
};

export const validatePassword = (password: string): ValidationResult => {
  if (!password.trim()) {
    return {
      isValid: false,
      error: "La contraseña es obligatoria"
    };
  }
  
  const validation = validatePasswordRequirements(password);
  
  if (!validation.isValid) {
    return {
      isValid: false,
      error: `Requisitos faltantes: ${validation.errors.join(", ")}`
    };
  }
  
  return { isValid: true };
};

export const validateConfirmPassword = (confirmPassword: string, mainPassword: string): ValidationResult => {
  if (!confirmPassword.trim()) {
    return {
      isValid: false,
      error: "Debe confirmar la contraseña"
    };
  }
  
  const passwordValidation = validatePasswordRequirements(mainPassword);
  
  if (!passwordValidation.isValid) {
    return {
      isValid: false,
      error: "Primero complete los requisitos de la contraseña"
    };
  }
  
  if (mainPassword !== confirmPassword) {
    return {
      isValid: false,
      error: "Las contraseñas no coinciden"
    };
  }
  
  return { isValid: true };
};

export const forgotPassword = async (email: string): Promise<ResetPasswordResponse> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const response = await fetch(`${API_BASE_URL}/auth/cliente/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: email.trim() }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      
      if (response.status === 404) {
        throw new Error('No existe una cuenta con este correo electrónico o está inactiva');
      } else if (response.status === 429) {
        throw new Error('Demasiados intentos. Espera antes de intentar nuevamente');
      } else if (response.status >= 500) {
        throw new Error('Error del servidor. Inténtalo más tarde');
      } else if (response.status >= 400) {
        throw new Error(`Solo clientes pueden reestablecer su contraseña`);
      } else {
        throw new Error(`Error al enviar código de restablecimiento: ${response.status}`);
      }
    }

    const result = await response.json();
    
    return {
      success: true,
      message: result.message || 'Código enviado exitosamente'
    };

  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Error de conexión. Verifica tu internet y que el servidor esté funcionando');
    }
    
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error('La petición tardó demasiado. Verifica tu conexión a internet');
      }
      throw error;
    }
    
    throw new Error('Error inesperado al enviar código');
  }
};

export const verifyResetCode = async (
  email: string, 
  verificationCode: string
): Promise<ResetPasswordResponse> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const response = await fetch(`${API_BASE_URL}/auth/verify-reset-code`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        email: email.trim(),
        verificationCode: verificationCode 
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      
      if (response.status === 400) {
        throw new Error('Código de verificación inválido');
      } else if (response.status === 404) {
        throw new Error('Usuario no encontrado');
      } else if (response.status === 410) {
        throw new Error('El código ha expirado. Solicita uno nuevo');
      } else if (response.status === 429) {
        throw new Error('Demasiados intentos. Espera antes de intentar nuevamente');
      } else if (response.status >= 500) {
        throw new Error('Error del servidor. Inténtalo más tarde');
      } else {
        throw new Error(`Error al verificar código: ${response.status}`);
      }
    }

    const result = await response.json();
    
    return {
      success: true,
      message: result.message || 'Código verificado exitosamente'
    };

  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Error de conexión. Verifica tu internet y que el servidor esté funcionando');
    }
    
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error('La petición tardó demasiado. Verifica tu conexión a internet');
      }
      throw error;
    }
    
    throw new Error('Error inesperado al verificar código');
  }
};

export const resetPassword = async (
  email: string,
  verificationCode: string,
  newPassword: string,
  confirmPassword: string
): Promise<ResetPasswordResponse> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        email: email.trim(),
        verificationCode: verificationCode,
        newPassword: newPassword,
        confirmPassword: confirmPassword
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      
      let result;
      try {
        result = JSON.parse(errorText);
      } catch (parseError) {
        result = { message: errorText || 'Error en la respuesta del servidor' };
      }
      
      if (response.status === 400) {
        if (result.message && (
          result.message.includes('nueva contraseña debe ser distinta') ||
          result.message.includes('misma contraseña') ||
          result.message.includes('debe ser diferente') ||
          result.message.includes('distinta a la anterior')
        )) {
          throw new Error('La nueva contraseña debe ser diferente a la anterior');
        } else if (result.message && (
          result.message.includes('contraseñas no coinciden') ||
          result.message.includes('no coinciden')
        )) {
          throw new Error('Las contraseñas no coinciden');
        } else if (result.message && (
          result.message.includes('código') ||
          result.message.includes('inválido') ||
          result.message.includes('expirado')
        )) {
          throw new Error('Código inválido o expirado');
        } else {
          throw new Error(result.message || 'Datos inválidos para restablecer contraseña');
        }
      } else if (response.status === 404) {
        throw new Error('Usuario no encontrado');
      } else if (response.status === 410) {
        throw new Error('El código ha expirado. Solicita uno nuevo');
      } else if (response.status === 429) {
        throw new Error('Demasiados intentos. Espera antes de intentar nuevamente');
      } else if (response.status >= 500) {
        throw new Error('Error del servidor. Inténtalo más tarde');
      } else {
        throw new Error(result.message || `Error al restablecer contraseña: ${response.status}`);
      }
    }

    const result = await response.json();
    
    return {
      success: true,
      message: result.message || 'Contraseña restablecida exitosamente'
    };

  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Error de conexión. Verifica tu internet y que el servidor esté funcionando');
    }
    
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error('Tiempo agotado. La solicitud tardó demasiado tiempo. Verifica tu conexión');
      }
      throw error;
    }
    
    throw new Error('Error inesperado al restablecer contraseña');
  }
};

export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('es-UY', {
    style: 'currency',
    currency: 'UYU',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(price);
};