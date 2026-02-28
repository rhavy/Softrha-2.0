import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// GET - Buscar avaliações de um membro da equipe
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

    // Buscar todas as avaliações do membro
    const evaluations = await prisma.teamEvaluation.findMany({
      where: { memberId: id },
      select: {
        rating: true,
        comment: true,
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    // Calcular média
    const totalEvaluations = evaluations.length;
    const averageRating =
      totalEvaluations > 0
        ? evaluations.reduce((sum, e) => sum + e.rating, 0) / totalEvaluations
        : 0;

    return NextResponse.json({
      totalEvaluations,
      averageRating: Math.round(averageRating * 10) / 10,
      evaluations: evaluations.map((e) => ({
        rating: e.rating,
        comment: e.comment,
        projectName: e.project.name,
        projectId: e.project.id,
        createdAt: e.createdAt,
      })),
    });
  } catch (error) {
    console.error("Erro ao buscar avaliações:", error);
    return NextResponse.json(
      { error: "Erro ao buscar avaliações" },
      { status: 500 }
    );
  }
}
