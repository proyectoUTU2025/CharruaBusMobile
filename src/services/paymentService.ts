const API_BASE_URL = 'http://192.168.1.7:8080';

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

    const response = await fetch(`${API_BASE_URL}/compras/confirmar/${sessionId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
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
    console.error('Error en confirmarCompra:', error);
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