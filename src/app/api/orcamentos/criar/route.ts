import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      projectType,
      complexity,
      timeline,
      features,
      pages,
      integrations,
      name,
      firstName,
      lastName,
      email,
      phone,
      company,
      details,
      estimatedMin,
      estimatedMax,
      finalValue,
    } = body;

    // Usar firstName + lastName se disponível, senão usar name
    const clientName = firstName && lastName 
      ? `${firstName} ${lastName}` 
      : name || "Cliente não informado";

    // Mapear tipos do formulário para o banco
    const timelineMap: Record<string, string> = {
      urgente: "urgent",
      normal: "normal",
      flexivel: "flexible",
    };

    const complexityMap: Record<string, string> = {
      simples: "simple",
      medio: "medium",
      complexo: "complex",
    };

    // Tentar encontrar um usuário do sistema ou usar o primeiro usuário encontrado
    let systemUser = await prisma.user.findFirst({
      where: { email: "system@softrha.com" },
    });

    if (!systemUser) {
      // Se não existir, usa o primeiro usuário admin
      systemUser = await prisma.user.findFirst({
        where: { role: "admin" },
      });
    }

    if (!systemUser) {
      return NextResponse.json(
        {
          success: false,
          message: "Nenhum usuário encontrado no sistema.",
        },
        { status: 500 }
      );
    }

    // Criar orçamento no banco
    const budget = await prisma.budget.create({
      data: {
        userId: systemUser.id,
        status: "pending",
        projectType: projectType || "web",
        complexity: complexityMap[complexity || "medio"] || "medium",
        timeline: timelineMap[timeline || "normal"] || "normal",
        features: features || [], // Prisma já faz o stringify automaticamente para campos Json
        integrations: integrations || [],
        pages: pages || 1,
        estimatedMin: estimatedMin || 0,
        estimatedMax: estimatedMax || 0,
        finalValue: finalValue || 0,
        clientName: clientName,
        clientEmail: email,
        clientPhone: phone,
        company: company || "",
        details: details || "",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Orçamento enviado com sucesso! Em breve entraremos em contato.",
      budgetId: budget.id,
    });
  } catch (error) {
    console.error("Erro ao criar orçamento:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Erro ao enviar orçamento. Tente novamente.",
      },
      { status: 500 }
    );
  }
}
