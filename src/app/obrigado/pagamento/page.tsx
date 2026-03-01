"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, DollarSign, ArrowRight, Sparkles, LoaderCircle, AlertTriangle } from "lucide-react";
import { FuturisticBackground } from "@/components/ui/futuristic-background";
import { useToast } from "@/hooks/use-toast";

function PagamentoContent() {
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<"pending" | "processing" | "confirmed" | "error">("pending");
  const [budgetId, setBudgetId] = useState<string | null>(null);
  const [projectId, setProjectId] = useState<string | null>(null);

  const sessionId = searchParams.get("session_id");
  const paymentLinkId = searchParams.get("payment_link_id"); // Pode ser budgetId ou projectId

  useEffect(() => {
    if (sessionId || paymentLinkId) {
      setIsLoading(false);
      processPayment();
    } else {
      setPaymentStatus("error");
      setIsLoading(false);
    }
  }, [sessionId, paymentLinkId]);

  const processPayment = async () => {
    if (!paymentLinkId) return;

    setIsProcessing(true);
    setPaymentStatus("processing");

    try {
      // Primeiro, tentar buscar como pagamento final (projeto)
      let stripePaymentLinkId = sessionId;
      let isFinalPayment = false;

      // Tentar buscar payment link do projeto (pagamento final 75%)
      const projectResponse = await fetch(`/api/projetos/${paymentLinkId}/pagamento-final`, {
        method: "GET",
      });

      if (projectResponse.ok) {
        const paymentData = await projectResponse.json();
        if (paymentData.paymentLink) {
          stripePaymentLinkId = paymentData.paymentLink;
          isFinalPayment = true;
          console.log("[Pagamento] Identificado como pagamento final do projeto:", paymentLinkId);
        }
      }

      // Se não encontrou como projeto, tentar como orçamento (entrada 25%)
      if (!isFinalPayment) {
        const budgetResponse = await fetch(`/api/orcamentos/${paymentLinkId}/pagamento`, {
          method: "GET",
        });

        if (budgetResponse.ok) {
          const paymentData = await budgetResponse.json();
          if (paymentData.paymentLink) {
            stripePaymentLinkId = paymentData.paymentLink;
            isFinalPayment = false;
            console.log("[Pagamento] Identificado como pagamento de entrada do orçamento:", paymentLinkId);
          }
        }
      }

      // Chamar endpoint para processar pagamento
      const response = await fetch("/api/pagamento/processar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          paymentLinkId: stripePaymentLinkId,
          budgetId: isFinalPayment ? null : paymentLinkId,
          projectId: isFinalPayment ? paymentLinkId : null,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setPaymentStatus("confirmed");
        setBudgetId(result.budgetId);
        setProjectId(result.projectId);

        toast({
          title: "Pagamento confirmado!",
          description: result.message || "Seu pagamento foi processado com sucesso.",
          variant: "default",
        });

        // Redirecionar para a página do projeto após 2 segundos
        if (result.projectId) {
          setTimeout(() => {
            window.location.href = `/dashboard/projetos/${result.projectId}`;
          }, 2000);
        } else if (result.budgetId) {
          setTimeout(() => {
            window.location.href = `/dashboard/orcamentos/${result.budgetId}`;
          }, 2000);
        }
      } else {
        setPaymentStatus("error");
        toast({
          title: "Erro ao processar pagamento",
          description: result.error || "Não foi possível confirmar o pagamento.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Erro ao processar pagamento:", error);
      setPaymentStatus("error");
      toast({
        title: "Erro",
        description: "Não foi possível processar o pagamento. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen relative">
        <FuturisticBackground />
        <div className="flex-1 flex items-center justify-center p-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-8"
          >
            <LoaderCircle className="h-16 w-16 text-cyan-400 animate-spin mx-auto" />
            <p className="text-xl text-cyan-100">Verificando pagamento...</p>
          </motion.div>
        </div>
      </div>
    );
  }

  if (paymentStatus === "confirmed") {
    return (
      <div className="flex min-h-screen relative">
        <FuturisticBackground />
        <div className="flex-1 flex items-center justify-center p-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center space-y-8 max-w-3xl"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Badge variant="secondary" className="px-4 py-2 text-sm border border-cyan-400/30 bg-cyan-500/20 backdrop-blur-sm text-cyan-100 mb-6">
                <Sparkles className="h-3 w-3 mr-2 text-cyan-300" />
                Pagamento Confirmado
              </Badge>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex justify-center mb-6">
                <div className="h-24 w-24 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 flex items-center justify-center shadow-lg shadow-cyan-500/30">
                  <CheckCircle2 className="h-12 w-12 text-white" />
                </div>
              </div>

              <h1 className="text-5xl md:text-7xl font-bold mb-6">
                <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-300 bg-clip-text text-transparent drop-shadow-lg">
                  Pagamento Recebido!
                </span>
              </h1>

              <p className="text-xl text-cyan-100/80 mb-8 drop-shadow-md">
                Seu pagamento foi confirmado. Vamos iniciar o projeto imediatamente!
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex items-center justify-center gap-4 p-6 rounded-xl bg-slate-900/50 backdrop-blur-sm border border-cyan-400/20"
            >
              <DollarSign className="h-12 w-12 text-cyan-300" />
              <div className="text-left">
                <p className="font-semibold text-white">Próximo Passo</p>
                <p className="text-sm text-cyan-100/70">
                  Você receberá um email com os detalhes do projeto.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col sm:flex-row gap-4 justify-center pt-8"
            >
              <Link href="/">
                <Button size="lg" className="gap-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white shadow-lg shadow-cyan-500/30">
                  <ArrowRight className="h-5 w-5" />
                  Página Inicial
                </Button>
              </Link>
              {projectId && (
                <Link href={`/dashboard/projetos/${projectId}`}>
                  <Button variant="outline" size="lg" className="gap-2 border-cyan-400/50 hover:bg-cyan-500/20 text-cyan-100 hover:text-white backdrop-blur-sm">
                    <DollarSign className="h-5 w-5" />
                    Ver Projeto
                  </Button>
                </Link>
              )}
              {budgetId && (
                <Link href={`/dashboard/orcamentos/${budgetId}`}>
                  <Button variant="outline" size="lg" className="gap-2 border-cyan-400/50 hover:bg-cyan-500/20 text-cyan-100 hover:text-white backdrop-blur-sm">
                    <DollarSign className="h-5 w-5" />
                    Ver Orçamento
                  </Button>
                </Link>
              )}
            </motion.div>
          </motion.div>
        </div>
      </div>
    );
  }

  if (paymentStatus === "error") {
    return (
      <div className="flex min-h-screen relative">
        <FuturisticBackground />
        <div className="flex-1 flex items-center justify-center p-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-8 max-w-3xl"
          >
            <Badge variant="destructive" className="px-4 py-2 text-sm mb-6">
              <AlertTriangle className="h-3 w-3 mr-2" />
              Erro no Pagamento
            </Badge>

            <div className="h-24 w-24 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="h-12 w-12 text-red-500" />
            </div>

            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-white">
              Não foi possível confirmar
            </h1>

            <p className="text-xl text-cyan-100/80 mb-8">
              Não conseguimos confirmar seu pagamento. Isso pode acontecer se o webhook não estiver configurado.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
              <Link href="/">
                <Button size="lg" variant="outline" className="gap-2 border-cyan-400/50 text-cyan-100">
                  <ArrowRight className="h-5 w-5" />
                  Voltar ao início
                </Button>
              </Link>
              <Link href="/contato">
                <Button size="lg" className="gap-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white">
                  <Sparkles className="h-5 w-5" />
                  Falar com suporte
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // Status: processing
  return (
    <div className="flex min-h-screen relative">
      <FuturisticBackground />
      <div className="flex-1 flex items-center justify-center p-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-8"
        >
          <LoaderCircle className="h-16 w-16 text-cyan-400 animate-spin mx-auto" />
          <p className="text-xl text-cyan-100">Processando pagamento...</p>
          <p className="text-sm text-cyan-100/60">
            Isso pode levar alguns instantes.
          </p>
        </motion.div>
      </div>
    </div>
  );
}

export default function ObrigadoPagamentoPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <LoaderCircle className="h-16 w-16 text-cyan-400 animate-spin" />
      </div>
    }>
      <PagamentoContent />
    </Suspense>
  );
}
