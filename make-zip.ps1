$projectName = "Promptwise"
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$zipFileName = "$projectName-$timestamp.zip"

Write-Host "Creating: $zipFileName" -ForegroundColor Cyan

$items = Get-ChildItem -Path . -Recurse -File | Where-Object {
    $path = $_.FullName
    -not ($path -match "\\node_modules\\") -and
    -not ($path -match "\\dist\\") -and
    -not ($path -match "\\.vs\\") -and
    -not ($path -match "\\.vercel\\") -and
    -not ($path -match "\.vsidx") -and
    -not ($path -match "\.log") -and
    -not ($_.Name -eq ".env")
}

Add-Type -Assembly System.IO.Compression.FileSystem
$zipPath = Join-Path (Get-Location) $zipFileName
if (Test-Path $zipPath) { Remove-Item $zipPath -Force }
$zip = [System.IO.Compression.ZipFile]::Open($zipPath, 'Create')
$currentDir = (Get-Location).Path

try {
    $count = 0
    foreach ($file in $items) {
        $count++
        if ($count % 50 -eq 0) { Write-Host "  $count files..." -ForegroundColor Gray }
        $relativePath = $file.FullName.Substring($currentDir.Length + 1)
        try {
            [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zip, $file.FullName, $relativePath, 'Optimal') | Out-Null
        } catch {}
    }
} finally {
    $zip.Dispose()
}

Write-Host "Done! File: $zipFileName" -ForegroundColor Green
if (Test-Path $zipPath) {
    $size = [Math]::Round((Get-Item $zipPath).Length / 1MB, 2)
    Write-Host "Size: $size MB" -ForegroundColor Yellow
}
