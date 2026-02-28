import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { createLog } from "@/lib/create-log";
import { createNotificationForAdmins } from "@/lib/create-notification";

// GET - Listar todos os clientes
export async function GET(request: NextRequest) {
  try {
    const sessionData = await auth.api.getSession({ headers: request.headers });

    if (!sessionData?.session) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: sessionData.session.userId },
      select: { role: true },
    });

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const status = searchParams.get("status");
    const includeDeleted = searchParams.get("includeDeleted") === "true";

    const where: any = {};

    // Se não for ADMIN, não mostrar clientes excluídos
    if (user?.role !== "ADMIN" && !includeDeleted) {
      where.status = { not: "deleted" };
    } else if (status && status !== "todos") {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { emails: { contains: search, mode: "insensitive" } },
        { document: { contains: search, mode: "insensitive" } },
      ];
    }

    const clients = await prisma.client.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        projects: {
          select: {
            id: true,
            name: true,
            status: true,
          },
        },
      },
    });

    // Criar log de visualização
    await createLog({
      type: "VIEW",
      category: "CLIENT",
      level: "INFO",
      userId: sessionData.session.userId,
      action: "Listar clientes",
      description: `Usuário visualizou a lista de clientes${search ? ` (busca: ${search})` : ""}`,
      metadata: { filters: { search, status, includeDeleted }, totalClients: clients.length, userRole: user?.role },
    });

    // Parse dos campos JSON
    const parsedClients = clients.map((client) => ({
      ...client,
      emails: client.emails ? JSON.parse(client.emails) : [],
      phones: client.phones ? JSON.parse(client.phones) : [],
      projectsCount: client.projects.length,
    }));

    return NextResponse.json(parsedClients);
  } catch (error) {
    console.error("Erro ao buscar clientes:", error);
    await createLog({
      type: "SYSTEM",
      category: "CLIENT",
      level: "ERROR",
      action: "Erro ao listar clientes",
      description: `Erro: ${error instanceof Error ? error.message : String(error)}`,
    });
    return NextResponse.json(
      { error: "Erro ao buscar clientes" },
      { status: 500 }
    );
  }
}

