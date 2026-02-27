import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// GET - Listar usuários disponíveis para serem membros da equipe
export async function GET(request: NextRequest) {
  try {
    const sessionData = await auth.api.getSession({ headers: request.headers });

    if (!sessionData?.session) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");

    // Buscar usuários que NÃO são ADMIN e NÃO são TEAM_MEMBER
    const where: any = {
      role: {
        not: "ADMIN",
      },
    };

    // Se quiser buscar apenas usuários sem teamRole definido (ainda não são da equipe)
    where.teamRole = null;

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error("Erro ao buscar usuários disponíveis:", error);
    return NextResponse.json(
      { error: "Erro ao buscar usuários disponíveis" },
      { status: 500 }
    );
  }
}
