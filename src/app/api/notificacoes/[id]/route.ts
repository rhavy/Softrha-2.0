import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// PATCH - Marcar notificação como lida
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const sessionData = await auth.api.getSession({ headers: request.headers });

    if (!sessionData?.session) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const userId = sessionData.session.userId;

    // Verificar se a notificação pertence ao usuário
    const notification = await prisma.notification.findUnique({
      where: { id },
    });

    if (!notification) {
      return NextResponse.json(
        { error: "Notificação não encontrada" },
        { status: 404 }
      );
    }

    if (notification.userId !== userId) {
      return NextResponse.json(
        { error: "Não autorizado a modificar esta notificação" },
        { status: 403 }
      );
    }

    await prisma.notification.update({
      where: { id },
      data: { read: true },
    });

    return NextResponse.json({
      success: true,
      message: "Notificação marcada como lida",
    });
  } catch (error) {
    console.error("Erro ao marcar notificação como lida:", error);
    return NextResponse.json(
      { error: "Erro ao marcar notificação como lida" },
      { status: 500 }
    );
  }
}

// DELETE - Excluir notificação
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const sessionData = await auth.api.getSession({ headers: request.headers });

    if (!sessionData?.session) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const userId = sessionData.session.userId;

    // Verificar se a notificação pertence ao usuário
    const notification = await prisma.notification.findUnique({
      where: { id },
    });

    if (!notification) {
      return NextResponse.json(
        { error: "Notificação não encontrada" },
        { status: 404 }
      );
    }

    if (notification.userId !== userId) {
      return NextResponse.json(
        { error: "Não autorizado a excluir esta notificação" },
        { status: 403 }
      );
    }

    await prisma.notification.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Notificação excluída",
    });
  } catch (error) {
    console.error("Erro ao excluir notificação:", error);
    return NextResponse.json(
      { error: "Erro ao excluir notificação" },
      { status: 500 }
    );
  }
}
