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
