"use client";

import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState, Suspense } from "react";

function AprovacaoContent() {
  const searchParams = useSearchParams();
  const [budget, setBudget] = useState<any>(null);

  useEffect(() => {
    const budgetId = searchParams.get("id");
    if (budgetId) {
      fetch(`/api/orcamentos/${budgetId}`)
        .then((res) => res.json())
        .then((data) => setBudget(data))
        .catch(console.error);
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl"
      >
        <Card className="border-0 shadow-xl">
          <CardHeader className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="mx-auto mb-4"
            >
              <CheckCircle2 className="h-20 w-20 text-green-500" />
            </motion.div>
            <CardTitle className="text-3xl">Obrigado pela Aprovação! 🎉</CardTitle>
            <CardDescription className="text-lg">
              Sua proposta foi aprovada com sucesso
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <h3 className="font-semibold text-green-800 mb-2">
                {budget?.clientName}, obrigado por confiar em nosso trabalho!
              </h3>
              <p className="text-green-700">
                Nossa equipe entrará em contato em breve para dar início ao projeto.
                Você receberá todas as instruções por e-mail ou WhatsApp.
              </p>
            </div>

            {budget && (
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="bg-muted rounded-lg p-4">
                  <p className="text-sm text-muted-foreground">Projeto</p>
                  <p className="font-semibold">{budget.projectType}</p>
                </div>
                <div className="bg-muted rounded-lg p-4">
                  <p className="text-sm text-muted-foreground">Valor</p>
                  <p className="font-semibold">
                    R$ {budget.finalValue?.toLocaleString("pt-BR") || budget.estimatedMax?.toLocaleString("pt-BR")}
                  </p>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <p className="text-center font-medium">Próximos passos:</p>
              <ol className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">1</span>
                  Nossa equipe revisará sua aprovação
                </li>
                <li className="flex items-center gap-2">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">2</span>
                  Você receberá o contrato para assinatura
                </li>
                <li className="flex items-center gap-2">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">3</span>
                  Após assinar, enviaremos o link de pagamento da entrada (25%)
                </li>
                <li className="flex items-center gap-2">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">4</span>
                  Confirmado o pagamento, iniciamos o projeto!
                </li>
              </ol>
            </div>

            <div className="text-center pt-4">
              <Button variant="ghost" onClick={() => window.location.href = "/"}>
                <ArrowRight className="h-4 w-4 mr-2" />
                Voltar ao Início
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

export default function ObrigadoAprovacaoPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 p-4">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    }>
      <AprovacaoContent />
    </Suspense>
  );
}
