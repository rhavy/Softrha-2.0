/**
 * Script para simular exatamente o que o webhook Stripe faria
 * após confirmação do pagamento de 25% (down_payment)
 * 
 * Uso: npx tsx scripts/simulate-webhook.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Configurar cores para logs
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function log(message: string, color: string = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

async function simulateWebhook(budgetId: string) {
  log('\n========================================', colors.cyan);
  log('🔧 SIMULANDO WEBHOOK STRIPE', colors.cyan);
  log('========================================\n', colors.cyan);

  try {
    // ==========================================
    // PASSO 1: Buscar orçamento
    // ==========================================
    log('📋 [1/7] Buscando orçamento...', colors.blue);
    const budget = await prisma.budget.findUnique({
      where: { id: budgetId },
      include: {
        contract: true,
        payments: true,
      },
    });

    if (!budget) {
      throw new Error(`Orçamento ${budgetId} não encontrado`);
    }

    log(`✅ Orçamento encontrado:`, colors.green);
    console.log({
      id: budget.id,
      status: budget.status,
      clientName: budget.clientName,
      clientEmail: budget.clientEmail,
      finalValue: budget.finalValue,
      projectType: budget.projectType,
      projectId: budget.projectId,
    });

    // Verificar se já está pago
    if (budget.status === 'down_payment_paid') {
      log('\n⚠️  ATENÇÃO: Este orçamento já está com status "down_payment_paid"', colors.yellow);
      if (budget.projectId) {
        log(`✅ Projeto já existe: ${budget.projectId}`, colors.green);
        log(`\n💡 Acesse: /dashboard/projetos/${budget.projectId}`, colors.cyan);
        return;
      }
    }

    // ==========================================
    // PASSO 2: Criar/Buscar Cliente
    // ==========================================
    log('\n👤 [2/7] Buscando/criando cliente...', colors.blue);

    let client = await prisma.client.findFirst({
      where: {
        OR: [
          { emails: { contains: budget.clientEmail } },
          { name: budget.clientName },
        ],
      },
    });

    if (client) {
      log(`✅ Cliente existente encontrado: ${client.id}`, colors.green);
    } else {
      log(`🆕 Criando novo cliente...`, colors.yellow);
      const nameParts = budget.clientName.split(' ');
      const firstName = nameParts[0] || budget.clientName;
      const lastName = nameParts.slice(1).join(' ') || 'Cliente';

      client = await prisma.client.create({
        data: {
          firstName,
          lastName,
          name: budget.clientName,
          documentType: 'cpf',
          document: `AUTO_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
          emails: budget.clientEmail
            ? JSON.stringify([
                { id: '1', value: budget.clientEmail, type: 'pessoal', isPrimary: true },
              ])
            : null,
          phones: budget.clientPhone
            ? JSON.stringify([
                { id: '1', value: budget.clientPhone, type: 'whatsapp', isPrimary: true },
              ])
            : null,
          notes: budget.company
            ? `Empresa: ${budget.company}. Criado automaticamente via pagamento de entrada.`
            : 'Criado automaticamente via pagamento de entrada.',
          status: 'active',
        },
      });

      log(`✅ Cliente criado: ${client.id}`, colors.green);
    }

    // ==========================================
    // PASSO 3: Buscar usuário admin
    // ==========================================
    log('\n👨‍💼 [3/7] Buscando usuário admin...', colors.blue);

    const adminUser = await prisma.user.findFirst({
      where: { role: 'ADMIN' },
    });

    if (adminUser) {
      log(`✅ Admin encontrado: ${adminUser.email}`, colors.green);
    } else {
      log(`⚠️  Nenhum admin encontrado. Usando primeiro usuário...`, colors.yellow);
      const firstUser = await prisma.user.findFirst();
      if (firstUser) {
        log(`✅ Usuário encontrado: ${firstUser.email}`, colors.green);
      }
    }

    const creatorUser = adminUser || (await prisma.user.findFirst());

    // ==========================================
    // PASSO 4: Criar Projeto
    // ==========================================
    log('\n🚀 [4/7] Criando projeto automaticamente...', colors.blue);

    // Mapear complexidade
    const complexityMap: Record<string, string> = {
      simple: 'simple',
      medium: 'medium',
      complex: 'complex',
      simples: 'simple',
      medio: 'medium',
      complexo: 'complex',
    };

    // Mapear timeline
    const timelineMap: Record<string, string> = {
      urgent: 'urgent',
      normal: 'normal',
      flexible: 'flexible',
      urgente: 'urgent',
      flexivel: 'flexible',
    };

    const project = await prisma.project.create({
      data: {
        name: `${budget.projectType} - ${budget.clientName}`,
        description:
          budget.details ||
          `Projeto criado após pagamento da entrada - ${budget.clientName}`,
        status: 'planning',
        type: budget.projectType,
        complexity: complexityMap[budget.complexity] || 'medium',
        timeline: timelineMap[budget.timeline] || 'normal',
        budget: budget.finalValue,
        clientId: client.id,
        clientName: budget.clientName,
        createdById: creatorUser?.id || null,
        progress: 0,
      },
    });

    log(`✅ PROJETO CRIADO COM SUCESSO!`, colors.green);
    console.log({
      id: project.id,
      name: project.name,
      status: project.status,
      clientId: project.clientId,
      progress: project.progress,
    });

    // ==========================================
    // PASSO 5: Criar/Atualizar Pagamento
    // ==========================================
    log('\n💰 [5/7] Criando/atualizando pagamento...', colors.blue);

    const downPayment = (budget.finalValue || 0) * 0.25;

    // Verificar se já existe pagamento
    const existingPayment = await prisma.payment.findFirst({
      where: {
        budgetId,
        type: 'down_payment',
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
          projectId: project.id,
          amount: downPayment,
        },
      });
    } else {
      log(`🆕 Criando novo pagamento...`, colors.yellow);
      payment = await prisma.payment.create({
        data: {
          budgetId,
          projectId: project.id,
          amount: downPayment,
          type: 'down_payment',
          description: `Entrada de 25% - ${budget.projectType} - ${budget.clientName}`,
          status: 'paid',
          paidAt: new Date(),
          dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        },
      });
    }

    log(`✅ Pagamento processado: ${payment.id}`, colors.green);
    console.log({
      id: payment.id,
      amount: payment.amount,
      status: payment.status,
      type: payment.type,
      paidAt: payment.paidAt,
    });

    // ==========================================
    // PASSO 6: Atualizar Orçamento
    // ==========================================
    log('\n📝 [6/7] Atualizando orçamento...', colors.blue);

    const updatedBudget = await prisma.budget.update({
      where: { id: budgetId },
      data: {
        status: 'down_payment_paid',
        projectId: project.id,
      },
    });

    log(`✅ Orçamento atualizado:`, colors.green);
    console.log({
      id: updatedBudget.id,
      status: updatedBudget.status,
      projectId: updatedBudget.projectId,
    });

    // ==========================================
    // PASSO 7: Atualizar Contrato
    // ==========================================
    log('\n📄 [7/7] Atualizando contrato...', colors.blue);

    if (budget.contract) {
      await prisma.contract.update({
        where: { id: budget.contract.id },
        data: {
          projectId: project.id,
          status: 'signed',
          confirmed: true,
          signedAt: new Date(),
        },
      });

      log(`✅ Contrato atualizado: ${budget.contract.id}`, colors.green);
    } else {
      log(`⚠️  Nenhum contrato encontrado para este orçamento`, colors.yellow);
    }

    // ==========================================
    // RESUMO FINAL
    // ==========================================
    log('\n========================================', colors.green);
    log('🎉 WEBHOOK SIMULADO COM SUCESSO!', colors.green);
    log('========================================\n', colors.green);

    console.log('📊 RESUMO DAS OPERAÇÕES:');
    console.log('─────────────────────────────────────');
    console.log(`✅ Cliente:        ${client.id}`);
    console.log(`✅ Projeto:        ${project.id}`);
    console.log(`✅ Pagamento:      ${payment.id}`);
    console.log(`✅ Orçamento:      ${updatedBudget.id} → ${updatedBudget.status}`);
    if (budget.contract) {
      console.log(`✅ Contrato:       ${budget.contract.id} → signed`);
    }
    console.log('─────────────────────────────────────');

    log('\n🔗 LINKS ÚTEIS:', colors.cyan);
    console.log(`   • Ver Projeto:     /dashboard/projetos/${project.id}`);
    console.log(`   • Ver Orçamento:   /dashboard/orcamentos/${budgetId}`);
    console.log(`   • Debug:           /dashboard/orcamentos/${budgetId}/debug`);

    log('\n💡 PRÓXIMOS PASSOS:', colors.yellow);
    console.log('   1. Recarregue a página do orçamento');
    console.log('   2. Clique em "Ver Projeto"');
    console.log('   3. Gerencie a evolução do projeto (20%, 50%, 70%, 100%)');

    return {
      success: true,
      projectId: project.id,
      paymentId: payment.id,
      budgetId: updatedBudget.id,
    };
  } catch (error) {
    log('\n❌ ERRO AO SIMULAR WEBHOOK:', colors.red);
    console.error(error);

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    };
  } finally {
    await prisma.$disconnect();
  }
}

// ==========================================
// EXECUÇÃO
// ==========================================

// Você pode passar o budgetId como argumento ou usar um fixo para teste
const budgetId = process.argv[2];

if (!budgetId) {
  log('\n❌ Uso: npx tsx scripts/simulate-webhook.ts [budgetId]', colors.red);
  log('\nExemplo:', colors.yellow);
  console.log('  npx tsx scripts/simulate-webhook.ts cmlxb4t2w000hvdfkw079p89v');
  process.exit(1);
}

log(`\n🚀 Iniciando simulação para budget: ${budgetId}`, colors.cyan);

simulateWebhook(budgetId)
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
