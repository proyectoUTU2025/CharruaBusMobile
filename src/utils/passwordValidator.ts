// Utilidades para validar contraseñas

export const passwordRules = {
  minLength: 8,
  requiresLowercase: true,
  requiresUppercase: true,
  requiresNumber: true,
  requiresSpecial: true,
}

export interface PasswordValidation {
  isValid: boolean
  errors: {
    length: boolean
    lowercase: boolean
    uppercase: boolean
    number: boolean
    special: boolean
    match?: boolean
  }
}

export const validatePassword = (password: string): PasswordValidation => {
  const hasMinLength = password.length >= passwordRules.minLength
  const hasLowercase = /[a-z]/.test(password)
  const hasUppercase = /[A-Z]/.test(password)
  const hasNumber = /[0-9]/.test(password)
  const hasSpecial = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)

  const isValid =
    hasMinLength &&
    (!passwordRules.requiresLowercase || hasLowercase) &&
    (!passwordRules.requiresUppercase || hasUppercase) &&
    (!passwordRules.requiresNumber || hasNumber) &&
    (!passwordRules.requiresSpecial || hasSpecial)

  return {
    isValid,
    errors: {
      length: !hasMinLength,
      lowercase: passwordRules.requiresLowercase && !hasLowercase,
      uppercase: passwordRules.requiresUppercase && !hasUppercase,
      number: passwordRules.requiresNumber && !hasNumber,
      special: passwordRules.requiresSpecial && !hasSpecial,
    },
  }
}

export const passwordsMatch = (password: string, confirmPassword: string): boolean => {
  return password === confirmPassword
}
