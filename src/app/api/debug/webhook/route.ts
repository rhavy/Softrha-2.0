import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

/**
 * GET /api/debug/webhook?session_id=xxx
 * 
 * Endpoint para debug - verifica o status de uma sessão de pagamento
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const sessionId = searchParams.get("session_id");
    const budgetId = searchParams.get("budget_id");

    const debugInfo: any = {
      timestamp: new Date().toISOString(),
    };

    // Se tiver session_id, buscar sessão no Stripe
    if (sessionId) {
      console.log("[Debug] Buscando sessão no Stripe:", sessionId);
      try {
        const session = await stripe.checkout.sessions.retrieve(sessionId);
        debugInfo.stripeSession = {
          id: session.id,
          status: session.status,
          payment_status: session.payment_status,
          metadata: session.metadata,
          payment_link: session.payment_link,
          payment_intent: session.payment_intent,
          client_reference_id: session.client_reference_id,
        };
        console.log("[Debug] Sessão encontrada:", debugInfo.stripeSession);
      } catch (error) {
        debugInfo.stripeSessionError = error instanceof Error ? error.message : String(error);
        console.error("[Debug] Erro ao buscar sessão:", debugInfo.stripeSessionError);
      }
    }

    // Se tiver budgetId, buscar pagamento no banco
    if (budgetId) {
      console.log("[Debug] Buscando pagamentos para budget:", budgetId);
      const payments = await prisma.payment.findMany({
        where: { budgetId },
        include: {
          budget: true,
          project: true,
        },
      });
      
      debugInfo.payments = payments.map(p => ({
        id: p.id,
        type: p.type,
        status: p.status,
        amount: p.amount,
        stripePaymentLinkId: p.stripePaymentLinkId,
        stripePaymentId: p.stripePaymentId,
        paidAt: p.paidAt,
        budget: p.budget ? {
          id: p.budget.id,
          status: p.budget.status,
          projectId: p.budget.projectId,
        } : null,
        project: p.project ? {
          id: p.project.id,
          name: p.project.name,
          status: p.project.status,
        } : null,
      }));
      
      console.log("[Debug] Pagamentos encontrados:", debugInfo.payments);
    }

    // Buscar todos pagamentos recentes
    const recentPayments = await prisma.payment.findMany({
      where: {
        type: "down_payment",
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Últimas 24h
        },
      },
      include: {
        budget: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });
    
    debugInfo.recentPayments = recentPayments.map(p => ({
      id: p.id,
      type: p.type,
      status: p.status,
      budgetId: p.budgetId,
      budgetStatus: p.budget.status,
      stripePaymentLinkId: p.stripePaymentLinkId,
      createdAt: p.createdAt,
    }));

    return NextResponse.json(debugInfo);
  } catch (error) {
    console.error("[Debug] Erro:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
