import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - Listar projetos de um cliente
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Verificar se o cliente existe
    const client = await prisma.client.findUnique({
      where: { id },
      include: {
        projects: {
          include: {
            tasks: {
              select: {
                id: true,
                status: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    if (!client) {
      return NextResponse.json(
        { error: "Cliente não encontrado" },
        { status: 404 }
      );
    }

    // Formatar projetos
    const formattedProjects = client.projects.map((project) => {
      const completedTasks = project.tasks.filter((t) => t.status === "done").length;
      return {
        id: project.id,
        name: project.name,
        description: project.description,
        status: project.status,
        type: project.type,
        budget: project.budget,
        progress: project.progress,
        dueDate: project.dueDate?.toISOString(),
        tasks: {
          total: project.tasks.length,
          completed: completedTasks,
        },
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
      };
    });

    // Stats do cliente
    const stats = {
      totalProjects: client.projects.length,
      activeProjects: client.projects.filter((p) => 
        p.status === "development" || p.status === "review"
      ).length,
      completedProjects: client.projects.filter((p) => p.status === "completed").length,
      totalBudget: client.projects.reduce((sum, p) => sum + (p.budget || 0), 0),
    };

    return NextResponse.json({
      client: {
        id: client.id,
        name: client.name,
        documentType: client.documentType,
        document: String(client.document),
        emails: client.emails ? JSON.parse(client.emails) : [],
        phones: client.phones ? JSON.parse(client.phones) : [],
      },
      projects: formattedProjects,
      stats,
    });
  } catch (error) {
    console.error("Erro ao buscar projetos do cliente:", error);
    return NextResponse.json(
      { error: "Erro ao buscar projetos: " + (error as any).message },
      { status: 500 }
    );
  }
}
