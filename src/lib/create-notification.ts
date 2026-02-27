import { prisma } from "@/lib/prisma";

interface CreateNotificationParams {
  userId: string;
  title: string;
  message: string;
  type?: "info" | "success" | "warning" | "error";
  category?: "general" | "project" | "client" | "budget" | "task" | "payment" | "contract";
  link?: string | null;
  metadata?: any;
}

/**
 * Cria uma notificação para um usuário
 */
export async function createNotification({
  userId,
  title,
  message,
  type = "info",
  category = "general",
  link = null,
  metadata = {},
}: CreateNotificationParams) {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId,
        title,
        message,
        type,
        category,
        read: false,
        link,
        metadata,
      },
    });

    return notification;
  } catch (error) {
    console.error("Erro ao criar notificação:", error);
    return null;
  }
}

/**
 * Cria notificações para múltiplos usuários (ex: todos os admins)
 */
export async function createNotificationsForUsers(
  userIds: string[],
  params: Omit<CreateNotificationParams, "userId">
) {
  try {
    const notifications = await Promise.all(
      userIds.map((userId) =>
        createNotification({
          ...params,
          userId,
        })
      )
    );

    return notifications.filter((n) => n !== null);
  } catch (error) {
    console.error("Erro ao criar notificações em massa:", error);
    return [];
  }
}

/**
 * Cria notificações para todos os usuários admin
 */
export async function createNotificationForAdmins(
  params: Omit<CreateNotificationParams, "userId">
) {
  try {
    const adminUsers = await prisma.user.findMany({
      where: { role: "ADMIN" },
      select: { id: true },
    });

    const adminIds = adminUsers.map((u) => u.id);

    return createNotificationsForUsers(adminIds, params);
  } catch (error) {
    console.error("Erro ao criar notificações para admins:", error);
    return [];
  }
}

/**
 * Marca notificação como lida
 */
export async function markNotificationAsRead(notificationId: string) {
  try {
    await prisma.notification.update({
      where: { id: notificationId },
      data: { read: true },
    });

    return true;
  } catch (error) {
    console.error("Erro ao marcar notificação como lida:", error);
    return false;
  }
}

/**
 * Marca todas as notificações de um usuário como lidas
 */
export async function markAllNotificationsAsRead(userId: string) {
  try {
    await prisma.notification.updateMany({
      where: {
        userId,
        read: false,
      },
      data: { read: true },
    });

    return true;
  } catch (error) {
    console.error("Erro ao marcar todas notificações como lidas:", error);
    return false;
  }
}

/**
 * Exclui notificação
 */
export async function deleteNotification(notificationId: string) {
  try {
    await prisma.notification.delete({
      where: { id: notificationId },
    });

    return true;
  } catch (error) {
    console.error("Erro ao excluir notificação:", error);
    return false;
  }
}

/**
 * Busca notificações não lidas de um usuário
 */
export async function getUnreadNotifications(userId: string) {
  try {
    const notifications = await prisma.notification.findMany({
      where: {
        userId,
        read: false,
      },
      orderBy: { createdAt: "desc" },
    });

    return notifications;
  } catch (error) {
    console.error("Erro ao buscar notificações não lidas:", error);
    return [];
  }
}

/**
 * Busca contagem de notificações não lidas
 */
export async function getUnreadNotificationsCount(userId: string) {
  try {
    const count = await prisma.notification.count({
      where: {
        userId,
        read: false,
      },
    });

    return count;
  } catch (error) {
    console.error("Erro ao contar notificações não lidas:", error);
    return 0;
  }
}
