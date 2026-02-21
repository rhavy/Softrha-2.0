import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { getUserNotificationPreferences, updateUserNotificationPreferences } from "@/lib/notifications";

// GET - Obter preferências do usuário
export async function GET(request: NextRequest) {
  try {
    const sessionData = await auth.api.getSession({ headers: request.headers });
    
    if (!sessionData?.session) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }

    const preferences = await getUserNotificationPreferences(sessionData.session.userId);
    return NextResponse.json(preferences);
  } catch (error) {
    console.error("Erro ao buscar preferências:", error);
    return NextResponse.json(
      { error: "Erro ao buscar preferências" },
      { status: 500 }
    );
  }
}

// PUT - Atualizar preferências do usuário
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
    const preferences = await updateUserNotificationPreferences(
      sessionData.session.userId,
      body
    );

    return NextResponse.json(preferences);
  } catch (error) {
    console.error("Erro ao atualizar preferências:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar preferências" },
      { status: 500 }
    );
  }
}
