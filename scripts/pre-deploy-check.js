#!/usr/bin/env node

/**
 * Script de verificación pre-deploy
 * Verifica que todos los archivos y configuraciones estén correctos
 */

import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Colores para console
const colors = {
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    reset: '\x1b[0m',
    bold: '\x1b[1m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkFile(filePath, description) {
    if (existsSync(filePath)) {
        log(`✅ ${description}`, 'green');
        return true;
    } else {
        log(`❌ ${description} - FALTANTE`, 'red');
        return false;
    }
}

function checkPackageJson() {
    log('\n📦 Verificando package.json...', 'blue');
    
    try {
        const packagePath = join(__dirname, '..', 'package.json');
        const packageJson = JSON.parse(readFileSync(packagePath, 'utf8'));
        
        // Verificar scripts requeridos
        const requiredScripts = ['start', 'dev', 'deploy'];
        const missingScripts = requiredScripts.filter(script => !packageJson.scripts[script]);
        
        if (missingScripts.length === 0) {
            log('✅ Scripts requeridos presentes', 'green');
        } else {
            log(`❌ Scripts faltantes: ${missingScripts.join(', ')}`, 'red');
        }
        
        // Verificar dependencias
        const requiredDeps = ['discord.js', 'sqlite3', 'dotenv', 'moment', 'winston'];
        const missingDeps = requiredDeps.filter(dep => !packageJson.dependencies[dep]);
        
        if (missingDeps.length === 0) {
            log('✅ Dependencias requeridas presentes', 'green');
        } else {
            log(`❌ Dependencias faltantes: ${missingDeps.join(', ')}`, 'red');
        }
        
        return missingScripts.length === 0 && missingDeps.length === 0;
        
    } catch (error) {
        log(`❌ Error leyendo package.json: ${error.message}`, 'red');
        return false;
    }
}

function checkEnvExample() {
    log('\n🔧 Verificando env.example...', 'blue');
    
    try {
        const envPath = join(__dirname, '..', 'env.example');
        const envContent = readFileSync(envPath, 'utf8');
        
        const requiredVars = [
            'DISCORD_TOKEN',
            'CLIENT_ID', 
            'GUILD_ID',
            'ADMIN_IDS',
            'TRADING_CHANNEL_ID',
            'SUPPORTED_ASSETS'
        ];
        
        const missingVars = requiredVars.filter(varName => !envContent.includes(varName));
        
        if (missingVars.length === 0) {
            log('✅ Variables de entorno requeridas presentes', 'green');
        } else {
            log(`❌ Variables faltantes: ${missingVars.join(', ')}`, 'red');
        }
        
        return missingVars.length === 0;
        
    } catch (error) {
        log(`❌ Error leyendo env.example: ${error.message}`, 'red');
        return false;
    }
}

function checkCommands() {
    log('\n🤖 Verificando comandos...', 'blue');
    
    const commandsPath = join(__dirname, '..', 'src', 'commands');
    const requiredCommands = ['entry.js', 'trades.js', 'update.js'];
    
    let allPresent = true;
    for (const command of requiredCommands) {
        const commandPath = join(commandsPath, command);
        if (existsSync(commandPath)) {
            log(`✅ ${command}`, 'green');
        } else {
            log(`❌ ${command} - FALTANTE`, 'red');
            allPresent = false;
        }
    }
    
    return allPresent;
}

function checkRenderConfig() {
    log('\n🚀 Verificando configuración de Render...', 'blue');
    
    const renderPath = join(__dirname, '..', 'render.yaml');
    if (!existsSync(renderPath)) {
        log('❌ render.yaml no encontrado', 'red');
        return false;
    }
    
    try {
        const renderContent = readFileSync(renderPath, 'utf8');
        
        const requiredConfigs = [
            'buildCommand: npm install',
            'startCommand: npm start',
            'DISCORD_TOKEN',
            'CLIENT_ID',
            'ADMIN_IDS'
        ];
        
        const missingConfigs = requiredConfigs.filter(config => !renderContent.includes(config));
        
        if (missingConfigs.length === 0) {
            log('✅ Configuración de Render correcta', 'green');
        } else {
            log(`❌ Configuración faltante: ${missingConfigs.join(', ')}`, 'red');
        }
        
        return missingConfigs.length === 0;
        
    } catch (error) {
        log(`❌ Error leyendo render.yaml: ${error.message}`, 'red');
        return false;
    }
}

function main() {
    log('🚀 VERIFICACIÓN PRE-DEPLOY', 'bold');
    log('========================', 'blue');
    
    const checks = [
        { name: 'Archivos principales', check: () => {
            return checkFile('package.json', 'package.json') &&
                   checkFile('src/index.js', 'src/index.js') &&
                   checkFile('.gitignore', '.gitignore') &&
                   checkFile('render.yaml', 'render.yaml');
        }},
        { name: 'package.json', check: checkPackageJson },
        { name: 'Variables de entorno', check: checkEnvExample },
        { name: 'Comandos del bot', check: checkCommands },
        { name: 'Configuración Render', check: checkRenderConfig }
    ];
    
    let allPassed = true;
    
    for (const check of checks) {
        const passed = check.check();
        if (!passed) allPassed = false;
    }
    
    log('\n📋 RESUMEN:', 'bold');
    log('==========', 'blue');
    
    if (allPassed) {
        log('🎉 ¡TODO LISTO PARA DEPLOY!', 'green');
        log('\n✅ El proyecto está completamente preparado para Render.com', 'green');
        log('📝 Sigue las instrucciones en DEPLOY_GUIDE.md', 'yellow');
        log('🚀 ¡Adelante con el deploy!', 'green');
    } else {
        log('❌ HAY PROBLEMAS QUE CORREGIR', 'red');
        log('\n🔧 Corrige los errores mostrados arriba antes del deploy', 'yellow');
        log('📝 Revisa los archivos faltantes o mal configurados', 'yellow');
    }
    
    process.exit(allPassed ? 0 : 1);
}

main();
