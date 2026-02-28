"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Globe,
  Smartphone,
  Brain,
  ArrowRight,
  ExternalLink,
  Code2,
  Sparkles,
  Zap,
  Layers,
} from "lucide-react";
import { FuturisticBackground } from "@/components/ui/futuristic-background";
import { Footer } from "@/components/layout/footer";

export default function ProjetosPage() {
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

  const projects = [
    {
      title: "E-commerce Platform",
      client: "TechStore",
      description: "Plataforma completa de e-commerce com painel administrativo e integração de pagamentos.",
      technologies: ["Next.js 14", "TypeScript", "Stripe", "Prisma"],
      gradient: "from-blue-500 to-cyan-500",
      image: "🛒",
      link: "#",
    },
    {
      title: "App Delivery",
      client: "FoodFast",
      description: "Aplicativo mobile para delivery de alimentos com rastreamento em tempo real.",
      technologies: ["React Native", "Node.js", "Socket.io", "MongoDB"],
      gradient: "from-purple-500 to-pink-500",
      image: "🍕",
      link: "#",
    },
    {
      title: "Sistema de Gestão",
      client: "Enterprise Corp",
      description: "Sistema ERP personalizado para gestão empresarial com dashboards e relatórios.",
      technologies: ["Vue.js", "Python", "PostgreSQL", "Docker"],
      gradient: "from-orange-500 to-red-500",
      image: "📊",
      link: "#",
    },
    {
      title: "Portal Educacional",
      client: "EduTech",
      description: "Plataforma de ensino online com videoaulas, exercícios e acompanhamento de progresso.",
      technologies: ["Next.js", "TypeScript", "AWS", "MySQL"],
      gradient: "from-green-500 to-emerald-500",
      image: "📚",
      link: "#",
    },
    {
      title: "App Financeiro",
      client: "FinTech Solutions",
      description: "Aplicativo de gestão financeira pessoal com IA para análise de gastos.",
      technologies: ["Flutter", "Firebase", "Python", "TensorFlow"],
      gradient: "from-indigo-500 to-purple-500",
      image: "💰",
      link: "#",
    },
    {
      title: "Dashboard Analytics",
      client: "DataCorp",
      description: "Dashboard de analytics com visualização de dados em tempo real e machine learning.",
      technologies: ["React", "D3.js", "Node.js", "Elasticsearch"],
      gradient: "from-cyan-500 to-blue-500",
      image: "📈",
      link: "#",
    },
  ];

  const stats = [
    { value: "50+", label: "Projetos Entregues" },
    { value: "98%", label: "Clientes Satisfeitos" },
    { value: "15+", label: "Tecnologias" },
    { value: "24/7", label: "Suporte" },
  ];

  return (
    <div className="flex flex-col min-h-screen relative">
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
                Nosso Portfólio
              </Badge>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight max-w-5xl"
            >
              <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-300 bg-clip-text text-transparent drop-shadow-lg">
                Projetos que Transformam
              </span>
              <br />
              <span className="text-white drop-shadow-lg">Negócios Digitais</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-xl md:text-2xl text-cyan-100/90 max-w-3xl drop-shadow-md"
            >
              Conheça alguns dos projetos que desenvolvemos com{" "}
              <span className="text-cyan-300 font-semibold">tecnologia de ponta</span> e{" "}
              <span className="text-blue-300 font-semibold">inovação constante</span>.
            </motion.p>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-8"
            >
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
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

      {/* Projects Grid */}
      <section className="py-20 md:py-32 relative">
        <div className="container mx-auto px-4 md:px-6">
          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {projects.map((project, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                whileHover={{ y: -5 }}
                transition={{ duration: 0.2 }}
              >
                <Card className="relative overflow-hidden border-cyan-400/20 hover:border-cyan-400/40 transition-all duration-300 h-full group bg-slate-900/50 backdrop-blur-sm">
                  <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${project.gradient}`} />

                  {/* Project Image Placeholder */}
                  <div className={`h-48 bg-gradient-to-br ${project.gradient} flex items-center justify-center`}>
                    <span className="text-7xl">{project.image}</span>
                  </div>

                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-xl text-white">{project.title}</CardTitle>
                        <CardDescription className="flex items-center gap-2 mt-1 text-cyan-100/70">
                          <Globe className="h-3 w-3" />
                          {project.client}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <p className="text-sm text-cyan-100/80">
                      {project.description}
                    </p>

                    <div className="flex flex-wrap gap-2">
                      {project.technologies.map((tech, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs bg-cyan-500/20 text-cyan-100 border-cyan-400/30">
                          {tech}
                        </Badge>
                      ))}
                    </div>

                    <div className="pt-4 border-t border-cyan-400/20">
                      <Link href={project.link}>
                        <Button variant="outline" size="sm" className="w-full gap-2 group-hover:bg-cyan-500 group-hover:text-white transition-colors border-cyan-400/50 text-cyan-100 hover:text-white">
                          <ExternalLink className="h-4 w-4" />
                          Ver Projeto
                        </Button>
                      </Link>
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
              <Layers className="h-3 w-3 mr-2 text-cyan-300" />
              Tech Stack
            </Badge>
            <h2 className="text-3xl md:text-5xl font-bold mb-4 text-white">
              Tecnologias que{" "}
              <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                Utilizamos
              </span>
            </h2>
            <p className="text-lg text-cyan-100/80 max-w-2xl mx-auto">
              Trabalhamos com as ferramentas mais modernas do mercado.
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6"
          >
            {[
              { name: "Next.js", icon: Code2, color: "text-white" },
              { name: "TypeScript", icon: Code2, color: "text-blue-400" },
              { name: "React", icon: Code2, color: "text-cyan-400" },
              { name: "Node.js", icon: Code2, color: "text-green-400" },
              { name: "Python", icon: Code2, color: "text-yellow-400" },
              { name: "PostgreSQL", icon: Code2, color: "text-blue-600" },
              { name: "AWS", icon: Code2, color: "text-orange-400" },
              { name: "Docker", icon: Code2, color: "text-blue-500" },
            ].map((tech, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                <Card className="border-cyan-400/20 hover:border-cyan-400/40 transition-all duration-300 h-full backdrop-blur-sm bg-slate-900/50">
                  <CardContent className="pt-6 text-center">
                    <tech.icon className={`h-10 w-10 mx-auto mb-3 ${tech.color}`} />
                    <h3 className="font-semibold text-white">{tech.name}</h3>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
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
              Tem um Projeto em{" "}
              <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-300 bg-clip-text text-transparent">
                Mente?
              </span>
            </h2>
            <p className="text-xl text-cyan-100/80 mb-8">
              Vamos transformar sua ideia em realidade digital.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/orcamento">
                <Button size="lg" className="gap-2 h-14 px-8 text-lg bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white shadow-lg shadow-cyan-500/30">
                  <Zap className="h-6 w-6" />
                  Solicitar Orçamento
                </Button>
              </Link>
              <Link href="/contato">
                <Button variant="outline" size="lg" className="gap-2 h-14 px-8 text-lg border-cyan-400/50 hover:bg-cyan-500/20 text-cyan-100 hover:text-white backdrop-blur-sm">
                  <ArrowRight className="h-6 w-6" />
                  Fale Conosco
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
