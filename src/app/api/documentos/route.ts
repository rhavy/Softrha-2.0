import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { createLog } from "@/lib/create-log";

// GET - Listar todos os documentos
export async function GET(request: NextRequest) {
  try {
    const sessionData = await auth.api.getSession({ headers: request.headers });

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

    // Criar log de visualização
    if (sessionData?.session) {
      await createLog({
        type: "VIEW",
        category: "SYSTEM",
        level: "INFO",
        userId: sessionData.session.userId,
        action: "Listar documentos",
        description: `Usuário visualizou a lista de documentos${search ? ` (busca: ${search})` : ""}`,
        metadata: { filters: { folder, search }, totalDocuments: documents.length },
      });
    }

    return NextResponse.json(documents);
  } catch (error) {
    console.error("Erro ao buscar documentos:", error);
    await createLog({
      type: "SYSTEM",
      category: "SYSTEM",
      level: "ERROR",
      action: "Erro ao listar documentos",
      description: `Erro: ${error instanceof Error ? error.message : String(error)}`,
    });
    return NextResponse.json(
      { error: "Erro ao buscar documentos: " + (error as any).message },
      { status: 500 }
    );
  }
}

// POST - Criar novo documento
export async function POST(request: NextRequest) {
  try {
    const sessionData = await auth.api.getSession({ headers: request.headers });
    const body = await request.json();
    const { name, type, size, folder, author, url } = body;

    if (!sessionData?.session) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }

    const userId = sessionData.session.userId;

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

    // Criar log de criação
    await createLog({
      type: "CREATE",
      category: "SYSTEM",
      level: "SUCCESS",
      userId,
      entityId: document.id,
      entityType: "Document",
      action: "Documento criado",
      description: `Novo documento "${name}" criado na pasta "${folder}"`,
      metadata: {
        documentId: document.id,
        documentName: name,
        type,
        folder,
        author,
      },
      changes: { before: null, after: document },
    });

    return NextResponse.json(document, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar documento:", error);
    await createLog({
      type: "SYSTEM",
      category: "SYSTEM",
      level: "ERROR",
      action: "Erro ao criar documento",
      description: `Erro: ${error instanceof Error ? error.message : String(error)}`,
    });
    return NextResponse.json(
      { error: "Erro ao criar documento: " + (error as any).message },
      { status: 500 }
    );
  }
}
