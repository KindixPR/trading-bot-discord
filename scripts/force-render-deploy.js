#!/usr/bin/env node

/**
 * Script para forzar redeploy en Render.com
 * Úsalo solo si el deploy automático no funciona
 */

console.log('🔄 Para forzar un redeploy en Render.com:');
console.log('');
console.log('1. Ve a tu servicio en Render.com');
console.log('2. Clic en "Manual Deploy"');
console.log('3. Selecciona "Deploy latest commit"');
console.log('4. Espera 2-3 minutos');
console.log('');
console.log('O alternativamente:');
console.log('');
console.log('1. Ve a GitHub.com');
console.log('2. Abre tu repositorio');
console.log('3. Clic en "Actions"');
console.log('4. Si no hay actions, el deploy es automático desde Render');
console.log('');
console.log('📊 Verifica los logs en Render.com para confirmar:');
console.log('- "Directorio de datos creado: /opt/render/project/data"');
console.log('- "Bot conectado como Vitaly Trades#9566"');
console.log('- Sin errores de base de datos');
console.log('');
console.log('🎯 Si el problema persiste, el error puede ser:');
console.log('- Variables de entorno faltantes');
console.log('- Permisos de escritura en Render');
console.log('- Problema con SQLite en el entorno de Render');
