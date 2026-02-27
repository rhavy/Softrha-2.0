import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const birthDate = formData.get("birthDate") as string;
    const phone = formData.get("phone") as string;
    const sex = formData.get("sex") as string;
    const avatar = formData.get("avatar") as File | null;

    // Validações
    if (!name || name.trim().length < 3) {
      return NextResponse.json(
        { error: "Nome deve ter pelo menos 3 caracteres" },
        { status: 400 }
      );
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Email inválido" },
        { status: 400 }
      );
    }

    if (!password || password.length < 6) {
      return NextResponse.json(
        { error: "Senha deve ter pelo menos 6 caracteres" },
        { status: 400 }
      );
    }

    if (!birthDate) {
      return NextResponse.json(
        { error: "Data de nascimento é obrigatória" },
        { status: 400 }
      );
    }

    // Validar idade (13-120 anos)
    const birthDateObj = new Date(birthDate);
    const today = new Date();
    const age = today.getFullYear() - birthDateObj.getFullYear();
    
    if (age < 13 || age > 120) {
      return NextResponse.json(
        { error: "Idade deve ser entre 13 e 120 anos" },
        { status: 400 }
      );
    }

    if (!sex) {
      return NextResponse.json(
        { error: "Sexo é obrigatório" },
        { status: 400 }
      );
    }

    // Verificar se email já existe
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email já cadastrado" },
        { status: 400 }
      );
    }

    // Processar avatar se enviado
    let avatarUrl: string | null = null;
    
    if (avatar && avatar.size > 0) {
      // Validar tipo de arquivo
      if (!avatar.type.startsWith("image/")) {
        return NextResponse.json(
          { error: "O avatar deve ser uma imagem" },
          { status: 400 }
        );
      }

      // Validar tamanho (5MB)
      if (avatar.size > 5 * 1024 * 1024) {
        return NextResponse.json(
          { error: "O avatar deve ter no máximo 5MB" },
          { status: 400 }
        );
      }

      // Criar pasta de avatars se não existir
      const publicDir = join(process.cwd(), "public");
      const avatarsDir = join(publicDir, "avatars");
      
      if (!existsSync(avatarsDir)) {
        await mkdir(avatarsDir, { recursive: true });
      }

      // Gerar nome único para o arquivo
      const fileExtension = avatar.name.split(".").pop() || "jpg";
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExtension}`;
      const filePath = join(avatarsDir, fileName);

      // Salvar arquivo
      const bytes = await avatar.arrayBuffer();
      const buffer = Buffer.from(bytes);
      await writeFile(filePath, buffer);

      // URL relativa para salvar no banco
      avatarUrl = `/avatars/${fileName}`;
    }

    // Criar usuário usando a API do Better Auth
    // O Better Auth vai fazer o hash da senha automaticamente
    const authResult = await auth.api.signUpEmail({
      body: {
        email,
        password,
        name,
      },
    });

    if (!authResult.user) {
      throw new Error("Erro ao criar usuário");
    }

    // Atualizar usuário com campos adicionais
    const user = await prisma.user.update({
      where: { id: authResult.user.id },
      data: {
        birthDate: birthDateObj,
        phone: phone || null,
        sex,
        avatar: avatarUrl,
        role: "USER",
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Conta criada com sucesso",
      user,
    }, { status: 201 });

  } catch (error: any) {
    console.error("Erro ao criar conta:", error);
    return NextResponse.json(
      { error: error.message || "Erro ao criar conta" },
      { status: 500 }
    );
  }
}
