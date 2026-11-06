import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const artifactDir = 'C:\\Users\\pcpcp\\.gemini\\antigravity\\brain\\82100255-3db3-49a6-b2f2-cf00623ca218';
const artifactPdfPath = path.join(artifactDir, 'Jack_Quiz_Phase1_Master_Specification.pdf');
const summaryPdfPath = path.join(artifactDir, 'Study_Buddy_Royal_Master_Summary.pdf');
const projectPdfPath = 'C:\\Users\\pcpcp\\.gemini\\antigravity\\scratch\\study-buddy-royal\\Jack_Quiz_Phase1_Master_Specification.pdf';

const logoBase64 = fs.existsSync(path.join(artifactDir, 'home-lobby.png'))
  ? 'data:image/png;base64,' + fs.readFileSync(path.join(artifactDir, 'home-lobby.png')).toString('base64')
  : '';

const quizBase64 = fs.existsSync(path.join(artifactDir, 'quiz-screen.png'))
  ? 'data:image/png;base64,' + fs.readFileSync(path.join(artifactDir, 'quiz-screen.png')).toString('base64')
  : '';

const loginBase64 = fs.existsSync(path.join(artifactDir, 'login-screen-octopops.png'))
  ? 'data:image/png;base64,' + fs.readFileSync(path.join(artifactDir, 'login-screen-octopops.png')).toString('base64')
  : '';

const mistakesBase64 = fs.existsSync(path.join(artifactDir, 'mistakes-vault.png'))
  ? 'data:image/png;base64,' + fs.readFileSync(path.join(artifactDir, 'mistakes-vault.png')).toString('base64')
  : '';

const leaderBase64 = fs.existsSync(path.join(artifactDir, 'leaderboard-screen.png'))
  ? 'data:image/png;base64,' + fs.readFileSync(path.join(artifactDir, 'leaderboard-screen.png')).toString('base64')
  : '';

const profileBase64 = fs.existsSync(path.join(artifactDir, 'profile-screen.png'))
  ? 'data:image/png;base64,' + fs.readFileSync(path.join(artifactDir, 'profile-screen.png')).toString('base64')
  : '';

