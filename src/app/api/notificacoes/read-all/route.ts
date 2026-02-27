import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// PATCH - Marcar todas as notificações como lidas
export async function PATCH(request: NextRequest) {
  try {
    const sessionData = await auth.api.getSession({ headers: request.headers });

    if (!sessionData?.session) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }

    const userId = sessionData.session.userId;

    await prisma.notification.updateMany({
      where: {
        userId,
        read: false,
      },
      data: {
        read: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Todas as notificações marcadas como lidas",
    });
  } catch (error) {
    console.error("Erro ao marcar todas notificações como lidas:", error);
    return NextResponse.json(
      { error: "Erro ao marcar notificações como lidas" },
      { status: 500 }
    );
  }
}
