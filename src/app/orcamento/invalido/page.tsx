"use client";

import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { XCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Suspense } from "react";

function InvalidoContent() {
  const searchParams = useSearchParams();
  const reason = searchParams.get("reason");

  const messages: Record<string, { title: string; description: string }> = {
    not_found: {
      title: "Link Inválido",
      description: "Este link de aprovação não foi encontrado ou já foi utilizado.",
    },
    expired: {
      title: "Link Expirado",
      description: "Este link de aprovação expirou (válido por 7 dias). Entre em contato para receber um novo link.",
    },
    error: {
      title: "Erro",
      description: "Ocorreu um erro ao processar sua aprovação. Tente novamente ou entre em contato.",
    },
  };

  const message = reason && messages[reason] 
    ? messages[reason] 
    : {
        title: "Link Inválido",
        description: "Não foi possível processar sua aprovação.",
      };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-rose-100 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Card className="border-0 shadow-xl">
          <CardHeader className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="mx-auto mb-4"
            >
              <XCircle className="h-20 w-20 text-red-500" />
            </motion.div>
            <CardTitle className="text-2xl">{message.title}</CardTitle>
            <CardDescription>{message.description}</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button variant="ghost" onClick={() => window.location.href = "/"}>
              <ArrowRight className="h-4 w-4 mr-2" />
              Voltar ao Início
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

export default function OrcamentoInvalidoPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-rose-100 p-4">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    }>
      <InvalidoContent />
    </Suspense>
  );
}
