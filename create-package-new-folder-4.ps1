# Create Clean PromptWise Upload Package
# Saves to: Desktop\New Folder 4

$ErrorActionPreference = "Stop"

Write-Host "🎯 Creating PromptWise GitHub Upload Package..." -ForegroundColor Cyan

# Create "New Folder 4" on Desktop
$desktopPath = [Environment]::GetFolderPath("Desktop")
$outputFolder = Join-Path $desktopPath "New Folder 4"
$zipName = "PromptWise_Latest_Upload.zip"
$zipPath = Join-Path $outputFolder $zipName
$tempFolder = Join-Path $env:TEMP "promptwise_package_$(Get-Random)"

# Create output folder if it doesn't exist
if (-not (Test-Path $outputFolder)) {
    New-Item -ItemType Directory -Path $outputFolder -Force | Out-Null
    Write-Host "✓ Created 'New Folder 4' on Desktop" -ForegroundColor Green
}

# Create temp directory
New-Item -ItemType Directory -Path $tempFolder -Force | Out-Null
Write-Host "✓ Created temporary folder" -ForegroundColor Green

# Exclude patterns
$excludePatterns = @(
    "*node_modules*",
    "*.git*",
    "*dist*",
    "*.vercel*",
    "*.vscode*",
    "*.idea*",
    "*.log",
    "*.tmp",
    ".DS_Store",
    "Thumbs.db",
    ".env.local",
    "*.env.*.local",
    "*coverage*",
    "*.nyc_output*",
    "*Promptwise*",
    "*.zip",
    "*.tar.gz"
)

Write-Host "📂 Copying files..." -ForegroundColor Yellow

# Copy all files except excluded ones
$fileCount = 0
Get-ChildItem -Path "." -Recurse -Force | ForEach-Object {
    $relativePath = $_.FullName.Substring((Get-Location).Path.Length + 1)
    
    # Check if should exclude
    $shouldExclude = $false
    foreach ($pattern in $excludePatterns) {
        if ($relativePath -like $pattern) {
            $shouldExclude = $true
            break
        }
    }
    
    if (-not $shouldExclude) {
        $destination = Join-Path $tempFolder $relativePath
        
        if ($_.PSIsContainer) {
            if (-not (Test-Path $destination)) {
                New-Item -ItemType Directory -Path $destination -Force | Out-Null
            }
        } else {
            $destDir = Split-Path $destination -Parent
            if (-not (Test-Path $destDir)) {
                New-Item -ItemType Directory -Path $destDir -Force | Out-Null
            }
            Copy-Item $_.FullName -Destination $destination -Force
            $fileCount++
        }
    }
}

Write-Host "✓ Copied $fileCount files" -ForegroundColor Green

# Create upload instructions
$readme = @"
# 🎉 PromptWise - Latest GitHub Upload
**Package Created**: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")

## ✨ What's New in This Version:
- ✅ **3-Tier Prompt System**: Basic, Better, Expert prompts
- ✅ **Intelligent Refinement**: Platform & content type questions
- ✅ **Beautiful Card UI**: Copy buttons with feedback
- ✅ **Video Creator Focus**: Built for TikTok/Shorts/Reels
- ✅ **Updated Branding**: "The only prompt tool for short-form video creators"

## 📦 How to Upload to GitHub:

### Quick Upload Method:
1. Go to: https://github.com/yinkajjj/PromptWise-0
2. Click "Add file" → "Upload files"
3. Drag all extracted files from this zip
4. Commit: "Add 3-tier intelligent prompt system"

### Or use Git:
``````bash
# Extract this zip, then:
cd path/to/extracted/files
git init
git add .
git commit -m "Add 3-tier intelligent prompt system"
git remote add origin https://github.com/yinkajjj/PromptWise-0.git
git push -f origin main
``````

## 🚀 After Upload - Setup:
1. ``pnpm install``
2. Copy ``.env.example`` to ``.env``
3. Add your OpenAI API key
4. Run: ``pnpm dev``

## 📋 Files Included:
- ✅ All source code (client/, server/, shared/)
- ✅ Updated Home.tsx with 3-tier system
- ✅ Configuration files
- ✅ Documentation
- ✅ Vercel deployment config

## 🚫 Excluded (will be generated):
- node_modules (install with pnpm install)
- dist (built with pnpm build)
- .git (create new or use existing)

---
**Ready to make PromptWise amazing!** 🚀
"@

Set-Content -Path (Join-Path $tempFolder "UPLOAD_INSTRUCTIONS.md") -Value $readme

# Create zip
Write-Host "🗜️ Creating zip file..." -ForegroundColor Yellow
if (Test-Path $zipPath) {
    Remove-Item $zipPath -Force
}

Add-Type -Assembly 'System.IO.Compression.FileSystem'
[System.IO.Compression.ZipFile]::CreateFromDirectory($tempFolder, $zipPath, 'Optimal', $false)

# Clean up
Remove-Item $tempFolder -Recurse -Force

# Get info
$zipSize = (Get-Item $zipPath).Length / 1MB
$zipSizeMB = "{0:N2} MB" -f $zipSize

Write-Host ""
Write-Host "═══════════════════════════════════════════" -ForegroundColor Green
Write-Host "    ✅ SUCCESS! Package Created!" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════" -ForegroundColor Green
Write-Host ""
Write-Host "📦 File: $zipName" -ForegroundColor Cyan
Write-Host "📍 Location: $outputFolder" -ForegroundColor Cyan
Write-Host "📊 Size: $zipSizeMB" -ForegroundColor Cyan
Write-Host "📄 Files: $fileCount files included" -ForegroundColor Cyan
Write-Host ""
Write-Host "✨ What's Inside:" -ForegroundColor Yellow
Write-Host "   • 3-tier intelligent prompt system" -ForegroundColor White
Write-Host "   • Refinement flow with questions" -ForegroundColor White
Write-Host "   • Card-based UI design" -ForegroundColor White
Write-Host "   • Short-form video focus" -ForegroundColor White
Write-Host "   • All latest updates" -ForegroundColor White
Write-Host ""
Write-Host "📝 Next: Extract zip and upload to GitHub!" -ForegroundColor Cyan
Write-Host ""

# Open the folder
Start-Process "explorer.exe" $outputFolder
