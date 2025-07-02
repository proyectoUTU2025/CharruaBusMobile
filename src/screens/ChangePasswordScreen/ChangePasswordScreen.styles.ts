import { StyleSheet } from 'react-native';
import { scaleSize, scaleFontSize, getResponsivePadding, getMaxContainerWidth } from '../../utils/responsiveDimensions';

export const styles = StyleSheet.create({
  container: {
      flex: 1,
    },
    cardContainer: {
      width: "100%",
      maxWidth: getMaxContainerWidth(),
      backgroundColor: "rgba(255, 255, 255, 0.95)",
      borderRadius: scaleSize(16),
      padding: getResponsivePadding(),
      shadowColor: "#000",
      shadowOffset: { width: 0, height: scaleSize(4) },
      shadowOpacity: 0.3,
      shadowRadius: scaleSize(8),
      elevation: 8,
    },
    passwordContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: "white",
      borderRadius: scaleSize(8),
      borderWidth: 1,
      borderColor: "#D1D5DB",
    },
    passwordInput: {
      flex: 1,
      height: scaleSize(50),
      paddingHorizontal: scaleSize(16),
      fontSize: scaleFontSize(16),
      color: "#1F2937",
    },
    changeButton: {
      backgroundColor: "#3B82F6",
      height: scaleSize(50),
      borderRadius: scaleSize(12),
      justifyContent: "center",
      alignItems: "center",
      marginTop: scaleSize(8),
    },
    backgroundImage: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    scrollView: {
      flex: 1,
      width: "100%",
    },
    scrollViewContent: {
      flexGrow: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: 16,
    },
    headerContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 24,
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: "600",
      color: "#374151",
      textAlign: "center",
    },
    placeholder: {
      width: 40,
    },
    formContainer: {
      width: "100%",
    },
    inputContainer: {
      marginBottom: 16,
      width: "100%",
    },
    inputLabel: {
      fontSize: 14,
      fontWeight: "500",
      color: "#4B5563",
      marginBottom: 8,
    },
    eyeButton: {
      padding: 15,
    },
    inputError: {
      borderColor: "#EF4444",
      borderWidth: 2,
    },
    errorText: {
      color: "#EF4444",
      fontSize: 12,
      marginTop: 4,
      marginLeft: 4,
    },
    successText: {
      color: "#10B981",
      fontSize: 12,
      marginTop: 4,
      marginLeft: 4,
      fontWeight: "500",
    },
    passwordRequirements: {
      marginTop: 8,
      paddingHorizontal: 4,
    },
    requirementRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 4,
    },
    requirementText: {
      fontSize: 12,
      color: '#EF4444',
      marginLeft: 6,
    },
    requirementValid: {
      color: '#10B981',
    },
    changeButtonDisabled: {
      backgroundColor: "#9CA3AF",
      shadowOpacity: 0,
      elevation: 0,
    },
    changeButtonText: {
      color: "white",
      fontSize: 16,
      fontWeight: "600",
    },
    changeButtonTextDisabled: {
      color: "#FFFFFF",
      opacity: 0.7,
    },
});