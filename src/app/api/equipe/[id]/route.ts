import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// PUT - Atualizar membro
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, role, email, phone, status, skills, projects } = body;

    console.log("Atualizando membro:", id, body);

    // Verificar se o membro existe
    const existingMember = await prisma.teamMember.findUnique({
      where: { id },
    });

    if (!existingMember) {
      return NextResponse.json(
        { error: "Membro não encontrado" },
        { status: 404 }
      );
    }

    // Atualizar membro
    const updatedMember = await prisma.teamMember.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(role && { role }),
        ...(email && { email }),
        ...(phone !== undefined && { phone }),
        ...(status && { status }),
        ...(skills && { skills: JSON.stringify(skills) }),
        ...(projects !== undefined && { projects }),
      },
    });

    return NextResponse.json({
      id: updatedMember.id,
      name: updatedMember.name,
      role: updatedMember.role,
      email: updatedMember.email,
      phone: updatedMember.phone,
      status: updatedMember.status,
      skills: updatedMember.skills ? JSON.parse(updatedMember.skills) : [],
      projects: updatedMember.projects,
    });
  } catch (error) {
    console.error("Erro ao atualizar membro:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar membro: " + (error as any).message },
      { status: 500 }
    );
  }
}

// DELETE - Excluir membro
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    console.log("Excluindo membro:", id);

    // Verificar se o membro existe
    const existingMember = await prisma.teamMember.findUnique({
      where: { id },
    });

    if (!existingMember) {
      return NextResponse.json(
        { error: "Membro não encontrado" },
        { status: 404 }
      );
    }

    // Excluir membro
    await prisma.teamMember.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Membro excluído com sucesso" });
  } catch (error) {
    console.error("Erro ao excluir membro:", error);
    return NextResponse.json(
      { error: "Erro ao excluir membro: " + (error as any).message },
      { status: 500 }
    );
  }
}
