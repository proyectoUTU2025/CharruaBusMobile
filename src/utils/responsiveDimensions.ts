// utils/responsiveDimensions.ts - VERSIÓN CORREGIDA
import { Dimensions } from 'react-native';

// Obtener las dimensiones actuales
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// TUS dispositivos de referencia donde funciona PERFECTO
const REFERENCE_DEVICES = {
  J6_PRIME: { width: 360, height: 640 },     // Funciona perfecto aquí
  HONOR_PAD_X9: { width: 820, height: 1180 } // Funciona perfecto aquí
};

// Función para detectar el tipo de dispositivo
export const getDeviceType = () => {
  if (SCREEN_WIDTH < 380) return 'SMALL_PHONE';   // Cerca de J6 Prime
  if (SCREEN_WIDTH < 450) return 'MEDIUM_PHONE';  // Un poco más grande que J6
  if (SCREEN_WIDTH < 550) return 'LARGE_PHONE';   // Teléfonos grandes
  if (SCREEN_WIDTH < 750) return 'SMALL_TABLET';  // Tablets pequeñas
  return 'LARGE_TABLET';                           // Cerca de Honor Pad X9
};

// FACTORES DE ESCALA CORREGIDOS - Más conservadores
const getScaleFactor = () => {
  const deviceType = getDeviceType();
  
  // Si estamos cerca de tus dispositivos de referencia, NO escalar
  const isNearJ6 = Math.abs(SCREEN_WIDTH - REFERENCE_DEVICES.J6_PRIME.width) < 40;
  const isNearHonor = Math.abs(SCREEN_WIDTH - REFERENCE_DEVICES.HONOR_PAD_X9.width) < 60;
  
  if (isNearJ6 || isNearHonor) {
    return 1.0; // SIN cambios, mantener como está
  }
  
  // Para otros dispositivos, escalar MUY POCO
  switch (deviceType) {
    case 'SMALL_PHONE':
      return 0.92;  // Solo 8% más pequeño
    case 'MEDIUM_PHONE':
      return 0.96;  // Solo 4% más pequeño
    case 'LARGE_PHONE':
      return 1.04;  // Solo 4% más grande
    case 'SMALL_TABLET':
      return 1.08;  // Solo 8% más grande
    case 'LARGE_TABLET':
    default:
      return 1.0;   // Sin cambios para tablets grandes
  }
};

// FACTORES ESPECÍFICOS para diferentes elementos
const getSizeScaleFactor = () => getScaleFactor();

const getFontScaleFactor = () => {
  const baseFactor = getScaleFactor();
  // Las fuentes escalan aún MENOS que los tamaños
  return 0.85 + (baseFactor * 0.15); // Rango: 0.988 - 1.0
};

// Funciones de escala principales - MUY CONSERVADORAS
export const scaleSize = (size: number): number => {
  const factor = getSizeScaleFactor();
  return Math.round(size * factor);
};

export const scaleFontSize = (size: number): number => {
  const factor = getFontScaleFactor();
  return Math.round(size * factor);
};

// Información del dispositivo actual
export const DEVICE_INFO = {
  width: SCREEN_WIDTH,
  height: SCREEN_HEIGHT,
  type: getDeviceType(),
  scaleFactor: getScaleFactor(),
  isPhone: SCREEN_WIDTH < 700,
  isTablet: SCREEN_WIDTH >= 700,
  isSmallDevice: SCREEN_WIDTH < 380,
  isLargeDevice: SCREEN_WIDTH >= 800,
  
  // Detectar si está cerca de tus dispositivos perfectos
  isNearPerfectSize: Math.abs(SCREEN_WIDTH - REFERENCE_DEVICES.J6_PRIME.width) < 40 ||
                     Math.abs(SCREEN_WIDTH - REFERENCE_DEVICES.HONOR_PAD_X9.width) < 60,
};

// Funciones utilitarias - MEJORADAS
export const getResponsivePadding = (): number => {
  // Si está cerca de tus dispositivos perfectos, usar valores originales
  if (DEVICE_INFO.isNearPerfectSize) {
    return DEVICE_INFO.isPhone ? 16 : 24;
  }
  
  switch (DEVICE_INFO.type) {
    case 'SMALL_PHONE': return scaleSize(14);   // Muy poco cambio
    case 'MEDIUM_PHONE': return scaleSize(16);  // Valor original J6
    case 'LARGE_PHONE': return scaleSize(18);   // Poco más
    case 'SMALL_TABLET': return scaleSize(20);  // Poco más
    case 'LARGE_TABLET': return scaleSize(24);  // Valor original Honor
    default: return scaleSize(16);
  }
};

export const getMaxContainerWidth = (): number => {
  // Mantener tu lógica original que funciona bien
  if (DEVICE_INFO.isTablet) return Math.min(600, SCREEN_WIDTH * 0.9);
  return SCREEN_WIDTH * 0.95;
};

export const getCardPadding = (): number => {
  // Si está cerca de tus dispositivos perfectos, usar valores originales
  if (DEVICE_INFO.isNearPerfectSize) {
    return DEVICE_INFO.isPhone ? 20 : 24;
  }
  
  return DEVICE_INFO.isPhone ? scaleSize(20) : scaleSize(24);
};

// Funciones para elementos específicos que sabes que funcionan bien
export const getModalWidth = (screenWidth: number): number => {
  // Mantener tu lógica original
  const isCompact = screenWidth < 600;
  if (isCompact) {
    return screenWidth * 0.95;
  } else {
    return Math.min(600, screenWidth * 0.85);
  }
};

export const getModalHeight = (screenHeight: number): number => {
  // Mantener tu lógica original
  return screenHeight * 0.85;
};

// Para casos especiales donde necesites valores exactos sin escalar
export const noScale = (size: number): number => size;

// Función para debugging - te dice qué factor se está aplicando
export const getScaleInfo = () => {
  return {
    deviceWidth: SCREEN_WIDTH,
    deviceType: DEVICE_INFO.type,
    scaleFactor: getScaleFactor(),
    fontScaleFactor: getFontScaleFactor(),
    isNearPerfect: DEVICE_INFO.isNearPerfectSize,
    reference: DEVICE_INFO.isPhone ? 'J6 Prime' : 'Honor Pad X9'
  };
};