import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import Stripe from "stripe";

const resend = process.env.RESEND_API_KEY ? new (require("resend").Resend)(process.env.RESEND_API_KEY) : null;

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature") as string;

  console.log("========================================");
  console.log("[Webhook] Recebido evento Stripe");
  console.log("[Webhook] Signature:", signature ? "Presente" : "Ausente");
  console.log("[Webhook] Body length:", body.length);
  console.log("========================================");

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET || ""
    );
    console.log("[Webhook] Evento construído com sucesso:", event.type);
  } catch (error) {
    console.error("Erro ao construir evento Stripe:", error);
    return NextResponse.json(
      { error: "Webhook Error: Invalid signature" },
      { status: 400 }
    );
  }

  // Handle the event
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;

      console.log("[Webhook] checkout.session.completed:", session.id);
      console.log("[Webhook] Session payment_link:", session.payment_link);
      console.log("[Webhook] Session metadata:", session.metadata);
      console.log("[Webhook] Session payment_intent:", session.payment_intent);

      // Tentar buscar por múltiplos critérios
      let payment: any = null;
      let budgetId: string | undefined;
      let paymentType: string = "down_payment";

      // Extrair budgetId dos metadados (pode estar em session.metadata ou session.payment_intent_data)
      console.log("[Webhook] Verificando metadados da sessão...");
      console.log("[Webhook] session.metadata:", session.metadata);
      console.log("[Webhook] session.payment_intent_data:", (session as any).payment_intent_data);
      
      if (session.metadata?.budgetId) {
        budgetId = session.metadata.budgetId;
        paymentType = session.metadata.type || "down_payment";
        console.log("[Webhook] ✅ budgetId encontrado em session.metadata:", budgetId);
      } else if ((session as any).payment_intent_data?.metadata?.budgetId) {
        budgetId = (session as any).payment_intent_data.metadata.budgetId;
        paymentType = (session as any).payment_intent_data.metadata.type || "down_payment";
        console.log("[Webhook] ✅ budgetId encontrado em payment_intent_data.metadata:", budgetId);
      } else {
        console.warn("[Webhook] ⚠️ budgetId NÃO encontrado nos metadados!");
      }

      // Método 1: Buscar pelos metadados da sessão (budgetId) - MAIS CONFIÁVEL
      if (budgetId) {
        console.log("[Webhook] Buscando pagamento por metadata.budgetId:", budgetId);

        // Primeiro buscar sem filtro de status para ver se existe
        const paymentAnyStatus = await prisma.payment.findFirst({
          where: {
            budgetId: budgetId,
            type: paymentType,
          },
          include: {
            budget: true,
            project: true,
          },
        });

        console.log("[Webhook] Pagamento encontrado (qualquer status):", paymentAnyStatus ? {
          id: paymentAnyStatus.id,
          status: paymentAnyStatus.status,
          type: paymentAnyStatus.type,
          budgetId: paymentAnyStatus.budgetId,
        } : null);

        // Agora buscar apenas se estiver pending
        payment = await prisma.payment.findFirst({
          where: {
            budgetId: budgetId,
            type: paymentType,
            status: "pending",
          },
          include: {
            budget: true,
            project: true,
          },
        });

        if (payment) {
          console.log("[Webhook] Pagamento encontrado por metadata.budgetId:", payment.id);
        } else if (paymentAnyStatus && paymentAnyStatus.status !== "paid") {
          // Usar pagamento existente se não estiver pago
          payment = paymentAnyStatus;
          console.log("[Webhook] Usando pagamento existente (status:", payment.status, ")");
        }
      }

      // Método 2: Buscar por stripePaymentLinkId (ID do payment link)
      if (!payment && session.payment_link) {
        const paymentLinkId = typeof session.payment_link === 'string'
          ? session.payment_link
          : (session.payment_link as any).id;

        console.log("[Webhook] Buscando pagamento por payment_link_id:", paymentLinkId);

        payment = await prisma.payment.findFirst({
          where: {
            stripePaymentLinkId: paymentLinkId,
          },
          include: {
            budget: true,
            project: true,
          },
        });

        if (payment) {
          console.log("[Webhook] Pagamento encontrado por payment_link_id:", payment.id);
        }
      }

      // Método 2.5: Se ainda não encontrou e tem budgetId dos metadados, buscar todos pagamentos do budget
      if (!payment && budgetId) {
        console.log("[Webhook] Buscando TODOS pagamentos do budget:", budgetId);

        const allPayments = await prisma.payment.findMany({
          where: {
            budgetId: budgetId,
          },
          include: {
            budget: true,
            project: true,
          },
        });

        console.log("[Webhook] Pagamentos encontrados:", allPayments.map(p => ({
          id: p.id,
          type: p.type,
          status: p.status,
          stripePaymentLinkId: p.stripePaymentLinkId,
        })));

        // Pegar o primeiro que não está pago
        payment = allPayments.find(p => p.status !== "paid") || allPayments[0];

        if (payment) {
          console.log("[Webhook] Usando pagamento:", payment.id, "status:", payment.status);
        }
      }

      // Método 3: Buscar por session_id (stripePaymentId)
      if (!payment) {
        console.log("[Webhook] Buscando pagamento por session_id:", session.id);

        payment = await prisma.payment.findFirst({
          where: {
            OR: [
              { stripePaymentId: session.id },
              { stripePaymentId: session.payment_intent as string },
            ],
          },
          include: {
            budget: true,
            project: true,
          },
        });

        if (payment) {
          console.log("[Webhook] Pagamento encontrado por session_id:", payment.id);
        }
      }

      if (!payment) {
        console.warn("[Webhook] NENHUM pagamento encontrado para esta sessão!");
        console.warn("[Webhook] session.id:", session.id);
        console.warn("[Webhook] session.payment_link:", session.payment_link);
        console.warn("[Webhook] session.metadata:", session.metadata);
        console.warn("[Webhook] session.payment_intent:", session.payment_intent);
      }

      if (payment) {
        console.log(`[Webhook] Pagamento encontrado: ${payment.id}, tipo: ${payment.type}, status: ${payment.status}`);
        console.log(`[Webhook] Budget do pagamento:`, payment.budget ? { id: payment.budget.id, status: payment.budget.status } : 'NÃO INCLUÍDO');
        console.log(`[Webhook] Project do pagamento:`, payment.project ? { id: payment.project.id, status: payment.project.status } : 'NÃO INCLUÍDO');

        // Verificar se pagamento já está pago
        if (payment.status === "paid") {
          console.log(`[Webhook] Pagamento ${payment.id} já está pago.`);

          // Para pagamento final, ainda precisamos atualizar projeto e budget
          if (payment.type === "final_payment") {
            console.log(`[Webhook] Processando atualização de projeto para pagamento final ${payment.id}`);
            
            // Buscar budget se não estiver incluído
            let budget = payment.budget;
            if (!budget && payment.budgetId) {
              console.log(`[Webhook] Budget não incluído, buscando pelo ID: ${payment.budgetId}`);
              budget = await prisma.budget.findUnique({
                where: { id: payment.budgetId },
              });
            }
            
            if (budget) {
              await handleFinalPayment(payment, budget);
            } else {
              console.error(`[Webhook] Budget não encontrado para pagamento final ${payment.id}`);
            }
          }

          return NextResponse.json({ received: true });
        }

        try {
          // Atualizar pagamento para pago
          await prisma.payment.update({
            where: { id: payment.id },
            data: {
              status: "paid",
              paidAt: new Date(),
              stripePaymentId: session.payment_intent as string || session.id as string,
            },
          });

          console.log(`[Webhook] Pagamento ${payment.id} marcado como pago.`);

          // Buscar budget se não estiver incluído
          let budget = payment.budget;
          if (!budget && payment.budgetId) {
            console.log(`[Webhook] Budget não incluído, buscando pelo ID: ${payment.budgetId}`);
            budget = await prisma.budget.findUnique({
              where: { id: payment.budgetId },
            });
          }

          if (budget) {
            // Verificar tipo de pagamento
            console.log(`[Webhook] Tipo de pagamento identificado: ${payment.type}`);
            console.log(`[Webhook] Budget ID: ${budget.id}, Status: ${budget.status}`);

            if (payment.type === "down_payment") {
              // PAGAMENTO DE ENTRADA (25%)
              console.log(`[Webhook] Processando pagamento de entrada para orçamento ${budget.id}`);
              await handleDownPayment(payment, budget);
            } else if (payment.type === "final_payment") {
              // PAGAMENTO FINAL (75%)
              console.log(`[Webhook] Processando pagamento final para projeto ${payment.projectId}`);
              console.log(`[Webhook] Dados do pagamento final:`, {
                paymentId: payment.id,
                projectId: payment.projectId,
                budgetId: payment.budgetId,
                amount: payment.amount,
              });
              await handleFinalPayment(payment, budget);
            } else {
              console.warn(`[Webhook] Tipo de pagamento desconhecido: ${payment.type}`);
            }
          } else {
            console.error(`[Webhook] Budget não encontrado para pagamento ${payment.id}`);
          }

          console.log(`[Webhook] Fluxo de pagamento ${payment.id} completado.`);
        } catch (error) {
          console.error(`[Webhook] Erro ao processar pagamento ${payment.id}:`, error);
          throw error;
        }
      } else {
        console.warn(`[Webhook] Pagamento não encontrado para session ${session.id}`);
        console.warn(`[Webhook] payment_link: ${session.payment_link}`);
        console.warn(`[Webhook] metadata:`, session.metadata);
      }
      break;
    }

    default:
      console.log(`Evento não tratado: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}

// Handler para pagamento de entrada (25%)
async function handleDownPayment(payment: any, budget: any) {
  console.log(`[Webhook] === INICIO handleDownPayment ===`);
  console.log(`[Webhook] Processando pagamento de entrada para orçamento ${budget.id}`);
  console.log(`[Webhook] Dados do budget:`, {
    id: budget.id,
    status: budget.status,
    clientName: budget.clientName,
    finalValue: budget.finalValue,
    projectId: budget.projectId,
  });

  // Atualizar orçamento
  console.log(`[Webhook] Atualizando orçamento ${budget.id} para down_payment_paid...`);
  const updatedBudget = await prisma.budget.update({
    where: { id: budget.id },
    data: {
      status: "down_payment_paid",
    },
  });
  console.log(`[Webhook] Orçamento atualizado:`, {
    id: updatedBudget.id,
    status: updatedBudget.status,
    projectId: updatedBudget.projectId,
  });

  // Criar cliente se não existir
  let client = await prisma.client.findFirst({
    where: {
      OR: [
        { emails: { contains: budget.clientEmail } },
        { name: budget.clientName },
      ],
    },
  });

  if (!client) {
    console.log(`[Webhook] Cliente não encontrado para ${budget.clientEmail}, criando novo...`);
    const nameParts = budget.clientName.split(" ");
    const firstName = nameParts[0] || budget.clientName;
    const lastName = nameParts.slice(1).join(" ") || "Cliente";

    client = await prisma.client.create({
      data: {
        firstName,
        lastName,
        name: budget.clientName,
        documentType: "cpf",
        document: `AUTO_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        emails: budget.clientEmail ? JSON.stringify([
          { id: "1", value: budget.clientEmail, type: "pessoal", isPrimary: true }
        ]) : null,
        phones: budget.clientPhone ? JSON.stringify([
          { id: "1", value: budget.clientPhone, type: "whatsapp", isPrimary: true }
        ]) : null,
        notes: budget.company ? `Empresa: ${budget.company}. Criado automaticamente via pagamento de entrada.` : "Criado automaticamente via pagamento de entrada.",
        status: "active",
      },
    });

    console.log(`[Webhook] Cliente ${client.id} criado com sucesso.`);
  } else {
    console.log(`[Webhook] Cliente existente encontrado: ${client.id}`);
  }

  // Buscar primeiro usuário admin para usar como criador
  const adminUser = await prisma.user.findFirst({
    where: { role: "admin" },
  });

  // Mapear complexidade
  const complexityMap: Record<string, string> = {
    simple: "simple",
    medium: "medium",
    complex: "complex",
    simples: "simple",
    medio: "medium",
    complexo: "complex",
  };

  // Mapear timeline
  const timelineMap: Record<string, string> = {
    urgent: "urgent",
    normal: "normal",
    flexible: "flexible",
    urgente: "urgent",
    flexivel: "flexible",
  };

  // Criar projeto
  console.log(`[Webhook] Criando projeto para ${budget.clientName}...`);
  const project = await prisma.project.create({
    data: {
      name: `${budget.projectType} - ${budget.clientName}`,
      description: budget.details || `Projeto criado após pagamento da entrada - ${budget.clientName}`,
      status: "planning", // Projeto começa em planejamento
      type: budget.projectType,
      complexity: complexityMap[budget.complexity] || "medium",
      timeline: timelineMap[budget.timeline] || "normal",
      budget: budget.finalValue,
      clientId: client.id,
      clientName: budget.clientName,
      createdById: adminUser?.id,
      progress: 0,
    },
  });

  console.log(`[Webhook] === PROJETO CRIADO ===`);
  console.log(`[Webhook] Projeto ${project.id} criado:`, {
    name: project.name,
    status: project.status,
    clientId: project.clientId,
  });

  // Atualizar pagamento com projectId
  console.log(`[Webhook] Atualizando pagamento ${payment.id} com projectId ${project.id}...`);
  await prisma.payment.update({
    where: { id: payment.id },
    data: {
      projectId: project.id,
    },
  });
  console.log(`[Webhook] Pagamento atualizado.`);

  // Atualizar orçamento com projectId
  console.log(`[Webhook] Atualizando orçamento ${budget.id} com projectId ${project.id}...`);
  const updatedBudgetWithProject = await prisma.budget.update({
    where: { id: budget.id },
    data: {
      projectId: project.id,
      status: "down_payment_paid", // Garante que o status está correto
    },
  });
  console.log(`[Webhook] Orçamento atualizado com projectId:`, {
    id: updatedBudgetWithProject.id,
    status: updatedBudgetWithProject.status,
    projectId: updatedBudgetWithProject.projectId,
  });
  console.log(`[Webhook] === DADOS FINAIS DO BUDGET ===`, {
    budgetId: updatedBudgetWithProject.id,
    status: updatedBudgetWithProject.status,
    projectId: updatedBudgetWithProject.projectId,
    projetoCriadoId: project.id,
    projetoCriadoNome: project.name,
  });

  // Atualizar contrato com projectId se existir
  if (budget.contract) {
    console.log(`[Webhook] Atualizando contrato ${budget.contract.id} com projectId...`);
    await prisma.contract.update({
      where: { id: budget.contract.id },
      data: {
        projectId: project.id,
        status: "signed",
        signedAt: new Date(),
      },
    });
    console.log(`[Webhook] Contrato atualizado.`);
  }

  console.log(`[Webhook] === FIM handleDownPayment ===`);
  console.log(`[Webhook] Pagamento e orçamento vinculados ao projeto ${project.id}.`);

  // Enviar e-mail de confirmação
  if (budget.clientEmail && resend) {
    try {
      await resend.emails.send({
        from: process.env.EMAIL_FROM || "Softrha <noreply@softrha.com>",
        to: budget.clientEmail,
        subject: `Pagamento Confirmado - Início do Projeto`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">Pagamento Confirmado! 🎉</h2>
            <p>Olá <strong>${budget.clientName}</strong>,</p>
            <p>Seu pagamento de entrada foi confirmado e seu projeto <strong>${budget.projectType}</strong> foi iniciado!</p>
            
            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Projeto:</strong> ${budget.projectType}</p>
              <p><strong>Valor Total:</strong> R$ ${budget.finalValue?.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
              <p><strong>Entrada Paga:</strong> R$ ${(budget.finalValue || 0) * 0.25} ✅</p>
              <p><strong>Saldo Restante:</strong> R$ ${(budget.finalValue || 0) * 0.75}</p>
            </div>

            <p>Nossa equipe entrará em contato em breve para dar início ao projeto.</p>
            
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;" />
            <p style="color: #6b7280; font-size: 12px;">
              Atenciosamente,<br />
              Equipe Softrha
            </p>
          </div>
        `,
      });
    } catch (emailError) {
      console.error("Erro ao enviar e-mail de confirmação:", emailError);
    }
  }
}

// Handler para pagamento final (75%)
async function handleFinalPayment(payment: any, budget: any) {
  console.log(`\n========================================`);
  console.log(`[Webhook] === INICIO handleFinalPayment ===`);
  console.log(`[Webhook] Processando pagamento final para projeto ${payment.projectId}`);
  console.log(`[Webhook] Dados do payment:`, {
    id: payment.id,
    type: payment.type,
    status: payment.status,
    projectId: payment.projectId,
    budgetId: payment.budgetId,
    amount: payment.amount,
  });

  // Garantir que budget está disponível
  let budgetData = budget;
  if (!budgetData && payment.budgetId) {
    console.log(`[Webhook] Budget não fornecido, buscando pelo ID: ${payment.budgetId}`);
    budgetData = await prisma.budget.findUnique({
      where: { id: payment.budgetId },
    });
  }

  if (!budgetData) {
    console.error(`[Webhook] ERRO: Budget não encontrado para payment ${payment.id}, budgetId: ${payment.budgetId}`);
    return;
  }

  console.log(`[Webhook] Budget encontrado:`, {
    id: budgetData.id,
    status: budgetData.status,
    clientName: budgetData.clientName,
  });

  const project = payment.project;

  if (!project) {
    console.error("[Webhook] Projeto não encontrado para pagamento final");
    console.error("[Webhook] Tentando buscar projeto pelo ID:", payment.projectId);

    // Tentar buscar o projeto
    const foundProject = await prisma.project.findUnique({
      where: { id: payment.projectId },
    });

    if (foundProject) {
      console.log("[Webhook] Projeto encontrado:", foundProject.id);
      // Atualizar projeto para concluído
      await prisma.project.update({
        where: { id: foundProject.id },
        data: {
          status: "completed",
          progress: 100,
          completedAt: new Date(),
        },
      });
      console.log(`[Webhook] Projeto ${foundProject.id} marcado como concluído.`);
    }
    return;
  }

  console.log(`[Webhook] Projeto encontrado: ${project.id}, status atual: ${project.status}`);

  // Atualizar projeto para concluído
  console.log(`[Webhook] Atualizando projeto ${project.id} para completed...`);
  await prisma.project.update({
    where: { id: project.id },
    data: {
      status: "completed",
      progress: 100,
      completedAt: new Date(),
    },
  });

  console.log(`[Webhook] Projeto ${project.id} marcado como concluído.`);
  console.log(`[Webhook] Projeto atualizado:`, {
    id: project.id,
    name: project.name,
    status: "completed",
    progress: 100,
  });

  // Atualizar orçamento
  console.log(`[Webhook] Atualizando orçamento ${budgetData.id} para completed...`);
  await prisma.budget.update({
    where: { id: budgetData.id },
    data: {
      status: "completed",
    },
  });

  console.log(`[Webhook] Orçamento ${budgetData.id} marcado como completed.`);
  console.log(`[Webhook] === FIM handleFinalPayment ===`);
  console.log(`========================================\n`);

  // Enviar e-mail de confirmação
  if (budgetData.clientEmail && resend) {
    try {
      await resend.emails.send({
        from: process.env.EMAIL_FROM || "Softrha <noreply@softrha.com>",
        to: budgetData.clientEmail,
        subject: `Pagamento Final Confirmado - Agende sua Entrega!`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">Pagamento Final Confirmado! 🎉</h2>
            <p>Olá <strong>${budgetData.clientName}</strong>,</p>
            <p>Seu pagamento final foi confirmado e seu projeto está <strong>100% concluído</strong>!</p>

            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Projeto:</strong> ${project.name}</p>
              <p><strong>Valor Total:</strong> R$ ${budgetData.finalValue?.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
              <p><strong>Pagamento Final:</strong> R$ ${payment.amount} ✅</p>
            </div>

            <p>Agora você pode agendar a entrega do projeto! Escolha o melhor dia e horário para receber a apresentação através de uma chamada de vídeo ou áudio.</p>
            
            <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/projetos/${project.id}/agendar" 
               style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0;">
              Agendar Entrega
            </a>
            
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;" />
            <p style="color: #6b7280; font-size: 12px;">
              Parabéns pelo projeto! Estamos ansiosos para apresentar o resultado.<br />
              Equipe Softrha
            </p>
          </div>
        `,
      });
    } catch (emailError) {
      console.error("Erro ao enviar e-mail de confirmação:", emailError);
    }
  }
}
