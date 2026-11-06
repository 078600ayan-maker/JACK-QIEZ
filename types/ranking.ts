export interface OreTier {
  id: string;
  name: string;
  title: string;
  minXp: number;
  iconSvg: string;
  color: string;
  glowColor: string;
  badgeBorder: string;
  unlockedByDefault: boolean;
  lore: string;
  rewardTitle: string;
  cosmeticReward: string;
}

export const ORE_TIERS: OreTier[] = [
  {
    id: 'coal',
    name: 'Coal Ore',
    title: 'Novice Scholar',
    minXp: 0,
    iconSvg: '/ores/coal.svg',
    color: '#3F3F46',
    glowColor: '#71717A',
    badgeBorder: '#52525B',
    unlockedByDefault: true,
    lore: 'The bedrock foundation of every JAC scholar. Common yet combustive fuel for late-night exam revisions.',
    rewardTitle: 'Wooden Pickaxe & Torch',
    cosmeticReward: 'Basic Steve / Alex Tunics'
  },
  {
    id: 'copper',
    name: 'Copper Ore',
    title: 'Apprentice Crafter',
    minXp: 500,
    iconSvg: '/ores/copper.svg',
    color: '#C27C5A',
    glowColor: '#F7A77E',
    badgeBorder: '#E08D64',
    unlockedByDefault: false,
    lore: 'Conductive and malleable. Forges the early lightning rods of mental speed and rapid revision.',
    rewardTitle: 'Lightning Rod Badge',
    cosmeticReward: 'Explorer Orange Overalls'
  },
  {
    id: 'iron',
    name: 'Iron Ingot',
    title: 'Iron Defender',
    minXp: 1200,
    iconSvg: '/ores/iron.svg',
    color: '#D1D5DB',
    glowColor: '#FFFFFF',
    badgeBorder: '#9CA3AF',
    unlockedByDefault: false,
    lore: 'Hardened under intense metallurgical pressure. A student who has withstood 10+ chapter drills without cracking.',
    rewardTitle: 'Iron Anvil & Shield',
    cosmeticReward: 'Iron Plated Armor & Greaves'
  },
  {
    id: 'gold',
    name: 'Gold Ingot',
    title: 'Golden Alchemist',
    minXp: 2500,
    iconSvg: '/ores/gold.svg',
    color: '#FACC15',
    glowColor: '#FEF08A',
    badgeBorder: '#EAB308',
    unlockedByDefault: false,
    lore: 'Lustrous, rare, and deeply coveted. Golden apples and clockwork precision for Class 10 top marks.',
    rewardTitle: 'Golden Apple Boost (+20% XP)',
    cosmeticReward: 'Golden Gilded Coat & Sabatons'
  },
  {
    id: 'redstone',
    name: 'Redstone Dust',
    title: 'Redstone Engineer',
    minXp: 4000,
    iconSvg: '/ores/redstone.svg',
    color: '#EF4444',
    glowColor: '#FCA5A5',
    badgeBorder: '#DC2626',
    unlockedByDefault: false,
    lore: 'Pulsing with infinite electrical logic. Masters who solve complex Mathematics and Science circuit numericals in seconds.',
    rewardTitle: 'Redstone Repeater Speed Drill',
    cosmeticReward: 'Crimson Flame Cape & Glasses'
  },
  {
    id: 'lapis',
    name: 'Lapis Lazuli',
    title: 'Enchanted Scholar',
    minXp: 6500,
    iconSvg: '/ores/lapis.svg',
    color: '#2563EB',
    glowColor: '#93C5FD',
    badgeBorder: '#3B82F6',
    unlockedByDefault: false,
    lore: 'The deep blue mystic mineral used at the Enchantment Table. Imbues knowledge with Unbreaking III focus.',
    rewardTitle: 'Enchanted Book of Wisdom',
    cosmeticReward: 'Mystic Obsidian Archmage Robes'
  },
  {
    id: 'diamond',
    name: 'Diamond Gem',
    title: 'Master Diamond',
    minXp: 10000,
    iconSvg: '/ores/diamond.svg',
    color: '#38BDF8',
    glowColor: '#BAE6FD',
    badgeBorder: '#0284C7',
    unlockedByDefault: false,
    lore: 'Formed at Y=-58 deep underground under volcanic heat. Unbreakable brilliance ranking in the top 5% across Jharkhand.',
    rewardTitle: 'Diamond Pickaxe Trophy',
    cosmeticReward: 'Diamond Chestplate & Encrusted Boots'
  },
  {
    id: 'emerald',
    name: 'Emerald Gem',
    title: 'Village Grandmaster',
    minXp: 15000,
    iconSvg: '/ores/emerald.svg',
    color: '#10B981',
    glowColor: '#A7F3D0',
    badgeBorder: '#059669',
    unlockedByDefault: false,
    lore: 'The rarest single ore in mountainous biomes. Revered by all scholars for flawless academic trades and 100% accuracy.',
    rewardTitle: 'Grandmaster Hero of Village Banner',
    cosmeticReward: 'Emerald Camo Slacks & Laurel'
  },
  {
    id: 'amethyst',
    name: 'Amethyst Shard',
    title: 'Crystal Vanguard',
    minXp: 22000,
    iconSvg: '/ores/amethyst.svg',
    color: '#A855F7',
    glowColor: '#E9D5FF',
    badgeBorder: '#7E22CE',
    unlockedByDefault: false,
    lore: 'Harmonic ringing crystals harvested inside deep geodes. Resonates with peerless clarity under examination pressure.',
    rewardTitle: 'Spyglass of Clairvoyance',
    cosmeticReward: 'Lilac Locks & Royal Amethyst Armor'
  },
  {
    id: 'netherite',
    name: 'Netherite Ingot',
    title: 'Immortal God Tier',
    minXp: 32000,
    iconSvg: '/ores/netherite.svg',
    color: '#716060',
    glowColor: '#C4B5A5',
    badgeBorder: '#443A3A',
    unlockedByDefault: false,
    lore: 'Forged from ancient debris in the fiery Nether depths. Floats on lava, indestructible, the absolute pinnacle of Jack Quiz.',
    rewardTitle: 'Crown of the Ancient Debris',
    cosmeticReward: 'Full Netherite Armor, Dragon Glider & Crown'
  }
];

export function getUserCurrentOreTier(xp: number): OreTier {
  let highestTier = ORE_TIERS[0];
  for (const tier of ORE_TIERS) {
    if (xp >= tier.minXp) {
      highestTier = tier;
    } else {
      break;
    }
  }
  return highestTier;
}

export function getNextOreTier(xp: number): OreTier | null {
  for (const tier of ORE_TIERS) {
    if (xp < tier.minXp) {
      return tier;
    }
  }
  return null;
}
