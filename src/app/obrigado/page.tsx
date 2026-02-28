"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Rocket, Zap, Shield, ArrowRight, Sparkles } from "lucide-react";
import { FuturisticBackground } from "@/components/ui/futuristic-background";

export default function ObrigadoPage() {
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
              Obrigado!
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
                Sucesso!
              </span>
            </h1>

            <p className="text-xl text-cyan-100/80 mb-8 drop-shadow-md">
              Sua solicitação foi enviada com sucesso. Em breve entraremos em contato.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="grid sm:grid-cols-3 gap-4 pt-8"
          >
            {[
              { icon: Rocket, title: "Análise", desc: "Vamos analisar sua solicitação" },
              { icon: Zap, title: "Rapidez", desc: "Retorno em até 24h úteis" },
              { icon: Shield, title: "Segurança", desc: "Seus dados estão protegidos" },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="p-4 rounded-xl bg-slate-900/50 backdrop-blur-sm border border-cyan-400/20"
              >
                <item.icon className="h-8 w-8 text-cyan-300 mx-auto mb-2" />
                <h3 className="font-semibold text-white mb-1">{item.title}</h3>
                <p className="text-sm text-cyan-100/70">{item.desc}</p>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center pt-8"
          >
            <Link href="/">
              <Button size="lg" className="gap-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white shadow-lg shadow-cyan-500/30">
                <Rocket className="h-5 w-5" />
                Página Inicial
              </Button>
            </Link>
            <Link href="/projetos">
              <Button variant="outline" size="lg" className="gap-2 border-cyan-400/50 hover:bg-cyan-500/20 text-cyan-100 hover:text-white backdrop-blur-sm">
                <ArrowRight className="h-5 w-5" />
                Ver Projetos
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
