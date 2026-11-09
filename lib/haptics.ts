'use client';

/**
 * Universal Haptic Feedback Engine
 * Safely invokes Navigator.vibrate with fallback for non-supporting browsers
 */

export function triggerHaptic(type: 'light' | 'medium' | 'heavy' | 'success' | 'error' = 'light'): void {
  if (typeof window === 'undefined' || !('vibrate' in navigator)) return;

  try {
    switch (type) {
      case 'light':
        navigator.vibrate(12);
        break;
      case 'medium':
        navigator.vibrate(25);
        break;
      case 'heavy':
        navigator.vibrate(45);
        break;
      case 'success':
        navigator.vibrate([15, 30, 25]);
        break;
      case 'error':
        navigator.vibrate([40, 40, 40]);
        break;
    }
  } catch {
    // Graceful fallback if device permissions block vibration
  }
}
