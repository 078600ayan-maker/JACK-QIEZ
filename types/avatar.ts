export type CharacterPresetId =
  | 'kai'
  | 'jax'
  | 'otis'
  | 'zane'
  | 'ryo'
  | 'ayo'
  | 'elis'
  | 'nova'
  | 'fay'
  | 'zara'
  | 'mia'
  | 'steve'
  | 'alex'
  | 'noor'
  | 'sunny'
  | 'ari'
  | 'zuri'
  | 'makena'
  | 'efe';

export type AvatarAnimationState = 'idle' | 'cheer' | 'laugh' | 'cry' | 'victory';

export interface AvatarCustomization {
  preset: CharacterPresetId;
  name: string;
  gender?: 'boy' | 'girl';
  skinTone: string;
  eyeColor: string;
  hairStyle: 'classic' | 'braid' | 'curly' | 'spiky' | 'ponytail' | 'hooded' | 'bald';
  hairColor: string;
  shirt: string;
  pants: string;
  hoodie: string;
  elytra: string;
  shoes: string;
  accessory: string;
  skinPath?: string;
  bundleId?: string;
  bundleName?: string;
}

export interface PresetConfig {
  id: CharacterPresetId;
  name: string;
  gender: 'boy' | 'girl';
  title: string;
  role: string;
  icon: string;
  headSvg: string;
  photoURL?: string;
  defaultCustomization: AvatarCustomization;
}

export interface ClassicProfilePhoto {
  id: string;
  name: string;
  character: string;
  gender: 'boy' | 'girl';
  role: string;
  src: string;
}

export const CLASSIC_PROFILE_PHOTOS: ClassicProfilePhoto[] = [
  {
    id: 'dp_kai',
    name: 'Kai',
    character: 'Science Vanguard',
    gender: 'boy',
    role: "Letter 'K' Varsity Blue Jacket & Brown Hair",
    src: '/assets/canonical_characters/kai.png'
  },
  {
    id: 'dp_jax',
    name: 'Jax',
    character: 'Tactical Speedster',
    gender: 'boy',
    role: 'Cyber Cyan Glowing Lines Hoodie & Headset',
    src: '/assets/canonical_characters/jax.png'
  },
  {
    id: 'dp_otis',
    name: 'Otis',
    character: 'Scholar Sage',
    gender: 'boy',
    role: 'Tweed Blazer Suit, Bowtie, Glasses & Scroll',
    src: '/assets/canonical_characters/otis.png'
  },
  {
    id: 'dp_zane',
    name: 'Zane',
    character: 'Cosmic Sorcerer',
    gender: 'boy',
    role: 'Galaxy Purple Robe, Golden Trim & Silver Hair',
    src: '/assets/canonical_characters/zane.png'
  },
  {
    id: 'dp_ryo',
    name: 'Ryo',
    character: 'Tactical Vanguard',
    gender: 'boy',
    role: "Green 'R' Varsity Jacket, Red Headband & Tablet",
    src: '/assets/canonical_characters/ryo.png'
  },
  {
    id: 'dp_elis',
    name: 'Elis',
    character: 'Royal Scholar',
    gender: 'girl',
    role: 'Yellow Overalls, Blonde Buns, Book & Quill',
    src: '/assets/canonical_characters/elis.png'
  },
  {
    id: 'dp_nova',
    name: 'Nova',
    character: 'Starlight Mage',
    gender: 'girl',
    role: 'Purple Cosmic Galaxy Hoodie & Star Wand',
    src: '/assets/canonical_characters/nova.png'
  },
  {
    id: 'dp_fay',
    name: 'Fay',
    character: 'Nature Guardian',
    gender: 'girl',
    role: 'Woodland Green Dress, Braided Hair & Leaf Book',
    src: '/assets/canonical_characters/fay.png'
  },
  {
    id: 'dp_zara',
    name: 'Zara',
    character: 'Speed Runner',
    gender: 'girl',
    role: 'Red Athletic Tracksuit Jacket & Neck Headphones',
    src: '/assets/canonical_characters/zara.png'
  },
  {
    id: 'dp_mia',
    name: 'Mia',
    character: 'Creative Artisan',
    gender: 'girl',
    role: 'Pastel Cardigan, Pink Anime Hair & Art Palette',
    src: '/assets/canonical_characters/mia.png'
  }
];

export async function extractSkinFace(skinUrl: string): Promise<string> {
  if (typeof window === 'undefined') return skinUrl;
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = skinUrl;
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = 128;
        canvas.height = 128;
        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve(skinUrl);
        ctx.imageSmoothingEnabled = false;
        // Base layer: Head front at (8, 8, 8, 8)
        ctx.drawImage(img, 8, 8, 8, 8, 0, 0, 128, 128);
        // Outer layer: Hat/Hair front at (40, 8, 8, 8)
        ctx.drawImage(img, 40, 8, 8, 8, 0, 0, 128, 128);
        resolve(canvas.toDataURL('image/png'));
      } catch (err) {
        resolve(skinUrl);
      }
    };
    img.onerror = () => resolve(skinUrl);
  });
}

export interface BundleItem {
  id: string;
  name: string;
  character: string;
  gender: 'boy' | 'girl';
  section: string;
  skinPath: string;
  previewImage: string;
  description: string;
  owned: boolean;
}

