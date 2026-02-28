"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Mail, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Suspense } from "react";
import { FuturisticBackground } from "@/components/ui/futuristic-background";

function ObrigadoContratoContent() {
  return (
    <div className="min-h-screen flex items-center justify-center relative">
      <FuturisticBackground />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl relative z-10"
      >
        <Card className="border-cyan-400/20 bg-slate-900/50 backdrop-blur-sm shadow-xl">
          <CardHeader className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="mx-auto mb-4"
            >
              <CheckCircle2 className="h-20 w-20 text-cyan-400" />
            </motion.div>
            <CardTitle className="text-3xl text-white drop-shadow-lg">Contrato Enviado com Sucesso! 🎉</CardTitle>
            <CardDescription className="text-lg text-cyan-100/80">
              Obrigado por assinar o contrato
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-cyan-500/10 border border-cyan-400/30 rounded-lg p-6 backdrop-blur-sm">
              <h3 className="font-semibold text-cyan-300 mb-2">
                Seu contrato foi recebido!
              </h3>
              <p className="text-cyan-100/80">
                Nossa equipe irá revisar o documento assinado e em breve você receberá
                o link de pagamento da entrada (25%) para iniciar o projeto.
              </p>
            </div>

            <div className="space-y-3">
              <p className="text-center font-medium text-white">Próximos passos:</p>
              <ol className="space-y-2 text-sm text-cyan-100/70">
                <li className="flex items-center gap-2">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-cyan-500/20 border border-cyan-400/30 text-cyan-300 text-xs font-bold">1</span>
                  Nossa equipe revisará o contrato assinado
                </li>
                <li className="flex items-center gap-2">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-cyan-500/20 border border-cyan-400/30 text-cyan-300 text-xs font-bold">2</span>
                  Você receberá o link de pagamento da entrada (25%)
                </li>
                <li className="flex items-center gap-2">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-cyan-500/20 border border-cyan-400/30 text-cyan-300 text-xs font-bold">3</span>
                  Confirmado o pagamento, iniciamos o projeto!
                </li>
              </ol>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button variant="outline" className="flex-1 border-cyan-400/50 hover:bg-cyan-500/20 text-cyan-100 hover:text-white backdrop-blur-sm" onClick={() => window.open("mailto:contato@softrha.com", "_blank")}>
                <Mail className="h-4 w-4 mr-2" />
                Fale Conosco
              </Button>
            </div>

            <div className="text-center pt-4">
              <Button variant="ghost" onClick={() => window.location.href = "/"} className="text-cyan-100 hover:text-cyan-300">
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
      <div className="min-h-screen flex items-center justify-center relative">
        <FuturisticBackground />
        <div className="animate-spin h-8 w-8 border-4 border-cyan-400 border-t-transparent rounded-full relative z-10" />
      </div>
    }>
      <ObrigadoContratoContent />
    </Suspense>
  );
}
