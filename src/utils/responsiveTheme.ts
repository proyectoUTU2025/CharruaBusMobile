// utils/responsiveTheme.ts
import { StyleSheet } from 'react-native';
import { 
  scaleSize, 
  scaleFontSize, 
  getResponsivePadding, 
  getMaxContainerWidth,
  getCardPadding,
  DEVICE_INFO 
} from './responsiveDimensions';

// Colores (mantener los mismos que funcionan en tablet)
export const COLORS = {
  primary: '#3B82F6',
  secondary: '#f4cb20',
  success: '#10B981',
  error: '#EF4444',
  warning: '#F59E0B',
  
  gray: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },
  
  white: '#FFFFFF',
  background: 'rgba(255, 255, 255, 0.95)',
};

// Tipografía responsiva basada en la tablet
export const TYPOGRAPHY = {
  // Tamaños que funcionan bien en tablet, escalados para otros dispositivos
  fontSize: {
    xs: scaleFontSize(10),
    sm: scaleFontSize(12),
    base: scaleFontSize(14),
    lg: scaleFontSize(16),
    xl: scaleFontSize(18),
    '2xl': scaleFontSize(20),
    '3xl': scaleFontSize(24),
    '4xl': scaleFontSize(32),
  },
  
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
  
  fontWeight: {
    normal: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
};

// Espaciado responsivo
export const SPACING = {
  xs: scaleSize(4),
  sm: scaleSize(8),
  md: scaleSize(12),
  lg: scaleSize(16),
  xl: scaleSize(20),
  '2xl': scaleSize(24),
  '3xl': scaleSize(32),
  '4xl': scaleSize(40),
  '5xl': scaleSize(48),
};

// Bordes responsivos
export const BORDERS = {
  radius: {
    sm: scaleSize(4),
    md: scaleSize(8),
    lg: scaleSize(12),
    xl: scaleSize(16),
    '2xl': scaleSize(20),
    full: scaleSize(1000),
  },
  
  width: {
    thin: 1,
    normal: 2,
    thick: 3,
  },
};

// Sombras responsivas
export const SHADOWS = {
  small: {
    shadowColor: COLORS.gray[900],
    shadowOffset: { width: 0, height: scaleSize(1) },
    shadowOpacity: 0.1,
    shadowRadius: scaleSize(2),
    elevation: 2,
  },
  
  medium: {
    shadowColor: COLORS.gray[900],
    shadowOffset: { width: 0, height: scaleSize(4) },
    shadowOpacity: 0.15,
    shadowRadius: scaleSize(6),
    elevation: 4,
  },
  
  large: {
    shadowColor: COLORS.gray[900],
    shadowOffset: { width: 0, height: scaleSize(8) },
    shadowOpacity: 0.2,
    shadowRadius: scaleSize(12),
    elevation: 8,
  },
};

// Factory para crear estilos responsivos
export const createResponsiveStyleSheet = () => StyleSheet.create({
  // Contenedores base
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  
  backgroundImage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  safeArea: {
    flex: 1,
  },
  
  scrollView: {
    flex: 1,
    width: '100%',
  },
  
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: getResponsivePadding(),
  },
  
  // Card principal (funciona perfecto en tablet)
  cardContainer: {
    width: '100%',
    maxWidth: getMaxContainerWidth(),
    backgroundColor: COLORS.background,
    borderRadius: BORDERS.radius.xl,
    padding: getCardPadding(),
    ...SHADOWS.large,
    alignSelf: 'center',
  },
  
  // Headers
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING['2xl'],
  },
  
  headerTitle: {
    fontSize: TYPOGRAPHY.fontSize['2xl'],
    fontWeight: '600',
    color: COLORS.gray[700],
    textAlign: 'center',
    flex: 1,
  },
  
  backButton: {
    padding: SPACING.sm,
    minWidth: scaleSize(40),
    minHeight: scaleSize(40),
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  placeholder: {
    width: scaleSize(40),
  },
  
  // Formularios
  formContainer: {
    width: '100%',
  },
  
  inputContainer: {
    marginBottom: SPACING.lg,
    width: '100%',
  },
  
  inputLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: '500',
    color: COLORS.gray[600],
    marginBottom: SPACING.sm,
  },
  
  input: {
    backgroundColor: COLORS.white,
    height: scaleSize(50),
    borderRadius: BORDERS.radius.md,
    borderWidth: BORDERS.width.thin,
    borderColor: COLORS.gray[300],
    paddingHorizontal: SPACING.lg,
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.gray[800],
  },
  
  inputError: {
    borderColor: COLORS.error,
    borderWidth: BORDERS.width.normal,
  },
  
  errorText: {
    color: COLORS.error,
    fontSize: TYPOGRAPHY.fontSize.xs,
    marginTop: SPACING.xs,
    marginLeft: SPACING.xs,
  },
  
  successText: {
    color: COLORS.success,
    fontSize: TYPOGRAPHY.fontSize.xs,
    marginTop: SPACING.xs,
    marginLeft: SPACING.xs,
    fontWeight: '500',
  },
  
  // Botones
  primaryButton: {
    backgroundColor: COLORS.primary,
    height: scaleSize(50),
    borderRadius: BORDERS.radius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING.sm,
    ...SHADOWS.medium,
  },
  
  primaryButtonDisabled: {
    backgroundColor: COLORS.gray[400],
    ...SHADOWS.small,
  },
  
  primaryButtonText: {
    color: COLORS.white,
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '600',
  },
  
  secondaryButton: {
    backgroundColor: COLORS.white,
    height: scaleSize(50),
    borderRadius: BORDERS.radius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: BORDERS.width.thin,
    borderColor: COLORS.gray[300],
  },
  
  secondaryButtonText: {
    color: COLORS.primary,
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '500',
  },
  
  // Contenedores especiales
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: scaleSize(60),
  },
  
  loadingText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.gray[500],
    marginTop: SPACING.lg,
    textAlign: 'center',
  },
  
  // Cards secundarios
  card: {
    backgroundColor: COLORS.white,
    borderRadius: BORDERS.radius.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    ...SHADOWS.small,
  },
  
  // Modales
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: BORDERS.radius.xl,
    padding: SPACING.xl,
    width: '90%',
    maxWidth: scaleSize(400),
    maxHeight: '80%',
  },
  
  // Estados específicos según dispositivo
  adaptiveText: {
    fontSize: DEVICE_INFO.isPhone ? TYPOGRAPHY.fontSize.sm : TYPOGRAPHY.fontSize.base,
    color: COLORS.gray[600],
  },
  
  adaptiveTitle: {
    fontSize: DEVICE_INFO.isPhone ? TYPOGRAPHY.fontSize.xl : TYPOGRAPHY.fontSize['2xl'],
    fontWeight: '700',
    color: COLORS.gray[800],
  },
  
  adaptivePadding: {
    padding: DEVICE_INFO.isPhone ? SPACING.md : SPACING.lg,
  },
});