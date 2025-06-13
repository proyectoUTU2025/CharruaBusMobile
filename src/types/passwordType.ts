export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface PasswordRequirement {
  text: string;
  valid: boolean;
}

export interface PasswordValidationState {
  currentPassword: string;
  currentPasswordError: string;
  newPassword: string;
  newPasswordError: string;
  confirmPassword: string;
  confirmPasswordError: string;
}

export interface PasswordVisibilityState {
  showCurrentPassword: boolean;
  showNewPassword: boolean;
  showConfirmPassword: boolean;
}

export interface ChangePasswordResponse {
  success: boolean;
  message: string;
}

export type PasswordErrorType = 
  | 'CURRENT_PASSWORD_INCORRECT'
  | 'SAME_PASSWORD'
  | 'PASSWORDS_DONT_MATCH'
  | 'VALIDATION_ERROR'
  | 'UNKNOWN_ERROR';