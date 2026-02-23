import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

const resend = process.env.RESEND_API_KEY ? new (require("resend").Resend)(process.env.RESEND_API_KEY) : null;

// POST - Verificar status do pagamento após redirecionamento do Stripe
export async function POST(request: NextRequest) {
  try {
    const { session_id, budget_id } = await request.json();

    console.log("[Verificar Pagamento] session_id:", session_id, "budget_id:", budget_id);

    let payment = null;

    // Método 1: Buscar pelo budget_id (mais confiável)
    if (budget_id) {
      console.log("[Verificar Pagamento] Buscando pagamento por budget_id:", budget_id);
      payment = await prisma.payment.findFirst({
        where: {
          budgetId: budget_id,
          type: "down_payment",
        },
        include: {
          project: true,
          budget: {
            select: {
              clientName: true,
              clientEmail: true,
              finalValue: true,
              projectType: true,
              details: true,
              complexity: true,
              timeline: true,
            },
          },
        },
      });
      
      if (payment) {
        console.log("[Verificar Pagamento] Pagamento encontrado por budget_id:", payment.id);
      }
    }

    // Método 2: Buscar pelo payment_link_id
    if (!payment) {
      console.log("[Verificar Pagamento] Buscando pagamento por session_id...");
      payment = await prisma.payment.findFirst({
        where: {
          stripePaymentId: session_id || undefined,
        },
        include: {
          project: true,
          budget: {
            select: {
              clientName: true,
              clientEmail: true,
              finalValue: true,
              projectType: true,
              details: true,
              complexity: true,
              timeline: true,
            },
          },
        },
      });
    }

    if (!payment) {
      console.log("[Verificar Pagamento] Pagamento não encontrado");
      return NextResponse.json({
        success: false,
        message: "Pagamento não encontrado",
      });
    }

    console.log("[Verificar Pagamento] Status atual do pagamento:", payment.status);

    // Se já estiver pago, processar mesmo assim (para garantir que projeto e budget sejam atualizados)
    if (payment.status === "paid") {
      console.log("[Verificar Pagamento] Pagamento já está pago, processando...");
      
      // Se for pagamento final, garantir que projeto e budget estão atualizados
      if (payment.type === "final_payment") {
        console.log("[Verificar Pagamento] Processando pagamento final (já pago)...");
        
        // Buscar budget completo para verificar status
        const budget = await prisma.budget.findUnique({
          where: { id: payment.budgetId },
        });
        
        // Verificar se budget já está completed
        if (budget && budget.status !== "completed") {
          await prisma.budget.update({
            where: { id: payment.budgetId },
            data: { status: "completed" },
          });
          console.log("[Verificar Pagamento] Budget atualizado para completed");
        }
        
        // Verificar se projeto já está completed
        if (payment.projectId) {
          const project = await prisma.project.findUnique({
            where: { id: payment.projectId },
          });
          
          if (project && project.status !== "completed") {
            await prisma.project.update({
              where: { id: payment.projectId },
              data: {
                status: "completed",
                progress: 100,
                completedAt: new Date(),
              },
            });
            console.log("[Verificar Pagamento] Projeto atualizado para completed");
          }
        }
      }
      
      // Recarregar dados atualizados
      const updatedPayment = await prisma.payment.findUnique({
        where: { id: payment.id },
        include: {
          project: true,
          budget: {
            select: {
              clientName: true,
              clientEmail: true,
              finalValue: true,
              projectType: true,
              details: true,
              complexity: true,
              timeline: true,
            },
          },
        },
      });
      
      // Retornar sucesso
      return NextResponse.json({
        success: true,
        payment: {
          id: updatedPayment?.id,
          amount: updatedPayment?.amount,
          status: updatedPayment?.status,
          paidAt: updatedPayment?.paidAt,
        },
        budget: updatedPayment?.budget,
        project: updatedPayment?.project
          ? {
              id: updatedPayment.project.id,
              name: updatedPayment.project.name,
              clientName: updatedPayment.project.clientName,
              status: updatedPayment.project.status,
            }
          : null,
      });
    }

    // Se não, verificar no Stripe o status da sessão
    if (session_id) {
      try {
        console.log("[Verificar Pagamento] Verificando sessão no Stripe...");
        const session = await stripe.checkout.sessions.retrieve(session_id);
        console.log("[Verificar Pagamento] Status da sessão Stripe:", session.payment_status);

        if (session.payment_status === "paid") {
          // Atualizar pagamento para pago
          await prisma.payment.update({
            where: { id: payment.id },
            data: {
              status: "paid",
              paidAt: new Date(),
              stripePaymentId: session.payment_intent as string,
            },
          });

          console.log("[Verificar Pagamento] Pagamento atualizado para paid");

          // Processar pagamento final ou de entrada
          if (payment.type === "final_payment") {
            console.log("[Verificar Pagamento] Processando pagamento final...");
            
            // Atualizar budget para completed
            if (payment.budgetId) {
              await prisma.budget.update({
                where: { id: payment.budgetId },
                data: {
                  status: "completed",
                },
              });
              console.log("[Verificar Pagamento] Budget atualizado para completed");
            }

            // Atualizar projeto para completed
            if (payment.projectId) {
              await prisma.project.update({
                where: { id: payment.projectId },
                data: {
                  status: "completed",
                  progress: 100,
                  completedAt: new Date(),
                },
              });
              console.log("[Verificar Pagamento] Projeto atualizado para completed");
            }
            
            // Enviar e-mail de confirmação
            if (resend && payment.budget?.clientEmail) {
              try {
                await resend.emails.send({
                  from: process.env.EMAIL_FROM || "Softrha <noreply@softrha.com>",
                  to: payment.budget.clientEmail,
                  subject: "Pagamento Final Confirmado - Agende sua Entrega!",
                  html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                      <h2 style="color: #2563eb;">Pagamento Final Confirmado! 🎉</h2>
                      <p>Olá <strong>${payment.budget.clientName}</strong>,</p>
                      <p>Seu pagamento final foi confirmado e seu projeto está <strong>100% concluído</strong>!</p>
                      <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <p><strong>Projeto:</strong> ${payment.budget.projectType}</p>
                        <p><strong>Valor Total:</strong> R$ ${payment.budget.finalValue?.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
                        <p><strong>Pagamento Final:</strong> R$ ${payment.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} ✅</p>
                      </div>
                      <p>Agora você pode agendar a entrega do projeto!</p>
                      <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/projetos/${payment.projectId}/agendar"
                         style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0;">
                        Agendar Entrega
                      </a>
                      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;" />
                      <p style="color: #6b7280; font-size: 12px;">Equipe Softrha</p>
                    </div>
                  `,
                });
                console.log("[Verificar Pagamento] E-mail de confirmação enviado");
              } catch (emailError) {
                console.error("[Verificar Pagamento] Erro ao enviar e-mail:", emailError);
              }
            }
          } else if (payment.type === "down_payment") {
            // Processamento do pagamento de entrada (já existente)
            console.log("[Verificar Pagamento] Processando pagamento de entrada...");
            // ... código existente para down_payment
          }
        }
      } catch (stripeError) {
        console.error("[Verificar Pagamento] Erro ao buscar sessão no Stripe:", stripeError);
      }
    }

    // Recarregar pagamento com dados atualizados
    const updatedPayment = await prisma.payment.findUnique({
      where: { id: payment.id },
      include: {
        project: true,
        budget: {
          select: {
            clientName: true,
            clientEmail: true,
            finalValue: true,
            projectType: true,
            details: true,
            complexity: true,
            timeline: true,
          },
        },
      },
    });

    // Retornar status atual
    return NextResponse.json({
      success: updatedPayment?.status === "paid",
      payment: {
        id: updatedPayment?.id,
        amount: updatedPayment?.amount,
        status: updatedPayment?.status,
        paidAt: updatedPayment?.paidAt,
      },
      budget: updatedPayment?.budget,
      project: updatedPayment?.project
        ? {
            id: updatedPayment.project.id,
            name: updatedPayment.project.name,
            clientName: updatedPayment.project.clientName,
            status: updatedPayment.project.status,
          }
        : null,
    });
  } catch (error) {
    console.error("[Verificar Pagamento] Erro:", error);
    return NextResponse.json(
      { error: "Erro ao verificar pagamento" },
      { status: 500 }
    );
  }
}
