import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - Buscar detalhes de um projeto
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
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

    // Buscar orçamento vinculado para obter budgetId
    const budget = await prisma.budget.findFirst({
      where: { projectId: id },
      select: { id: true },
    });

    // Parsear emails e phones do cliente (estão como JSON string)
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
    const { id } = await params;
    const body = await request.json();

    const updateData: any = {};

    // Mapear campos permitidos
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

    const project = await prisma.project.update({
      where: { id },
      data: updateData,
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
    return NextResponse.json(
      { error: "Erro ao atualizar projeto: " + (error as any).message },
      { status: 500 }
    );
  }
}
