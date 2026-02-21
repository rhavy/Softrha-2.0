import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// PUT - Atualizar evento
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { title, description, type, date, time, location, project, participants } = body;

    console.log("Atualizando evento:", id, body);

    // Verificar se o evento existe
    const existingEvent = await prisma.event.findUnique({
      where: { id },
    });

    if (!existingEvent) {
      return NextResponse.json(
        { error: "Evento não encontrado" },
        { status: 404 }
      );
    }

    // Atualizar evento
    const updatedEvent = await prisma.event.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(type && { type }),
        ...(date && { date: new Date(date) }),
        ...(time && { time }),
        ...(location !== undefined && { location }),
        ...(project !== undefined && { project }),
        ...(participants && { participants: JSON.stringify(participants) }),
      },
    });

    return NextResponse.json({
      id: updatedEvent.id,
      title: updatedEvent.title,
      description: updatedEvent.description,
      type: updatedEvent.type,
      date: updatedEvent.date.toISOString().split('T')[0],
      time: updatedEvent.time,
      location: updatedEvent.location,
      project: updatedEvent.project,
      participants: updatedEvent.participants ? JSON.parse(updatedEvent.participants) : [],
    });
  } catch (error) {
    console.error("Erro ao atualizar evento:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar evento: " + (error as any).message },
      { status: 500 }
    );
  }
}

// DELETE - Excluir evento
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    console.log("Excluindo evento:", id);

    // Verificar se o evento existe
    const existingEvent = await prisma.event.findUnique({
      where: { id },
    });

    if (!existingEvent) {
      return NextResponse.json(
        { error: "Evento não encontrado" },
        { status: 404 }
      );
    }

    // Excluir evento
    await prisma.event.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Evento excluído com sucesso" });
  } catch (error) {
    console.error("Erro ao excluir evento:", error);
    return NextResponse.json(
      { error: "Erro ao excluir evento: " + (error as any).message },
      { status: 500 }
    );
  }
}
