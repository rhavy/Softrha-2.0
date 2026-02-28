import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// GET - Buscar dados do projeto para avaliação
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

    // Buscar projeto
    const project = await prisma.project.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        status: true,
        createdById: true,
      },
    });

    if (!project) {
      return NextResponse.json({ error: "Projeto não encontrado" }, { status: 404 });
    }

    // Verificar se usuário é o criador do projeto ou ADMIN
    const user = await prisma.user.findUnique({
      where: { id: sessionData.session.userId },
      select: { role: true },
    });

    if (project.createdById !== sessionData.session.userId && user?.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Apenas o responsável pelo projeto pode avaliar" },
        { status: 403 }
      );
    }

    // Verificar se projeto está finalizado
    const finalizedStatuses = ["completed", "finished"];
    if (!finalizedStatuses.includes(project.status)) {
      return NextResponse.json(
        { error: "Só é possível avaliar projetos finalizados" },
        { status: 400 }
      );
    }

    // Buscar membros da equipe
    const teamMemberships = await prisma.projectTeamMember.findMany({
      where: { projectId: id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            teamRole: true,
          },
        },
      },
    });

    const teamMembers = teamMemberships.map((membership) => ({
      id: membership.user.id,
      name: membership.user.name,
      email: membership.user.email,
      projectRoles: [membership.role],
    }));

    // Verificar se já avaliou
    const existingEvaluation = await prisma.projectEvaluation.findFirst({
      where: {
        projectId: id,
        evaluatorId: sessionData.session.userId,
      },
    });

    return NextResponse.json({
      project,
      teamMembers,
      hasEvaluated: !!existingEvaluation,
    });
  } catch (error) {
    console.error("Erro ao buscar dados para avaliação:", error);
    return NextResponse.json(
      { error: "Erro ao buscar dados" },
      { status: 500 }
    );
  }
}
