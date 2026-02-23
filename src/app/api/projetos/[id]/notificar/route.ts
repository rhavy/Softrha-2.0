import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

const resend = process.env.RESEND_API_KEY ? new (require("resend").Resend)(process.env.RESEND_API_KEY) : null;

/**
 * POST /api/projetos/[id]/notificar
 * 
 * Notifica cliente sobre evolução do projeto (20%, 50%, 70%, 100%)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const sessionData = await auth.api.getSession({ headers: request.headers });
    if (!sessionData?.session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { id: projectId } = await params;
    const body = await request.json();
    const { progress, sendEmail = true, sendWhatsApp = false, customMessage } = body;

    // Validar progresso
    const validProgressValues = [20, 50, 70, 100];
    if (!validProgressValues.includes(progress)) {
      return NextResponse.json(
        { error: "Progresso deve ser 20, 50, 70 ou 100" },
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
      },
    });

    if (!project) {
      return NextResponse.json({ error: "Projeto não encontrado" }, { status: 404 });
    }

    // Obter dados do cliente
    const budget = project.contract?.budget;
    const clientEmail = budget?.clientEmail;
    const clientPhone = budget?.clientPhone;
    const clientName = budget?.clientName || project.clientName;

    // Mapear progresso para status
    const progressStatusMap: Record<number, string> = {
      20: "development_20",
      50: "development_50",
      70: "development_70",
      100: "development_100",
    };

    // Mensagens
    const progressMessageMap: Record<number, string> = {
      20: "seu projeto está 20% concluído",
      50: "seu projeto está 50% concluído (metade do caminho!)",
      70: "seu projeto está 70% concluído",
      100: "seu projeto está 100% concluído! 🎉",
    };

    // Atualizar progresso do projeto
    await prisma.project.update({
      where: { id: projectId },
      data: {
        progress,
        status: progressStatusMap[progress],
      },
    });

    // Mensagem padrão
    const defaultMessage = `Olá ${clientName}! Temos uma atualização sobre seu projeto "${project.name}":\n\n${progressMessageMap[progress]}\n\nNossa equipe está trabalhando com dedicação para entregar o melhor resultado. Em breve teremos mais novidades!`;

    const message = customMessage || defaultMessage;

    // Enviar e-mail se solicitado
    if (sendEmail && clientEmail && resend) {
      try {
        await resend.emails.send({
          from: process.env.EMAIL_FROM || "Softrha <noreply@softrha.com>",
          to: clientEmail,
          subject: `Atualização do Projeto - ${progress}% Concluído`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #2563eb;">Atualização do Projeto 🚀</h2>
              <p>Olá <strong>${clientName}</strong>,</p>
              <p>Temos uma atualização sobre seu projeto <strong>${project.name}</strong>:</p>
              
              <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
                <div style="font-size: 48px; font-weight: bold; color: #2563eb;">${progress}%</div>
                <p style="margin: 10px 0 0 0; color: #6b7280;">${progressMessageMap[progress]}</p>
              </div>

              <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
                Nossa equipe está trabalhando com dedicação para entregar o melhor resultado.
              </p>
              
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;" />
              <p style="color: #6b7280; font-size: 12px;">Equipe Softrha</p>
            </div>
          `,
        });
      } catch (emailError) {
        console.error("Erro ao enviar e-mail:", emailError);
      }
    }

    // Preparar WhatsApp se solicitado
    let whatsappUrl = null;
    if (sendWhatsApp && clientPhone) {
      const phoneDigits = clientPhone.replace(/\D/g, "");
      const whatsappMessage = message;
      whatsappUrl = `https://wa.me/55${phoneDigits}?text=${encodeURIComponent(whatsappMessage)}`;
    }

    return NextResponse.json({
      success: true,
      progress,
      emailSent: sendEmail && !!resend,
      whatsappUrl,
      message,
    });

  } catch (error) {
    console.error("Erro ao notificar evolução:", error);
    return NextResponse.json(
      { error: "Erro ao notificar evolução" },
      { status: 500 }
    );
  }
}
