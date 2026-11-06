export type CharacterPresetId =
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
}

export interface PresetConfig {
  id: CharacterPresetId;
  name: string;
  title: string;
  role: string;
  icon: string;
  headSvg: string;
  defaultCustomization: AvatarCustomization;
}

export const CHARACTER_PRESETS: PresetConfig[] = [
  {
    id: 'steve',
    name: 'Steve',
    title: 'The Classic Pioneer',
    role: 'Diamond Miner & Royal Crafter',
    icon: '⛏️',
    headSvg: '/avatars/steve.svg',
    defaultCustomization: {
      preset: 'steve',
      name: 'Steve',
      skinTone: '#C48A68',
      eyeColor: '#2B4B8B',
      hairStyle: 'classic',
      hairColor: '#382215',
      shirt: 'steve_cyan',
      pants: 'indigo_jeans',
      hoodie: 'none',
      elytra: 'none',
      shoes: 'grey_sneaker',
      accessory: 'none'
    }
  },
  {
    id: 'alex',
    name: 'Alex',
    title: 'Wilderness Explorer',
    role: 'Survivalist & Geometry Master',
    icon: '🏹',
    headSvg: '/avatars/alex.svg',
    defaultCustomization: {
      preset: 'alex',
      name: 'Alex',
      skinTone: '#F6BE9A',
      eyeColor: '#2E8B57',
      hairStyle: 'braid',
      hairColor: '#C25D23',
      shirt: 'alex_green',
      pants: 'hunter_brown',
      hoodie: 'none',
      elytra: 'obsidian_wings',
      shoes: 'leather_boots',
      accessory: 'none'
    }
  },
  {
    id: 'noor',
    name: 'Noor',
    title: 'Redstone Savant',
    role: 'Logic & Physics Engineer',
    icon: '⚡',
    headSvg: '/avatars/noor.svg',
    defaultCustomization: {
      preset: 'noor',
      name: 'Noor',
      skinTone: '#82533F',
      eyeColor: '#4E3127',
      hairStyle: 'classic',
      hairColor: '#1A1829',
      shirt: 'netherite_plate',
      pants: 'carbon_black',
      hoodie: 'none',
      elytra: 'none',
      shoes: 'netherite_boots',
      accessory: 'nerd_glasses'
    }
  },
  {
    id: 'sunny',
    name: 'Sunny',
    title: 'Botanist Scholar',
    role: 'Biology & Environmental Chemist',
    icon: '🌱',
    headSvg: '/avatars/sunny.svg',
    defaultCustomization: {
      preset: 'sunny',
      name: 'Sunny',
      skinTone: '#DCA27C',
      eyeColor: '#264E36',
      hairStyle: 'curly',
      hairColor: '#382215',
      shirt: 'gold_jacket',
      pants: 'hunter_brown',
      hoodie: 'none',
      elytra: 'none',
      shoes: 'grey_sneaker',
      accessory: 'none'
    }
  },
  {
    id: 'ari',
    name: 'Ari',
    title: 'Dungeon Raider',
    role: 'History & Civics Strategist',
    icon: '⚔️',
    headSvg: '/avatars/ari.svg',
    defaultCustomization: {
      preset: 'ari',
      name: 'Ari',
      skinTone: '#603B2C',
      eyeColor: '#3D251D',
      hairStyle: 'braid',
      hairColor: '#752A18',
      shirt: 'royal_velvet',
      pants: 'indigo_jeans',
      hoodie: 'none',
      elytra: 'phoenix_wings',
      shoes: 'red_converse',
      accessory: 'none'
    }
  },
  {
    id: 'zuri',
    name: 'Zuri',
    title: 'Obsidian Crafter',
    role: 'Number Systems & Algebra Tactician',
    icon: '🛡️',
    headSvg: '/avatars/zuri.svg',
    defaultCustomization: {
      preset: 'zuri',
      name: 'Zuri',
      skinTone: '#483025',
      eyeColor: '#5C3A21',
      hairStyle: 'ponytail',
      hairColor: '#111116',
      shirt: 'creeper_hoodie',
      pants: 'camo_combat',
      hoodie: 'creeper_hood',
      elytra: 'none',
      shoes: 'obsidian_runners',
      accessory: 'none'
    }
  },
  {
    id: 'makena',
    name: 'Makena',
    title: 'Golden Alchemist',
    role: 'Organic Chemistry & Literature',
    icon: '✨',
    headSvg: '/avatars/makena.svg',
    defaultCustomization: {
      preset: 'makena',
      name: 'Makena',
      skinTone: '#B87854',
      eyeColor: '#6D28D9',
      hairStyle: 'curly',
      hairColor: '#86557E',
      shirt: 'cyber_glitch',
      pants: 'gold_trousers',
      hoodie: 'none',
      elytra: 'celestial_gold',
      shoes: 'gold_boots',
      accessory: 'golden_crown'
    }
  },
  {
    id: 'efe',
    name: 'Efe',
    title: 'Nether Vanguard',
    role: 'Trigonometry & Speed Drill Champion',
    icon: '👑',
    headSvg: '/avatars/efe.svg',
    defaultCustomization: {
      preset: 'efe',
      name: 'Efe',
      skinTone: '#C98A65',
      eyeColor: '#0D9488',
      hairStyle: 'spiky',
      hairColor: '#4C1D95',
      shirt: 'diamond_plate',
      pants: 'royal_obsidian',
      hoodie: 'ender_cape',
      elytra: 'dragon_glider',
      shoes: 'diamond_boots',
      accessory: 'golden_crown'
    }
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
