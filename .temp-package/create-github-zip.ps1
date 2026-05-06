#!/usr/bin/env pwsh
# Script to create a clean zip file for GitHub upload
# Excludes node_modules, build artifacts, and sensitive files

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Creating GitHub Upload Package" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$projectName = "Promptwise"
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$zipFileName = "${projectName}-${timestamp}.zip"
$tempDir = ".temp-package"

# Files and folders to exclude
$excludePatterns = @(
    "node_modules",
    "dist",
    "build",
    ".next",
    "out",
    ".env",
    ".env.local",
    ".env.development.local",
    ".env.test.local",
    ".env.production.local",
    "*.log",
    ".DS_Store",
    "Thumbs.db",
    ".vscode",
    ".idea",
    "*.swp",
    "*.swo",
    ".vercel",
    ".promptwise-jobs",
    "*.tmp",
    "*.temp",
    ".temp-package",
    "${projectName}-*.zip"
)

Write-Host "Preparing package..." -ForegroundColor Yellow
Write-Host ""

# Create temp directory
if (Test-Path $tempDir) {
    Remove-Item -Path $tempDir -Recurse -Force
}
New-Item -ItemType Directory -Path $tempDir | Out-Null

# Copy files excluding patterns
Write-Host "Copying files (excluding build artifacts and dependencies)..." -ForegroundColor Cyan

$filesToCopy = Get-ChildItem -Path . -Recurse -Force | Where-Object {
    $item = $_
    $relativePath = $item.FullName.Substring((Get-Location).Path.Length + 1)
    
    # Check if item matches any exclude pattern
    $shouldExclude = $false
    foreach ($pattern in $excludePatterns) {
        if ($relativePath -like "*$pattern*") {
            $shouldExclude = $true
            break
        }
    }
    
    -not $shouldExclude
}

$totalFiles = $filesToCopy.Count
$currentFile = 0

foreach ($item in $filesToCopy) {
    $currentFile++
    $relativePath = $item.FullName.Substring((Get-Location).Path.Length + 1)
    $destPath = Join-Path $tempDir $relativePath
    
    if ($item.PSIsContainer) {
        if (-not (Test-Path $destPath)) {
            New-Item -ItemType Directory -Path $destPath -Force | Out-Null
        }
    } else {
        $destDir = Split-Path -Parent $destPath
        if (-not (Test-Path $destDir)) {
            New-Item -ItemType Directory -Path $destDir -Force | Out-Null
        }
        Copy-Item -Path $item.FullName -Destination $destPath -Force
        
        # Show progress every 10%
        if ($currentFile % [Math]::Max(1, [Math]::Floor($totalFiles / 10)) -eq 0) {
            $percent = [Math]::Floor(($currentFile / $totalFiles) * 100)
            Write-Host "  Progress: $percent% ($currentFile / $totalFiles files)" -ForegroundColor Gray
        }
    }
}

Write-Host ""
Write-Host "✓ Copied $totalFiles files" -ForegroundColor Green
Write-Host ""

# Create zip file
Write-Host "Creating zip file: $zipFileName" -ForegroundColor Cyan

if (Test-Path $zipFileName) {
    Remove-Item -Path $zipFileName -Force
}

Compress-Archive -Path "$tempDir\*" -DestinationPath $zipFileName -CompressionLevel Optimal

# Clean up temp directory
Remove-Item -Path $tempDir -Recurse -Force

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  ✓ Package Created Successfully!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Zip file: $zipFileName" -ForegroundColor Yellow

if (Test-Path $zipFileName) {
    $zipSize = [Math]::Round((Get-Item $zipFileName).Length / 1MB, 2)
    Write-Host "Size: $zipSize MB" -ForegroundColor Yellow
} else {
    Write-Host "Warning: Zip file not found!" -ForegroundColor Red
}
Write-Host ""
Write-Host "This package is ready to upload to GitHub!" -ForegroundColor Cyan
Write-Host "It includes:" -ForegroundColor Cyan
Write-Host "  ✓ All source code" -ForegroundColor Gray
Write-Host "  ✓ Configuration files" -ForegroundColor Gray
Write-Host "  ✓ Documentation" -ForegroundColor Gray
Write-Host "  ✓ Vercel deployment config" -ForegroundColor Gray
Write-Host ""
Write-Host "Excluded (to save space):" -ForegroundColor Cyan
Write-Host "  ✗ node_modules/" -ForegroundColor Gray
Write-Host "  ✗ dist/ and build artifacts" -ForegroundColor Gray
Write-Host "  ✗ .env files" -ForegroundColor Gray
Write-Host "  ✗ IDE settings" -ForegroundColor Gray
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Go to https://github.com/yinkajjj/Promptwise1" -ForegroundColor White
Write-Host "2. Upload this zip file via GitHub's web interface" -ForegroundColor White
Write-Host "   (or extract and push via Git)" -ForegroundColor White
Write-Host ""