// 10 Canonical Characters from roll prompt.txt
export const CHARACTER_PRESETS: PresetConfig[] = [
  // MALE (5 Characters)
  {
    id: 'kai',
    name: 'Kai',
    gender: 'boy',
    title: 'The Fire Pioneer',
    role: 'Science & Physics Vanguard',
    icon: '🔥',
    headSvg: '/avatars/steve.svg',
    photoURL: '/assets/canonical_characters/kai.png',
    defaultCustomization: {
      preset: 'kai',
      name: 'Kai',
      gender: 'boy',
      skinTone: '#C48A68',
      eyeColor: '#2B4B8B',
      hairStyle: 'spiky',
      hairColor: '#382215',
      shirt: 'steve_cyan',
      pants: 'indigo_jeans',
      hoodie: 'none',
      elytra: 'none',
      shoes: 'grey_sneaker',
      accessory: 'none',
      skinPath: '/assets/canonical_skins/kai_skin.png'
    }
  },
  {
    id: 'jax',
    name: 'Jax',
    gender: 'boy',
    title: 'Tactical Genius',
    role: 'Mathematics & Speed Solver',
    icon: '⚡',
    headSvg: '/avatars/steve.svg',
    photoURL: '/assets/canonical_characters/jax.png',
    defaultCustomization: {
      preset: 'jax',
      name: 'Jax',
      gender: 'boy',
      skinTone: '#B87854',
      eyeColor: '#10B981',
      hairStyle: 'classic',
      hairColor: '#1A1829',
      shirt: 'netherite_plate',
      pants: 'carbon_black',
      hoodie: 'none',
      elytra: 'none',
      shoes: 'netherite_boots',
      accessory: 'nerd_glasses',
      skinPath: '/assets/canonical_skins/jax_skin.png'
    }
  },
  {
    id: 'otis',
    name: 'Otis',
    gender: 'boy',
    title: 'Scholar Sage',
    role: 'SST & History Chronicler',
    icon: '📜',
    headSvg: '/avatars/steve.svg',
    photoURL: '/assets/canonical_characters/otis.png',
    defaultCustomization: {
      preset: 'otis',
      name: 'Otis',
      gender: 'boy',
      skinTone: '#DCA27C',
      eyeColor: '#4E3127',
      hairStyle: 'classic',
      hairColor: '#261C14',
      shirt: 'royal_velvet',
      pants: 'hunter_brown',
      hoodie: 'none',
      elytra: 'none',
      shoes: 'leather_boots',
      accessory: 'none',
      skinPath: '/assets/canonical_skins/otis_skin.png'
    }
  },
  {
    id: 'zane',
    name: 'Zane',
    gender: 'boy',
    title: 'Cyber Ninja',
    role: 'Speed Drills & Logic Master',
    icon: '🥷',
    headSvg: '/avatars/steve.svg',
    photoURL: '/assets/canonical_characters/zane.png',
    defaultCustomization: {
      preset: 'zane',
      name: 'Zane',
      gender: 'boy',
      skinTone: '#C98A65',
      eyeColor: '#EF4444',
      hairStyle: 'spiky',
      hairColor: '#111116',
      shirt: 'cyber_glitch',
      pants: 'camo_combat',
      hoodie: 'none',
      elytra: 'obsidian_wings',
      shoes: 'obsidian_runners',
      accessory: 'none',
      skinPath: '/assets/canonical_skins/zane_skin.png'
    }
  },
  {
    id: 'ryo',
    name: 'Ryo',
    gender: 'boy',
    title: 'Tactical Vanguard',
    role: 'Green Varsity Scholar with Tablet & Martial Headband',
    icon: '🥋',
    headSvg: '/avatars/steve.svg',
    photoURL: '/assets/canonical_characters/ryo.png',
    defaultCustomization: {
      preset: 'ryo',
      name: 'Ryo',
      gender: 'boy',
      skinTone: '#603B2C',
      eyeColor: '#F59E0B',
      hairStyle: 'classic',
      hairColor: '#09090B',
      shirt: 'diamond_plate',
      pants: 'royal_obsidian',
      hoodie: 'none',
      elytra: 'celestial_gold',
      shoes: 'diamond_boots',
      accessory: 'golden_crown',
      skinPath: '/assets/canonical_skins/ryo_skin.png'
    }
  },

  // FEMALE (5 Characters)
  {
    id: 'elis',
    name: 'Elis',
    gender: 'girl',
    title: 'Royal Commander',
    role: 'Biology & Natural Chemistry',
    icon: '🌸',
    headSvg: '/avatars/alex.svg',
    photoURL: '/assets/canonical_characters/elis.png',
    defaultCustomization: {
      preset: 'elis',
      name: 'Elis',
      gender: 'girl',
      skinTone: '#F6BE9A',
      eyeColor: '#2E8B57',
      hairStyle: 'ponytail',
      hairColor: '#C25D23',
      shirt: 'alex_green',
      pants: 'hunter_brown',
      hoodie: 'none',
      elytra: 'phoenix_wings',
      shoes: 'leather_boots',
      accessory: 'none',
      skinPath: '/assets/canonical_skins/elis_skin.png'
    }
  },
  {
    id: 'nova',
    name: 'Nova',
    gender: 'girl',
    title: 'Starlight Mage',
    role: 'English & Literature Visionary',
    icon: '✨',
    headSvg: '/avatars/alex.svg',
    photoURL: '/assets/canonical_characters/nova.png',
    defaultCustomization: {
      preset: 'nova',
      name: 'Nova',
      gender: 'girl',
      skinTone: '#FEE2E2',
      eyeColor: '#8B5CF6',
      hairStyle: 'braid',
      hairColor: '#EC4899',
      shirt: 'royal_velvet',
      pants: 'indigo_jeans',
      hoodie: 'none',
      elytra: 'none',
      shoes: 'red_converse',
      accessory: 'none',
      skinPath: '/assets/canonical_skins/nova_skin.png'
    }
  },
  {
    id: 'fay',
    name: 'Fay',
    gender: 'girl',
    title: 'Nature Guardian',
    role: 'Geography & Environmental Biology',
    icon: '🍃',
    headSvg: '/avatars/alex.svg',
    photoURL: '/assets/canonical_characters/fay.png',
    defaultCustomization: {
      preset: 'fay',
      name: 'Fay',
      gender: 'girl',
      skinTone: '#E2E8F0',
      eyeColor: '#10B981',
      hairStyle: 'classic',
      hairColor: '#059669',
      shirt: 'alex_green',
      pants: 'hunter_brown',
      hoodie: 'none',
      elytra: 'none',
      shoes: 'leather_boots',
      accessory: 'none',
      skinPath: '/assets/canonical_skins/fay_skin.png'
    }
  },
  {
    id: 'zara',
    name: 'Zara',
    gender: 'girl',
    title: 'Speed Runner',
    role: 'Algebra & Physics Accelerator',
    icon: '⚡',
    headSvg: '/avatars/alex.svg',
    photoURL: '/assets/canonical_characters/zara.png',
    defaultCustomization: {
      preset: 'zara',
      name: 'Zara',
      gender: 'girl',
      skinTone: '#FBCFE8',
      eyeColor: '#F43F5E',
      hairStyle: 'spiky',
      hairColor: '#3B82F6',
      shirt: 'cyber_glitch',
      pants: 'carbon_black',
      hoodie: 'none',
      elytra: 'obsidian_wings',
      shoes: 'obsidian_runners',
      accessory: 'none',
      skinPath: '/assets/canonical_skins/zara_skin.png'
    }
  },
  {
    id: 'mia',
    name: 'Mia',
    gender: 'girl',
    title: 'Creative Artisan',
    role: 'Hindi & Creative Expression',
    icon: '🎨',
    headSvg: '/avatars/alex.svg',
    photoURL: '/assets/canonical_characters/mia.png',
    defaultCustomization: {
      preset: 'mia',
      name: 'Mia',
      gender: 'girl',
      skinTone: '#FEF3C7',
      eyeColor: '#3B82F6',
      hairStyle: 'curly',
      hairColor: '#F59E0B',
      shirt: 'gold_jacket',
      pants: 'gold_trousers',
      hoodie: 'none',
      elytra: 'celestial_gold',
      shoes: 'gold_boots',
      accessory: 'golden_crown',
      skinPath: '/assets/canonical_skins/mia_skin.png'
    }
  },
];

