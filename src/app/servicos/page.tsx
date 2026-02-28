"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FuturisticBackground } from "@/components/ui/futuristic-background";
import {
  Code2,
  Smartphone,
  Brain,
  Palette,
  Cloud,
  CheckCircle2,
  ArrowRight,
  Zap,
  Shield,
  Layers,
  Sparkles,
  Rocket,
  Cpu,
  Globe,
} from "lucide-react";
import Link from "next/link";
import { Footer } from "@/components/layout/footer";

export default function Servicos() {
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
      description: "Sites e aplicações web progressivas (PWA) com performance excepcional e SEO otimizado.",
      features: [
        "Next.js 14+ App Router",
        "React Server Components",
        "TypeScript",
        "Tailwind CSS",
        "SEO Técnico",
        "Performance Core Web Vitals",
      ],
      popular: true,
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      icon: Smartphone,
      title: "Aplicativos Mobile",
      description: "Apps nativos e híbridos para iOS e Android com experiência de usuário impecável.",
      features: [
        "React Native",
        "Flutter",
        "iOS & Android",
        "Publicação nas Stores",
        "Push Notifications",
        "Offline-first",
      ],
      popular: false,
      gradient: "from-purple-500 to-pink-500",
    },
    {
      icon: Brain,
      title: "Software Sob Medida",
      description: "Soluções personalizadas para automatizar e otimizar seus processos de negócio.",
      features: [
        "Arquitetura Escalável",
        "APIs REST/GraphQL",
        "Integrações",
        "Cloud Computing",
        "DevOps",
        "Segurança",
      ],
      popular: false,
      gradient: "from-orange-500 to-red-500",
    },
    {
      icon: Palette,
      title: "UI/UX Design",
      description: "Design de interfaces modernas e intuitivas focadas na experiência do usuário.",
      features: [
        "Wireframes",
        "Prototipagem",
        "Design System",
        "Testes de Usabilidade",
        "Acessibilidade",
        "Responsive Design",
      ],
      popular: false,
      gradient: "from-green-500 to-emerald-500",
    },
    {
      icon: Cloud,
      title: "Cloud & DevOps",
      description: "Infraestrutura escalável e automatizada para seu negócio na nuvem.",
      features: [
        "AWS/Azure/GCP",
        "Docker/Kubernetes",
        "CI/CD",
        "Monitoramento",
        "Auto-scaling",
        "Backup & Recovery",
      ],
      popular: false,
      gradient: "from-indigo-500 to-purple-500",
    },
    {
      icon: Layers,
      title: "Consultoria Técnica",
      description: "Orientação especializada para decisões tecnológicas estratégicas.",
      features: [
        "Arquitetura de Software",
        "Code Review",
        "Mentoria",
        "Tech Stack",
        "Performance",
        "Segurança",
      ],
      popular: false,
      gradient: "from-cyan-500 to-blue-500",
    },
  ];

  const benefits = [
    { icon: Zap, title: "Performance", description: "Otimização máxima" },
    { icon: Shield, title: "Segurança", description: "Dados protegidos" },
    { icon: Cpu, title: "Tecnologia", description: "Stack moderno" },
    { icon: Globe, title: "Escalabilidade", description: "Crescimento garantido" },
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
              <Badge variant="secondary" className="px-4 py-2 text-sm border-cyan-400/30 bg-cyan-500/20 text-cyan-100 backdrop-blur-sm">
                <Sparkles className="h-3 w-3 mr-2" />
                Nossos Serviços
              </Badge>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight max-w-5xl drop-shadow-lg"
            >
              <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
                Soluções Completas
              </span>
              <br />
              <span className="text-white">para seu Negócio Digital</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-xl md:text-2xl text-cyan-100/80 max-w-3xl"
            >
              Transformamos ideias em produtos digitais de{" "}
              <span className="text-cyan-300 font-semibold">alta performance</span> com
              <span className="text-purple-400 font-semibold"> tecnologia de ponta</span>.
            </motion.p>

            {/* Benefits Grid */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-8"
            >
              {benefits.map((benefit, index) => (
                <motion.div
                  key={index}
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  className="text-center p-4 rounded-xl bg-slate-900/50 backdrop-blur-sm border-cyan-400/20"
                >
                  <benefit.icon className="h-8 w-8 text-cyan-300 mx-auto mb-2" />
                  <div className="font-semibold text-white mb-1">{benefit.title}</div>
                  <div className="text-xs text-cyan-100/70">{benefit.description}</div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20 md:py-32 relative">
        <div className="container mx-auto px-4 md:px-6">
          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {services.map((service, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                whileHover={{ y: -5 }}
                transition={{ duration: 0.2 }}
              >
                <Card className={`relative overflow-hidden bg-slate-900/50 backdrop-blur-sm border-cyan-400/20 hover:border-cyan-400/40 transition-all duration-300 h-full group ${service.popular ? 'ring-2 ring-cyan-400/50' : ''}`}>
                  <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${service.gradient}`} />
                  {service.popular && (
                    <Badge className="absolute top-4 right-4 bg-cyan-500 text-white border-cyan-400/30">
                      Mais Popular
                    </Badge>
                  )}
                  <CardHeader>
                    <div className={`inline-flex h-14 w-14 rounded-xl bg-gradient-to-br ${service.gradient} items-center justify-center mb-4 shadow-lg`}>
                      <service.icon className="h-7 w-7 text-white" />
                    </div>
                    <CardTitle className="text-xl text-white">{service.title}</CardTitle>
                    <CardDescription className="text-base text-cyan-100/70">{service.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {service.features.map((feature, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm">
                          <CheckCircle2 className="h-4 w-4 text-cyan-400 flex-shrink-0" />
                          <span className="text-cyan-100/70">{feature}</span>
                        </div>
                      ))}
                    </div>
                    <Link href="/orcamento" className="block mt-6">
                      <Button variant="outline" className="w-full gap-2 group-hover:bg-gradient-to-r group-hover:from-cyan-500 group-hover:to-blue-500 group-hover:text-white border-cyan-400/50 hover:bg-cyan-500/20 text-cyan-400 hover:text-white backdrop-blur-sm transition-colors">
                        <Rocket className="h-4 w-4" />
                        Solicitar Orçamento
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-32 bg-gradient-to-r from-slate-900/50 via-cyan-900/30 to-blue-900/30 relative overflow-hidden backdrop-blur-sm">
        <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,transparent,black)] pointer-events-none" />
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h2 className="text-4xl md:text-6xl text-cyan-100 font-bold mb-6 drop-shadow-lg">
              Pronto para{" "}
              <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
                Começar?
              </span>
            </h2>
            <p className="text-xl text-cyan-100/80 mb-8">
              Vamos transformar sua visão em realidade digital.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/orcamento">
                <Button size="lg" className="gap-2 h-14 px-8 text-lg bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white shadow-lg shadow-cyan-500/30">
                  <Zap className="h-6 w-6" />
                  Solicitar Orçamento
                </Button>
              </Link>
              <Link href="/contato">
                <Button variant="outline" size="lg" className="gap-2 h-14 px-8 text-lg border-cyan-400/50 hover:bg-cyan-500/20 text-clip-400 hover:text-white backdrop-blur-sm">
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
