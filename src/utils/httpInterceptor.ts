import { AuthContextType } from '../types/authType';

let authContext: AuthContextType | null = null;

export const initializeHttpInterceptor = (context: AuthContextType) => {
  authContext = context;
};

export const fetchWithInterceptor = async (
  url: string,
  options: RequestInit
): Promise<Response> => {
  try {
    const response = await fetch(url, options);
    
    if (response.status === 401) {
      if (!authContext) {
        console.error('AuthContext no inicializado en httpInterceptor');
        throw new Error('Sesión expirada');
      }
      
      authContext.handleUnauthorized();
      throw new Error('Sesión expirada');
    }
    
    return response;
  } catch (error) {
    if (error instanceof Error && error.message === 'Sesión expirada') {
      throw error;
    }
    throw error;
  }
};