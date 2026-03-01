import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// GET - Listar todos os agendamentos (entregas de projetos e reuniões de contato)
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
    const formattedSchedules = schedules.map((schedule) => {
      // Verificar se é agendamento de reunião (contato) ou entrega de projeto
      const isMeetingSchedule = schedule.project?.name?.includes("Reunião Agendada");
      
      // A data já está em UTC no banco, precisamos extrair o dia correto
      const scheduleDate = new Date(schedule.date);
      // Como a data foi salva em UTC, extraímos diretamente os componentes
      const utcYear = scheduleDate.getUTCFullYear();
      const utcMonth = scheduleDate.getUTCMonth();
      const utcDay = scheduleDate.getUTCDate();
      
      // Criar data no formato YYYY-MM-DD para exibição
      const displayDate = `${utcYear}-${String(utcMonth + 1).padStart(2, '0')}-${String(utcDay).padStart(2, '0')}`;
      
      // Extrair dados do cliente do history (JSON) ou das notes
      let clientName = schedule.project?.clientName;
      let clientPhone = null;
      let meetingPeriod = null;
      
      if (schedule.history) {
        const history = schedule.history as any;
        if (history.name) clientName = history.name;
        if (history.phone) clientPhone = history.phone;
        if (history.period) meetingPeriod = history.period;
      }
      
      // Se não tem history, tentar extrair das notes
      if (!clientName && schedule.notes) {
        const nameMatch = schedule.notes.match(/Nome: (.+?)(?: - |$)/);
        if (nameMatch) clientName = nameMatch[1];
        
        const phoneMatch = schedule.notes.match(/WhatsApp: (.+?)(?: - |$)/);
        if (phoneMatch) clientPhone = phoneMatch[1];
        
        const periodMatch = schedule.notes.match(/Período: (Manhã|Tarde)/);
        if (periodMatch) meetingPeriod = periodMatch[1].toLowerCase();
      }
      
      return {
        id: schedule.id,
        title: isMeetingSchedule 
          ? `Reunião: ${clientName || schedule.project.name.replace("Reunião Agendada - ", "")}`
          : `Entrega: ${schedule.project.name}`,
        date: displayDate,
        time: schedule.time,
        type: isMeetingSchedule ? "meeting" : "delivery",
        projectType: schedule.project.type,
        clientName: clientName,
        clientPhone: clientPhone,
        meetingPeriod: meetingPeriod,
        meetingType: schedule.type,
        meetingLink: schedule.meetingLink,
        status: schedule.status,
        notes: schedule.notes,
        projectId: schedule.projectId,
        isMeetingSchedule, // Flag para identificar o tipo
      };
    });

    return NextResponse.json(formattedSchedules);
  } catch (error) {
    console.error("Erro ao buscar agendamentos:", error);
    return NextResponse.json(
      { error: "Erro ao buscar agendamentos" },
      { status: 500 }
    );
  }
}
