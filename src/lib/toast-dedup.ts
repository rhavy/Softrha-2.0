import { useEffect, useRef } from "react";

const TOAST_STORAGE_KEY = "softrha_shown_toasts";
const TOAST_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 horas

/**
 * Verifica se um toast já foi exibido recentemente
 * @param id Identificador único do toast
 * @returns true se já foi exibido nas últimas 24 horas
 */
export function hasToastBeenShown(id: string): boolean {
  if (typeof window === "undefined") return false;
  
  try {
    const stored = localStorage.getItem(TOAST_STORAGE_KEY);
    if (!stored) return false;

    const shownToasts: Record<string, number> = JSON.parse(stored);
    const timestamp = shownToasts[id];
    
    if (!timestamp) return false;
    
    // Verifica se expirou (24 horas)
    if (Date.now() - timestamp > TOAST_EXPIRY_MS) {
      delete shownToasts[id];
      localStorage.setItem(TOAST_STORAGE_KEY, JSON.stringify(shownToasts));
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Erro ao verificar toast:", error);
    return false;
  }
}

/**
 * Marca um toast como exibido
 * @param id Identificador único do toast
 */
export function markToastAsShown(id: string): void {
  if (typeof window === "undefined") return;
  
  try {
    const stored = localStorage.getItem(TOAST_STORAGE_KEY);
    const shownToasts: Record<string, number> = stored ? JSON.parse(stored) : {};
    
    shownToasts[id] = Date.now();
    localStorage.setItem(TOAST_STORAGE_KEY, JSON.stringify(shownToasts));
  } catch (error) {
    console.error("Erro ao marcar toast:", error);
  }
}

/**
 * Hook para verificar e marcar toasts como exibidos
 * @param id Identificador único do toast
 * @returns true se o toast já foi exibido
 */
export function useToastShown(id: string): boolean {
  const hasShownRef = useRef<boolean>(false);
  
  useEffect(() => {
    hasShownRef.current = hasToastBeenShown(id);
  }, [id]);
  
  const markShown = () => {
    markToastAsShown(id);
    hasShownRef.current = true;
  };
  
  return hasShownRef.current;
}

/**
 * Limpa todos os toasts expirados do storage
 */
export function cleanupExpiredToasts(): void {
  if (typeof window === "undefined") return;
  
  try {
    const stored = localStorage.getItem(TOAST_STORAGE_KEY);
    if (!stored) return;

    const shownToasts: Record<string, number> = JSON.parse(stored);
    const now = Date.now();
    let hasChanges = false;
    
    Object.keys(shownToasts).forEach((id) => {
      if (now - shownToasts[id] > TOAST_EXPIRY_MS) {
        delete shownToasts[id];
        hasChanges = true;
      }
    });
    
    if (hasChanges) {
      localStorage.setItem(TOAST_STORAGE_KEY, JSON.stringify(shownToasts));
    }
  } catch (error) {
    console.error("Erro ao limpar toasts expirados:", error);
  }
}

// Limpeza automática ao carregar a página
if (typeof window !== "undefined") {
  cleanupExpiredToasts();
}
