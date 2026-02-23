/**
 * Script para simular o pagamento final (75%)
 * Atualiza o status do projeto e orçamento para "completed"
 * 
 * Uso: npx tsx scripts/simulate-final-payment.ts [projectId]
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message: string, color: string = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

async function simulateFinalPayment(projectId: string) {
  log('\n========================================', colors.cyan);
  log('💰 SIMULANDO PAGAMENTO FINAL (75%)', colors.cyan);
  log('========================================\n', colors.cyan);

  try {
    // 1. Buscar projeto
    log('📋 [1/5] Buscando projeto...', colors.blue);
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        contract: {
          include: {
            budget: true,
          },
        },
      },
    });

    if (!project) {
      throw new Error(`Projeto ${projectId} não encontrado`);
    }

    log(`✅ Projeto encontrado:`, colors.green);
    console.log({
      id: project.id,
      name: project.name,
      status: project.status,
      progress: project.progress,
    });

    const budget = project.contract?.budget;
    if (!budget) {
      throw new Error('Orçamento não encontrado para este projeto');
    }

    // 2. Verificar se já está completo
    if (project.status === 'completed') {
      log('\n⚠️  ATENÇÃO: Este projeto já está com status "completed"', colors.yellow);
      return;
    }

    // 3. Criar/Atualizar pagamento final
    log('\n💳 [2/5] Criando/atualizando pagamento final...', colors.blue);
    const finalPaymentAmount = (budget.finalValue || 0) * 0.75;

    const existingPayment = await prisma.payment.findFirst({
      where: {
        projectId,
        type: 'final_payment',
      },
    });

    let payment;
    if (existingPayment) {
      log(`📝 Atualizando pagamento existente: ${existingPayment.id}`, colors.yellow);
      payment = await prisma.payment.update({
        where: { id: existingPayment.id },
        data: {
          status: 'paid',
          paidAt: new Date(),
          amount: finalPaymentAmount,
        },
      });
    } else {
      log(`🆕 Criando novo pagamento final...`, colors.yellow);
      payment = await prisma.payment.create({
        data: {
          budgetId: budget.id,
          projectId,
          amount: finalPaymentAmount,
          type: 'final_payment',
          description: `Pagamento Final 75% - ${project.name}`,
          status: 'paid',
          paidAt: new Date(),
          dueDate: new Date(),
        },
      });
    }

    log(`✅ Pagamento final processado: ${payment.id}`, colors.green);
    console.log({
      id: payment.id,
      amount: payment.amount,
      status: payment.status,
      type: payment.type,
      paidAt: payment.paidAt,
    });

    // 4. Atualizar projeto para completed
    log('\n🚀 [3/5] Atualizando projeto para "completed"...', colors.blue);
    await prisma.project.update({
      where: { id: projectId },
      data: {
        status: 'completed',
        progress: 100,
        completedAt: new Date(),
      },
    });

    log(`✅ Projeto atualizado para "completed"`, colors.green);

    // 5. Atualizar orçamento para completed
    log('\n📝 [4/5] Atualizando orçamento para "completed"...', colors.blue);
    await prisma.budget.update({
      where: { id: budget.id },
      data: {
        status: 'completed',
      },
    });

    log(`✅ Orçamento atualizado para "completed"`, colors.green);

    // 6. Atualizar contrato se existir
    log('\n📄 [5/5] Verificando contrato...', colors.blue);
    if (project.contract) {
      await prisma.contract.update({
        where: { id: project.contract.id },
        data: {
          status: 'signed',
        },
      });
      log(`✅ Contrato verificado: ${project.contract.id}`, colors.green);
    } else {
      log(`⚠️  Nenhum contrato encontrado`, colors.yellow);
    }

    // RESUMO FINAL
    log('\n========================================', colors.green);
    log('🎉 PAGAMENTO FINAL SIMULADO COM SUCESSO!', colors.green);
    log('========================================\n', colors.green);

    console.log('📊 RESUMO DAS OPERAÇÕES:');
    console.log('─────────────────────────────────────');
    console.log(`✅ Projeto:        ${project.id} → completed`);
    console.log(`✅ Pagamento:      ${payment.id} → paid`);
    console.log(`✅ Orçamento:      ${budget.id} → completed`);
    if (project.contract) {
      console.log(`✅ Contrato:       ${project.contract.id} → signed`);
    }
    console.log('─────────────────────────────────────');

    log('\n🔗 LINKS ÚTEIS:', colors.cyan);
    console.log(`   • Ver Projeto:     /dashboard/projetos/${projectId}`);
    console.log(`   • Agendar Entrega: /projetos/${projectId}/agendar`);
    console.log(`   • Debug Budget:    /dashboard/orcamentos/${budget.id}/debug`);

    log('\n💡 PRÓXIMOS PASSOS:', colors.yellow);
    console.log('   1. Recarregue a página do projeto');
    console.log('   2. Botão "Agendar Entrega" deve aparecer');
    console.log('   3. Card informativo sobre agendamento será exibido');
    console.log('   4. Cliente pode agendar entrega em: /projetos/' + projectId + '/agendar');

    return {
      success: true,
      projectId,
      paymentId: payment.id,
      budgetId: budget.id,
    };
  } catch (error) {
    log('\n❌ ERRO AO SIMULAR PAGAMENTO FINAL:', colors.red);
    console.error(error);

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    };
  } finally {
    await prisma.$disconnect();
  }
}

// EXECUÇÃO
const projectId = process.argv[2];

if (!projectId) {
  log('\n❌ Uso: npx tsx scripts/simulate-final-payment.ts [projectId]', colors.red);
  log('\nExemplo:', colors.yellow);
  console.log('  npx tsx scripts/simulate-final-payment.ts cmly1uaap0001vdj43yb01ves');
  process.exit(1);
}

log(`\n🚀 Iniciando simulação do pagamento final para projeto: ${projectId}`, colors.cyan);

simulateFinalPayment(projectId)
  .then((result) => {
    if (result?.success) {
      log('\n✅ Script executado com sucesso!\n', colors.green);
      process.exit(0);
    } else {
      log('\n❌ Script falhou!\n', colors.red);
      process.exit(1);
    }
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
