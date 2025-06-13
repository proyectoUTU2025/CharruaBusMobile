import { useState } from 'react';
import { 
  PasswordValidationState, 
  PasswordValidationResult, 
  PasswordRequirement 
} from '../types/passwordType';

export const usePasswordValidation = () => {
  const [state, setState] = useState<PasswordValidationState>({
    currentPassword: '',
    currentPasswordError: '',
    newPassword: '',
    newPasswordError: '',
    confirmPassword: '',
    confirmPasswordError: '',
  });

  const getPasswordRequirements = (password: string): PasswordRequirement[] => {
    return [
      { text: "Mínimo 8 caracteres", valid: password.length >= 8 },
      { text: "Al menos una minúscula", valid: /[a-z]/.test(password) },
      { text: "Al menos una mayúscula", valid: /[A-Z]/.test(password) },
      { text: "Al menos un número", valid: /\d/.test(password) },
      { 
        text: "Al menos un carácter especial", 
        valid: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password) 
      }
    ];
  };

  const validatePasswordRequirements = (password: string): string[] => {
    const errors: string[] = [];
    const requirements = getPasswordRequirements(password);
    
    requirements.forEach(req => {
      if (!req.valid) {
        errors.push(req.text);
      }
    });
    
    return errors;
  };

  const validateCurrentPassword = (password: string): void => {
    setState(prev => ({
      ...prev,
      currentPassword: password,
      currentPasswordError: password.trim() === "" ? "La contraseña actual es obligatoria" : "",
    }));
    
    if (state.newPassword) {
      validateNewPassword(state.newPassword);
    }
  };

  const validateNewPassword = (password: string): void => {
    let error = "";
    
    if (!password.trim()) {
      error = "La nueva contraseña es obligatoria";
    } else if (state.currentPassword && password === state.currentPassword) {
      error = "La nueva contraseña debe ser diferente a la actual";
    } else {
      const passwordErrors = validatePasswordRequirements(password);
      if (passwordErrors.length > 0) {
        error = "";
      }
    }
    
    setState(prev => ({
      ...prev,
      newPassword: password,
      newPasswordError: error,
    }));
    
    if (state.confirmPassword) {
      validateConfirmPassword(state.confirmPassword);
    }
  };

  const validateConfirmPassword = (confirmPass: string): void => {
    let error = "";
    
    if (!confirmPass.trim()) {
      error = "Debe confirmar la nueva contraseña";
    } else {
      const passwordErrors = validatePasswordRequirements(state.newPassword);
      
      if (passwordErrors.length > 0) {
        error = "Primero complete los requisitos de la nueva contraseña";
      } else if (state.newPassword !== confirmPass) {
        error = "Las contraseñas no coinciden";
      }
    }
    
    setState(prev => ({
      ...prev,
      confirmPassword: confirmPass,
      confirmPasswordError: error,
    }));
  };

  const validateAll = (): PasswordValidationResult => {
    const errors: string[] = [];
    
    if (!state.currentPassword.trim()) {
      errors.push("La contraseña actual es obligatoria");
      setState(prev => ({ 
        ...prev, 
        currentPasswordError: "La contraseña actual es obligatoria" 
      }));
    }
    
    if (!state.newPassword.trim()) {
      errors.push("La nueva contraseña es obligatoria");
      setState(prev => ({ 
        ...prev, 
        newPasswordError: "La nueva contraseña es obligatoria" 
      }));
    } else {
      if (state.currentPassword && state.newPassword === state.currentPassword) {
        errors.push("La nueva contraseña debe ser diferente a la actual");
        setState(prev => ({ 
          ...prev, 
          newPasswordError: "La nueva contraseña debe ser diferente a la actual" 
        }));
      } else {
        const passwordErrors = validatePasswordRequirements(state.newPassword);
        if (passwordErrors.length > 0) {
          const errorMsg = `Requisitos faltantes: ${passwordErrors.join(", ")}`;
          errors.push(errorMsg);
          setState(prev => ({ 
            ...prev, 
            newPasswordError: errorMsg 
          }));
        }
      }
    }
    
    if (!state.confirmPassword.trim()) {
      errors.push("Debe confirmar la nueva contraseña");
      setState(prev => ({ 
        ...prev, 
        confirmPasswordError: "Debe confirmar la nueva contraseña" 
      }));
    } else if (state.newPassword !== state.confirmPassword) {
      errors.push("Las contraseñas no coinciden");
      setState(prev => ({ 
        ...prev, 
        confirmPasswordError: "Las contraseñas no coinciden" 
      }));
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  };

  const setFieldError = (field: keyof PasswordValidationState, error: string): void => {
    setState(prev => ({
      ...prev,
      [field]: error
    }));
  };

  const clearErrors = (): void => {
    setState(prev => ({
      ...prev,
      currentPasswordError: '',
      newPasswordError: '',
      confirmPasswordError: '',
    }));
  };

  const reset = (): void => {
    setState({
      currentPassword: '',
      currentPasswordError: '',
      newPassword: '',
      newPasswordError: '',
      confirmPassword: '',
      confirmPasswordError: '',
    });
  };

  return {
    state,
    getPasswordRequirements,
    validatePasswordRequirements,
    validateCurrentPassword,
    validateNewPassword,
    validateConfirmPassword,
    validateAll,
    setFieldError,
    clearErrors,
    reset,
  };
};