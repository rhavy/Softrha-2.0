"use client";

import { useEffect, useRef, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";

/**
 * Hook para verificação contínua de emailVerified
 * - Se emailVerified = false → Redireciona para /conta-nao-verificada
 * - Se emailVerified = true → Permite acesso normal
 * Verifica a cada 5 segundos
 */
export function useEmailVerification() {
  const router = useRouter();
  const pathname = usePathname();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastCheckRef = useRef<number>(0);

  const checkEmailVerification = useCallback(async () => {
    // Evitar múltiplas requisições simultâneas (debounce de 3s)
    const now = Date.now();
    if (now - lastCheckRef.current < 3000) {
      return;
    }
    lastCheckRef.current = now;

    try {
      console.log("[EmailVerification] Verificando status do email...");
      
      const response = await fetch("/api/auth/me", {
        cache: "no-store",
      });
      
      if (!response.ok) {
        console.log("[EmailVerification] Erro na requisição ou não autenticado");
        return;
      }

      const userData = await response.json();
      
      console.log("[EmailVerification] emailVerified:", userData.emailVerified);

      // Se email NÃO for verificado, redirecionar para página de aviso
      if (userData.emailVerified === false) {
        console.log("[EmailVerification] ⚠️ Email NÃO verificado! Redirecionando para /conta-nao-verificada");
        router.push("/conta-nao-verificada");
      } else {
        console.log("[EmailVerification] ✅ Email verificado. Acesso permitido.");
      }
    } catch (error) {
      console.error("[EmailVerification] Erro:", error);
    }
  }, [router]);

  useEffect(() => {
    // Não executar verificação se já estiver na página de conta não verificada
    if (pathname === "/conta-nao-verificada") {
      return;
    }

    console.log("[EmailVerification] Iniciando verificação contínua (5s)");

    // Verificação inicial imediata
    checkEmailVerification();

    // Limpar intervalo anterior se existir
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Configurar verificação contínua a cada 5 segundos
    intervalRef.current = setInterval(() => {
      console.log("[EmailVerification] ⏰ Intervalo de 5s executado");
      checkEmailVerification();
    }, 5000);

    // Cleanup quando componente desmontar
    return () => {
      console.log("[EmailVerification] Limpando intervalo");
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [pathname, checkEmailVerification]);
}
