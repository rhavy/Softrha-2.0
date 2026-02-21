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
} from "lucide-react";

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
    },
    {
      icon: Smartphone,
      title: "Aplicativos Mobile",
      description: "Apps nativos e híbridos para iOS e Android com as melhores práticas do mercado.",
      features: ["React Native", "Flutter", "iOS & Android"],
    },
    {
      icon: Brain,
      title: "Software Sob Medida",
      description: "Soluções personalizadas para automatizar e otimizar seus processos de negócio.",
      features: ["Arquitetura Escalável", "APIs REST/GraphQL", "Integrações"],
    },
  ];

  const technologies = [
    { name: "Next.js 14+", icon: Layers, description: "App Router e Server Components" },
    { name: "TypeScript", icon: Code2, description: "Tipagem estática segura" },
    { name: "Tailwind CSS", icon: Zap, description: "Estilização moderna e eficiente" },
    { name: "Prisma + MySQL", icon: Database, description: "Banco de dados robusto" },
    { name: "Better Auth", icon: Lock, description: "Autenticação segura" },
    { name: "Framer Motion", icon: Rocket, description: "Animações fluidas" },
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
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 to-background py-20 md:py-32">
        <div className="container mx-auto px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col items-center text-center space-y-8"
          >
            <Badge variant="secondary" className="px-4 py-2 text-sm">
              🚀 Transforme sua ideia em realidade digital
            </Badge>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight max-w-4xl">
              Desenvolvimento de Software de{" "}
              <span className="text-primary">Alta Performance</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl">
              Especialistas em Next.js 14, TypeScript e Tailwind CSS.
              Criamos soluções digitais que impulsionam seu negócio para o próximo nível.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/orcamento">
                <Button size="lg" className="gap-2">
                  Solicitar Orçamento
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/servicos">
                <Button variant="outline" size="lg">
                  Conhecer Serviços
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Background decoration */}
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#00000008_1px,transparent_1px),linear-gradient(to_bottom,#00000008_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      </section>

      {/* Services Section */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center space-y-4 mb-16"
          >
            <Badge variant="outline" className="px-4 py-2">
              Nossos Serviços
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold">
              Soluções Completas para seu Negócio
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Do conceito à implementação, oferecemos expertise técnica completa
              para transformar sua visão em produto digital.
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
              <motion.div key={index} variants={fadeInUp}>
                <Card className="h-full hover:shadow-lg transition-shadow duration-300">
                  <CardHeader>
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                      <service.icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-xl">{service.title}</CardTitle>
                    <CardDescription>{service.description}</CardDescription>
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
      <section className="py-20 md:py-32 bg-secondary/50">
        <div className="container mx-auto px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center space-y-4 mb-16"
          >
            <Badge variant="outline" className="px-4 py-2">
              Stack Tecnológica
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold">
              Tecnologias de Ponta
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Utilizamos as ferramentas mais modernas e robustas do mercado
              para garantir performance, segurança e escalabilidade.
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
                className="flex items-start gap-4 p-4 rounded-lg bg-card hover:shadow-md transition-shadow"
              >
                <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                  <tech.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">{tech.name}</h3>
                  <p className="text-sm text-muted-foreground">{tech.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              <Badge variant="outline" className="px-4 py-2">
                Por que escolher a SoftRha?
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold">
                Excelência Técnica e Visão de Negócio
              </h2>
              <p className="text-muted-foreground">
                Combinamos expertise técnica profunda com entendimento estratégico
                para entregar soluções que realmente fazem a diferença no seu negócio.
              </p>
              <ul className="space-y-3">
                {benefits.map((benefit, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="flex items-center gap-3"
                  >
                    <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                    <span className="text-foreground">{benefit}</span>
                  </motion.li>
                ))}
              </ul>
              <Link href="/contato">
                <Button className="mt-4 gap-2">
                  Fale com um Especialista
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="relative"
            >
              <div className="relative rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 p-8 lg:p-12">
                <div className="grid grid-cols-2 gap-6">
                  {[
                    { value: "98%", label: "Satisfação" },
                    { value: "50+", label: "Projetos" },
                    { value: "24/7", label: "Suporte" },
                    { value: "100%", label: "Entrega" },
                  ].map((stat, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="text-center p-4 rounded-lg bg-card"
                    >
                      <div className="text-3xl font-bold text-primary">{stat.value}</div>
                      <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-32 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center space-y-6 max-w-3xl mx-auto"
          >
            <Shield className="h-16 w-16 mx-auto opacity-90" />
            <h2 className="text-3xl md:text-4xl font-bold">
              Pronto para Transformar sua Ideia em Realidade?
            </h2>
            <p className="text-lg opacity-90">
              Agende uma consultoria gratuita e descubra como podemos ajudar
              a construir o software dos seus sonhos com tecnologia de ponta.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link href="/contato">
                <Button size="lg" variant="secondary" className="gap-2">
                  Solicitar Orçamento Gratuito
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/sobre">
                <Button size="lg" variant="outline" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
                  Saiba Mais
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
