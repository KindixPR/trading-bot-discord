# Script de configuración rápida para Trading Bot Discord (Windows PowerShell)
# Ejecutar con: .\scripts\setup.ps1

Write-Host "🚀 Configurando Trading Bot Discord para Micro Futures..." -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Cyan

# Verificar si Node.js está instalado
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js encontrado: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js no está instalado" -ForegroundColor Red
    Write-Host "   Por favor instala Node.js v18+ desde: https://nodejs.org" -ForegroundColor Yellow
    exit 1
}

# Verificar si npm está instalado
try {
    $npmVersion = npm --version
    Write-Host "✅ npm encontrado: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ npm no está instalado" -ForegroundColor Red
    exit 1
}

# Crear archivo .env si no existe
if (-not (Test-Path ".env")) {
    Write-Host "📝 Creando archivo .env desde env.example..." -ForegroundColor Yellow
    Copy-Item "env.example" ".env"
    Write-Host "✅ Archivo .env creado" -ForegroundColor Green
    Write-Host "⚠️  IMPORTANTE: Edita el archivo .env con tus datos de Discord" -ForegroundColor Yellow
} else {
    Write-Host "✅ Archivo .env ya existe" -ForegroundColor Green
}

# Instalar dependencias
Write-Host "📦 Instalando dependencias..." -ForegroundColor Yellow
npm install

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Dependencias instaladas correctamente" -ForegroundColor Green
} else {
    Write-Host "❌ Error instalando dependencias" -ForegroundColor Red
    exit 1
}

# Crear carpetas necesarias
Write-Host "📁 Creando carpetas necesarias..." -ForegroundColor Yellow
if (-not (Test-Path "data")) { New-Item -ItemType Directory -Path "data" | Out-Null }
if (-not (Test-Path "logs")) { New-Item -ItemType Directory -Path "logs" | Out-Null }

Write-Host "✅ Carpetas creadas" -ForegroundColor Green

# Verificar configuración
Write-Host "🔍 Verificando configuración..." -ForegroundColor Yellow
node scripts/verify-setup.js

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "🎉 ¡Configuración completada exitosamente!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 Próximos pasos:" -ForegroundColor Cyan
    Write-Host "1. Edita el archivo .env con tus datos de Discord" -ForegroundColor White
    Write-Host "2. npm run deploy  # Registrar comandos slash" -ForegroundColor White
    Write-Host "3. npm start       # Ejecutar el bot" -ForegroundColor White
    Write-Host ""
    Write-Host "📖 Para más información, lee SETUP_LOCAL.md" -ForegroundColor Cyan
} else {
    Write-Host ""
    Write-Host "❌ Configuración incompleta" -ForegroundColor Red
    Write-Host "📖 Revisa SETUP_LOCAL.md para más detalles" -ForegroundColor Yellow
}
