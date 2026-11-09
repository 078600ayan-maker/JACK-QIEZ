/**
 * AI Avatar v1.1 Cache Sanitizer & State Auto-Heal Engine
 * Automatically purges stale, broken skin paths, invalid local storage entries,
 * and initializes pristine default character + outfit states.
 */

export function autoHealAppCache(): void {
  if (typeof window === 'undefined') return;

  try {
    const currentVersion = localStorage.getItem('JACK_APP_VERSION');

    if (currentVersion !== 'v2.0') {
      console.log('⚡ Initializing Jack Quiz v2.0 State Sanitizer & Cache Auto-Heal...');

      // 1. Purge stale/broken legacy keys
      const keysToRemove = [
        'offline_custom_avatar',
        'minecraft_skin_cache',
        'legacy_avatar_dp',
        'user_avatar_preview',
        'jack_quiz_avatar_cache',
        'sbr_legacy_cache'
      ];
      keysToRemove.forEach((k) => localStorage.removeItem(k));

      // 2. Sanitize main profile
      const rawUser = localStorage.getItem('sbr_user_profile') || localStorage.getItem('study_buddy_royal_user_profile');
      if (rawUser) {
        try {
          const profile = JSON.parse(rawUser);

          // Fix broken photo URL
          if (
            !profile.photoURL ||
            profile.photoURL.includes('custom_reference') ||
            profile.photoURL.includes('avatars/') ||
            profile.photoURL.includes('undefined')
          ) {
            profile.photoURL = '/assets/profile_photos/IMG_20261109_001512.png';
          }

          // Fix avatar outfit skin path
          if (!profile.customAvatar || !profile.customAvatar.skinPath) {
            profile.customAvatar = {
              preset: 'jax',
              name: 'Cyber Skullwar Knight',
              gender: 'boy',
              skinPath: '/skins/boy/skullwar.png',
              accessory: 'none'
            };
          }

          localStorage.setItem('sbr_user_profile', JSON.stringify(profile));
          localStorage.setItem('study_buddy_royal_user_profile', JSON.stringify(profile));
        } catch {}
      }

      // 3. Guarantee user_profile_photo is clean
      const currentPhoto = localStorage.getItem('user_profile_photo');
      if (!currentPhoto || currentPhoto.includes('undefined') || currentPhoto.includes('custom_reference')) {
        localStorage.setItem('user_profile_photo', '/assets/profile_photos/IMG_20261109_001512.png');
      }

      // 4. Mark app version as v2.0
      localStorage.setItem('JACK_APP_VERSION', 'v2.0');
    }
  } catch (err) {
    console.warn('Cache sanitizer non-blocking warning:', err);
  }
}

export function forceFlushCache(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem('JACK_APP_VERSION');
    localStorage.removeItem('user_profile_photo');
    autoHealAppCache();
    window.location.reload();
  } catch (err) {
    console.warn('Manual cache flush warning:', err);
  }
}
