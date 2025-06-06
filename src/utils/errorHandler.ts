class CustomErrorHandler {
  private originalHandler: any = null;
  private isEnabled = false;

  init() {
    if (this.isEnabled) return;
    
    this.originalHandler = ErrorUtils.getGlobalHandler();
    ErrorUtils.setGlobalHandler(this.handleError.bind(this));
    this.isEnabled = true;
    console.log('CustomErrorHandler inicializado');
  }

  private handleError = (error: any, isFatal?: boolean) => {
    // Lista de errores que manejamos en la UI y no queremos mostrar en el handler global
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
        // Agregar patrones de registro
        'email ya está registrado',
        'Error al registrar',
        'Datos de registro inválidos',
        'Error inesperado en el registro',
        // Agregar patrones de verificación
        'Código de verificación inválido',
        'código ha expirado',
        'Demasiados intentos',
        'Error en la verificación',
        'Error inesperado en la verificación'
    ];

    if (error && error.message && typeof error.message === 'string') {
      const shouldFilter = managedErrorPatterns.some(pattern => 
        error.message.includes(pattern)
      );

      if (shouldFilter) {
        console.log('Error filtrado por CustomErrorHandler:', error.message);
        return; // No mostrar este error en el handler global
      }
    }

    // Para errores no relacionados con auth, usar el handler original
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
    console.log('CustomErrorHandler restaurado');
  }
}

export const errorHandler = new CustomErrorHandler();