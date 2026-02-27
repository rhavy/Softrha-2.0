import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// GET - Buscar log específico por ID
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

    const log = await prisma.log.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    if (!log) {
      return NextResponse.json(
        { error: "Log não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      log,
    });
  } catch (error) {
    console.error("Erro ao buscar log:", error);
    return NextResponse.json(
      { error: "Erro ao buscar log" },
      { status: 500 }
    );
  }
}

// DELETE - Excluir log (apenas admin)
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

    // Verificar se é admin
    const user = await prisma.user.findUnique({
      where: { id: sessionData.session.userId },
    });

    if (user?.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Apenas administradores podem excluir logs" },
        { status: 403 }
      );
    }

    const { id } = await params;

    await prisma.log.delete({
      where: { id },
    });

    // Criar log de exclusão
    await prisma.log.create({
      data: {
        type: "DELETE",
        category: "SYSTEM",
        level: "WARNING",
        userId: sessionData.session.userId,
        entityId: id,
        entityType: "Log",
        action: "Log excluído",
        description: `Log ${id} excluído por administrador`,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Log excluído com sucesso",
    });
  } catch (error) {
    console.error("Erro ao excluir log:", error);
    return NextResponse.json(
      { error: "Erro ao excluir log" },
      { status: 500 }
    );
  }
}
