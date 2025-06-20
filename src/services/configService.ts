import { ConfiguracionSistema } from '../types/configType';

const API_BASE_URL = 'http://192.168.1.170:8080';

let configCache: Map<string, number> = new Map();
let cacheTimestamp: number = 0;
const CACHE_DURATION = 5 * 60 * 1000;

interface ConfiguracionIndividualResponse {
  data: ConfiguracionSistema;
  message: string;
}

const getConfiguracionByNombre = async (token: string, nombreConfig: string): Promise<ConfiguracionSistema | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/configuraciones/nombre/${nombreConfig}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        console.warn(`Configuración '${nombreConfig}' no encontrada`);
        return null;
      }
      throw new Error(`Error al obtener configuración ${nombreConfig}: ${response.status}`);
    }

    const result: ConfiguracionIndividualResponse = await response.json();
    return result.data || null;
  } catch (error) {
    console.error(`Error obteniendo configuración ${nombreConfig}:`, error);
    return null;
  }
};

export const getConfiguracionValor = async (
  token: string, 
  nombreConfig: string, 
  valorPorDefecto: number = 0
): Promise<number> => {
  try {
    const now = Date.now();
    
    if (configCache.has(nombreConfig) && (now - cacheTimestamp) < CACHE_DURATION) {
      return configCache.get(nombreConfig)!;
    }

    const configuracion = await getConfiguracionByNombre(token, nombreConfig);
    
    if (configuracion) {
      configCache.set(nombreConfig, configuracion.valorInt || 0);
      cacheTimestamp = now;
      
      return configuracion.valorInt || valorPorDefecto;
    }

    return valorPorDefecto;
    
  } catch (error) {
    console.error(`Error obteniendo configuración ${nombreConfig}:`, error);
    return valorPorDefecto;
  }
};

export const getLimitePasajes = async (token: string): Promise<number> => {
  return await getConfiguracionValor(token, 'limite_pasajes', 4);
};

export const getDescuentoJubilado = async (token: string): Promise<number> => {
  return await getConfiguracionValor(token, 'descuento_jubilado', 0);
};

export const getDescuentoEstudiante = async (token: string): Promise<number> => {
  return await getConfiguracionValor(token, 'descuento_estudiante', 0);
};

export const clearConfigCache = () => {
  configCache.clear();
  cacheTimestamp = 0;
};

export const getConfiguraciones = async (token: string): Promise<ConfiguracionSistema[]> => {
  try {
    const configuraciones: ConfiguracionSistema[] = [];
    
    const limite = await getConfiguracionByNombre(token, 'limite_pasajes');
    const descuentoJubilado = await getConfiguracionByNombre(token, 'descuento_jubilado');
    const descuentoEstudiante = await getConfiguracionByNombre(token, 'descuento_estudiante');
    
    if (limite) configuraciones.push(limite);
    if (descuentoJubilado) configuraciones.push(descuentoJubilado);
    if (descuentoEstudiante) configuraciones.push(descuentoEstudiante);
    
    return configuraciones;
  } catch (error) {
    console.error('Error obteniendo configuraciones:', error);
    return [];
  }
};