import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// PUT - Atualizar projeto
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, client, description, status, tech, progress, dueDate } = body;

    console.log("Atualizando projeto:", id, body);

    // Verificar se o projeto existe
    const existingProject = await prisma.project.findUnique({
      where: { id },
    });

    if (!existingProject) {
      return NextResponse.json(
        { error: "Projeto não encontrado" },
        { status: 404 }
      );
    }

    // Mapear status do frontend para o banco
    const statusMap: Record<string, string> = {
      "Planejamento": "planning",
      "Em Desenvolvimento": "development",
      "Em Revisão": "review",
      "Concluído": "completed",
    };

    // Atualizar projeto
    const updatedProject = await prisma.project.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(client && { clientName: client }),
        ...(description !== undefined && { description }),
        ...(status && { status: statusMap[status] || existingProject.status }),
        ...(tech && { tech: JSON.stringify(tech) }),
        ...(progress !== undefined && { progress }),
        ...(dueDate && { dueDate: new Date(dueDate) }),
        ...(status === "Concluído" && { completedAt: new Date() }),
      },
    });

    const frontendStatusMap: Record<string, string> = {
      "planning": "Planejamento",
      "development": "Em Desenvolvimento",
      "review": "Em Revisão",
      "completed": "Concluído",
    };

    return NextResponse.json({
      id: updatedProject.id,
      name: updatedProject.name,
      client: updatedProject.clientName,
      status: frontendStatusMap[updatedProject.status] || updatedProject.status,
      progress: updatedProject.progress,
      dueDate: updatedProject.dueDate?.toISOString(),
      tech: updatedProject.tech ? JSON.parse(updatedProject.tech) : [],
    });
  } catch (error) {
    console.error("Erro ao atualizar projeto:", error);
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
    const { id } = await params;

    console.log("Excluindo projeto:", id);

    // Verificar se o projeto existe
    const existingProject = await prisma.project.findUnique({
      where: { id },
    });

    if (!existingProject) {
      return NextResponse.json(
        { error: "Projeto não encontrado" },
        { status: 404 }
      );
    }

    // Excluir projeto (em cascata excluirá tasks, milestones, etc.)
    await prisma.project.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Projeto excluído com sucesso" });
  } catch (error) {
    console.error("Erro ao excluir projeto:", error);
    return NextResponse.json(
      { error: "Erro ao excluir projeto: " + (error as any).message },
      { status: 500 }
    );
  }
}
