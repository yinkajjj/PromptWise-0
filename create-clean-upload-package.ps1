# PromptWise Clean GitHub Upload Package Creator
# Creates a zip file ready to upload to GitHub

$ErrorActionPreference = "Stop"

Write-Host "🎯 Creating Clean GitHub Upload Package..." -ForegroundColor Cyan

# Output location
$desktopPath = [Environment]::GetFolderPath("Desktop")
$timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm"
$zipName = "PromptWise_GitHub_Upload_$timestamp.zip"
$zipPath = Join-Path $desktopPath $zipName
$tempFolder = Join-Path $env:TEMP "promptwise_clean_$(Get-Random)"

Write-Host "📦 Output: $zipPath" -ForegroundColor Green

# Create temp directory
New-Item -ItemType Directory -Path $tempFolder -Force | Out-Null
Write-Host "✓ Created temporary folder" -ForegroundColor Green

# Files and folders to EXCLUDE
$excludePatterns = @(
    "node_modules",
    ".git",
    ".github",
    "dist",
    ".vercel",
    ".vscode",
    ".idea",
    "*.log",
    "*.tmp",
    ".DS_Store",
    "Thumbs.db",
    ".env.local",
    ".env.*.local",
    "coverage",
    ".nyc_output",
    "Promptwise",  # Exclude the Git subfolder
    "*.zip",
    "*.tar.gz",
    "*.tgz"
)

# Copy files to temp folder (excluding unwanted files)
Write-Host "📂 Copying project files..." -ForegroundColor Yellow

Get-ChildItem -Path "." -Recurse | ForEach-Object {
    $relativePath = $_.FullName.Substring((Get-Location).Path.Length + 1)
    
    # Check if item should be excluded
    $shouldExclude = $false
    foreach ($pattern in $excludePatterns) {
        if ($relativePath -like "*$pattern*") {
            $shouldExclude = $true
            break
        }
    }
    
    if (-not $shouldExclude) {
        $destination = Join-Path $tempFolder $relativePath
        
        if ($_.PSIsContainer) {
            # Create directory
            if (-not (Test-Path $destination)) {
                New-Item -ItemType Directory -Path $destination -Force | Out-Null
            }
        } else {
            # Copy file
            $destDir = Split-Path $destination -Parent
            if (-not (Test-Path $destDir)) {
                New-Item -ItemType Directory -Path $destDir -Force | Out-Null
            }
            Copy-Item $_.FullName -Destination $destination -Force
        }
    }
}

Write-Host "✓ Files copied successfully" -ForegroundColor Green

# Create README for uploading
$uploadReadme = @"
# PromptWise - GitHub Upload Package
**Created**: $(Get-Date -Format "yyyy-MM-dd HH:mm")

## ✨ Latest Features Included:
- ✅ Intelligent 3-tier prompt system (Basic/Better/Expert)
- ✅ Refinement flow with platform & content type questions
- ✅ Card-based UI with copy buttons
- ✅ Short-form video creator positioning
- ✅ Updated headlines and copy
- ✅ Video-focused categories

## 📦 How to Upload to GitHub:

### Option 1: Replace Repository Contents (Recommended)
1. Go to your GitHub repository: https://github.com/yinkajjj/PromptWise-0
2. Delete all existing files (or create a new empty branch)
3. Extract this zip file
4. Upload all extracted files to GitHub
5. Commit with message: "Update with 3-tier intelligent prompt system"

### Option 2: Clone, Replace, Push (Advanced)
``````powershell
# Clone your repo
git clone https://github.com/yinkajjj/PromptWise-0.git
cd PromptWise-0

# Remove all files except .git
Get-ChildItem -Exclude .git | Remove-Item -Recurse -Force

# Extract this zip and copy contents to repo folder
# Then commit and push
git add .
git commit -m "Update with 3-tier intelligent prompt system"
git push origin main
``````

## ⚙️ Setup After Upload:
1. Install dependencies: ``pnpm install``
2. Create ``.env`` file (copy from ``.env.example``)
3. Add your OpenAI API key to ``.env``
4. Run: ``pnpm dev``

## 🚀 For Vercel Deployment:
1. Connect your GitHub repo to Vercel
2. Add environment variable: ``OPENAI_API_KEY``
3. Deploy!

---
**Package created by**: create-clean-upload-package.ps1
"@

Set-Content -Path (Join-Path $tempFolder "GITHUB_UPLOAD_README.md") -Value $uploadReadme
Write-Host "✓ Created upload instructions" -ForegroundColor Green

# Create the zip file
Write-Host "🗜️ Creating zip archive..." -ForegroundColor Yellow
if (Test-Path $zipPath) {
    Remove-Item $zipPath -Force
}

Add-Type -Assembly 'System.IO.Compression.FileSystem'
[System.IO.Compression.ZipFile]::CreateFromDirectory($tempFolder, $zipPath)

# Clean up temp folder
Remove-Item $tempFolder -Recurse -Force

# Get zip file size
$zipSize = (Get-Item $zipPath).Length / 1MB
$zipSizeFormatted = "{0:N2} MB" -f $zipSize

Write-Host ""
Write-Host "============================================" -ForegroundColor Green
Write-Host "✅ SUCCESS! Package Created!" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green
Write-Host ""
Write-Host "📦 File: $zipName" -ForegroundColor Cyan
Write-Host "📍 Location: $desktopPath" -ForegroundColor Cyan
Write-Host "📊 Size: $zipSizeFormatted" -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 What's included:" -ForegroundColor Yellow
Write-Host "   ✅ All source code (client/ server/ shared/)" -ForegroundColor White
Write-Host "   ✅ 3-tier prompt system with refinement flow" -ForegroundColor White
Write-Host "   ✅ Updated UI and branding" -ForegroundColor White
Write-Host "   ✅ Configuration files (package.json, tsconfig, etc.)" -ForegroundColor White
Write-Host "   ✅ Documentation (README, setup guides)" -ForegroundColor White
Write-Host "   ✅ Vercel deployment config" -ForegroundColor White
Write-Host ""
Write-Host "🚫 Excluded (will be installed/generated):" -ForegroundColor Yellow
Write-Host "   • node_modules" -ForegroundColor DarkGray
Write-Host "   • dist/" -ForegroundColor DarkGray
Write-Host "   • .git/" -ForegroundColor DarkGray
Write-Host "   • build artifacts" -ForegroundColor DarkGray
Write-Host ""
Write-Host "📝 Next Steps:" -ForegroundColor Cyan
Write-Host "   1. Go to GitHub: https://github.com/yinkajjj/PromptWise-0" -ForegroundColor White
Write-Host "   2. Upload all files from the zip" -ForegroundColor White
Write-Host "   3. See GITHUB_UPLOAD_README.md inside for detailed instructions" -ForegroundColor White
Write-Host ""
Write-Host "🎉 Ready to upload to GitHub!" -ForegroundColor Green
Write-Host ""

# Open the Desktop folder
Start-Process "explorer.exe" $desktopPath
