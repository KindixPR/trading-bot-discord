import { createCanvas } from 'canvas';
import fs from 'fs';
import path from 'path';

// Función para crear un avatar profesional para el bot
function createProfessionalAvatar() {
    const size = 512; // Tamaño estándar para avatares de Discord
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');

    // Fondo degradado profesional
    const gradient = ctx.createLinearGradient(0, 0, size, size);
    gradient.addColorStop(0, '#2c3e50'); // Azul oscuro elegante
    gradient.addColorStop(1, '#34495e'); // Gris azulado
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);

    // Círculo central con borde dorado
    const centerX = size / 2;
    const centerY = size / 2;
    const circleRadius = 180;
    
    // Sombra del círculo
    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
    ctx.shadowBlur = 20;
    ctx.shadowOffsetX = 5;
    ctx.shadowOffsetY = 5;
    
    // Círculo principal
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(centerX, centerY, circleRadius, 0, 2 * Math.PI);
    ctx.fill();
    
    // Resetear sombra
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    
    // Borde dorado
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.arc(centerX, centerY, circleRadius, 0, 2 * Math.PI);
    ctx.stroke();

    // Texto "BDX" principal
    ctx.fillStyle = '#2c3e50';
    ctx.font = 'bold 120px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Sombra del texto
    ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    
    ctx.fillText('BDX', centerX, centerY - 20);
    
    // Resetear sombra
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    // Texto "TRADERS" secundario
    ctx.fillStyle = '#7f8c8d';
    ctx.font = 'bold 32px Arial, sans-serif';
    ctx.fillText('TRADERS', centerX, centerY + 60);

    // Icono de gráfico pequeño en la esquina
    ctx.fillStyle = '#1abc9c';
    ctx.font = '60px Arial, sans-serif';
    ctx.fillText('📈', centerX + 140, centerY - 80);

    return canvas;
}

// Función para crear avatar alternativo más minimalista
function createMinimalistAvatar() {
    const size = 512;
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');

    // Fondo sólido elegante
    ctx.fillStyle = '#2c3e50';
    ctx.fillRect(0, 0, size, size);

    // Círculo central
    const centerX = size / 2;
    const centerY = size / 2;
    const circleRadius = 200;
    
    // Círculo con gradiente
    const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, circleRadius);
    gradient.addColorStop(0, '#3498db');
    gradient.addColorStop(1, '#2980b9');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(centerX, centerY, circleRadius, 0, 2 * Math.PI);
    ctx.fill();

    // Texto "BDX" minimalista
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 140px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('BDX', centerX, centerY);

    return canvas;
}

// Crear los avatares
try {
    console.log('🎨 Creando avatar profesional para BDX Traders...');
    
    // Crear directorio de assets si no existe
    const assetsDir = './assets';
    if (!fs.existsSync(assetsDir)) {
        fs.mkdirSync(assetsDir);
    }
    
    // Avatar profesional
    const professionalAvatar = createProfessionalAvatar();
    const professionalBuffer = professionalAvatar.toBuffer('image/png');
    fs.writeFileSync(path.join(assetsDir, 'bot-avatar-professional.png'), professionalBuffer);
    console.log('✅ Avatar profesional creado: assets/bot-avatar-professional.png');
    
    // Avatar minimalista
    const minimalistAvatar = createMinimalistAvatar();
    const minimalistBuffer = minimalistAvatar.toBuffer('image/png');
    fs.writeFileSync(path.join(assetsDir, 'bot-avatar-minimalist.png'), minimalistBuffer);
    console.log('✅ Avatar minimalista creado: assets/bot-avatar-minimalist.png');
    
    console.log('🎉 ¡Avatares creados exitosamente!');
    console.log('📝 Instrucciones para usar:');
    console.log('   1. Ve al Discord Developer Portal');
    console.log('   2. Selecciona tu aplicación');
    console.log('   3. Ve a la sección "App Icon"');
    console.log('   4. Sube uno de los archivos PNG creados');
    console.log('   5. ¡Guarda los cambios!');
    
} catch (error) {
    console.error('❌ Error creando avatares:', error);
    console.log('💡 Nota: Necesitas instalar la librería "canvas" para generar imágenes');
    console.log('   Ejecuta: npm install canvas');
}
