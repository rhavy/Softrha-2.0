import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// GET - Listar todas as avaliações
export async function GET(request: NextRequest) {
  try {
    const sessionData = await auth.api.getSession({ headers: request.headers });

    if (!sessionData?.session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: sessionData.session.userId },
      select: { role: true },
    });

    // Apenas ADMIN pode acessar todas as avaliações
    if (user?.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Acesso restrito a administradores" },
        { status: 403 }
      );
    }

    // Buscar avaliações da equipe
    const teamEvaluations = await prisma.teamEvaluation.findMany({
      include: {
        member: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        project: {
          select: {
            name: true,
          },
        },
        evaluator: {
          select: {
            name: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Buscar avaliações de projetos (clientes)
    const projectEvaluations = await prisma.projectEvaluation.findMany({
      include: {
        project: {
          select: {
            id: true,
            name: true,
            clientName: true,
          },
        },
        evaluator: {
          select: {
            name: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Formatrar avaliações da equipe
    const formattedTeam = teamEvaluations.map((e) => ({
      id: e.id,
      memberId: e.memberId,
      memberName: e.member.name,
      memberEmail: e.member.email,
      projectName: e.project.name,
      rating: e.rating,
      comment: e.comment,
      evaluatorName: e.evaluator.name,
      createdAt: e.createdAt,
    }));

    // Formatrar avaliações de clientes (projetos)
    const formattedClients = projectEvaluations.map((e) => ({
      id: e.id,
      clientId: e.project.id,
      clientName: e.project.clientName,
      projectName: e.project.name,
      rating: Math.round(e.generalRating * 10) / 10,
      comment: e.generalComment,
      evaluatorName: e.evaluator.name,
      createdAt: e.createdAt,
    }));

    return NextResponse.json({
      team: formattedTeam,
      clients: formattedClients,
    });
  } catch (error) {
    console.error("Erro ao buscar avaliações:", error);
    return NextResponse.json(
      { error: "Erro ao buscar avaliações" },
      { status: 500 }
    );
  }
}
