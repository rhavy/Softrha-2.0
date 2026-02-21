import webPush from 'web-push';

// Configurar VAPID
if (process.env.VAPID_PRIVATE_KEY && process.env.VAPID_PUBLIC_KEY) {
  webPush.setVapidDetails(
    process.env.VAPID_SUBJECT || 'mailto:support@softrha.com',
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
}

/**
 * Assinatura de push para um usuário
 */
export interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

/**
 * Envia notificação push para um usuário
 */
export async function sendPushNotification(
  subscription: PushSubscription,
  data: {
    title: string;
    body: string;
    icon?: string;
    badge?: string;
    url?: string;
    tag?: string;
  }
) {
  const payload = JSON.stringify({
    title: data.title,
    body: data.body,
    icon: data.icon || '/icon-192.png',
    badge: data.badge || '/icon-192.png',
    url: data.url,
    tag: data.tag,
    timestamp: Date.now(),
  });

  try {
    const result = await webPush.sendNotification(
      subscription,
      payload
    );

    console.log('Push notification enviado com sucesso:', result.statusCode);
    return { success: true };
  } catch (error: any) {
    // Erro 410 = subscription expirou/inválida
    if (error.statusCode === 410) {
      console.log('Subscription expirada, remover do banco');
      return { success: false, error: 'subscription_expired' };
    }

    console.error('Erro ao enviar push notification:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Gera chaves VAPID para configuração
 * Execute isso uma vez e salve as chaves no .env
 */
export function generateVAPIDKeys() {
  const keys = webPush.generateVAPIDKeys();
  return {
    publicKey: keys.publicKey,
    privateKey: keys.privateKey,
  };
}
