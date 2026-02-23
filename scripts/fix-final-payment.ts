/**
 * Script para corrigir pagamento final processado mas não atualizado
 * 
 * Uso: npx tsx scripts/fix-final-payment.ts [projectId]
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixFinalPayment(projectId: string) {
  console.log('\n🔧 Corrigindo pagamento final para projeto:', projectId, '\n');

  // Buscar projeto
  const project = await prisma.project.findUnique({
    where: { id: projectId },
  });

  if (!project) {
    console.log('❌ Projeto não encontrado!\n');
    await prisma.$disconnect();
    return;
  }

  console.log('📊 Projeto encontrado:');
  console.log('   ID:', project.id);
  console.log('   Nome:', project.name);
  console.log('   Status:', project.status);
  console.log('   Progresso:', project.progress);
  console.log('');

  // Buscar budget vinculado ao projeto
  const budget = await prisma.budget.findFirst({
    where: { projectId: projectId },
  });

  if (!budget) {
    console.log('❌ Orçamento não encontrado para este projeto!\n');
    await prisma.$disconnect();
    return;
  }

  console.log('📋 Orçamento encontrado:');
  console.log('   ID:', budget.id);
  console.log('   Status:', budget.status);
  console.log('   Client:', budget.clientName);
  console.log('');

  // Buscar pagamento final
  const finalPayment = await prisma.payment.findFirst({
    where: {
      projectId: projectId,
      type: 'final_payment',
    },
  });

  if (!finalPayment) {
    console.log('❌ Pagamento final não encontrado!\n');
    await prisma.$disconnect();
    return;
  }

  console.log('💰 Pagamento final encontrado:');
  console.log('   ID:', finalPayment.id);
  console.log('   Status:', finalPayment.status);
  console.log('   Valor: R$', finalPayment.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 }));
  console.log('   Pago em:', finalPayment.paidAt ? new Date(finalPayment.paidAt).toLocaleString('pt-BR') : 'Não pago');
  console.log('');

  // Verificar se precisa atualizar
  const needsUpdate = project.status !== 'completed' || budget.status !== 'completed' || finalPayment.status !== 'paid';

  if (!needsUpdate) {
    console.log('✅ Projeto, orçamento e pagamento já estão atualizados!\n');
    await prisma.$disconnect();
    return;
  }

  // Atualizar pagamento se estiver pending
  if (finalPayment.status === 'pending') {
    console.log('🔄 Atualizando pagamento para "paid"...');
    await prisma.payment.update({
      where: { id: finalPayment.id },
      data: {
        status: 'paid',
        paidAt: new Date(),
      },
    });
    console.log('✅ Pagamento atualizado!\n');
  }

  // Atualizar projeto
  if (project.status !== 'completed') {
    console.log('🔄 Atualizando projeto para "completed"...');
    await prisma.project.update({
      where: { id: projectId },
      data: {
        status: 'completed',
        progress: 100,
        completedAt: new Date(),
      },
    });
    console.log('✅ Projeto atualizado!\n');
  }

  // Atualizar budget
  if (budget.status !== 'completed') {
    console.log('🔄 Atualizando orçamento para "completed"...');
    await prisma.budget.update({
      where: { id: budget.id },
      data: {
        status: 'completed',
      },
    });
    console.log('✅ Orçamento atualizado!\n');
  }

  console.log('═══════════════════════════════════════════════════════');
  console.log('✅ CORREÇÃO CONCLUÍDA!');
  console.log('═══════════════════════════════════════════════════════');
  console.log('');
  console.log('Status atual:');
  console.log('   Projeto:', project.id, '→ completed');
  console.log('   Orçamento:', budget.id, '→ completed');
  console.log('   Pagamento:', finalPayment.id, '→', finalPayment.status);
  console.log('');
  console.log('Próximos passos:');
  console.log('   1. Cliente pode agendar entrega em:');
  console.log('      /projetos/' + projectId + '/agendar');
  console.log('');

  await prisma.$disconnect();
}

// EXECUÇÃO
const projectId = process.argv[2];

if (!projectId) {
  console.log('\n❌ Uso: npx tsx scripts/fix-final-payment.ts [projectId]\n');
  console.log('Exemplo: npx tsx scripts/fix-final-payment.ts cmlyjffgj000bvdhs15zg9ila\n');
  process.exit(1);
}

fixFinalPayment(projectId).catch(console.error);