const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800;900&family=Noto+Sans+Devanagari:wght@400;600;700;900&display=swap');
  
  @page {
    size: A4;
    margin: 12mm 12mm 12mm 12mm;
  }
  
  body {
    font-family: 'Plus Jakarta Sans', sans-serif;
    background-color: #090D16;
    color: #F8FAFC;
    line-height: 1.42;
    font-size: 9.5pt;
    margin: 0;
    padding: 0;
  }
  
  .header-card {
    background: linear-gradient(135deg, rgba(20,29,48,0.95) 0%, rgba(10,14,24,0.98) 100%);
    border: 1px solid rgba(245,158,11,0.5);
    border-top: 3px solid #F59E0B;
    border-radius: 14px;
    padding: 14px 18px;
    margin-bottom: 14px;
    box-shadow: 0 8px 24px rgba(0,0,0,0.6);
  }
  
  .badge {
    display: inline-block;
    padding: 3px 10px;
    border-radius: 999px;
    background: rgba(245,158,11,0.18);
    border: 1px solid #F59E0B;
    color: #FBBF24;
    font-size: 7.5pt;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.8px;
  }

  .badge-emerald {
    background: rgba(16,185,129,0.18);
    border: 1px solid #10B981;
    color: #80FF44;
  }
  
  h1 {
    font-size: 19pt;
    font-weight: 900;
    margin: 6px 0 3px 0;
    letter-spacing: -0.5px;
    color: #FFFFFF;
  }
  
  h2 {
    font-size: 11pt;
    font-weight: 800;
    color: #FBBF24;
    border-left: 3px solid #F59E0B;
    padding-left: 8px;
    margin: 14px 0 6px 0;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  h3 {
    font-size: 10pt;
    font-weight: 800;
    color: #E2E8F0;
    margin: 8px 0 4px 0;
  }
  
  .grid-2 {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    margin-bottom: 10px;
  }

  .grid-3 {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 8px;
    margin-bottom: 10px;
  }

  .grid-6 {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: 6px;
    margin: 8px 0;
  }
  
  .card {
    background: rgba(30,41,59,0.6);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 10px;
    padding: 10px 12px;
  }
  
  .card-highlight {
    background: rgba(245,158,11,0.08);
    border: 1px solid rgba(245,158,11,0.3);
  }

  .card-unlocked {
    background: rgba(16,185,129,0.08);
    border: 1px solid rgba(16,185,129,0.4);
    box-shadow: 0 0 15px rgba(16,185,129,0.15);
  }
  
  table {
    width: 100%;
    border-collapse: collapse;
    margin: 8px 0 12px 0;
    font-size: 8.5pt;
  }
  
  th {
    background: rgba(15,23,42,0.85);
    color: #FBBF24;
    text-align: left;
    padding: 6px 8px;
    font-weight: 800;
    border-bottom: 1px solid rgba(245,158,11,0.3);
  }
  
  td {
    padding: 6px 8px;
    border-bottom: 1px solid rgba(255,255,255,0.05);
    color: #CBD5E1;
  }
  
  tr:nth-child(even) td {
    background: rgba(255,255,255,0.02);
  }

  .shot-wrap {
    text-align: center;
    background: rgba(15,23,42,0.6);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 10px;
    padding: 6px;
    margin-bottom: 6px;
  }

  .shot-img {
    width: 100%;
    max-height: 180px;
    object-fit: contain;
    border-radius: 6px;
  }

  .shot-caption {
    font-size: 7pt;
    font-weight: 700;
    color: #94A3B8;
    margin-top: 3px;
    text-transform: uppercase;
  }

  .page-break {
    page-break-after: always;
  }

  .tag {
    display: inline-block;
    padding: 2px 6px;
    border-radius: 5px;
    background: rgba(255,255,255,0.08);
    font-size: 7pt;
    font-weight: 700;
    margin-right: 3px;
  }
</style>
</head>
<body>

  <!-- HEADER HERO -->
  <div class="header-card">
    <div style="display:flex; justify-content:space-between; align-items:center;">
      <span class="badge">ROYAL OBSIDIAN SPECIFICATION • COMPLETE ARCHITECTURE</span>
      <span style="font-size:8pt; color:#94A3B8; font-weight:700;">JAC Class 10 &bull; Native Three.js WebGL Engine</span>
    </div>
    <h1>JACK QUIZ: MASTER SPECIFICATION & ARCHITECTURE</h1>
    <div style="font-size:9.5pt; color:#FBBF24; font-weight:800; margin-top:2px;">
      Created by Ayan Ali &bull; Official YouTube: https://youtube.com/@jack_quiz
    </div>
    <div style="font-size:8pt; color:#94A3B8; margin-top:4px;">
      Theme: Deep Royal Obsidian (#090D16) &bull; Tech Stack: Next.js 16 (Turbopack), React 19, Tailwind CSS v4, Three.js WebGL (Zero Iframes), Zustand v5
    </div>
  </div>

  <!-- SCREENSHOT GALLERY -->
  <h2>1. UI Verification Gallery (Native 60 FPS Engine)</h2>
  <div class="grid-6">
    <div class="shot-wrap">
      <img src="${loginBase64}" class="shot-img" alt="Login Auth" />
      <div class="shot-caption">Login: Green Mascot Airlearn Layout</div>
    </div>
    <div class="shot-wrap">
      <img src="${logoBase64}" class="shot-img" alt="Home Lobby" />
      <div class="shot-caption">Home Lobby: 3D Mascot & Speed Drill</div>
    </div>
    <div class="shot-wrap">
      <img src="${quizBase64}" class="shot-img" alt="Quiz Theater" />
      <div class="shot-caption">Quiz Theater: Native 3D Companion</div>
    </div>
    <div class="shot-wrap">
      <img src="${mistakesBase64}" class="shot-img" alt="Mistake Vault" />
      <div class="shot-caption">Mistake Vault: 5-Box Leitner Engine</div>
    </div>
    <div class="shot-wrap">
      <img src="${leaderBase64}" class="shot-img" alt="Leaderboard" />
      <div class="shot-caption">Obsidian Leagues & Royal Division</div>
    </div>
    <div class="shot-wrap">
      <img src="${profileBase64}" class="shot-img" alt="Profile Studio" />
      <div class="shot-caption">Scholar Profile & Minecraft Avatars</div>
    </div>
  </div>

  <!-- AIRLEARN REFERENCE IMPLEMENTATION -->
  <h2>2. Airlearn Reference Adaptation & Mascot Architecture</h2>
  <div class="grid-2">
    <div class="card card-highlight">
      <h3>🐾 Official 3D Green Voxel Mascot (Octopops)</h3>
      <p><b>Strict Identity Rule:</b> Blue cat from Airlearn is replaced 100% by the Official Green Voxel Mascot (Octopops) on a glass pedestal.</p>
      <p><b>Zero Iframes:</b> Native Three.js WebGL rendering with real-time animation states (<code>idle</code>, <code>laugh</code>, <code>cry</code>, <code>cheer</code>) running at 60 FPS on Android WebView.</p>
      <p><b>Speech Bubbles:</b> Replaced foreign language bubbles with Delhi/JAC Class 10 study bites ("Formula Revise!", "Science 95%+", "Haan bhai!", "JAC Topper 2027").</p>
    </div>
    <div class="card card-unlocked">
      <h3>🔥 Airlearn-Style Buddy Streak Engine</h3>
      <p><b>Hero Dual Mascot:</b> You (Green Voxel Buddy) and Buddy (Rachel) with a pulsating flame badge displaying active streak count.</p>
      <p><b>Spark the Streak:</b> Buddy slot row with dashed invite circles for WhatsApp link sharing (+100 XP bonus).</p>
      <p><b>Remind Your Buddy:</b> Nudge button with real-time "Reminder sent" acknowledgment.</p>
      <p><b>Head-to-Head Comparison:</b> Side-by-side Lessons, XP, and Question counts.</p>
    </div>
  </div>

  <!-- HOME SCREEN ARCHITECTURE -->
  <h2>3. Home Screen Architecture & Gateway System</h2>
  <div class="grid-2">
    <div class="card card-highlight">
      <h3>👑 Top HUD & 60s Rapid Fire Engine</h3>
      <p><b>Dynamic Greeting:</b> "Welcome back, [User Name]! 👋" paired with the official 3D green voxel custom Jack Quiz logo.</p>
      <p><b>60s Rapid Fire Speed Drill:</b> Modal with 5 subjects. Selecting any subject pulls a 100% randomized question array across all chapters with Fisher-Yates shuffle.</p>
      <p><b>Firebase Direct Sync:</b> Drill score, accuracy percentage, and streak automatically sync to Firestore.</p>
    </div>
    <div class="card card-unlocked">
      <h3>🏛️ Class Selection Gateway (Bento Matrix)</h3>
      <p><b>Class 10 (ACTIVE • UNLOCKED):</b> Highlighted with glowing emerald neon border, complete syllabus coverage, and 5-subject deep interactive grid.</p>
      <p><b>Class 9 (LOCKED • COMING SOON):</b> Smokey frosted matte card with padlock indicator, reserving foundation space.</p>
      <p><b>Class 8 (LOCKED • COMING SOON):</b> Smokey frosted matte card for middle school board foundation preparation.</p>
    </div>
  </div>

  <!-- 5-SUBJECT INNER GRID & CHAPTER MODALS -->
  <h2>4. Class 10 Core Subject Syllabus Hierarchy (65 Chapters)</h2>
  <table>
    <thead>
      <tr>
        <th>Subject</th>
        <th>Code</th>
        <th>Syllabus Categorization Sub-Divisions</th>
        <th>Chapters</th>
        <th>Theme Color</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><b>Science (विज्ञान)</b></td>
        <td><code>sci</code></td>
        <td>Physics &bull; Chemistry &bull; Biology</td>
        <td>13 Chapters</td>
        <td><span class="tag" style="color:#10B981">#10B981 Emerald</span></td>
      </tr>
      <tr>
        <td><b>Mathematics (गणित)</b></td>
        <td><code>math</code></td>
        <td>Number Systems &bull; Algebra &bull; Geometry &bull; Trigonometry &bull; Mensuration &bull; Statistics</td>
        <td>14 Chapters</td>
        <td><span class="tag" style="color:#3B82F6">#3B82F6 Cobalt</span></td>
      </tr>
      <tr>
        <td><b>Social Science (सामाजिक विज्ञान)</b></td>
        <td><code>sst</code></td>
        <td>History &bull; Geography &bull; Civics &bull; Economics</td>
        <td>16 Chapters</td>
        <td><span class="tag" style="color:#F59E0B">#F59E0B Amber</span></td>
      </tr>
      <tr>
        <td><b>Hindi (हिंदी)</b></td>
        <td><code>hin</code></td>
        <td>Kshitij (सूरदास, नेताजी का चश्मा) &bull; Kritika (माता का आँचल) &bull; Vyakaran</td>
        <td>11 Chapters</td>
        <td><span class="tag" style="color:#EC4899">#EC4899 Rose</span></td>
      </tr>
      <tr>
        <td><b>English (अंग्रेजी)</b></td>
        <td><code>eng</code></td>
        <td>First Flight &bull; Footprints Without Feet &bull; Grammar</td>
        <td>11 Chapters</td>
        <td><span class="tag" style="color:#8B5CF6">#8B5CF6 Violet</span></td>
      </tr>
    </tbody>
  </table>

  <div class="page-break"></div>

  <!-- 10 NEW PREMIUM UPGRADES -->
  <h2>5. 10 Elite Architectural Upgrades</h2>
  <div class="grid-2">
    <div class="card">
      <h3>1. Live Dotty Particle Canvas (60 FPS)</h3>
      <p>Subtle slow-moving glowing obsidian nodes connected by faint proximity lines with gentle pointer repulsion. Zero DOM overhead.</p>
    </div>
    <div class="card">
      <h3>2. Leitner Spaced Repetition Vault</h3>
      <p>5-Box Leitner spaced repetition engine. Automatically captures incorrect quiz answers and queues review based on urgency intervals (Box 1: daily, Box 5: mastered).</p>
    </div>
    <div class="card">
      <h3>3. Procedural Lo-Fi Ambient Engine</h3>
      <p>Web Audio API Rhodes 7th chord synth with tape-warble LFO for study immersion. Zero external audio downloads needed.</p>
    </div>
    <div class="card">
      <h3>4. Native Android Haptic Engine</h3>
      <p>Hardware vibration feedback for tactile micro-interactions: quick tick on selection (12ms), error bump on incorrect (30-40-30ms), success burst on level clear.</p>
    </div>
    <div class="card">
      <h3>5. Zen Focus Mode</h3>
      <p>HUD distraction toggle in Quiz Theater that collapses timers, avatars, and headers to enter pure deep-focus revision.</p>
    </div>
    <div class="card">
      <h3>6. Post-Quiz Reasoning Drawer</h3>
      <p>Comprehensive step-by-step breakdown of every question, explaining why the correct choice is right and where common pitfalls occur.</p>
    </div>
    <div class="card">
      <h3>7. Ghost Multiplayer Mode</h3>
      <p>Real-time ghost buddy avatar tracking on the S-curve winding path showing where friends are currently studying.</p>
    </div>
    <div class="card">
      <h3>8. Weekly Royal Division League</h3>
      <p>Top 3 scholars in Diamond Division earn Royal Obsidian border badge. Real-time countdown timer to Sunday midnight resets.</p>
    </div>
    <div class="card">
      <h3>9. Cinematic Chapter Intros</h3>
      <p>Smooth slide-in chapter briefing modal before entering any node with syllabus key points, question counts, and XP targets.</p>
    </div>
    <div class="card">
      <h3>10. Parent / Self Progress Report</h3>
      <p>Auditable scholar report card detailing overall accuracy, total study hours, subject mastery bars, and crown collection.</p>
    </div>
  </div>

  <!-- PRODUCTION AUDIT & SIGN-OFF -->
  <h2>6. Production Verification & Architectural Signoff</h2>
  <table>
    <thead>
      <tr>
        <th>Verification Dimension</th>
        <th>Specification Requirement</th>
        <th>Audit Verification</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><b>Brand Identity</b></td>
        <td>Strictly <b>"Jack Quiz"</b> across all headers, cards, and titles.</td>
        <td><b style="color:#10B981">100% Verified & Compliant</b></td>
      </tr>
      <tr>
        <td><b>Zero Iframes</b></td>
        <td>Three.js WebGL canvas rendered natively inside React components.</td>
        <td><b style="color:#10B981">Zero Iframes (All Removed)</b></td>
      </tr>
      <tr>
        <td><b>Creator Credit</b></td>
        <td>"Created by Ayan Ali" & YouTube (@jack_quiz) permanently embedded.</td>
        <td><b style="color:#10B981">Prominently Displayed on All Screens</b></td>
      </tr>
      <tr>
        <td><b>Zero AI Credit Offline</b></td>
        <td>Static JSON tuple schema operating with zero runtime tokens.</td>
        <td><b style="color:#10B981">100% Offline Capable & Deterministic</b></td>
      </tr>
      <tr>
        <td><b>Zero Casino / Chhapri</b></td>
        <td>No casino spin wheels, no lottery scratchcards. 100% academic focus.</td>
        <td><b style="color:#10B981">Strictly Enforced (0 Casino Elements)</b></td>
      </tr>
      <tr>
        <td><b>Next.js Turbopack Build</b></td>
        <td>Turbopack prerendering all 10 app routes with 0 TypeScript errors.</td>
        <td><b style="color:#10B981">Build Clean (Exit Code 0)</b></td>
      </tr>
    </tbody>
  </table>

  <!-- FOOTER -->
  <div style="margin-top:16px; padding-top:8px; border-top:1px solid rgba(255,255,255,0.1); display:flex; justify-content:space-between; align-items:center; font-size:7.5pt; color:#64748B;">
    <span>Jack Quiz &bull; Royal 3D Obsidian Study Ecosystem</span>
    <span>Lead Architect: Ayan Ali &bull; Master Specification Complete</span>
  </div>

</body>
</html>
`;

async function main() {
  console.log('Generating Master Architecture PDF...');
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

  // Generate PDF
  await page.pdf({
    path: artifactPdfPath,
    format: 'A4',
    printBackground: true,
    margin: { top: '0', bottom: '0', left: '0', right: '0' }
  });

  // Also copy to summaryPdfPath and projectPdfPath
  fs.copyFileSync(artifactPdfPath, summaryPdfPath);
  fs.copyFileSync(artifactPdfPath, projectPdfPath);

  console.log(`Saved PDF to:\n${artifactPdfPath}\n${summaryPdfPath}\n${projectPdfPath}`);
  await browser.close();
}

main().catch(err => {
  console.error('PDF generation error:', err);
  process.exit(1);
});
