import { StyleSheet } from 'react-native';
import { scaleSize, scaleFontSize, getResponsivePadding, getMaxContainerWidth } from '../../utils/responsiveDimensions';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: scaleSize(16),
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
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: scaleSize(24),
  },
  backButton: {
    padding: scaleSize(8),
  },
  headerTitle: {
    fontSize: scaleFontSize(20),
    fontWeight: "600",
    color: "#374151",
    textAlign: "center",
  },
  placeholder: {
    width: scaleSize(40),
  },
  inputContainer: {
    marginBottom: scaleSize(16),
    width: "100%",
  },
  inputLabel: {
    fontSize: scaleFontSize(14),
    fontWeight: "500",
    color: "#4B5563",
    marginBottom: scaleSize(8),
  },
  input: {
    backgroundColor: "white",
    height: scaleSize(50),
    borderRadius: scaleSize(8),
    borderWidth: 1,
    borderColor: "#D1D5DB",
    paddingHorizontal: scaleSize(16),
    fontSize: scaleFontSize(16),
    color: "#1F2937",
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
  registerButton: {
    backgroundColor: "#3B82F6",
    height: scaleSize(50),
    borderRadius: scaleSize(12),
    justifyContent: "center",
    alignItems: "center",
    marginTop: scaleSize(8),
  },
  scrollView: {
    flex: 1,
    width: "100%",
  },
 formContainer: {
   width: "100%",
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
 eyeButton: {
   padding: 15,
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
 checkboxContainer: {
   flexDirection: "row",
   justifyContent: "space-between",
 },
 checkboxRow: {
   flexDirection: "row",
   alignItems: "center",
   flex: 1,
   marginRight: 8,
 },
 checkbox: {
   width: 20,
   height: 20,
   borderRadius: 4,
   borderWidth: 2,
   borderColor: "#D1D5DB",
   marginRight: 8,
   justifyContent: "center",
   alignItems: "center",
 },
 checkboxSelected: {
   backgroundColor: "#3B82F6",
   borderColor: "#3B82F6",
 },
 checkboxLabel: {
   fontSize: 14,
   color: "#374151",
   flex: 1,
 },
 selectButton: {
   backgroundColor: "white",
   height: 50,
   borderRadius: 8,
   borderWidth: 1,
   borderColor: "#D1D5DB",
   paddingHorizontal: 16,
   flexDirection: "row",
   alignItems: "center",
   justifyContent: "space-between",
 },
 selectText: {
   fontSize: 16,
   color: "#1F2937",
 },
 selectPlaceholder: {
   color: "#9CA3AF",
 },
 registerButtonText: {
   color: "white",
   fontSize: 16,
   fontWeight: "600",
 },
 modalOverlay: {
   flex: 1,
   backgroundColor: "rgba(0, 0, 0, 0.5)",
   justifyContent: "center",
   alignItems: "center",
 },
 modalContent: {
   backgroundColor: "white",
   borderRadius: 12,
   padding: 20,
   width: "80%",
   maxWidth: 300,
 },
 modalTitle: {
   fontSize: 18,
   fontWeight: "600",
   color: "#1F2937",
   marginBottom: 16,
   textAlign: "center",
 },
 modalOption: {
   paddingVertical: 12,
   paddingHorizontal: 16,
   borderBottomWidth: 1,
   borderBottomColor: "#F3F4F6",
 },
 modalOptionText: {
   fontSize: 16,
   color: "#374151",
   textAlign: "center",
 },
 inputWithIcon: {
   flexDirection: 'row',
   alignItems: 'center',
   justifyContent: 'space-between',
   backgroundColor: '#FFFFFF',
   height: 50,
   borderRadius: 8,
   borderWidth: 1,
   borderColor: '#D1D5DB',
   paddingHorizontal: 16,
 },
 inputText: {
   fontSize: 16,
   color: '#1F2937',
 },
 placeholderText: {
   color: '#9CA3AF',
 },
 column: {
   flexDirection: 'column',
   marginBottom: 12,
 },  
 checkboxSpacing: {
   marginBottom: 12,
 },
 footerContainer: {
   flexDirection: "row", 
   justifyContent: "center", 
   alignItems: "center", 
   marginTop: 16,
 },
 footerText: { 
   fontSize: 14, 
   color: "#6B7280", 
   marginRight: 8 
 },
 footerLink: { 
   fontSize: 14, 
   color: "#3B82F6", 
   fontWeight: "500" 
 },
})
