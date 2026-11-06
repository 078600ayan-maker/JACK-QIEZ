import fs from 'fs';
import path from 'path';

const SUB_DIR = path.resolve('public/subjects');
if (!fs.existsSync(SUB_DIR)) {
  fs.mkdirSync(SUB_DIR, { recursive: true });
}

// 1. Math Book (Emerald green with Pi, Sigma, Triangle, Compass)
const mathSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
  <defs>
    <linearGradient id="mathGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0F382A"/>
      <stop offset="100%" stop-color="#041F16"/>
    </linearGradient>
    <filter id="mathGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#10B981" flood-opacity="0.4"/>
    </filter>
  </defs>
  <rect x="10" y="10" width="100" height="100" rx="20" fill="url(#mathGrad)" stroke="#10B981" stroke-width="2.5" filter="url(#mathGlow)"/>
  <!-- Mathematical symbols -->
  <text x="32" y="38" fill="#86EFAC" font-family="sans-serif" font-weight="900" font-size="16">π</text>
  <text x="82" y="38" fill="#86EFAC" font-family="sans-serif" font-weight="900" font-size="16">Σ</text>
  <!-- Triangle -->
  <polygon points="30,85 75,85 75,50" fill="none" stroke="#FBBF24" stroke-width="2.5"/>
  <rect x="70" y="80" width="5" height="5" fill="none" stroke="#FBBF24" stroke-width="1.5"/>
  <!-- Compass -->
  <path d="M78,55 L90,85 M78,55 L66,85" stroke="#34D399" stroke-width="2.5" stroke-linecap="round"/>
  <circle cx="78" cy="55" r="3.5" fill="#FBBF24"/>
  <path d="M68,76 Q78,72 88,76" fill="none" stroke="#34D399" stroke-width="1.5" stroke-dasharray="2,2"/>
</svg>`;

// 2. Science Book (Emerald/Cyan with Atom, Flask & DNA)
const scienceSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
  <defs>
    <linearGradient id="sciGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#064E3B"/>
      <stop offset="100%" stop-color="#022C22"/>
    </linearGradient>
    <filter id="sciGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#059669" flood-opacity="0.4"/>
    </filter>
  </defs>
  <rect x="10" y="10" width="100" height="100" rx="20" fill="url(#sciGrad)" stroke="#34D399" stroke-width="2.5" filter="url(#sciGlow)"/>
  <!-- Atom -->
  <ellipse cx="38" cy="42" rx="16" ry="6" fill="none" stroke="#6EE7B7" stroke-width="1.8" transform="rotate(-30 38 42)"/>
  <ellipse cx="38" cy="42" rx="16" ry="6" fill="none" stroke="#6EE7B7" stroke-width="1.8" transform="rotate(30 38 42)"/>
  <circle cx="38" cy="42" r="3" fill="#FBBF24"/>
  <!-- Laboratory Flask -->
  <path d="M68,45 L76,45 L76,55 L88,78 A6,6 0 0,1 82,86 L62,86 A6,6 0 0,1 56,78 L68,55 Z" fill="#10B981" fill-opacity="0.25" stroke="#34D399" stroke-width="2.2" stroke-linejoin="round"/>
  <!-- Bubbles in Flask -->
  <circle cx="70" cy="74" r="2.5" fill="#6EE7B7"/>
  <circle cx="76" cy="68" r="1.8" fill="#6EE7B7"/>
  <!-- DNA Helix on side -->
  <path d="M92,36 Q98,42 92,48 T92,60 T92,72" fill="none" stroke="#38BDF8" stroke-width="2" stroke-linecap="round"/>
  <line x1="88" y1="42" x2="96" y2="42" stroke="#38BDF8" stroke-width="1.5"/>
  <line x1="88" y1="54" x2="96" y2="54" stroke="#38BDF8" stroke-width="1.5"/>
  <line x1="88" y1="66" x2="96" y2="66" stroke="#38BDF8" stroke-width="1.5"/>
</svg>`;

// 3. English Book (Warm Amber with serif 'A')
const englishSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
  <defs>
    <linearGradient id="engGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#451A03"/>
      <stop offset="100%" stop-color="#270F02"/>
    </linearGradient>
    <filter id="engGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#F59E0B" flood-opacity="0.4"/>
    </filter>
  </defs>
  <rect x="10" y="10" width="100" height="100" rx="20" fill="url(#engGrad)" stroke="#F59E0B" stroke-width="2.5" filter="url(#engGlow)"/>
  <text x="60" y="74" fill="#FDE68A" font-family="'Times New Roman', serif" font-weight="900" font-size="52" text-anchor="middle">A</text>
  <line x1="32" y1="88" x2="88" y2="88" stroke="#D97706" stroke-width="2" stroke-linecap="round"/>
</svg>`;

// 4. Social Science Book (Deep Magenta/Rose with Wireframe Globe)
const sstSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
  <defs>
    <linearGradient id="sstGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#4C0519"/>
      <stop offset="100%" stop-color="#2A020E"/>
    </linearGradient>
    <filter id="sstGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#F43F5E" flood-opacity="0.4"/>
    </filter>
  </defs>
  <rect x="10" y="10" width="100" height="100" rx="20" fill="url(#sstGrad)" stroke="#FB7185" stroke-width="2.5" filter="url(#sstGlow)"/>
  <!-- Wireframe Globe -->
  <circle cx="60" cy="60" r="28" fill="none" stroke="#FDA4AF" stroke-width="2.2"/>
  <ellipse cx="60" cy="60" rx="28" ry="12" fill="none" stroke="#FDA4AF" stroke-width="1.8"/>
  <line x1="60" y1="32" x2="60" y2="88" stroke="#FDA4AF" stroke-width="1.8"/>
  <line x1="32" y1="60" x2="88" y2="60" stroke="#FDA4AF" stroke-width="1.8"/>
</svg>`;

// 5. Hindi Book (Royal Purple with Devanagari 'अ')
const hindiSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
  <defs>
    <linearGradient id="hinGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#3B0764"/>
      <stop offset="100%" stop-color="#1E0338"/>
    </linearGradient>
    <filter id="hinGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#A855F7" flood-opacity="0.4"/>
    </filter>
  </defs>
  <rect x="10" y="10" width="100" height="100" rx="20" fill="url(#hinGrad)" stroke="#C084FC" stroke-width="2.5" filter="url(#hinGlow)"/>
  <text x="60" y="74" fill="#E9D5FF" font-family="'Devanagari Sangam MN', 'Noto Sans Devanagari', 'Mangal', sans-serif" font-weight="900" font-size="48" text-anchor="middle">अ</text>
  <line x1="34" y1="88" x2="86" y2="88" stroke="#9333EA" stroke-width="2" stroke-linecap="round"/>
</svg>`;

fs.writeFileSync(path.join(SUB_DIR, 'math.svg'), mathSvg, 'utf8');
fs.writeFileSync(path.join(SUB_DIR, 'science.svg'), scienceSvg, 'utf8');
fs.writeFileSync(path.join(SUB_DIR, 'english.svg'), englishSvg, 'utf8');
fs.writeFileSync(path.join(SUB_DIR, 'sst.svg'), sstSvg, 'utf8');
fs.writeFileSync(path.join(SUB_DIR, 'hindi.svg'), hindiSvg, 'utf8');

console.log('✓ Successfully created 5 Subject Book SVGs in public/subjects/');
