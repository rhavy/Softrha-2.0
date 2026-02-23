import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

/**
 * POST /api/projetos/[id]/entrega/confirmar
 * 
 * Confirma a realização da entrega do projeto
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const sessionData = await auth.api.getSession({ headers: request.headers });

    if (!sessionData?.session) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }

    const { id: projectId } = await params;
    const body = await request.json();
    const { 
      success, 
      failureReason, 
      failureDescription 
    } = body;

    // Validar campos obrigatórios
    if (success === undefined) {
      return NextResponse.json(
        { error: "Campo success é obrigatório" },
        { status: 400 }
      );
    }

    if (!success && !failureReason) {
      return NextResponse.json(
        { error: "Motivo da falha é obrigatório quando success for false" },
        { status: 400 }
      );
    }

    // Buscar agendamento
    const schedule = await prisma.schedule.findUnique({
      where: { projectId },
      include: {
        project: {
          include: {
            contract: {
              include: {
                budget: true,
              },
            },
          },
        },
      },
    });

    if (!schedule) {
      return NextResponse.json(
        { error: "Agendamento não encontrado" },
        { status: 404 }
      );
    }

    // Atualizar agendamento
    const updatedSchedule = await prisma.schedule.update({
      where: { id: schedule.id },
      data: {
        // Se sucesso: completed
        // Se falha: pending_reschedule (aguardando cliente reagendar)
        status: success ? "completed" : "pending_reschedule",
        ...(failureReason && { 
          notes: failureDescription 
            ? `${schedule.notes || ''}\n\n[Falha na entrega - ${new Date().toLocaleDateString('pt-BR')}]\nMotivo: ${failureReason}\nDescrição: ${failureDescription}`
            : `${schedule.notes || ''}\n\n[Falha na entrega - ${new Date().toLocaleDateString('pt-BR')}]\nMotivo: ${failureReason}`
        }),
      },
    });

    // Se sucesso, atualizar projeto para "finished" (finalizado)
    if (success) {
      await prisma.project.update({
        where: { id: schedule.projectId },
        data: {
          status: "finished",
          completedAt: new Date(),
        },
      });
      
      console.log(`[Entrega] Projeto ${schedule.projectId} marcado como finalizado`);
    }

    // Se falhou, atualizar budget para voltar para final_payment_paid
    if (!success) {
      const budget = schedule.project.contract?.budget;
      if (budget) {
        await prisma.budget.update({
          where: { id: budget.id },
          data: {
            status: "final_payment_paid",
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      schedule: updatedSchedule,
      message: success 
        ? "Entrega confirmada com sucesso" 
        : "Entrega não realizada - agendamento será reprogramado",
    });
  } catch (error) {
    console.error("Erro ao confirmar entrega:", error);
    return NextResponse.json(
      { error: "Erro ao confirmar entrega" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/projetos/[id]/agendamento
 * 
 * Busca o agendamento do projeto
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;

    const schedule = await prisma.schedule.findUnique({
      where: { projectId },
      include: {
        project: {
          include: {
            contract: {
              include: {
                budget: {
                  select: {
                    clientName: true,
                    clientEmail: true,
                    clientPhone: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!schedule) {
      return NextResponse.json(
        { error: "Agendamento não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(schedule);
  } catch (error) {
    console.error("Erro ao buscar agendamento:", error);
    return NextResponse.json(
      { error: "Erro ao buscar agendamento" },
      { status: 500 }
    );
  }
}
