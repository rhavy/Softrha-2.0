import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { createLog } from "@/lib/create-log";
import { createNotificationForAdmins } from "@/lib/create-notification";

// GET - Listar todos os orçamentos
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
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    const where: any = {};

    if (status && status !== "todos") {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { clientName: { contains: search, mode: "insensitive" } },
        { clientEmail: { contains: search, mode: "insensitive" } },
        { company: { contains: search, mode: "insensitive" } },
      ];
    }

    const budgets = await prisma.budget.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    // Criar log de visualização
    await createLog({
      type: "VIEW",
      category: "BUDGET",
      level: "INFO",
      userId: sessionData.session.userId,
      action: "Listar orçamentos",
      description: `Usuário visualizou a lista de orçamentos${search ? ` (busca: ${search})` : ""}`,
      metadata: { filters: { status, search }, totalBudgets: budgets.length },
    });

    return NextResponse.json(budgets);
  } catch (error) {
    console.error("Erro ao buscar orçamentos:", error);
    await createLog({
      type: "SYSTEM",
      category: "BUDGET",
      level: "ERROR",
      action: "Erro ao listar orçamentos",
      description: `Erro: ${error instanceof Error ? error.message : String(error)}`,
    });
    return NextResponse.json(
      { error: "Erro ao buscar orçamentos" },
      { status: 500 }
    );
  }
}

// PUT - Atualizar status do orçamento
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
    const { budgetId, status } = body;

    if (!budgetId || !status) {
      return NextResponse.json(
        { error: "ID e status são obrigatórios" },
        { status: 400 }
      );
    }

    const userId = sessionData.session.userId;

    // Buscar orçamento atual para log
    const existingBudget = await prisma.budget.findUnique({
      where: { id: budgetId },
    });

    if (!existingBudget) {
      return NextResponse.json(
        { error: "Orçamento não encontrado" },
        { status: 404 }
      );
    }

    const updatedBudget = await prisma.budget.update({
      where: { id: budgetId },
      data: { status },
    });

    // Criar log de atualização
    await createLog({
      type: "UPDATE",
      category: "BUDGET",
      level: "INFO",
      userId,
      entityId: budgetId,
      entityType: "Budget",
      action: "Status do orçamento atualizado",
      description: `Status do orçamento de ${existingBudget.clientName} alterado de "${existingBudget.status}" para "${status}"`,
      metadata: {
        budgetId,
        clientName: existingBudget.clientName,
        oldStatus: existingBudget.status,
        newStatus: status,
      },
      changes: {
        before: { status: existingBudget.status },
        after: { status },
      },
    });

    return NextResponse.json(updatedBudget);
  } catch (error) {
    console.error("Erro ao atualizar orçamento:", error);
    await createLog({
      type: "SYSTEM",
      category: "BUDGET",
      level: "ERROR",
      action: "Erro ao atualizar orçamento",
      description: `Erro: ${error instanceof Error ? error.message : String(error)}`,
    });
    return NextResponse.json(
      { error: "Erro ao atualizar orçamento" },
      { status: 500 }
    );
  }
}

// POST - Criar novo orçamento
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

    const budget = await prisma.budget.create({
      data: {
        ...body,
        userId,
      },
    });

    // Criar log de criação
    await createLog({
      type: "CREATE",
      category: "BUDGET",
      level: "SUCCESS",
      userId,
      entityId: budget.id,
      entityType: "Budget",
      action: "Orçamento criado",
      description: `Novo orçamento criado para ${body.clientName} - ${body.projectType}`,
      metadata: {
        budgetId: budget.id,
        clientName: body.clientName,
        projectType: body.projectType,
        finalValue: body.finalValue,
      },
      changes: { before: null, after: budget },
    });

    // Criar notificação para admins
    await createNotificationForAdmins({
      title: "Novo Orçamento Criado! 📋",
      message: `Um novo orçamento foi criado para ${body.clientName} (${body.projectType}).`,
      type: "success",
      category: "budget",
      link: `/dashboard/orcamentos/${budget.id}`,
      metadata: {
        budgetId: budget.id,
        clientName: body.clientName,
        projectType: body.projectType,
      },
    });

    return NextResponse.json(budget, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar orçamento:", error);
    await createLog({
      type: "SYSTEM",
      category: "BUDGET",
      level: "ERROR",
      action: "Erro ao criar orçamento",
      description: `Erro: ${error instanceof Error ? error.message : String(error)}`,
    });
    return NextResponse.json(
      { error: "Erro ao criar orçamento" },
      { status: 500 }
    );
  }
}

// DELETE - Excluir orçamento
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
    const { budgetId } = body;
    const userId = sessionData.session.userId;

    // Buscar orçamento para log
    const existingBudget = await prisma.budget.findUnique({
      where: { id: budgetId },
    });

    if (!existingBudget) {
      return NextResponse.json(
        { error: "Orçamento não encontrado" },
        { status: 404 }
      );
    }

    // Excluir orçamento
    await prisma.budget.delete({
      where: { id: budgetId },
    });

    // Criar log de exclusão
    await createLog({
      type: "DELETE",
      category: "BUDGET",
      level: "WARNING",
      userId,
      entityId: budgetId,
      entityType: "Budget",
      action: "Orçamento excluído",
      description: `Orçamento de ${existingBudget.clientName} foi excluído`,
      metadata: {
        budgetId,
        clientName: existingBudget.clientName,
        projectType: existingBudget.projectType,
        deletedBy: userId,
      },
      changes: { before: existingBudget, after: null },
    });

    // Criar notificação para admins
    await createNotificationForAdmins({
      title: "Orçamento Excluído 🗑️",
      message: `O orçamento de ${existingBudget.clientName} foi excluído do sistema.`,
      type: "warning",
      category: "budget",
      metadata: {
        budgetId,
        clientName: existingBudget.clientName,
        deletedAt: new Date().toISOString(),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Orçamento excluído com sucesso",
    });
  } catch (error) {
    console.error("Erro ao excluir orçamento:", error);
    await createLog({
      type: "SYSTEM",
      category: "BUDGET",
      level: "ERROR",
      action: "Erro ao excluir orçamento",
      description: `Erro: ${error instanceof Error ? error.message : String(error)}`,
    });
    return NextResponse.json(
      { error: "Erro ao excluir orçamento" },
      { status: 500 }
    );
  }
}
