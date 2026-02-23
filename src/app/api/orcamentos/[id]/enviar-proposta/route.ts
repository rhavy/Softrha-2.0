import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

const resend = process.env.RESEND_API_KEY ? new (require("resend").Resend)(process.env.RESEND_API_KEY) : null;

// POST - Gerar token de aprovação e enviar proposta para o cliente
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

    const { id } = await params;
    const body = await request.json();
    const { sendEmail = true, sendWhatsApp = false } = body;

    const budget = await prisma.budget.findUnique({
      where: { id },
      include: {
        user: true,
      },
    });

    if (!budget) {
      return NextResponse.json(
        { error: "Orçamento não encontrado" },
        { status: 404 }
      );
    }

    // Gerar token único para aprovação
    const approvalToken = `approval_${id}_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    const approvalTokenExpires = new Date();
    approvalTokenExpires.setDate(approvalTokenExpires.getDate() + 7); // Token válido por 7 dias

    // Atualizar orçamento com token
    await prisma.budget.update({
      where: { id },
      data: {
        approvalToken,
        approvalTokenExpires,
        status: "sent",
      },
    });

    // URL de aprovação (pública, não requer login)
    const approvalUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/orcamento/aprovar/${approvalToken}`;

    // Enviar e-mail se solicitado
    if (sendEmail && budget.clientEmail && resend) {
      try {
        await resend.emails.send({
          from: process.env.EMAIL_FROM || "Softrha <noreply@softrha.com>",
          to: budget.clientEmail,
          subject: `Proposta Comercial - ${budget.projectType}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #2563eb;">Proposta Comercial</h2>
              <p>Olá <strong>${budget.clientName}</strong>,</p>
              <p>Segue abaixo os detalhes da sua proposta:</p>
              
              <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin-top: 0;">Detalhes do Projeto</h3>
                <p><strong>Tipo:</strong> ${budget.projectType}</p>
                <p><strong>Complexidade:</strong> ${budget.complexity}</p>
                <p><strong>Prazo:</strong> ${budget.timeline}</p>
                <p><strong>Valor Estimado:</strong> R$ ${budget.estimatedMin?.toLocaleString("pt-BR")} - R$ ${budget.estimatedMax?.toLocaleString("pt-BR")}</p>
                ${budget.finalValue ? `<p><strong>Valor Final:</strong> R$ ${budget.finalValue.toLocaleString("pt-BR")}</p>` : ""}
              </div>

              <p>Para aprovar esta proposta, clique no botão abaixo:</p>
              
              <a href="${approvalUrl}" 
                 style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0;">
                Aprovar Proposta
              </a>
              
              <p>Ou acesse o link:</p>
              <p style="word-break: break-all; color: #2563eb;">${approvalUrl}</p>
              
              <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
                Este link é válido por 7 dias. Após a aprovação, você será direcionado para uma página de agradecimento 
                e nossa equipe entrará em contato para os próximos passos.
              </p>
              
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;" />
              <p style="color: #6b7280; font-size: 12px;">
                Atenciosamente,<br />
                Equipe Softrha
              </p>
            </div>
          `,
        });
      } catch (emailError) {
        console.error("Erro ao enviar e-mail:", emailError);
        // Continua mesmo se falhar o envio do e-mail
      }
    }

    // Preparar mensagem para WhatsApp se solicitado
    let whatsappMessage = "";
    if (sendWhatsApp && budget.clientPhone) {
      const phoneDigits = budget.clientPhone.replace(/\D/g, "");
      whatsappMessage = `Olá ${budget.clientName}! Segue sua proposta comercial:\n\nProjeto: ${budget.projectType}\nValor: R$ ${budget.finalValue?.toLocaleString("pt-BR") || budget.estimatedMax?.toLocaleString("pt-BR")}\n\nPara aprovar, acesse: ${approvalUrl}\n\nLink válido por 7 dias.`;
      
      // URL para abrir WhatsApp (não envia automaticamente, apenas prepara a mensagem)
      const whatsappUrl = `https://wa.me/55${phoneDigits}?text=${encodeURIComponent(whatsappMessage)}`;
      
      return NextResponse.json({
        success: true,
        message: "Proposta enviada com sucesso",
        approvalUrl,
        whatsappUrl: sendWhatsApp ? whatsappUrl : null,
        emailSent: sendEmail,
      });
    }

    return NextResponse.json({
      success: true,
      message: "Proposta enviada com sucesso",
      approvalUrl,
      emailSent: sendEmail,
    });
  } catch (error) {
    console.error("Erro ao enviar proposta:", error);
    return NextResponse.json(
      { error: "Erro ao enviar proposta" },
      { status: 500 }
    );
  }
}
