/**
 * Script para verificar e atualizar telefone do cliente
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkClientPhone() {
  console.log('\n🔍 Verificando telefones dos clientes...\n');

  // Buscar todos os clientes
  const clients = await prisma.client.findMany({
    select: {
      id: true,
      name: true,
      phones: true,
      emails: true,
    },
  });

  console.log('📋 Clientes encontrados:', clients.length);

  for (const client of clients) {
    console.log('\n─────────────────────────────────────');
    console.log(`Cliente: ${client.name}`);
    console.log(`ID: ${client.id}`);
    
    // Verificar telefones
    let phones = client.phones;
    if (phones) {
      try {
        const phonesData = JSON.parse(phones);
        console.log(`Telefones: ${JSON.stringify(phonesData, null, 2)}`);
      } catch (e) {
        console.log(`Telefones (raw): ${phones}`);
      }
    } else {
      console.log('Telefones: ❌ Não cadastrado');
    }

    // Verificar e-mails
    let emails = client.emails;
    if (emails) {
      try {
        const emailsData = JSON.parse(emails);
        console.log(`E-mails: ${JSON.stringify(emailsData, null, 2)}`);
      } catch (e) {
        console.log(`E-mails (raw): ${emails}`);
      }
    } else {
      console.log('E-mails: ❌ Não cadastrado');
    }
  }

  await prisma.$disconnect();
}

checkClientPhone().catch(console.error);
