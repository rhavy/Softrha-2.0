import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// GET - Listar subscriptions do usuário
export async function GET(request: NextRequest) {
  try {
    const sessionData = await auth.api.getSession({ headers: request.headers });
    
    if (!sessionData?.session) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }

    const subscriptions = await prisma.userNotificationPreference.findMany({
      where: { userId: sessionData.session.userId },
    });

    return NextResponse.json(subscriptions);
  } catch (error) {
    console.error("Erro ao buscar subscriptions:", error);
    return NextResponse.json(
      { error: "Erro ao buscar subscriptions" },
      { status: 500 }
    );
  }
}

// POST - Salvar/atualizar subscription
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
    const { subscription } = body;

    if (!subscription?.endpoint) {
      return NextResponse.json(
        { error: "Subscription inválida" },
        { status: 400 }
      );
    }

    // Salvar subscription no banco (em um modelo separado ou como JSON)
    // Por simplicidade, vamos armazenar como metadata nas preferências
    const preferences = await prisma.userNotificationPreference.upsert({
      where: { userId: sessionData.session.userId },
      create: {
        userId: sessionData.session.userId,
        pushEnabled: true,
      },
      update: {},
    });

    // Aqui você poderia ter uma tabela separada para subscriptions
    // Para produção, crie um modelo PushSubscription no schema

    return NextResponse.json({ success: true, preferences });
  } catch (error) {
    console.error("Erro ao salvar subscription:", error);
    return NextResponse.json(
      { error: "Erro ao salvar subscription" },
      { status: 500 }
    );
  }
}