// The strictly defined 10 Main Canonical Scholars from the master reference card:
export const CANONICAL_10_CHARACTERS = CHARACTER_PRESETS.slice(0, 10);

export const LEGACY_PRESETS: PresetConfig[] = [
  // Legacy Presets for backward compatibility
  {
    id: 'steve',
    name: 'Steve',
    gender: 'boy',
    title: 'The Classic Pioneer',
    role: 'Diamond Miner & Royal Crafter',
    icon: '⛏️',
    headSvg: '/avatars/steve.svg',
    photoURL: '/assets/profile_photos/IMG_20261109_001512.png',
    defaultCustomization: {
      preset: 'steve',
      name: 'Steve',
      gender: 'boy',
      skinTone: '#C48A68',
      eyeColor: '#2B4B8B',
      hairStyle: 'classic',
      hairColor: '#382215',
      shirt: 'steve_cyan',
      pants: 'indigo_jeans',
      hoodie: 'none',
      elytra: 'none',
      shoes: 'grey_sneaker',
      accessory: 'none',
      skinPath: '/skins/boy/minecraft-skins.png'
    }
  },
  {
    id: 'alex',
    name: 'Alex',
    gender: 'girl',
    title: 'Wilderness Explorer',
    role: 'Survivalist & Geometry Master',
    icon: '🏹',
    headSvg: '/avatars/alex.svg',
    photoURL: '/assets/profile_photos/IMG_20261109_001715.png',
    defaultCustomization: {
      preset: 'alex',
      name: 'Alex',
      gender: 'girl',
      skinTone: '#F6BE9A',
      eyeColor: '#2E8B57',
      hairStyle: 'braid',
      hairColor: '#C25D23',
      shirt: 'alex_green',
      pants: 'hunter_brown',
      hoodie: 'none',
      elytra: 'obsidian_wings',
      shoes: 'leather_boots',
      accessory: 'none',
      skinPath: '/skins/girl/cute-anime-girl.png'
    }
  }
];

