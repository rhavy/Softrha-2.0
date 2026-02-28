import { useState, useEffect, useCallback, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { useNotificationSound } from "@/hooks/use-notification-sound";

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  category: "general" | "project" | "client" | "budget" | "task";
  read: boolean;
  link: string | null;
  metadata: any;
  createdAt: string;
}

interface UseNotificationsReturn {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: Error | null;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  refresh: () => Promise<void>;
}

export function useNotifications(): UseNotificationsReturn {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const previousUnreadCountRef = useRef(0);
  const { toast } = useToast();
  const { play: playNotificationSound } = useNotificationSound(true);

  const fetchNotifications = useCallback(async () => {
    console.log('[NOTIFICATIONS] 📥 Iniciando fetchNotifications...');
    try {
      console.log('[NOTIFICATIONS] 🔍 Buscando notificações não lidas...');
      const response = await fetch("/api/notificacoes?unread=true&limit=20", {
        credentials: "include",
      });
      console.log('[NOTIFICATIONS] 📡 Status da resposta:', response.status);
      console.log('[NOTIFICATIONS] 📡 Headers da resposta:', response.headers.get('content-type'));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[NOTIFICATIONS] ❌ Erro na resposta:', response.status, errorText);
        throw new Error(`Erro ao buscar notificações: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      const newUnreadCount = data.unreadCount || 0;
      const newNotifications = data.notifications || [];

      console.log('[NOTIFICATIONS] 📊 Dados recebidos:', {
        total: newNotifications.length,
        unreadCount: newUnreadCount,
        previousUnreadCount: previousUnreadCountRef.current,
      });

      setNotifications(newNotifications);
      setUnreadCount(newUnreadCount);

      // Tocar som e mostrar toast se houver novas notificações
      if (newUnreadCount > previousUnreadCountRef.current && previousUnreadCountRef.current > 0) {
        const newNotificationsCount = newUnreadCount - previousUnreadCountRef.current;
        console.log('[NOTIFICATIONS] 🔔 Novas notificações detectadas:', newNotificationsCount);
        playNotificationSound();
        console.log('[NOTIFICATIONS] 🎵 Som de notificação reproduzido');
      } else if (newUnreadCount === 0) {
        console.log('[NOTIFICATIONS] ✅ Sem notificações não lidas');
      } else {
        console.log('[NOTIFICATIONS] ℹ️ Sem novas notificações (count:', newUnreadCount, ')');
      }

      // Atualizar referência
      previousUnreadCountRef.current = newUnreadCount;
    } catch (err) {
      console.error('[NOTIFICATIONS] ❌ Erro ao buscar notificações:', err);
      setError(err as Error);
    } finally {
      setIsLoading(false);
      console.log('[NOTIFICATIONS] ✅ fetchNotifications concluído');
    }
  }, [playNotificationSound]);

  useEffect(() => {
    console.log('[NOTIFICATIONS] 🚀 Hook inicializado - Executando fetch inicial...');
    fetchNotifications();

    // Polling a cada 5 segundos para novas notificações
    const interval = setInterval(() => {
      console.log('[NOTIFICATIONS] ⏰ Polling: Buscando atualizações...');
      fetchNotifications();
    }, 5000);

    console.log('[NOTIFICATIONS] ⏱️ Polling configurado para 5 segundos');

    return () => {
      console.log('[NOTIFICATIONS] 🧹 Cleanup: Limpando intervalo de polling');
      clearInterval(interval);
    };
  }, []); // Array vazio para executar apenas uma vez no mount

  const markAsRead = async (notificationId: string) => {
    console.log('[NOTIFICATIONS] 📖 Marcando notificação como lida:', notificationId);
    try {
      const response = await fetch(`/api/notificacoes/${notificationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      console.log('[NOTIFICATIONS] 📡 Resposta markAsRead:', response.status);

      if (!response.ok) throw new Error("Erro ao marcar notificação");

      setNotifications((prev) => {
        const updated = prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n));
        console.log('[NOTIFICATIONS] ✅ Notificação atualizada:', notificationId);
        return updated;
      });
      setUnreadCount((prev) => {
        const newCount = Math.max(0, prev - 1);
        console.log('[NOTIFICATIONS] 📊 Unread count atualizado:', prev, '→', newCount);
        previousUnreadCountRef.current = newCount;
        return newCount;
      });
    } catch (err) {
      console.error('[NOTIFICATIONS] ❌ Erro ao marcar notificação como lida:', err);
      toast({
        title: "Erro",
        description: "Não foi possível marcar a notificação como lida",
        variant: "destructive",
      });
    }
  };

  const markAllAsRead = async () => {
    console.log('[NOTIFICATIONS] 📖📖 Marcando TODAS notificações como lidas...');
    try {
      const response = await fetch("/api/notificacoes/read-all", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      console.log('[NOTIFICATIONS] 📡 Resposta markAllAsRead:', response.status);

      if (!response.ok) throw new Error("Erro ao marcar todas as notificações");

      setNotifications((prev) => {
        const updated = prev.map((n) => ({ ...n, read: true }));
        console.log('[NOTIFICATIONS] ✅ Todas notificações marcadas como lidas:', prev.length, 'notificações');
        return updated;
      });
      setUnreadCount(0);
      previousUnreadCountRef.current = 0;
      console.log('[NOTIFICATIONS] 📊 Unread count zerado');
    } catch (err) {
      console.error('[NOTIFICATIONS] ❌ Erro ao marcar todas como lidas:', err);
      toast({
        title: "Erro",
        description: "Não foi possível marcar todas as notificações como lidas",
        variant: "destructive",
      });
    }
  };

  const deleteNotification = async (notificationId: string) => {
    console.log('[NOTIFICATIONS] 🗑️ Removendo notificação:', notificationId);
    try {
      const response = await fetch(`/api/notificacoes/${notificationId}`, {
        method: "DELETE",
        credentials: "include",
      });

      console.log('[NOTIFICATIONS] 📡 Resposta delete:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erro ao remover notificação");
      }

      setNotifications((prev) => {
        const filtered = prev.filter((n) => n.id !== notificationId);
        console.log('[NOTIFICATIONS] ✅ Notificação removida:', notificationId);
        console.log('[NOTIFICATIONS] 📊 Notificações restantes:', filtered.length);
        return filtered;
      });

      const notification = notifications.find((n) => n.id === notificationId);
      if (notification && !notification.read) {
        setUnreadCount((prev) => {
          const newCount = Math.max(0, prev - 1);
          console.log('[NOTIFICATIONS] 📊 Unread count após delete:', prev, '→', newCount);
          return newCount;
        });
      }
    } catch (err) {
      console.error('[NOTIFICATIONS] ❌ Erro ao remover notificação:', err);
      toast({
        title: "Erro",
        description: "Não foi possível remover a notificação",
        variant: "destructive",
      });
    }
  };

  const refresh = async () => {
    console.log('[NOTIFICATIONS] 🔄 Refresh manual solicitado...');
    setIsLoading(true);
    await fetchNotifications();
    console.log('[NOTIFICATIONS] ✅ Refresh concluído');
  };

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refresh,
  };
}
