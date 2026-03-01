import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Buscar todos os agendamentos com status 'scheduled'
    const schedules = await prisma.schedule.findMany({
      where: {
        status: "scheduled",
      },
      select: {
        date: true,
      },
    });

    // Extrair datas usando UTC para evitar problemas de fuso
    const dates = schedules.map((s) => {
      const scheduleDate = new Date(s.date);
      // Usar UTC para extrair o dia correto
      const year = scheduleDate.getUTCFullYear();
      const month = scheduleDate.getUTCMonth();
      const day = scheduleDate.getUTCDate();
      // Criar data no timezone local com os componentes UTC
      return new Date(year, month, day);
    });

    console.log("[API Datas] Agendamentos encontrados:", schedules.length);
    console.log("[API Datas] Datas retornadas:", dates.map(d => d.toISOString().split('T')[0]));

    return NextResponse.json({ dates });
  } catch (error) {
    console.error("Erro ao buscar datas agendadas:", error);
    return NextResponse.json(
      { error: "Erro ao buscar datas agendadas" },
      { status: 500 }
    );
  }
}