// 40 Preloaded Bundles (20 Boys + 20 Girls) matching Avatar Studio V3.0
export const BOY_BUNDLES: Record<string, BundleItem[]> = {
  'TERROR KNIGHT': [
    {
      id: 'boy_skullwar',
      name: 'Cyber Skullwar Knight',
      character: 'Skullwar',
      gender: 'boy',
      section: 'TERROR KNIGHT',
      skinPath: '/skins/boy/skullwar.png',
      previewImage: '/skins/boy/skullwar.png',
      description: 'Cyan neon armored skull cybernetic knight.',
      owned: true
    },
    {
      id: 'boy_galactic_mask',
      name: 'Galactic Mask Knight',
      character: 'Galactic',
      gender: 'boy',
      section: 'TERROR KNIGHT',
      skinPath: '/skins/boy/anime-purple-mask-boy-galactic.png',
      previewImage: '/skins/boy/anime-purple-mask-boy-galactic.png',
      description: 'Purple obsidian cosmic mask warrior.',
      owned: true
    },
    {
      id: 'boy_madara',
      name: 'Madara Warlord',
      character: 'Madara',
      gender: 'boy',
      section: 'TERROR KNIGHT',
      skinPath: '/skins/boy/madara-uchiha.png',
      previewImage: '/skins/boy/madara-uchiha.png',
      description: 'Crimson battle armor legendary shinobi.',
      owned: true
    },
    {
      id: 'boy_levi',
      name: 'Levi Titan Vanguard',
      character: 'Levi',
      gender: 'boy',
      section: 'TERROR KNIGHT',
      skinPath: '/skins/boy/levi-ackerman-attack-on-titan-hero-survey-corps-humanitys-strongest-soldier-captain-assassin-cute-boy-anime.png',
      previewImage: '/skins/boy/levi-ackerman-attack-on-titan-hero-survey-corps-humanitys-strongest-soldier-captain-assassin-cute-boy-anime.png',
      description: 'Survey Corps humanity strongest assassin.',
      owned: true
    },
    {
      id: 'boy_cudey',
      name: 'Dark Obsidian Paladin',
      character: 'Paladin',
      gender: 'boy',
      section: 'TERROR KNIGHT',
      skinPath: '/skins/boy/cudey.png',
      previewImage: '/skins/boy/cudey.png',
      description: 'Dark steel heavy armor royal knight.',
      owned: true
    }
  ],
  'ENDLESS FEAR': [
    {
      id: 'boy_sasuke',
      name: 'Crimson Shadow Sasuke',
      character: 'Sasuke',
      gender: 'boy',
      section: 'ENDLESS FEAR',
      skinPath: '/skins/boy/sasuke-uchiha-naruto-shippuden-hero-rogue-ninja-sharingan-boy-anime.png',
      previewImage: '/skins/boy/sasuke-uchiha-naruto-shippuden-hero-rogue-ninja-sharingan-boy-anime.png',
      description: 'Sharingan rouge ninja with dark purple chakra.',
      owned: true
    },
    {
      id: 'boy_light',
      name: 'Death God Kira',
      character: 'Light',
      gender: 'boy',
      section: 'ENDLESS FEAR',
      skinPath: '/skins/boy/light-yagamikira-death-note-villain-killer-god-raito-yagami-khaki-blazer-boy-cute-anime.png',
      previewImage: '/skins/boy/light-yagamikira-death-note-villain-killer-god-raito-yagami-khaki-blazer-boy-cute-anime.png',
      description: 'Genius scholar with mysterious dark authority.',
      owned: true
    },
    {
      id: 'boy_baki',
      name: 'Baki Demon Fighter',
      character: 'Baki',
      gender: 'boy',
      section: 'ENDLESS FEAR',
      skinPath: '/skins/boy/baki.png',
      previewImage: '/skins/boy/baki.png',
      description: 'Indomitable willpower martial arts champion.',
      owned: true
    },
    {
      id: 'boy_ben10',
      name: 'Omniverse Hunter',
      character: 'Ben',
      gender: 'boy',
      section: 'ENDLESS FEAR',
      skinPath: '/skins/boy/ben10-omniverse.png',
      previewImage: '/skins/boy/ben10-omniverse.png',
      description: 'Cosmic watch hero in intergalactic jacket.',
      owned: true
    },
    {
      id: 'boy_steve_classic',
      name: 'Void Miner Classic',
      character: 'Steve',
      gender: 'boy',
      section: 'ENDLESS FEAR',
      skinPath: '/skins/boy/minecraft-skins.png',
      previewImage: '/skins/boy/minecraft-skins.png',
      description: 'Endless depth subterranean explorer.',
      owned: true
    }
  ],
  'SHONEN LEGENDS': [
    {
      id: 'boy_goku',
      name: 'Goku Ultra Instinct',
      character: 'Goku',
      gender: 'boy',
      section: 'SHONEN LEGENDS',
      skinPath: '/skins/boy/goku-ultra-instinto-perfecto.png',
      previewImage: '/skins/boy/goku-ultra-instinto-perfecto.png',
      description: 'Silver hair godly ki warrior skin with aura.',
      owned: true
    },
    {
      id: 'boy_luffy',
      name: 'Monkey D. Luffy',
      character: 'Luffy',
      gender: 'boy',
      section: 'SHONEN LEGENDS',
      skinPath: '/skins/boy/monkey-d-luffy-one-piece-hero-boy-straw-hat-rubber-man-pirate-captain-the-fifth-emperor-worst-generation-anime.png',
      previewImage: '/skins/boy/monkey-d-luffy-one-piece-hero-boy-straw-hat-rubber-man-pirate-captain-the-fifth-emperor-worst-generation-anime.png',
      description: 'Straw Hat pirate captain fifth emperor outfit.',
      owned: true
    },
    {
      id: 'boy_naruto',
      name: 'Naruto Uzumaki',
      character: 'Naruto',
      gender: 'boy',
      section: 'SHONEN LEGENDS',
      skinPath: '/skins/boy/naruto-uzumaki-naruto-shippuden-ninja-hero-orange-hokage-boy-anime.png',
      previewImage: '/skins/boy/naruto-uzumaki-naruto-shippuden-ninja-hero-orange-hokage-boy-anime.png',
      description: 'Orange Hokage ninja hero outfit.',
      owned: true
    },
    {
      id: 'boy_tanjiro',
      name: 'Tanjiro Kamado',
      character: 'Tanjiro',
      gender: 'boy',
      section: 'SHONEN LEGENDS',
      skinPath: '/skins/boy/tanjiro-kamado-demon-slayer-kimetsu-no-yaiba-anime.png',
      previewImage: '/skins/boy/tanjiro-kamado-demon-slayer-kimetsu-no-yaiba-anime.png',
      description: 'Green checkered haori demon slayer uniform.',
      owned: true
    },
    {
      id: 'boy_zoro',
      name: 'Roronoa Zoro',
      character: 'Zoro',
      gender: 'boy',
      section: 'SHONEN LEGENDS',
      skinPath: '/skins/boy/roronoa-zoro-one-piece-pirate-hunter-swordsman-swords-man-zolo-green-hair-boy-anime.png',
      previewImage: '/skins/boy/roronoa-zoro-one-piece-pirate-hunter-swordsman-swords-man-zolo-green-hair-boy-anime.png',
      description: 'Three sword style master green bandana rogue.',
      owned: true
    },
    {
      id: 'boy_zenitsu',
      name: 'Zenitsu Thunder',
      character: 'Zenitsu',
      gender: 'boy',
      section: 'SHONEN LEGENDS',
      skinPath: '/skins/boy/zenitsu-agastuma-demon-slayer-kimetsu-no-yaiba-anime.png',
      previewImage: '/skins/boy/zenitsu-agastuma-demon-slayer-kimetsu-no-yaiba-anime.png',
      description: 'Yellow triangle thunder haori lightning blade.',
      owned: true
    },
    {
      id: 'boy_kakashi',
      name: 'Kid Kakashi',
      character: 'Kakashi',
      gender: 'boy',
      section: 'SHONEN LEGENDS',
      skinPath: '/skins/boy/kid-kakashi-minecraft-skin.png',
      previewImage: '/skins/boy/kid-kakashi-minecraft-skin.png',
      description: 'Silver hair prodigy shinobi with White Light blade.',
      owned: true
    },
    {
      id: 'boy_gojo',
      name: 'Gojo Satoru',
      character: 'Gojo',
      gender: 'boy',
      section: 'SHONEN LEGENDS',
      skinPath: '/skins/boy/gojo.png',
      previewImage: '/skins/boy/gojo.png',
      description: 'Blindfold jujutsu high sorcerer black uniform.',
      owned: true
    },
    {
      id: 'boy_cute_2',
      name: 'Cyberpunk Boy Pro',
      character: 'Kai',
      gender: 'boy',
      section: 'SHONEN LEGENDS',
      skinPath: '/skins/boy/cute-anime-boy-2.png',
      previewImage: '/skins/boy/cute-anime-boy-2.png',
      description: 'High-tech headset modern stylish scholar.',
      owned: true
    },
    {
      id: 'boy_cute_1',
      name: 'Casual Anime Scholar',
      character: 'Leo',
      gender: 'boy',
      section: 'SHONEN LEGENDS',
      skinPath: '/skins/boy/cute-anime-boy.png',
      previewImage: '/skins/boy/cute-anime-boy.png',
      description: 'Comfortable hoodie jacket everyday learner.',
      owned: true
    }
  ]
};

