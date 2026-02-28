"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FuturisticBackground } from "@/components/ui/futuristic-background";
import {
  Target,
  Eye,
  Award,
  Users,
  Lightbulb,
  CheckCircle,
  ArrowRight,
  Sparkles,
  Zap,
  Shield,
  Cpu,
  Globe,
} from "lucide-react";
import Link from "next/link";

export default function Sobre() {
  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.5 },
  };

  const staggerContainer = {
    initial: { opacity: 0 },
    whileInView: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
    viewport: { once: true },
  };

  const values = [
    { icon: Target, title: "Foco em Resultados", description: "Cada linha de código é escrita pensando no impacto real para o seu negócio." },
    { icon: Lightbulb, title: "Inovação Constante", description: "Mantemos nossa stack sempre atualizada com as melhores tecnologias." },
    { icon: Award, title: "Excelência Técnica", description: "Padrões de qualidade rigorosos em cada entrega de projeto." },
    { icon: Users, title: "Parceria Genuína", description: "Tratamos cada projeto como se fosse nosso próprio negócio." },
  ];

  const stats = [
    { value: "5+", label: "Anos de Experiência" },
    { value: "50+", label: "Projetos Entregues" },
    { value: "30+", label: "Clientes Satisfeitos" },
    { value: "98%", label: "Taxa de Satisfação" },
  ];

  const features = [
    { icon: Zap, title: "Agilidade", desc: "Entregas rápidas e iterativas" },
    { icon: Shield, title: "Segurança", desc: "Proteção de dados e conformidade" },
    { icon: Cpu, title: "Tecnologia", desc: "Stack moderno e escalável" },
    { icon: Globe, title: "Escalabilidade", desc: "Pronto para o crescimento" },
  ];

  return (
    <div className="flex flex-col min-h-screen relative bg-slate-950">
      <FuturisticBackground />

      <main className="relative z-10">
        {/* Hero Section */}
        <section className="py-20 md:py-32">
          <div className="container mx-auto px-4">
            <motion.div {...fadeInUp} className="max-w-3xl">
              <Badge className="mb-4 bg-cyan-500/20 text-cyan-100 border-cyan-400/30 backdrop-blur-md">
                <Sparkles className="h-3 w-3 mr-2" /> Sobre a SoftRha
              </Badge>
              <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight">
                Transformamos Ideias em <span className="text-cyan-400">Soluções Digitais</span>
              </h1>
              <p className="mt-6 text-lg text-cyan-100/70">
                Especialistas em desenvolvimento de software de alta performance para resultados excepcionais.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-12 border-y border-white/5 bg-slate-900/20 backdrop-blur-sm">
          <div className="container mx-auto px-4">
            <motion.div
              variants={staggerContainer}
              initial="initial"
              whileInView="whileInView"
              className="grid grid-cols-2 md:grid-cols-4 gap-8"
            >
              {stats.map((stat, i) => (
                <motion.div key={i} variants={fadeInUp} className="text-center">
                  <div className="text-3xl md:text-5xl font-bold text-cyan-400">{stat.value}</div>
                  <div className="text-sm text-cyan-100/50 mt-2">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-24">
          <div className="container mx-auto px-4 text-center mb-16">
            <h2 className="text-3xl font-bold text-white">Nossos Valores</h2>
          </div>
          <div className="container mx-auto px-4 grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v, i) => (
              <motion.div key={i} {...fadeInUp} transition={{ delay: i * 0.1 }}>
                <Card className="bg-slate-900/40 border-cyan-400/20 hover:border-cyan-400/50 transition-colors h-full">
                  <CardContent className="p-6">
                    <v.icon className="h-10 w-10 text-cyan-400 mb-4" />
                    <h3 className="text-white font-bold mb-2">{v.title}</h3>
                    <p className="text-cyan-100/60 text-sm">{v.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Diferenciais Section - Agora aparecendo corretamente */}
        <section className="py-24 bg-cyan-950/20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-white">Por Que Nos Escolher?</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {features.map((f, i) => (
                <motion.div key={i} {...fadeInUp} className="text-center p-6 rounded-2xl bg-slate-900/50 border border-white/5">
                  <f.icon className="h-12 w-12 text-cyan-400 mx-auto mb-4" />
                  <h3 className="text-white font-semibold">{f.title}</h3>
                  <p className="text-cyan-100/50 text-xs mt-2">{f.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-32">
          <div className="container mx-auto px-4">
            <div className="bg-gradient-to-r from-cyan-600 to-blue-700 rounded-3xl p-12 text-center relative overflow-hidden">
              <div className="relative z-10 max-w-2xl mx-auto">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Pronto para o próximo nível?</h2>
                <div className="flex flex-wrap justify-center gap-4">
                  <Button asChild size="lg" className="bg-white text-cyan-600 hover:bg-white/90">
                    <Link href="/contato">Fale Conosco <ArrowRight className="ml-2 h-4 w-4" /></Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}