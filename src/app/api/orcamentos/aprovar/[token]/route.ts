import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * PUT /api/orcamentos/aprovar/[token]
 * 
 * Processa a resposta do cliente (aceitar ou negar)
 * Pública, mas apenas uma vez por token
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const body = await request.json();
    const { accepted } = body;

    // Buscar orçamento pelo token
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

    // Atualizar orçamento
    const newStatus = accepted ? "accepted" : "rejected";
    
    await prisma.budget.update({
      where: { id: budget.id },
      data: {
        status: newStatus,
        userApprovedAt: accepted ? new Date() : null,
        approvalToken: null, // Invalida token após uso
        approvalTokenExpires: null,
      },
    });

    return NextResponse.json({
      success: true,
      status: newStatus,
      message: accepted ? "Proposta aceita com sucesso!" : "Proposta negada.",
    });

  } catch (error) {
    console.error("Erro ao processar resposta:", error);
    return NextResponse.json(
      { error: "Erro ao processar resposta" },
      { status: 500 }
    );
  }
}
