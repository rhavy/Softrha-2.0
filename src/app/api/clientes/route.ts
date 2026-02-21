import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateCPF, validateCNPJ, validateEmail, validateCEP } from "@/lib/validators";
import { notifyNewClient } from "@/lib/notifications";

// GET - Listar todos os clientes
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const search = searchParams.get("search");
    const documentType = searchParams.get("documentType");

    const where: any = {};

    if (status && status !== "todos") {
      where.status = status;
    }

    if (documentType && documentType !== "todos") {
      where.documentType = documentType;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
        { document: { contains: search, mode: "insensitive" } },
        { city: { contains: search, mode: "insensitive" } },
        { emails: { contains: search, mode: "insensitive" } },
      ];
    }

    const clients = await prisma.client.findMany({
      where,
      include: {
        projects: {
          select: {
            id: true,
            name: true,
            status: true,
            budget: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Formatar os dados para o frontend
    const formattedClients = clients.map((client) => ({
      id: client.id,
      firstName: client.firstName,
      lastName: client.lastName,
      name: client.name,
      documentType: client.documentType,
      document: client.document,
      emails: client.emails ? JSON.parse(client.emails) : [],
      phones: client.phones ? JSON.parse(client.phones) : [],
      address: client.address,
      number: client.number,
      complement: client.complement,
      neighborhood: client.neighborhood,
      city: client.city,
      state: client.state,
      zipCode: client.zipCode,
      status: client.status,
      notes: client.notes,
      projectsCount: client.projects.length,
      projects: client.projects,
      createdAt: client.createdAt,
      updatedAt: client.updatedAt,
    }));

    return NextResponse.json(formattedClients);
  } catch (error) {
    console.error("Erro ao buscar clientes:", error);
    return NextResponse.json(
      { error: "Erro ao buscar clientes: " + (error as any).message },
      { status: 500 }
    );
  }
}

// POST - Criar novo cliente
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      firstName,
      lastName,
      documentType,
      document,
      emails,
      phones,
      address,
      number,
      complement,
      neighborhood,
      city,
      state,
      zipCode,
      status,
      notes,
    } = body;

    console.log("Dados recebidos:", body);

    // Validações
    if (!firstName || !lastName) {
      return NextResponse.json(
        { error: "Nome e sobrenome são obrigatórios" },
        { status: 400 }
      );
    }

    if (!documentType || !document) {
      return NextResponse.json(
        { error: "Tipo de documento e documento são obrigatórios" },
        { status: 400 }
      );
    }

    // Validar documento
    const cleanDocument = document.replace(/\D/g, "");
    if (documentType === "cpf" && !validateCPF(cleanDocument)) {
      return NextResponse.json(
        { error: "CPF inválido" },
        { status: 400 }
      );
    }
    if (documentType === "cnpj" && !validateCNPJ(cleanDocument)) {
      return NextResponse.json(
        { error: "CNPJ inválido" },
        { status: 400 }
      );
    }

    // Validar CEP
    if (zipCode && !validateCEP(zipCode.replace(/\D/g, ""))) {
      return NextResponse.json(
        { error: "CEP inválido" },
        { status: 400 }
      );
    }

    // Validar emails
    if (emails && emails.length > 0) {
      for (const email of emails) {
        if (!validateEmail(email.value)) {
          return NextResponse.json(
            { error: `Email inválido: ${email.value}` },
            { status: 400 }
          );
        }
      }
    }

    // Criar cliente
    const client = await prisma.client.create({
      data: {
        firstName,
        lastName,
        name: `${firstName} ${lastName}`,
        documentType,
        document: cleanDocument,
        emails: emails && emails.length > 0 ? JSON.stringify(emails) : null,
        phones: phones && phones.length > 0 ? JSON.stringify(phones) : null,
        address: address || null,
        number: number || null,
        complement: complement || null,
        neighborhood: neighborhood || null,
        city: city || null,
        state: state || null,
        zipCode: zipCode?.replace(/\D/g, "") || null,
        status: status || "active",
        notes: notes || null,
      },
    });

    // Enviar notificação para todos os admins
    await notifyNewClient(client.id, client.name);

    return NextResponse.json({
      id: client.id,
      firstName: client.firstName,
      lastName: client.lastName,
      name: client.name,
      documentType: client.documentType,
      document: client.document,
      emails: client.emails ? JSON.parse(client.emails) : [],
      phones: client.phones ? JSON.parse(client.phones) : [],
      status: client.status,
    });
  } catch (error) {
    console.error("Erro ao criar cliente:", error);
    
    // Verificar se é erro de documento único
    if ((error as any).code === "P2002") {
      return NextResponse.json(
        { error: "Já existe um cliente com este documento cadastrado" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Erro ao criar cliente: " + (error as any).message },
      { status: 500 }
    );
  }
}
