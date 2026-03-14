import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email é obrigatório' },
        { status: 400 }
      );
    }

    // Atualizar usuário para ADMIN com email verificado
    const user = await prisma.user.update({
      where: { email },
      data: { 
        role: 'ADMIN',
        emailVerified: true 
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        emailVerified: true,
      },
    });

    console.log(`✅ Usuário ${user.email} promovido a ADMIN com email verificado!`);

    return NextResponse.json({ 
      success: true, 
      message: 'Usuário promovido a ADMIN com sucesso',
      user 
    });
  } catch (error) {
    console.error('❌ Erro ao promover usuário:', error);
    
    if (error instanceof Error && 'code' in error && error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Erro interno ao promover usuário' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Listar todos os usuários com seus roles
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        emailVerified: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.error('❌ Erro ao listar usuários:', error);
    return NextResponse.json(
      { error: 'Erro ao listar usuários' },
      { status: 500 }
    );
  }
}
