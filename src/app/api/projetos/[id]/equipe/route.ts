import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// GET - Listar equipe do projeto
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const sessionData = await auth.api.getSession({ headers: request.headers });
    const { id } = await params;

    if (!sessionData?.session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: sessionData.session.userId },
      select: { role: true, teamRole: true },
    });

    // Apenas ADMIN ou TEAM_MEMBER podem visualizar
    if (user?.role !== "ADMIN" && user?.role !== "TEAM_MEMBER") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
    }

    const teamMembers = await prisma.projectTeamMember.findMany({
      where: { projectId: id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            teamRole: true,
            phone: true,
            avatar: true,
            status: true,
            skills: true,
          },
        },
      },
    });

    const team = teamMembers.map((member) => ({
      id: member.user.id,
      name: member.user.name,
      email: member.user.email,
      teamRole: member.user.teamRole,
      phone: member.user.phone,
      avatar: member.user.avatar,
      status: member.user.status,
      skills: member.user.skills,
      projectRole: member.role, // Função no projeto
    }));

    return NextResponse.json({ team });
  } catch (error) {
    console.error("Erro ao buscar equipe:", error);
    return NextResponse.json(
      { error: "Erro ao buscar equipe" },
      { status: 500 }
    );
  }
}

// POST - Adicionar membro à equipe
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const sessionData = await auth.api.getSession({ headers: request.headers });
    const { id } = await params;
    const body = await request.json();
    const { userId, projectRoles } = body; // Agora aceita array de roles

    if (!sessionData?.session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const currentUser = await prisma.user.findUnique({
      where: { id: sessionData.session.userId },
      select: { role: true, teamRole: true },
    });

    // Apenas ADMIN ou TEAM_MEMBER com cargo "Gerente de Projetos" podem adicionar
    if (
      currentUser?.role !== "ADMIN" &&
      !(currentUser?.role === "TEAM_MEMBER" && currentUser?.teamRole === "Gerente de Projetos")
    ) {
      return NextResponse.json(
        { error: "Apenas ADMIN ou Gerente de Projetos podem gerenciar equipe" },
        { status: 403 }
      );
    }

    if (!userId) {
      return NextResponse.json(
        { error: "userId é obrigatório" },
        { status: 400 }
      );
    }

    if (!projectRoles || !Array.isArray(projectRoles) || projectRoles.length === 0) {
      return NextResponse.json(
        { error: "Pelo menos uma área de atuação é obrigatória" },
        { status: 400 }
      );
    }

    // Verificar se usuário existe e é TEAM_MEMBER
    const userToAdd = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true, teamRole: true, name: true, email: true },
    });

    if (!userToAdd) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    if (userToAdd.role !== "TEAM_MEMBER") {
      return NextResponse.json(
        { error: "Apenas usuários TEAM_MEMBER podem ser adicionados à equipe" },
        { status: 400 }
      );
    }

    // Buscar projeto para obter informações
    const project = await prisma.project.findUnique({
      where: { id },
      select: { name: true, createdById: true },
    });

    if (!project) {
      return NextResponse.json({ error: "Projeto não encontrado" }, { status: 404 });
    }

    // Adicionar múltiplas áreas para o usuário
    const existingRoles = await prisma.projectTeamMember.findMany({
      where: { projectId: id, userId },
      select: { role: true },
    });

    const existingRoleSet = new Set(existingRoles.map(r => r.role));
    const newRoles = projectRoles.filter(r => !existingRoleSet.has(r));

    // Criar novas áreas
    if (newRoles.length > 0) {
      await prisma.projectTeamMember.createMany({
        data: newRoles.map(role => ({
          projectId: id,
          userId,
          role,
        })),
      });
    }

    // Criar notificação para o usuário
    await prisma.notification.create({
      data: {
        userId,
        title: "Você foi adicionado a um projeto! 🎉",
        message: `Você foi adicionado à equipe do projeto "${project.name}"${newRoles.length > 0 ? ` como ${newRoles.join(", ")}` : ""}.`,
        type: "info",
        category: "project",
        link: `/dashboard/projetos/${id}`,
        metadata: {
          projectId: id,
          projectName: project.name,
          roles: newRoles,
          addedBy: sessionData.session.userId,
        },
      },
    });

    const team = await prisma.projectTeamMember.findMany({
      where: { projectId: id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            teamRole: true,
            phone: true,
            avatar: true,
            status: true,
          },
        },
      },
    });

    // Agrupar roles por usuário
    const teamMap = new Map();
    team.forEach((member) => {
      if (!teamMap.has(member.user.id)) {
        teamMap.set(member.user.id, {
          id: member.user.id,
          name: member.user.name,
          email: member.user.email,
          teamRole: member.user.teamRole,
          phone: member.user.phone,
          avatar: member.user.avatar,
          status: member.user.status,
          projectRoles: [],
        });
      }
      teamMap.get(member.user.id).projectRoles.push(member.role);
    });

    const teamWithRoles = Array.from(teamMap.values());

    return NextResponse.json({
      success: true,
      message: `Membro adicionado com ${projectRoles.length} área(s) de atuação`,
      team: teamWithRoles,
    });
  } catch (error) {
    console.error("Erro ao adicionar membro:", error);
    return NextResponse.json(
      { error: "Erro ao adicionar membro" },
      { status: 500 }
    );
  }
}

