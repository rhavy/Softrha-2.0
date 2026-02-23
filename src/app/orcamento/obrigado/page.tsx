"use client";

import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle2, XCircle, ArrowRight, Mail, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Suspense } from "react";

function ObrigadoContent() {
  const searchParams = useSearchParams();
  const status = searchParams.get("status");
  const isAccepted = status === "accepted";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
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
              {isAccepted ? (
                <CheckCircle2 className="h-20 w-20 text-green-500" />
              ) : (
                <XCircle className="h-20 w-20 text-red-500" />
              )}
            </motion.div>
            <CardTitle className="text-3xl">
              {isAccepted ? "Obrigado pela Aprovação! 🎉" : "Proposta Negada"}
            </CardTitle>
            <CardDescription className="text-lg">
              {isAccepted 
                ? "Sua proposta foi aceita com sucesso" 
                : "Sua decisão foi registrada"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {isAccepted ? (
              <>
                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                  <h3 className="font-semibold text-green-800 mb-2">
                    Obrigado por confiar em nosso trabalho!
                  </h3>
                  <p className="text-green-700">
                    Nossa equipe entrará em contato em breve para dar início ao projeto.
                    Você receberá todas as instruções por e-mail ou WhatsApp.
                  </p>
                </div>

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

                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <Button variant="outline" className="flex-1" onClick={() => window.open("mailto:contato@softrha.com", "_blank")}>
                    <Mail className="h-4 w-4 mr-2" />
                    Fale Conosco por E-mail
                  </Button>
                  <Button variant="outline" className="flex-1" onClick={() => window.open("https://wa.me/5511999999999", "_blank")}>
                    <Phone className="h-4 w-4 mr-2" />
                    Fale Conosco por WhatsApp
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                  <h3 className="font-semibold text-red-800 mb-2">
                    Sentimos muito que tenha decidido não prosseguir
                  </h3>
                  <p className="text-red-700">
                    Sua resposta foi registrada em nosso sistema. 
                    Caso mude de ideia ou tenha alguma dúvida, estamos à disposição.
                  </p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <h3 className="font-semibold text-blue-800 mb-2">
                    Podemos ajudar de outra forma?
                  </h3>
                  <p className="text-blue-700">
                    Se você teve dúvidas sobre a proposta ou se o orçamento não estava dentro do esperado,
                    entre em contato conosco. Podemos revisar a proposta ou discutir alternativas.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <Button variant="outline" className="flex-1" onClick={() => window.open("mailto:contato@softrha.com", "_blank")}>
                    <Mail className="h-4 w-4 mr-2" />
                    Entrar em Contato
                  </Button>
                  <Button variant="outline" className="flex-1" onClick={() => window.location.href = "/orcamento"}>
                    Fazer Nova Simulação
                  </Button>
                </div>
              </>
            )}

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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    }>
      <ObrigadoContent />
    </Suspense>
  );
}
