import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

const resend = process.env.RESEND_API_KEY ? new (require("resend").Resend)(process.env.RESEND_API_KEY) : null;

// POST - Criar agendamento de entrega do projeto
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;
    const body = await request.json();
    const { date, time, type, notes } = body;

    // Validar campos obrigatórios
    if (!date || !time || !type) {
      return NextResponse.json(
        { error: "Data, horário e tipo de reunião são obrigatórios" },
        { status: 400 }
      );
    }

    // Validar tipo de reunião
    if (!["video", "audio"].includes(type)) {
      return NextResponse.json(
        { error: "Tipo de reunião deve ser 'video' ou 'audio'" },
        { status: 400 }
      );
    }

    // Buscar projeto
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        contract: {
          include: {
            budget: true,
          },
        },
        schedule: true,
      },
    });

    if (!project) {
      return NextResponse.json({ error: "Projeto não encontrado" }, { status: 404 });
    }

    // Verificar se projeto está concluído e com pagamento final pago
    if (project.status !== "completed" && project.status !== "waiting_final_payment") {
      return NextResponse.json(
        { error: "Projeto ainda não está pronto para agendamento" },
        { status: 400 }
      );
    }

    const budget = project.contract?.budget;

    // Verificar se já existe agendamento
    if (project.schedule && project.schedule.status === "scheduled") {
      return NextResponse.json(
        { error: "Já existe um agendamento para este projeto" },
        { status: 400 }
      );
    }

    // Gerar link de reunião (usando Google Meet como exemplo)
    const meetingLink = type === "video" 
      ? `https://meet.google.com/new` 
      : null;

    // Criar ou atualizar agendamento
    let schedule;
    if (project.schedule) {
      // Se já existe agendamento, atualizar
      // Se status era pending_reschedule, muda para scheduled (reagendamento)
      // Se status era scheduled, muda para rescheduled
      const newStatus = project.schedule.status === "pending_reschedule" ? "scheduled" : "rescheduled";
      
      schedule = await prisma.schedule.update({
        where: { id: project.schedule.id },
        data: {
          date: new Date(date),
          time,
          type,
          status: newStatus,
          meetingLink,
          notes: notes || null,
        },
      });
    } else {
      schedule = await prisma.schedule.create({
        data: {
          projectId,
          date: new Date(date),
          time,
          type,
          status: "scheduled",
          meetingLink,
          notes: notes || null,
        },
      });
    }

    // Enviar e-mail de confirmação
    if (budget?.clientEmail && resend) {
      try {
        const typeLabel = type === "video" ? "Vídeo Chamada" : "Áudio Chamada";
        
        await resend.emails.send({
          from: process.env.EMAIL_FROM || "Softrha <noreply@softrha.com>",
          to: budget.clientEmail,
          subject: `Agendamento de Entrega do Projeto - ${typeLabel}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #2563eb;">Entrega do Projeto Agendada! 🎉</h2>
              <p>Olá <strong>${budget.clientName}</strong>,</p>
              <p>Seu agendamento para entrega do projeto <strong>${project.name}</strong> foi confirmado!</p>
              
              <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin-top: 0; color: #1f2937;">Detalhes do Agendamento</h3>
                <p><strong>📅 Data:</strong> ${new Date(date).toLocaleDateString("pt-BR")}</p>
                <p><strong>🕐 Horário:</strong> ${time}</p>
                <p><strong>📞 Tipo:</strong> ${typeLabel}</p>
                ${meetingLink ? `<p><strong>🔗 Link da Reunião:</strong> <a href="${meetingLink}" style="color: #2563eb;">${meetingLink}</a></p>` : ""}
              </div>

              ${type === "video" ? `
                <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
                  <p style="margin: 0; color: #92400e; font-size: 14px;">
                    <strong>Importante:</strong> O link da reunião será gerado no momento da entrega. 
                    Nossa equipe entrará em contato com o link definitivo antes da reunião.
                  </p>
                </div>
              ` : `
                <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
                  <p style="margin: 0; color: #92400e; font-size: 14px;">
                    <strong>Importante:</strong> Nossa equipe entrará em contato pelo telefone 
                    ${budget.clientPhone || "cadastrado"} no horário agendado.
                  </p>
                </div>
              `}

              <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
                Estamos muito animados para apresentar o resultado do seu projeto!
              </p>
              
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;" />
              <p style="color: #6b7280; font-size: 12px;">Equipe Softrha</p>
            </div>
          `,
        });
      } catch (emailError) {
        console.error("Erro ao enviar e-mail de agendamento:", emailError);
      }
    }

    return NextResponse.json({
      success: true,
      schedule: {
        id: schedule.id,
        date: schedule.date,
        time: schedule.time,
        type: schedule.type,
        status: schedule.status,
        meetingLink: schedule.meetingLink,
      },
      message: "Agendamento realizado com sucesso",
    });
  } catch (error) {
    console.error("Erro ao criar agendamento:", error);
    return NextResponse.json(
      { error: "Erro ao criar agendamento" },
      { status: 500 }
    );
  }
}

// GET - Buscar agendamento do projeto
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
