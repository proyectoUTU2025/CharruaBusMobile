import { StyleSheet } from 'react-native';
import { scaleSize, scaleFontSize } from '../../utils/responsiveDimensions';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: scaleSize(16),
    paddingTop: scaleSize(32),
    justifyContent: "center",
  },
  card: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: scaleSize(24),
    padding: scaleSize(24),
    marginHorizontal: scaleSize(8),
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: scaleSize(4),
    },
    shadowOpacity: 0.2,
    shadowRadius: scaleSize(12),
    elevation: 8,
  },
  title: {
    fontSize: scaleFontSize(20),
    fontWeight: "500",
    color: "#333",
    textAlign: "center",
    marginBottom: scaleSize(32),
  },
  optionButton: {
    padding: scaleSize(24),
    borderRadius: scaleSize(16),
    borderWidth: 2,
    marginBottom: scaleSize(16),
    alignItems: "center",
  },
  optionSelected: {
    backgroundColor: "#4285F4",
    borderColor: "#4285F4",
  },
  optionUnselected: {
    backgroundColor: "white",
    borderColor: "#4285F4",
  },
  optionIcon: {
    marginBottom: scaleSize(12),
  },
  optionTitle: {
    fontSize: scaleFontSize(20),
    fontWeight: "600",
    marginBottom: scaleSize(4),
  },
  optionTitleSelected: {
    color: "white",
  },
  optionTitleUnselected: {
    color: "#4285F4",
  },
  optionSubtitle: {
    fontSize: scaleFontSize(14),
  },
  optionSubtitleSelected: {
    color: "rgba(255, 255, 255, 0.8)",
  },
  optionSubtitleUnselected: {
    color: "#666",
  },
  continueButton: {
    backgroundColor: "#F3B600",
    borderRadius: scaleSize(12),
    paddingVertical: scaleSize(16),
    paddingHorizontal: scaleSize(24),
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: scaleSize(32),
  },
  continueButtonDisabled: {
    backgroundColor: "#9CA3AF",
  },
  continueButtonText: {
    color: "white",
    fontSize: scaleFontSize(18),
    fontWeight: "500",
    marginRight: scaleSize(8),
  },
  continueIcon: {
    marginLeft: scaleSize(4),
  },
});