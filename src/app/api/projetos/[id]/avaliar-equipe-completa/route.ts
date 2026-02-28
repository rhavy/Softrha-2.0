import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// POST - Enviar avaliação completa da equipe
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const sessionData = await auth.api.getSession({ headers: request.headers });
    const { id } = await params;

    if (!sessionData?.session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const {
      generalRatings,
      generalComment,
      individualEvaluations,
    } = body;

    const userId = sessionData.session.userId;

    // Buscar projeto
    const project = await prisma.project.findUnique({
      where: { id },
      select: { name: true, status: true },
    });

    if (!project) {
      return NextResponse.json({ error: "Projeto não encontrado" }, { status: 404 });
    }

    // Verificar se projeto está finalizado
    const finalizedStatuses = ["completed", "finished"];
    if (!finalizedStatuses.includes(project.status)) {
      return NextResponse.json(
        { error: "Só é possível avaliar projetos finalizados" },
        { status: 400 }
      );
    }

    // Calcular média geral
    const generalAverage =
      Object.values(generalRatings as Record<string, number>).reduce((sum, rating) => sum + rating, 0) /
      Object.keys(generalRatings).length;

    // Criar avaliação do projeto
    const projectEvaluation = await prisma.projectEvaluation.create({
      data: {
        projectId: id,
        evaluatorId: userId,
        generalRating: generalAverage,
        generalRatings: JSON.stringify(generalRatings),
        generalComment: generalComment || null,
      },
    });

    // Criar avaliações individuais e notificações
    for (const evaluation of individualEvaluations) {
      const { memberId, memberName, ratings, comment } = evaluation;

      // Calcular média individual
      const memberAverage =
        Object.values(ratings as Record<string, number>).reduce((sum, rating) => sum + rating, 0) /
        Object.keys(ratings).length;

      // Criar avaliação individual
      await prisma.teamEvaluation.create({
        data: {
          projectId: id,
          memberId,
          evaluatorId: userId,
          rating: Math.round(memberAverage),
          comment: comment || null,
          detailedRatings: JSON.stringify(ratings),
        },
      });

      // Criar notificação para o membro
      await prisma.notification.create({
        data: {
          userId: memberId,
          title: `Você foi avaliado no projeto "${project.name}"! ⭐`,
          message: `Sua avaliação média foi ${Math.round(memberAverage)}/5. ${comment ? `Comentário: ${comment}` : ""}`,
          type: "success",
          category: "project",
          link: `/dashboard/projetos/${id}`,
          metadata: {
            projectId: id,
            projectName: project.name,
            rating: Math.round(memberAverage),
            evaluatorId: userId,
            detailedRatings: ratings,
          },
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Avaliação enviada com sucesso",
      evaluationId: projectEvaluation.id,
    });
  } catch (error) {
    console.error("Erro ao enviar avaliação:", error);
    return NextResponse.json(
      { error: "Erro ao enviar avaliação" },
      { status: 500 }
    );
  }
}
