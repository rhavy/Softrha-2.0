import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// GET - Listar notificações do usuário
export async function GET(request: NextRequest) {
  try {
    const sessionData = await auth.api.getSession({ headers: request.headers });

    if (!sessionData?.session) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }

    const session = sessionData.session;

    const { searchParams } = new URL(request.url);
    const unreadOnly = searchParams.get("unread") === "true";
    const limit = parseInt(searchParams.get("limit") || "50");
    const category = searchParams.get("category");

    const notifications = await prisma.notification.findMany({
      where: {
        userId: session.userId,
        ...(unreadOnly && { read: false }),
        ...(category && { category }),
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return NextResponse.json(notifications);
  } catch (error) {
    console.error("Erro ao buscar notificações:", error);
    return NextResponse.json(
      { error: "Erro ao buscar notificações" },
      { status: 500 }
    );
  }
}

// POST - Criar nova notificação
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
    const { userId, title, message, type, category, link, metadata } = body;

    if (!title || !message) {
      return NextResponse.json(
        { error: "Título e mensagem são obrigatórios" },
        { status: 400 }
      );
    }

    const notification = await prisma.notification.create({
      data: {
        userId: userId || sessionData.session.userId,
        title,
        message,
        type: type || "info",
        category: category || "general",
        link: link || null,
        metadata: metadata || null,
      },
    });

    return NextResponse.json(notification, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar notificação:", error);
    return NextResponse.json(
      { error: "Erro ao criar notificação" },
      { status: 500 }
    );
  }
}
