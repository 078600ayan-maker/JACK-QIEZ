import fs from 'fs';
import path from 'path';

const ORES_DIR = path.resolve('public/ores');
if (!fs.existsSync(ORES_DIR)) {
  fs.mkdirSync(ORES_DIR, { recursive: true });
}

// Ingot pixel layout (16x16 standard Minecraft ingot shape)
// . = transparent
// B = outline border (darkest)
// H = highlight (brightest)
// M = main mid tone
// D = dark shadow
// S = secondary shadow
const INGOT_MAP = [
  '................',
  '................',
  '................',
  '.....BBBBBB.....',
  '....BHHHHHMB....',
  '...BHM....MMB...',
  '..BHM..MM..MMB..',
  '..BHM.MMMM.MMB..',
  '..BHMMMMMM.DDB..',
  '..BDDMMMM..DDB..',
  '...BDD....DDB...',
  '....BDDDDDDB....',
  '.....BBBBBB.....',
  '................',
  '................',
  '................'
];

// Block / Crystal Ore Matrix (16x16)
const ORE_BLOCK_MAP = [
  'BBBBBBBBBBBBBBBB',
  'BHHHHHHHHHHHHHMB',
  'BHM..CC....CC.MB',
  'BHM.CCCC..CCCCMB',
  'BHM..CC....CC.MB',
  'BHM...........MB',
  'BHM....CCCC...MB',
  'BHM...CCCCCC..MB',
  'BHM....CCCC...MB',
  'BHM...........MB',
  'BHM..CC...CC..MB',
  'BHM.CCCC.CCCC.MB',
  'BHM..CC...CC..MB',
  'BMMMMMMMMMMMMMMB',
  'BDDDDDDDDDDDDDDB',
  'BBBBBBBBBBBBBBBB'
];

// Exact Minecraft color palettes for each tier
const PALETTES = {
  coal: {
    name: 'Coal Ore',
    tier: 'Tier I - Novice Miner',
    xp: 0,
    color: '#262626',
    glow: '#525252',
    B: '#0D0D0D',
    H: '#525252',
    M: '#262626',
    D: '#141414',
    S: '#0A0A0A',
    C: '#3F3F46'
  },
  copper: {
    name: 'Copper Ore',
    tier: 'Tier II - Copper Crafter',
    xp: 500,
    color: '#C27C5A',
    glow: '#E08D64',
    B: '#4A2818',
    H: '#F7A77E',
    M: '#C27C5A',
    D: '#8E482D',
    S: '#68331E',
    C: '#2DD4BF'
  },
  iron: {
    name: 'Iron Ingot',
    tier: 'Tier III - Iron Crafter',
    xp: 1200,
    color: '#D8D8D8',
    glow: '#F3F4F6',
    B: '#4B5563',
    H: '#FFFFFF',
    M: '#D1D5DB',
    D: '#9CA3AF',
    S: '#6B7280',
    C: '#F3F4F6'
  },
  gold: {
    name: 'Gold Ingot',
    tier: 'Tier IV - Golden Alchemist',
    xp: 2500,
    color: '#FACC15',
    glow: '#FDE047',
    B: '#78350F',
    H: '#FEF08A',
    M: '#FACC15',
    D: '#CA8A04',
    S: '#854D0E',
    C: '#FDE047'
  },
  redstone: {
    name: 'Redstone Dust',
    tier: 'Tier V - Redstone Engineer',
    xp: 4000,
    color: '#EF4444',
    glow: '#F87171',
    B: '#450A0A',
    H: '#FCA5A5',
    M: '#EF4444',
    D: '#B91C1C',
    S: '#7F1D1D',
    C: '#EF4444'
  },
  lapis: {
    name: 'Lapis Lazuli',
    tier: 'Tier VI - Enchanted Scholar',
    xp: 6500,
    color: '#2563EB',
    glow: '#60A5FA',
    B: '#1E1B4B',
    H: '#93C5FD',
    M: '#2563EB',
    D: '#1D4ED8',
    S: '#1E3A8A',
    C: '#3B82F6'
  },
  diamond: {
    name: 'Diamond Gem',
    tier: 'Tier VII - Master Diamond',
    xp: 10000,
    color: '#38BDF8',
    glow: '#7DD3FC',
    B: '#083344',
    H: '#BAE6FD',
    M: '#38BDF8',
    D: '#0284C7',
    S: '#0369A1',
    C: '#38BDF8'
  },
  emerald: {
    name: 'Emerald Gem',
    tier: 'Tier VIII - Village Grandmaster',
    xp: 15000,
    color: '#10B981',
    glow: '#34D399',
    B: '#064E3B',
    H: '#A7F3D0',
    M: '#10B981',
    D: '#059669',
    S: '#047857',
    C: '#10B981'
  },
  amethyst: {
    name: 'Amethyst Shard',
    tier: 'Tier IX - Nether Vanguard',
    xp: 22000,
    color: '#A855F7',
    glow: '#C084FC',
    B: '#3B0764',
    H: '#E9D5FF',
    M: '#A855F7',
    D: '#7E22CE',
    S: '#581C87',
    C: '#C084FC'
  },
  netherite: {
    name: 'Netherite Ingot',
    tier: 'Tier X - God Tier Legend',
    xp: 32000,
    color: '#443A3A',
    glow: '#716060',
    B: '#1C1917',
    H: '#857878',
    M: '#4C4242',
    D: '#312B2B',
    S: '#1C1917',
    C: '#A89F91'
  }
};

for (const [id, pal] of Object.entries(PALETTES)) {
  let rects = '';
  for (let y = 0; y < 16; y++) {
    for (let x = 0; x < 16; x++) {
      const char = INGOT_MAP[y][x];
      if (char !== '.' && pal[char]) {
        rects += `  <rect x="${x}" y="${y}" width="1" height="1" fill="${pal[char]}" />\n`;
      }
    }
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="64" height="64" shape-rendering="crispEdges">
  <defs>
    <filter id="glow-${id}" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="0" stdDeviation="0.8" flood-color="${pal.glow}" flood-opacity="0.6"/>
    </filter>
  </defs>
  <g filter="url(#glow-${id})">
${rects}  </g>
</svg>`;

  fs.writeFileSync(path.join(ORES_DIR, `${id}.svg`), svg, 'utf8');
}

console.log('✓ Successfully generated 10 Minecraft Ore SVGs in public/ores/');
