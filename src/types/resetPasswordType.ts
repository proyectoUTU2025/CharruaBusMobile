export interface ForgotPasswordRequest {
  email: string;
}

export interface VerifyResetCodeRequest {
  email: string;
  verificationCode: string;
}

export interface ResetPasswordRequest {
  email: string;
  verificationCode: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ResetPasswordResponse {
  success: boolean;
  message: string;
}

export interface PasswordRequirement {
  text: string;
  valid: boolean;
}

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
}