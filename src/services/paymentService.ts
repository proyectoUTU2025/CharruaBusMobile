import { API_BASE_URL } from '@env';

export async function crearSesionStripe(token: string, payload: any) {
  const payloadLimpio = {
    ...payload,
  };

  const response = await fetch(`${API_BASE_URL}/compras`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payloadLimpio),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Error en crearSesionStripe:', errorText);
    throw new Error(`Error en crearSesionStripe: ${response.status} - ${errorText}`);
  }

  const result = await response.json();
  
  return result;
}

export const confirmarCompra = async (token: string, sessionId: string) => {
  try {


    const response = await fetch(`${API_BASE_URL}/compras/confirmar`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sessionId: sessionId }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response body:', errorText);
      
      let errorMessage = `Error ${response.status}`;
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.mensaje || errorData.message || errorMessage;
        console.error('Parsed error data:', errorData);
      } catch (parseError) {
        console.error('Could not parse error response as JSON');
        errorMessage = errorText || errorMessage;
      }
      
      throw new Error(errorMessage);
    }

    const result = await response.json();
    return result;
    
  } catch (error) {
    console.error('==> ERROR EN CONFIRMACIÓN DE COMPRA <==');
    console.error('Error tipo:', error instanceof Error ? error.constructor.name : typeof error);
    console.error('Error mensaje:', error instanceof Error ? error.message : String(error));
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack available');
    throw error;
  }
};

export const cancelarCompra = async (token: string, sessionId: string) => {
  try {

    const response = await fetch(`${API_BASE_URL}/compras/cancelar`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sessionId: sessionId }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response:', errorText);
      
      try {
        const errorData = JSON.parse(errorText);
        throw new Error(errorData.mensaje || `Error ${response.status}`);
      } catch (parseError) {
        throw new Error(errorText || `Error ${response.status}`);
      }
    }

    const result = await response.json();
    return result;
    
  } catch (error) {
    console.error('Error en cancelarCompra:', error);
    throw error;
  }
};

export const debugUrl = (url: string) => {
  
  try {
    const urlObj = new URL(url);
    
    const sessionId = urlObj.searchParams.get('session_id');
    
    return sessionId;
  } catch (error) {
    console.error('Error parsing URL:', error);
    
    const match = url.match(/session_id=([^&]+)/);
    if (match) {
      return match[1];
    }
    
    return null;
  }
};