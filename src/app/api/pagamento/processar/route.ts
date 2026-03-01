import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { createLog } from "@/lib/create-log";
import { createNotificationForAdmins } from "@/lib/create-notification";

const resend = process.env.RESEND_API_KEY ? new (require("resend").Resend)(process.env.RESEND_API_KEY) : null;

/**
 * Processa o pagamento quando o usuário é redirecionado para /obrigado/pagamento
 * Isso é um fallback para quando o webhook não está configurado (desenvolvimento)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, paymentLinkId, budgetId, projectId } = body;

    console.log("[Pagamento] Processando pagamento:", { sessionId, paymentLinkId, budgetId, projectId });

    let payment = null;

    // Método 1: Buscar pelo paymentLinkId (Stripe Payment Link ID)
    if (paymentLinkId && paymentLinkId.startsWith("plink_")) {
      payment = await prisma.payment.findFirst({
        where: {
          stripePaymentLinkId: paymentLinkId,
        },
        include: {
          budget: true,
          project: true,
        },
      });
      console.log("[Pagamento] Busca por stripePaymentLinkId:", payment ? "encontrado" : "não encontrado");
    }

    // Método 2: Buscar pelo budgetId (pagamento de entrada)
    if (!payment && budgetId) {
      console.log("[Pagamento] Buscando por budgetId (entrada):", budgetId);
      payment = await prisma.payment.findFirst({
        where: {
          budgetId: budgetId,
          type: "down_payment",
        },
        include: {
          budget: true,
          project: true,
        },
      });
      console.log("[Pagamento] Busca por budgetId:", payment ? "encontrado" : "não encontrado");
    }

    // Método 3: Buscar pelo projectId (pagamento final)
    if (!payment && projectId) {
      console.log("[Pagamento] Buscando por projectId (final):", projectId);
      payment = await prisma.payment.findFirst({
        where: {
          projectId: projectId,
          type: "final_payment",
        },
        include: {
          budget: true,
          project: true,
        },
      });
      console.log("[Pagamento] Busca por projectId:", payment ? "encontrado" : "não encontrado");
    }

    // Método 4: Buscar pelo sessionId (stripePaymentId)
    if (!payment && sessionId) {
      payment = await prisma.payment.findFirst({
        where: {
          OR: [
            { stripePaymentId: sessionId },
            { stripePaymentId: sessionId.replace("cs_test_", "pi_") },
          ],
        },
        include: {
          budget: true,
          project: true,
        },
      });
      console.log("[Pagamento] Busca por sessionId:", payment ? "encontrado" : "não encontrado");
    }

    if (!payment) {
      console.error("[Pagamento] Pagamento não encontrado");
      console.error("[Pagamento] Tentativa com:", { sessionId, paymentLinkId, budgetId, projectId });
      
      // Debug: Buscar todos pagamentos do budget ou projeto
      if (budgetId) {
        const allPayments = await prisma.payment.findMany({
          where: { budgetId },
        });
        console.error("[Pagamento] Todos pagamentos do budget:", allPayments.map(p => ({
          id: p.id,
          type: p.type,
          status: p.status,
          stripePaymentLinkId: p.stripePaymentLinkId,
        })));
      }
      if (projectId) {
        const allPayments = await prisma.payment.findMany({
          where: { projectId },
        });
        console.error("[Pagamento] Todos pagamentos do projeto:", allPayments.map(p => ({
          id: p.id,
          type: p.type,
          status: p.status,
          stripePaymentLinkId: p.stripePaymentLinkId,
        })));
      }
      
      return NextResponse.json(
        { success: false, error: "Pagamento não encontrado" },
        { status: 404 }
      );
    }

    console.log("[Pagamento] Pagamento encontrado:", {
      id: payment.id,
      status: payment.status,
      type: payment.type,
      budgetId: payment.budgetId,
      projectId: payment.projectId,
    });

    // Se já estiver pago, retornar sucesso
    if (payment.status === "paid") {
      console.log("[Pagamento] Pagamento já está pago");
      return NextResponse.json({
        success: true,
        budgetId: payment.budgetId,
        projectId: payment.projectId,
        message: "Pagamento já foi processado anteriormente",
      });
    }

    // Verificar status da sessão no Stripe
    let session;
    try {
      if (sessionId) {
        session = await stripe.checkout.sessions.retrieve(sessionId);
        console.log("[Pagamento] Sessão Stripe:", {
          id: session.id,
          status: session.status,
          payment_status: session.payment_status,
        });

        if (session.payment_status !== "paid") {
          console.warn("[Pagamento] Pagamento não foi confirmado pelo Stripe");
          return NextResponse.json(
            { 
              success: false, 
              error: "Pagamento não foi confirmado. Status: " + session.payment_status 
            },
            { status: 400 }
          );
        }
      }
    } catch (error) {
      console.error("[Pagamento] Erro ao buscar sessão no Stripe:", error);
      // Continuar mesmo assim, pois o paymentLinkId já é uma confirmação indireta
    }

    // Atualizar pagamento para pago
    console.log("[Pagamento] Atualizando pagamento para 'paid'...");
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: "paid",
        paidAt: new Date(),
        stripePaymentId: sessionId || payment.stripePaymentId,
      },
    });

    console.log("[Pagamento] Pagamento atualizado para 'paid'");

    // Processar baseado no tipo de pagamento
    if (payment.type === "down_payment") {
      // PAGAMENTO DE ENTRADA (25%)
      const result = await handleDownPayment(payment);
      return NextResponse.json({
        success: true,
        budgetId: result.budgetId,
        projectId: result.projectId,
        message: "Pagamento de entrada processado com sucesso",
      });
    } else if (payment.type === "final_payment") {
      // PAGAMENTO FINAL (75%)
      const result = await handleFinalPayment(payment);
      return NextResponse.json({
        success: true,
        budgetId: result.budgetId,
        projectId: result.projectId,
        message: "Pagamento final processado com sucesso",
      });
    } else {
      console.error("[Pagamento] Tipo de pagamento desconhecido:", payment.type);
      return NextResponse.json(
        { success: false, error: "Tipo de pagamento desconhecido" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("[Pagamento] Erro ao processar pagamento:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : "Erro ao processar pagamento" 
      },
      { status: 500 }
    );
  }
}

// Handler para pagamento de entrada (25%)
async function handleDownPayment(payment: any) {
  console.log("[Pagamento] === INICIO handleDownPayment ===");
  
  const budget = payment.budget;
  if (!budget) {
    throw new Error("Budget não encontrado");
  }

  console.log("[Pagamento] Processando pagamento de entrada para orçamento", budget.id);

  // Atualizar orçamento
  await prisma.budget.update({
    where: { id: budget.id },
    data: {
      status: "down_payment_paid",
    },
  });
  console.log("[Pagamento] Orçamento atualizado para 'down_payment_paid'");

  // Criar ou buscar cliente
  let client = await prisma.client.findFirst({
    where: {
      OR: [
        { emails: { contains: budget.clientEmail } },
        { name: budget.clientName },
      ],
    },
  });

  if (!client) {
    console.log("[Pagamento] Criando novo cliente...");
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
    console.log("[Pagamento] Cliente criado:", client.id);
  }

  // Buscar primeiro usuário admin
  const adminUser = await prisma.user.findFirst({
    where: { role: "ADMIN" },
  });

  // Mapear complexidade e timeline
  const complexityMap: Record<string, string> = {
    simple: "simple", medium: "medium", complex: "complex",
    simples: "simple", medio: "medium", complexo: "complex",
  };
  const timelineMap: Record<string, string> = {
    urgent: "urgent", normal: "normal", flexible: "flexible",
    urgente: "urgent", flexivel: "flexible",
  };

  // Criar projeto
  console.log("[Pagamento] Criando projeto...");
  const project = await prisma.project.create({
    data: {
      name: `${budget.projectType} - ${budget.clientName}`,
      description: budget.details || `Projeto criado após pagamento da entrada - ${budget.clientName}`,
      status: "planning",
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
  console.log("[Pagamento] Projeto criado:", project.id);

  // Atualizar pagamento com projectId
  await prisma.payment.update({
    where: { id: payment.id },
    data: { projectId: project.id },
  });

  // Atualizar orçamento com projectId
  await prisma.budget.update({
    where: { id: budget.id },
    data: { projectId: project.id },
  });

  console.log("[Pagamento] === FIM handleDownPayment ===");

  // Criar log
  await createLog({
    type: "PAYMENT",
    category: "PAYMENT",
    level: "SUCCESS",
    entityId: payment.id,
    entityType: "Payment",
    action: "Pagamento da entrada confirmado",
    description: `Pagamento da entrada (25%) confirmado para o orçamento ${budget.id}.`,
    metadata: {
      budgetId: budget.id,
      projectId: project.id,
      paymentId: payment.id,
      amount: payment.amount,
      clientName: budget.clientName,
    },
  });

  // Criar notificação para admins
  await createNotificationForAdmins({
    title: "Pagamento da Entrada Confirmado! 🎉",
    message: `O cliente ${budget.clientName} realizou o pagamento da entrada (25%) do projeto "${budget.projectType}".`,
    type: "success",
    category: "budget",
    link: `/dashboard/orcamentos/${budget.id}`,
    metadata: {
      budgetId: budget.id,
      projectId: project.id,
      paymentId: payment.id,
      amount: payment.amount,
      clientName: budget.clientName,
    },
  });

  // Enviar e-mail
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
            </div>
            <p>Nossa equipe entrará em contato em breve.</p>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;" />
            <p style="color: #6b7280; font-size: 12px;">Equipe Softrha</p>
          </div>
        `,
      });
    } catch (emailError) {
      console.error("Erro ao enviar e-mail:", emailError);
    }
  }

  return { budgetId: budget.id, projectId: project.id };
}

// Handler para pagamento final (75%)
async function handleFinalPayment(payment: any) {
  console.log("[Pagamento] === INICIO handleFinalPayment ===");
  console.log("[Pagamento] Dados do pagamento:", {
    id: payment.id,
    type: payment.type,
    budgetId: payment.budgetId,
    projectId: payment.projectId,
    status: payment.status,
  });

  const budget = payment.budget;
  if (!budget) {
    console.error("[Pagamento] Budget não encontrado no pagamento!");
    throw new Error("Budget não encontrado");
  }

  console.log("[Pagamento] Budget encontrado:", {
    id: budget.id,
    status: budget.status,
    clientName: budget.clientName,
  });

  const project = payment.project;
  if (!project) {
    console.error("[Pagamento] Projeto não encontrado no pagamento!");
    return { budgetId: budget.id, projectId: null };
  }

  console.log("[Pagamento] Projeto encontrado:", {
    id: project.id,
    name: project.name,
    status: project.status,
  });

  console.log("[Pagamento] Processando pagamento final para projeto", project.id);

  // Atualizar projeto para concluído
  await prisma.project.update({
    where: { id: project.id },
    data: {
      status: "completed",
      progress: 100,
      completedAt: new Date(),
    },
  });
  console.log("[Pagamento] Projeto atualizado para 'completed'");

  // Atualizar orçamento
  await prisma.budget.update({
    where: { id: budget.id },
    data: {
      status: "completed",
    },
  });
  console.log("[Pagamento] Orçamento atualizado para 'completed'");

  console.log("[Pagamento] === FIM handleFinalPayment ===");
  console.log("[Pagamento] Retornando:", { budgetId: budget.id, projectId: project.id });

  // Criar log
  await createLog({
    type: "PAYMENT",
    category: "PAYMENT",
    level: "SUCCESS",
    entityId: payment.id,
    entityType: "Payment",
    action: "Pagamento final confirmado",
    description: `Pagamento final (75%) confirmado para o projeto ${project.id}.`,
    metadata: {
      budgetId: budget.id,
      projectId: project.id,
      paymentId: payment.id,
      amount: payment.amount,
    },
  });

  // Criar notificação
  await createNotificationForAdmins({
    title: "Pagamento Final Confirmado! 🎉",
    message: `O cliente ${budget.clientName} realizou o pagamento final (75%) do projeto "${project.name}".`,
    type: "success",
    category: "project",
    link: `/dashboard/projetos/${project.id}`,
    metadata: {
      budgetId: budget.id,
      projectId: project.id,
      paymentId: payment.id,
      amount: payment.amount,
      clientName: budget.clientName,
    },
  });

  // Enviar e-mail
  if (budget.clientEmail && resend) {
    try {
      await resend.emails.send({
        from: process.env.EMAIL_FROM || "Softrha <noreply@softrha.com>",
        to: budget.clientEmail,
        subject: `Pagamento Final Confirmado - Agende sua Entrega!`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">Pagamento Final Confirmado! 🎉</h2>
            <p>Olá <strong>${budget.clientName}</strong>,</p>
            <p>Seu pagamento final foi confirmado e seu projeto está <strong>100% concluído</strong>!</p>
            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Projeto:</strong> ${project.name}</p>
              <p><strong>Pagamento Final:</strong> R$ ${payment.amount} ✅</p>
            </div>
            <p>Agora você pode agendar a entrega do projeto!</p>
            <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/projetos/${project.id}/agendar"
               style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0;">
              Agendar Entrega
            </a>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;" />
            <p style="color: #6b7280; font-size: 12px;">Equipe Softrha</p>
          </div>
        `,
      });
    } catch (emailError) {
      console.error("Erro ao enviar e-mail:", emailError);
    }
  }

  return { budgetId: budget.id, projectId: project.id };
}
