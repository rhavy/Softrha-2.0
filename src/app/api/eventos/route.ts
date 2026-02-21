import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - Listar todos os eventos
export async function GET(request: NextRequest) {
  try {
    const documents = await prisma.event.findMany({
      orderBy: [
        { date: "asc" },
        { time: "asc" },
      ],
    });

    // Formatar os dados para o frontend
    const formattedEvents = documents.map((event) => ({
      id: event.id,
      title: event.title,
      description: event.description,
      type: event.type,
      date: event.date.toISOString().split('T')[0],
      time: event.time,
      location: event.location,
      project: event.project,
      participants: event.participants ? JSON.parse(event.participants) : [],
    }));

    return NextResponse.json(formattedEvents);
  } catch (error) {
    console.error("Erro ao buscar eventos:", error);
    return NextResponse.json(
      { error: "Erro ao buscar eventos: " + (error as any).message },
      { status: 500 }
    );
  }
}

// POST - Criar novo evento
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, type, date, time, location, project, participants } = body;

    console.log("Dados recebidos:", body);

    // Validação básica
    if (!title || !date || !time) {
      return NextResponse.json(
        { error: "Título, data e hora são obrigatórios" },
        { status: 400 }
      );
    }

    // Criar evento
    const event = await prisma.event.create({
      data: {
        title,
        description: description || null,
        type,
        date: new Date(date),
        time,
        location: location || null,
        project: project || null,
        participants: participants && participants.length > 0 ? JSON.stringify(participants) : null,
      },
    });

    return NextResponse.json({
      id: event.id,
      title: event.title,
      description: event.description,
      type: event.type,
      date: event.date.toISOString().split('T')[0],
      time: event.time,
      location: event.location,
      project: event.project,
      participants: participants || [],
    });
  } catch (error) {
    console.error("Erro ao criar evento:", error);
    return NextResponse.json(
      { error: "Erro ao criar evento: " + (error as any).message },
      { status: 500 }
    );
  }
}