export const GIRL_BUNDLES: Record<string, BundleItem[]> = {
  'CELESTIAL GODDESS': [
    {
      id: 'girl_albedo',
      name: 'Albedo Celestial Guardian',
      character: 'Albedo',
      gender: 'girl',
      section: 'CELESTIAL GODDESS',
      skinPath: '/skins/girl/albedo-overlord-succubus-demon-guardian-overseer-white-dress-cute-pretty-girl-anime.png',
      previewImage: '/skins/girl/albedo-overlord-succubus-demon-guardian-overseer-white-dress-cute-pretty-girl-anime.png',
      description: 'Great Tomb overseer elegant pure white gown.',
      owned: true
    },
    {
      id: 'girl_konan',
      name: 'Konan Origami Angel',
      character: 'Konan',
      gender: 'girl',
      section: 'CELESTIAL GODDESS',
      skinPath: '/skins/girl/konan-naruto-shippuden-villain-ninja-akatsuki-angel-purple-light-blue-hair-cute-pretty-girl-anime.png',
      previewImage: '/skins/girl/konan-naruto-shippuden-villain-ninja-akatsuki-angel-purple-light-blue-hair-cute-pretty-girl-anime.png',
      description: 'Origami angel Akatsuki cloak and paper blossom.',
      owned: true
    },
    {
      id: 'girl_rei',
      name: 'Rei Ayanami Pilot',
      character: 'Rei',
      gender: 'girl',
      section: 'CELESTIAL GODDESS',
      skinPath: '/skins/girl/rei-ayanami-neon-genesis-evangelion-evangelion-pilot-kuudere-white-pale-blue-hair-pretty-cute-girl-anime.png',
      previewImage: '/skins/girl/rei-ayanami-neon-genesis-evangelion-evangelion-pilot-kuudere-white-pale-blue-hair-pretty-cute-girl-anime.png',
      description: 'Plugsuit pilot white pale blue hair heroine.',
      owned: true
    },
    {
      id: 'girl_mori',
      name: 'Mori Calliope Empress',
      character: 'Mori',
      gender: 'girl',
      section: 'CELESTIAL GODDESS',
      skinPath: '/skins/girl/mori-calliope-hololive-em-reaper-rapper-new-outfit-pink-hair-cute-pretty-girl-jacket-sneakers-earrings-necklace-detalis-anime.png',
      previewImage: '/skins/girl/mori-calliope-hololive-em-reaper-rapper-new-outfit-pink-hair-cute-pretty-girl-jacket-sneakers-earrings-necklace-detalis-anime.png',
      description: 'Pink hair reaper royalty stylish gold jewelry.',
      owned: true
    },
    {
      id: 'girl_cat_hd',
      name: 'Anime Cat Queen HD',
      character: 'Mia',
      gender: 'girl',
      section: 'CELESTIAL GODDESS',
      skinPath: '/skins/girl/anime-cat-girl-hd-not-mine-copy.png',
      previewImage: '/skins/girl/anime-cat-girl-hd-not-mine-copy.png',
      description: 'Detailed high-resolution feline royal armor.',
      owned: true
    }
  ],
  'NATURE WARRIORS': [
    {
      id: 'girl_green_hd',
      name: 'Emerald Nature Warden',
      character: 'Fay',
      gender: 'girl',
      section: 'NATURE WARRIORS',
      skinPath: '/skins/girl/anime-hd-girl-green.png',
      previewImage: '/skins/girl/anime-hd-girl-green.png',
      description: 'Vibrant green floral elemental guardian.',
      owned: true
    },
    {
      id: 'girl_nami',
      name: 'Nami Sea Navigator',
      character: 'Nami',
      gender: 'girl',
      section: 'NATURE WARRIORS',
      skinPath: '/skins/girl/nami-one-piece.png',
      previewImage: '/skins/girl/nami-one-piece.png',
      description: 'Cat burglar sea navigator weather baton wielder.',
      owned: true
    },
    {
      id: 'girl_robin',
      name: 'Nico Robin Archaeologist',
      character: 'Robin',
      gender: 'girl',
      section: 'NATURE WARRIORS',
      skinPath: '/skins/girl/nico-robinrobiland-one-piece-devil-child-pirate-assassin-pretty-cute-girl-anime.png',
      previewImage: '/skins/girl/nico-robinrobiland-one-piece-devil-child-pirate-assassin-pretty-cute-girl-anime.png',
      description: 'Poneglyph scholar thousand fleur floral power.',
      owned: true
    },
    {
      id: 'girl_sakura',
      name: 'Sakura Cherry Ninja',
      character: 'Sakura',
      gender: 'girl',
      section: 'NATURE WARRIORS',
      skinPath: '/skins/girl/sakura-haruno-naruto-shippuden-medical-ninja-pink-girl-pretty-cute-anime.png',
      previewImage: '/skins/girl/sakura-haruno-naruto-shippuden-medical-ninja-pink-girl-pretty-cute-anime.png',
      description: 'Medical ninja red top pink hair warrior.',
      owned: true
    },
    {
      id: 'girl_panda',
      name: 'Sweet Forest Panda',
      character: 'Noor',
      gender: 'girl',
      section: 'NATURE WARRIORS',
      skinPath: '/skins/girl/xrockypanda-sweet-anime-girl.png',
      previewImage: '/skins/girl/xrockypanda-sweet-anime-girl.png',
      description: 'Bamboo forest sweet bear companion dress.',
      owned: true
    }
  ],
  'ANIME MAIDENS': [
    {
      id: 'girl_nezuko',
      name: 'Nezuko Bamboo Maiden',
      character: 'Nezuko',
      gender: 'girl',
      section: 'ANIME MAIDENS',
      skinPath: '/skins/girl/anime-girl-nezuko-chan.png',
      previewImage: '/skins/girl/anime-girl-nezuko-chan.png',
      description: 'Pink geometric kimono with bamboo mouthpiece.',
      owned: true
    },
    {
      id: 'girl_hinata',
      name: 'Hinata Hyuga Shinobi',
      character: 'Hinata',
      gender: 'girl',
      section: 'ANIME MAIDENS',
      skinPath: '/skins/girl/hinata-hyuga-naruto-shippuden-ninja-cute-girl-dandere-anime.png',
      previewImage: '/skins/girl/hinata-hyuga-naruto-shippuden-ninja-cute-girl-dandere-anime.png',
      description: 'Byakugan heiress lavender ninja jacket.',
      owned: true
    },
    {
      id: 'girl_himiko',
      name: 'Himiko Toga Vanguard',
      character: 'Himiko',
      gender: 'girl',
      section: 'ANIME MAIDENS',
      skinPath: '/skins/girl/himiko-toga-my-hero-academia-boku-no-hero-yandere-psycho-cute-girl-school-uniform-anime.png',
      previewImage: '/skins/girl/himiko-toga-my-hero-academia-boku-no-hero-yandere-psycho-cute-girl-school-uniform-anime.png',
      description: 'Cardigan uniform blonde twin buns rogue.',
      owned: true
    },
    {
      id: 'girl_ayano',
      name: 'Ayano High Scholar',
      character: 'Ayano',
      gender: 'girl',
      section: 'ANIME MAIDENS',
      skinPath: '/skins/girl/ayano-aishi-yandere-simulator-game-school-anime-cute-girl.png',
      previewImage: '/skins/girl/ayano-aishi-yandere-simulator-game-school-anime-cute-girl.png',
      description: 'Classic navy sailor suit diligent pupil.',
      owned: true
    },
    {
      id: 'girl_yuno',
      name: 'Yuno Gasai Starlight',
      character: 'Yuno',
      gender: 'girl',
      section: 'ANIME MAIDENS',
      skinPath: '/skins/girl/yuno-gasai-mirai-nikkifuture-diary-yandere-girl-middle-school-student-pink-cute-pretty-anime.png',
      previewImage: '/skins/girl/yuno-gasai-mirai-nikkifuture-diary-yandere-girl-middle-school-student-pink-cute-pretty-anime.png',
      description: 'Pink twintails future diary wielder.',
      owned: true
    },
    {
      id: 'girl_monika',
      name: 'Monika Literature Club',
      character: 'Monika',
      gender: 'girl',
      section: 'ANIME MAIDENS',
      skinPath: '/skins/girl/monika-doki-doki-literature-club-villain-yandere-girl-cute-video-game-high-school-uniform-anime.png',
      previewImage: '/skins/girl/monika-doki-doki-literature-club-villain-yandere-girl-cute-video-game-high-school-uniform-anime.png',
      description: 'Literature Club President coral blazer.',
      owned: true
    },
    {
      id: 'girl_sugar',
      name: 'Sugar Toy Princess',
      character: 'Sugar',
      gender: 'girl',
      section: 'ANIME MAIDENS',
      skinPath: '/skins/girl/sugar-one-piece-pirate-special-officer-queen-of-toys-loli-aquamarine-hair-red-cute-pretty-girl-anime.png',
      previewImage: '/skins/girl/sugar-one-piece-pirate-special-officer-queen-of-toys-loli-aquamarine-hair-red-cute-pretty-girl-anime.png',
      description: 'Red hooded cloak aquamarine hair princess.',
      owned: true
    },
    {
      id: 'girl_kawaii_cat',
      name: 'Kawaii Neko Maiden',
      character: 'Fay',
      gender: 'girl',
      section: 'ANIME MAIDENS',
      skinPath: '/skins/girl/kawaii-anime-cat-girl.png',
      previewImage: '/skins/girl/kawaii-anime-cat-girl.png',
      description: 'Charming pastel cat ears cute dress.',
      owned: true
    },
    {
      id: 'girl_cute_1',
      name: 'Casual Anime Girl',
      character: 'Nova',
      gender: 'girl',
      section: 'ANIME MAIDENS',
      skinPath: '/skins/girl/anime-cute-girl.png',
      previewImage: '/skins/girl/anime-cute-girl.png',
      description: 'Modern trendy pastel streetwear.',
      owned: true
    },
    {
      id: 'girl_cute_2',
      name: 'Sweet Violet Student',
      character: 'Zuri',
      gender: 'girl',
      section: 'ANIME MAIDENS',
      skinPath: '/skins/girl/cute-anime-girl.png',
      previewImage: '/skins/girl/cute-anime-girl.png',
      description: 'Violet accents stylish study uniform.',
      owned: true
    }
  ]
};

