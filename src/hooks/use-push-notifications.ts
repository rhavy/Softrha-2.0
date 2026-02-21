import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';

/**
 * Hook para gerenciar notificações push no navegador
 */
export function usePushNotifications() {
  const [isSupported, setIsSupported] = useState(false);
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const { toast } = useToast();

  useEffect(() => {
    // Verificar se o navegador suporta Service Worker e Push
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      setIsSupported(true);
      checkPermission();
      getExistingSubscription();
    }
  }, []);

  /**
   * Verifica permissão atual
   */
  async function checkPermission() {
    if (!('Notification' in window)) {
      setPermission('denied');
      return;
    }
    setPermission(Notification.permission);
  }

  /**
   * Busca subscription existente
   */
  async function getExistingSubscription() {
    try {
      const registration = await navigator.serviceWorker.ready;
      const existingSubscription = await registration.pushManager.getSubscription();
      setSubscription(existingSubscription);
    } catch (error) {
      console.error('Erro ao buscar subscription:', error);
    }
  }

  /**
   * Solicita permissão e inscreve para push notifications
   */
  async function subscribeToPush() {
    if (!isSupported) {
      toast({
        title: 'Não suportado',
        description: 'Seu navegador não suporta notificações push.',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Solicitar permissão
      const permission = await Notification.requestPermission();
      setPermission(permission);

      if (permission !== 'granted') {
        toast({
          title: 'Permissão negada',
          description: 'Você precisa permitir notificações para receber alertas.',
          variant: 'destructive',
        });
        return;
      }

      // Registrar service worker
      const registration = await navigator.serviceWorker.ready;

      // Gerar ou usar chaves VAPID públicas
      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      
      if (!vapidPublicKey) {
        console.warn('VAPID public key não configurada');
        // Para desenvolvimento, continuar sem VAPID
      }

      // Criar subscription
      const newSubscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey || ''),
      });

      setSubscription(newSubscription);

      // Enviar subscription para o backend
      const response = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ subscription: newSubscription }),
      });

      if (response.ok) {
        toast({
          title: 'Inscrito com sucesso!',
          description: 'Você receberá notificações push no navegador.',
        });
      }

      return newSubscription;
    } catch (error) {
      console.error('Erro ao subscrever:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível inscrever para notificações push.',
        variant: 'destructive',
      });
    }
  }

  /**
   * Cancela inscrição de push notifications
   */
  async function unsubscribeFromPush() {
    if (!subscription) {
      return;
    }

    try {
      await subscription.unsubscribe();
      setSubscription(null);
      toast({
        title: 'Inscrição cancelada',
        description: 'Você não receberá mais notificações push.',
      });
    } catch (error) {
      console.error('Erro ao cancelar inscrição:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível cancelar a inscrição.',
        variant: 'destructive',
      });
    }
  }

  /**
   * Envia uma notificação local (para teste)
   */
  function sendLocalNotification(title: string, body: string, icon?: string) {
    if (Notification.permission === 'granted') {
      new Notification(title, {
        body,
        icon,
        badge: '/icon-192.png',
      });
    }
  }

  return {
    isSupported,
    subscription,
    permission,
    subscribeToPush,
    unsubscribeFromPush,
    sendLocalNotification,
  };
}

/**
 * Converte string base64 para Uint8Array (necessário para VAPID)
 */
function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
