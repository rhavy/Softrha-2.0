import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

const resend = process.env.RESEND_API_KEY ? new (require("resend").Resend)(process.env.RESEND_API_KEY) : null;

// POST - Criar contrato para orçamento/projeto
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

    const { id: budgetId } = await params;
    const body = await request.json();
    const { content, sendEmail = true, sendWhatsApp = false } = body;

    // Buscar orçamento
    const budget = await prisma.budget.findUnique({
      where: { id: budgetId },
      include: {
        contract: true,
      },
    });

    if (!budget) {
      return NextResponse.json(
        { error: "Orçamento não encontrado" },
        { status: 404 }
      );
    }

    // Verificar se já existe contrato
    if (budget.contract) {
      return NextResponse.json(
        { error: "Contrato já existe para este orçamento" },
        { status: 400 }
      );
    }

    // Gerar conteúdo padrão do contrato se não fornecido
    const contractContent = content || gerarContratoPadrao(budget);

    // Criar contrato
    const contract = await prisma.contract.create({
      data: {
        budgetId,
        content: contractContent,
        status: "pending",
      },
    });

    // Atualizar status do orçamento
    await prisma.budget.update({
      where: { id: budgetId },
      data: {
        status: "contract_sent",
      },
    });

    // Enviar e-mail com contrato
    if (sendEmail && budget.clientEmail && resend) {
      try {
        await resend.emails.send({
          from: process.env.EMAIL_FROM || "Softrha <noreply@softrha.com>",
          to: budget.clientEmail,
          subject: `Contrato de Prestação de Serviços - ${budget.projectType}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #2563eb;">Contrato de Prestação de Serviços</h2>
              <p>Olá <strong>${budget.clientName}</strong>,</p>
              <p>Segue abaixo o contrato para a prestação de serviços referente ao projeto <strong>${budget.projectType}</strong>.</p>
              
              <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0; max-height: 300px; overflow-y: auto;">
                <pre style="white-space: pre-wrap; font-family: Arial, sans-serif; font-size: 14px; line-height: 1.6;">${contractContent}</pre>
              </div>

              <p>Por favor, revise o contrato e faça o upload do documento assinado através do link abaixo:</p>
              
              <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/contrato/assinatura/${contract.id}" 
                 style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0;">
                Assinar Contrato
              </a>
              
              <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
                Após a assinatura, nossa equipe irá revisar e dar sequência ao projeto.
              </p>
              
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;" />
              <p style="color: #6b7280; font-size: 12px;">
                Atenciosamente,<br />
                Equipe Softrha
              </p>
            </div>
          `,
        });

        // Atualizar contrato com data de envio
        await prisma.contract.update({
          where: { id: contract.id },
          data: {
            sentAt: new Date(),
            status: "sent",
          },
        });
      } catch (emailError) {
        console.error("Erro ao enviar e-mail:", emailError);
      }
    }

    // Preparar mensagem para WhatsApp
    if (sendWhatsApp && budget.clientPhone) {
      const phoneDigits = budget.clientPhone.replace(/\D/g, "");
      const whatsappMessage = `Olá ${budget.clientName}! Seu contrato está pronto para assinatura.\n\nProjeto: ${budget.projectType}\n\nAcesse: ${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/contrato/assinatura/${contract.id}`;
      
      const whatsappUrl = `https://wa.me/55${phoneDigits}?text=${encodeURIComponent(whatsappMessage)}`;
      
      return NextResponse.json({
        success: true,
        contract,
        whatsappUrl,
        emailSent: sendEmail,
      });
    }

    return NextResponse.json({
      success: true,
      contract,
      emailSent: sendEmail,
    });
  } catch (error) {
    console.error("Erro ao criar contrato:", error);
    return NextResponse.json(
      { error: "Erro ao criar contrato" },
      { status: 500 }
    );
  }
}

// Função auxiliar para gerar contrato padrão
function gerarContratoPadrao(budget: any): string {
  const dataAtual = new Date().toLocaleDateString("pt-BR");
  
  return `CONTRATO DE PRESTAÇÃO DE SERVIÇOS

CONTRATADA: Softrha, empresa de tecnologia, CNPJ XX.XXX.XXX/0001-XX.
CONTRATANTE: ${budget.clientName}${budget.company ? `, representando ${budget.company}` : ""}, ${budget.clientEmail ? `e-mail: ${budget.clientEmail}` : ""}${budget.clientPhone ? `, telefone: ${budget.clientPhone}` : ""}.

CLÁUSULA 1ª - DO OBJETO
1.1. O presente contrato tem como objeto a prestação de serviços de desenvolvimento de ${budget.projectType}, conforme especificações abaixo:
   - Tipo de Projeto: ${budget.projectType}
   - Complexidade: ${budget.complexity}
   - Prazo de Entrega: ${budget.timeline}
   ${budget.details ? `   - Detalhes Adicionais: ${budget.details}` : ""}

CLÁUSULA 2ª - DO VALOR
2.1. O valor total do projeto é de R$ ${budget.finalValue?.toLocaleString("pt-BR", { minimumFractionDigits: 2 }) || budget.estimatedMax?.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}.
2.2. Será cobrada uma entrada de 25% no valor de R$ ${(budget.finalValue || budget.estimatedMax || 0) * 0.25} no início do projeto.
2.3. O saldo restante de 75% será cobrado ao final do projeto.

CLÁUSULA 3ª - DO PRAZO
3.1. O prazo de execução do projeto será de acordo com o cronograma estabelecido entre as partes.
3.2. O prazo começa a contar a partir da assinatura deste contrato e pagamento da entrada.

CLÁUSULA 4ª - DAS OBRIGAÇÕES
4.1. A CONTRATADA obriga-se a executar os serviços com qualidade e dentro do prazo estabelecido.
4.2. O CONTRATANTE obriga-se a fornecer todas as informações necessárias para a execução do projeto.
4.3. O CONTRATANTE obriga-se a efetuar os pagamentos nas datas combinadas.

CLÁUSULA 5ª - DA RESCISÃO
5.1. O presente contrato poderá ser rescindido por qualquer uma das partes, mediante aviso prévio de 30 dias.
5.2. Em caso de rescisão pelo CONTRATANTE, os valores já pagos não serão devolvidos.

CLÁUSULA 6ª - DO FORO
6.1. Fica eleito o foro da comarca da sede da CONTRATADA para dirimir quaisquer dúvidas decorrentes deste contrato.

${dataAtual}

_____________________________________
Softrha - CONTRATADA

_____________________________________
${budget.clientName} - CONTRATANTE`;
}