export interface VaultItem {
  id: string;
  name: string;
  category: 'wings' | 'armor' | 'aura' | 'weapon';
  rarity: 'mythic' | 'legendary' | 'royal';
  icon: string;
  previewColor: string;
  description: string;
  unlocked: boolean;
  modelProp?: {
    elytra?: string;
    accessory?: string;
  };
}

export const VAULT_ITEMS: VaultItem[] = [
  // 1. WINGS & CAPES
  {
    id: 'vault_netherite_wings',
    name: 'Netherite Dragon Wings',
    category: 'wings',
    rarity: 'mythic',
    icon: '🪽',
    previewColor: '#7C3AED',
    description: 'Forged in the Nether core, pulses with dark void flames.',
    unlocked: true,
    modelProp: { elytra: 'obsidian_wings' }
  },
  {
    id: 'vault_celestial_gold',
    name: 'Celestial Gold Cape',
    category: 'wings',
    rarity: 'legendary',
    icon: '✨',
    previewColor: '#F59E0B',
    description: 'Pure radiant gold woven by JAC Olympiad Champions.',
    unlocked: true,
    modelProp: { elytra: 'celestial_gold' }
  },
  {
    id: 'vault_elytra_phantom',
    name: 'Phantom Elytra Glider',
    category: 'wings',
    rarity: 'legendary',
    icon: '🦅',
    previewColor: '#06B6D4',
    description: 'Translucent phantom membrane with zero wind resistance.',
    unlocked: true,
    modelProp: { elytra: 'obsidian_wings' }
  },
  {
    id: 'vault_phoenix_cape',
    name: 'Phoenix Feather Cape',
    category: 'wings',
    rarity: 'mythic',
    icon: '🔥',
    previewColor: '#EF4444',
    description: 'Reborn from ashes of 100 consecutive study streak flames.',
    unlocked: true,
    modelProp: { elytra: 'celestial_gold' }
  },

  // 2. ARMOR & CROWNS
  {
    id: 'vault_royal_crown',
    name: 'Royal JAC Scholar Crown',
    category: 'armor',
    rarity: 'royal',
    icon: '👑',
    previewColor: '#FBBF24',
    description: 'The supreme crown of Grade 10 Diamond Rank 1.',
    unlocked: true,
    modelProp: { accessory: 'golden_crown' }
  },
  {
    id: 'vault_diamond_helm',
    name: 'Valkyrie Diamond Helm',
    category: 'armor',
    rarity: 'mythic',
    icon: '💎',
    previewColor: '#38BDF8',
    description: 'Unbreakable diamond headgear imbued with infinite focus.',
    unlocked: true,
    modelProp: { accessory: 'nerd_glasses' }
  },
  {
    id: 'vault_netherite_plate',
    name: 'Netherite Battle Pauldrons',
    category: 'armor',
    rarity: 'mythic',
    icon: '🛡️',
    previewColor: '#64748B',
    description: 'Heavy enchanted chestguard providing 100% exam shield.',
    unlocked: true,
    modelProp: { accessory: 'none' }
  },
  {
    id: 'vault_emerald_robes',
    name: 'Imperial Emerald Shrouds',
    category: 'armor',
    rarity: 'legendary',
    icon: '🌿',
    previewColor: '#10B981',
    description: 'Ancient robes symbolizing nature and botanical wisdom.',
    unlocked: true,
    modelProp: { accessory: 'none' }
  },

  // 3. PARTICLE AURAS
  {
    id: 'vault_stardust_aura',
    name: 'Golden Stardust Drift',
    category: 'aura',
    rarity: 'royal',
    icon: '⭐',
    previewColor: '#FACC15',
    description: 'Sparks of golden starlight trailing every motion.',
    unlocked: true
  },
  {
    id: 'vault_soul_fire',
    name: 'Soul Fire Sparks',
    category: 'aura',
    rarity: 'legendary',
    icon: '💠',
    previewColor: '#06B6D4',
    description: 'Mystic turquoise flames dancing around your scholar.',
    unlocked: true
  },
  {
    id: 'vault_sakura_petals',
    name: 'Cherry Blossom Petals',
    category: 'aura',
    rarity: 'legendary',
    icon: '🌸',
    previewColor: '#F472B6',
    description: 'Gentle pink blossom spiral for tranquil study zen.',
    unlocked: true
  },

  // 4. WEAPONS & RELICS
  {
    id: 'vault_diamond_sword',
    name: 'Diamond Exam Buster',
    category: 'weapon',
    rarity: 'legendary',
    icon: '⚔️',
    previewColor: '#38BDF8',
    description: 'Sharp diamond blade slicing through tricky MCQs.',
    unlocked: true
  },
  {
    id: 'vault_netherite_katana',
    name: 'Shadow Netherite Katana',
    category: 'weapon',
    rarity: 'mythic',
    icon: '🗡️',
    previewColor: '#818CF8',
    description: 'Swift single-stroke answer decider forged in midnight ore.',
    unlocked: true
  }
];

