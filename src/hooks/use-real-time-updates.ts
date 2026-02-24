import { useEffect, useRef, useCallback } from "react";

interface UseRealTimeUpdatesOptions {
  enabled?: boolean;
  interval?: number;
  onNotificationsUpdate?: (data: any) => void;
  onResourceUpdate?: (data: any) => void;
}

interface UseRealTimeUpdatesReturn {
  refresh: () => Promise<void>;
  lastUpdate: Date | null;
  hasUpdates: boolean;
}

/**
 * Hook para verificação de atualizações em tempo real
 *
 * @param pageType - Tipo da página: 'clientes', 'orcamentos', 'projetos'
 * @param options - Opções de configuração
 */
export function useRealTimeUpdates(
  pageType: "clientes" | "orcamentos" | "projetos" | "dashboard",
  options: UseRealTimeUpdatesOptions = {}
): UseRealTimeUpdatesReturn {
  const {
    enabled = true,
    interval = 10000, // 10 segundos
    onNotificationsUpdate,
    onResourceUpdate,
  } = options;

  const lastNotificationsRef = useRef<string>("");
  const lastResourceHashRef = useRef<string>("");
  const lastUpdateRef = useRef<Date | null>(null);
  const hasUpdatesRef = useRef(false);

  // Função genérica para verificar endpoint (definida primeiro para evitar hoisting)
  const checkResourceForEndpoint = useCallback(async (endpoint: string, resourceType: string) => {
    try {
      const response = await fetch(endpoint, {
        credentials: "include",
        cache: "no-store",
      });

      if (!response.ok) return;

      const data = await response.json();

      let hashExtractor: (data: any) => string;

      if (resourceType === "clientes") {
        hashExtractor = (d: any) => {
          const sorted = [...(d || [])].sort((a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          return JSON.stringify({
            count: sorted.length,
            lastUpdate: sorted[0]?.updatedAt,
            ids: sorted.slice(0, 10).map((c: any) => c.id).join(","),
          });
        };
      } else if (resourceType === "orcamentos") {
        hashExtractor = (d: any) => {
          const sorted = [...(d || [])].sort((a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          return JSON.stringify({
            count: sorted.length,
            lastUpdate: sorted[0]?.updatedAt,
            statuses: sorted.map((b: any) => `${b.id}:${b.status}`).join("|"),
          });
        };
      } else if (resourceType === "projetos") {
        hashExtractor = (d: any) => {
          const sorted = [...(d || [])].sort((a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          return JSON.stringify({
            count: sorted.length,
            lastUpdate: sorted[0]?.updatedAt,
            statuses: sorted.map((p: any) => `${p.id}:${p.status}`).join("|"),
          });
        };
      } else {
        return;
      }

      const currentHash = hashExtractor(data);

      if (currentHash !== lastResourceHashRef.current) {
        console.log(`[REAL-TIME] 📊 ${resourceType} atualizados na página: ${pageType}`);
        lastResourceHashRef.current = currentHash;
        hasUpdatesRef.current = true;
        lastUpdateRef.current = new Date();
        onResourceUpdate?.({ type: resourceType, data });
      }
    } catch (error) {
      console.error(`[REAL-TIME] Erro ao verificar ${resourceType}:`, error);
    }
  }, [pageType, onResourceUpdate]);

  // Verificar atualizações nas notificações
  const checkNotifications = useCallback(async () => {
    try {
      const response = await fetch("/api/notificacoes?unread=true&limit=20", {
        credentials: "include",
        cache: "no-store",
      });

      if (!response.ok) return;

      const data = await response.json();
      const currentHash = JSON.stringify({
        count: data.unreadCount,
        ids: data.notifications?.map((n: any) => n.id).sort().join(","),
      });

      if (currentHash !== lastNotificationsRef.current) {
        console.log(`[REAL-TIME] 📬 Notificações atualizadas na página: ${pageType}`);
        lastNotificationsRef.current = currentHash;
        hasUpdatesRef.current = true;
        lastUpdateRef.current = new Date();
        onNotificationsUpdate?.(data);
      }
    } catch (error) {
      console.error("[REAL-TIME] Erro ao verificar notificações:", error);
    }
  }, [pageType, onNotificationsUpdate]);

  // Verificar atualizações no recurso específico da página
  const checkResource = useCallback(async () => {
    try {
      let endpoint = "";

      switch (pageType) {
        case "clientes":
          endpoint = "/api/clientes?limit=100";
          break;

        case "orcamentos":
          endpoint = "/api/orcamentos";
          break;

        case "projetos":
          endpoint = "/api/projetos";
          break;

        case "dashboard":
          // Dashboard verifica todos os recursos
          await Promise.all([
            checkResourceForEndpoint("/api/clientes?limit=50", "clientes"),
            checkResourceForEndpoint("/api/orcamentos", "orcamentos"),
            checkResourceForEndpoint("/api/projetos", "projetos"),
          ]);
          return;

        default:
          return;
      }

      if (endpoint) {
        await checkResourceForEndpoint(endpoint, pageType);
      }
    } catch (error) {
      console.error("[REAL-TIME] Erro ao verificar recurso:", error);
    }
  }, [pageType, checkResourceForEndpoint]);

  // Refresh manual
  const refresh = useCallback(async () => {
    console.log(`[REAL-TIME] 🔄 Refresh manual solicitado na página: ${pageType}`);
    await Promise.all([checkNotifications(), checkResource()]);
  }, [checkNotifications, checkResource, pageType]);

  // Efeito para polling
  useEffect(() => {
    if (!enabled) {
      console.log(`[REAL-TIME] ⏸️ Verificação desativada para: ${pageType}`);
      return;
    }

    console.log(`[REAL-TIME] 🚀 Hook inicializado para página: ${pageType}`);

    // Executar verificação inicial
    refresh();

    // Configurar polling
    const intervalId = setInterval(() => {
      console.log(`[REAL-TIME] ⏰ Polling: Verificando atualizações em ${pageType}...`);
      refresh();
    }, interval);

    console.log(`[REAL-TIME] ⏱️ Polling configurado para ${interval}ms`);

    // Cleanup
    return () => {
      console.log(`[REAL-TIME] 🧹 Cleanup: Limpando intervalo de polling para ${pageType}`);
      clearInterval(intervalId);
    };
  }, [enabled, interval, pageType, refresh]);

  return {
    refresh,
    lastUpdate: lastUpdateRef.current,
    hasUpdates: hasUpdatesRef.current,
  };
}
