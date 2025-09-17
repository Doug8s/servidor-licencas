// Conteúdo para o arquivo: servidor-licencas/gerar-chave.js

const crypto = require('crypto');

// Gera uma chave no formato: VF-ABC123D4-E5F6-789G-H012-I3JK45L67M89
const key = `VF-${crypto.randomUUID().toUpperCase()}`;

console.log('Sua nova chave de licença é:');
console.log(key);