import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// GET - Buscar estatísticas do dashboard
export async function GET(request: NextRequest) {
  try {
    const sessionData = await auth.api.getSession({ headers: request.headers });

    if (!sessionData?.session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Buscar projetos
    const projects = await prisma.project.findMany({
      select: {
        id: true,
        name: true,
        status: true,
        clientName: true,
        budget: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    // Buscar orçamentos
    const budgets = await prisma.budget.findMany({
      select: {
        id: true,
        status: true,
        finalValue: true,
        createdAt: true,
      },
    });

    // Buscar clientes
    const clients = await prisma.client.findMany({
      select: {
        id: true,
        status: true,
      },
    });

    // Buscar equipe
    const teamMembers = await prisma.user.findMany({
      where: { role: "TEAM_MEMBER" },
      include: {
        receivedEvaluations: {
          select: { rating: true },
        },
      },
    });

    // Calcular stats de projetos
    const projectStats = {
      total: projects.length,
      active: projects.filter((p) =>
        ["planning", "development", "development_20", "development_50", "development_70", "development_100", "review"].includes(p.status)
      ).length,
      completed: projects.filter((p) => p.status === "completed").length,
      pending: projects.filter((p) => p.status === "waiting_payment").length,
    };

    // Calcular stats de orçamentos
    const acceptedBudgets = budgets.filter((b) => b.status === "accepted" || b.status === "completed");
    const budgetStats = {
      total: budgets.length,
      accepted: acceptedBudgets.length,
      pending: budgets.filter((b) => b.status === "pending").length,
      rejected: budgets.filter((b) => b.status === "rejected").length,
      totalValue: acceptedBudgets.reduce((sum, b) => sum + (b.finalValue || 0), 0),
      avgTicket: acceptedBudgets.length > 0
        ? acceptedBudgets.reduce((sum, b) => sum + (b.finalValue || 0), 0) / acceptedBudgets.length
        : 0,
    };

    // Calcular stats de clientes
    const clientStats = {
      total: clients.length,
      active: clients.filter((c) => c.status === "active").length,
    };

    // Calcular stats de equipe
    const teamStats = {
      total: teamMembers.length,
      active: teamMembers.filter((m) => m.status === "active").length,
      avgRating: teamMembers.length > 0
        ? Math.round(
            (teamMembers.reduce((sum, m) => {
              const avg = m.receivedEvaluations.length > 0
                ? m.receivedEvaluations.reduce((s, e) => s + e.rating, 0) / m.receivedEvaluations.length
                : 0;
              return sum + avg;
            }, 0) / teamMembers.length) * 10
          ) / 10
        : 0,
    };

    // Dados mensais (últimos 6 meses)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyData = Array.from({ length: 6 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - 5 - i);
      const month = date.toLocaleString("pt-BR", { month: "short" });
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);

      const monthProjects = projects.filter(
        (p) => p.createdAt >= monthStart && p.createdAt <= monthEnd
      );
      const monthValue = monthProjects.reduce((sum, p) => sum + (p.budget || 0), 0);

      return {
        month,
        projects: monthProjects.length,
        value: Math.round(monthValue / 1000), // Em milhares
      };
    }).reverse();

    // Dados de status para gráfico de pizza
    const statusCounts: Record<string, number> = {};
    projects.forEach((p) => {
      const statusLabel = p.status.replace("_", " ");
      statusCounts[statusLabel] = (statusCounts[statusLabel] || 0) + 1;
    });

    const statusColors: Record<string, string> = {
      planning: "#0088FE",
      development: "#8884D8",
      review: "#FFBB28",
      completed: "#00C49F",
      waiting_payment: "#FF8042",
    };

    const statusData = Object.entries(statusCounts).map(([name, value]) => ({
      name,
      value,
      color: statusColors[name] || "#8884d8",
    }));

    // Projetos recentes
    const recentProjects = projects.slice(0, 5).map((p) => ({
      id: p.id,
      name: p.name,
      clientName: p.clientName,
      status: p.status,
      budget: p.budget,
    }));

    return NextResponse.json({
      projects: projectStats,
      budgets: budgetStats,
      clients: clientStats,
      team: teamStats,
      monthlyData,
      statusData,
      recentProjects,
    });
  } catch (error) {
    console.error("Erro ao buscar stats do dashboard:", error);
    return NextResponse.json(
      { error: "Erro ao buscar estatísticas" },
      { status: 500 }
    );
  }
}
