#!/usr/bin/env pwsh
# PromptWise - Quick Start Script
# This script helps you get started with PromptWise

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  PromptWise - Quick Start" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if .env exists
if (Test-Path ".env") {
    Write-Host "✓ .env file found" -ForegroundColor Green
} else {
    Write-Host "⚠ .env file not found. Creating from template..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host "✓ Created .env file" -ForegroundColor Green
    Write-Host ""
    Write-Host "IMPORTANT: Edit .env and add your OPENAI_API_KEY" -ForegroundColor Yellow
    Write-Host "Get your key from: https://platform.openai.com/api-keys" -ForegroundColor Cyan
    Write-Host ""
    Read-Host "Press Enter after you've added your API key to .env"
}

Write-Host ""
Write-Host "Checking OpenAI API Key..." -ForegroundColor Cyan

# Check if API key is set in .env
$envContent = Get-Content ".env" -Raw
if ($envContent -match "OPENAI_API_KEY=sk-") {
    Write-Host "✓ OpenAI API key is configured" -ForegroundColor Green
} else {
    Write-Host "⚠ OpenAI API key not found in .env" -ForegroundColor Yellow
    Write-Host "Generation features will use fallback mode (mock data)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Starting PromptWise..." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Client will run on: http://localhost:3000" -ForegroundColor Green
Write-Host "Server will run on: http://localhost:3001" -ForegroundColor Green
Write-Host ""
Write-Host "Press Ctrl+C to stop" -ForegroundColor Yellow
Write-Host ""

# Run the dev:all command
pnpm run dev:all
