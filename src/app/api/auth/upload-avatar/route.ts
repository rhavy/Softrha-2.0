import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const sessionData = await auth.api.getSession({ headers: request.headers });

    if (!sessionData?.session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("avatar") as File;

    if (!file) {
      return NextResponse.json({ error: "Nenhum arquivo enviado" }, { status: 400 });
    }

    // Validar tipo de arquivo
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "O arquivo deve ser uma imagem" }, { status: 400 });
    }

    // Validar tamanho (5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "O arquivo deve ter no máximo 5MB" }, { status: 400 });
    }

    // Converter para base64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString("base64");
    const avatarUrl = `data:${file.type};base64,${base64}`;

    // Atualizar usuário no banco
    await prisma.user.update({
      where: { id: sessionData.session.userId },
      data: { image: avatarUrl },
    });

    return NextResponse.json({ success: true, avatarUrl });
  } catch (error) {
    console.error("Erro ao upload avatar:", error);
    return NextResponse.json(
      { error: "Erro ao fazer upload do avatar" },
      { status: 500 }
    );
  }
}
