import { StyleSheet } from 'react-native';
import { scaleSize } from '../../utils/responsiveDimensions';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  logoContainer: {
    position: 'absolute',
    backgroundColor: 'transparent',
  },
  logoImage: {
    width: scaleSize(200),
    height: scaleSize(100),
    backgroundColor: 'transparent',
  },
  loader: {
    position: 'absolute',
    bottom: scaleSize(100),
  },
});