// DELETE - Remover membro da equipe
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const sessionData = await auth.api.getSession({ headers: request.headers });
    const { id } = await params;
    const body = await request.json();
    const { userId } = body;

    if (!sessionData?.session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const currentUser = await prisma.user.findUnique({
      where: { id: sessionData.session.userId },
      select: { role: true, teamRole: true },
    });

    // Apenas ADMIN ou TEAM_MEMBER com cargo "Gerente de Projetos" podem remover
    if (
      currentUser?.role !== "ADMIN" &&
      !(currentUser?.role === "TEAM_MEMBER" && currentUser?.teamRole === "Gerente de Projetos")
    ) {
      return NextResponse.json(
        { error: "Apenas ADMIN ou Gerente de Projetos podem gerenciar equipe" },
        { status: 403 }
      );
    }

    if (!userId) {
      return NextResponse.json(
        { error: "userId é obrigatório" },
        { status: 400 }
      );
    }

    // Buscar usuário removido para notificação
    const userToRemove = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true },
    });

    if (!userToRemove) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    // Buscar projeto para obter informações
    const project = await prisma.project.findUnique({
      where: { id },
      select: { name: true },
    });

    if (!project) {
      return NextResponse.json({ error: "Projeto não encontrado" }, { status: 404 });
    }

    // Buscar todas as áreas do usuário no projeto antes de remover
    const userRoles = await prisma.projectTeamMember.findMany({
      where: { projectId: id, userId },
      select: { role: true },
    });

    const rolesList = userRoles.map(r => r.role);

    // Remover todas as áreas do usuário da equipe
    await prisma.projectTeamMember.deleteMany({
      where: {
        projectId: id,
        userId,
      },
    });

    // Criar notificação para o usuário removido
    await prisma.notification.create({
      data: {
        userId,
        title: "Você foi removido de um projeto",
        message: `Você foi removido da equipe do projeto "${project.name}"${rolesList.length > 0 ? ` (áreas: ${rolesList.join(", ")})` : ""}.`,
        type: "info",
        category: "project",
        link: `/dashboard/projetos/${id}`,
        metadata: {
          projectId: id,
          projectName: project.name,
          roles: rolesList,
          removedBy: sessionData.session.userId,
          action: "removed_from_project",
        },
      },
    });

    const team = await prisma.projectTeamMember.findMany({
      where: { projectId: id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            teamRole: true,
            phone: true,
            avatar: true,
            status: true,
          },
        },
      },
    });

    // Agrupar roles por usuário
    const teamMap = new Map();
    team.forEach((member) => {
      if (!teamMap.has(member.user.id)) {
        teamMap.set(member.user.id, {
          id: member.user.id,
          name: member.user.name,
          email: member.user.email,
          teamRole: member.user.teamRole,
          phone: member.user.phone,
          avatar: member.user.avatar,
          status: member.user.status,
          projectRoles: [],
        });
      }
      teamMap.get(member.user.id).projectRoles.push(member.role);
    });

    const teamWithRoles = Array.from(teamMap.values());

    return NextResponse.json({
      success: true,
      message: "Membro removido da equipe",
      team: teamWithRoles,
    });
  } catch (error) {
    console.error("Erro ao remover membro:", error);
    return NextResponse.json(
      { error: "Erro ao remover membro" },
      { status: 500 }
    );
  }
}
