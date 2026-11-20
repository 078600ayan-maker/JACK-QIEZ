const fs = require('fs');
const filePath = 'public/duo-arena.html';
let content = fs.readFileSync(filePath, 'utf8');

// 1. Remove the 4 buttons from header HTML
content = content.replace(/<button[^>]*id=["']btn-flip-global["'][^>]*>[\s\S]*?<\/button>\s*/gi, '');
content = content.replace(/<button[^>]*id=["']btn-bgm["'][^>]*>[\s\S]*?<\/button>\s*/gi, '');
content = content.replace(/<button[^>]*id=["']btn-sfx["'][^>]*>[\s\S]*?<\/button>\s*/gi, '');
content = content.replace(/<button[^>]*id=["']btn-download-html["'][^>]*>[\s\S]*?<\/button>\s*/gi, '');

// 2. Remove references inside updateHUD
content = content.replace(/const\s+sfxBtn\s*=\s*document\.getElementById\(['"]btn-sfx['"]\);[\s\S]*?sfxBtn\.classList\.toggle\(['"]btn-active['"],\s*AppState\.sfx\);/g, '/* sfx hud removed */');
content = content.replace(/const\s+bgmBtn\s*=\s*document\.getElementById\(['"]btn-bgm['"]\);[\s\S]*?bgmBtn\.classList\.toggle\(['"]btn-active['"],\s*AppState\.bgm\);/g, '/* bgm hud removed */');
content = content.replace(/const\s+flipBtn\s*=\s*document\.getElementById\(['"]btn-flip-global['"]\);[\s\S]*?flipBtn\.classList\.toggle\(['"]btn-active['"],\s*AppState\.flipP2\);/g, '/* flip hud removed */');

// 3. Remove event listeners
content = content.replace(/document\.getElementById\(['"]btn-flip-global['"]\)\??\.addEventListener\(['"]click['"][\s\S]*?\}\);/g, '/* flip-global listener removed */');
content = content.replace(/document\.getElementById\(['"]btn-sfx['"]\)\??\.addEventListener\(['"]click['"][\s\S]*?\}\);/g, '/* sfx listener removed */');
content = content.replace(/document\.getElementById\(['"]btn-bgm['"]\)\??\.addEventListener\(['"]click['"][\s\S]*?\}\);/g, '/* bgm listener removed */');
content = content.replace(/document\.getElementById\(['"]btn-download-html['"]\)\??\.addEventListener\(['"]click['"][\s\S]*?\}\);/g, '/* download-html listener removed */');

fs.writeFileSync(filePath, content, 'utf8');
console.log('duo-arena.html sanitized successfully!');
