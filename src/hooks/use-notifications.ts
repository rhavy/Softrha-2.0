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
  const [previousUnreadCount, setPreviousUnreadCount] = useState(0);
  const { toast } = useToast();
  const { play: playNotificationSound } = useNotificationSound(true);

  const fetchNotifications = useCallback(async () => {
    try {
      const response = await fetch("/api/notificacoes?unread=true&limit=20", {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Erro ao buscar notificações");
      const data = await response.json();
      const newUnreadCount = data.unreadCount || 0;
      
      // Tocar som se houver novas notificações
      if (newUnreadCount > previousUnreadCount && previousUnreadCount > 0) {
        playNotificationSound();
        toast({
          title: "Nova notificação!",
          description: `Você tem ${newUnreadCount} notificação(ões) não lida(s).`,
          duration: 3000,
        });
      }
      
      setNotifications(data.notifications || []);
      setUnreadCount(newUnreadCount);
      setPreviousUnreadCount(newUnreadCount);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [previousUnreadCount, playNotificationSound, toast]);

  useEffect(() => {
    fetchNotifications();
    
    // Polling a cada 30 segundos para novas notificações
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch("/api/notificacoes", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ notificationId }),
      });

      if (!response.ok) throw new Error("Erro ao marcar notificação");

      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      toast({
        title: "Erro",
        description: "Não foi possível marcar a notificação como lida",
        variant: "destructive",
      });
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await fetch("/api/notificacoes", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ markAllAsRead: true }),
      });

      if (!response.ok) throw new Error("Erro ao marcar todas as notificações");

      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      toast({
        title: "Erro",
        description: "Não foi possível marcar todas as notificações como lidas",
        variant: "destructive",
      });
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notificacoes?id=${notificationId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) throw new Error("Erro ao remover notificação");

      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
      if (!notifications.find((n) => n.id === notificationId)?.read) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (err) {
      toast({
        title: "Erro",
        description: "Não foi possível remover a notificação",
        variant: "destructive",
      });
    }
  };

  const refresh = async () => {
    setIsLoading(true);
    await fetchNotifications();
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
