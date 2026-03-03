import { Platform } from 'react-native';

export const isWeb = Platform.OS === 'web';

export function useIsWeb() {
  return Platform.OS === 'web';
}
