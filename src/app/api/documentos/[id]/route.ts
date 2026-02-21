import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// PUT - Atualizar documento
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, type, size, folder, author, url } = body;

    console.log("Atualizando documento:", id, body);

    // Verificar se o documento existe
    const existingDocument = await prisma.document.findUnique({
      where: { id },
    });

    if (!existingDocument) {
      return NextResponse.json(
        { error: "Documento não encontrado" },
        { status: 404 }
      );
    }

    // Atualizar documento
    const updatedDocument = await prisma.document.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(type && { type }),
        ...(size && { size }),
        ...(folder && { folder }),
        ...(author && { author }),
        ...(url !== undefined && { url }),
      },
    });

    return NextResponse.json(updatedDocument);
  } catch (error) {
    console.error("Erro ao atualizar documento:", error);
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
    const { id } = await params;

    console.log("Excluindo documento:", id);

    // Verificar se o documento existe
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

    return NextResponse.json({ success: true, message: "Documento excluído com sucesso" });
  } catch (error) {
    console.error("Erro ao excluir documento:", error);
    return NextResponse.json(
      { error: "Erro ao excluir documento: " + (error as any).message },
      { status: 500 }
    );
  }
}
