import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// POST - Avaliar membro da equipe no projeto
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const sessionData = await auth.api.getSession({ headers: request.headers });
    const { id } = await params;
    const body = await request.json();
    const { memberId, rating, participation, quality, comment } = body;

    if (!sessionData?.session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const evaluatorId = sessionData.session.userId;

    // Verificar se já avaliou este membro neste projeto
    const existing = await prisma.projectMemberEvaluation.findUnique({
      where: {
        projectId_memberId_evaluatorId: {
          projectId: id,
          memberId,
          evaluatorId,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Você já avaliou este membro neste projeto" },
        { status: 400 }
      );
    }

    // Criar avaliação
    await prisma.projectMemberEvaluation.create({
      data: {
        projectId: id,
        memberId,
        evaluatorId,
        rating,
        participation,
        quality,
        comment,
      },
    });

    return NextResponse.json({ success: true, message: "Avaliação enviada com sucesso" });
  } catch (error) {
    console.error("Erro ao avaliar membro:", error);
    return NextResponse.json(
      { error: "Erro ao avaliar membro" },
      { status: 500 }
    );
  }
}

// GET - Verificar se usuário já avaliou todos os membros
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

    const evaluatorId = sessionData.session.userId;

    // Buscar membros da equipe do projeto
    const teamMembers = await prisma.projectTeamMember.findMany({
      where: { projectId: id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Buscar avaliações já feitas pelo usuário
    const evaluations = await prisma.projectMemberEvaluation.findMany({
      where: {
        projectId: id,
        evaluatorId,
      },
      select: {
        memberId: true,
      },
    });

    const evaluatedMemberIds = new Set(evaluations.map(e => e.memberId));
    const membersToEvaluate = teamMembers.filter(tm => tm.userId !== evaluatorId && !evaluatedMemberIds.has(tm.userId));

    return NextResponse.json({
      teamMembers: teamMembers.map(tm => ({
        id: tm.user.id,
        name: tm.user.name,
        email: tm.user.email,
        role: tm.role,
        evaluated: evaluatedMemberIds.has(tm.userId),
      })),
      allEvaluated: membersToEvaluate.length === 0 && teamMembers.length > 1,
    });
  } catch (error) {
    console.error("Erro ao buscar avaliações:", error);
    return NextResponse.json(
      { error: "Erro ao buscar avaliações" },
      { status: 500 }
    );
  }
}
