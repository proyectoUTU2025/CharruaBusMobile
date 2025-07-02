import { StyleSheet } from 'react-native';
import { scaleSize, scaleFontSize } from '../../utils/responsiveDimensions';

export const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  contentContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: scaleSize(24),
  },
  welcomeCard: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: scaleSize(16),
    padding: scaleSize(32),
    alignItems: "center",
    marginHorizontal: scaleSize(8),
    maxWidth: scaleSize(600),
  },
  welcomeIcon: {
    width: scaleSize(120),
    height: scaleSize(120),
    marginBottom: scaleSize(16),
  },
  contentTitle: {
    fontSize: scaleFontSize(24),
    fontWeight: "600",
    color: "#1C1B1F",
    marginBottom: scaleSize(16),
    textAlign: "center",
  },
  contentText: {
    fontSize: scaleFontSize(16),
    color: "#49454F",
    textAlign: "center",
    lineHeight: scaleFontSize(24),
  },
})