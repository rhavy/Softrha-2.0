import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

/**
 * POST /api/orcamentos/[id]/contrato/confirmar
 *
 * Confirma o contrato assinado pelo cliente
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const sessionData = await auth.api.getSession({ headers: request.headers });

    if (!sessionData?.session) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }

    const { id: budgetId } = await params;

    // Buscar contrato do orçamento
    const contract = await prisma.contract.findUnique({
      where: { budgetId },
      include: {
        budget: true,
      },
    });

    if (!contract) {
      return NextResponse.json(
        { error: "Contrato não encontrado" },
        { status: 404 }
      );
    }

    // Atualizar contrato para confirmado
    const updatedContract = await prisma.contract.update({
      where: { id: contract.id },
      data: {
        confirmed: true,
        status: "confirmed", // ou manter "signed" se preferir
        signedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      contract: updatedContract,
      message: "Contrato confirmado com sucesso",
    });
  } catch (error) {
    console.error("Erro ao confirmar contrato:", error);
    return NextResponse.json(
      { error: "Erro ao confirmar contrato" },
      { status: 500 }
    );
  }
}

// GET - Buscar status do contrato
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: budgetId } = await params;

    const contract = await prisma.contract.findUnique({
      where: { budgetId },
      select: {
        id: true,
        status: true,
        confirmed: true,
        signedAt: true,
      },
    });

    if (!contract) {
      return NextResponse.json(
        { error: "Contrato não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(contract);
  } catch (error) {
    console.error("Erro ao buscar contrato:", error);
    return NextResponse.json(
      { error: "Erro ao buscar contrato" },
      { status: 500 }
    );
  }
}
