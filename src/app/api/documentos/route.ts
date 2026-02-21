import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - Listar todos os documentos
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const folder = searchParams.get("folder");
    const search = searchParams.get("search");

    const where: any = {};

    if (folder && folder !== "Todos") {
      where.folder = folder;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { author: { contains: search, mode: "insensitive" } },
      ];
    }

    const documents = await prisma.document.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(documents);
  } catch (error) {
    console.error("Erro ao buscar documentos:", error);
    return NextResponse.json(
      { error: "Erro ao buscar documentos: " + (error as any).message },
      { status: 500 }
    );
  }
}

// POST - Criar novo documento
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, type, size, folder, author, url } = body;

    console.log("Dados recebidos:", body);

    // Validação básica
    if (!name || !type || !folder || !author) {
      return NextResponse.json(
        { error: "Nome, tipo, pasta e autor são obrigatórios" },
        { status: 400 }
      );
    }

    // Criar documento
    const document = await prisma.document.create({
      data: {
        name,
        type,
        size: size || "0 KB",
        folder,
        author,
        url: url || null,
      },
    });

    return NextResponse.json(document);
  } catch (error) {
    console.error("Erro ao criar documento:", error);
    return NextResponse.json(
      { error: "Erro ao criar documento: " + (error as any).message },
      { status: 500 }
    );
  }
}
