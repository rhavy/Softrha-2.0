import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";

interface CreateLogParams {
  type: "CREATE" | "UPDATE" | "DELETE" | "VIEW" | "LOGIN" | "LOGOUT" | "PAYMENT" | "CONTRACT" | "SCHEDULE" | "NOTIFICATION" | "SYSTEM";
  category: "PROJECT" | "BUDGET" | "CLIENT" | "TASK" | "CONTRACT" | "PAYMENT" | "SCHEDULE" | "USER" | "SYSTEM" | "NOTIFICATION";
  level?: "INFO" | "WARNING" | "ERROR" | "SUCCESS";
  userId?: string | null;
  entityId?: string | null;
  entityType?: string | null;
  action: string;
  description?: string | null;
  metadata?: any;
  changes?: {
    before?: any;
    after?: any;
  };
}

/**
 * Cria um registro de log no sistema
 * Pode ser usado em qualquer parte do sistema para rastrear ações
 */
export async function createLog({
  type,
  category,
  level = "INFO",
  userId,
  entityId,
  entityType,
  action,
  description,
  metadata,
  changes,
}: CreateLogParams) {
  try {
    // Tentar obter informações da requisição (se disponível)
    let ipAddress: string | null = null;
    let userAgent: string | null = null;

    try {
      const headersList = await headers();
      ipAddress = headersList.get("x-forwarded-for")?.split(",")[0] || 
                   headersList.get("x-real-ip") || 
                   null;
      userAgent = headersList.get("user-agent") || null;
    } catch {
      // Ignora se não estiver em contexto de requisição
    }

    const log = await prisma.log.create({
      data: {
        type,
        category,
        level,
        userId: userId || null,
        entityId: entityId || null,
        entityType: entityType || null,
        action,
        description: description || null,
        metadata: metadata ? metadata : undefined,
        changes: changes ? changes : undefined,
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

    return log;
  } catch (error) {
    console.error("Erro ao criar log:", error);
    // Não lança erro para não quebrar o fluxo principal
    return null;
  }
}

/**
 * Cria logs para operações de criação
 */
export async function createCreateLog(params: Omit<CreateLogParams, "type">) {
  return createLog({ ...params, type: "CREATE" });
}

/**
 * Cria logs para operações de atualização
 */
export async function createUpdateLog(params: Omit<CreateLogParams, "type">) {
  return createLog({ ...params, type: "UPDATE" });
}

/**
 * Cria logs para operações de exclusão
 */
export async function createDeleteLog(params: Omit<CreateLogParams, "type">) {
  return createLog({ ...params, type: "DELETE", level: "WARNING" });
}

/**
 * Cria logs para operações de visualização
 */
export async function createViewLog(params: Omit<CreateLogParams, "type">) {
  return createLog({ ...params, type: "VIEW" });
}

/**
 * Cria logs para operações de pagamento
 */
export async function createPaymentLog(params: Omit<CreateLogParams, "type">) {
  return createLog({ ...params, type: "PAYMENT", level: "SUCCESS" });
}

/**
 * Cria logs para operações de contrato
 */
export async function createContractLog(params: Omit<CreateLogParams, "type">) {
  return createLog({ ...params, type: "CONTRACT" });
}

/**
 * Cria logs para operações de agendamento
 */
export async function createScheduleLog(params: Omit<CreateLogParams, "type">) {
  return createLog({ ...params, type: "SCHEDULE" });
}

/**
 * Cria logs para operações de notificação
 */
export async function createNotificationLog(params: Omit<CreateLogParams, "type">) {
  return createLog({ ...params, type: "NOTIFICATION" });
}

/**
 * Cria logs para operações do sistema
 */
export async function createSystemLog(params: Omit<CreateLogParams, "type">) {
  return createLog({ ...params, type: "SYSTEM" });
}

/**
 * Cria logs para erros
 */
export async function createErrorLog(params: Omit<CreateLogParams, "type"> & { error: any }) {
  return createLog({ 
    ...params, 
    type: "SYSTEM", 
    level: "ERROR",
    description: `${params.description || ""}\nErro: ${params.error instanceof Error ? params.error.message : String(params.error)}`,
  });
}
