import { StyleSheet } from 'react-native';
import { 
  scaleSize, 
  scaleFontSize, 
  getResponsivePadding, 
  getMaxContainerWidth,
  getCardPadding,
} from '../../utils/responsiveDimensions';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    padding: getResponsivePadding(),
  },
  cardContainer: {
    width: "100%",
    maxWidth: getMaxContainerWidth(),
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: scaleSize(16),
    padding: getCardPadding(),
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: scaleSize(4),
    },
    shadowOpacity: 0.3,
    shadowRadius: scaleSize(8),
    elevation: 8,
    alignSelf: 'center',
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
  headerSubtitle: {
    fontSize: scaleFontSize(14),
    color: "#6B7280",
    fontWeight: "normal",
  },
  placeholder: {
    width: scaleSize(40),
  },
  formContainer: {
    gap: scaleSize(20),
  },
  inputContainer: {
    marginBottom: scaleSize(4),
  },
  inputLabel: {
    fontSize: scaleFontSize(16),
    fontWeight: "500",
    color: "#374151",
    marginBottom: scaleSize(8),
  },
  limiteInfo: {
    fontSize: scaleFontSize(12),
    color: "#6B7280",
    fontWeight: "normal",
  },
  inputWithIcon: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: scaleSize(8),
    paddingHorizontal: scaleSize(12),
    paddingVertical: scaleSize(14),
    minHeight: scaleSize(48),
  },
  inputText: {
    flex: 1,
    fontSize: scaleFontSize(16),
    color: "#374151",
  },
  placeholderText: {
    color: "#9CA3AF",
  },
  inputError: {
    borderColor: "#EF4444",
    backgroundColor: "#FEF2F2",
  },
  inputDisabled: {
    backgroundColor: "#F3F4F6",
    borderColor: "#E5E7EB",
  },
  errorText: {
    fontSize: scaleFontSize(12),
    color: "#EF4444",
    marginTop: scaleSize(4),
    marginLeft: scaleSize(4),
  },
  selectButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: scaleSize(8),
    paddingHorizontal: scaleSize(12),
    paddingVertical: scaleSize(14),
    minHeight: scaleSize(48),
  },
  selectText: {
    fontSize: scaleFontSize(16),
    color: "#374151",
  },
  infoContainer: {
    backgroundColor: "#ECFDF5",
    borderRadius: scaleSize(8),
    padding: scaleSize(16),
    borderWidth: 1,
    borderColor: "#10B981",
    marginTop: scaleSize(8),
  },
  infoTitle: {
    fontSize: scaleFontSize(16),
    fontWeight: "600",
    color: "#10B981",
    marginBottom: scaleSize(12),
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: scaleSize(8),
  },
  infoItem: {
    fontSize: scaleFontSize(14),
    color: "#10B981",
    marginLeft: scaleSize(8),
    flex: 1,
  },
  searchButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#9CA3AF",
    borderRadius: scaleSize(12),
    paddingVertical: scaleSize(16),
    paddingHorizontal: scaleSize(24),
    marginTop: scaleSize(16),
  },
  searchButtonActive: {
    backgroundColor: "#3B82F6",
  },
  searchButtonText: {
    fontSize: scaleFontSize(18),
    fontWeight: "600",
    color: "white",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.32)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  selectorModal: {
    backgroundColor: 'white',
    borderRadius: scaleSize(16),
    maxHeight: '80%',
    width: '100%',
    maxWidth: scaleSize(580),
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: scaleSize(4) },
    shadowOpacity: 0.2,
    shadowRadius: scaleSize(8),
    position: 'absolute',
    top: '10%',
    alignSelf: 'center',
    overflow: 'hidden',
    zIndex: 1001,
  },
  pasajerosModal: {
    backgroundColor: 'white',
    borderRadius: scaleSize(16),
    maxHeight: '60%',
    width: '80%',
    maxWidth: scaleSize(400),
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: scaleSize(4) },
    shadowOpacity: 0.2,
    shadowRadius: scaleSize(8),
    position: 'absolute',
    top: '20%',
    alignSelf: 'center',
    overflow: 'hidden',
    zIndex: 1001,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: scaleSize(24),
    paddingBottom: scaleSize(16),
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: scaleFontSize(18),
    fontWeight: '600',
    color: '#374151',
  },
  closeButton: {
    padding: scaleSize(8),
    borderRadius: scaleSize(20),
  },
  searchContainer: {
    position: 'relative',
    margin: scaleSize(16),
    marginBottom: scaleSize(8),
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: scaleSize(8),
    paddingLeft: scaleSize(12),
    paddingRight: scaleSize(40),
    paddingVertical: scaleSize(12),
    fontSize: scaleFontSize(14),
    color: '#374151',
    backgroundColor: 'white',
  },
  searchIcon: {
    position: 'absolute',
    right: scaleSize(12),
    top: '50%',
    transform: [{ translateY: scaleSize(-10) }],
    zIndex: 1,
  },
  scrollContainer: {
    flex: 1,
    minHeight: scaleSize(200),
    maxHeight: scaleSize(400),
  },
  localidadesList: {
    flex: 1,
    paddingHorizontal: scaleSize(16),
  },
  localidadesListContent: {
    paddingBottom: scaleSize(16),
  },
  localidadItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: scaleSize(16),
    paddingHorizontal: scaleSize(12),
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  localidadText: {
    fontSize: scaleFontSize(14),
    color: '#374151',
    flex: 1,
    lineHeight: scaleSize(20),
  },
  noResultsText: {
    fontSize: scaleFontSize(14),
    color: '#6B7280',
    textAlign: 'center',
    paddingVertical: scaleSize(32),
    fontStyle: 'italic',
  },
  closeModalButton: {
    backgroundColor: "#F3F4F6",
    borderRadius: scaleSize(8),
    paddingVertical: scaleSize(12),
    paddingHorizontal: scaleSize(24),
    alignItems: "center",
    marginTop: scaleSize(16),
    marginHorizontal: scaleSize(20),
    marginBottom: scaleSize(20),
  },
  closeModalButtonText: {
    fontSize: scaleFontSize(16),
    fontWeight: "500",
    color: "#374151",
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: scaleSize(20),
  },
  loadingText: {
    fontSize: scaleFontSize(14),
    color: '#6B7280',
    marginLeft: scaleSize(8),
  },
  pasajerosList: {
    flex: 1,
    paddingHorizontal: scaleSize(16),
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: scaleSize(12),
    padding: scaleSize(20),
    width: "80%",
    maxHeight: "60%",
  },
  modalContentLarge: {
    backgroundColor: "white",
    borderRadius: scaleSize(12),
    padding: scaleSize(20),
    width: "90%",
    maxHeight: "80%",
    maxWidth: getMaxContainerWidth(),
  },
  modalOption: {
    paddingVertical: scaleSize(12),
    paddingHorizontal: scaleSize(16),
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  modalOptionText: {
    fontSize: scaleFontSize(16),
    color: "#374151",
  },
  emptyText: {
    fontSize: scaleFontSize(16),
    color: "#6B7280",
    textAlign: "center",
    paddingVertical: scaleSize(20),
  },
});