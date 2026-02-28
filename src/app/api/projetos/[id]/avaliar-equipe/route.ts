import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// POST - Avaliar membros da equipe do projeto
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const sessionData = await auth.api.getSession({ headers: request.headers });
    const { id } = await params;

    if (!sessionData?.session) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { evaluations } = body;

    if (!evaluations || !Array.isArray(evaluations) || evaluations.length === 0) {
      return NextResponse.json(
        { error: "Nenhuma avaliação fornecida" },
        { status: 400 }
      );
    }

    // Verificar se projeto existe e está finalizado
    const project = await prisma.project.findUnique({
      where: { id },
      select: { status: true, name: true },
    });

    if (!project) {
      return NextResponse.json(
        { error: "Projeto não encontrado" },
        { status: 404 }
      );
    }

    const finalizedStatuses = ["completed", "finished"];
    if (!finalizedStatuses.includes(project.status)) {
      return NextResponse.json(
        { error: "Só é possível avaliar projetos finalizados" },
        { status: 400 }
      );
    }

    const userId = sessionData.session.userId;

    // Criar avaliações para cada membro
    const createdEvaluations = [];
    for (const evaluation of evaluations) {
      const { memberId, rating, comment } = evaluation;

      if (!memberId || !rating || rating < 1 || rating > 5) {
        continue; // Pula avaliações inválidas
      }

      const created = await prisma.teamEvaluation.create({
        data: {
          projectId: id,
          memberId,
          evaluatorId: userId,
          rating,
          comment: comment || null,
        },
        include: {
          member: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      createdEvaluations.push(created);

      // Criar notificação para o membro avaliado
      await prisma.notification.create({
        data: {
          userId: memberId,
          title: "Você foi avaliado em um projeto! ⭐",
          message: `Você recebeu uma avaliação de ${rating}/5 no projeto "${project.name}"${comment ? `: ${comment}` : ""}.`,
          type: "success",
          category: "project",
          link: `/dashboard/projetos/${id}`,
          metadata: {
            projectId: id,
            projectName: project.name,
            rating,
            evaluatorId: userId,
          },
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Avaliações enviadas com sucesso",
      evaluations: createdEvaluations,
    });
  } catch (error) {
    console.error("Erro ao avaliar equipe:", error);
    return NextResponse.json(
      { error: "Erro ao avaliar equipe" },
      { status: 500 }
    );
  }
}
