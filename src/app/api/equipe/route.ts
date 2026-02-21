import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - Listar todos os membros da equipe
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    const where: any = {};

    if (status && status !== "todos") {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { role: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    const members = await prisma.teamMember.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
    });

    // Formatar os dados para o frontend
    const formattedMembers = members.map((member) => ({
      id: member.id,
      name: member.name,
      role: member.role,
      email: member.email,
      phone: member.phone,
      avatar: member.avatar,
      status: member.status,
      projects: member.projects,
      skills: member.skills ? JSON.parse(member.skills) : [],
    }));

    return NextResponse.json(formattedMembers);
  } catch (error) {
    console.error("Erro ao buscar equipe:", error);
    return NextResponse.json(
      { error: "Erro ao buscar equipe: " + (error as any).message },
      { status: 500 }
    );
  }
}

// POST - Criar novo membro
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, role, email, phone, status, skills } = body;

    console.log("Dados recebidos:", body);

    // Validação básica
    if (!name || !role || !email) {
      return NextResponse.json(
        { error: "Nome, cargo e email são obrigatórios" },
        { status: 400 }
      );
    }

    // Criar membro
    const member = await prisma.teamMember.create({
      data: {
        name,
        role,
        email,
        phone: phone || null,
        status: status || "active",
        skills: skills && skills.length > 0 ? JSON.stringify(skills) : null,
        projects: 0,
      },
    });

    return NextResponse.json({
      id: member.id,
      name: member.name,
      role: member.role,
      email: member.email,
      phone: member.phone,
      status: member.status,
      skills: skills || [],
      projects: member.projects,
    });
  } catch (error) {
    console.error("Erro ao criar membro:", error);
    return NextResponse.json(
      { error: "Erro ao criar membro: " + (error as any).message },
      { status: 500 }
    );
  }
}