// Color & Item Palettes for 50+ Customization Options
export const SKIN_TONES = [
  { id: 'tan', name: 'Warm Tan (Steve)', color: '#C48A68' },
  { id: 'fair', name: 'Fair Peach (Alex)', color: '#F6BE9A' },
  { id: 'cocoa', name: 'Deep Cocoa (Ari)', color: '#603B2C' },
  { id: 'bronze', name: 'Olive Bronze (Makena)', color: '#B87854' },
  { id: 'golden', name: 'Golden Honey (Efe)', color: '#C98A65' },
  { id: 'dark', name: 'Rich Ebony (Zuri)', color: '#483025' },
  { id: 'alabaster', name: 'Pale Alabaster', color: '#FFE3D1' },
  { id: 'ender', name: 'Ender Shadow', color: '#2B2633' }
];

export const EYE_COLORS = [
  { id: 'blue', name: 'Minecraft Blue', color: '#2B4B8B' },
  { id: 'green', name: 'Emerald Green', color: '#10B981' },
  { id: 'purple', name: 'Amethyst Violet', color: '#8B5CF6' },
  { id: 'amber', name: 'Golden Amber', color: '#F59E0B' },
  { id: 'crimson', name: 'Redstone Crimson', color: '#EF4444' },
  { id: 'teal', name: 'Diamond Aqua', color: '#06B6D4' },
  { id: 'magenta', name: 'Ender Magenta', color: '#D946EF' },
  { id: 'white', name: 'Herobrine Glow', color: '#FFFFFF' }
];

