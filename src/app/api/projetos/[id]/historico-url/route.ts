import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// GET - Buscar histórico de alterações de URL do projeto
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

    const { id: projectId } = await params;

    // Buscar projeto para validar existência
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      return NextResponse.json(
        { error: "Projeto não encontrado" },
        { status: 404 }
      );
    }

    // Buscar histórico de alterações
    const history = await prisma.projectUrlHistory.findMany({
      where: { projectId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      history,
    });
  } catch (error) {
    console.error("Erro ao buscar histórico de URL:", error);
    return NextResponse.json(
      { error: "Erro ao buscar histórico de URL" },
      { status: 500 }
    );
  }
}
