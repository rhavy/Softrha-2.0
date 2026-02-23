import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

// POST - Upload de contrato assinado pelo cliente
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: contractId } = await params;

    // Buscar contrato (não requer autenticação, pode ser acessado via link público)
    const contract = await prisma.contract.findUnique({
      where: { id: contractId },
      include: {
        budget: true,
        project: true,
      },
    });

    if (!contract) {
      return NextResponse.json(
        { error: "Contrato não encontrado" },
        { status: 404 }
      );
    }

    // Verificar se contrato já foi assinado
    if (contract.status === "signed" || contract.status === "signed_by_client") {
      return NextResponse.json(
        { error: "Contrato já foi assinado" },
        { status: 400 }
      );
    }

    // Obter arquivo do request
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const signatureName = formData.get("signatureName") as string;

    if (!file) {
      return NextResponse.json(
        { error: "Arquivo não fornecido" },
        { status: 400 }
      );
    }

    // Validar tipo de arquivo (apenas PDF)
    if (file.type !== "application/pdf" && !file.name.endsWith(".pdf")) {
      return NextResponse.json(
        { error: "Apenas arquivos PDF são aceitos" },
        { status: 400 }
      );
    }

    // Criar diretório de contratos se não existir
    const contractsDir = join(process.cwd(), "public", "contratos");
    if (!existsSync(contractsDir)) {
      await mkdir(contractsDir, { recursive: true });
    }

    // Gerar nome único para o arquivo
    const fileName = `contrato_${contractId}_${Date.now()}.pdf`;
    const filePath = join(contractsDir, fileName);

    // Converter File para Buffer e salvar
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    await writeFile(filePath, buffer);

    // URL pública do arquivo
    const documentUrl = `/contratos/${fileName}`;

    // Atualizar contrato
    const updatedContract = await prisma.contract.update({
      where: { id: contractId },
      data: {
        documentUrl,
        documentName: file.name,
        status: "signed_by_client",
        signedByClientAt: new Date(),
        metadata: {
          signatureName: signatureName || contract.budget.clientName,
          uploadedAt: new Date(),
        },
      },
    });

    // Atualizar status do orçamento para contract_signed
    await prisma.budget.update({
      where: { id: contract.budgetId },
      data: {
        status: "contract_signed",
      },
    });

    // Se o projeto já existir, vincular o contrato
    if (contract.projectId) {
      await prisma.contract.update({
        where: { id: contract.id },
        data: {
          projectId: contract.projectId,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Contrato assinado enviado com sucesso! O status do orçamento foi atualizado.",
      contract: updatedContract,
    });
  } catch (error) {
    console.error("Erro ao fazer upload do contrato:", error);
    return NextResponse.json(
      { error: "Erro ao fazer upload do contrato" },
      { status: 500 }
    );
  }
}

// GET - Buscar detalhes do contrato para assinatura
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: contractId } = await params;

    const contract = await prisma.contract.findUnique({
      where: { id: contractId },
      include: {
        budget: {
          select: {
            clientName: true,
            clientEmail: true,
            company: true,
            projectType: true,
            finalValue: true,
          },
        },
      },
    });

    if (!contract) {
      return NextResponse.json(
        { error: "Contrato não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(contract);
  } catch (error) {
    console.error("Erro ao buscar contrato:", error);
    return NextResponse.json(
      { error: "Erro ao buscar contrato" },
      { status: 500 }
    );
  }
}
