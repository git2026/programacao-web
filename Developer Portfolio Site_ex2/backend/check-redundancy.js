import fs from 'fs';

const html = fs.readFileSync('api-tester.html', 'utf-8');

console.log('🔍 Análise de Redundâncias:\n');

// 1. Verificar classes CSS não usadas
const cssClasses = [...html.matchAll(/\.([a-z-]+)\s*\{/g)].map(m => m[1]);
const usedClasses = [...html.matchAll(/class="([^"]+)"/g)].map(m => m[1].split(' ')).flat();

const unusedClasses = cssClasses.filter(c => 
    !usedClasses.includes(c) && 
    !c.includes('hover') && 
    !c.includes('active') && 
    !c.includes('focus') &&
    !c.startsWith('status-') &&
    !c.startsWith('method') &&
    !c.startsWith('badge')
);

console.log('❌ Classes CSS possivelmente não usadas:');
if (unusedClasses.length === 0) {
    console.log('   ✓ Nenhuma encontrada!\n');
} else {
    unusedClasses.forEach(c => console.log(`   - .${c}`));
    console.log('');
}

// 2. Verificar IDs HTML
const definedIds = [...html.matchAll(/id="([^"]+)"/g)].map(m => m[1]);
const usedIds = [...html.matchAll(/getElementById\(['"]([^'"]+)['"]\)/g)].map(m => m[1]);

const unusedIds = definedIds.filter(id => !usedIds.includes(id));

console.log('❌ IDs HTML possivelmente não usados:');
if (unusedIds.length === 0) {
    console.log('   ✓ Nenhum encontrado!\n');
} else {
    unusedIds.forEach(id => console.log(`   - #${id}`));
    console.log('');
}

// 3. Verificar funções JavaScript
const definedFunctions = [...html.matchAll(/(?:async\s+)?function\s+(\w+)/g)].map(m => m[1]);
const usedInOnclick = [...html.matchAll(/onclick="(\w+)/g)].map(m => m[1]);
const usedInCode = [...html.matchAll(/(\w+)\(/g)].map(m => m[1]);

const allUsed = [...new Set([...usedInOnclick, ...usedInCode])];
const unusedFunctions = definedFunctions.filter(f => !allUsed.includes(f));

console.log('❌ Funções JavaScript possivelmente não usadas:');
if (unusedFunctions.length === 0) {
    console.log('   ✓ Nenhuma encontrada!\n');
} else {
    unusedFunctions.forEach(f => console.log(`   - ${f}()`));
    console.log('');
}

// 4. Estatísticas
console.log('📊 Estatísticas:');
console.log(`   - Total de classes CSS definidas: ${cssClasses.length}`);
console.log(`   - Total de IDs HTML: ${definedIds.length}`);
console.log(`   - Total de funções JS: ${definedFunctions.length}`);
console.log(`   - Tamanho do arquivo: ${(html.length / 1024).toFixed(2)} KB`);

// 5. Informações sobre o <title>
console.log('\n📝 Nota sobre o <title>:');
console.log('   ✓ O <title> É USADO - aparece na aba do browser');
console.log('   ✓ Não é visível na página, mas é importante para SEO');
console.log('   ✓ Ajuda a identificar a aba quando tem múltiplas abertas');

