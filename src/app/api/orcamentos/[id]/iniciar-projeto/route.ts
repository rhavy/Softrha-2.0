import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Buscar orçamento
    const budget = await prisma.budget.findUnique({
      where: { id },
    });

    if (!budget) {
      return NextResponse.json(
        { error: "Orçamento não encontrado" },
        { status: 404 }
      );
    }

    // Verificar se orçamento está em status adequado
    if (budget.status !== "accepted" && budget.status !== "down_payment_paid") {
      return NextResponse.json(
        { error: "Apenas orçamentos aceitos ou com entrada paga podem iniciar um projeto" },
        { status: 400 }
      );
    }

    // Verificar se já existe projeto vinculado
    if (budget.projectId) {
      return NextResponse.json(
        { error: "Este orçamento já está vinculado a um projeto" },
        { status: 400 }
      );
    }

    // Calcular 25% do valor do projeto
    const projectValue = budget.finalValue || 0;
    const downPayment = projectValue * 0.25; // 25% de entrada

    // Buscar ou criar cliente
    let client = await prisma.client.findFirst({
      where: {
        name: budget.clientName,
      },
    });

    if (!client) {
      // Extrair nome e sobrenome
      const nameParts = budget.clientName.split(" ");
      const firstName = nameParts[0] || budget.clientName;
      const lastName = nameParts.slice(1).join(" ") || "Cliente";

      client = await prisma.client.create({
        data: {
          firstName,
          lastName,
          name: budget.clientName,
          documentType: "cpf",
          document: `GENERATED_${Date.now()}`,
          emails: budget.clientEmail ? JSON.stringify([
            { id: "1", value: budget.clientEmail, type: "pessoal", isPrimary: true }
          ]) : null,
          phones: budget.clientPhone ? JSON.stringify([
            { id: "1", value: budget.clientPhone, type: "whatsapp", isPrimary: true }
          ]) : null,
          notes: budget.company ? `Empresa: ${budget.company}` : null,
          status: "active",
        },
      });
    }

    // Mapear complexidade do orçamento para o projeto
    const complexityMap: Record<string, string> = {
      simple: "simple",
      medium: "medium",
      complex: "complex",
      simples: "simple",
      medio: "medium",
      complexo: "complex",
    };

    // Mapear timeline do orçamento para o projeto
    const timelineMap: Record<string, string> = {
      urgent: "urgent",
      normal: "normal",
      flexible: "flexible",
      urgente: "urgent",
      flexivel: "flexible",
    };

    // Buscar primeiro usuário admin para usar como criador
    const adminUser = await prisma.user.findFirst({
      where: { role: "admin" },
    });

    // Criar projeto aguardando pagamento
    const project = await prisma.project.create({
      data: {
        name: `${budget.projectType} - ${budget.clientName}`,
        description: budget.details || `Projeto criado a partir do orçamento para ${budget.clientName}`,
        status: "waiting_payment", // Status especial aguardando pagamento
        type: budget.projectType,
        complexity: complexityMap[budget.complexity] || "medium",
        timeline: timelineMap[budget.timeline] || "normal",
        budget: projectValue,
        clientId: client.id,
        clientName: budget.clientName,
        createdById: adminUser?.id,
        progress: 0,
      },
    });

    // Atualizar orçamento com projectId
    await prisma.budget.update({
      where: { id },
      data: {
        projectId: project.id,
      },
    });

    return NextResponse.json({
      success: true,
      project: {
        id: project.id,
        name: project.name,
        status: project.status,
        value: projectValue,
        downPayment: downPayment,
      },
    });
  } catch (error) {
    console.error("Erro ao iniciar projeto:", error);
    return NextResponse.json(
      { error: "Erro ao iniciar projeto" },
      { status: 500 }
    );
  }
}
