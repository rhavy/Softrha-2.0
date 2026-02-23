"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Mail, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Suspense } from "react";

function ObrigadoContratoContent() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
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
            <CardTitle className="text-3xl">Contrato Enviado com Sucesso! 🎉</CardTitle>
            <CardDescription className="text-lg">
              Obrigado por assinar o contrato
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <h3 className="font-semibold text-green-800 mb-2">
                Seu contrato foi recebido!
              </h3>
              <p className="text-green-700">
                Nossa equipe irá revisar o documento assinado e em breve você receberá 
                o link de pagamento da entrada (25%) para iniciar o projeto.
              </p>
            </div>

            <div className="space-y-3">
              <p className="text-center font-medium">Próximos passos:</p>
              <ol className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">1</span>
                  Nossa equipe revisará o contrato assinado
                </li>
                <li className="flex items-center gap-2">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">2</span>
                  Você receberá o link de pagamento da entrada (25%)
                </li>
                <li className="flex items-center gap-2">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">3</span>
                  Confirmado o pagamento, iniciamos o projeto!
                </li>
              </ol>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button variant="outline" className="flex-1" onClick={() => window.open("mailto:contato@softrha.com", "_blank")}>
                <Mail className="h-4 w-4 mr-2" />
                Fale Conosco
              </Button>
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

export default function ContratoObrigadoPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 p-4">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    }>
      <ObrigadoContratoContent />
    </Suspense>
  );
}
