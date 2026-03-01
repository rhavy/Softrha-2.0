import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nome, email, empresa, telefone, tipo, mensagem } = body;

    // Validar campos obrigatórios
    if (!nome || !email || !empresa || !telefone || !tipo || !mensagem) {
      return NextResponse.json(
        { error: "Todos os campos obrigatórios devem ser preenchidos" },
        { status: 400 }
      );
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Email inválido" },
        { status: 400 }
      );
    }

    // Validar telefone (mínimo 10 dígitos)
    const phoneDigits = telefone.replace(/\D/g, "");
    if (phoneDigits.length < 10) {
      return NextResponse.json(
        { error: "Telefone inválido" },
        { status: 400 }
      );
    }

    // Criar mensagem no banco
    const contactMessage = await prisma.contactMessage.create({
      data: {
        name: nome,
        email,
        company: empresa,
        phone: telefone,
        projectType: tipo,
        message: mensagem,
        status: "pending",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Mensagem enviada com sucesso! Entraremos em contato em breve.",
      data: contactMessage,
    });
  } catch (error) {
    console.error("Erro ao salvar mensagem de contato:", error);
    return NextResponse.json(
      { error: "Erro ao enviar mensagem. Tente novamente." },
      { status: 500 }
    );
  }
}
