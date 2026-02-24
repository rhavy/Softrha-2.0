import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { notifyNewProject } from "@/lib/notifications";

// GET - Listar todos os projetos
export async function GET(request: NextRequest) {
  try {
    // Para desenvolvimento, vamos permitir sem autenticação
    // Em produção, adicione a verificação de sessão
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    const where: any = {};

    if (status && status !== "todos") {
      // Mapear status do frontend para o banco
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

    // Mapear status do banco para o frontend
    const frontendStatusMap: Record<string, string> = {
      "planning": "Planejamento",
      "development": "Em Desenvolvimento",
      "review": "Em Revisão",
      "completed": "Concluído",
      "cancelled": "Cancelado",
    };

    // Formatar os dados para o frontend
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
    return NextResponse.json(
      { error: "Erro ao buscar projetos: " + (error as any).message },
      { status: 500 }
    );
  }
}

// POST - Criar novo projeto
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, clientId, client, description, status, tech, dueDate } = body;

    console.log("Dados recebidos:", body);

    // Validação básica
    if (!name || (!clientId && !client)) {
      return NextResponse.json(
        { error: "Nome e cliente são obrigatórios" },
        { status: 400 }
      );
    }

    // Mapear status do frontend para o banco
    const statusMap: Record<string, string> = {
      "Planejamento": "planning",
      "Em Desenvolvimento": "development",
      "Em Revisão": "review",
      "Concluído": "completed",
    };

    const dbStatus = statusMap[status] || "planning";

    // Buscar primeiro usuário para associar (em produção, usar session.user.id)
    const firstUser = await prisma.user.findFirst();
    
    if (!firstUser) {
      return NextResponse.json(
        { error: "Nenhum usuário encontrado. Crie uma conta primeiro." },
        { status: 400 }
      );
    }

    // Se clientId não foi fornecido, buscar pelo nome do cliente
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

    // Buscar cliente para obter nome
    const clientData = await prisma.client.findUnique({
      where: { id: finalClientId },
    });

    // Criar projeto
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
        progress: 0,
        dueDate: dueDate ? new Date(dueDate) : null,
        clientId: finalClientId,
        createdById: firstUser.id,
      },
    });

    // Enviar notificação para todos os admins
    await notifyNewProject(project.id, project.name, clientData?.name || client);

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
    return NextResponse.json(
      { error: "Erro ao criar projeto: " + (error as any).message },
      { status: 500 }
    );
  }
}
