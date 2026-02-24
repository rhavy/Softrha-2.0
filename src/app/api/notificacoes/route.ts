import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// GET - Listar notificações do usuário
export async function GET(request: NextRequest) {
  try {
    console.log('[NOTIFICAÇÕES API] 🔍 Iniciando GET /api/notificacoes');
    
    const sessionData = await auth.api.getSession({ headers: request.headers });
    console.log('[NOTIFICAÇÕES API] 📋 Session data:', sessionData ? 'presente' : 'ausente');

    if (!sessionData?.session) {
      console.log('[NOTIFICAÇÕES API] ❌ Usuário não autenticado');
      return NextResponse.json(
        { error: "Não autorizado", details: "Session not found" },
        { status: 401 }
      );
    }

    const session = sessionData.session;
    console.log('[NOTIFICAÇÕES API] ✅ Usuário autenticado:', session.userId);
    
    const { searchParams } = new URL(request.url);
    const unreadOnly = searchParams.get("unread") === "true";
    const limit = parseInt(searchParams.get("limit") || "20");
    const category = searchParams.get("category");

    console.log('[NOTIFICAÇÕES API] 📊 Parâmetros:', { unreadOnly, limit, category });

    const notifications = await prisma.notification.findMany({
      where: {
        userId: session.userId,
        ...(unreadOnly && { read: false }),
        ...(category && { category }),
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    const unreadCount = await prisma.notification.count({
      where: {
        userId: session.userId,
        read: false,
      },
    });

    console.log('[NOTIFICAÇÕES API] 📬 Notificações encontradas:', notifications.length);

    return NextResponse.json({
      notifications,
      unreadCount,
    });
  } catch (error) {
    console.error("[NOTIFICAÇÕES API] ❌ Erro ao buscar notificações:", error);
    return NextResponse.json(
      { error: "Erro ao buscar notificações", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

// POST - Criar nova notificação
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, title, message, type, category, link, metadata } = body;

    if (!userId || !title || !message) {
      return NextResponse.json(
        { error: "Campos obrigatórios faltando" },
        { status: 400 }
      );
    }

    const notification = await prisma.notification.create({
      data: {
        userId,
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
