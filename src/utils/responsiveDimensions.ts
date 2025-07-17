import { Dimensions } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const REFERENCE_DEVICES = {
  J6_PRIME: { width: 360, height: 640 },
  HONOR_PAD_X9: { width: 820, height: 1180 }
};

export const getDeviceType = () => {
  if (SCREEN_WIDTH < 380) return 'SMALL_PHONE';
  if (SCREEN_WIDTH < 450) return 'MEDIUM_PHONE';
  if (SCREEN_WIDTH < 550) return 'LARGE_PHONE';
  if (SCREEN_WIDTH < 750) return 'SMALL_TABLET';
  return 'LARGE_TABLET';
};

const getScaleFactor = () => {
  const deviceType = getDeviceType();
  
  const isNearJ6 = Math.abs(SCREEN_WIDTH - REFERENCE_DEVICES.J6_PRIME.width) < 40;
  const isNearHonor = Math.abs(SCREEN_WIDTH - REFERENCE_DEVICES.HONOR_PAD_X9.width) < 60;
  
  if (isNearJ6 || isNearHonor) {
    return 1.0;
  }
  
  switch (deviceType) {
    case 'SMALL_PHONE':
      return 0.92;
    case 'MEDIUM_PHONE':
      return 0.96;
    case 'LARGE_PHONE':
      return 1.04;
    case 'SMALL_TABLET':
      return 1.08;
    case 'LARGE_TABLET':
    default:
      return 1.0;
  }
};

const getSizeScaleFactor = () => getScaleFactor();

const getFontScaleFactor = () => {
  const baseFactor = getScaleFactor();
  return 0.85 + (baseFactor * 0.15);
};

export const scaleSize = (size: number): number => {
  const factor = getSizeScaleFactor();
  return Math.round(size * factor);
};

export const scaleFontSize = (size: number): number => {
  const factor = getFontScaleFactor();
  return Math.round(size * factor);
};

export const DEVICE_INFO = {
  width: SCREEN_WIDTH,
  height: SCREEN_HEIGHT,
  type: getDeviceType(),
  scaleFactor: getScaleFactor(),
  isPhone: SCREEN_WIDTH < 700,
  isTablet: SCREEN_WIDTH >= 700,
  isSmallDevice: SCREEN_WIDTH < 380,
  isLargeDevice: SCREEN_WIDTH >= 800,
  
  isNearPerfectSize: Math.abs(SCREEN_WIDTH - REFERENCE_DEVICES.J6_PRIME.width) < 40 ||
                     Math.abs(SCREEN_WIDTH - REFERENCE_DEVICES.HONOR_PAD_X9.width) < 60,
};

export const getResponsivePadding = (): number => {
  if (DEVICE_INFO.isNearPerfectSize) {
    return DEVICE_INFO.isPhone ? 16 : 24;
  }
  
  switch (DEVICE_INFO.type) {
    case 'SMALL_PHONE': return scaleSize(14);
    case 'MEDIUM_PHONE': return scaleSize(16);
    case 'LARGE_PHONE': return scaleSize(18);
    case 'SMALL_TABLET': return scaleSize(20);
    case 'LARGE_TABLET': return scaleSize(24);
    default: return scaleSize(16);
  }
};

export const getMaxContainerWidth = (): number => {
  if (DEVICE_INFO.isTablet) return Math.min(600, SCREEN_WIDTH * 0.9);
  return SCREEN_WIDTH * 0.95;
};

export const getCardPadding = (): number => {
  if (DEVICE_INFO.isNearPerfectSize) {
    return DEVICE_INFO.isPhone ? 20 : 24;
  }
  
  return DEVICE_INFO.isPhone ? scaleSize(20) : scaleSize(24);
};

export const getModalWidth = (screenWidth: number): number => {
  const isCompact = screenWidth < 600;
  if (isCompact) {
    return screenWidth * 0.95;
  } else {
    return Math.min(600, screenWidth * 0.85);
  }
};

export const getModalHeight = (screenHeight: number): number => {
  return screenHeight * 0.85;
};

export const noScale = (size: number): number => size;

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