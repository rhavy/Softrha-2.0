import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { generatePaymentLink } from "@/lib/stripe";

const resend = process.env.RESEND_API_KEY ? new (require("resend").Resend)(process.env.RESEND_API_KEY) : null;

/**
 * POST /api/projetos/[id]/pagamento-final
 * 
 * Gera link de pagamento final (75% restante)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const sessionData = await auth.api.getSession({ headers: request.headers });
    if (!sessionData?.session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { id: projectId } = await params;
    const body = await request.json();
    const { sendEmail = true, sendWhatsApp = false } = body;

    // Buscar projeto
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
      console.error("[Pagamento Final] Projeto não encontrado:", projectId);
      return NextResponse.json({ error: "Projeto não encontrado" }, { status: 404 });
    }

    console.log("[Pagamento Final] Projeto encontrado:", {
      id: project.id,
      name: project.name,
      contractId: project.contract?.id,
      budgetId: project.contract?.budgetId,
    });

    // Obter orçamento através do contrato ou diretamente pelo clientId
    let budget: any = project.contract?.budget;

    // Se não tem contrato, buscar budget pelo clientId e projectType
    if (!budget) {
      console.log("[Pagamento Final] Projeto sem contrato, buscando budget...");
      
      // Extrair clientName do project.name (formato: "tipo - nome")
      const clientName = project.clientName || project.name;
      const nameParts = clientName.split(" - ");
      const projectType = nameParts[0] || project.type;
      
      budget = await prisma.budget.findFirst({
        where: {
          clientName: clientName,
          projectType: projectType,
          projectId: projectId,
        },
      });
      
      if (!budget) {
        // Tentar buscar qualquer budget com este clientId
        const client = await prisma.client.findUnique({
          where: { id: project.clientId },
        });
        
        if (client) {
          budget = await prisma.budget.findFirst({
            where: {
              clientName: client.name,
              projectId: projectId,
            },
          });
        }
      }
      
      if (!budget) {
        console.error("[Pagamento Final] Orçamento não encontrado para projeto:", projectId);
        return NextResponse.json({ error: "Orçamento não encontrado" }, { status: 404 });
      }
      
      console.log("[Pagamento Final] Budget encontrado:", budget.id);
    }

    // Calcular 75% do valor
    const projectValue = budget.finalValue || 0;
    const finalPayment = projectValue * 0.75;

    if (finalPayment <= 0) {
      return NextResponse.json(
        { error: "Valor do projeto é inválido ou zero" },
        { status: 400 }
      );
    }

    // Verificar se já existe pagamento final
    const existingPayment = await prisma.payment.findFirst({
      where: {
        projectId,
        type: "final_payment",
      },
    });

    if (existingPayment && existingPayment.status === "paid") {
      return NextResponse.json({
        success: true,
        message: "Pagamento final já foi realizado",
        paymentLink: null,
      });
    }

    // Gerar link de pagamento
    const paymentLink = await generatePaymentLink(
      finalPayment,
      `Pagamento Final 75% - ${project.name} - ${budget.clientName}`,
      {
        budgetId: budget.id,
        projectId,
        type: "final_payment",
        clientName: budget.clientName,
        clientEmail: budget.clientEmail,
      }
    );

    // Atualizar ou criar pagamento
    const payment = await prisma.payment.upsert({
      where: {
        id: existingPayment?.id || `new_${projectId}`,
      },
      update: {
        stripePaymentLinkId: paymentLink.id,
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        status: "pending",
      },
      create: {
        budgetId: budget.id,
        projectId,
        amount: finalPayment,
        type: "final_payment",
        description: `Pagamento final de 75% - ${project.name} - ${budget.clientName}`,
        status: "pending",
        stripePaymentLinkId: paymentLink.id,
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      },
    });

    // Atualizar status do projeto e orçamento
    await prisma.project.update({
      where: { id: projectId },
      data: {
        status: "waiting_final_payment",
      },
    });

    await prisma.budget.update({
      where: { id: budget.id },
      data: {
        status: "final_payment_sent",
      },
    });

    // Enviar e-mail se solicitado
    if (sendEmail && budget.clientEmail && resend) {
      try {
        await resend.emails.send({
          from: process.env.EMAIL_FROM || "Softrha <noreply@softrha.com>",
          to: budget.clientEmail,
          subject: `Pagamento Final - ${project.name}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #2563eb;">Pagamento Final</h2>
              <p>Olá <strong>${budget.clientName}</strong>,</p>
              <p>Seu projeto <strong>${project.name}</strong> está 100% concluído!</p>
              <p>Segue o link para pagamento final do projeto:</p>
              
              <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p><strong>Valor Restante (75%):</strong> R$ ${finalPayment.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
                <p><strong>Valor Total do Projeto:</strong> R$ ${projectValue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
                <p><strong>Prazo para Pagamento:</strong> 5 dias úteis</p>
              </div>

              <a href="${paymentLink.url}" 
                 style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0;">
                Realizar Pagamento Final
              </a>
              
              <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
                Após a confirmação do pagamento, você poderá agendar a entrega do projeto!
              </p>
              
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;" />
              <p style="color: #6b7280; font-size: 12px;">Equipe Softrha</p>
            </div>
          `,
        });
      } catch (emailError) {
        console.error("Erro ao enviar e-mail:", emailError);
      }
    }

    // Preparar WhatsApp se solicitado
    let whatsappUrl = null;
    if (sendWhatsApp && budget.clientPhone) {
      const phoneDigits = budget.clientPhone.replace(/\D/g, "");
      const whatsappMessage = `Olá ${budget.clientName}! Seu projeto está 100% concluído! 🎉\n\nSegue o link para pagamento final (75%):\n${paymentLink.url}\n\nValor: R$ ${finalPayment.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}\n\nApós o pagamento, você poderá agendar a entrega!`;
      whatsappUrl = `https://wa.me/55${phoneDigits}?text=${encodeURIComponent(whatsappMessage)}`;
    }

    return NextResponse.json({
      success: true,
      payment: {
        id: payment.id,
        amount: finalPayment,
        status: payment.status,
        dueDate: payment.dueDate,
      },
      paymentLink: paymentLink.url,
      whatsappUrl,
      emailSent: sendEmail && !!resend,
    });

  } catch (error) {
    console.error("Erro ao gerar link de pagamento final:", error);
    return NextResponse.json(
      { error: "Erro ao gerar link de pagamento final" },
      { status: 500 }
    );
  }
}
