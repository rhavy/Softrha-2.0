import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { createLog } from "@/lib/create-log";
import { createNotificationForAdmins } from "@/lib/create-notification";

// GET - Listar todos os projetos
export async function GET(request: NextRequest) {
  try {
    const sessionData = await auth.api.getSession({ headers: request.headers });

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    const where: any = {};

    if (status && status !== "todos") {
      const statusMap: Record<string, string> = {
        "Planejamento": "planning",
        "Em Desenvolvimento": "development",
        "Em Revisão": "review",
        "Concluído": "completed",
      };
      where.status = statusMap[status] || status.toLowerCase();
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { clientName: { contains: search, mode: "insensitive" } },
      ];
    }

    const projects = await prisma.project.findMany({
      where,
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
    });

    // Criar log de visualização
    if (sessionData?.session) {
      await createLog({
        type: "VIEW",
        category: "PROJECT",
        level: "INFO",
        userId: sessionData.session.userId,
        action: "Listar projetos",
        description: `Usuário visualizou a lista de projetos${search ? ` (busca: ${search})` : ""}`,
        metadata: { filters: { status, search }, totalProjects: projects.length },
      });
    }

    const frontendStatusMap: Record<string, string> = {
      "planning": "Planejamento",
      "development": "Em Desenvolvimento",
      "review": "Em Revisão",
      "completed": "Concluído",
      "cancelled": "Cancelado",
    };

    const formattedProjects = projects.map((project: any) => {
      const completedTasks = project.tasks.filter((t: any) => t.status === "done").length;
      const techArray = project.tech ? JSON.parse(project.tech) : [];

      return {
        id: project.id,
        name: project.name,
        client: project.clientName || "Cliente",
        status: frontendStatusMap[project.status] || project.status,
        progress: project.progress,
        dueDate: project.dueDate?.toISOString() || null,
        startDate: project.startDate?.toISOString() || null,
        budget: project.budget,
        tasks: {
          total: project.tasks.length,
          completed: completedTasks,
        },
        team: [],
        tech: techArray,
        description: project.description,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
      };
    });

    return NextResponse.json(formattedProjects);
  } catch (error) {
    console.error("Erro ao buscar projetos:", error);
    await createLog({
      type: "SYSTEM",
      category: "PROJECT",
      level: "ERROR",
      action: "Erro ao listar projetos",
      description: `Erro: ${error instanceof Error ? error.message : String(error)}`,
    });
    return NextResponse.json(
      { error: "Erro ao buscar projetos: " + (error as any).message },
      { status: 500 }
    );
  }
}

// POST - Criar novo projeto
export async function POST(request: NextRequest) {
  try {
    const sessionData = await auth.api.getSession({ headers: request.headers });
    const body = await request.json();
    const { name, clientId, client, description, status, tech, dueDate, budget } = body;

    // Validação básica
    if (!name || (!clientId && !client)) {
      return NextResponse.json(
        { error: "Nome e cliente são obrigatórios" },
        { status: 400 }
      );
    }

    const statusMap: Record<string, string> = {
      "Planejamento": "planning",
      "Em Desenvolvimento": "development",
      "Em Revisão": "review",
      "Concluído": "completed",
    };

    const dbStatus = statusMap[status] || "planning";

    const userId = sessionData?.session?.userId;
    if (!userId) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }

    let finalClientId = clientId;
    if (!finalClientId && client) {
      const foundClient = await prisma.client.findFirst({
        where: { name: { contains: client } },
      });
      if (foundClient) {
        finalClientId = foundClient.id;
      }
    }

    if (!finalClientId) {
      return NextResponse.json(
        { error: "Cliente não encontrado. Cadastre o cliente primeiro." },
        { status: 400 }
      );
    }

    const clientData = await prisma.client.findUnique({
      where: { id: finalClientId },
    });

    const project = await prisma.project.create({
      data: {
        name,
        clientName: clientData?.name || client,
        description: description || null,
        status: dbStatus,
        type: "web",
        complexity: "medium",
        timeline: "normal",
        tech: tech && tech.length > 0 ? JSON.stringify(tech) : null,
        budget: budget || null,
        progress: 0,
        dueDate: dueDate ? new Date(dueDate) : null,
        clientId: finalClientId,
        createdById: userId,
      },
    });

    // Criar log de criação
    await createLog({
      type: "CREATE",
      category: "PROJECT",
      level: "SUCCESS",
      userId,
      entityId: project.id,
      entityType: "Project",
      action: "Projeto criado",
      description: `Novo projeto "${name}" criado para o cliente ${clientData?.name || client}`,
      metadata: {
        projectId: project.id,
        clientName: clientData?.name || client,
        status: dbStatus,
        budget,
        tech,
      },
      changes: { before: null, after: project },
    });

    // Criar notificação para todos os admins
    await createNotificationForAdmins({
      title: "Novo Projeto Criado! 🚀",
      message: `O projeto "${name}" foi criado para ${clientData?.name || client}.`,
      type: "success",
      category: "project",
      link: `/dashboard/projetos/${project.id}`,
      metadata: {
        projectId: project.id,
        projectName: name,
        clientName: clientData?.name || client,
      },
    });

    return NextResponse.json({
      id: project.id,
      name: project.name,
      client: project.clientName,
      clientId: project.clientId,
      status: status,
      progress: project.progress,
      dueDate: project.dueDate?.toISOString(),
      tech: tech || [],
    });
  } catch (error) {
    console.error("Erro ao criar projeto:", error);
    await createLog({
      type: "SYSTEM",
      category: "PROJECT",
      level: "ERROR",
      action: "Erro ao criar projeto",
      description: `Erro: ${error instanceof Error ? error.message : String(error)}`,
      metadata: { body: await request.json().catch(() => ({}) ) },
    });
    return NextResponse.json(
      { error: "Erro ao criar projeto: " + (error as any).message },
      { status: 500 }
    );
  }
}