export const HAIR_COLORS = [
  { id: 'espresso', name: 'Espresso Brown', color: '#382215' },
  { id: 'blonde', name: 'Golden Blonde', color: '#EAB308' },
  { id: 'ginger', name: 'Ginger Fire', color: '#C25D23' },
  { id: 'black', name: 'Pitch Obsidian', color: '#141416' },
  { id: 'cyan', name: 'Neon Diamond Cyan', color: '#06B6D4' },
  { id: 'violet', name: 'Royal Amethyst', color: '#7C3AED' },
  { id: 'crimson', name: 'Crimson Flame', color: '#DC2626' },
  { id: 'platinum', name: 'Platinum White', color: '#E2E8F0' }
];

export const SHIRTS = [
  { id: 'steve_cyan', name: 'Classic Cyan Tunic', color: '#00A8A8', trim: '#007A7A' },
  { id: 'alex_green', name: 'Explorer Lime Tunic', color: '#528E3A', trim: '#3B6829' },
  { id: 'creeper_hoodie', name: 'Creeper Green Top', color: '#44AA22', trim: '#225511' },
  { id: 'diamond_plate', name: 'Diamond Chestplate', color: '#38BDF8', trim: '#0284C7' },
  { id: 'netherite_plate', name: 'Netherite Armor', color: '#312B2B', trim: '#1C1917' },
  { id: 'royal_velvet', name: 'Royal Crimson Velvet', color: '#BE123C', trim: '#881337' },
  { id: 'gold_jacket', name: 'Golden Scholar Coat', color: '#EAB308', trim: '#CA8A04' },
  { id: 'cyber_glitch', name: 'Cyber Neon Grid', color: '#8B5CF6', trim: '#6D28D9' },
  { id: 'obsidian_plate', name: 'Royal Obsidian Mail', color: '#0F172A', trim: '#334155' }
];

export const PANTS = [
  { id: 'indigo_jeans', name: 'Classic Indigo Jeans', color: '#2C3A7A', trim: '#1D2754' },
  { id: 'hunter_brown', name: 'Hunter Cargo Trousers', color: '#4E382A', trim: '#37271D' },
  { id: 'carbon_black', name: 'Stealth Carbon Pants', color: '#18181B', trim: '#09090B' },
  { id: 'camo_combat', name: 'Emerald Camo Slacks', color: '#166534', trim: '#14532D' },
  { id: 'netherite_greaves', name: 'Netherite Leggings', color: '#2A2424', trim: '#1A1616' },
  { id: 'gold_trousers', name: 'Golden Embroidered Pants', color: '#B45309', trim: '#92400E' },
  { id: 'royal_obsidian', name: 'Obsidian Guard Pants', color: '#0B1120', trim: '#1E293B' },
  { id: 'white_joggers', name: 'Pure White Runners', color: '#E2E8F0', trim: '#CBD5E1' }
];

export const HOODIES = [
  { id: 'none', name: 'No Hoodie / Mantle', icon: '❌' },
  { id: 'creeper_hood', name: 'Creeper Face Hoodie', icon: '🟩', color: '#44AA22' },
  { id: 'ender_cape', name: 'Ender Shadow Cape', icon: '🌌', color: '#1E1B4B' },
  { id: 'fox_fur', name: 'Fox Fur Trim Mantle', icon: '🦊', color: '#EA580C' },
  { id: 'varsity', name: 'Royal Varsity Letterman', icon: '🎓', color: '#4338CA' },
  { id: 'obsidian_mantle', name: 'Obsidian Archmage Cloak', icon: '🛡️', color: '#0F172A' }
];

export const ELYTRA_WINGS = [
  { id: 'none', name: 'No Wings', icon: '❌' },
  { id: 'obsidian_wings', name: 'Obsidian Dark Elytra', icon: '🪶', color: '#1C1917', trim: '#44403C' },
  { id: 'dragon_glider', name: 'Ender Dragon Glider', icon: '🐉', color: '#3B0764', trim: '#C084FC' },
  { id: 'phoenix_wings', name: 'Phoenix Fire Glider', icon: '🔥', color: '#B91C1C', trim: '#F59E0B' },
  { id: 'celestial_gold', name: 'Celestial Golden Wings', icon: '✨', color: '#D97706', trim: '#FDE047' },
  { id: 'phantom_wings', name: 'Phantom Glider Wings', icon: '👻', color: '#0E7490', trim: '#67E8F9' }
];

export const SHOES = [
  { id: 'grey_sneaker', name: 'Classic Grey Boots', color: '#6B7280', sole: '#374151' },
  { id: 'diamond_boots', name: 'Diamond Encrusted Boots', color: '#38BDF8', sole: '#0284C7' },
  { id: 'gold_boots', name: 'Gilded Gold Sabatons', color: '#FACC15', sole: '#CA8A04' },
  { id: 'netherite_boots', name: 'Heavy Netherite Stompers', color: '#2E2828', sole: '#171414' },
  { id: 'red_converse', name: 'Red Converse Sneakers', color: '#EF4444', sole: '#FFFFFF' },
  { id: 'obsidian_runners', name: 'Obsidian Runners', color: '#090D16', sole: '#3B82F6' },
  { id: 'leather_boots', name: 'Crafted Leather Boots', color: '#78350F', sole: '#451A03' }
];

export const ACCESSORIES = [
  { id: 'none', name: 'No Headgear / Accessory', icon: '❌' },
  { id: 'golden_crown', name: 'Royal Golden Crown', icon: '👑', color: '#FBBF24' },
  { id: 'nerd_glasses', name: 'Scholar Glasses', icon: '👓', color: '#1E293B' },
  { id: 'headband', name: 'Shinobi Ninja Headband', icon: '🥷', color: '#DC2626' },
  { id: 'diamond_sword', name: 'Diamond Longsword (Back)', icon: '🗡️', color: '#38BDF8' },
  { id: 'trophy', name: 'Golden Champion Trophy', icon: '🏆', color: '#F59E0B' }
];
