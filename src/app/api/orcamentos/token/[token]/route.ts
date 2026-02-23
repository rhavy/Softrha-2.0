import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/orcamentos/token/[token]
 * 
 * Busca orçamento pelo token de aprovação (pública, sem autenticação)
 * Apenas para visualização da proposta
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    const budget = await prisma.budget.findFirst({
      where: { approvalToken: token },
    });

    if (!budget) {
      return NextResponse.json(
        { error: "Token não encontrado" },
        { status: 404 }
      );
    }

    // Verificar se token expirou
    if (budget.approvalTokenExpires && budget.approvalTokenExpires < new Date()) {
      return NextResponse.json(
        { error: "Token expirado" },
        { status: 400 }
      );
    }

    // Verificar se já foi respondido
    if (budget.status === "accepted" || budget.status === "rejected") {
      return NextResponse.json(
        { error: "Esta proposta já foi respondida" },
        { status: 400 }
      );
    }

    return NextResponse.json(budget);
  } catch (error) {
    console.error("Erro ao buscar orçamento por token:", error);
    return NextResponse.json(
      { error: "Erro ao buscar orçamento" },
      { status: 500 }
    );
  }
}
