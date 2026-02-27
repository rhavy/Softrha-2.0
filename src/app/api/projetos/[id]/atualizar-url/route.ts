import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// PATCH - Atualizar URL (Git ou Teste) com justificativa
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const sessionData = await auth.api.getSession({ headers: request.headers });

    if (!sessionData?.session) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }

    const { id: projectId } = await params;
    const body = await request.json();
    const { field, url, reason, description } = body;

    // Validar campo
    if (!field || !["git", "test"].includes(field)) {
      return NextResponse.json(
        { error: "Campo deve ser 'git' ou 'test'" },
        { status: 400 }
      );
    }

    // Validar URL
    if (!url || !url.trim()) {
      return NextResponse.json(
        { error: "URL é obrigatória" },
        { status: 400 }
      );
    }

    // Validar motivo
    if (!reason) {
      return NextResponse.json(
        { error: "Motivo é obrigatório" },
        { status: 400 }
      );
    }

    // Validar se o motivo é válido
    const validReasons = [
      "migracao_repositorio",
      "mudanca_plataforma",
      "atualizacao_ambiente",
      "erro_url_anterior",
      "solicitacao_cliente",
      "outro"
    ];

    if (!validReasons.includes(reason)) {
      return NextResponse.json(
        { error: "Motivo inválido" },
        { status: 400 }
      );
    }

    // Buscar projeto
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      return NextResponse.json(
        { error: "Projeto não encontrado" },
        { status: 404 }
      );
    }

    // Preparar dados para atualização
    const updateData: any = {
      lastUrlChangeReason: reason,
      lastUrlChangeDescription: description || null,
      lastUrlChangedAt: new Date(),
    };

    // Obter URL atual para histórico
    let oldUrl: string | null = null;
    if (field === "git") {
      oldUrl = project.gitRepositoryUrl;
      updateData.gitRepositoryUrl = url.trim();
    } else if (field === "test") {
      oldUrl = project.testUrl;
      updateData.testUrl = url.trim();
    }

    // Atualizar projeto
    await prisma.project.update({
      where: { id: projectId },
      data: updateData,
    });

    // Criar registro de histórico
    await prisma.projectUrlHistory.create({
      data: {
        projectId,
        field,
        oldUrl,
        newUrl: url.trim(),
        reason,
        description: description || null,
      },
    });

    console.log("[Atualização URL] URL atualizada com sucesso:", {
      projectId,
      field,
      reason,
      hasDescription: !!description,
    });

    return NextResponse.json({
      success: true,
      message: "URL atualizada com sucesso",
      field,
      url: url.trim(),
      reason,
    });
  } catch (error) {
    console.error("Erro ao atualizar URL:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar URL" },
      { status: 500 }
    );
  }
}
