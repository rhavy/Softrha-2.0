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

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const status = searchParams.get("status");

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { emails: { contains: search, mode: "insensitive" } },
        { document: { contains: search, mode: "insensitive" } },
      ];
    }

    if (status && status !== "todos") {
      where.status = status;
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
      metadata: { filters: { search, status }, totalClients: clients.length },
    });

    return NextResponse.json(clients);
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

    const client = await prisma.client.create({
      data: {
        ...body,
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

// DELETE - Excluir cliente
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
    const { id } = body;
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

    // Excluir cliente
    await prisma.client.delete({
      where: { id },
    });

    // Criar log de exclusão
    await createLog({
      type: "DELETE",
      category: "CLIENT",
      level: "WARNING",
      userId,
      entityId: id,
      entityType: "Client",
      action: "Cliente excluído",
      description: `Cliente "${existingClient.name}" foi excluído`,
      metadata: {
        clientId: id,
        clientName: existingClient.name,
        document: existingClient.document,
        deletedBy: userId,
      },
      changes: { before: existingClient, after: null },
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
