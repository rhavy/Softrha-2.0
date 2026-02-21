import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// PUT - Marcar notificação como lida
export async function PUT(request: NextRequest) {
  try {
    const sessionData = await auth.api.getSession({ headers: request.headers });
    
    if (!sessionData?.session) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }

    const session = sessionData.session;
    const body = await request.json();
    const { notificationId, markAllAsRead } = body;

    if (markAllAsRead) {
      // Marcar todas como lidas
      await prisma.notification.updateMany({
        where: {
          userId: session.userId,
          read: false,
        },
        data: {
          read: true,
        },
      });

      return NextResponse.json({ success: true, message: "Todas as notificações marcadas como lidas" });
    }

    if (!notificationId) {
      return NextResponse.json(
        { error: "ID da notificação necessário" },
        { status: 400 }
      );
    }

    // Marcar notificação específica como lida
    const notification = await prisma.notification.update({
      where: {
        id: notificationId,
        userId: session.userId, // Garante que pertence ao usuário
      },
      data: {
        read: true,
      },
    });

    return NextResponse.json(notification);
  } catch (error) {
    console.error("Erro ao marcar notificação como lida:", error);
    return NextResponse.json(
      { error: "Erro ao marcar notificação como lida" },
      { status: 500 }
    );
  }
}

// DELETE - Remover notificação
export async function DELETE(request: NextRequest) {
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
    const notificationId = searchParams.get("id");

    if (!notificationId) {
      return NextResponse.json(
        { error: "ID da notificação necessário" },
        { status: 400 }
      );
    }

    await prisma.notification.delete({
      where: {
        id: notificationId,
        userId: session.userId, // Garante que pertence ao usuário
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao remover notificação:", error);
    return NextResponse.json(
      { error: "Erro ao remover notificação" },
      { status: 500 }
    );
  }
}
