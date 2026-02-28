import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// POST - Aceitar ou recusar orçamento
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const sessionData = await auth.api.getSession({ headers: request.headers });
    const { id } = await params;
    const body = await request.json();
    const { action, reason } = body; // action: 'accept' | 'decline'

    if (!sessionData?.session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const userId = sessionData.session.userId;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true, teamRole: true, name: true },
    });

    // Apenas ADMIN ou TEAM_MEMBER com cargo "Gerente de Projetos" podem aceitar/recusar
    if (
      user?.role !== "ADMIN" &&
      !(user?.role === "TEAM_MEMBER" && user?.teamRole === "Gerente de Projetos")
    ) {
      return NextResponse.json(
        { error: "Apenas ADMIN ou Gerente de Projetos podem aceitar/recusar orçamentos" },
        { status: 403 }
      );
    }

    const budget = await prisma.budget.findUnique({
      where: { id },
    });

    if (!budget) {
      return NextResponse.json({ error: "Orçamento não encontrado" }, { status: 404 });
    }

    if (budget.status !== "pending") {
      return NextResponse.json(
        { error: "Orçamento não está mais pendente" },
        { status: 400 }
      );
    }

    if (action === "accept") {
      // Aceitar orçamento
      const updated = await prisma.budget.update({
        where: { id },
        data: {
          acceptedBy: userId,
          acceptedAt: new Date(),
          // Limpar recusa anterior se houver
          declinedBy: null,
          declinedAt: null,
          declineReason: null,
        },
      });

      console.log("[DEBUG] Orçamento aceito:", {
        id,
        acceptedBy: updated.acceptedBy,
        acceptedAt: updated.acceptedAt,
      });

      // Criar notificação para o criador do orçamento
      await prisma.notification.create({
        data: {
          userId: budget.userId,
          title: "Orçamento Aceito! 🎉",
          message: `Seu orçamento foi aceito por ${user.name || "um membro da equipe"}.`,
          type: "success",
          category: "budget",
          link: `/dashboard/orcamentos/${id}`,
          metadata: {
            budgetId: id,
            action: "accepted",
            acceptedBy: userId,
          },
        },
      });

      return NextResponse.json({
        success: true,
        message: "Orçamento aceito com sucesso",
      });
    } else if (action === "decline") {
      // Recusar orçamento
      await prisma.budget.update({
        where: { id },
        data: {
          declinedBy: userId,
          declinedAt: new Date(),
          declineReason: reason || null,
          // Limpar aceite anterior se houver
          acceptedBy: null,
          acceptedAt: null,
        },
      });

      // Criar notificação para o criador do orçamento
      await prisma.notification.create({
        data: {
          userId: budget.userId,
          title: "Orçamento Recusado",
          message: `Seu orçamento foi recusado por ${user.name || "um membro da equipe"}.${reason ? ` Motivo: ${reason}` : ""}`,
          type: "warning",
          category: "budget",
          link: `/dashboard/orcamentos/${id}`,
          metadata: {
            budgetId: id,
            action: "declined",
            declinedBy: userId,
            reason,
          },
        },
      });

      return NextResponse.json({
        success: true,
        message: "Orçamento recusado",
      });
    } else {
      return NextResponse.json(
        { error: "Ação inválida" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Erro ao processar orçamento:", error);
    return NextResponse.json(
      { error: "Erro ao processar orçamento" },
      { status: 500 }
    );
  }
}
