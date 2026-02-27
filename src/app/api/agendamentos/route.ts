import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// GET - Listar todos os agendamentos de entrega de projetos
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
    const status = searchParams.get("status");
    const month = searchParams.get("month");
    const year = searchParams.get("year");

    const where: any = {};

    if (status && status !== "todos") {
      where.status = status;
    }

    // Filtrar por mês/ano se fornecido
    if (month && year) {
      const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
      const endDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59);
      where.date = {
        gte: startDate,
        lte: endDate,
      };
    }

    const schedules = await prisma.schedule.findMany({
      where,
      include: {
        project: {
          select: {
            id: true,
            name: true,
            clientName: true,
            type: true,
          },
        },
      },
      orderBy: {
        date: "asc",
      },
    });

    // Formatar dados para o calendário
    const formattedSchedules = schedules.map((schedule) => ({
      id: schedule.id,
      title: `Entrega: ${schedule.project.name}`,
      date: schedule.date.toISOString().split("T")[0],
      time: schedule.time,
      type: "delivery",
      projectType: schedule.project.type,
      clientName: schedule.project.clientName,
      meetingType: schedule.type,
      meetingLink: schedule.meetingLink,
      status: schedule.status,
      notes: schedule.notes,
      projectId: schedule.projectId,
    }));

    return NextResponse.json(formattedSchedules);
  } catch (error) {
    console.error("Erro ao buscar agendamentos:", error);
    return NextResponse.json(
      { error: "Erro ao buscar agendamentos" },
      { status: 500 }
    );
  }
}
