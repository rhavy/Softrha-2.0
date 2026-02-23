/**
 * Script para verificar e corrigir status de pagamentos
 * 
 * Uso: npx tsx scripts/check-payments.ts [budgetId]
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkPayments(budgetId?: string) {
  console.log('\n🔍 Verificando status de pagamentos...\n');

  // Buscar pagamentos
  const payments = await prisma.payment.findMany({
    where: budgetId ? { budgetId } : {},
    include: {
      budget: true,
      project: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  console.log(`📊 Pagamentos encontrados: ${payments.length}\n`);

  for (const payment of payments) {
    console.log('─────────────────────────────────────');
    console.log(`💳 Pagamento: ${payment.id}`);
    console.log(`   Tipo: ${payment.type}`);
    console.log(`   Status: ${payment.status}`);
    console.log(`   Valor: R$ ${payment.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`);
    console.log(`   Budget ID: ${payment.budgetId}`);
    console.log(`   Project ID: ${payment.projectId || 'null'}`);
    console.log(`   Pago em: ${payment.paidAt ? new Date(payment.paidAt).toLocaleString('pt-BR') : 'Não pago'}`);
    
    console.log('\n   📋 Status do Budget:');
    console.log(`      ID: ${payment.budget.id}`);
    console.log(`      Status: ${payment.budget.status}`);
    console.log(`      Project ID: ${payment.budget.projectId || 'null'}`);
    
    if (payment.project) {
      console.log('\n   🚀 Status do Projeto:');
      console.log(`      ID: ${payment.project.id}`);
      console.log(`      Status: ${payment.project.status}`);
      console.log(`      Progresso: ${payment.project.progress}%`);
    }
    
    console.log('');
  }

  // Verificar inconsistências
  console.log('\n🔍 Verificando inconsistências...\n');
  
  for (const payment of payments) {
    if (payment.status === 'paid') {
      // Verificar se budget está com status correto
      const expectedBudgetStatus = payment.type === 'down_payment' ? 'down_payment_paid' : 'final_payment_paid';
      
      if (payment.budget.status !== expectedBudgetStatus) {
        console.log(`⚠️  INCONSISTÊNCIA: Pagamento ${payment.id} está pago, mas budget está com status ${payment.budget.status}`);
        console.log(`   Esperado: ${expectedBudgetStatus}`);
        
        const confirm = await new Promise<boolean>((resolve) => {
          const readline = require('readline').createInterface({
            input: process.stdin,
            output: process.stdout,
          });
          
          readline.question('\n   Deseja corrigir? (s/n): ', (answer: string) => {
            readline.close();
            resolve(answer.toLowerCase() === 's');
          });
        });
        
        if (confirm) {
          await prisma.budget.update({
            where: { id: payment.budgetId },
            data: {
              status: expectedBudgetStatus,
            },
          });
          console.log(`✅ Budget ${payment.budgetId} atualizado para ${expectedBudgetStatus}`);
        }
      }
      
      // Verificar se projeto existe para down_payment
      if (payment.type === 'down_payment' && !payment.projectId) {
        console.log(`⚠️  INCONSISTÊNCIA: Pagamento ${payment.id} é down_payment pago, mas não tem projeto vinculado`);
      }
    }
  }

  await prisma.$disconnect();
  
  console.log('\n✅ Verificação concluída!\n');
}

// EXECUÇÃO
const budgetId = process.argv[2];

if (budgetId) {
  console.log(`\n🔍 Verificando pagamentos do budget: ${budgetId}\n`);
} else {
  console.log('\n💡 Dica: Use "npx tsx scripts/check-payments.ts [budgetId]" para verificar um budget específico\n');
}

checkPayments(budgetId).catch(console.error);
