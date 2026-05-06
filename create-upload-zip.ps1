# Create PromptWise Upload Package to Desktop\New Folder 4
$ErrorActionPreference = "Stop"

Write-Host "Creating PromptWise upload package..." -ForegroundColor Cyan

# Setup paths
$desktopPath = [Environment]::GetFolderPath("Desktop")
$outputFolder = Join-Path $desktopPath "New Folder 4"
$zipName = "PromptWise_Latest_Upload.zip"
$zipPath = Join-Path $outputFolder $zipName
$tempFolder = Join-Path $env:TEMP "promptwise_package_$(Get-Random)"

# Create output folder
if (-not (Test-Path $outputFolder)) {
    New-Item -ItemType Directory -Path $outputFolder -Force | Out-Null
    Write-Host "Created 'New Folder 4' on Desktop" -ForegroundColor Green
}

# Create temp directory
New-Item -ItemType Directory -Path $tempFolder -Force | Out-Null

# Exclude patterns
$excludePatterns = @(
    "*node_modules*",
    "*.git*",
    "*dist*",
    "*.vercel*",
    "*.vscode*",
    "*.idea*",
    "*.log",
    ".DS_Store",
    ".env.local",
    "*coverage*",
    "*Promptwise*",
    "*.zip",
    "*.ps1"
)

Write-Host "Copying files..." -ForegroundColor Yellow

# Copy files
$fileCount = 0
Get-ChildItem -Path "." -Recurse -Force | ForEach-Object {
    $relativePath = $_.FullName.Substring((Get-Location).Path.Length + 1)
    
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

Write-Host "Copied $fileCount files" -ForegroundColor Green

# Create README
$readmeContent = @"
# PromptWise - GitHub Upload Package
Package Created: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")

## Upload to GitHub:
1. Go to: https://github.com/yinkajjj/PromptWise-0
2. Click "Add file" > "Upload files"
3. Drag all files from this package
4. Commit changes

## Setup After Upload:
1. pnpm install
2. Copy .env.example to .env
3. Add your OpenAI API key
4. Run: pnpm dev

Ready to upload!
"@

Set-Content -Path (Join-Path $tempFolder "README.txt") -Value $readmeContent -Encoding UTF8

# Create zip
Write-Host "Creating zip file..." -ForegroundColor Yellow
if (Test-Path $zipPath) {
    Remove-Item $zipPath -Force
}

Add-Type -Assembly 'System.IO.Compression.FileSystem'
[System.IO.Compression.ZipFile]::CreateFromDirectory($tempFolder, $zipPath, 'Optimal', $false)

# Cleanup
Remove-Item $tempFolder -Recurse -Force

# Show results
$zipSize = (Get-Item $zipPath).Length / 1MB
Write-Host "`nSuccess!" -ForegroundColor Green
Write-Host "Location: $zipPath" -ForegroundColor Cyan
Write-Host "Size: $([math]::Round($zipSize, 2)) MB" -ForegroundColor Cyan
Write-Host "Files: $fileCount" -ForegroundColor Cyan
Write-Host "`nReady to upload!" -ForegroundColor Yellow
