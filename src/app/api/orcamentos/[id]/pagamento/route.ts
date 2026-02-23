import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generatePaymentLink } from "@/lib/stripe";

// GET - Buscar pagamento do orçamento
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Buscar pagamento de entrada
    const payment = await prisma.payment.findFirst({
      where: {
        budgetId: id,
        type: "down_payment",
      },
    });

    if (!payment) {
      return NextResponse.json({ payment: null });
    }

    return NextResponse.json({
      payment: {
        id: payment.id,
        amount: payment.amount,
        status: payment.status,
        paidAt: payment.paidAt,
        dueDate: payment.dueDate,
      },
      paymentLink: payment.stripePaymentLinkId ? payment.stripePaymentLinkId : null,
    });
  } catch (error) {
    console.error("Erro ao buscar pagamento:", error);
    return NextResponse.json(
      { error: "Erro ao buscar pagamento" },
      { status: 500 }
    );
  }
}

// POST - Gerar link de pagamento
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Buscar orçamento
    const budget = await prisma.budget.findUnique({
      where: { id },
    });

    if (!budget) {
      return NextResponse.json(
        { error: "Orçamento não encontrado" },
        { status: 404 }
      );
    }

    // Calcular 25% do valor
    const projectValue = budget.finalValue || 0;
    const downPayment = projectValue * 0.25;

    // Validar valor do pagamento
    if (downPayment <= 0) {
      return NextResponse.json(
        { error: "Valor do projeto é inválido ou zero" },
        { status: 400 }
      );
    }

    console.log("[Pagamento] Dados do orçamento:", {
      id: budget.id,
      clientName: budget.clientName,
      projectType: budget.projectType,
      finalValue: budget.finalValue,
      downPayment: downPayment,
    });

    // Verificar se já existe pagamento de entrada
    const existingPayment = await prisma.payment.findFirst({
      where: {
        budgetId: id,
        type: "down_payment",
      },
    });

    if (existingPayment && existingPayment.status === "paid") {
      return NextResponse.json({
        success: true,
        message: "Pagamento já foi realizado",
        paymentLink: null,
      });
    }

    // Gerar link de pagamento (SEM projeto ainda)
    const paymentLink = await generatePaymentLink(
      downPayment,
      `Entrada 25% - ${budget.projectType} - ${budget.clientName}`,
      {
        budgetId: id,
        type: "down_payment",
        clientName: budget.clientName,
        clientEmail: budget.clientEmail,
      }
    );

    console.log("[Pagamento] Link de pagamento gerado:", {
      id: paymentLink.id,
      url: paymentLink.url,
    });

    // Atualizar ou criar pagamento (SEM projectId)
    const payment = await prisma.payment.upsert({
      where: {
        id: existingPayment?.id || `new_${id}`,
      },
      update: {
        stripePaymentLinkId: paymentLink.id,
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      },
      create: {
        budgetId: id,
        projectId: null, // Projeto será criado após pagamento
        amount: downPayment,
        type: "down_payment",
        description: `Entrada de 25% - ${budget.projectType} - ${budget.clientName}`,
        status: "pending",
        stripePaymentLinkId: paymentLink.id,
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      },
    });

    return NextResponse.json({
      success: true,
      paymentLink: paymentLink.url,
      payment: {
        id: payment.id,
        amount: downPayment,
        status: payment.status,
        dueDate: payment.dueDate,
      },
    });
  } catch (error) {
    console.error("Erro ao gerar link de pagamento:", error);
    console.error("Detalhes do erro:", JSON.stringify(error, null, 2));

    // Extrair mensagem de erro do Stripe se disponível
    let errorMessage = "Erro ao gerar link de pagamento";
    if (error instanceof Error) {
      errorMessage = error.message;
      console.error("Stripe error details:", {
        message: error.message,
        stack: error.stack,
      });
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
