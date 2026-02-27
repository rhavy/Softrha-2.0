import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { createLog } from "@/lib/create-log";
import { createNotificationForAdmins } from "@/lib/create-notification";

// PUT - Atualizar documento
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const sessionData = await auth.api.getSession({ headers: request.headers });
    const { id } = await params;
    const body = await request.json();

    if (!sessionData?.session) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }

    const userId = sessionData.session.userId;

    // Buscar documento atual para log
    const existingDocument = await prisma.document.findUnique({
      where: { id },
    });

    if (!existingDocument) {
      return NextResponse.json(
        { error: "Documento não encontrado" },
        { status: 404 }
      );
    }

    const { name, type, size, folder, author, url } = body;

    const document = await prisma.document.update({
      where: { id },
      data: {
        name: name !== undefined ? name : existingDocument.name,
        type: type !== undefined ? type : existingDocument.type,
        size: size !== undefined ? size : existingDocument.size,
        folder: folder !== undefined ? folder : existingDocument.folder,
        author: author !== undefined ? author : existingDocument.author,
        url: url !== undefined ? url : existingDocument.url,
      },
    });

    // Criar log de atualização
    await createLog({
      type: "UPDATE",
      category: "SYSTEM",
      level: "INFO",
      userId,
      entityId: document.id,
      entityType: "Document",
      action: "Documento atualizado",
      description: `Documento "${document.name}" atualizado`,
      metadata: {
        documentId: document.id,
        documentName: document.name,
        updatedFields: Object.keys(body),
      },
      changes: {
        before: existingDocument,
        after: document,
      },
    });

    return NextResponse.json(document);
  } catch (error) {
    console.error("Erro ao atualizar documento:", error);
    await createLog({
      type: "SYSTEM",
      category: "SYSTEM",
      level: "ERROR",
      action: "Erro ao atualizar documento",
      description: `Erro: ${error instanceof Error ? error.message : String(error)}`,
    });
    return NextResponse.json(
      { error: "Erro ao atualizar documento: " + (error as any).message },
      { status: 500 }
    );
  }
}

// DELETE - Excluir documento
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const sessionData = await auth.api.getSession({ headers: request.headers });
    const { id } = await params;

    if (!sessionData?.session) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }

    const userId = sessionData.session.userId;

    // Buscar documento para log
    const existingDocument = await prisma.document.findUnique({
      where: { id },
    });

    if (!existingDocument) {
      return NextResponse.json(
        { error: "Documento não encontrado" },
        { status: 404 }
      );
    }

    // Excluir documento
    await prisma.document.delete({
      where: { id },
    });

    // Criar log de exclusão
    await createLog({
      type: "DELETE",
      category: "SYSTEM",
      level: "WARNING",
      userId,
      entityId: id,
      entityType: "Document",
      action: "Documento excluído",
      description: `Documento "${existingDocument.name}" foi excluído`,
      metadata: {
        documentId: id,
        documentName: existingDocument.name,
        folder: existingDocument.folder,
        deletedBy: userId,
      },
      changes: { before: existingDocument, after: null },
    });

    // Criar notificação para admins
    await createNotificationForAdmins({
      title: "Documento Excluído 🗑️",
      message: `O documento "${existingDocument.name}" foi excluído do sistema.`,
      type: "warning",
      category: "general",
      metadata: {
        documentId: id,
        documentName: existingDocument.name,
        deletedAt: new Date().toISOString(),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Documento excluído com sucesso",
    });
  } catch (error) {
    console.error("Erro ao excluir documento:", error);
    await createLog({
      type: "SYSTEM",
      category: "SYSTEM",
      level: "ERROR",
      action: "Erro ao excluir documento",
      description: `Erro: ${error instanceof Error ? error.message : String(error)}`,
    });
    return NextResponse.json(
      { error: "Erro ao excluir documento: " + (error as any).message },
      { status: 500 }
    );
  }
}
