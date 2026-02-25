import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

const resend = process.env.RESEND_API_KEY ? new (require("resend").Resend)(process.env.RESEND_API_KEY) : null;

// POST - Enviar notificação de evolução do projeto (20%, 50%, 70%, 100%)
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
        client: true,
        contract: {
          include: {
            budget: true,
          },
        },
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: "Projeto não encontrado" },
        { status: 404 }
      );
    }

    console.log("[Notificação] Projeto encontrado:", {
      id: project.id,
      name: project.name,
      clientId: project.clientId,
      hasContract: !!project.contract,
      hasBudget: !!project.contract?.budget,
    });

    // Obter dados do cliente de múltiplas fontes
    const budget = project.contract?.budget;
    const client = project.client;
    
    // Extrair e-mail principal do cliente (campo JSON)
    let clientEmailFromClient = "";
    if (client?.emails) {
      try {
        const emails = JSON.parse(client.emails);
        const primaryEmail = emails.find((e: any) => e.isPrimary) || emails[0];
        if (primaryEmail) clientEmailFromClient = primaryEmail.value;
      } catch (e) {
        console.warn("[Notificação] Erro ao parsear emails do cliente:", e);
      }
    }
    
    // Extrair telefone principal do cliente (campo JSON)
    let clientPhoneFromClient = "";
    if (client?.phones) {
      try {
        const phones = JSON.parse(client.phones);
        const primaryPhone = phones.find((p: any) => p.isPrimary) || phones[0];
        if (primaryPhone) clientPhoneFromClient = primaryPhone.value;
      } catch (e) {
        console.warn("[Notificação] Erro ao parsear phones do cliente:", e);
      }
    }
    
    // Priorizar dados do budget, fallback para client
    const clientEmail = budget?.clientEmail || clientEmailFromClient;
    const clientPhone = budget?.clientPhone || clientPhoneFromClient;
    const clientName = budget?.clientName || client?.name || project.clientName || "Cliente";

    console.log("[Notificação] Dados do cliente:", {
      clientEmail,
      clientPhone,
      clientName,
      budgetEmail: budget?.clientEmail,
      budgetPhone: budget?.clientPhone,
      clientEmailsJson: client?.emails,
      clientPhonesJson: client?.phones,
    });

    // Mapear progresso para status
    const progressStatusMap: Record<number, string> = {
      20: "development_20",
      50: "development_50",
      70: "development_70",
      100: "development_100",
    };

    // Mapear progresso para mensagem
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

    console.log("[Notificação] Dados para envio:", {
      sendEmail,
      sendWhatsApp,
      clientEmail,
      clientPhone,
      hasResend: !!resend,
      hasEmailFrom: !!process.env.EMAIL_FROM,
    });

    let emailSent = false;
    let emailError: string | null = null;

    // Enviar e-mail se solicitado
    if (sendEmail && clientEmail) {
      if (!resend) {
        console.warn("[Notificação] RESEND_API_KEY não configurada. E-mail não enviado.");
        emailError = "Serviço de e-mail não configurado";
      } else if (!process.env.EMAIL_FROM) {
        console.warn("[Notificação] EMAIL_FROM não configurado. E-mail não enviado.");
        emailError = "E-mail de origem não configurado";
      } else {
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

                <div style="background: #e0e7ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
                  <p style="margin: 0; color: #3730a3; font-size: 14px;">
                    <strong>Detalhes:</strong><br />
                    ${project.description || "Seu projeto está sendo desenvolvido com dedicação pela nossa equipe."}
                  </p>
                </div>

                <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
                  Nossa equipe está trabalhando com dedicação para entregar o melhor resultado.
                  Em breve teremos mais novidades!
                </p>

                <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;" />
                <p style="color: #6b7280; font-size: 12px;">
                  Atenciosamente,<br />
                  Equipe Softrha
                </p>
              </div>
            `,
          });
          emailSent = true;
          console.log("[Notificação] E-mail enviado com sucesso para:", clientEmail);
        } catch (emailError) {
          console.error("[Notificação] Erro ao enviar e-mail:", emailError);
          emailError = emailError instanceof Error ? emailError.message : "Erro desconhecido";
        }
      }
    }

    // Enviar WhatsApp se solicitado
    let whatsappUrl: string | null = null;
    if (sendWhatsApp && clientPhone) {
      const phoneDigits = clientPhone.replace(/\D/g, "");
      const whatsappMessage = message;

      whatsappUrl = `https://wa.me/55${phoneDigits}?text=${encodeURIComponent(whatsappMessage)}`;
      console.log("[Notificação] WhatsApp URL gerada:", whatsappUrl);
    } else if (sendWhatsApp && !clientPhone) {
      console.warn("[Notificação] Telefone do cliente não disponível para WhatsApp");
    }

    return NextResponse.json({
      success: true,
      progress,
      emailSent,
      emailError,
      whatsappUrl,
      message,
    });
  } catch (error) {
    console.error("Erro ao enviar notificação de evolução:", error);
    return NextResponse.json(
      { error: "Erro ao enviar notificação de evolução" },
      { status: 500 }
    );
  }
}
