import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateCPF, validateCNPJ, validateEmail, validateCEP } from "@/lib/validators";

// PUT - Atualizar cliente
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    console.log("Atualizando cliente:", id, body);

    // Verificar se o cliente existe
    const existingClient = await prisma.client.findUnique({
      where: { id },
    });

    if (!existingClient) {
      return NextResponse.json(
        { error: "Cliente não encontrado" },
        { status: 404 }
      );
    }

    // Validações
    if (!firstName || !lastName) {
      return NextResponse.json(
        { error: "Nome e sobrenome são obrigatórios" },
        { status: 400 }
      );
    }

    // Validar documento (se foi alterado)
    if (document && document !== existingClient.document) {
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

    // Atualizar cliente
    const updatedClient = await prisma.client.update({
      where: { id },
      data: {
        ...(firstName && { firstName }),
        ...(lastName && { lastName }),
        name: `${firstName || existingClient.firstName} ${lastName || existingClient.lastName}`,
        ...(documentType && { documentType }),
        ...(document && { document: document.replace(/\D/g, "") }),
        ...(emails && { emails: JSON.stringify(emails) }),
        ...(phones && { phones: JSON.stringify(phones) }),
        ...(address !== undefined && { address }),
        ...(number !== undefined && { number }),
        ...(complement !== undefined && { complement }),
        ...(neighborhood !== undefined && { neighborhood }),
        ...(city !== undefined && { city }),
        ...(state !== undefined && { state }),
        ...(zipCode && { zipCode: zipCode.replace(/\D/g, "") }),
        ...(status && { status }),
        ...(notes !== undefined && { notes }),
      },
    });

    return NextResponse.json({
      id: updatedClient.id,
      firstName: updatedClient.firstName,
      lastName: updatedClient.lastName,
      name: updatedClient.name,
      documentType: updatedClient.documentType,
      document: updatedClient.document,
      emails: updatedClient.emails ? JSON.parse(updatedClient.emails) : [],
      phones: updatedClient.phones ? JSON.parse(updatedClient.phones) : [],
      status: updatedClient.status,
    });
  } catch (error) {
    console.error("Erro ao atualizar cliente:", error);
    
    if ((error as any).code === "P2002") {
      return NextResponse.json(
        { error: "Já existe um cliente com este documento cadastrado" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Erro ao atualizar cliente: " + (error as any).message },
      { status: 500 }
    );
  }
}

// DELETE - Excluir cliente
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    console.log("Excluindo cliente:", id);

    // Verificar se o cliente existe
    const existingClient = await prisma.client.findUnique({
      where: { id },
      include: {
        projects: true,
      },
    });

    if (!existingClient) {
      return NextResponse.json(
        { error: "Cliente não encontrado" },
        { status: 404 }
      );
    }

    // Verificar se tem projetos vinculados
    if (existingClient.projects.length > 0) {
      return NextResponse.json(
        { 
          error: "Não é possível excluir cliente com projetos vinculados",
          projectsCount: existingClient.projects.length
        },
        { status: 400 }
      );
    }

    // Excluir cliente
    await prisma.client.delete({
      where: { id },
    });

    return NextResponse.json({ 
      success: true, 
      message: "Cliente excluído com sucesso" 
    });
  } catch (error) {
    console.error("Erro ao excluir cliente:", error);
    return NextResponse.json(
      { error: "Erro ao excluir cliente: " + (error as any).message },
      { status: 500 }
    );
  }
}
