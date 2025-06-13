class CustomErrorHandler {
  private originalHandler: any = null;
  private isEnabled = false;

  init() {
    if (this.isEnabled) return;
    
    this.originalHandler = ErrorUtils.getGlobalHandler();
    ErrorUtils.setGlobalHandler(this.handleError.bind(this));
    this.isEnabled = true;
  }

  private handleError = (error: any, isFatal?: boolean) => {
    const managedErrorPatterns = [
        'Email o contraseña',
        'verificar tu correo',
        'Error de conexión',
        'Error del servidor',
        'Credenciales erróneas',
        'Usuario no encontrado',
        'Token guardado y establecido',
        'Error en login real',
        'Network request failed',
        'deviceToken es obligatorio',
        'app móvil es de uso exclusivo',
        'email ya está registrado',
        'Error al registrar',
        'Datos de registro inválidos',
        'Error inesperado en el registro',
        'Código de verificación inválido',
        'código ha expirado',
        'Demasiados intentos',
        'Error en la verificación',
        'Error inesperado en la verificación',
        'contraseña actual es incorrecta',
        'contraseña actual',
        'nueva contraseña debe ser diferente',
        'nueva contraseña debe ser distinta',
        'contraseñas no coinciden',
        'Error inesperado al cambiar la contraseña',
        'No tienes autorización',
        'Acceso denegado'
    ];

    if (error && error.message && typeof error.message === 'string') {
      const shouldFilter = managedErrorPatterns.some(pattern => 
        error.message.includes(pattern)
      );

      if (shouldFilter) {
        return;
      }
    }

    if (this.originalHandler) {
      this.originalHandler(error, isFatal);
    }
  };

  restore() {
    if (!this.isEnabled) return;
    
    if (this.originalHandler) {
      ErrorUtils.setGlobalHandler(this.originalHandler);
    }
    this.isEnabled = false;
  }
}

export const errorHandler = new CustomErrorHandler();