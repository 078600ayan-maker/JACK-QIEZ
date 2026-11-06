import puppeteer from 'puppeteer-core';
import path from 'path';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const artifactDir = 'C:\\Users\\pcpcp\\.gemini\\antigravity\\brain\\82100255-3db3-49a6-b2f2-cf00623ca218';

async function main() {
  console.log('Launching headless browser...');
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 440, height: 920, deviceScaleFactor: 2 });

  // 1. Capture Home Lobby Screen (Native 3D Octopops + Particle Canvas)
  console.log('Capturing Home Lobby Screen...');
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 2200)); // wait for Three.js render
  await page.screenshot({ path: path.join(artifactDir, 'home-lobby.png') });
  console.log('Saved home-lobby.png');

  // 2. Capture Winding Path Screen with Ghost Multiplayer
  console.log('Capturing Winding Path Screen...');
  await page.goto('http://localhost:3000/path', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1200));
  await page.screenshot({ path: path.join(artifactDir, 'winding-path.png') });
  console.log('Saved winding-path.png');

  // 3. Capture Quiz Theater Screen with Floating Native 3D Companion
  console.log('Capturing Quiz Theater Screen...');
  await page.goto('http://localhost:3000/quiz/sci/sci_ch01/1', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1600));
  await page.screenshot({ path: path.join(artifactDir, 'quiz-screen.png') });
  console.log('Saved quiz-screen.png');

  // 4. Capture Smart Mistake Vault with Spaced Repetition Leitner Boxes
  console.log('Capturing Smart Mistake Vault...');
  await page.goto('http://localhost:3000/mistakes', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(artifactDir, 'mistakes-vault.png') });
  console.log('Saved mistakes-vault.png');

  // 5. Capture Leaderboard Screen with Weekly Royal Division
  console.log('Capturing Leaderboard Screen...');
  await page.goto('http://localhost:3000/leaderboard', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(artifactDir, 'leaderboard-screen.png') });
  console.log('Saved leaderboard-screen.png');

  // 6. Capture Profile Screen with Steve/Eve Avatar Rig
  console.log('Capturing Profile Screen...');
  await page.goto('http://localhost:3000/profile', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(artifactDir, 'profile-screen.png') });
  console.log('Saved profile-screen.png');

  await browser.close();
  console.log('All upgraded screenshots captured successfully!');
}

main().catch(err => {
  console.error('Screenshot error:', err);
  process.exit(1);
});
