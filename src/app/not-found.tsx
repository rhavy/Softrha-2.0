"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Rocket,
  Home,
  Search,
  ArrowLeft,
  Sparkles,
  Zap,
  Code2,
  Globe,
} from "lucide-react";

export default function NotFoundPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-background via-background to-primary/5 relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-500" />
      </div>

      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-grid-white/5 [mask-image:linear-gradient(0deg,transparent,black)] pointer-events-none" />

      {/* Content */}
      <div className="flex-1 flex items-center justify-center relative z-10">
        <div className="container mx-auto px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center text-center space-y-8 max-w-3xl mx-auto"
          >
            {/* 404 Number with Gradient */}
            <motion.div
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary via-purple-500 to-cyan-500 blur-3xl opacity-30 animate-pulse" />
              <h1 className="text-[12rem] md:text-[16rem] lg:text-[20rem] font-bold leading-none bg-gradient-to-r from-primary via-purple-500 to-cyan-500 bg-clip-text text-transparent relative z-10">
                404
              </h1>
            </motion.div>

            {/* Badge */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <Badge variant="secondary" className="px-4 py-2 text-sm border border-primary/20 bg-primary/10 backdrop-blur-sm">
                <Sparkles className="h-3 w-3 mr-2" />
                Página Não Encontrada
              </Badge>
            </motion.div>

            {/* Message */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="space-y-4"
            >
              <h2 className="text-3xl md:text-5xl font-bold">
                Oops! Parece que você{" "}
                <span className="bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
                  se perdeu
                </span>
              </h2>
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl">
                A página que você está procurando não existe ou foi movida.
                Que tal explorar nossos{" "}
                <span className="text-primary font-semibold">projetos</span> ou
                voltar para a{" "}
                <span className="text-cyan-400 font-semibold">página inicial</span>?
              </p>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="grid grid-cols-3 gap-8 pt-8"
            >
              {[
                { icon: Rocket, value: "50+", label: "Projetos" },
                { icon: Code2, value: "15+", label: "Tecnologias" },
                { icon: Globe, value: "24/7", label: "Suporte" },
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                  className="text-center"
                >
                  <stat.icon className="h-8 w-8 text-primary mx-auto mb-2" />
                  <div className="text-2xl md:text-3xl font-bold text-primary mb-1">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="flex flex-col sm:flex-row gap-4 pt-8"
            >
              <Link href="/">
                <Button size="lg" className="gap-2 h-12 px-8 text-base">
                  <Home className="h-5 w-5" />
                  Página Inicial
                </Button>
              </Link>
              <Link href="/projetos">
                <Button variant="outline" size="lg" className="gap-2 h-12 px-8 text-base border-primary/20 hover:bg-primary/10">
                  <Search className="h-5 w-5" />
                  Ver Projetos
                </Button>
              </Link>
              <Link href="/contato">
                <Button variant="ghost" size="lg" className="gap-2 h-12 px-8 text-base">
                  <ArrowLeft className="h-5 w-5" />
                  Fale Conosco
                </Button>
              </Link>
            </motion.div>

            {/* Decorative Elements */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 1 }}
              className="pt-12"
            >
              <div className="flex items-center gap-2 text-muted-foreground">
                <Zap className="h-4 w-4 text-yellow-500" />
                <span className="text-sm">
                  Dica: Você pode usar{" "}
                  <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">
                    Ctrl + K
                  </kbd>{" "}
                  para buscar
                </span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-8 border-t border-primary/10 relative z-10">
        <div className="container mx-auto px-4 md:px-6 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} SoftRha. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
