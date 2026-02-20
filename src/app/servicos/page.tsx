"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Code2,
  Smartphone,
  Brain,
  Palette,
  Cloud,
  Search,
  CheckCircle2,
  ArrowRight,
  Zap,
  Shield,
  Layers,
} from "lucide-react";
import Link from "next/link";

export default function Servicos() {
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
    },
    {
      icon: Brain,
      title: "Software Sob Medida",
      description: "Sistemas personalizados para automatizar processos e otimizar operações do seu negócio.",
      features: [
        "Arquitetura Escalável",
        "APIs REST & GraphQL",
        "Integrações",
        "Dashboard Analytics",
        "Automação",
        "Relatórios",
      ],
      popular: false,
    },
    {
      icon: Palette,
      title: "UI/UX Design",
      description: "Interfaces modernas e intuitivas que encantam usuários e convertem visitantes em clientes.",
      features: [
        "Design System",
        "Prototipagem",
        "User Research",
        "Wireframes",
        "Testes de Usabilidade",
        "shadcn/ui",
      ],
      popular: false,
    },
    {
      icon: Cloud,
      title: "Cloud & DevOps",
      description: "Infraestrutura escalável e segura com deploy automatizado e monitoramento contínuo.",
      features: [
        "AWS / GCP / Azure",
        "Vercel",
        "CI/CD",
        "Docker",
        "Monitoramento",
        "Backup Automático",
      ],
      popular: false,
    },
    {
      icon: Search,
      title: "Consultoria Técnica",
      description: "Orientação especializada para escolher as melhores tecnologias e arquiteturas para seu projeto.",
      features: [
        "Code Review",
        "Arquitetura de Software",
        "Migração de Legacy",
        "Treinamento de Equipes",
        "Best Practices",
        "Tech Stack Assessment",
      ],
      popular: false,
    },
  ];

  const process = [
    {
      step: "01",
      title: "Briefing & Descoberta",
      description: "Entendemos suas necessidades, objetivos de negócio e requisitos técnicos.",
    },
    {
      step: "02",
      title: "Proposta & Planejamento",
      description: "Apresentamos escopo, cronograma, investimento e stack tecnológica recomendada.",
    },
    {
      step: "03",
      title: "Design & Prototipagem",
      description: "Criamos wireframes e protótipos para validação da experiência do usuário.",
    },
    {
      step: "04",
      title: "Desenvolvimento Ágil",
      description: "Construímos em sprints com entregas incrementais e feedback constante.",
    },
    {
      step: "05",
      title: "Testes & Qualidade",
      description: "Testes automatizados e manuais para garantir estabilidade e performance.",
    },
    {
      step: "06",
      title: "Deploy & Suporte",
      description: "Lançamento monitorado e suporte contínuo para evolução do produto.",
    },
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
            className="max-w-3xl"
          >
            <Badge variant="secondary" className="mb-4 px-4 py-2">
              Nossos Serviços
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
              Soluções Completas em{" "}
              <span className="text-primary">Desenvolvimento</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-2xl">
              Do conceito ao deploy, oferecemos expertise técnica completa com
              Next.js 14, TypeScript, Tailwind CSS e as melhores práticas do mercado.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {services.map((service, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card className={`h-full relative ${service.popular ? 'border-primary shadow-lg' : ''}`}>
                  {service.popular && (
                    <div className="absolute -top-3 right-4">
                      <Badge className="bg-primary">Mais Popular</Badge>
                    </div>
                  )}
                  <CardHeader>
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                      <service.icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-xl">{service.title}</CardTitle>
                    <CardDescription>{service.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {service.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-sm">
                          <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                          <span className="text-muted-foreground">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Tech Stack Highlight */}
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
              Tecnologias que Dominamos
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Trabalhamos apenas com tecnologias modernas, testadas e aprovadas
              pelo mercado para garantir performance e escalabilidade.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6"
          >
            {[
              { name: "Next.js 14+", icon: Layers },
              { name: "TypeScript", icon: Code2 },
              { name: "Tailwind CSS", icon: Zap },
              { name: "Prisma", icon: Layers },
              { name: "MySQL", icon: Cloud },
              { name: "Better Auth", icon: Shield },
            ].map((tech, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="flex flex-col items-center gap-3 p-6 rounded-lg bg-card hover:shadow-md transition-shadow"
              >
                <tech.icon className="h-8 w-8 text-primary" />
                <span className="text-sm font-medium text-center">{tech.name}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Process */}
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
              Processo
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold">
              Como Funciona
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Um processo estruturado e transparente para garantir entrega
              dentro do prazo, orçamento e com a qualidade esperada.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {process.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="relative group"
              >
                <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-primary/50 rounded-lg blur opacity-0 group-hover:opacity-25 transition duration-300" />
                <div className="relative bg-card rounded-lg p-6 space-y-3">
                  <div className="text-sm font-bold text-primary">{item.step}</div>
                  <h3 className="font-semibold text-lg">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-32 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center space-y-6 max-w-3xl mx-auto"
          >
            <h2 className="text-3xl md:text-4xl font-bold">
              Pronto para Iniciar seu Projeto?
            </h2>
            <p className="text-lg opacity-90">
              Solicite um orçamento gratuito e descubra como podemos ajudar
              a transformar sua ideia em realidade.
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
                  Conhecer a SoftRha
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
