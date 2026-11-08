const fs = require('fs');
const path = require('path');
const AdmZip = (() => {
  try {
    return require('adm-zip');
  } catch (e) {
    return null;
  }
})();

// Use node unzipper or PowerShell via simple script
const { execSync } = require('child_process');
const psScript = `
Add-Type -AssemblyName System.IO.Compression.FileSystem
$zips = @(
  'C:/Users/pcpcp/.gemini/antigravity/brain/021135fb-5a03-4fd3-ab11-70e4667758e5/.user_uploaded/media_1794158043943_c8c50d5a.zip',
  'C:/Users/pcpcp/.gemini/antigravity/brain/021135fb-5a03-4fd3-ab11-70e4667758e5/.user_uploaded/media_1794158037432_2754dd0a.zip',
  'C:/Users/pcpcp/.gemini/antigravity/brain/021135fb-5a03-4fd3-ab11-70e4667758e5/.user_uploaded/media_1794158045444_be33d743.zip'
)
foreach ($z in $zips) {
  Write-Host "FILE: $z"
  $archive = [System.IO.Compression.ZipFile]::OpenRead($z)
  foreach ($entry in $archive.Entries) {
    Write-Host "  " $entry.FullName
  }
  $archive.Dispose()
}
`;
fs.writeFileSync('C:/Users/pcpcp/.gemini/antigravity/scratch/inspect_zips.ps1', psScript);
console.log('Script written');
