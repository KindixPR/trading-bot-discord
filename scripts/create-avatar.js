import { createCanvas } from 'canvas';
import fs from 'fs';
import path from 'path';

// Función para crear un avatar profesional para Vitaly Signals
function createProfessionalAvatar() {
    const size = 512; // Tamaño estándar para avatares de Discord
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');

    // Fondo degradado profesional con colores de Vitaly
    const gradient = ctx.createLinearGradient(0, 0, size, size);
    gradient.addColorStop(0, '#1abc9c'); // Verde azulado (Vitaly brand)
    gradient.addColorStop(1, '#16a085'); // Verde más oscuro
    
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
    ctx.strokeStyle = '#f39c12';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.arc(centerX, centerY, circleRadius, 0, 2 * Math.PI);
    ctx.stroke();

    // Texto "V" principal (Vitaly)
    ctx.fillStyle = '#1abc9c';
    ctx.font = 'bold 140px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Sombra del texto
    ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    
    ctx.fillText('V', centerX, centerY - 10);
    
    // Resetear sombra
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    // Texto "SIGNALS" secundario
    ctx.fillStyle = '#16a085';
    ctx.font = 'bold 28px Arial, sans-serif';
    ctx.fillText('SIGNALS', centerX, centerY + 70);

    // Icono de gráfico en la esquina
    ctx.fillStyle = '#f39c12';
    ctx.font = '50px Arial, sans-serif';
    ctx.fillText('📈', centerX + 130, centerY - 70);

    // Pequeño "5" en la esquina para @5vitaly
    ctx.fillStyle = '#e74c3c';
    ctx.font = 'bold 40px Arial, sans-serif';
    ctx.fillText('5', centerX - 130, centerY - 70);

    return canvas;
}

// Función para crear avatar alternativo más minimalista para Vitaly
function createMinimalistAvatar() {
    const size = 512;
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');

    // Fondo sólido elegante con colores de Vitaly
    ctx.fillStyle = '#1abc9c';
    ctx.fillRect(0, 0, size, size);

    // Círculo central
    const centerX = size / 2;
    const centerY = size / 2;
    const circleRadius = 200;
    
    // Círculo con gradiente
    const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, circleRadius);
    gradient.addColorStop(0, '#16a085');
    gradient.addColorStop(1, '#138d75');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(centerX, centerY, circleRadius, 0, 2 * Math.PI);
    ctx.fill();

    // Texto "V" minimalista (Vitaly)
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 160px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('V', centerX, centerY);

    // Pequeño "5" en la esquina
    ctx.fillStyle = '#f39c12';
    ctx.font = 'bold 50px Arial, sans-serif';
    ctx.fillText('5', centerX + 150, centerY - 150);

    return canvas;
}

// Crear los avatares
try {
    console.log('🎨 Creando avatar profesional para Vitaly Signals...');
    
    // Crear directorio de assets si no existe
    const assetsDir = './assets';
    if (!fs.existsSync(assetsDir)) {
        fs.mkdirSync(assetsDir);
    }
    
    // Avatar profesional
    const professionalAvatar = createProfessionalAvatar();
    const professionalBuffer = professionalAvatar.toBuffer('image/png');
    fs.writeFileSync(path.join(assetsDir, 'vitaly-avatar-professional.png'), professionalBuffer);
    console.log('✅ Avatar profesional creado: assets/vitaly-avatar-professional.png');
    
    // Avatar minimalista
    const minimalistAvatar = createMinimalistAvatar();
    const minimalistBuffer = minimalistAvatar.toBuffer('image/png');
    fs.writeFileSync(path.join(assetsDir, 'vitaly-avatar-minimalist.png'), minimalistBuffer);
    console.log('✅ Avatar minimalista creado: assets/vitaly-avatar-minimalist.png');
    
    console.log('🎉 ¡Avatares de Vitaly Signals creados exitosamente!');
    console.log('📝 Instrucciones para usar:');
    console.log('   1. Ve al Discord Developer Portal');
    console.log('   2. Selecciona tu aplicación "Vitaly Trades"');
    console.log('   3. Ve a la sección "App Icon"');
    console.log('   4. Sube uno de los archivos PNG creados');
    console.log('   5. ¡Guarda los cambios!');
    console.log('');
    console.log('🏷️ Tags recomendados:');
    console.log('   - trading');
    console.log('   - signals');
    console.log('   - futures');
    console.log('   - professional');
    console.log('   - vitaly');
    
} catch (error) {
    console.error('❌ Error creando avatares:', error);
    console.log('💡 Nota: Necesitas instalar la librería "canvas" para generar imágenes');
    console.log('   Ejecuta: npm install canvas');
}
