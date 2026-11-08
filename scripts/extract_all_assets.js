const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const psScript = `
Add-Type -AssemblyName System.IO.Compression.FileSystem

# 1. Extract Profile Photo
$profileZip = 'C:/Users/pcpcp/.gemini/antigravity/brain/021135fb-5a03-4fd3-ab11-70e4667758e5/.user_uploaded/media_1794158037432_2754dd0a.zip'
$profArchive = [System.IO.Compression.ZipFile]::OpenRead($profileZip)
$targetProfDir = 'C:/Users/pcpcp/.gemini/antigravity/scratch/study-buddy-royal/public/images/profile'
if (!(Test-Path $targetProfDir)) { New-Item -ItemType Directory -Path $targetProfDir -Force }
foreach ($e in $profArchive.Entries) {
  if ($e.Name.Length -gt 0) {
    $dest = Join-Path $targetProfDir $e.Name
    [System.IO.Compression.ZipFileExtensions]::ExtractToFile($e, $dest, $true)
    # Also create standard reference
    Copy-Item $dest (Join-Path $targetProfDir 'custom_reference.png') -Force
    Write-Host "Extracted profile photo: $dest"
  }
}
$profArchive.Dispose()

# 2. Extract Subject Logos
$subjectZip = 'C:/Users/pcpcp/.gemini/antigravity/brain/021135fb-5a03-4fd3-ab11-70e4667758e5/.user_uploaded/media_1794158045444_be33d743.zip'
$subjArchive = [System.IO.Compression.ZipFile]::OpenRead($subjectZip)
$targetSubjDir = 'C:/Users/pcpcp/.gemini/antigravity/scratch/study-buddy-royal/public/images/subjects/official'
if (!(Test-Path $targetSubjDir)) { New-Item -ItemType Directory -Path $targetSubjDir -Force }
foreach ($e in $subjArchive.Entries) {
  if ($e.Name.Length -gt 0) {
    $cleanPath = $e.FullName.Replace('SUBJECT LOGO/', '')
    $dest = Join-Path $targetSubjDir $cleanPath
    $parent = Split-Path $dest
    if (!(Test-Path $parent)) { New-Item -ItemType Directory -Path $parent -Force }
    [System.IO.Compression.ZipFileExtensions]::ExtractToFile($e, $dest, $true)
  }
}
$subjArchive.Dispose()
Write-Host "Extracted subject logos"

# 3. Extract Avatar reference images & roll prompt
$avatarZip = 'C:/Users/pcpcp/.gemini/antigravity/brain/021135fb-5a03-4fd3-ab11-70e4667758e5/.user_uploaded/media_1794158043943_c8c50d5a.zip'
$avatarArchive = [System.IO.Compression.ZipFile]::OpenRead($avatarZip)
$targetAvatarRefDir = 'C:/Users/pcpcp/.gemini/antigravity/scratch/study-buddy-royal/public/avatar_references'
if (!(Test-Path $targetAvatarRefDir)) { New-Item -ItemType Directory -Path $targetAvatarRefDir -Force }
foreach ($e in $avatarArchive.Entries) {
  if ($e.FullName -like '*original characters and ui reference*' -and $e.Name.Length -gt 0) {
    $dest = Join-Path $targetAvatarRefDir $e.Name
    [System.IO.Compression.ZipFileExtensions]::ExtractToFile($e, $dest, $true)
    Write-Host "Extracted avatar ref: $dest"
  }
}
$avatarArchive.Dispose()
Write-Host "All assets extracted successfully."
`;

fs.writeFileSync('C:/Users/pcpcp/.gemini/antigravity/scratch/extract_all_assets.ps1', psScript);
console.log('Script written.');
