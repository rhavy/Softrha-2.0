import { useEffect, useRef } from 'react';

/**
 * Hook para tocar som de notificação usando Web Audio API
 * Não requer arquivo externo - gera o som programaticamente
 */
export function useNotificationSound(enabled: boolean = true) {
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    // Inicializar AudioContext
    if (typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        audioContextRef.current = new AudioCtx();
      }
    }

    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  /**
   * Toca um som de notificação (ding!)
   */
  const play = () => {
    if (!enabled || !audioContextRef.current) return;

    const ctx = audioContextRef.current;
    
    // Retomar contexto se estiver suspenso (política do navegador)
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    // Criar oscilador para o som
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    // Configurar som (tipo sine para um "ding" suave)
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(523.25, ctx.currentTime); // C5 (Dó)
    oscillator.frequency.exponentialRampToValueAtTime(1046.5, ctx.currentTime + 0.1); // C6 (uma oitava acima)

    // Configurar volume (fade out)
    gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);

    // Conectar nós
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    // Tocar som
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.5);

    // Tocar segundo tom harmonioso após breve delay
    setTimeout(() => {
      const oscillator2 = ctx.createOscillator();
      const gainNode2 = ctx.createGain();

      oscillator2.type = 'sine';
      oscillator2.frequency.setValueAtTime(659.25, ctx.currentTime); // E5 (Mi)
      oscillator2.frequency.exponentialRampToValueAtTime(1318.51, ctx.currentTime + 0.1); // E6

      gainNode2.gain.setValueAtTime(0.2, ctx.currentTime);
      gainNode2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);

      oscillator2.connect(gainNode2);
      gainNode2.connect(ctx.destination);

      oscillator2.start(ctx.currentTime);
      oscillator2.stop(ctx.currentTime + 0.4);
    }, 100);
  };

  return { play };
}
