import { randomUUID } from 'expo-crypto';

/**
 * Generate a UUID v4 string.
 * Uses expo-crypto which works on all platforms (iOS, Android, Web).
 */
export function generateUUID(): string {
  return randomUUID();
}
