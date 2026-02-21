import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { notifyNewBudget } from "@/lib/notifications";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      projectType,
      complexity,
      timeline,
      features,
      integrations,
      pages,
      estimatedMin,
      estimatedMax,
      name,
      email,
      phone,
      company,
      details,
    } = body;

    // Validação básica
    if (!projectType || !email || !name) {
      return NextResponse.json(
        { error: "Campos obrigatórios faltando" },
        { status: 400 }
      );
    }

    // Salvar orçamento no banco
    const budget = await prisma.budget.create({
      data: {
        projectType,
        complexity: complexity || "medio",
        timeline: timeline || "normal",
        features: features || [],
        integrations: integrations || [],
        pages: pages || 1,
        estimatedMin: estimatedMin || 0,
        estimatedMax: estimatedMax || 0,
        clientName: name,
        clientEmail: email,
        clientPhone: phone,
        company: company,
        details: details,
        status: "pending",
        userId: "anonymous", // Pode ser associado a um usuário se estiver logado
      },
    });

    // Enviar notificação para todos os admins (dashboard + email)
    await notifyNewBudget(
      budget.id,
      name,
      email,
      projectType,
      estimatedMin,
      estimatedMax,
      details,
      company
    );

    return NextResponse.json(
      {
        success: true,
        message: "Orçamento enviado com sucesso! Nossa equipe será notificada.",
        budgetId: budget.id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Erro ao salvar orçamento:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
