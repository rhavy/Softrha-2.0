import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// GET - Verificar se cliente já avaliou o projeto
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const sessionData = await auth.api.getSession({ headers: request.headers });
    const { id } = await params;

    if (!sessionData?.session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Buscar avaliação existente
    const evaluation = await prisma.clientEvaluation.findFirst({
      where: { projectId: id },
    });

    return NextResponse.json({
      hasEvaluated: !!evaluation,
      evaluation: evaluation ? {
        rating: evaluation.rating,
        participation: evaluation.participation,
        quality: evaluation.quality,
        comment: evaluation.comment,
      } : null,
    });
  } catch (error) {
    console.error("Erro ao buscar avaliação:", error);
    return NextResponse.json(
      { error: "Erro ao buscar avaliação" },
      { status: 500 }
    );
  }
}

// POST - Criar avaliação de cliente
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const sessionData = await auth.api.getSession({ headers: request.headers });
    const { id } = await params;
    const body = await request.json();
    const { rating, participation, quality, comment, clientId } = body;

    if (!sessionData?.session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Validações
    if (!rating || !participation || !quality) {
      return NextResponse.json(
        { error: "Avaliação, participação e qualidade são obrigatórios" },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5 || participation < 1 || participation > 5 || quality < 1 || quality > 5) {
      return NextResponse.json(
        { error: "As avaliações devem ser entre 1 e 5" },
        { status: 400 }
      );
    }

    // Verificar se já avaliou
    const existing = await prisma.clientEvaluation.findFirst({
      where: { projectId: id },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Você já avaliou este projeto" },
        { status: 400 }
      );
    }

    // Buscar projeto para obter clientId
    const project = await prisma.project.findUnique({
      where: { id },
      select: { clientId: true },
    });

    if (!project) {
      return NextResponse.json({ error: "Projeto não encontrado" }, { status: 404 });
    }

    // Criar avaliação
    await prisma.clientEvaluation.create({
      data: {
        projectId: id,
        clientId: clientId || project.clientId,
        evaluatorId: sessionData.session.userId,
        rating,
        participation,
        quality,
        comment,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Avaliação enviada com sucesso!",
    });
  } catch (error) {
    console.error("Erro ao avaliar projeto:", error);
    return NextResponse.json(
      { error: "Erro ao avaliar projeto" },
      { status: 500 }
    );
  }
}
