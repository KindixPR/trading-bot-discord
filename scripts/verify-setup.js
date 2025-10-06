#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar variables de entorno
dotenv.config({ path: path.join(__dirname, '../.env') });

console.log('🔍 Verificando configuración del Trading Bot Discord...\n');

let allGood = true;

// Verificar archivo .env
console.log('📝 Verificando archivo .env...');
if (!fs.existsSync(path.join(__dirname, '../.env'))) {
    console.log('❌ Archivo .env no encontrado');
    console.log('   Ejecuta: cp env.example .env');
    allGood = false;
} else {
    console.log('✅ Archivo .env encontrado');
}

// Verificar variables de entorno críticas
console.log('\n🔑 Verificando variables de entorno...');
const requiredVars = [
    'DISCORD_TOKEN',
    'CLIENT_ID',
    'GUILD_ID'
];

const optionalVars = [
    'TRADING_CHANNEL_ID',
    'ADMIN_IDS',
    'DATABASE_PATH',
    'SUPPORTED_ASSETS'
];

requiredVars.forEach(varName => {
    if (!process.env[varName]) {
        console.log(`❌ ${varName} no está definido`);
        allGood = false;
    } else {
        console.log(`✅ ${varName} configurado`);
    }
});

optionalVars.forEach(varName => {
    if (!process.env[varName]) {
        console.log(`⚠️  ${varName} no está definido (usando valor por defecto)`);
    } else {
        console.log(`✅ ${varName} configurado`);
    }
});

// Verificar estructura de carpetas
console.log('\n📁 Verificando estructura de carpetas...');
const requiredDirs = [
    'src',
    'src/commands',
    'src/config',
    'src/database',
    'src/utils'
];

requiredDirs.forEach(dir => {
    const dirPath = path.join(__dirname, '..', dir);
    if (!fs.existsSync(dirPath)) {
        console.log(`❌ Carpeta ${dir} no encontrada`);
        allGood = false;
    } else {
        console.log(`✅ Carpeta ${dir} encontrada`);
    }
});

// Verificar archivos críticos
console.log('\n📄 Verificando archivos críticos...');
const requiredFiles = [
    'package.json',
    'src/index.js',
    'src/config/config.js',
    'src/database/database.js',
    'src/commands/entry.js',
    'src/commands/update.js',
    'src/commands/close.js',
    'src/commands/list.js',
    'src/commands/info.js'
];

requiredFiles.forEach(file => {
    const filePath = path.join(__dirname, '..', file);
    if (!fs.existsSync(filePath)) {
        console.log(`❌ Archivo ${file} no encontrado`);
        allGood = false;
    } else {
        console.log(`✅ Archivo ${file} encontrado`);
    }
});

// Verificar dependencias
console.log('\n📦 Verificando dependencias...');
const packageJsonPath = path.join(__dirname, '../package.json');
if (fs.existsSync(packageJsonPath)) {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    const requiredDeps = ['discord.js', 'sqlite3', 'dotenv', 'moment', 'winston'];
    
    requiredDeps.forEach(dep => {
        if (packageJson.dependencies && packageJson.dependencies[dep]) {
            console.log(`✅ ${dep} ${packageJson.dependencies[dep]}`);
        } else {
            console.log(`❌ ${dep} no encontrado en dependencias`);
            allGood = false;
        }
    });
}

// Verificar node_modules
console.log('\n📚 Verificando node_modules...');
const nodeModulesPath = path.join(__dirname, '../node_modules');
if (!fs.existsSync(nodeModulesPath)) {
    console.log('❌ node_modules no encontrado');
    console.log('   Ejecuta: npm install');
    allGood = false;
} else {
    console.log('✅ node_modules encontrado');
}

// Verificar configuración de micro futuros
console.log('\n📊 Verificando configuración de Micro Futures...');
if (process.env.SUPPORTED_ASSETS) {
    const assets = process.env.SUPPORTED_ASSETS.split(',');
    const validAssets = ['US30', 'MNQ', 'MGC'];
    
    assets.forEach(asset => {
        if (validAssets.includes(asset.trim())) {
            console.log(`✅ Activo ${asset.trim()} configurado`);
        } else {
            console.log(`⚠️  Activo ${asset.trim()} no es un micro futuro válido`);
        }
    });
    
    if (assets.length === 3 && validAssets.every(asset => assets.includes(asset.trim()))) {
        console.log('✅ Configuración de Micro Futures correcta');
    } else {
        console.log('⚠️  Configuración de Micro Futures incompleta');
    }
} else {
    console.log('⚠️  SUPPORTED_ASSETS no configurado');
}

// Verificar permisos de escritura
console.log('\n🔐 Verificando permisos de escritura...');
const dataDir = path.join(__dirname, '../data');
const logsDir = path.join(__dirname, '../logs');

try {
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
    }
    if (!fs.existsSync(logsDir)) {
        fs.mkdirSync(logsDir, { recursive: true });
    }
    console.log('✅ Permisos de escritura OK');
} catch (error) {
    console.log('❌ Error con permisos de escritura:', error.message);
    allGood = false;
}

// Resumen final
console.log('\n' + '='.repeat(50));
if (allGood) {
    console.log('🎉 ¡Configuración completada exitosamente!');
    console.log('\n📋 Próximos pasos:');
    console.log('1. npm run deploy  # Registrar comandos slash');
    console.log('2. npm start       # Ejecutar el bot');
    console.log('3. Probar comandos en Discord');
    console.log('\n🚀 El bot está listo para funcionar!');
} else {
    console.log('❌ Configuración incompleta');
    console.log('\n📋 Revisa los errores arriba y corrige:');
    console.log('1. Crea archivo .env desde env.example');
    console.log('2. Configura variables de entorno');
    console.log('3. Ejecuta npm install');
    console.log('4. Ejecuta este script nuevamente');
}
console.log('='.repeat(50));
