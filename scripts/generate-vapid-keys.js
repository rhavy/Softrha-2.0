#!/usr/bin/env node

/**
 * Script para gerar chaves VAPID para Web Push Notifications
 * 
 * Uso: node scripts/generate-vapid-keys.js
 * 
 * Copie as chaves geradas para o arquivo .env.local
 */

const webPush = require('web-push');

console.log('\n🔑 Gerando chaves VAPID para Web Push Notifications...\n');

const keys = webPush.generateVAPIDKeys();

console.log('✅ Chaves geradas com sucesso!\n');
console.log('📋 Adicione as seguintes linhas no seu arquivo .env.local:\n');
console.log('─'.repeat(60));
console.log(`NEXT_PUBLIC_VAPID_PUBLIC_KEY=${keys.publicKey}`);
console.log(`VAPID_PRIVATE_KEY=${keys.privateKey}`);
console.log('VAPID_SUBJECT="mailto:support@softrha.com"');
console.log('─'.repeat(60));
console.log('\n💡 Dica: Mantenha sua VAPID_PRIVATE_KEY em segredo!\n');
