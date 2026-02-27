import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { createLog } from "@/lib/create-log";
import { createNotification } from "@/lib/create-notification";

// GET - Listar todos os membros da equipe (usuários com role TEAM_MEMBER)
export async function GET(request: NextRequest) {
  try {
    const sessionData = await auth.api.getSession({ headers: request.headers });
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    const where: any = {
      role: "TEAM_MEMBER",
    };

    if (status && status !== "todos") {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { teamRole: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    const members = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        teamRole: true,
        phone: true,
        avatar: true,
        status: true,
        skills: true,
        projectsCount: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Formatar os dados para o frontend
    const formattedMembers = members.map((member) => ({
      id: member.id,
      name: member.name,
      role: member.teamRole || "Membro",
      email: member.email,
      phone: member.phone,
      avatar: member.avatar,
      status: member.status,
      projects: member.projectsCount,
      skills: member.skills || [],
    }));

    // Criar log de visualização
    if (sessionData?.session) {
      await createLog({
        type: "VIEW",
        category: "USER",
        level: "INFO",
        userId: sessionData.session.userId,
        action: "Listar membros da equipe",
        description: `Usuário visualizou a lista de membros da equipe${search ? ` (busca: ${search})` : ""}`,
        metadata: { filters: { status, search }, totalMembers: formattedMembers.length },
      });
    }

    return NextResponse.json(formattedMembers);
  } catch (error) {
    console.error("Erro ao buscar equipe:", error);
    return NextResponse.json(
      { error: "Erro ao buscar equipe: " + (error as any).message },
      { status: 500 }
    );
  }
}

// POST - Adicionar usuário existente como membro da equipe
export async function POST(request: NextRequest) {
  try {
    const sessionData = await auth.api.getSession({ headers: request.headers });
    const body = await request.json();
    const { userId, role, area, skills, status } = body;

    if (!sessionData?.session) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }

    const userIdAuth = sessionData.session.userId;

    // Validação básica
    if (!userId || !role) {
      return NextResponse.json(
        { error: "Usuário e cargo são obrigatórios" },
        { status: 400 }
      );
    }

    // Buscar usuário para log
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    // Verificar se usuário já é membro da equipe
    if (existingUser.role === "TEAM_MEMBER" || existingUser.teamRole) {
      return NextResponse.json(
        { error: "Usuário já é membro da equipe" },
        { status: 400 }
      );
    }

    // Atualizar usuário para TEAM_MEMBER
    const member = await prisma.user.update({
      where: { id: userId },
      data: {
        role: "TEAM_MEMBER",
        teamRole: role,
        status: status || "active",
        skills: skills && skills.length > 0 ? skills : null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        teamRole: true,
        phone: true,
        status: true,
        skills: true,
      },
    });

    // Criar log de criação
    await createLog({
      type: "UPDATE",
      category: "USER",
      level: "SUCCESS",
      userId: userIdAuth,
      entityId: member.id,
      entityType: "User",
      action: "Usuário promovido a membro da equipe",
      description: `Usuário "${member.name}" foi adicionado à equipe como "${role}"`,
      metadata: {
        memberId: member.id,
        memberName: member.name,
        memberRole: role,
        area,
      },
      changes: { 
        before: { role: existingUser.role, teamRole: null }, 
        after: { role: "TEAM_MEMBER", teamRole: role },
      },
    });

    // Criar notificação para admins
    await createNotification({
      userId: userIdAuth,
      title: "Novo Membro da Equipe! 👋",
      message: `${member.name} foi adicionado à equipe como ${role}.`,
      type: "success",
      category: "general",
      link: "/dashboard/equipe",
      metadata: {
        memberId: member.id,
        memberName: member.name,
        memberRole: role,
      },
    });

    return NextResponse.json({
      id: member.id,
      name: member.name,
      role: member.teamRole,
      email: member.email,
      phone: member.phone,
      status: member.status,
      skills: member.skills || [],
    }, { status: 201 });
  } catch (error) {
    console.error("Erro ao adicionar membro:", error);
    await createLog({
      type: "SYSTEM",
      category: "USER",
      level: "ERROR",
      action: "Erro ao adicionar membro",
      description: `Erro: ${error instanceof Error ? error.message : String(error)}`,
    });
    return NextResponse.json(
      { error: "Erro ao adicionar membro: " + (error as any).message },
      { status: 500 }
    );
  }
}

// PUT - Atualizar membro da equipe
export async function PUT(request: NextRequest) {
  try {
    const sessionData = await auth.api.getSession({ headers: request.headers });
    const body = await request.json();
    const { id, name, role, email, phone, status, skills } = body;

    if (!sessionData?.session) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }

    const userId = sessionData.session.userId;

    // Buscar membro atual para log
    const existingMember = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingMember) {
      return NextResponse.json(
        { error: "Membro não encontrado" },
        { status: 404 }
      );
    }

    const member = await prisma.user.update({
      where: { id },
      data: {
        name: name !== undefined ? name : existingMember.name,
        teamRole: role !== undefined ? role : existingMember.teamRole,
        email: email !== undefined ? email : existingMember.email,
        phone: phone !== undefined ? phone : existingMember.phone,
        status: status !== undefined ? status : existingMember.status,
        skills: skills !== undefined
          ? (skills && skills.length > 0 ? skills : null)
          : existingMember.skills,
      },
      select: {
        id: true,
        name: true,
        email: true,
        teamRole: true,
        phone: true,
        status: true,
        skills: true,
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
      description: `Dados do membro "${member.name}" atualizados`,
      metadata: {
        memberId: id,
        memberName: member.name,
        updatedFields: Object.keys(body).filter(key => key !== 'id'),
      },
      changes: {
        before: existingMember,
        after: member,
      },
    });

    return NextResponse.json({
      id: member.id,
      name: member.name,
      role: member.teamRole,
      email: member.email,
      phone: member.phone,
      status: member.status,
      skills: member.skills || [],
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

// DELETE - Excluir membro da equipe
export async function DELETE(request: NextRequest) {
  try {
    const sessionData = await auth.api.getSession({ headers: request.headers });
    const body = await request.json();
    const { id } = body;

    if (!sessionData?.session) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }

    const userId = sessionData.session.userId;

    // Buscar membro para log
    const existingMember = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingMember) {
      return NextResponse.json(
        { error: "Membro não encontrado" },
        { status: 404 }
      );
    }

    // Excluir membro
    await prisma.user.delete({
      where: { id },
    });

    // Criar log de exclusão
    await createLog({
      type: "DELETE",
      category: "USER",
      level: "WARNING",
      userId,
      entityId: id,
      entityType: "User",
      action: "Membro da equipe excluído",
      description: `Membro "${existingMember.name}" foi excluído da equipe`,
      metadata: {
        memberId: id,
        memberName: existingMember.name,
        memberRole: existingMember.teamRole,
        deletedBy: userId,
      },
      changes: { before: existingMember, after: null },
    });

    return NextResponse.json({
      success: true,
      message: "Membro excluído com sucesso",
    });
  } catch (error) {
    console.error("Erro ao excluir membro:", error);
    await createLog({
      type: "SYSTEM",
      category: "USER",
      level: "ERROR",
      action: "Erro ao excluir membro",
      description: `Erro: ${error instanceof Error ? error.message : String(error)}`,
    });
    return NextResponse.json(
      { error: "Erro ao excluir membro: " + (error as any).message },
      { status: 500 }
    );
  }
}