// POST - Criar novo cliente
export async function POST(request: NextRequest) {
  try {
    const sessionData = await auth.api.getSession({ headers: request.headers });

    if (!sessionData?.session) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const userId = sessionData.session.userId;

    // Converter arrays para string JSON
    const dataToSave = {
      ...body,
      emails: body.emails ? JSON.stringify(body.emails) : null,
      phones: body.phones ? JSON.stringify(body.phones) : null,
    };

    const client = await prisma.client.create({
      data: {
        ...dataToSave,
      },
    });

    // Criar log de criação
    await createLog({
      type: "CREATE",
      category: "CLIENT",
      level: "SUCCESS",
      userId,
      entityId: client.id,
      entityType: "Client",
      action: "Cliente criado",
      description: `Novo cliente "${client.name}" cadastrado no sistema`,
      metadata: {
        clientId: client.id,
        clientName: client.name,
        document: client.document,
        emails: client.emails,
        phones: client.phones,
      },
      changes: { before: null, after: client },
    });

    // Criar notificação para admins
    await createNotificationForAdmins({
      title: "Novo Cliente Cadastrado! 👤",
      message: `O cliente "${client.name}" foi cadastrado no sistema.`,
      type: "success",
      category: "client",
      link: `/dashboard/clientes/${client.id}`,
      metadata: {
        clientId: client.id,
        clientName: client.name,
      },
    });

    return NextResponse.json(client, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar cliente:", error);
    await createLog({
      type: "SYSTEM",
      category: "CLIENT",
      level: "ERROR",
      action: "Erro ao criar cliente",
      description: `Erro: ${error instanceof Error ? error.message : String(error)}`,
    });
    return NextResponse.json(
      { error: "Erro ao criar cliente" },
      { status: 500 }
    );
  }
}

// PUT - Atualizar cliente
export async function PUT(request: NextRequest) {
  try {
    const sessionData = await auth.api.getSession({ headers: request.headers });

    if (!sessionData?.session) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { id, ...updateData } = body;
    const userId = sessionData.session.userId;

    // Buscar cliente atual para log
    const existingClient = await prisma.client.findUnique({
      where: { id },
    });

    if (!existingClient) {
      return NextResponse.json(
        { error: "Cliente não encontrado" },
        { status: 404 }
      );
    }

    const client = await prisma.client.update({
      where: { id },
      data: updateData,
    });

    // Criar log de atualização
    await createLog({
      type: "UPDATE",
      category: "CLIENT",
      level: "INFO",
      userId,
      entityId: client.id,
      entityType: "Client",
      action: "Cliente atualizado",
      description: `Dados do cliente "${client.name}" atualizados`,
      metadata: {
        clientId: client.id,
        clientName: client.name,
        updatedFields: Object.keys(updateData),
      },
      changes: {
        before: existingClient,
        after: client,
      },
    });

    return NextResponse.json(client);
  } catch (error) {
    console.error("Erro ao atualizar cliente:", error);
    await createLog({
      type: "SYSTEM",
      category: "CLIENT",
      level: "ERROR",
      action: "Erro ao atualizar cliente",
      description: `Erro: ${error instanceof Error ? error.message : String(error)}`,
    });
    return NextResponse.json(
      { error: "Erro ao atualizar cliente" },
      { status: 500 }
    );
  }
}

// DELETE - Soft delete (mudar status para 'deleted')
export async function DELETE(request: NextRequest) {
  try {
    const sessionData = await auth.api.getSession({ headers: request.headers });

    if (!sessionData?.session) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { id, reason } = body; // Motivo da exclusão
    const userId = sessionData.session.userId;

    // Buscar cliente para log
    const existingClient = await prisma.client.findUnique({
      where: { id },
      include: {
        projects: true,
      },
    });

    if (!existingClient) {
      return NextResponse.json(
        { error: "Cliente não encontrado" },
        { status: 404 }
      );
    }

    // Verificar se tem projetos vinculados
    if (existingClient.projects.length > 0) {
      return NextResponse.json(
        { error: "Não é possível excluir cliente com projetos vinculados", projects: existingClient.projects },
        { status: 400 }
      );
    }

    // Soft delete - apenas mudar status e adicionar dados de exclusão
    await prisma.client.update({
      where: { id },
      data: {
        status: "deleted",
        deletedAt: new Date(),
        deletedBy: userId,
        deletionReason: reason || null,
      },
    });

    // Criar log de exclusão
    await createLog({
      type: "DELETE",
      category: "CLIENT",
      level: "WARNING",
      userId,
      entityId: id,
      entityType: "Client",
      action: "Cliente excluído (soft delete)",
      description: `Cliente "${existingClient.name}" foi marcado como excluído. Motivo: ${reason || "Não informado"}`,
      metadata: {
        clientId: id,
        clientName: existingClient.name,
        document: existingClient.document,
        deletedBy: userId,
        reason: reason || "Não informado",
        deletedAt: new Date().toISOString(),
      },
      changes: { 
        before: { status: existingClient.status }, 
        after: { status: "deleted", deletedAt: new Date().toISOString() },
      },
    });

    // Criar notificação para admins
    await createNotificationForAdmins({
      title: "Cliente Excluído 🗑️",
      message: `O cliente "${existingClient.name}" foi excluído do sistema.`,
      type: "warning",
      category: "client",
      metadata: {
        clientId: id,
        clientName: existingClient.name,
        deletedAt: new Date().toISOString(),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Cliente excluído com sucesso",
    });
  } catch (error) {
    console.error("Erro ao excluir cliente:", error);
    await createLog({
      type: "SYSTEM",
      category: "CLIENT",
      level: "ERROR",
      action: "Erro ao excluir cliente",
      description: `Erro: ${error instanceof Error ? error.message : String(error)}`,
    });
    return NextResponse.json(
      { error: "Erro ao excluir cliente" },
      { status: 500 }
    );
  }
}
