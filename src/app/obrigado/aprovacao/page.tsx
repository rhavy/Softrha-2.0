"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, FileText, ArrowRight, Sparkles } from "lucide-react";
import { FuturisticBackground } from "@/components/ui/futuristic-background";

export default function ObrigadoAprovacaoPage() {
  return (
    <div className="flex min-h-screen relative">
      <FuturisticBackground />

      {/* Content */}
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
              Aprovação Confirmada
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
                Aprovado!
              </span>
            </h1>

            <p className="text-xl text-cyan-100/80 mb-8 drop-shadow-md">
              Seu orçamento foi aprovado com sucesso. Vamos iniciar o projeto em breve!
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex items-center justify-center gap-4 p-6 rounded-xl bg-slate-900/50 backdrop-blur-sm border border-cyan-400/20"
          >
            <FileText className="h-12 w-12 text-cyan-300" />
            <div className="text-left">
              <p className="font-semibold text-white">Próximo Passo</p>
              <p className="text-sm text-cyan-100/70">
                Enviaremos o contrato para assinatura em breve.
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
            <Link href="/dashboard">
              <Button variant="outline" size="lg" className="gap-2 border-cyan-400/50 hover:bg-cyan-500/20 text-cyan-100 hover:text-white backdrop-blur-sm">
                <FileText className="h-5 w-5" />
                Ver Contrato
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
