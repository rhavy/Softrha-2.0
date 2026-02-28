import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// GET - Buscar projetos de um membro da equipe
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

    // Buscar todos os projetos onde o usuário é membro da equipe
    const teamMemberships = await prisma.projectTeamMember.findMany({
      where: { userId: id },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            status: true,
            completedAt: true,
          },
        },
      },
    });

    // Separar projetos atuais e passados
    const currentProjects = teamMemberships.filter((membership) => {
      const status = membership.project.status;
      // Projetos atuais: em andamento, planejamento, revisão
      return [
        "planning",
        "development",
        "development_20",
        "development_50",
        "development_70",
        "development_100",
        "waiting_final_payment",
        "review",
      ].includes(status);
    });

    const pastProjects = teamMemberships.filter((membership) => {
      const status = membership.project.status;
      // Projetos passados: concluídos, cancelados, finalizados
      return [
        "completed",
        "finished",
        "cancelled",
      ].includes(status);
    });

    return NextResponse.json({
      currentProjects: currentProjects.length,
      pastProjects: pastProjects.length,
      currentProjectsList: currentProjects.map((m) => ({
        id: m.project.id,
        name: m.project.name,
        status: m.project.status,
      })),
      pastProjectsList: pastProjects.map((m) => ({
        id: m.project.id,
        name: m.project.name,
        status: m.project.status,
        completedAt: m.project.completedAt,
      })),
    });
  } catch (error) {
    console.error("Erro ao buscar projetos do membro:", error);
    return NextResponse.json(
      { error: "Erro ao buscar projetos" },
      { status: 500 }
    );
  }
}
