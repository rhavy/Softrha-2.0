import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { Select } from "@prisma/client";

// GET - Buscar detalhes de um orçamento
export async function GET(
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

    const { id } = await params;

    const budget = await prisma.budget.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        contract: {
          select: {
            id: true,
            status: true,
            confirmed: true,
            signedAt: true,
            documentUrl: true,
            content: true,
            metadata: true,
          },
        },
        payments: true,
      },
    });

    if (!budget) {
      return NextResponse.json(
        { error: "Orçamento não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(budget);
  } catch (error) {
    console.error("Erro ao buscar orçamento:", error);
    return NextResponse.json(
      { error: "Erro ao buscar orçamento" },
      { status: 500 }
    );
  }
}

// PUT - Atualizar orçamento (com justificativa para alteração)
export async function PUT(
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

    const { id } = await params;
    const body = await request.json();

    // Verificar se é uma alteração de orçamento (não apenas status)
    const isChangeRequest = body.changeReason !== undefined;

    if (isChangeRequest) {
      // Justificativa é obrigatória para alteração
      if (!body.changeReason || !Object.values(Select).includes(body.changeReason)) {
        return NextResponse.json(
          { error: "Motivo da alteração é obrigatório e deve ser válido" },
          { status: 400 }
        );
      }
    }

    // Verificar se é uma exclusão com justificativa
    const isDeletionRequest = body.deletionReason !== undefined;

    if (isDeletionRequest) {
      // Justificativa é obrigatória para exclusão
      if (!body.deletionReason || !Object.values(Select).includes(body.deletionReason)) {
        return NextResponse.json(
          { error: "Motivo da exclusão é obrigatório e deve ser válido" },
          { status: 400 }
        );
      }
    }

    // Tratar campos JSON - parsear strings JSON para objetos
    const updateData: any = { ...body };
    if (body.technologies && typeof body.technologies === "string") {
      try {
        updateData.technologies = JSON.parse(body.technologies);
      } catch (e) {
        // Se não for JSON válido, manter como está
      }
    }
    if (body.features && typeof body.features === "string") {
      try {
        updateData.features = JSON.parse(body.features);
      } catch (e) {
        // Se não for JSON válido, manter como está
      }
    }
    if (body.integrations && typeof body.integrations === "string") {
      try {
        updateData.integrations = JSON.parse(body.integrations);
      } catch (e) {
        // Se não for JSON válido, manter como está
      }
    }

    const budget = await prisma.budget.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(budget);
  } catch (error) {
    console.error("Erro ao atualizar orçamento:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar orçamento" },
      { status: 500 }
    );
  }
}

// DELETE - Excluir orçamento (com justificativa)
export async function DELETE(
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

    const { id } = await params;
    const body = await request.json();

    // Verificar se foi fornecida justificativa para exclusão
    if (!body.deletionReason || !Object.values(Select).includes(body.deletionReason)) {
      return NextResponse.json(
        { error: "Motivo da exclusão é obrigatório e deve ser válido" },
        { status: 400 }
      );
    }

    // Atualizar orçamento com justificativa antes de excluir (para histórico)
    await prisma.budget.update({
      where: { id },
      data: {
        deletionReason: body.deletionReason,
        deletionDescription: body.deletionDescription || null,
        status: "rejected", // Marca como rejeitado antes de excluir
      },
    });

    // Excluir orçamento
    await prisma.budget.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Orçamento excluído com sucesso"
    });
  } catch (error) {
    console.error("Erro ao excluir orçamento:", error);
    return NextResponse.json(
      { error: "Erro ao excluir orçamento" },
      { status: 500 }
    );
  }
}
