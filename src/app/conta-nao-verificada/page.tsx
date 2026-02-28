"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FuturisticBackground } from "@/components/ui/futuristic-background";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Mail,
  ShieldAlert,
  Home,
  LogOut,
  Timer,
} from "lucide-react";

export default function ContaNaoVerificadaPage() {
  const router = useRouter();
  const [userData, setUserData] = useState<{ name: string; email: string } | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  // Função para verificar status do email
  const checkEmailVerification = async () => {
    try {
      const response = await fetch("/api/auth/me", {
        cache: "no-store",
      });
      
      if (!response.ok) {
        return;
      }

      const userData = await response.json();
      
      console.log("[CONTA-NAO-VERIFICADA] Verificando emailVerified:", userData.emailVerified);
      
      // Se email foi verificado, redirecionar para dashboard
      if (userData.emailVerified === true) {
        console.log("[CONTA-NAO-VERIFICADA] Email verificado! Redirecionando para dashboard...");
        router.push("/dashboard");
      }
    } catch (error) {
      console.error("[CONTA-NAO-VERIFICADA] Erro ao verificar:", error);
    }
  };

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    // Busca inicial dos dados do usuário
    const fetchUser = async () => {
      try {
        const response = await fetch("/api/auth/me");
        if (response.ok) {
          const userData = await response.json();
          setUserData({ name: userData.name, email: userData.email });
          
          // Verifica se já está verificado
          if (userData.emailVerified === true) {
            router.push("/dashboard");
            return;
          }
        } else {
          router.push("/login");
          return;
        }
      } catch (error) {
        console.error("Erro ao buscar usuário:", error);
        router.push("/login");
        return;
      } finally {
        setIsChecking(false);
      }
    };

    fetchUser();

    // Verificação contínua a cada 5 segundos
    intervalId = setInterval(checkEmailVerification, 5000);

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [router]);

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center relative">
        <FuturisticBackground />
        <div className="text-center relative z-10">
          <div className="animate-spin h-12 w-12 border-4 border-cyan-400 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-cyan-100 font-medium">Verificando sua conta...</p>
        </div>
      </div>
    );
  }

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      // Aguardar um pouco para o logout ser processado
      await new Promise(resolve => setTimeout(resolve, 300));
      router.push("/login");
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
      router.push("/login");
    }
  };

  const handleGoHome = () => {
    router.push("/");
  };

  if (!userData) {
    return (
      <div className="min-h-screen flex items-center justify-center relative">
        <FuturisticBackground />
        <div className="animate-spin h-8 w-8 border-4 border-cyan-400 border-t-transparent rounded-full relative z-10" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      <FuturisticBackground />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl relative z-10"
      >
        <Card className="border-cyan-400/20 shadow-2xl overflow-hidden bg-slate-900/50 backdrop-blur-sm">
          {/* Header with futuristic gradient */}
          <div className="bg-gradient-to-r from-cyan-500 to-blue-500 p-6">
            <div className="flex items-center justify-center gap-3 text-white">
              <ShieldAlert className="h-12 w-12" />
              <CardTitle className="text-2xl font-bold text-white drop-shadow-lg">
                Conta em Análise
              </CardTitle>
            </div>
          </div>

          <CardHeader className="text-center pb-2">
            <div className="flex justify-center mb-4">
              <div className="h-20 w-20 rounded-full bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center relative backdrop-blur-sm">
                <AlertCircle className="h-10 w-10 text-cyan-300" />
                {/* Indicador de verificação automática */}
                <div className="absolute -bottom-1 -right-1">
                  <div className="animate-ping h-4 w-4 bg-cyan-400 rounded-full opacity-75"></div>
                </div>
                <div className="absolute -bottom-1 -right-1">
                  <div className="h-4 w-4 bg-cyan-400 rounded-full"></div>
                </div>
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-white">
              Olá, {userData.name}!
            </CardTitle>
            <CardDescription className="text-base text-cyan-100/70">
              {userData.email}
            </CardDescription>

            {/* Status de verificação automática */}
            <div className="mt-4 flex items-center justify-center gap-2 text-sm text-cyan-300 bg-cyan-500/20 border border-cyan-400/30 px-4 py-2 rounded-full backdrop-blur-sm">
              <div className="animate-spin h-3 w-3 border-2 border-cyan-300 border-t-transparent rounded-full" />
              <span>Verificando sua conta automaticamente a cada 5 segundos...</span>
            </div>
          </CardHeader>

          <CardContent className="space-y-6 pt-6">
            {/* Mensagem Principal */}
            <div className="bg-blue-500/20 border border-cyan-400/30 rounded-lg p-4 backdrop-blur-sm">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-6 w-6 text-cyan-300 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-white mb-1">
                    Seu cadastro foi recebido com sucesso!
                  </p>
                  <p className="text-sm text-cyan-100/70">
                    Todos os dados foram registrados corretamente em nosso sistema.
                  </p>
                </div>
              </div>
            </div>

            {/* Status da Conta */}
            <div className="bg-amber-500/20 border border-amber-400/30 rounded-lg p-4 backdrop-blur-sm">
              <div className="flex items-start gap-3">
                <Clock className="h-6 w-6 text-amber-300 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-white mb-1">
                    Perfil temporariamente bloqueado
                  </p>
                  <p className="text-sm text-cyan-100/70">
                    Sua conta está passando por uma breve análise de segurança.
                  </p>
                </div>
              </div>
            </div>

            {/* Informações para Cadastro Novo */}
            <div className="border border-cyan-400/30 rounded-lg p-5 bg-cyan-500/10 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-3">
                <Timer className="h-5 w-5 text-cyan-300" />
                <h3 className="font-bold text-white">
                  📋 Se seu cadastro é NOVO:
                </h3>
              </div>
              <div className="space-y-2 text-sm text-cyan-100/70">
                <p className="flex items-center gap-2">
                  <span className="text-cyan-300">✓</span>
                  <span>Fique tranquilo! Esta é uma verificação de rotina.</span>
                </p>
                <p className="flex items-center gap-2">
                  <span className="text-cyan-300">✓</span>
                  <span>Nossa equipe está analisando seu perfil.</span>
                </p>
                <p className="flex items-center gap-2">
                  <span className="text-cyan-300">✓</span>
                  <span>O processo leva até <strong className="text-white">72 horas úteis</strong>.</span>
                </p>
                <p className="flex items-center gap-2">
                  <span className="text-cyan-300">✓</span>
                  <span>Você receberá um email quando a análise for concluída.</span>
                </p>
              </div>
            </div>

            {/* Informações para Conta Antiga */}
            <div className="border border-red-400/30 rounded-lg p-5 bg-red-500/10 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-3">
                <AlertCircle className="h-5 w-5 text-red-300" />
                <h3 className="font-bold text-white">
                  ⚠️ Se sua conta JÁ ESTAVA ATIVA:
                </h3>
              </div>
              <div className="space-y-2 text-sm text-cyan-100/70">
                <p>
                  Seu perfil pode ter infringido alguma regra de uso da plataforma.
                </p>
                <p className="font-semibold text-white">
                  📧 Um membro da nossa equipe entrará em contato em breve para esclarecer a situação.
                </p>
              </div>
            </div>

            {/* Contato de Suporte */}
            <div className="bg-slate-800/50 border border-cyan-400/20 rounded-lg p-4 backdrop-blur-sm">
              <div className="flex items-start gap-3">
                <Mail className="h-6 w-6 text-cyan-300 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-white mb-1">
                    Precisa de ajuda?
                  </p>
                  <p className="text-sm text-cyan-100/70 mb-2">
                    Se passaram mais de <strong className="text-white">72 horas úteis</strong> e você não teve retorno:
                  </p>
                  <a
                    href="mailto:suporte@softrha.com.br"
                    className="inline-flex items-center gap-2 text-cyan-300 hover:text-cyan-200 transition-colors font-medium"
                  >
                    <Mail className="h-4 w-4" />
                    suporte@softrha.com.br
                  </a>
                </div>
              </div>
            </div>

            {/* Status Badge */}
            <div className="flex justify-center">
              <Badge variant="secondary" className="gap-2 px-4 py-2 text-sm border-cyan-400/30 bg-cyan-500/20 text-cyan-100 backdrop-blur-sm">
                <Clock className="h-4 w-4" />
                Status: Aguardando Análise
              </Badge>
            </div>

            {/* Botões de Ação */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button
                variant="outline"
                className="flex-1 border-cyan-400/50 hover:bg-cyan-500/20 text-cyan-100 hover:text-white backdrop-blur-sm"
                onClick={handleGoHome}
              >
                <Home className="h-4 w-4 mr-2" />
                Voltar ao Início
              </Button>
              <Button
                variant="destructive"
                className="flex-1 bg-red-500 hover:bg-red-400 text-white shadow-lg shadow-red-500/30"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sair da Conta
              </Button>
            </div>

            {/* Tempo Estimado */}
            <div className="text-center pt-2">
              <p className="text-xs text-cyan-100/60">
                ⏱️ Tempo estimado de análise: <strong className="text-cyan-100">24 a 72 horas úteis</strong>
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
