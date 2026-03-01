import { useState, useEffect, useCallback, useRef } from "react";
import { useToast } from "@/hooks/use-toast";

export interface ContactMessageNotification {
  id: string;
  name: string;
  email: string;
  company: string;
  projectType: string;
  message: string;
  status: string;
  createdAt: string;
}

interface UseContactMessagesReturn {
  messages: ContactMessageNotification[];
  unreadCount: number;
  isLoading: boolean;
  error: Error | null;
  markAsContacted: (messageId: string) => Promise<void>;
  markAsResolved: (messageId: string) => Promise<void>;
  deleteMessage: (messageId: string) => Promise<void>;
  refresh: () => Promise<void>;
}

export function useContactMessages(): UseContactMessagesReturn {
  const [messages, setMessages] = useState<ContactMessageNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const previousUnreadCountRef = useRef(0);
  const { toast } = useToast();

  const fetchMessages = useCallback(async () => {
    try {
      console.log('[CONTACT_MESSAGES] 📥 Buscando mensagens pendentes...');
      const response = await fetch("/api/contact-messages?status=pending", {
        credentials: "include",
      });

      console.log('[CONTACT_MESSAGES] 📡 Status:', response.status);

      if (response.status === 401) {
        console.warn('[CONTACT_MESSAGES] ⚠️ Usuário não autenticado');
        setMessages([]);
        setUnreadCount(0);
        return;
      }

      if (response.status === 403) {
        console.warn('[CONTACT_MESSAGES] ⚠️ Usuário não tem permissão (requer ADMIN)');
        setMessages([]);
        setUnreadCount(0);
        return;
      }

      if (!response.ok) {
        throw new Error(`Erro ao buscar mensagens: ${response.status}`);
      }
      const data = await response.json();
      const pendingMessages = data.messages || [];

      console.log('[CONTACT_MESSAGES] ✅ Mensagens recebidas:', pendingMessages.length);

      setMessages(pendingMessages);
      setUnreadCount(pendingMessages.length);

      // Notificar se houver novas mensagens pendentes
      if (pendingMessages.length > previousUnreadCountRef.current && previousUnreadCountRef.current > 0) {
        const newMessagesCount = pendingMessages.length - previousUnreadCountRef.current;
        console.log('[CONTACT_MESSAGES] 🔔 Novas mensagens:', newMessagesCount);
        toast({
          title: "📬 Novas mensagens!",
          description: `${newMessagesCount} nova(s) mensagem(s) de cliente(s)`,
          variant: "default",
        });
      }

      previousUnreadCountRef.current = pendingMessages.length;
    } catch (err) {
      console.error('[CONTACT_MESSAGES] ❌ Erro ao buscar mensagens:', err);
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchMessages();

    // Polling a cada 5 segundos para novas mensagens
    const interval = setInterval(() => {
      fetchMessages();
    }, 5000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  const markAsContacted = async (messageId: string) => {
    try {
      const response = await fetch("/api/contact-messages", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          id: messageId,
          status: "contacted",
        }),
      });

      if (!response.ok) throw new Error("Erro ao atualizar mensagem");

      setMessages((prev) => {
        const updated = prev.filter((m) => m.id !== messageId);
        return updated;
      });
      setUnreadCount((prev) => {
        const newCount = Math.max(0, prev - 1);
        previousUnreadCountRef.current = newCount;
        return newCount;
      });

      toast({
        title: "Mensagem atualizada!",
        description: "Status alterado para 'Contatado'",
      });
    } catch (err) {
      console.error('[CONTACT_MESSAGES] ❌ Erro ao atualizar mensagem:', err);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a mensagem",
        variant: "destructive",
      });
    }
  };

  const markAsResolved = async (messageId: string) => {
    try {
      const response = await fetch("/api/contact-messages", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          id: messageId,
          status: "resolved",
        }),
      });

      if (!response.ok) throw new Error("Erro ao atualizar mensagem");

      setMessages((prev) => {
        const updated = prev.filter((m) => m.id !== messageId);
        return updated;
      });
      setUnreadCount((prev) => {
        const newCount = Math.max(0, prev - 1);
        previousUnreadCountRef.current = newCount;
        return newCount;
      });

      toast({
        title: "Mensagem resolvida!",
        description: "Atendimento finalizado com sucesso",
      });
    } catch (err) {
      console.error('[CONTACT_MESSAGES] ❌ Erro ao resolver mensagem:', err);
      toast({
        title: "Erro",
        description: "Não foi possível resolver a mensagem",
        variant: "destructive",
      });
    }
  };

  const deleteMessage = async (messageId: string) => {
    try {
      const response = await fetch(`/api/contact-messages?id=${messageId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) throw new Error("Erro ao excluir mensagem");

      setMessages((prev) => prev.filter((m) => m.id !== messageId));

      const message = messages.find((m) => m.id === messageId);
      if (message) {
        setUnreadCount((prev) => {
          const newCount = Math.max(0, prev - 1);
          previousUnreadCountRef.current = newCount;
          return newCount;
        });
      }

      toast({
        title: "Mensagem excluída!",
        description: "A mensagem foi removida",
      });
    } catch (err) {
      console.error('[CONTACT_MESSAGES] ❌ Erro ao excluir mensagem:', err);
      toast({
        title: "Erro",
        description: "Não foi possível excluir a mensagem",
        variant: "destructive",
      });
    }
  };

  const refresh = async () => {
    setIsLoading(true);
    await fetchMessages();
  };

  return {
    messages,
    unreadCount,
    isLoading,
    error,
    markAsContacted,
    markAsResolved,
    deleteMessage,
    refresh,
  };
}
