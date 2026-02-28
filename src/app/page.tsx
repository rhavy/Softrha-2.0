"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Code2,
  Smartphone,
  Brain,
  Rocket,
  Shield,
  Zap,
  ArrowRight,
  CheckCircle2,
  Layers,
  Database,
  Lock,
  Cpu,
  Globe,
  Sparkles,
  Terminal,
  Binary,
  Network,
} from "lucide-react";
import { Footer } from "@/components/layout/footer";
import { FuturisticBackground } from "@/components/ui/futuristic-background";

export default function Home() {
  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 },
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const services = [
    {
      icon: Code2,
      title: "Desenvolvimento Web",
      description: "Sites e aplicações web de alta performance com Next.js 14, React e TypeScript.",
      features: ["Next.js 14 App Router", "TypeScript", "Tailwind CSS"],
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      icon: Smartphone,
      title: "Aplicativos Mobile",
      description: "Apps nativos e híbridos para iOS e Android com as melhores práticas do mercado.",
      features: ["React Native", "Flutter", "iOS & Android"],
      gradient: "from-purple-500 to-pink-500",
    },
    {
      icon: Brain,
      title: "Software Sob Medida",
      description: "Soluções personalizadas para automatizar e otimizar seus processos de negócio.",
      features: ["Arquitetura Escalável", "APIs REST/GraphQL", "Integrações"],
      gradient: "from-orange-500 to-red-500",
    },
  ];

  const technologies = [
    { name: "Next.js 14+", icon: Layers, description: "App Router e Server Components", color: "text-white" },
    { name: "TypeScript", icon: Binary, description: "Tipagem estática segura", color: "text-blue-400" },
    { name: "Tailwind CSS", icon: Zap, description: "Estilização moderna e eficiente", color: "text-cyan-400" },
    { name: "Prisma + MySQL", icon: Database, description: "Banco de dados robusto", color: "text-green-400" },
    { name: "Better Auth", icon: Lock, description: "Autenticação segura", color: "text-purple-400" },
    { name: "Framer Motion", icon: Sparkles, description: "Animações fluidas", color: "text-pink-400" },
  ];

  const benefits = [
    "Performance excepcional com renderização otimizada",
    "Código manutenível e escalável",
    "Segurança de dados em primeiro lugar",
    "UX moderna e intuitiva",
    "SEO otimizado para melhor visibilidade",
    "Suporte contínuo e evolução constante",
  ];

  return (
    <div className="flex flex-col min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950">
      {/* Modern Digital Background - Matches Logo */}
      <FuturisticBackground />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden">
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col items-center text-center space-y-8"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Badge variant="secondary" className="px-4 py-2 text-sm border border-cyan-400/30 bg-cyan-500/20 backdrop-blur-sm text-cyan-100">
                <Sparkles className="h-3 w-3 mr-2 text-cyan-300" />
                Transforme sua ideia em realidade digital
              </Badge>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight max-w-5xl"
            >
              <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-300 bg-clip-text text-transparent drop-shadow-lg">
                Desenvolvimento de Software
              </span>
              <br />
              <span className="text-white drop-shadow-lg">de Alta Performance</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-xl md:text-2xl text-cyan-100/90 max-w-3xl drop-shadow-md">
              Especialistas em{" "}
              <span className="text-cyan-300 font-semibold">Next.js 14</span>,{" "}
              <span className="text-blue-300 font-semibold">TypeScript</span> e{" "}
              <span className="text-cyan-200 font-semibold">Tailwind CSS</span>.
              Criamos soluções digitais que impulsionam seu negócio.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Link href="/orcamento">
                <Button size="lg" className="gap-2 h-12 px-8 text-base bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white shadow-lg shadow-cyan-500/30 border-0">
                  <Rocket className="h-5 w-5" />
                  Começar Agora
                </Button>
              </Link>
              <Link href="/projetos">
                <Button variant="outline" size="lg" className="gap-2 h-12 px-8 text-base border-cyan-400/50 hover:bg-cyan-500/20 text-cyan-100 hover:text-white backdrop-blur-sm">
                  <Globe className="h-5 w-5" />
                  Ver Projetos
                </Button>
              </Link>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-8"
            >
              {[
                { value: "50+", label: "Projetos Entregues" },
                { value: "98%", label: "Clientes Satisfeitos" },
                { value: "5+", label: "Anos de Experiência" },
                { value: "24/7", label: "Suporte Dedicado" },
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                  className="text-center"
                >
                  <div className="text-3xl md:text-4xl font-bold text-cyan-300 mb-1 drop-shadow-lg">{stat.value}</div>
                  <div className="text-sm text-cyan-100/70">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 md:py-32 relative">
        <div className="container mx-auto px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <Badge variant="outline" className="mb-4 border-cyan-400/30 text-cyan-100 bg-cyan-500/10">
              <Cpu className="h-3 w-3 mr-2 text-cyan-300" />
              Nossos Serviços
            </Badge>
            <h2 className="text-3xl md:text-5xl font-bold mb-4 text-white">
              Soluções Completas para seu{" "}
              <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                Negócio Digital
              </span>
            </h2>
            <p className="text-lg text-cyan-100/80 max-w-2xl mx-auto">
              Desenvolvemos produtos digitais de alta qualidade com as tecnologias mais modernas do mercado.
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid md:grid-cols-3 gap-8"
          >
            {services.map((service, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                whileHover={{ y: -5 }}
                transition={{ duration: 0.2 }}
              >
                <Card className="relative overflow-hidden border-primary/10 hover:border-primary/30 transition-all duration-300 h-full group">
                  <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${service.gradient}`} />
                  <CardHeader>
                    <div className={`inline-flex h-14 w-14 rounded-xl bg-gradient-to-br ${service.gradient} items-center justify-center mb-4 shadow-lg`}>
                      <service.icon className="h-7 w-7 text-white" />
                    </div>
                    <CardTitle className="text-xl">{service.title}</CardTitle>
                    <CardDescription className="text-base">{service.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {service.features.map((feature, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Technologies Section */}
      <section className="py-20 md:py-32 relative">
        <div className="container mx-auto px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <Badge variant="outline" className="mb-4 border-cyan-400/30 text-cyan-100 bg-cyan-500/10">
              <Terminal className="h-3 w-3 mr-2 text-cyan-300" />
              Tech Stack
            </Badge>
            <h2 className="text-3xl md:text-5xl font-bold mb-4 text-white">
              Tecnologias de{" "}
              <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                Ponta a Ponta
              </span>
            </h2>
            <p className="text-lg text-cyan-100/80 max-w-2xl mx-auto">
              Utilizamos as ferramentas mais modernas e eficientes do mercado.
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {technologies.map((tech, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <Card className="border-cyan-400/20 hover:border-cyan-400/40 transition-all duration-300 h-full backdrop-blur-sm bg-slate-900/50">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-4">
                      <div className={`h-12 w-12 rounded-lg bg-cyan-500/20 flex items-center justify-center ${tech.color}`}>
                        <tech.icon className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg text-white">{tech.name}</h3>
                        <p className="text-sm text-cyan-100/70">{tech.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 md:py-32 relative">
        <div className="container mx-auto px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="grid lg:grid-cols-2 gap-12 items-center"
          >
            <div className="space-y-8">
              <Badge variant="outline" className="border-cyan-400/30 text-cyan-100 bg-cyan-500/10">
                <Shield className="h-3 w-3 mr-2 text-cyan-300" />
                Por Que Nos Escolher
              </Badge>
              <h2 className="text-3xl md:text-5xl font-bold text-white">
                Excelência em Cada{" "}
                <span className="bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent">
                  Detalhe
                </span>
              </h2>
              <p className="text-lg text-cyan-100/80">
                Combinamos experiência técnica com paixão por inovação para entregar resultados excepcionais.
              </p>

              <motion.div
                variants={staggerContainer}
                initial="initial"
                whileInView="animate"
                viewport={{ once: true }}
                className="space-y-4"
              >
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={index}
                    variants={fadeInUp}
                    className="flex items-center gap-3"
                  >
                    <CheckCircle2 className="h-5 w-5 text-green-400 flex-shrink-0" />
                    <span className="text-cyan-100/80">{benefit}</span>
                  </motion.div>
                ))}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 }}
              >
                <Link href="/contato">
                  <Button size="lg" className="gap-2 mt-8 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white shadow-lg shadow-cyan-500/30">
                    <Network className="h-5 w-5" />
                    Fale Conosco
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-3xl blur-3xl" />
              <Card className="relative border-cyan-400/20 backdrop-blur-sm bg-slate-900/50">
                <CardContent className="p-8">
                  <div className="grid grid-cols-2 gap-6">
                    {[
                      { icon: Code2, label: "Código Limpo", value: "100%" },
                      { icon: Zap, label: "Performance", value: "A+" },
                      { icon: Shield, label: "Segurança", value: "Máxima" },
                      { icon: Rocket, label: "Entregas", value: "Rápidas" },
                    ].map((item, index) => (
                      <motion.div
                        key={index}
                        initial={{ scale: 0.9, opacity: 0 }}
                        whileInView={{ scale: 1, opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.1 }}
                        className="text-center p-4 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 transition-colors"
                      >
                        <item.icon className="h-8 w-8 text-cyan-300 mx-auto mb-2" />
                        <div className="text-2xl font-bold text-cyan-200 mb-1">{item.value}</div>
                        <div className="text-sm text-cyan-100/70">{item.label}</div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-32 bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-cyan-500/10 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,transparent,black)] pointer-events-none" />
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h2 className="text-4xl md:text-6xl font-bold mb-6 text-white">
              Pronto para{" "}
              <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-300 bg-clip-text text-transparent">
                Começar?
              </span>
            </h2>
            <p className="text-xl text-cyan-100/80 mb-8">
              Transforme sua visão em realidade com nossa equipe de especialistas.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/orcamento">
                <Button size="lg" className="gap-2 h-14 px-8 text-lg bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white shadow-lg shadow-cyan-500/30">
                  <Rocket className="h-6 w-6" />
                  Solicitar Orçamento
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button variant="outline" size="lg" className="gap-2 h-14 px-8 text-lg border-cyan-400/50 hover:bg-cyan-500/20 text-cyan-100 hover:text-white backdrop-blur-sm">
                  <Terminal className="h-6 w-6" />
                  Acessar Dashboard
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

    </div>
  );
}
