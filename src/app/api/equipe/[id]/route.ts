import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { createLog } from "@/lib/create-log";

// PUT - Atualizar membro da equipe
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const sessionData = await auth.api.getSession({ headers: request.headers });
    const { id } = await params;
    const body = await request.json();
    const { name, role, area, email, phone, status, skills, projectsCount } = body;

    if (!sessionData?.session) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }

    const userId = sessionData.session.userId;

    // Verificar se o membro existe
    const existingMember = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingMember) {
      return NextResponse.json(
        { error: "Membro não encontrado" },
        { status: 404 }
      );
    }

    // Atualizar membro
    const updatedMember = await prisma.user.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(role && { teamRole: role }),
        ...(email && { email }),
        ...(phone !== undefined && { phone }),
        ...(status && { status }),
        ...(skills && { skills }),
        ...(projectsCount !== undefined && { projectsCount }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        teamRole: true,
        phone: true,
        status: true,
        skills: true,
        projectsCount: true,
      },
    });

    // Criar log de atualização
    await createLog({
      type: "UPDATE",
      category: "USER",
      level: "INFO",
      userId,
      entityId: id,
      entityType: "User",
      action: "Membro da equipe atualizado",
      description: `Dados do membro "${updatedMember.name}" atualizados`,
      metadata: {
        memberId: id,
        memberName: updatedMember.name,
        updatedFields: Object.keys(body).filter(key => key !== 'id'),
      },
      changes: {
        before: existingMember,
        after: updatedMember,
      },
    });

    return NextResponse.json({
      id: updatedMember.id,
      name: updatedMember.name,
      role: updatedMember.teamRole,
      email: updatedMember.email,
      phone: updatedMember.phone,
      status: updatedMember.status,
      skills: updatedMember.skills || [],
      projects: updatedMember.projectsCount,
    });
  } catch (error) {
    console.error("Erro ao atualizar membro:", error);
    await createLog({
      type: "SYSTEM",
      category: "USER",
      level: "ERROR",
      action: "Erro ao atualizar membro",
      description: `Erro: ${error instanceof Error ? error.message : String(error)}`,
    });
    return NextResponse.json(
      { error: "Erro ao atualizar membro: " + (error as any).message },
      { status: 500 }
    );
  }
}

// DELETE - Remover membro da equipe (mudar role para USER)
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

    // Verificar se o membro existe
    const existingMember = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingMember) {
      return NextResponse.json(
        { error: "Membro não encontrado" },
        { status: 404 }
      );
    }

    // Atualizar usuário para USER (remover da equipe)
    await prisma.user.update({
      where: { id },
      data: {
        role: "USER",
        teamRole: null,
        status: "active",
        projectsCount: 0,
      },
    });

    // Criar log de remoção
    await createLog({
      type: "UPDATE",
      category: "USER",
      level: "WARNING",
      userId,
      entityId: id,
      entityType: "User",
      action: "Membro removido da equipe",
      description: `Membro "${existingMember.name}" foi removido da equipe e retornou ao status de usuário`,
      metadata: {
        memberId: id,
        memberName: existingMember.name,
        previousRole: existingMember.teamRole,
        removedBy: userId,
      },
      changes: { 
        before: { role: "TEAM_MEMBER", teamRole: existingMember.teamRole }, 
        after: { role: "USER", teamRole: null },
      },
    });

    return NextResponse.json({ 
      success: true, 
      message: "Membro removido da equipe com sucesso" 
    });
  } catch (error) {
    console.error("Erro ao remover membro:", error);
    await createLog({
      type: "SYSTEM",
      category: "USER",
      level: "ERROR",
      action: "Erro ao remover membro",
      description: `Erro: ${error instanceof Error ? error.message : String(error)}`,
    });
    return NextResponse.json(
      { error: "Erro ao remover membro: " + (error as any).message },
      { status: 500 }
    );
  }
}
