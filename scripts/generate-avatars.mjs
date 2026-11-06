import fs from 'fs';
import path from 'path';

const AVATARS_DIR = path.resolve('public/avatars');
if (!fs.existsSync(AVATARS_DIR)) {
  fs.mkdirSync(AVATARS_DIR, { recursive: true });
}

// 8x8 Minecraft Head Pixel Maps
const HEADS = {
  steve: {
    name: 'Steve',
    subtitle: 'Classic Miner',
    skin: '#B78263',
    hair: '#382215',
    eyes: '#2B4B8B',
    mouth: '#733D26',
    grid: [
      'HHHHHHHH',
      'HHHHHHHH',
      'HHSSSSHH',
      'SSSSSSSS',
      'SEEWWEEH',
      'SSSSSSSS',
      'SSMMMMSS',
      'SSMMMMSS'
    ],
    palette: {
      H: '#2A180E', // hair
      S: '#C48A68', // skin
      E: '#385DB3', // eye pupil
      W: '#FFFFFF', // eye white
      M: '#5C2E17'  // beard/mouth
    }
  },
  alex: {
    name: 'Alex',
    subtitle: 'Wilderness Explorer',
    grid: [
      'HHHHHHHH',
      'HHHHHHHH',
      'HHSSSSHH',
      'SSSSSSSS',
      'SEEWWEEH',
      'SSSSSSSS',
      'SSM..MSS',
      'SSMMMMSS'
    ],
    palette: {
      H: '#C25D23', // ginger hair
      S: '#F6BE9A', // fair peach skin
      E: '#2E8B57', // emerald eye
      W: '#FFFFFF', // eye white
      M: '#D47E6A'  // lips
    }
  },
  noor: {
    name: 'Noor',
    subtitle: 'Redstone Savant',
    grid: [
      'HHHHHHHH',
      'HHHHHHHH',
      'HHSSSSHH',
      'SSSSSSSS',
      'SEEWWEEH',
      'SSSSSSSS',
      'SSM..MSS',
      'SSSSSSSS'
    ],
    palette: {
      H: '#1A1829', // dark navy hair
      S: '#82533F', // warm brown skin
      E: '#4E3127', // dark brown eye
      W: '#FFFFFF',
      M: '#5C382C'
    }
  },
  sunny: {
    name: 'Sunny',
    subtitle: 'Botanist Scholar',
    grid: [
      'HHHHHHHH',
      'HHHHHHHH',
      'HHSSSSHH',
      'SSSSSSSS',
      'SEEWWEEH',
      'SSSSSSSS',
      'SSMMMMSS',
      'SSSSSSSS'
    ],
    palette: {
      H: '#382215', // brown hair
      S: '#DCA27C', // tan skin
      E: '#264E36', // hazel green
      W: '#FFFFFF',
      M: '#A86C50'
    }
  },
  ari: {
    name: 'Ari',
    subtitle: 'Dungeon Raider',
    grid: [
      'HHHHHHHH',
      'HHHHHHHH',
      'HHSSSSHH',
      'SSSSSSSS',
      'SEEWWEEH',
      'SSSSSSSS',
      'SSMMMMSS',
      'SSSSSSSS'
    ],
    palette: {
      H: '#752A18', // auburn/crimson braided hair
      S: '#603B2C', // cocoa skin
      E: '#3D251D', // dark eye
      W: '#FFFFFF',
      M: '#48271C'
    }
  },
  zuri: {
    name: 'Zuri',
    subtitle: 'Obsidian Crafter',
    grid: [
      'HHHHHHHH',
      'HHHHHHHH',
      'HHSSSSHH',
      'SSSSSSSS',
      'SEEWWEEH',
      'SSSSSSSS',
      'SSMMMMSS',
      'SSSSSSSS'
    ],
    palette: {
      H: '#111116', // pitch black hair
      S: '#483025', // rich dark skin
      E: '#5C3A21', // amber brown eye
      W: '#FFFFFF',
      M: '#331F16'
    }
  },
  makena: {
    name: 'Makena',
    subtitle: 'Golden Alchemist',
    grid: [
      'HHHHHHHH',
      'HHHHHHHH',
      'HHSSSSHH',
      'SSSSSSSS',
      'SEEWWEEH',
      'SSSSSSSS',
      'SSM..MSS',
      'SSSSSSSS'
    ],
    palette: {
      H: '#86557E', // lilac purple hair
      S: '#B87854', // bronze skin
      E: '#6D28D9', // violet eye
      W: '#FFFFFF',
      M: '#8C4830'
    }
  },
  efe: {
    name: 'Efe',
    subtitle: 'Nether Vanguard',
    grid: [
      'HHHHHHHH',
      'HHHHHHHH',
      'HHSSSSHH',
      'SSSSSSSS',
      'SEEWWEEH',
      'SSSSSSSS',
      'SSMMMMSS',
      'SSSSSSSS'
    ],
    palette: {
      H: '#4C1D95', // royal purple hair
      S: '#C98A65', // golden skin
      E: '#0D9488', // teal cyan eye
      W: '#FFFFFF',
      M: '#8A5038'
    }
  },
  creeper: {
    name: 'Creeper',
    subtitle: 'Explosive Scholar',
    grid: [
      'GGGGGGGG',
      'GGGGGGGG',
      'GDDGGDDG',
      'GDDGGDDG',
      'GGDDDDGG',
      'GDDDDDDG',
      'GDDGGDDG',
      'GDDGGDDG'
    ],
    palette: {
      G: '#58CC02',
      D: '#0F2E07'
    }
  },
  enderman: {
    name: 'Enderman',
    subtitle: 'Void Walker',
    grid: [
      'BBBBBBBB',
      'BBBBBBBB',
      'BBBBBBBB',
      'BPPWWPPB',
      'BPPWWPPB',
      'BBBBBBBB',
      'BBBBBBBB',
      'BBBBBBBB'
    ],
    palette: {
      B: '#141419',
      P: '#A855F7',
      W: '#E9D5FF'
    }
  }
};

for (const [id, data] of Object.entries(HEADS)) {
  let rects = '';
  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      const char = data.grid[y][x];
      if (char !== '.' && data.palette[char]) {
        rects += `  <rect x="${x}" y="${y}" width="1" height="1" fill="${data.palette[char]}" />\n`;
      }
    }
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 8 8" width="64" height="64" shape-rendering="crispEdges">
  <rect width="8" height="8" fill="#000000" rx="1"/>
${rects}</svg>`;

  fs.writeFileSync(path.join(AVATARS_DIR, `${id}.svg`), svg, 'utf8');
}

console.log('✓ Generated 10 Minecraft Avatar Head SVGs in public/avatars/');
