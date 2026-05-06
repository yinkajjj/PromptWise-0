$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$packageName = "Promptwise-GitHub-Upload-$timestamp"
$desktopPath = [Environment]::GetFolderPath("Desktop")
$packageDir = Join-Path $desktopPath $packageName
$zipPath = "$packageDir.zip"

Write-Host "Creating clean GitHub package..." -ForegroundColor Cyan
Write-Host "Location: Desktop\$packageName.zip" -ForegroundColor Yellow
Write-Host ""

$includeFolders = @("client", "server", "shared", "api")
$includeFiles = @(
    "package.json", "pnpm-lock.yaml", "tsconfig.json", "vite.config.ts",
    "tailwind.config.js", "postcss.config.js", ".env.example",
    "README.md", "SETUP.md", "VERCEL_DEPLOYMENT.md", "vercel.json",
    ".gitignore", "start.ps1"
)

if (Test-Path $packageDir) { Remove-Item -Path $packageDir -Recurse -Force }
New-Item -ItemType Directory -Path $packageDir -Force | Out-Null

Write-Host "Copying folders..." -ForegroundColor Cyan
foreach ($folder in $includeFolders) {
    if (Test-Path $folder) {
        Write-Host "  + $folder/" -ForegroundColor Green
        Copy-Item -Path $folder -Destination $packageDir -Recurse -Force
    }
}

Write-Host "Copying files..." -ForegroundColor Cyan
foreach ($file in $includeFiles) {
    if (Test-Path $file) {
        Write-Host "  + $file" -ForegroundColor Green
        Copy-Item -Path $file -Destination $packageDir -Force
    }
}

Write-Host ""
Write-Host "Creating ZIP..." -ForegroundColor Yellow

if (Test-Path $zipPath) { Remove-Item $zipPath -Force }
Compress-Archive -Path "$packageDir\*" -DestinationPath $zipPath -CompressionLevel Optimal
Remove-Item -Path $packageDir -Recurse -Force

Write-Host ""
Write-Host "SUCCESS!" -ForegroundColor Green
Write-Host "Package: $zipPath" -ForegroundColor Yellow

if (Test-Path $zipPath) {
    $size = [Math]::Round((Get-Item $zipPath).Length / 1MB, 2)
    Write-Host "Size: $size MB" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Find it on your Desktop: $packageName.zip" -ForegroundColor White
}
