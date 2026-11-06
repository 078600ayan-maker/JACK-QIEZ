import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const artifactDir = 'C:\\Users\\pcpcp\\.gemini\\antigravity\\brain\\82100255-3db3-49a6-b2f2-cf00623ca218';
const outputVideoPath = path.join(artifactDir, 'Jack_Quiz_Official_Walkthrough.webm');
const outputHtmlPlayerPath = path.join(artifactDir, 'Jack_Quiz_Video_Player.html');

async function record() {
  console.log('Launching Chrome to capture high-res walkthrough screens...');
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 440, height: 860, deviceScaleFactor: 2 });

  const routes = [
    { name: 'Login Screen (Airlearn Reference)', url: 'http://localhost:3000/login', waitMs: 2500 },
    { name: 'Home Lobby & 3D Voxel Mascot', url: 'http://localhost:3000', waitMs: 2800 },
    { name: 'S-Curve Path (Winding Roadmap)', url: 'http://localhost:3000/path', waitMs: 2500 },
    { name: 'Quiz Theater (Active Session)', url: 'http://localhost:3000/quiz/sci/chemical-reactions/bronze', waitMs: 2500 },
    { name: 'Mistake Vault (Leitner Algorithm)', url: 'http://localhost:3000/mistakes', waitMs: 2500 },
    { name: 'Leaderboard & Buddy Streaks', url: 'http://localhost:3000/leaderboard', waitMs: 2500 },
    { name: 'Scholar Profile & Avatar Studio', url: 'http://localhost:3000/profile', waitMs: 2500 }
  ];

  const capturedFrames = [];

  for (const r of routes) {
    console.log(`Navigating to ${r.name}...`);
    try {
      await page.goto(r.url, { waitUntil: 'networkidle0', timeout: 15000 });
      await new Promise(res => setTimeout(res, r.waitMs));

      // Scroll slightly to capture interactions
      const b64 = await page.screenshot({ encoding: 'base64', type: 'jpeg', quality: 90 });
      capturedFrames.push({
        title: r.name,
        data: 'data:image/jpeg;base64,' + b64
      });
      console.log(`✓ Captured ${r.name}`);
    } catch (err) {
      console.warn(`Warning on ${r.name}:`, err.message);
    }
  }

  console.log(`Total captured scenes: ${capturedFrames.length}. Generating WebM video using Chrome MediaRecorder...`);

  // Create a new blank page to render canvas and record via MediaRecorder
  const recorderPage = await browser.newPage();
  await recorderPage.setViewport({ width: 880, height: 1720 });

  const recorderHtml = `
  <!DOCTYPE html>
  <html>
  <head><meta charset="UTF-8"></head>
  <body style="margin:0; background:#090D16; overflow:hidden;">
    <canvas id="c" width="880" height="1720"></canvas>
    <script>
      window.framesData = ${JSON.stringify(capturedFrames)};
      
      window.startRecording = () => {
        return new Promise(async (resolve) => {
          const canvas = document.getElementById('c');
          const ctx = canvas.getContext('2d');
          
          // Preload images
          const loadedImages = await Promise.all(window.framesData.map(f => {
            return new Promise((res) => {
              const img = new Image();
              img.onload = () => res({ img, title: f.title });
              img.src = f.data;
            });
          }));

          const stream = canvas.captureStream(30); // 30 FPS
          const recorder = new MediaRecorder(stream, { mimeType: 'video/webm;codecs=vp8' });
          const chunks = [];

          recorder.ondataavailable = e => { if (e.data.size > 0) chunks.push(e.data); };
          recorder.onstop = async () => {
            const blob = new Blob(chunks, { type: 'video/webm' });
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result.split(',')[1]);
            reader.readAsDataURL(blob);
          };

          recorder.start();

          // Render sequence with smooth crossfades and titles
          const frameDurationMs = 2800; // 2.8s per scene
          const fadeDurationMs = 500;

          let startTime = performance.now();
          const totalDuration = loadedImages.length * frameDurationMs;

          function render() {
            const elapsed = performance.now() - startTime;
            if (elapsed >= totalDuration) {
              recorder.stop();
              return;
            }

            const sceneIdx = Math.min(Math.floor(elapsed / frameDurationMs), loadedImages.length - 1);
            const sceneElapsed = elapsed % frameDurationMs;
            const currentScene = loadedImages[sceneIdx];
            const nextScene = loadedImages[Math.min(sceneIdx + 1, loadedImages.length - 1)];

            // Draw base
            ctx.fillStyle = '#090D16';
            ctx.fillRect(0, 0, 880, 1720);

            // Draw current scene
            ctx.globalAlpha = 1.0;
            ctx.drawImage(currentScene.img, 0, 0, 880, 1720);

            // Crossfade into next scene
            if (sceneElapsed > (frameDurationMs - fadeDurationMs) && sceneIdx < loadedImages.length - 1) {
              const alpha = (sceneElapsed - (frameDurationMs - fadeDurationMs)) / fadeDurationMs;
              ctx.globalAlpha = alpha;
              ctx.drawImage(nextScene.img, 0, 0, 880, 1720);
            }

            // Top HUD Overlay banner
            ctx.globalAlpha = 0.92;
            ctx.fillStyle = '#0F172A';
            ctx.fillRect(20, 24, 840, 70);
            ctx.strokeStyle = '#F59E0B';
            ctx.lineWidth = 3;
            ctx.strokeRect(20, 24, 840, 70);

            ctx.globalAlpha = 1.0;
            ctx.fillStyle = '#FBBF24';
            ctx.font = 'bold 26px sans-serif';
            ctx.fillText('JACK QUIZ  •  ' + currentScene.title.toUpperCase(), 40, 68);

            // Progress bar at top
            const progress = elapsed / totalDuration;
            ctx.fillStyle = '#10B981';
            ctx.fillRect(20, 90, 840 * progress, 6);

            requestAnimationFrame(render);
          }

          render();
        });
      };
    </script>
  </body>
  </html>
  `;

  await recorderPage.setContent(recorderHtml);
  console.log('Rendering 30 FPS video with MediaRecorder...');

  const videoBase64 = await recorderPage.evaluate(async () => {
    return await window.startRecording();
  });

  const videoBuffer = Buffer.from(videoBase64, 'base64');
  fs.writeFileSync(outputVideoPath, videoBuffer);
  console.log(`✓ Video successfully saved to: ${outputVideoPath} (${(videoBuffer.length / 1024 / 1024).toFixed(2)} MB)`);

  // Also build an interactive HTML video player artifact
  const playerHtml = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>Jack Quiz - Official Walkthrough Video</title>
    <style>
      body {
        margin: 0;
        background: #090D16;
        color: #F8FAFC;
        font-family: system-ui, -apple-system, sans-serif;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-height: 100vh;
        padding: 20px;
        box-sizing: border-box;
      }
      .container {
        max-width: 500px;
        width: 100%;
        background: #141E33;
        border: 2px solid #F59E0B;
        border-radius: 24px;
        padding: 20px;
        box-shadow: 0 20px 60px rgba(0,0,0,0.8), 0 0 30px rgba(245,158,11,0.25);
        text-align: center;
      }
      h1 {
        font-size: 20px;
        margin: 0 0 6px 0;
        color: #FFFFFF;
      }
      .subtitle {
        font-size: 12px;
        color: #FBBF24;
        font-weight: 700;
        margin-bottom: 16px;
      }
      video {
        width: 100%;
        max-height: 580px;
        border-radius: 16px;
        border: 1px solid rgba(255,255,255,0.1);
        box-shadow: 0 8px 24px rgba(0,0,0,0.5);
        background: #000;
      }
      .badge-row {
        display: flex;
        justify-content: center;
        gap: 8px;
        margin-top: 14px;
        flex-wrap: wrap;
      }
      .badge {
        padding: 4px 10px;
        border-radius: 999px;
        background: rgba(255,255,255,0.08);
        border: 1px solid rgba(255,255,255,0.15);
        font-size: 10px;
        font-weight: 700;
        color: #CBD5E1;
      }
      .btn {
        display: inline-block;
        margin-top: 16px;
        padding: 12px 24px;
        background: linear-gradient(135deg, #F59E0B, #EA580C);
        color: #000;
        font-weight: 900;
        text-decoration: none;
        border-radius: 12px;
        box-shadow: 0 4px 0 #92400E;
        font-size: 13px;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <h1>👑 JACK QUIZ: OFFICIAL VIDEO WALKTHROUGH</h1>
      <div class="subtitle">Created by Ayan Ali &bull; JAC Class 10 Gamified Ecosystem</div>
      <video controls autoplay loop muted playsinline src="data:video/webm;base64,${videoBase64}"></video>
      <div class="badge-row">
        <span class="badge">🐾 3D Green Mascot</span>
        <span class="badge">⚡ 60s Speed Drill</span>
        <span class="badge">🧠 Leitner Mistake Vault</span>
        <span class="badge">🔥 Airlearn Buddy Streak</span>
      </div>
      <div>
        <a class="btn" href="http://localhost:3000" target="_blank">🚀 Open Live Jack Quiz Website</a>
      </div>
    </div>
  </body>
  </html>
  `;

  fs.writeFileSync(outputHtmlPlayerPath, playerHtml);
  console.log(`✓ HTML Video Player artifact saved to: ${outputHtmlPlayerPath}`);

  await browser.close();
}

record().catch(err => {
  console.error('Recording error:', err);
  process.exit(1);
});
