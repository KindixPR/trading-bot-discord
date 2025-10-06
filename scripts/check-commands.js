import { loadCommands } from '../src/utils/commandLoader.js';
import { logger } from '../src/utils/logger.js';

async function checkCommands() {
    try {
        console.log('🔍 Verificando comandos disponibles...');
        
        const commands = new Map();
        await loadCommands(commands);
        
        console.log(`\n📊 Total de comandos cargados: ${commands.size}`);
        console.log('\n📋 Lista de comandos:');
        
        commands.forEach((command, name) => {
            console.log(`   ✅ /${name} - ${command.data.description}`);
            
            // Verificar propiedades requeridas
            const hasData = 'data' in command;
            const hasExecute = 'execute' in command;
            const hasPermissions = 'permissions' in command;
            
            console.log(`      - data: ${hasData ? '✅' : '❌'}`);
            console.log(`      - execute: ${hasExecute ? '✅' : '❌'}`);
            console.log(`      - permissions: ${hasPermissions ? '✅' : '❌'}`);
            
            if (!hasData || !hasExecute) {
                console.log(`      ⚠️  PROBLEMA: Comando ${name} no tiene estructura completa`);
            }
        });
        
        console.log('\n🎯 Comandos esperados:');
        console.log('   - /entry (Crear operación)');
        console.log('   - /update (Actualizar operación)');
        console.log('   - /trades (Ver operaciones)');
        console.log('   - /about (Información del bot)');
        console.log('   - /setup (Configurar servidor)');
        
        const expectedCommands = ['entry', 'update', 'trades', 'about', 'setup'];
        const missingCommands = expectedCommands.filter(cmd => !commands.has(cmd));
        
        if (missingCommands.length > 0) {
            console.log(`\n❌ Comandos faltantes: ${missingCommands.join(', ')}`);
        } else {
            console.log('\n✅ Todos los comandos esperados están disponibles');
        }
        
    } catch (error) {
        console.error('❌ Error verificando comandos:', error);
    }
}

checkCommands();
