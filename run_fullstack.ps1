# ==============================================================================
# AdaptIQ Full-Stack Startup Script
# Starts both the Express.js Backend (:5000) and the Vite React Frontend (:5173)
# ==============================================================================

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "🚀 Starting AdaptIQ Adaptive Learning Platform (Full-Stack)" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

$root = $PSScriptRoot

# 1. Start Backend Express Server in separate background window
Write-Host "[1/2] Launching Backend Server on port 5000..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\server'; Write-Host '--- AdaptIQ Backend Server (:5000) ---' -ForegroundColor Green; npm start"

# Brief pause for backend initialization
Start-Sleep -Seconds 3

# 2. Start Frontend Vite Dev Server in current console
Write-Host "[2/2] Launching Frontend Client on port 5173..." -ForegroundColor Green
Write-Host "🌐 Opening http://localhost:5173 in your default browser..." -ForegroundColor Cyan

Set-Location "$root\client"
npm run dev
