import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name, phone, company, document, documentType } = body;

    if (!document) {
      return NextResponse.json(
        { error: "CPF ou CNPJ é obrigatório" },
        { status: 400 }
      );
    }

    // Remover formatação do documento para busca
    const documentDigits = document.replace(/\D/g, "");

    // Tentar encontrar cliente pelo documento (CPF/CNPJ)
    let client = await prisma.client.findFirst({
      where: {
        document: documentDigits,
      },
    });

    let isNewClient = false;

    if (!client) {
      // Se não existir, criar novo cliente
      const nameParts = name.trim().split(" ");
      const firstName = nameParts[0] || name;
      const lastName = nameParts.slice(1).join(" ") || "Cliente";

      client = await prisma.client.create({
        data: {
          firstName,
          lastName,
          name: name.trim(),
          documentType: documentType || (documentDigits.length > 11 ? "cnpj" : "cpf"),
          document: documentDigits,
          emails: email ? JSON.stringify([
            { id: "1", value: email, type: "pessoal", isPrimary: email ? true : false }
          ]) : null,
          phones: phone ? JSON.stringify([
            { id: "1", value: phone, type: "whatsapp", isPrimary: true }
          ]) : null,
          notes: company ? `Empresa: ${company}` : null,
          status: "active",
        },
      });

      isNewClient = true;
    }
    // Se o cliente já existe pelo documento, NÃO alteramos os dados
    // Apenas retornamos o cliente existente

    return NextResponse.json({
      success: true,
      isNewClient,
      client: {
        id: client.id,
        name: client.name,
        email: email || (client.emails ? JSON.parse(client.emails)[0]?.value : null),
        phone: phone || (client.phones ? JSON.parse(client.phones)[0]?.value : null),
        company: company || client.notes?.match(/Empresa: (.+)/)?.[1],
      },
    });
  } catch (error) {
    console.error("Erro ao verificar/criar cliente:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Erro ao processar cliente",
      },
      { status: 500 }
    );
  }
}
