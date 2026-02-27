import { prisma } from "@/lib/prisma";
import { sendEmail, createNewBudgetEmailTemplate, createBudgetConfirmationEmailTemplate } from "@/lib/email";

export type NotificationType = "info" | "success" | "warning" | "error";
export type NotificationCategory = "general" | "project" | "client" | "budget" | "task";

export interface CreateNotificationData {
  userId: string;
  title: string;
  message: string;
  type?: NotificationType;
  category?: NotificationCategory;
  link?: string;
  metadata?: Record<string, any>;
}

/**
 * Cria uma nova notificação para um usuário
 */
export async function createNotification(data: CreateNotificationData) {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId: data.userId,
        title: data.title,
        message: data.message,
        type: data.type || "info",
        category: data.category || "general",
        link: data.link,
        metadata: data.metadata ? JSON.parse(JSON.stringify(data.metadata)) : undefined,
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
export async function createNotificationForUsers(userIds: string[], data: Omit<CreateNotificationData, "userId">) {
  const notifications = await Promise.all(
    userIds.map((userId) => createNotification({ ...data, userId }))
  );
  return notifications.filter((n) => n !== null);
}

/**
 * Cria notificação para todos os usuários admin
 */
export async function createNotificationForAdmins(data: Omit<CreateNotificationData, "userId">) {
  const admins = await prisma.user.findMany({
    where: { role: "ADMIN" },
    select: { id: true },
  });

  return createNotificationForUsers(
    admins.map((a) => a.id),
    data
  );
}

/**
 * Envia notificação de novo orçamento
 */
export async function notifyNewBudget(
  budgetId: string,
  clientName: string,
  clientEmail: string,
  projectType?: string,
  estimatedMin?: number,
  estimatedMax?: number,
  details?: string | null,
  company?: string | null
) {
  // Criar notificação no dashboard
  const notifications = await createNotificationForAdmins({
    title: "Novo Orçamento Recebido",
    message: `${clientName} (${clientEmail}) solicitou um novo orçamento.`,
    type: "info",
    category: "budget",
    link: `/dashboard/orcamentos`,
    metadata: { budgetId, clientName, clientEmail, projectType },
  });

  // Enviar email para todos os admins
  const admins = await prisma.user.findMany({
    where: { role: "ADMIN" },
    select: { id: true, email: true, name: true },
  });

  const { html: htmlAdmin, text: textAdmin } = createNewBudgetEmailTemplate({
    clientName,
    clientEmail,
    company,
    projectType: projectType || "Não informado",
    estimatedMin: estimatedMin || 0,
    estimatedMax: estimatedMax || 0,
    details,
  });

  // Enviar email para cada admin
  await Promise.all(
    admins.map((admin) =>
      sendEmail({
        to: admin.email,
        subject: `🎉 Novo Orçamento Recebido - ${clientName}`,
        html: htmlAdmin,
        text: textAdmin,
      })
    )
  );

  // Enviar email de confirmação para o cliente
  const { html: htmlClient, text: textClient } = createBudgetConfirmationEmailTemplate({
    clientName,
    projectType: projectType || "Não informado",
    estimatedMin: estimatedMin || 0,
    estimatedMax: estimatedMax || 0,
  });

  await sendEmail({
    to: clientEmail,
    subject: `Orçamento Recebido - SoftRha`,
    html: htmlClient,
    text: textClient,
  });

  return notifications;
}

/**
 * Envia notificação de novo cliente
 */
export async function notifyNewClient(clientId: string, clientName: string) {
  return createNotificationForAdmins({
    title: "Novo Cliente Cadastrado",
    message: `O cliente ${clientName} foi cadastrado no sistema.`,
    type: "success",
    category: "client",
    link: `/dashboard/clientes/${clientId}`,
    metadata: { clientId, clientName },
  });
}

/**
 * Envia notificação de novo projeto
 */
export async function notifyNewProject(projectId: string, projectName: string, clientName: string) {
  return createNotificationForAdmins({
    title: "Novo Projeto Criado",
    message: `O projeto "${projectName}" do cliente ${clientName} foi criado.`,
    type: "success",
    category: "project",
    link: `/dashboard/projetos/${projectId}`,
    metadata: { projectId, projectName, clientName },
  });
}

/**
 * Envia notificação de tarefa atualizada
 */
export async function notifyTaskUpdate(
  userId: string,
  taskId: string,
  taskTitle: string,
  newStatus: string
) {
  const statusLabels: Record<string, string> = {
    todo: "A Fazer",
    in_progress: "Em Progresso",
    review: "Em Revisão",
    done: "Concluída",
  };

  return createNotification({
    userId,
    title: "Tarefa Atualizada",
    message: `A tarefa "${taskTitle}" foi movida para: ${statusLabels[newStatus] || newStatus}`,
    type: "info",
    category: "task",
    link: `/dashboard/projetos`,
    metadata: { taskId, taskTitle, newStatus },
  });
}

/**
 * Obtém preferências de notificação do usuário
 */
export async function getUserNotificationPreferences(userId: string) {
  let preferences = await prisma.userNotificationPreference.findUnique({
    where: { userId },
  });

  // Cria preferências padrão se não existirem
  if (!preferences) {
    preferences = await prisma.userNotificationPreference.create({
      data: {
        userId,
        emailEnabled: true,
        pushEnabled: true,
        projectUpdates: true,
        taskUpdates: true,
        budgetAlerts: true,
        clientAlerts: true,
      },
    });
  }

  return preferences;
}

/**
 * Atualiza preferências de notificação do usuário
 */
export async function updateUserNotificationPreferences(
  userId: string,
  preferences: Partial<{
    emailEnabled: boolean;
    pushEnabled: boolean;
    projectUpdates: boolean;
    taskUpdates: boolean;
    budgetAlerts: boolean;
    clientAlerts: boolean;
  }>
) {
  return prisma.userNotificationPreference.upsert({
    where: { userId },
    create: {
      userId,
      ...preferences,
    },
    update: preferences,
  });
}
