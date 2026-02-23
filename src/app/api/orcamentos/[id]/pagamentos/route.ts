import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/orcamentos/[id]/pagamentos
 * 
 * Busca todos os pagamentos de um orçamento (entrada e final)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: budgetId } = await params;

    const payments = await prisma.payment.findMany({
      where: { budgetId },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json({
      payments,
      total: payments.length,
    });
  } catch (error) {
    console.error("Erro ao buscar pagamentos:", error);
    return NextResponse.json(
      { error: "Erro ao buscar pagamentos" },
      { status: 500 }
    );
  }
}
