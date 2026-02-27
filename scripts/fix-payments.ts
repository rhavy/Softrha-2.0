/**
 * Script para corrigir status de pagamentos processados mas não atualizados
 * 
 * Uso: npx tsx scripts/fix-payments.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixPayments() {
  console.log('\n🔧 Corrigindo status de pagamentos...\n');

  // Buscar pagamentos pagos mas com budget não atualizado
  const payments = await prisma.payment.findMany({
    where: {
      status: 'paid',
      budget: {
        status: {
          notIn: ['down_payment_paid', 'final_payment_paid', 'completed'],
        },
      },
    },
    include: {
      budget: true,
    },
  });

  console.log(`📊 Pagamentos para corrigir: ${payments.length}\n`);

  for (const payment of payments) {
    console.log('─────────────────────────────────────');
    console.log(`💳 Pagamento: ${payment.id}`);
    console.log(`   Tipo: ${payment.type}`);
    console.log(`   Valor: R$ ${payment.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`);
    console.log(`   Budget Status Atual: ${payment.budget.status}`);
    
    const expectedStatus = payment.type === 'down_payment' ? 'down_payment_paid' : 'final_payment_paid';
    console.log(`   Budget Status Esperado: ${expectedStatus}`);
    
    // Atualizar budget
    await prisma.budget.update({
      where: { id: payment.budgetId },
      data: {
        status: expectedStatus,
      },
    });
    
    console.log(`✅ Budget atualizado para: ${expectedStatus}`);
    
    // Se for down_payment e não tiver projeto, criar projeto
    if (payment.type === 'down_payment' && !payment.budget.projectId) {
      console.log('\n🚀 Criando projeto automaticamente...');
      
      // Buscar ou criar cliente
      let client = await prisma.client.findFirst({
        where: {
          OR: [
            { emails: { contains: payment.budget.clientEmail } },
            { name: payment.budget.clientName },
          ],
        },
      });

      if (!client) {
        const nameParts = payment.budget.clientName.split(' ');
        const firstName = nameParts[0] || payment.budget.clientName;
        const lastName = nameParts.slice(1).join(' ') || 'Cliente';

        client = await prisma.client.create({
          data: {
            firstName,
            lastName,
            name: payment.budget.clientName,
            documentType: 'cpf',
            document: `FIX_${Date.now()}`,
            emails: payment.budget.clientEmail
              ? JSON.stringify([{ id: '1', value: payment.budget.clientEmail, type: 'pessoal', isPrimary: true }])
              : null,
            phones: payment.budget.clientPhone
              ? JSON.stringify([{ id: '1', value: payment.budget.clientPhone, type: 'whatsapp', isPrimary: true }])
              : null,
            status: 'active',
          },
        });
        console.log(`✅ Cliente criado: ${client.id}`);
      }

      // Buscar admin user
      const adminUser = await prisma.user.findFirst({
        where: { role: 'ADMIN' },
      });

      // Criar projeto
      const project = await prisma.project.create({
        data: {
          name: `${payment.budget.projectType} - ${payment.budget.clientName}`,
          description: payment.budget.details || `Projeto criado após pagamento da entrada`,
          status: 'planning',
          type: payment.budget.projectType,
          complexity: payment.budget.complexity,
          timeline: payment.budget.timeline,
          budget: payment.budget.finalValue,
          clientId: client.id,
          clientName: payment.budget.clientName,
          createdById: adminUser?.id || null,
          progress: 0,
        },
      });
      
      console.log(`✅ Projeto criado: ${project.id}`);
      
      // Atualizar budget com projectId
      await prisma.budget.update({
        where: { id: payment.budgetId },
        data: {
          projectId: project.id,
        },
      });
      
      console.log(`✅ Budget vinculado ao projeto: ${project.id}`);
      
      // Atualizar pagamento com projectId
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          projectId: project.id,
        },
      });
      
      console.log(`✅ Pagamento vinculado ao projeto: ${project.id}`);
      
      // Buscar contrato se existir
      const contract = await prisma.contract.findUnique({
        where: { budgetId: payment.budgetId },
      });
      
      if (contract) {
        await prisma.contract.update({
          where: { id: contract.id },
          data: {
            projectId: project.id,
            status: 'signed',
            signedAt: new Date(),
          },
        });
        console.log(`✅ Contrato atualizado e vinculado ao projeto`);
      }
    }
    
    console.log('');
  }

  await prisma.$disconnect();
  
  console.log('\n✅ Correção concluída!\n');
}

fixPayments().catch(console.error);
