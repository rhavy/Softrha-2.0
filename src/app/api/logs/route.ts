import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// GET - Buscar logs com filtros e paginação
export async function GET(request: NextRequest) {
  try {
    const sessionData = await auth.api.getSession({ headers: request.headers });

    if (!sessionData?.session) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const type = searchParams.get("type");
    const category = searchParams.get("category");
    const level = searchParams.get("level");
    const userId = searchParams.get("userId");
    const entityId = searchParams.get("entityId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    // Construir filtros
    const where: any = {};

    if (type) where.type = type;
    if (category) where.category = category;
    if (level) where.level = level;
    if (userId) where.userId = userId;
    if (entityId) where.entityId = entityId;

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    // Buscar logs com paginação
    const skip = (page - 1) * limit;
    const [logs, total] = await Promise.all([
      prisma.log.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.log.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      logs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Erro ao buscar logs:", error);
    return NextResponse.json(
      { error: "Erro ao buscar logs" },
      { status: 500 }
    );
  }
}

// POST - Criar novo log
export async function POST(request: NextRequest) {
  try {
    const sessionData = await auth.api.getSession({ headers: request.headers });

    // Permitir criação de logs sem autenticação para ações do sistema
    const body = await request.json();
    const {
      type,
      category,
      level = "INFO",
      entityId,
      entityType,
      action,
      description,
      metadata,
      changes,
      ipAddress,
      userAgent,
    } = body;

    // Validar campos obrigatórios
    if (!type || !category || !action) {
      return NextResponse.json(
        { error: "Tipo, categoria e ação são obrigatórios" },
        { status: 400 }
      );
    }

    // Criar log
    const log = await prisma.log.create({
      data: {
        type,
        category,
        level,
        userId: sessionData?.session?.userId || null,
        entityId,
        entityType,
        action,
        description,
        metadata,
        changes,
        ipAddress,
        userAgent,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      log,
    }, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar log:", error);
    return NextResponse.json(
      { error: "Erro ao criar log" },
      { status: 500 }
    );
  }
}
