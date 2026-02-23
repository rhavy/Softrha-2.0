import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      clientId,
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

    // Validar clientId
    if (!clientId) {
      return NextResponse.json(
        { error: "clientId é obrigatório" },
        { status: 400 }
      );
    }

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

    // Buscar usuário do sistema
    let systemUser = await prisma.user.findFirst({
      where: { email: "system@softrha.com" },
    });

    if (!systemUser) {
      systemUser = await prisma.user.findFirst({
        where: { role: "admin" },
      });
    }

    if (!systemUser) {
      return NextResponse.json(
        { error: "Nenhum usuário encontrado no sistema" },
        { status: 500 }
      );
    }

    // Gerar token de aprovação único
    const approvalToken = `approval_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    const approvalTokenExpires = new Date();
    approvalTokenExpires.setDate(approvalTokenExpires.getDate() + 7); // 7 dias

    // Criar orçamento no banco
    const budget = await prisma.budget.create({
      data: {
        userId: systemUser.id,
        status: "pending",
        projectType: projectType || "web",
        complexity: complexityMap[complexity || "medio"] || "medium",
        timeline: timelineMap[timeline || "normal"] || "normal",
        features: features || [],
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
        approvalToken,
        approvalTokenExpires,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Orçamento enviado com sucesso! Em breve entraremos em contato.",
      budgetId: budget.id,
      approvalToken,
    });
  } catch (error) {
    console.error("Erro ao criar orçamento:", error);
    return NextResponse.json(
      { error: "Erro ao enviar orçamento. Tente novamente." },
      { status: 500 }
    );
  }
}
