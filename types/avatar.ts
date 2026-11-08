export type CharacterPresetId =
  | 'kai'
  | 'jax'
  | 'otis'
  | 'zane'
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
  defaultCustomization: AvatarCustomization;
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
      skinPath: '/skins/boy/minecraft-skins.png'
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
      skinPath: '/skins/boy/anime-purple-mask-boy-galactic.png'
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
      skinPath: '/skins/boy/kid-kakashi-minecraft-skin.png'
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
      skinPath: '/skins/boy/sasuke-uchiha-naruto-shippuden-hero-rogue-ninja-sharingan-boy-anime.png'
    }
  },
  {
    id: 'ayo',
    name: 'Ayo',
    gender: 'boy',
    title: 'Grand Champion',
    role: 'All-Rounder JAC Rank 1',
    icon: '👑',
    headSvg: '/avatars/steve.svg',
    defaultCustomization: {
      preset: 'ayo',
      name: 'Ayo',
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
      skinPath: '/skins/boy/goku-ultra-instinto-perfecto.png'
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
      skinPath: '/skins/girl/anime-girl-nezuko-chan.png'
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
      skinPath: '/skins/girl/mori-calliope-hololive-em-reaper-rapper-new-outfit-pink-hair-cute-pretty-girl-jacket-sneakers-earrings-necklace-detalis-anime.png'
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
      skinPath: '/skins/girl/anime-hd-girl-green.png'
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
      skinPath: '/skins/girl/rei-ayanami-neon-genesis-evangelion-evangelion-pilot-kuudere-white-pale-blue-hair-pretty-cute-girl-anime.png'
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
      skinPath: '/skins/girl/nami-one-piece.png'
    }
  },

  // Legacy Presets for backward compatibility
  {
    id: 'steve',
    name: 'Steve',
    gender: 'boy',
    title: 'The Classic Pioneer',
    role: 'Diamond Miner & Royal Crafter',
    icon: '⛏️',
    headSvg: '/avatars/steve.svg',
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

// 40 Preloaded Bundles (20 Boys + 20 Girls)
export const BOY_BUNDLES: Record<string, BundleItem[]> = {
  'Section 1: Shonen Legends': [
    {
      id: 'boy_goku',
      name: 'Goku Ultra Instinct',
      character: 'Goku',
      gender: 'boy',
      section: 'Shonen Legends',
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
      section: 'Shonen Legends',
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
      section: 'Shonen Legends',
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
      section: 'Shonen Legends',
      skinPath: '/skins/boy/tanjiro-kamado-demon-slayer-kimetsu-no-yaiba-anime.png',
      previewImage: '/skins/boy/tanjiro-kamado-demon-slayer-kimetsu-no-yaiba-anime.png',
      description: 'Green checkered haori demon slayer uniform.',
      owned: true
    },
    {
      id: 'boy_zenitsu',
      name: 'Zenitsu Thunder',
      character: 'Zenitsu',
      gender: 'boy',
      section: 'Shonen Legends',
      skinPath: '/skins/boy/zenitsu-agastuma-demon-slayer-kimetsu-no-yaiba-anime.png',
      previewImage: '/skins/boy/zenitsu-agastuma-demon-slayer-kimetsu-no-yaiba-anime.png',
      description: 'Yellow triangle thunder haori lightning blade.',
      owned: true
    }
  ],
  'Section 2: Dark & Mystic': [
    {
      id: 'boy_levi',
      name: 'Levi Ackerman',
      character: 'Levi',
      gender: 'boy',
      section: 'Dark & Mystic',
      skinPath: '/skins/boy/levi-ackerman-attack-on-titan-hero-survey-corps-humanitys-strongest-soldier-captain-assassin-cute-boy-anime.png',
      previewImage: '/skins/boy/levi-ackerman-attack-on-titan-hero-survey-corps-humanitys-strongest-soldier-captain-assassin-cute-boy-anime.png',
      description: 'Survey Corps Captain humanity strongest soldier.',
      owned: true
    },
    {
      id: 'boy_light',
      name: 'Light Yagami',
      character: 'Light',
      gender: 'boy',
      section: 'Dark & Mystic',
      skinPath: '/skins/boy/light-yagamikira-death-note-villain-killer-god-raito-yagami-khaki-blazer-boy-cute-anime.png',
      previewImage: '/skins/boy/light-yagamikira-death-note-villain-killer-god-raito-yagami-khaki-blazer-boy-cute-anime.png',
      description: 'Khaki school blazer genius scholar.',
      owned: true
    },
    {
      id: 'boy_madara',
      name: 'Madara Uchiha',
      character: 'Madara',
      gender: 'boy',
      section: 'Dark & Mystic',
      skinPath: '/skins/boy/madara-uchiha.png',
      previewImage: '/skins/boy/madara-uchiha.png',
      description: 'Crimson battle armor legendary shinobi.',
      owned: true
    },
    {
      id: 'boy_sasuke',
      name: 'Sasuke Uchiha',
      character: 'Sasuke',
      gender: 'boy',
      section: 'Dark & Mystic',
      skinPath: '/skins/boy/sasuke-uchiha-naruto-shippuden-hero-rogue-ninja-sharingan-boy-anime.png',
      previewImage: '/skins/boy/sasuke-uchiha-naruto-shippuden-hero-rogue-ninja-sharingan-boy-anime.png',
      description: 'Rogue ninja purple rope sharingan warrior.',
      owned: true
    },
    {
      id: 'boy_zoro',
      name: 'Roronoa Zoro',
      character: 'Zoro',
      gender: 'boy',
      section: 'Dark & Mystic',
      skinPath: '/skins/boy/roronoa-zoro-one-piece-pirate-hunter-swordsman-swords-man-zolo-green-hair-boy-anime.png',
      previewImage: '/skins/boy/roronoa-zoro-one-piece-pirate-hunter-swordsman-swords-man-zolo-green-hair-boy-anime.png',
      description: 'Three-sword style green hair pirate hunter.',
      owned: true
    }
  ],
  'Section 3: Street & Cyber': [
    {
      id: 'boy_purple_mask',
      name: 'Galactic Mask Boy',
      character: 'Kai',
      gender: 'boy',
      section: 'Street & Cyber',
      skinPath: '/skins/boy/anime-purple-mask-boy-galactic.png',
      previewImage: '/skins/boy/anime-purple-mask-boy-galactic.png',
      description: 'Purple holographic mask cyberpunk streetwear.',
      owned: true
    },
    {
      id: 'boy_ben10',
      name: 'Ben 10 Omniverse',
      character: 'Ben',
      gender: 'boy',
      section: 'Street & Cyber',
      skinPath: '/skins/boy/ben10-omniverse.png',
      previewImage: '/skins/boy/ben10-omniverse.png',
      description: 'Green stripe jacket Omnitrix wielder.',
      owned: true
    },
    {
      id: 'boy_kakashi',
      name: 'Kid Kakashi',
      character: 'Kakashi',
      gender: 'boy',
      section: 'Street & Cyber',
      skinPath: '/skins/boy/kid-kakashi-minecraft-skin.png',
      previewImage: '/skins/boy/kid-kakashi-minecraft-skin.png',
      description: 'White fang junior shinobi with face mask.',
      owned: true
    },
    {
      id: 'boy_baki',
      name: 'Baki Fighter',
      character: 'Baki',
      gender: 'boy',
      section: 'Street & Cyber',
      skinPath: '/skins/boy/baki.png',
      previewImage: '/skins/boy/baki.png',
      description: 'Underground champion battle-scarred fighter.',
      owned: true
    },
    {
      id: 'boy_skullwar',
      name: 'Skullwar Cyber',
      character: 'Skullwar',
      gender: 'boy',
      section: 'Street & Cyber',
      skinPath: '/skins/boy/skullwar.png',
      previewImage: '/skins/boy/skullwar.png',
      description: 'Obsidian tactical skull armor.',
      owned: true
    }
  ],
  'Section 4: Classic Voxel': [
    {
      id: 'boy_cute_1',
      name: 'Cute Anime Boy',
      character: 'Jax',
      gender: 'boy',
      section: 'Classic Voxel',
      skinPath: '/skins/boy/cute-anime-boy.png',
      previewImage: '/skins/boy/cute-anime-boy.png',
      description: 'Casual modern school boy jacket.',
      owned: true
    },
    {
      id: 'boy_cute_2',
      name: 'Cyber Hoodie Boy',
      character: 'Zane',
      gender: 'boy',
      section: 'Classic Voxel',
      skinPath: '/skins/boy/cute-anime-boy-2.png',
      previewImage: '/skins/boy/cute-anime-boy-2.png',
      description: 'Oversized cozy gamer hoodie.',
      owned: true
    },
    {
      id: 'boy_cudey',
      name: 'Cudey Casual',
      character: 'Otis',
      gender: 'boy',
      section: 'Classic Voxel',
      skinPath: '/skins/boy/cudey.png',
      previewImage: '/skins/boy/cudey.png',
      description: 'Pastel comfortable study outfit.',
      owned: true
    },
    {
      id: 'boy_gojo',
      name: 'Gojo Satoru',
      character: 'Gojo',
      gender: 'boy',
      section: 'Classic Voxel',
      skinPath: '/skins/boy/gojo.png',
      previewImage: '/skins/boy/gojo.png',
      description: 'Blindfold jujutsu high sorcerer black uniform.',
      owned: true
    },
    {
      id: 'boy_steve_classic',
      name: 'Steve Classic Miner',
      character: 'Steve',
      gender: 'boy',
      section: 'Classic Voxel',
      skinPath: '/skins/boy/minecraft-skins.png',
      previewImage: '/skins/boy/minecraft-skins.png',
      description: 'Iconic classic Minecraft pioneer miner skin.',
      owned: true
    }
  ]
};

export const GIRL_BUNDLES: Record<string, BundleItem[]> = {
  'Section 1: Heroines & Guardians': [
    {
      id: 'girl_albedo',
      name: 'Albedo Guardian',
      character: 'Albedo',
      gender: 'girl',
      section: 'Heroines & Guardians',
      skinPath: '/skins/girl/albedo-overlord-succubus-demon-guardian-overseer-white-dress-cute-pretty-girl-anime.png',
      previewImage: '/skins/girl/albedo-overlord-succubus-demon-guardian-overseer-white-dress-cute-pretty-girl-anime.png',
      description: 'Great Tomb overseer elegant pure white gown.',
      owned: true
    },
    {
      id: 'girl_hinata',
      name: 'Hinata Hyuga',
      character: 'Hinata',
      gender: 'girl',
      section: 'Heroines & Guardians',
      skinPath: '/skins/girl/hinata-hyuga-naruto-shippuden-ninja-cute-girl-dandere-anime.png',
      previewImage: '/skins/girl/hinata-hyuga-naruto-shippuden-ninja-cute-girl-dandere-anime.png',
      description: 'Byakugan heiress lavender ninja jacket.',
      owned: true
    },
    {
      id: 'girl_nezuko',
      name: 'Nezuko Chan',
      character: 'Nezuko',
      gender: 'girl',
      section: 'Heroines & Guardians',
      skinPath: '/skins/girl/anime-girl-nezuko-chan.png',
      previewImage: '/skins/girl/anime-girl-nezuko-chan.png',
      description: 'Pink geometric kimono with bamboo mouthpiece.',
      owned: true
    },
    {
      id: 'girl_sakura',
      name: 'Sakura Haruno',
      character: 'Sakura',
      gender: 'girl',
      section: 'Heroines & Guardians',
      skinPath: '/skins/girl/sakura-haruno-naruto-shippuden-medical-ninja-pink-girl-pretty-cute-anime.png',
      previewImage: '/skins/girl/sakura-haruno-naruto-shippuden-medical-ninja-pink-girl-pretty-cute-anime.png',
      description: 'Medical ninja red top pink hair warrior.',
      owned: true
    },
    {
      id: 'girl_konan',
      name: 'Konan Angel',
      character: 'Konan',
      gender: 'girl',
      section: 'Heroines & Guardians',
      skinPath: '/skins/girl/konan-naruto-shippuden-villain-ninja-akatsuki-angel-purple-light-blue-hair-cute-pretty-girl-anime.png',
      previewImage: '/skins/girl/konan-naruto-shippuden-villain-ninja-akatsuki-angel-purple-light-blue-hair-cute-pretty-girl-anime.png',
      description: 'Origami angel Akatsuki cloak and paper blossom.',
      owned: true
    }
  ],
  'Section 2: Anime Cool & Kawaii': [
    {
      id: 'girl_cat_hd',
      name: 'Anime Cat Girl HD',
      character: 'Mia',
      gender: 'girl',
      section: 'Anime Cool & Kawaii',
      skinPath: '/skins/girl/anime-cat-girl-hd-not-mine-copy.png',
      previewImage: '/skins/girl/anime-cat-girl-hd-not-mine-copy.png',
      description: 'High definition feline ears and stylish aesthetic.',
      owned: true
    },
    {
      id: 'girl_cat_kawaii',
      name: 'Kawaii Cat Girl',
      character: 'Nova',
      gender: 'girl',
      section: 'Anime Cool & Kawaii',
      skinPath: '/skins/girl/kawaii-anime-cat-girl.png',
      previewImage: '/skins/girl/kawaii-anime-cat-girl.png',
      description: 'Sweet pastel cat ears gamer outfit.',
      owned: true
    },
    {
      id: 'girl_cute_anime',
      name: 'Cute Anime Girl',
      character: 'Elis',
      gender: 'girl',
      section: 'Anime Cool & Kawaii',
      skinPath: '/skins/girl/anime-cute-girl.png',
      previewImage: '/skins/girl/anime-cute-girl.png',
      description: 'Modern Japanese streetwear and cute bows.',
      owned: true
    },
    {
      id: 'girl_pastel_sailor',
      name: 'Pastel Sailor Girl',
      character: 'Zara',
      gender: 'girl',
      section: 'Anime Cool & Kawaii',
      skinPath: '/skins/girl/cute-anime-girl.png',
      previewImage: '/skins/girl/cute-anime-girl.png',
      description: 'Classic high school pleated skirt sailor uniform.',
      owned: true
    },
    {
      id: 'girl_emerald_green',
      name: 'Emerald Anime Girl',
      character: 'Fay',
      gender: 'girl',
      section: 'Anime Cool & Kawaii',
      skinPath: '/skins/girl/anime-hd-girl-green.png',
      previewImage: '/skins/girl/anime-hd-girl-green.png',
      description: 'Forest emerald green tones and clover accents.',
      owned: true
    }
  ],
  'Section 3: Adventure & Legends': [
    {
      id: 'girl_rockypanda',
      name: 'Sweet Panda Girl',
      character: 'Nova',
      gender: 'girl',
      section: 'Adventure & Legends',
      skinPath: '/skins/girl/xrockypanda-sweet-anime-girl.png',
      previewImage: '/skins/girl/xrockypanda-sweet-anime-girl.png',
      description: 'Panda ears cozy hoodie sweet traveler.',
      owned: true
    },
    {
      id: 'girl_nami',
      name: 'Nami Navigator',
      character: 'Nami',
      gender: 'girl',
      section: 'Adventure & Legends',
      skinPath: '/skins/girl/nami-one-piece.png',
      previewImage: '/skins/girl/nami-one-piece.png',
      description: 'Cat burglar navigator orange hair explorer.',
      owned: true
    },
    {
      id: 'girl_robin',
      name: 'Nico Robin',
      character: 'Robin',
      gender: 'girl',
      section: 'Adventure & Legends',
      skinPath: '/skins/girl/nico-robinrobiland-one-piece-devil-child-pirate-assassin-pretty-cute-girl-anime.png',
      previewImage: '/skins/girl/nico-robinrobiland-one-piece-devil-child-pirate-assassin-pretty-cute-girl-anime.png',
      description: 'Archaeologist scholar elegant sunglasses look.',
      owned: true
    },
    {
      id: 'girl_himiko',
      name: 'Himiko Toga',
      character: 'Toga',
      gender: 'girl',
      section: 'Adventure & Legends',
      skinPath: '/skins/girl/himiko-toga-my-hero-academia-boku-no-hero-yandere-psycho-cute-girl-school-uniform-anime.png',
      previewImage: '/skins/girl/himiko-toga-my-hero-academia-boku-no-hero-yandere-psycho-cute-girl-school-uniform-anime.png',
      description: 'Beige cardigan messy buns school uniform.',
      owned: true
    },
    {
      id: 'girl_sugar',
      name: 'Sugar Pirate',
      character: 'Sugar',
      gender: 'girl',
      section: 'Adventure & Legends',
      skinPath: '/skins/girl/sugar-one-piece-pirate-special-officer-queen-of-toys-loli-aquamarine-hair-red-cute-pretty-girl-anime.png',
      previewImage: '/skins/girl/sugar-one-piece-pirate-special-officer-queen-of-toys-loli-aquamarine-hair-red-cute-pretty-girl-anime.png',
      description: 'Red hooded cape royal toy master.',
      owned: true
    }
  ],
  'Section 4: Psychological & Classic': [
    {
      id: 'girl_mori',
      name: 'Mori Calliope',
      character: 'Mori',
      gender: 'girl',
      section: 'Psychological & Classic',
      skinPath: '/skins/girl/mori-calliope-hololive-em-reaper-rapper-new-outfit-pink-hair-cute-pretty-girl-jacket-sneakers-earrings-necklace-detalis-anime.png',
      previewImage: '/skins/girl/mori-calliope-hololive-em-reaper-rapper-new-outfit-pink-hair-cute-pretty-girl-jacket-sneakers-earrings-necklace-detalis-anime.png',
      description: 'Underworld reaper pink hair stylish rapper.',
      owned: true
    },
    {
      id: 'girl_ayano',
      name: 'Ayano Aishi',
      character: 'Ayano',
      gender: 'girl',
      section: 'Psychological & Classic',
      skinPath: '/skins/girl/ayano-aishi-yandere-simulator-game-school-anime-cute-girl.png',
      previewImage: '/skins/girl/ayano-aishi-yandere-simulator-game-school-anime-cute-girl.png',
      description: 'Akademi High navy blue school uniform.',
      owned: true
    },
    {
      id: 'girl_monika',
      name: 'Monika Club Leader',
      character: 'Monika',
      gender: 'girl',
      section: 'Psychological & Classic',
      skinPath: '/skins/girl/monika-doki-doki-literature-club-villain-yandere-girl-cute-video-game-high-school-uniform-anime.png',
      previewImage: '/skins/girl/monika-doki-doki-literature-club-villain-yandere-girl-cute-video-game-high-school-uniform-anime.png',
      description: 'Literature Club President white hair ribbon.',
      owned: true
    },
    {
      id: 'girl_rei',
      name: 'Rei Ayanami',
      character: 'Rei',
      gender: 'girl',
      section: 'Psychological & Classic',
      skinPath: '/skins/girl/rei-ayanami-neon-genesis-evangelion-evangelion-pilot-kuudere-white-pale-blue-hair-pretty-cute-girl-anime.png',
      previewImage: '/skins/girl/rei-ayanami-neon-genesis-evangelion-evangelion-pilot-kuudere-white-pale-blue-hair-pretty-cute-girl-anime.png',
      description: 'Unit-00 pilot white plugsuit and pale blue hair.',
      owned: true
    },
    {
      id: 'girl_yuno',
      name: 'Yuno Gasai',
      character: 'Yuno',
      gender: 'girl',
      section: 'Psychological & Classic',
      skinPath: '/skins/girl/yuno-gasai-mirai-nikkifuture-diary-yandere-girl-middle-school-student-pink-cute-pretty-anime.png',
      previewImage: '/skins/girl/yuno-gasai-mirai-nikkifuture-diary-yandere-girl-middle-school-student-pink-cute-pretty-anime.png',
      description: 'Pink pigtails future diary holder.',
      owned: true
    }
  ]
};

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
