# Simple PromptWise Package Creator
# Output: Desktop\New Folder 4\PromptWise_Latest.zip

Write-Host "Creating PromptWise package..." -ForegroundColor Cyan

# Paths
$desktop = [Environment]::GetFolderPath("Desktop")
$outputFolder = Join-Path $desktop "New Folder 4"
$zipFile = Join-Path $outputFolder "PromptWise_Latest.zip"
$tempDir = Join-Path $env:TEMP "promptwise_temp"

# Clean up old temp if exists
if (Test-Path $tempDir) {
    Remove-Item $tempDir -Recurse -Force
}

# Create directories
New-Item -ItemType Directory -Path $tempDir -Force | Out-Null
New-Item -ItemType Directory -Path $outputFolder -Force | Out-Null

Write-Host "Copying files..." -ForegroundColor Yellow

# Copy everything except excluded folders/files
$exclude = @('node_modules', '.git', 'dist', '.vercel', '.vscode', 'Promptwise')
Get-ChildItem -Path . -Recurse | Where-Object {
    $item = $_
    $shouldCopy = $true
    
    foreach ($ex in $exclude) {
        if ($item.FullName -like "*\$ex\*" -or $item.Name -eq $ex) {
            $shouldCopy = $false
            break
        }
    }
    
    # Skip zip files, logs, temp files
    if ($item.Extension -in @('.zip', '.log', '.tmp')) {
        $shouldCopy = $false
    }
    
    return $shouldCopy
} | ForEach-Object {
    $relativePath = $_.FullName.Substring($PWD.Path.Length + 1)
    $destination = Join-Path $tempDir $relativePath
    
    if ($_.PSIsContainer) {
        New-Item -ItemType Directory -Path $destination -Force | Out-Null
    } else {
        $destFolder = Split-Path $destination -Parent
        if (!(Test-Path $destFolder)) {
            New-Item -ItemType Directory -Path $destFolder -Force | Out-Null
        }
        Copy-Item $_.FullName -Destination $destination -Force
    }
}

Write-Host "Creating zip..." -ForegroundColor Yellow

# Remove old zip if exists
if (Test-Path $zipFile) {
    Remove-Item $zipFile -Force
}

# Create zip
Compress-Archive -Path "$tempDir\*" -DestinationPath $zipFile -CompressionLevel Optimal

# Clean up temp
Remove-Item $tempDir -Recurse -Force

# Show results
$sizeMB = [math]::Round((Get-Item $zipFile).Length / 1MB, 2)

Write-Host ""
Write-Host "SUCCESS!" -ForegroundColor Green
Write-Host "Location: $outputFolder" -ForegroundColor Cyan
Write-Host "File: PromptWise_Latest.zip" -ForegroundColor Cyan
Write-Host "Size: $sizeMB MB" -ForegroundColor Cyan
Write-Host ""

# Open folder
explorer $outputFolder
