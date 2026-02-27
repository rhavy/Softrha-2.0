import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { createLog } from "@/lib/create-log";
import { createNotificationForAdmins } from "@/lib/create-notification";

// GET - Buscar detalhes de um projeto
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const sessionData = await auth.api.getSession({ headers: request.headers });
    const { id } = await params;

    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        client: {
          select: {
            name: true,
            emails: true,
            phones: true,
          },
        },
        createdBy: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: "Projeto não encontrado" },
        { status: 404 }
      );
    }

    // Criar log de visualização
    if (sessionData?.session) {
      await createLog({
        type: "VIEW",
        category: "PROJECT",
        level: "INFO",
        userId: sessionData.session.userId,
        entityId: project.id,
        entityType: "Project",
        action: "Visualizar projeto",
        description: `Usuário visualizou detalhes do projeto "${project.name}"`,
        metadata: { projectId: project.id, projectName: project.name },
      });
    }

    const budget = await prisma.budget.findFirst({
      where: { projectId: id },
      select: { id: true },
    });

    let clientData = project.client;
    if (clientData) {
      try {
        const parsedEmails = clientData.emails ? JSON.parse(clientData.emails) : [];
        const parsedPhones = clientData.phones ? JSON.parse(clientData.phones) : [];

        clientData = {
          ...clientData,
          emails: parsedEmails,
          phones: parsedPhones,
        };
      } catch (e) {
        console.warn("Erro ao parsear emails/phones:", e);
      }
    }

    return NextResponse.json({
      ...project,
      client: clientData,
      budgetId: budget?.id,
    });
  } catch (error) {
    console.error("Erro ao buscar projeto:", error);
    await createLog({
      type: "SYSTEM",
      category: "PROJECT",
      level: "ERROR",
      action: "Erro ao buscar projeto",
      description: `Erro: ${error instanceof Error ? error.message : String(error)}`,
    });
    return NextResponse.json(
      { error: "Erro ao buscar projeto" },
      { status: 500 }
    );
  }
}

// PUT - Atualizar projeto
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const sessionData = await auth.api.getSession({ headers: request.headers });
    const { id } = await params;
    const body = await request.json();

    if (!sessionData?.session) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }

    const userId = sessionData.session.userId;

    // Buscar projeto atual para log
    const existingProject = await prisma.project.findUnique({
      where: { id },
    });

    if (!existingProject) {
      return NextResponse.json(
        { error: "Projeto não encontrado" },
        { status: 404 }
      );
    }

    const updateData: any = {};

    if (body.name !== undefined) updateData.name = body.name;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.budget !== undefined) updateData.budget = parseFloat(body.budget);
    if (body.dueDate !== undefined) {
      updateData.dueDate = body.dueDate ? new Date(body.dueDate) : null;
    }
    if (body.startDate !== undefined) {
      updateData.startDate = body.startDate ? new Date(body.startDate) : null;
    }
    if (body.progress !== undefined) updateData.progress = parseInt(body.progress);
    if (body.tech !== undefined) {
      updateData.tech = Array.isArray(body.tech) ? JSON.stringify(body.tech) : body.tech;
    }
    if (body.gitRepositoryUrl !== undefined) updateData.gitRepositoryUrl = body.gitRepositoryUrl;
    if (body.testUrl !== undefined) updateData.testUrl = body.testUrl;

    const project = await prisma.project.update({
      where: { id },
      data: updateData,
    });

    // Criar log de atualização
    await createLog({
      type: "UPDATE",
      category: "PROJECT",
      level: "INFO",
      userId,
      entityId: project.id,
      entityType: "Project",
      action: "Projeto atualizado",
      description: `Projeto "${project.name}" atualizado`,
      metadata: { projectId: project.id, projectName: project.name, updatedFields: Object.keys(updateData) },
      changes: {
        before: existingProject,
        after: project,
      },
    });

    return NextResponse.json({
      id: project.id,
      name: project.name,
      status: project.status,
      budget: project.budget,
      dueDate: project.dueDate?.toISOString(),
      startDate: project.startDate?.toISOString(),
    });
  } catch (error) {
    console.error("Erro ao atualizar projeto:", error);
    await createLog({
      type: "SYSTEM",
      category: "PROJECT",
      level: "ERROR",
      action: "Erro ao atualizar projeto",
      description: `Erro: ${error instanceof Error ? error.message : String(error)}`,
    });
    return NextResponse.json(
      { error: "Erro ao atualizar projeto: " + (error as any).message },
      { status: 500 }
    );
  }
}

// DELETE - Excluir projeto
export async function DELETE(
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

    const userId = sessionData.session.userId;

    // Buscar projeto para log
    const project = await prisma.project.findUnique({
      where: { id },
    });

    if (!project) {
      return NextResponse.json(
        { error: "Projeto não encontrado" },
        { status: 404 }
      );
    }

    // Excluir projeto
    await prisma.project.delete({
      where: { id },
    });

    // Criar log de exclusão
    await createLog({
      type: "DELETE",
      category: "PROJECT",
      level: "WARNING",
      userId,
      entityId: project.id,
      entityType: "Project",
      action: "Projeto excluído",
      description: `Projeto "${project.name}" foi excluído`,
      metadata: {
        projectId: project.id,
        projectName: project.name,
        clientName: project.clientName,
        deletedBy: userId,
      },
      changes: { before: project, after: null },
    });

    // Criar notificação para admins
    await createNotificationForAdmins({
      title: "Projeto Excluído 🗑️",
      message: `O projeto "${project.name}" foi excluído do sistema.`,
      type: "warning",
      category: "project",
      metadata: {
        projectId: project.id,
        projectName: project.name,
        deletedAt: new Date().toISOString(),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Projeto excluído com sucesso",
    });
  } catch (error) {
    console.error("Erro ao excluir projeto:", error);
    await createLog({
      type: "SYSTEM",
      category: "PROJECT",
      level: "ERROR",
      action: "Erro ao excluir projeto",
      description: `Erro: ${error instanceof Error ? error.message : String(error)}`,
    });
    return NextResponse.json(
      { error: "Erro ao excluir projeto: " + (error as any).message },
      { status: 500 }
    );
  }
}
