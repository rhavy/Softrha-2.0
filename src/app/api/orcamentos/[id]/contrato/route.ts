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
    const {
      templateType,
      softrhaData,
      clientData,
      projectData,
      sendEmail = true,
      sendWhatsApp = false,
      content // Este pode ser o base64 do PDF se gerado no front
    } = body;

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

    // Gerar conteúdo de texto para compatibilidade legada ou fallback
    const legacyContent = templateType === "combinado"
      ? `CONTRATO COMBINADO - ${clientData.company || clientData.name}\nValor: R$ ${projectData.finalValue}\nInclui: Proposta Técnica + Contrato Unificado`
      : templateType === "contrato"
        ? `CONTRATO UNIFICADO - ${clientData.company || clientData.name}\nValor: R$ ${projectData.finalValue}`
        : `PROPOSTA TÉCNICA - ${clientData.company || clientData.name}\nValor: R$ ${projectData.finalValue}`;

    // Verificar se já existe contrato
    if (budget.contract) {
      // Atualizar contrato existente com novos dados
      const updatedContract = await prisma.contract.update({
        where: { budgetId },
        data: {
          content: legacyContent,
          status: "pending",
          sentAt: null,
          signedByClientAt: null,
          metadata: {
            templateType,
            softrha: softrhaData,
            client: {
              name: clientData.name,
              company: clientData.company,
              document: clientData.document,
              address: clientData.address,
              representative: clientData.representative,
              email: clientData.email,
              phone: clientData.phone,
            },
            project: {
              type: projectData.type,
              complexity: projectData.complexity,
              timeline: projectData.timeline,
              features: projectData.features,
              integrations: projectData.integrations,
              technologies: projectData.technologies,
              pages: projectData.pages,
              finalValue: projectData.finalValue,
              details: projectData.details,
            },
            pdfGenerated: !!content,
            editedAt: new Date().toISOString(),
            reenviado: true,
          } as any
        },
      });

      // Enviar e-mail com contrato (reatualização)
      if (sendEmail && (clientData.email || budget.clientEmail) && resend) {
        const targetEmail = clientData.email || budget.clientEmail;
        const documentTitle = "Proposta Técnica & Contrato";

        try {
          await resend.emails.send({
            from: process.env.EMAIL_FROM || "Softrha <noreply@softrha.com>",
            to: targetEmail,
            subject: `Atualização: ${documentTitle} - ${projectData.type}`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #334155;">
                <h2 style="color: #2563eb;">Atualização do Contrato</h2>
                <p>Olá <strong>${clientData.representative || clientData.name}</strong>,</p>
                <p>O documento do seu projeto <strong>${projectData.type}</strong> foi atualizado. Por favor, revise a nova versão.</p>

                <div style="background: #f8fafc; padding: 25px; border-radius: 12px; border: 1px solid #e2e8f0; margin: 25px 0;">
                  <p style="margin: 0; font-size: 14px; color: #64748b;">Resumo do Investimento:</p>
                  <p style="margin: 5px 0 0 0; font-size: 24px; font-weight: bold; color: #0f172a;">R$ ${projectData.finalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                </div>

                <p>Para visualizar o documento atualizado e realizar a assinatura digital, clique no botão abaixo:</p>

                <div style="text-align: center; margin: 30px 0;">
                  <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/contrato/assinatura/${updatedContract.id}"
                     style="display: inline-block; background: #2563eb; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.2);">
                    Acessar Documento Atualizado
                  </a>
                </div>

                <p style="color: #64748b; font-size: 14px; line-height: 1.6;">
                  Se você tiver qualquer dúvida sobre os termos ou o escopo técnico, sinta-se à vontade para entrar em contato conosco diretamente.
                </p>

                <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;" />
                <p style="color: #94a3b8; font-size: 12px; text-align: center;">
                  <strong>SoftRha IT Solutions</strong><br />
                  Este é um e-mail automático, por favor não responda.
                </p>
              </div>
            `,
          });

          await prisma.contract.update({
            where: { id: updatedContract.id },
            data: {
              sentAt: new Date(),
              status: "sent",
            },
          });
        } catch (emailError) {
          console.error("Erro ao enviar e-mail de atualização:", emailError);
        }
      }

      // Preparar mensagem para WhatsApp
      if (sendWhatsApp && budget.clientPhone) {
        const phoneDigits = budget.clientPhone.replace(/\D/g, "");
        const whatsappMessage = `Olá ${budget.clientName}! O contrato do seu projeto foi atualizado.\n\nProjeto: ${budget.projectType}\n\nAcesse: ${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/contrato/assinatura/${updatedContract.id}`;

        const whatsappUrl = `https://wa.me/55${phoneDigits}?text=${encodeURIComponent(whatsappMessage)}`;

        return NextResponse.json({
          success: true,
          contract: updatedContract,
          whatsappUrl,
          emailSent: sendEmail,
          updated: true,
        });
      }

      return NextResponse.json({
        success: true,
        contract: updatedContract,
        emailSent: sendEmail,
        updated: true,
      });
    }

    // Atualizar orçamento com os dados editados do projeto
    await prisma.budget.update({
      where: { id: budgetId },
      data: {
        finalValue: projectData.finalValue,
        timeline: projectData.timeline,
        technologies: projectData.technologies,
        details: projectData.details,
      },
    });

    // Criar contrato com metadados completos (todos os dados editados)
    const contract = await prisma.contract.create({
      data: {
        budgetId,
        content: legacyContent,
        status: "pending",
        metadata: {
          templateType,
          softrha: softrhaData,
          client: {
            name: clientData.name,
            company: clientData.company,
            document: clientData.document,
            address: clientData.address,
            representative: clientData.representative,
            email: clientData.email,
            phone: clientData.phone,
          },
          project: {
            type: projectData.type,
            complexity: projectData.complexity,
            timeline: projectData.timeline,
            features: projectData.features,
            integrations: projectData.integrations,
            technologies: projectData.technologies,
            pages: projectData.pages,
            finalValue: projectData.finalValue,
            details: projectData.details,
          },
          pdfGenerated: !!content,
          editedAt: new Date().toISOString(),
        } as any
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
    if (sendEmail && (clientData.email || budget.clientEmail) && resend) {
      const targetEmail = clientData.email || budget.clientEmail;
      const documentTitle = templateType === "combinado" ? "Proposta Técnica & Contrato" : templateType === "contrato" ? "Contrato" : "Proposta Técnica";
      
      try {
        await resend.emails.send({
          from: process.env.EMAIL_FROM || "Softrha <noreply@softrha.com>",
          to: targetEmail,
          subject: `${documentTitle} - ${projectData.type}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #334155;">
              <h2 style="color: #2563eb;">${templateType === "combinado" ? "Sua Proposta Técnica e Contrato estão Prontos" : templateType === "contrato" ? "Seu Contrato está Pronto" : "Sua Proposta Técnica e Comercial"}</h2>
              <p>Olá <strong>${clientData.representative || clientData.name}</strong>,</p>
              <p>É um prazer seguir com o seu projeto <strong>${projectData.type}</strong>. Preparamos o documento completo para sua revisão e assinatura.</p>

              <div style="background: #f8fafc; padding: 25px; border-radius: 12px; border: 1px solid #e2e8f0; margin: 25px 0;">
                <p style="margin: 0; font-size: 14px; color: #64748b;">Resumo do Investimento:</p>
                <p style="margin: 5px 0 0 0; font-size: 24px; font-weight: bold; color: #0f172a;">R$ ${projectData.finalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
              </div>

              <p>Para visualizar o documento oficial e realizar a assinatura digital, clique no botão abaixo:</p>

              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/contrato/assinatura/${contract.id}"
                   style="display: inline-block; background: #2563eb; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.2);">
                  Acessar Documento e Assinar
                </a>
              </div>

              <p style="color: #64748b; font-size: 14px; line-height: 1.6;">
                Se você tiver qualquer dúvida sobre os termos ou o escopo técnico, sinta-se à vontade para entrar em contato conosco diretamente.
              </p>

              <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;" />
              <p style="color: #94a3b8; font-size: 12px; text-align: center;">
                <strong>SoftRha IT Solutions</strong><br />
                Este é um e-mail automático, por favor não responda.
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
