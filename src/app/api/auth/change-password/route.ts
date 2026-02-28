import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const sessionData = await auth.api.getSession({ headers: request.headers });

    if (!sessionData?.session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: "Senha atual e nova senha são obrigatórias" },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: "A nova senha deve ter pelo menos 6 caracteres" },
        { status: 400 }
      );
    }

    // Buscar usuário
    const user = await prisma.user.findUnique({
      where: { id: sessionData.session.userId },
      select: { password: true },
    });

    if (!user?.password) {
      return NextResponse.json(
        { error: "Senha atual não encontrada" },
        { status: 400 }
      );
    }

    // Verificar senha atual (usando bcrypt se disponível, ou comparação simples)
    const bcrypt = await import("bcryptjs").catch(() => null);
    
    let passwordValid = false;
    if (bcrypt) {
      passwordValid = await bcrypt.compare(currentPassword, user.password);
    } else {
      // Fallback para comparação simples se bcrypt não estiver disponível
      passwordValid = currentPassword === user.password;
    }

    if (!passwordValid) {
      return NextResponse.json(
        { error: "Senha atual incorreta" },
        { status: 400 }
      );
    }

    // Hash da nova senha
    const hashedPassword = bcrypt 
      ? await bcrypt.hash(newPassword, 10)
      : newPassword;

    // Atualizar senha
    await prisma.user.update({
      where: { id: sessionData.session.userId },
      data: { password: hashedPassword },
    });

    return NextResponse.json({ success: true, message: "Senha atualizada com sucesso" });
  } catch (error) {
    console.error("Erro ao alterar senha:", error);
    return NextResponse.json(
      { error: "Erro ao alterar senha" },
      { status: 500 }
    );
  }
}
