/**
 * Script para verificar o fluxo completo de um orçamento
 * 
 * Uso: npx tsx scripts/check-flow.ts [budgetId]
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkFlow(budgetId: string) {
  console.log('\n🔍 Verificando fluxo do orçamento: ' + budgetId + '\n');

  const budget = await prisma.budget.findUnique({
    where: { id: budgetId },
    include: {
      contract: true,
      payments: {
        orderBy: { createdAt: 'asc' },
      },
    },
  });

  if (!budget) {
    console.log('❌ Orçamento não encontrado!\n');
    await prisma.$disconnect();
    return;
  }

  // Buscar projeto separadamente
  const project = budget.projectId ? await prisma.project.findUnique({
    where: { id: budget.projectId },
  }) : null;

  console.log('═══════════════════════════════════════════════════════');
  console.log('📋 ORÇAMENTO');
  console.log('═══════════════════════════════════════════════════════');
  console.log(`ID: ${budget.id}`);
  console.log(`Cliente: ${budget.clientName}`);
  console.log(`Email: ${budget.clientEmail}`);
  console.log(`Tipo: ${budget.projectType}`);
  console.log(`Valor: R$ ${budget.finalValue?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`);
  console.log(`Status: ${budget.status}`);
  console.log(`Project ID: ${budget.projectId || 'null'}`);
  console.log('');

  console.log('═══════════════════════════════════════════════════════');
  console.log('💰 PAGAMENTOS');
  console.log('═══════════════════════════════════════════════════════');
  
  if (budget.payments.length === 0) {
    console.log('Nenhum pagamento encontrado.\n');
  } else {
    for (const payment of budget.payments) {
      console.log(`Tipo: ${payment.type}`);
      console.log(`  Status: ${payment.status}`);
      console.log(`  Valor: R$ ${payment.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`);
      console.log(`  Pago em: ${payment.paidAt ? new Date(payment.paidAt).toLocaleString('pt-BR') : 'Não pago'}`);
      console.log(`  Project ID: ${payment.projectId || 'null'}`);
      console.log('');
    }
  }

  console.log('═══════════════════════════════════════════════════════');
  console.log('📄 CONTRATO');
  console.log('═══════════════════════════════════════════════════════');
  
  if (budget.contract) {
    console.log(`ID: ${budget.contract.id}`);
    console.log(`Status: ${budget.contract.status}`);
    console.log(`Confirmado: ${budget.contract.confirmed ? 'Sim' : 'Não'}`);
    console.log(`Project ID: ${budget.contract.projectId || 'null'}`);
  } else {
    console.log('Nenhum contrato encontrado.\n');
  }
  console.log('');

  console.log('═══════════════════════════════════════════════════════');
  console.log('🚀 PROJETO');
  console.log('═══════════════════════════════════════════════════════');
  
  if (project) {
    console.log(`ID: ${project.id}`);
    console.log(`Status: ${project.status}`);
    console.log(`Progresso: ${project.progress}%`);
    console.log(`Nome: ${project.name}`);
  } else {
    console.log('❌ Projeto NÃO criado!\n');
  }
  console.log('');

  console.log('═══════════════════════════════════════════════════════');
  console.log('📊 ANÁLISE DO FLUXO');
  console.log('═══════════════════════════════════════════════════════');
  
  const issues = [];
  
  // Verificar pagamento de entrada
  const downPayment = budget.payments.find(p => p.type === 'down_payment');
  if (downPayment) {
    if (downPayment.status === 'paid') {
      console.log('✅ Pagamento de entrada (25%) PAGO');
      
      if (budget.status !== 'down_payment_paid') {
        issues.push(`❌ Budget status está "${budget.status}" mas deveria ser "down_payment_paid"`);
      } else {
        console.log('✅ Budget status: down_payment_paid');
      }
      
      if (!project) {
        issues.push('❌ Projeto NÃO foi criado automaticamente!');
      } else {
        console.log('✅ Projeto criado: ' + project.id);
        
        if (project.status !== 'planning') {
          issues.push(`⚠️ Projeto status está "${project.status}" mas deveria ser "planning"`);
        } else {
          console.log('✅ Projeto status: planning');
        }
      }
      
      if (downPayment.projectId === null) {
        issues.push('⚠️ Pagamento não está vinculado ao projeto');
      } else {
        console.log('✅ Pagamento vinculado ao projeto');
      }
    } else {
      issues.push('⏳ Pagamento de entrada ainda não foi realizado');
    }
  } else {
    issues.push('❌ Pagamento de entrada NÃO foi criado');
  }
  
  // Verificar contrato
  if (budget.contract) {
    if (budget.contract.confirmed) {
      console.log('✅ Contrato confirmado');
    } else {
      issues.push('⚠️ Contrato não foi confirmado pelo gestor');
    }
  } else {
    issues.push('⚠️ Contrato não foi criado');
  }
  
  console.log('');
  
  if (issues.length > 0) {
    console.log('═══════════════════════════════════════════════════════');
    console.log('⚠️ PROBLEMAS ENCONTRADOS');
    console.log('═══════════════════════════════════════════════════════');
    issues.forEach(issue => console.log(issue));
    console.log('');
    
    const confirm = await new Promise<boolean>((resolve) => {
      const readline = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout,
      });
      
      readline.question('\nDeseja corrigir automaticamente? (s/n): ', (answer: string) => {
        readline.close();
        resolve(answer.toLowerCase() === 's');
      });
    });
    
    if (confirm) {
      await fixIssues(budget, issues);
    }
  } else {
    console.log('✅ ✅ ✅ TODOS OS STATUS ESTÃO CORRETOS! ✅ ✅ ✅');
    console.log('');
    console.log('Próximos passos:');
    console.log('1. Gestor deve acessar /dashboard/projetos/' + project?.id);
    console.log('2. Notificar evolução do projeto (20%, 50%, 70%, 100%)');
    console.log('3. Quando 100%, enviar pagamento final (75%)');
    console.log('4. Após pagamento final, cliente agenda entrega');
    console.log('');
  }

  await prisma.$disconnect();
}

async function fixIssues(budget: any, issues: string[]) {
  console.log('\n🔧 Corrigindo problemas...\n');
  
  for (const issue of issues) {
    if (issue.includes('Budget status') && issue.includes('down_payment_paid')) {
      await prisma.budget.update({
        where: { id: budget.id },
        data: { status: 'down_payment_paid' },
      });
      console.log('✅ Budget status atualizado para down_payment_paid');
    }
    
    if (issue.includes('Projeto NÃO foi criado')) {
      // Criar projeto
      const client = await prisma.client.findFirst({
        where: {
          OR: [
            { emails: { contains: budget.clientEmail } },
            { name: budget.clientName },
          ],
        },
      });

      let clientId = client?.id;
      
      if (!clientId) {
        const nameParts = budget.clientName.split(' ');
        const firstName = nameParts[0] || budget.clientName;
        const lastName = nameParts.slice(1).join(' ') || 'Cliente';

        const newClient = await prisma.client.create({
          data: {
            firstName,
            lastName,
            name: budget.clientName,
            documentType: 'cpf',
            document: `FIX_${Date.now()}`,
            emails: budget.clientEmail
              ? JSON.stringify([{ id: '1', value: budget.clientEmail, type: 'pessoal', isPrimary: true }])
              : null,
            status: 'active',
          },
        });
        clientId = newClient.id;
        console.log('✅ Cliente criado: ' + clientId);
      }

      const adminUser = await prisma.user.findFirst({ where: { role: 'ADMIN' } });

      const project = await prisma.project.create({
        data: {
          name: `${budget.projectType} - ${budget.clientName}`,
          description: budget.details || `Projeto criado após pagamento da entrada`,
          status: 'planning',
          type: budget.projectType,
          complexity: budget.complexity,
          timeline: budget.timeline,
          budget: budget.finalValue,
          clientId: clientId,
          clientName: budget.clientName,
          createdById: adminUser?.id || null,
          progress: 0,
        },
      });
      
      console.log('✅ Projeto criado: ' + project.id);
      
      // Vincular budget ao projeto
      await prisma.budget.update({
        where: { id: budget.id },
        data: { projectId: project.id },
      });
      console.log('✅ Budget vinculado ao projeto');
      
      // Vincular pagamento ao projeto
      const downPayment = await prisma.payment.findFirst({
        where: { budgetId: budget.id, type: 'down_payment' },
      });
      
      if (downPayment) {
        await prisma.payment.update({
          where: { id: downPayment.id },
          data: { projectId: project.id },
        });
        console.log('✅ Pagamento vinculado ao projeto');
      }
      
      // Vincular contrato se existir
      if (budget.contract) {
        await prisma.contract.update({
          where: { id: budget.contract.id },
          data: {
            projectId: project.id,
            status: 'signed',
            signedAt: new Date(),
          },
        });
        console.log('✅ Contrato vinculado ao projeto');
      }
    }
  }
  
  console.log('\n✅ Correções concluídas!\n');
}

// EXECUÇÃO
const budgetId = process.argv[2];

if (!budgetId) {
  console.log('\n❌ Uso: npx tsx scripts/check-flow.ts [budgetId]\n');
  console.log('Exemplo: npx tsx scripts/check-flow.ts cmly6ldii0002vddco1ofshk8\n');
  process.exit(1);
}

checkFlow(budgetId).catch(console.error);
