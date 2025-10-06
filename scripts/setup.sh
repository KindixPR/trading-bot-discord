#!/bin/bash

# Script de configuración rápida para Trading Bot Discord
# Ejecutar con: bash scripts/setup.sh

echo "🚀 Configurando Trading Bot Discord para Micro Futures..."
echo "=================================================="

# Verificar si Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js no está instalado"
    echo "   Por favor instala Node.js v18+ desde: https://nodejs.org"
    exit 1
fi

echo "✅ Node.js encontrado: $(node --version)"

# Verificar si npm está instalado
if ! command -v npm &> /dev/null; then
    echo "❌ npm no está instalado"
    exit 1
fi

echo "✅ npm encontrado: $(npm --version)"

# Crear archivo .env si no existe
if [ ! -f .env ]; then
    echo "📝 Creando archivo .env desde env.example..."
    cp env.example .env
    echo "✅ Archivo .env creado"
    echo "⚠️  IMPORTANTE: Edita el archivo .env con tus datos de Discord"
else
    echo "✅ Archivo .env ya existe"
fi

# Instalar dependencias
echo "📦 Instalando dependencias..."
npm install

if [ $? -eq 0 ]; then
    echo "✅ Dependencias instaladas correctamente"
else
    echo "❌ Error instalando dependencias"
    exit 1
fi

# Crear carpetas necesarias
echo "📁 Creando carpetas necesarias..."
mkdir -p data
mkdir -p logs

echo "✅ Carpetas creadas"

# Verificar configuración
echo "🔍 Verificando configuración..."
node scripts/verify-setup.js

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 ¡Configuración completada exitosamente!"
    echo ""
    echo "📋 Próximos pasos:"
    echo "1. Edita el archivo .env con tus datos de Discord"
    echo "2. npm run deploy  # Registrar comandos slash"
    echo "3. npm start       # Ejecutar el bot"
    echo ""
    echo "📖 Para más información, lee SETUP_LOCAL.md"
else
    echo ""
    echo "❌ Configuración incompleta"
    echo "📖 Revisa SETUP_LOCAL.md para más detalles"
fi
